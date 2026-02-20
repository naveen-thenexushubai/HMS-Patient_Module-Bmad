package com.ainexus.hospital.patient.audit;

import com.ainexus.hospital.patient.model.AuditLog;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;

/**
 * AOP audit interceptor — writes an immutable AuditLog entry after every
 * successful PatientService mutation. This is the HIPAA audit trail.
 *
 * PHI is NEVER logged here — only non-PHI identifiers.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditWriter auditWriter;

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientService.registerPatient(..))",
        returning = "result"
    )
    public void afterRegister(JoinPoint jp, Object result) {
        String patientId = extractPatientIdFromResult(result);
        writeAudit(AuditAction.CREATE, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientService.getPatientById(..))",
        returning = "result"
    )
    public void afterRead(JoinPoint jp, Object result) {
        String patientId = extractPatientIdFromResult(result);
        writeAudit(AuditAction.READ, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientService.updatePatient(..))",
        returning = "result"
    )
    public void afterUpdate(JoinPoint jp, Object result) {
        String patientId = extractPatientIdFromResult(result);
        writeAudit(AuditAction.UPDATE, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientService.deactivatePatient(..))",
        returning = "result"
    )
    public void afterDeactivate(JoinPoint jp, Object result) {
        String patientId = extractPatientIdFromResult(result);
        writeAudit(AuditAction.DEACTIVATE, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientService.activatePatient(..))",
        returning = "result"
    )
    public void afterActivate(JoinPoint jp, Object result) {
        String patientId = extractPatientIdFromResult(result);
        writeAudit(AuditAction.ACTIVATE, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientRelationshipService.addRelationship(..))",
        returning = "result"
    )
    public void afterLinkFamily(JoinPoint jp, Object result) {
        // jp.getArgs()[0] is the patientId String
        String patientId = (jp.getArgs().length > 0 && jp.getArgs()[0] instanceof String s) ? s : "unknown";
        writeAudit(AuditAction.LINK_FAMILY, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientRelationshipService.removeRelationship(..))"
    )
    public void afterUnlinkFamily(JoinPoint jp) {
        String patientId = (jp.getArgs().length > 0 && jp.getArgs()[0] instanceof String s) ? s : "unknown";
        writeAudit(AuditAction.UNLINK_FAMILY, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientInsuranceService.addInsurance(..))",
        returning = "result"
    )
    public void afterInsuranceAdd(JoinPoint jp, Object result) {
        String patientId = (jp.getArgs().length > 0 && jp.getArgs()[0] instanceof String s) ? s : "unknown";
        writeAudit(AuditAction.INSURANCE_ADD, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientInsuranceService.updateInsurance(..))",
        returning = "result"
    )
    public void afterInsuranceUpdate(JoinPoint jp, Object result) {
        String patientId = (jp.getArgs().length > 0 && jp.getArgs()[0] instanceof String s) ? s : "unknown";
        writeAudit(AuditAction.INSURANCE_UPDATE, patientId);
    }

    @After("execution(* com.ainexus.hospital.patient.service.PatientInsuranceService.deleteInsurance(..))")
    public void afterInsuranceRemove(JoinPoint jp) {
        String patientId = (jp.getArgs().length > 0 && jp.getArgs()[0] instanceof String s) ? s : "unknown";
        writeAudit(AuditAction.INSURANCE_REMOVE, patientId);
    }

    @AfterReturning(
        pointcut = "execution(* com.ainexus.hospital.patient.service.PatientVitalsService.recordVitals(..))",
        returning = "result"
    )
    public void afterVitalsRecord(JoinPoint jp, Object result) {
        String patientId = (jp.getArgs().length > 0 && jp.getArgs()[0] instanceof String s) ? s : "unknown";
        writeAudit(AuditAction.VITALS_RECORD, patientId);
    }

    private void writeAudit(AuditAction action, String patientId) {
        UserPrincipal principal = getCurrentUser();
        if (principal == null) return;

        String ipAddress = null;
        try {
            ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                ipAddress = attrs.getRequest().getRemoteAddr();
            }
        } catch (Exception ignored) {}

        AuditLog entry = AuditLog.builder()
            .userId(principal.getUserId())
            .username(principal.getUsername())
            .userRole(principal.getRole())
            .action(action)
            .patientId(patientId != null ? patientId : "unknown")
            .ipAddress(ipAddress)
            .occurredAt(Instant.now())
            .build();

        auditWriter.write(entry);
        // Log only non-PHI identifiers
        log.info("AUDIT action={} patientId={} userId={} role={}",
            action, entry.getPatientId(), principal.getUserId(), principal.getRole());
    }

    private UserPrincipal getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up;
        }
        return null;
    }

    private String extractPatientIdFromResult(Object result) {
        if (result == null) return "unknown";
        try {
            // Works for PatientResponse and PatientSummaryResponse which have getPatientId()
            return (String) result.getClass().getMethod("getPatientId").invoke(result);
        } catch (Exception e) {
            return "unknown";
        }
    }
}
