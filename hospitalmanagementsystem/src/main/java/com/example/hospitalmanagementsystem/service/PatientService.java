package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Add Patient
    public Patient addPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // Get All Patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get Patient By ID
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    // Update Patient
    public Patient updatePatient(Long id, Patient patient) {

        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found with id: " + id));

        existingPatient.setName(patient.getName());
        existingPatient.setAge(patient.getAge());
        existingPatient.setGender(patient.getGender());
        existingPatient.setPhone(patient.getPhone());
        existingPatient.setEmail(patient.getEmail());
        existingPatient.setAddress(patient.getAddress());

        return patientRepository.save(existingPatient);
    }

    // Delete Patient
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}