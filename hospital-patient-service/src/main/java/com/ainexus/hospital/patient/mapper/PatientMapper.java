package com.ainexus.hospital.patient.mapper;

import com.ainexus.hospital.patient.dto.request.PatientCreateRequest;
import com.ainexus.hospital.patient.dto.request.PatientUpdateRequest;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.dto.response.PatientSummaryResponse;
import com.ainexus.hospital.patient.model.Patient;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "mrn", ignore = true)
    @Mapping(target = "photo", ignore = true)
    @Mapping(target = "photoContentType", ignore = true)
    @Mapping(target = "birthYear", ignore = true)
    @Mapping(target = "hasAllergies", ignore = true)
    @Mapping(target = "hasChronicConditions", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "registeredBy", ignore = true)
    @Mapping(target = "registeredAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Patient toEntity(PatientCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "mrn", ignore = true)
    @Mapping(target = "photo", ignore = true)
    @Mapping(target = "photoContentType", ignore = true)
    @Mapping(target = "birthYear", ignore = true)
    @Mapping(target = "hasAllergies", ignore = true)
    @Mapping(target = "hasChronicConditions", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "registeredBy", ignore = true)
    @Mapping(target = "registeredAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(PatientUpdateRequest request, @MappingTarget Patient entity);

    @Mapping(target = "age", ignore = true)         // set in service from DOB
    @Mapping(target = "hasPhoto", expression = "java(patient.getPhoto() != null && patient.getPhoto().length > 0)")
    @Mapping(target = "hasAllergies", expression = "java(Boolean.TRUE.equals(patient.getHasAllergies()))")
    @Mapping(target = "hasChronicConditions", expression = "java(Boolean.TRUE.equals(patient.getHasChronicConditions()))")
    @Mapping(target = "registeredAt", expression = "java(patient.getRegisteredAt() != null ? patient.getRegisteredAt().toString() : null)")
    @Mapping(target = "updatedAt",    expression = "java(patient.getUpdatedAt()    != null ? patient.getUpdatedAt().toString()    : null)")
    PatientResponse toResponse(Patient patient);

    @Mapping(target = "age", ignore = true)         // set in service from DOB
    PatientSummaryResponse toSummaryResponse(Patient patient);
}
