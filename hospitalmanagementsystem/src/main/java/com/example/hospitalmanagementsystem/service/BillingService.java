package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.entity.Billing;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.repository.AppointmentRepository;
import com.example.hospitalmanagementsystem.repository.BillingRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BillingService {

    private final BillingRepository billingRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public BillingService(
            BillingRepository billingRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository) {

        this.billingRepository = billingRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Billing addBilling(Billing billing) {

        // Load real Patient from database
        if (billing.getPatient() != null &&
                billing.getPatient().getId() != null) {

            Patient patient = patientRepository
                    .findById(billing.getPatient().getId())
                    .orElseThrow(() ->
                            new RuntimeException("Patient not found"));

            billing.setPatient(patient);
        }

        // Load real Appointment from database
        if (billing.getAppointment() != null &&
                billing.getAppointment().getId() != null) {

            Appointment appointment = appointmentRepository
                    .findById(billing.getAppointment().getId())
                    .orElseThrow(() ->
                            new RuntimeException("Appointment not found"));

            billing.setAppointment(appointment);
        }

        // Calculate total amount
        double total =
                billing.getConsultationFee()
                        + billing.getMedicineFee()
                        + billing.getRoomFee();

        billing.setTotalAmount(total);

        return billingRepository.save(billing);
    }

    public List<Billing> getAllBillings() {
        return billingRepository.findAll();
    }

    public Optional<Billing> getBillingById(Long id) {
        return billingRepository.findById(id);
    }

    public Billing updateBilling(
            Long id,
            Billing billing) {

        Billing existingBilling =
                billingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Billing not found: " + id));

        // Update fees
        existingBilling.setConsultationFee(
                billing.getConsultationFee());

        existingBilling.setMedicineFee(
                billing.getMedicineFee());

        existingBilling.setRoomFee(
                billing.getRoomFee());

        // Calculate total again
        double total =
                existingBilling.getConsultationFee()
                        + existingBilling.getMedicineFee()
                        + existingBilling.getRoomFee();

        existingBilling.setTotalAmount(total);

        // Update patient if provided
        if (billing.getPatient() != null &&
                billing.getPatient().getId() != null) {

            Patient patient = patientRepository
                    .findById(billing.getPatient().getId())
                    .orElseThrow(() ->
                            new RuntimeException("Patient not found"));

            existingBilling.setPatient(patient);
        }

        // Update appointment if provided
        if (billing.getAppointment() != null &&
                billing.getAppointment().getId() != null) {

            Appointment appointment =
                    appointmentRepository
                            .findById(
                                    billing.getAppointment().getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Appointment not found"));

            existingBilling.setAppointment(appointment);
        }

        return billingRepository.save(existingBilling);
    }

    public void deleteBilling(Long id) {
        billingRepository.deleteById(id);
    }
}