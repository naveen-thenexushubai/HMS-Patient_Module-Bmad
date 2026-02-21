package com.ainexus.hospital.patient.dto.response;

import com.ainexus.hospital.patient.model.NotificationType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private Long             id;
    private String           patientId;
    private NotificationType type;
    private String           title;
    private String           message;
    private boolean          isRead;
    private Long             appointmentId;
    private String           createdAt;
    private String           readAt;
}
