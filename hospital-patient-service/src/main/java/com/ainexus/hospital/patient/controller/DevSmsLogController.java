package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.model.SmsDeliveryLog;
import com.ainexus.hospital.patient.repository.SmsDeliveryLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dev/sms-log")
@RequiredArgsConstructor
@Tag(name = "Dev Tools", description = "SMS delivery log — staff access only")
public class DevSmsLogController {

    private final SmsDeliveryLogRepository smsLogRepository;

    @Operation(summary = "View all SMS messages sent (mock mode only)")
    @GetMapping
    public ResponseEntity<List<SmsDeliveryLog>> getSmsLog() {
        return ResponseEntity.ok(smsLogRepository.findAllByOrderBySentAtDesc());
    }
}
