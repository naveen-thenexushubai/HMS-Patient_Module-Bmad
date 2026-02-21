package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.response.NotificationResponse;
import com.ainexus.hospital.patient.model.PatientNotification;
import com.ainexus.hospital.patient.repository.PatientNotificationRepository;
import com.ainexus.hospital.patient.service.PatientPortalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/portal/me/notifications")
@RequiredArgsConstructor
@Tag(name = "Patient Notifications", description = "In-app notification endpoints for patient portal")
public class PatientNotificationController {

    private final PatientNotificationRepository notificationRepository;
    private final PatientPortalService portalService;

    @Operation(summary = "Get all notifications for authenticated patient")
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication auth) {
        String patientId = portalService.resolvePatientId(auth);
        List<NotificationResponse> responses = notificationRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Get unread notification count")
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        String patientId = portalService.resolvePatientId(auth);
        long count = notificationRepository.countByPatientIdAndIsReadFalse(patientId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @Operation(summary = "Mark a single notification as read")
    @Transactional
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication auth, @PathVariable Long id) {
        String patientId = portalService.resolvePatientId(auth);
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getPatientId().equals(patientId) && !n.isRead()) {
                n.setRead(true);
                n.setReadAt(Instant.now());
                notificationRepository.save(n);
            }
        });
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Mark all notifications as read")
    @Transactional
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        String patientId = portalService.resolvePatientId(auth);
        notificationRepository.markAllReadByPatientId(patientId, Instant.now());
        return ResponseEntity.noContent().build();
    }

    private NotificationResponse toResponse(PatientNotification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .patientId(n.getPatientId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.isRead())
                .appointmentId(n.getAppointmentId())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .readAt(n.getReadAt() != null ? n.getReadAt().toString() : null)
                .build();
    }
}
