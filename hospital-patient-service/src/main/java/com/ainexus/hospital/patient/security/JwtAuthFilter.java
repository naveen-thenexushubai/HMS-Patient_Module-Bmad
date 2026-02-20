package com.ainexus.hospital.patient.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final byte[] jwtSecretBytes;

    public JwtAuthFilter(@Value("${app.jwt.secret}") String jwtSecret) {
        this.jwtSecretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(jwtSecretBytes))
                .build()
                .parseSignedClaims(token)
                .getPayload();

            String userId   = claims.getSubject();
            String username = claims.get("username", String.class);
            String role     = claims.get("role", String.class);

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserPrincipal principal = new UserPrincipal(userId, username, role);
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
