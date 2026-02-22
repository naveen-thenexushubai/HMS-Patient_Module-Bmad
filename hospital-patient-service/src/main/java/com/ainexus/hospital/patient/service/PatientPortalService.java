package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.audit.AuditAction;
import com.ainexus.hospital.patient.audit.AuditWriter;
import com.ainexus.hospital.patient.dto.request.PortalContactUpdateRequest;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.mapper.PatientMapper;
import com.ainexus.hospital.patient.model.AuditLog;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientPortalService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final SearchIndexService searchIndexService;
    private final AuditWriter auditWriter;

    /**
     * Extracts the patientId from the PATIENT-role JWT principal.
     * Throws 403 if not a PATIENT role or patientId is missing.
     */
    public String resolvePatientId(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authentication required");
        }
        if (!"PATIENT".equals(up.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient portal requires PATIENT role");
        }
        String patientId = up.getPatientId();
        if (!StringUtils.hasText(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient ID claim missing from token");
        }
        return patientId;
    }

    @Transactional(readOnly = true)
    public PatientResponse getOwnProfile(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        return buildResponse(patient);
    }

    public PatientResponse updateContactInfo(String patientId, PortalContactUpdateRequest request, Authentication auth) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        String username = resolveUsername(auth);

        if (StringUtils.hasText(request.getPhoneNumber())) {
            patient.setPhoneNumber(request.getPhoneNumber());
            patient.setPhoneNumberHash(searchIndexService.hashPhone(request.getPhoneNumber()));
        }
        if (StringUtils.hasText(request.getEmail())) {
            patient.setEmail(request.getEmail());
            patient.setEmailHash(searchIndexService.hashEmail(request.getEmail()));
        }
        if (request.getAddress() != null)  patient.setAddress(request.getAddress());
        if (request.getCity() != null)     patient.setCity(request.getCity());
        if (request.getState() != null)    patient.setState(request.getState());
        if (request.getZipCode() != null)  patient.setZipCode(request.getZipCode());

        patient.setUpdatedBy(username);
        patient.setUpdatedAt(Instant.now());

        Patient saved = patientRepository.save(patient);
        log.info("Portal contact updated patientId={}", patientId);

        auditWriter.write(buildAuditLog(patientId, username, resolveRole(auth), AuditAction.PORTAL_CONTACT_UPDATE));
        return buildResponse(saved);
    }

    public void logPortalAccess(String patientId, Authentication auth) {
        String username = resolveUsername(auth);
        String role     = resolveRole(auth);
        log.info("Portal accessed patientId={}", patientId);
        auditWriter.write(buildAuditLog(patientId, username, role, AuditAction.PORTAL_ACCESS));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private PatientResponse buildResponse(Patient patient) {
        PatientResponse response = patientMapper.toResponse(patient);
        response.setAge(calculateAge(patient.getDateOfBirth()));
        return response;
    }

    private int calculateAge(String dateOfBirth) {
        if (dateOfBirth == null) return 0;
        try { return Period.between(LocalDate.parse(dateOfBirth), LocalDate.now()).getYears(); }
        catch (Exception e) { return 0; }
    }

    private String resolveUsername(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getUsername();
        return "patient";
    }

    private String resolveRole(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getRole();
        return "PATIENT";
    }

    private AuditLog buildAuditLog(String patientId, String username, String role, AuditAction action) {
        return AuditLog.builder()
                .userId(patientId)   // for PATIENT role, userId = patientId
                .username(username)
                .userRole(role)
                .action(action)
                .patientId(patientId)
                .occurredAt(Instant.now())
                .build();
    }
}
