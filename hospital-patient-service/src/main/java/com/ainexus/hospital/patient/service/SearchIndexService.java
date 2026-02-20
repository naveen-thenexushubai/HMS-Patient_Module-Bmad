package com.ainexus.hospital.patient.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * Computes deterministic search index values for patient records.
 *
 * - Name fields: lowercase + trimmed — stored in plaintext search columns
 *   for LIKE-based partial match.
 * - Phone / email: HMAC-SHA256 of normalized value — stored as hex digest
 *   for exact-match lookup without exposing plaintext outside encrypted column.
 *
 * The HMAC key is the AES encryption key, so search hashes are only
 * reproducible with application access (same security boundary as decryption).
 */
@Service
public class SearchIndexService {

    private final byte[] hmacKeyBytes;

    public SearchIndexService(@Value("${app.encryption.key}") String encryptionKey) {
        this.hmacKeyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
    }

    /** Normalized lowercase name token for LIKE-based partial search. */
    public String nameSearchToken(String value) {
        if (value == null) return null;
        return value.trim().toLowerCase();
    }

    /** HMAC-SHA256 of the normalized phone number (digits only). */
    public String hashPhone(String phone) {
        if (phone == null || phone.isBlank()) return null;
        String normalized = phone.replaceAll("[^0-9]", "");
        return hmac(normalized);
    }

    /** HMAC-SHA256 of lowercase-trimmed email. */
    public String hashEmail(String email) {
        if (email == null || email.isBlank()) return null;
        return hmac(email.trim().toLowerCase());
    }

    private String hmac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hmacKeyBytes, "HmacSHA256"));
            byte[] digest = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Search index hashing failed", e);
        }
    }
}
