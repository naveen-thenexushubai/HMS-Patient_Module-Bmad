package com.ainexus.hospital.patient.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * JPA AttributeConverter implementing AES-256-GCM encryption for PHI fields.
 * Every PHI field annotated with @Convert(converter = AesEncryptionConverter.class)
 * is transparently encrypted before persistence and decrypted on read.
 */
@Converter
@Component
public class AesEncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final SecretKeySpec secretKey;

    public AesEncryptionConverter(@Value("${app.encryption.key}") String encryptionKey) {
        byte[] keyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // Pad to 32 bytes for AES-256
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        } else if (keyBytes.length > 32) {
            byte[] trimmed = new byte[32];
            System.arraycopy(keyBytes, 0, trimmed, 0, 32);
            keyBytes = trimmed;
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

            // Prepend IV to ciphertext and Base64-encode
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("PHI encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            byte[] combined = Base64.getDecoder().decode(dbData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            byte[] cipherText = new byte[combined.length - iv.length];
            System.arraycopy(combined, iv.length, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("PHI decryption failed", e);
        }
    }
}
