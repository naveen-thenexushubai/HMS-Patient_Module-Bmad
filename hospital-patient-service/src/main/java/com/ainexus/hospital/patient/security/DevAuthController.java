package com.ainexus.hospital.patient.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * DEV-ONLY login endpoint — NOT available in production.
 *
 * Issues a real HMAC-SHA256 JWT so the UI can be tested without
 * the Auth module. Hit POST /api/v1/auth/dev-login with a JSON body
 * of { "username": "receptionist1", "role": "RECEPTIONIST" } and the
 * response token can be pasted directly into the browser login form.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class DevAuthController {

    private final byte[] secretBytes;

    public DevAuthController(@Value("${app.jwt.secret}") String secret) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
    }

    @Data
    public static class DevLoginRequest {
        private String username;
        private String role; // RECEPTIONIST | DOCTOR | NURSE | ADMIN
    }

    @PostMapping("/dev-login")
    public ResponseEntity<Map<String, String>> devLogin(@RequestBody DevLoginRequest req) {
        String userId = UUID.randomUUID().toString();

        String token = Jwts.builder()
                .subject(userId)
                .claim("username", req.getUsername())
                .claim("role", req.getRole())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(8, ChronoUnit.HOURS)))
                .signWith(Keys.hmacShaKeyFor(secretBytes))
                .compact();

        return ResponseEntity.ok(Map.of("token", token));
    }
}
