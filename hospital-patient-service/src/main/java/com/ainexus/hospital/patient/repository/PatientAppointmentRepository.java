package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.model.PatientAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientAppointmentRepository extends JpaRepository<PatientAppointment, Long> {

    List<PatientAppointment> findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(String patientId);

    /** Upcoming: SCHEDULED or CONFIRMED with future/today date, ordered soonest first. */
    @Query("""
        SELECT a FROM PatientAppointment a
        WHERE a.patientId = :patientId
          AND a.status IN (:statuses)
          AND a.appointmentDate >= :fromDate
        ORDER BY a.appointmentDate ASC, a.appointmentTime ASC
        """)
    List<PatientAppointment> findUpcoming(
            @Param("patientId")  String patientId,
            @Param("statuses")   List<AppointmentStatus> statuses,
            @Param("fromDate")   LocalDate fromDate);

    /** Visit history: only COMPLETED, most recent first. */
    List<PatientAppointment> findByPatientIdAndStatusOrderByAppointmentDateDesc(
            String patientId, AppointmentStatus status);

    Optional<PatientAppointment> findByIdAndPatientId(Long id, String patientId);

    /** Reminder scheduler query: find all appointments for a specific date with one of the given statuses. */
    List<PatientAppointment> findByAppointmentDateAndStatusIn(LocalDate date, List<AppointmentStatus> statuses);

    /** Global list for admin/receptionist view — paginated with optional filters. */
    @Query("""
        SELECT a FROM PatientAppointment a
        WHERE (:patientId IS NULL OR :patientId = '' OR a.patientId = :patientId)
          AND (:status IS NULL OR a.status = :status)
          AND (:fromDate IS NULL OR a.appointmentDate >= :fromDate)
          AND (:toDate   IS NULL OR a.appointmentDate <= :toDate)
        ORDER BY a.appointmentDate DESC, a.appointmentTime DESC
        """)
    Page<PatientAppointment> findAllFiltered(
            @Param("patientId") String patientId,
            @Param("status")    AppointmentStatus status,
            @Param("fromDate")  LocalDate fromDate,
            @Param("toDate")    LocalDate toDate,
            Pageable pageable);
}
