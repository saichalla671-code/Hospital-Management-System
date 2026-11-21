package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository) {

        this.appointmentRepository = appointmentRepository;
    }

    // Create Appointment
    public Appointment addAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // Get All Appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Get Appointment By ID
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    // Update Appointment
    public Appointment updateAppointment(
            Long id,
            Appointment appointment) {

        Appointment existingAppointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with id: " + id));

        // Update normal appointment details
        existingAppointment.setAppointmentDate(
                appointment.getAppointmentDate());

        existingAppointment.setAppointmentTime(
                appointment.getAppointmentTime());

        existingAppointment.setReason(
                appointment.getReason());

        existingAppointment.setStatus(
                appointment.getStatus());

        // Update patient and doctor
        // This is currently used by ADMIN
        existingAppointment.setPatient(
                appointment.getPatient());

        existingAppointment.setDoctor(
                appointment.getDoctor());

        return appointmentRepository.save(existingAppointment);
    }

    // Delete Appointment
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
    public Appointment updateAppointmentByDoctor(
            Long id,
            Appointment appointment) {

        Appointment existingAppointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with id: " + id));

        existingAppointment.setAppointmentDate(
                appointment.getAppointmentDate());

        existingAppointment.setAppointmentTime(
                appointment.getAppointmentTime());

        existingAppointment.setReason(
                appointment.getReason());

        existingAppointment.setStatus(
                appointment.getStatus());

        // DO NOT change patient
        // DO NOT change doctor

        return appointmentRepository.save(existingAppointment);
    }
    public Appointment updateAppointmentByPatient(
            Long id,
            Appointment appointment) {

        Appointment existingAppointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with id: " + id));

        // Patient can update only these fields
        existingAppointment.setAppointmentDate(
                appointment.getAppointmentDate());

        existingAppointment.setAppointmentTime(
                appointment.getAppointmentTime());

        existingAppointment.setReason(
                appointment.getReason());

        existingAppointment.setStatus(
                appointment.getStatus());

        // Do NOT change patient
        // Do NOT change doctor

        return appointmentRepository.save(existingAppointment);
    }

}
