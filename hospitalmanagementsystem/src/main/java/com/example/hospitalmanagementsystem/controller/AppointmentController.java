package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.entity.Appointment;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.service.AppointmentService;
import com.example.hospitalmanagementsystem.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserService userService;

    public AppointmentController(
            AppointmentService appointmentService,
            UserService userService) {

        this.appointmentService = appointmentService;
        this.userService = userService;
    }

    // =========================================================
    // CREATE APPOINTMENT
    // =========================================================
    @PostMapping
    public ResponseEntity<Appointment> addAppointment(
            @RequestBody Appointment appointment,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // ADMIN
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(
                    appointmentService.addAppointment(appointment)
            );
        }

        // DOCTOR
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (appointment.getDoctor() == null ||
                    appointment.getDoctor().getId() == null) {

                throw new RuntimeException("Doctor is required");
            }

            if (appointment.getPatient() == null ||
                    appointment.getPatient().getId() == null) {

                throw new RuntimeException("Patient is required");
            }

            return ResponseEntity.ok(
                    appointmentService.addAppointment(appointment)
            );
        }

        // PATIENT
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                throw new RuntimeException(
                        "No patient profile is linked to this account"
                );
            }

            if (appointment.getDoctor() == null ||
                    appointment.getDoctor().getId() == null) {

                throw new RuntimeException("Doctor is required");
            }

            // IMPORTANT:
            // Ignore the patient ID sent from frontend.
            // Use the patient linked to the logged-in user.
            appointment.setPatient(user.getPatient());

            return ResponseEntity.ok(
                    appointmentService.addAppointment(appointment)
            );
        }

        throw new RuntimeException("Unauthorized role");
    }


    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments(
            Authentication authentication) {

        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        // ADMIN → all appointments
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity.ok(
                    appointmentService.getAllAppointments()
            );
        }

        // DOCTOR → only their appointments
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (user.getDoctor() == null) {
                return ResponseEntity.status(403).build();
            }

            Long doctorId = user.getDoctor().getId();

            List<Appointment> appointments =
                    appointmentService.getAllAppointments()
                            .stream()
                            .filter(appointment ->
                                    appointment.getDoctor() != null &&
                                            appointment.getDoctor()
                                                    .getId()
                                                    .equals(doctorId)
                            )
                            .toList();

            return ResponseEntity.ok(appointments);
        }

        // PATIENT → only their appointments
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                return ResponseEntity.status(403).build();
            }

            Long patientId = user.getPatient().getId();

            List<Appointment> appointments =
                    appointmentService.getAllAppointments()
                            .stream()
                            .filter(appointment ->
                                    appointment.getPatient() != null &&
                                            appointment.getPatient()
                                                    .getId()
                                                    .equals(patientId)
                            )
                            .toList();

            return ResponseEntity.ok(appointments);
        }

        return ResponseEntity.status(403).build();
    }


    // =========================================================
    // GET APPOINTMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        // ADMIN → any appointment
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            return appointmentService.getAppointmentById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        // DOCTOR → only their appointment
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (user.getDoctor() == null) {
                return ResponseEntity.status(403).build();
            }

            Long doctorId = user.getDoctor().getId();

            return appointmentService.getAppointmentById(id)
                    .filter(appointment ->
                            appointment.getDoctor() != null &&
                                    appointment.getDoctor()
                                            .getId()
                                            .equals(doctorId)
                    )
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(403).build());
        }

        // PATIENT → only their appointment
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                return ResponseEntity.status(403).build();
            }

            return appointmentService.getAppointmentById(id)
                    .filter(appointment ->
                            appointment.getPatient() != null &&
                                    appointment.getPatient()
                                            .getId()
                                            .equals(user.getPatient().getId())
                    )
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(403).build());
        }

        return ResponseEntity.status(403).build();
    }


    // =========================================================
    // UPDATE APPOINTMENT
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long id,
            @RequestBody Appointment appointment,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        // ADMIN → can update any appointment
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity.ok(
                    appointmentService.updateAppointment(id, appointment)
            );
        }

        // DOCTOR → can update only their appointment
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (user.getDoctor() == null) {
                return ResponseEntity.status(403).build();
            }

            Long doctorId = user.getDoctor().getId();

            return appointmentService.getAppointmentById(id)
                    .filter(existingAppointment ->
                            existingAppointment.getDoctor() != null &&
                                    existingAppointment.getDoctor()
                                            .getId()
                                            .equals(doctorId)
                    )
                    .map(existingAppointment ->
                            ResponseEntity.ok(
                                    appointmentService.updateAppointment(
                                            id,
                                            appointment
                                    )
                            )
                    )
                    .orElse(ResponseEntity.status(403).build());
        }

        // PATIENT → can update only their appointment
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                return ResponseEntity.status(403).build();
            }

            return appointmentService.getAppointmentById(id)
                    .filter(existingAppointment ->
                            existingAppointment.getPatient() != null &&
                                    existingAppointment.getPatient()
                                            .getId()
                                            .equals(user.getPatient().getId())
                    )
                    .map(existingAppointment ->
                            ResponseEntity.ok(
                                    appointmentService.updateAppointmentByPatient(
                                            id,
                                            appointment
                                    )
                            )
                    )
                    .orElse(ResponseEntity.status(403).build());
        }

        return ResponseEntity.status(403).build();
    }


    // =========================================================
    // DELETE APPOINTMENT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAppointment(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        // Only ADMIN can delete
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity.status(403)
                    .body("Only ADMIN can delete appointments");
        }

        appointmentService.deleteAppointment(id);

        return ResponseEntity.ok(
                "Appointment deleted successfully"
        );
    }
}