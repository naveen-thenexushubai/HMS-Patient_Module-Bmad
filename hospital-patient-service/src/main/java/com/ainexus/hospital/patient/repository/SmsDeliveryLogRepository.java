package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.SmsDeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsDeliveryLogRepository extends JpaRepository<SmsDeliveryLog, Long> {

    List<SmsDeliveryLog> findAllByOrderBySentAtDesc();

    List<SmsDeliveryLog> findByPatientIdOrderBySentAtDesc(String patientId);
}
