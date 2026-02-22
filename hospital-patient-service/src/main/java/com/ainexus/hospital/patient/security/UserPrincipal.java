package com.ainexus.hospital.patient.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final String userId;
    private final String username;
    private final String role;
    /** Only set for PATIENT role — contains the patient's business ID (e.g. P2026001). Null for staff roles. */
    private final String patientId;

    public UserPrincipal(String userId, String username, String role) {
        this(userId, username, role, null);
    }

    public UserPrincipal(String userId, String username, String role, String patientId) {
        this.userId    = userId;
        this.username  = username;
        this.role      = role;
        this.patientId = patientId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword()             { return null; }
    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return true; }
}
