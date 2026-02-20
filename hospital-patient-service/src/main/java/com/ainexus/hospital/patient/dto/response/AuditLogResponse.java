package com.ainexus.hospital.patient.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String userId;
    private String username;
    private String userRole;
    private String action;
    private String patientId;
    private String ipAddress;
    private String occurredAt;
}
