package com.ainexus.hospital.patient.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**").permitAll()
                // Dev-only login endpoint (DevAuthController is @Profile("dev") so only exists in dev)
                .requestMatchers("/api/v1/auth/**").permitAll()
                // CSV export (before generic GET patients/** to ensure correct role restriction)
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/export").hasAnyRole("RECEPTIONIST", "ADMIN")
                // Audit trail — ADMIN only
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/*/audit-trail").hasRole("ADMIN")
                // Insurance endpoints
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/*/insurance").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients/*/insurance").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/patients/*/insurance/*").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/patients/*/insurance/*").hasAnyRole("RECEPTIONIST", "ADMIN")
                // Vitals endpoints
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/*/vitals").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients/*/vitals").hasAnyRole("DOCTOR", "NURSE", "ADMIN")
                // ── v2.0.0 NEW ENDPOINTS (must come BEFORE generic patients/** rules) ────
                // Notification endpoints (PATIENT role only — portal)
                .requestMatchers("/api/v1/portal/me/notifications/**").hasRole("PATIENT")
                // Dev SMS log (staff only)
                .requestMatchers(HttpMethod.GET, "/api/v1/dev/sms-log").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                // Patient Portal — PATIENT role only
                .requestMatchers("/api/v1/portal/**").hasRole("PATIENT")
                // Allergy endpoints — all staff can view; only clinical staff can modify
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/*/allergies/**").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients/*/allergies").hasAnyRole("DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/patients/*/allergies/*").hasAnyRole("DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/patients/*/allergies/*").hasAnyRole("DOCTOR", "NURSE", "ADMIN")
                // Appointment endpoints — all staff can view and book; clinical staff can complete
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/*/appointments/**").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients/*/appointments").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/patients/*/appointments/*").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/v1/patients/*/appointments/*/cancel").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                // Global appointment list — RECEPTIONIST and ADMIN only
                .requestMatchers(HttpMethod.GET,    "/api/v1/appointments").hasAnyRole("RECEPTIONIST", "ADMIN")
                // Patient endpoints — generic rules (after specific sub-resource rules above)
                .requestMatchers(HttpMethod.GET,    "/api/v1/patients/**").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/v1/patients/**").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/v1/patients/*/status").hasRole("ADMIN")
                // Photo endpoints
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients/*/photo").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/patients/*/photo").hasAnyRole("RECEPTIONIST", "ADMIN")
                // Relationship endpoints
                .requestMatchers(HttpMethod.POST,   "/api/v1/patients/*/relationships").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/patients/*/relationships/*").hasAnyRole("RECEPTIONIST", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",   // Vite dev server
            "http://localhost:80",     // Nginx
            "http://hospital-ui"       // Docker internal
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
