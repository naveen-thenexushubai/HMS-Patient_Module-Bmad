package com.ainexus.hospital.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAspectJAutoProxy
@EnableScheduling
public class HospitalPatientServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(HospitalPatientServiceApplication.class, args);
    }
}
