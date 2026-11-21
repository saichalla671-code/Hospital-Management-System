package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.entity.Prescription;
import com.example.hospitalmanagementsystem.repository.AppointmentRepository;
import com.example.hospitalmanagementsystem.repository.DoctorRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import com.example.hospitalmanagementsystem.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Prescription addPrescription(Prescription prescription) {

        // Check patient
        if (prescription.getPatient() == null ||
                prescription.getPatient().getId() == null) {

            throw new RuntimeException("Patient ID is required");
        }

        // Check doctor
        if (prescription.getDoctor() == null ||
                prescription.getDoctor().getId() == null) {

            throw new RuntimeException("Doctor ID is required");
        }

        // Check appointment
        if (prescription.getAppointment() == null ||
                prescription.getAppointment().getId() == null) {

            throw new RuntimeException("Appointment ID is required");
        }

        Long patientId = prescription.getPatient().getId();
        Long doctorId = prescription.getDoctor().getId();
        Long appointmentId = prescription.getAppointment().getId();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found: " + patientId));

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor not found: " + doctorId));

        Appointment appointment =
                appointmentRepository.findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found: "
                                                + appointmentId));

        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setAppointment(appointment);

        return prescriptionRepository.save(prescription);
    }
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }
    // ADMIN → can update everything
    public Prescription updatePrescription(
            Long id,
            Prescription prescription) {

        Prescription existingPrescription =
                prescriptionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Prescription not found: " + id));

        existingPrescription.setMedicineName(
                prescription.getMedicineName());

        existingPrescription.setDosage(
                prescription.getDosage());

        existingPrescription.setInstructions(
                prescription.getInstructions());

        // Update patient
        if (prescription.getPatient() != null &&
                prescription.getPatient().getId() != null) {

            Patient patient = patientRepository.findById(
                    prescription.getPatient().getId()
            ).orElseThrow(() ->
                    new RuntimeException("Patient not found"));

            existingPrescription.setPatient(patient);
        }

        // Update doctor
        if (prescription.getDoctor() != null &&
                prescription.getDoctor().getId() != null) {

            Doctor doctor = doctorRepository.findById(
                    prescription.getDoctor().getId()
            ).orElseThrow(() ->
                    new RuntimeException("Doctor not found"));

            existingPrescription.setDoctor(doctor);
        }

        // Update appointment
        if (prescription.getAppointment() != null &&
                prescription.getAppointment().getId() != null) {

            Appointment appointment =
                    appointmentRepository.findById(
                            prescription.getAppointment().getId()
                    ).orElseThrow(() ->
                            new RuntimeException("Appointment not found"));

            existingPrescription.setAppointment(appointment);
        }

        return prescriptionRepository.save(existingPrescription);
    }


    // DOCTOR → update only prescription details
    public Prescription updatePrescriptionByDoctor(
            Long id,
            Prescription prescription) {

        Prescription existingPrescription =
                prescriptionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Prescription not found: " + id));

        existingPrescription.setMedicineName(
                prescription.getMedicineName());

        existingPrescription.setDosage(
                prescription.getDosage());

        existingPrescription.setInstructions(
                prescription.getInstructions());

        // DO NOT change:
        // patient
        // doctor
        // appointment

        return prescriptionRepository.save(existingPrescription);
    }

    public void deletePrescription(Long id) {
        prescriptionRepository.deleteById(id);
    }
}
