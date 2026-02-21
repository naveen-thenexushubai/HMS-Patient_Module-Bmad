package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.AppointmentRequest;
import com.ainexus.hospital.patient.dto.request.AppointmentUpdateRequest;
import com.ainexus.hospital.patient.dto.response.AppointmentResponse;
import com.ainexus.hospital.patient.event.AppointmentBookedEvent;
import com.ainexus.hospital.patient.event.AppointmentCancelledEvent;
import com.ainexus.hospital.patient.event.AppointmentStatusChangedEvent;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.model.PatientAppointment;
import com.ainexus.hospital.patient.repository.PatientAppointmentRepository;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientAppointmentService {

    private final PatientAppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointments(String patientId) {
        validatePatientExists(patientId);
        return appointmentRepository
                .findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(patientId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUpcomingAppointments(String patientId) {
        validatePatientExists(patientId);
        List<AppointmentStatus> upcomingStatuses = List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED);
        return appointmentRepository
                .findUpcoming(patientId, upcomingStatuses, LocalDate.now())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getVisitHistory(String patientId) {
        validatePatientExists(patientId);
        return appointmentRepository
                .findByPatientIdAndStatusOrderByAppointmentDateDesc(patientId, AppointmentStatus.COMPLETED)
                .stream().map(this::toResponse).toList();
    }

    public AppointmentResponse bookAppointment(String patientId, AppointmentRequest request) {
        validatePatientExists(patientId);

        LocalDate date = LocalDate.parse(request.getAppointmentDate());
        if (!date.isAfter(LocalDate.now().minusDays(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Appointment date must be today or in the future");
        }

        LocalTime time = LocalTime.parse(request.getAppointmentTime(), DateTimeFormatter.ofPattern("HH:mm"));

        PatientAppointment appointment = PatientAppointment.builder()
                .patientId(patientId)
                .appointmentDate(date)
                .appointmentTime(time)
                .appointmentType(request.getAppointmentType())
                .status(AppointmentStatus.SCHEDULED)
                .doctorName(request.getDoctorName())
                .department(request.getDepartment())
                .reasonForVisit(request.getReasonForVisit())
                .createdBy(getCurrentUsername())
                .createdAt(Instant.now())
                .build();

        PatientAppointment saved = appointmentRepository.save(appointment);
        log.info("Appointment booked patientId={} appointmentId={} userId={}", patientId, saved.getId(), getCurrentUserId());
        eventPublisher.publishEvent(new AppointmentBookedEvent(
                patientId, saved.getId(),
                saved.getAppointmentDate().toString(),
                saved.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                saved.getDoctorName(), saved.getDepartment()));
        return toResponse(saved);
    }

    public AppointmentResponse updateAppointment(String patientId, Long appointmentId, AppointmentUpdateRequest request) {
        PatientAppointment appt = appointmentRepository.findByIdAndPatientId(appointmentId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        // Enforce terminal state rule
        if (appt.getStatus() == AppointmentStatus.COMPLETED || appt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot modify a " + appt.getStatus().name().toLowerCase() + " appointment");
        }

        AppointmentStatus oldStatus = appt.getStatus();

        if (request.getAppointmentDate() != null) {
            appt.setAppointmentDate(LocalDate.parse(request.getAppointmentDate()));
        }
        if (request.getAppointmentTime() != null) {
            appt.setAppointmentTime(LocalTime.parse(request.getAppointmentTime(), DateTimeFormatter.ofPattern("HH:mm")));
        }
        if (request.getAppointmentType() != null) appt.setAppointmentType(request.getAppointmentType());
        if (request.getStatus() != null)          appt.setStatus(request.getStatus());
        if (request.getDoctorName() != null)      appt.setDoctorName(request.getDoctorName());
        if (request.getDepartment() != null)      appt.setDepartment(request.getDepartment());
        if (request.getReasonForVisit() != null)  appt.setReasonForVisit(request.getReasonForVisit());
        if (request.getVisitNotes() != null)      appt.setVisitNotes(request.getVisitNotes());
        if (request.getDiagnosis() != null)       appt.setDiagnosis(request.getDiagnosis());

        appt.setUpdatedBy(getCurrentUsername());
        appt.setUpdatedAt(Instant.now());

        PatientAppointment saved = appointmentRepository.save(appt);
        log.info("Appointment updated patientId={} appointmentId={} status={} userId={}",
                patientId, appointmentId, saved.getStatus(), getCurrentUserId());
        if (request.getStatus() != null && request.getStatus() != oldStatus) {
            eventPublisher.publishEvent(new AppointmentStatusChangedEvent(
                    patientId, appointmentId, saved.getStatus(),
                    saved.getAppointmentDate().toString(),
                    saved.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm")),
                    saved.getDoctorName()));
        }
        return toResponse(saved);
    }

    public AppointmentResponse cancelAppointment(String patientId, Long appointmentId) {
        PatientAppointment appt = appointmentRepository.findByIdAndPatientId(appointmentId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (appt.getStatus() == AppointmentStatus.COMPLETED || appt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot cancel a " + appt.getStatus().name().toLowerCase() + " appointment");
        }

        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setUpdatedBy(getCurrentUsername());
        appt.setUpdatedAt(Instant.now());

        PatientAppointment saved = appointmentRepository.save(appt);
        log.info("Appointment cancelled patientId={} appointmentId={} userId={}", patientId, appointmentId, getCurrentUserId());
        eventPublisher.publishEvent(new AppointmentCancelledEvent(
                patientId, appointmentId,
                saved.getAppointmentDate().toString(),
                saved.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm"))));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAllAppointments(String patientId, AppointmentStatus status,
                                                        LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        return appointmentRepository
                .findAllFiltered(patientId, status, fromDate, toDate, pageable)
                .map(this::toResponse);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void validatePatientExists(String patientId) {
        if (!patientRepository.findByPatientId(patientId).isPresent()) {
            throw new PatientNotFoundException(patientId);
        }
    }

    private AppointmentResponse toResponse(PatientAppointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .patientId(a.getPatientId())
                .appointmentDate(a.getAppointmentDate() != null ? a.getAppointmentDate().toString() : null)
                .appointmentTime(a.getAppointmentTime() != null
                        ? a.getAppointmentTime().format(DateTimeFormatter.ofPattern("HH:mm")) : null)
                .appointmentType(a.getAppointmentType())
                .status(a.getStatus())
                .doctorName(a.getDoctorName())
                .department(a.getDepartment())
                .reasonForVisit(a.getReasonForVisit())
                .visitNotes(a.getVisitNotes())
                .diagnosis(a.getDiagnosis())
                .createdBy(a.getCreatedBy())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .updatedBy(a.getUpdatedBy())
                .updatedAt(a.getUpdatedAt() != null ? a.getUpdatedAt().toString() : null)
                .build();
    }

    private String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getUsername();
        return "system";
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getUserId();
        return "system";
    }
}
