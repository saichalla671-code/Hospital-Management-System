package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.service.PatientService;
import com.example.hospitalmanagementsystem.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin
public class PatientController {

    private final PatientService patientService;
    private final UserService userService;

    public PatientController(
            PatientService patientService,
            UserService userService) {

        this.patientService = patientService;
        this.userService = userService;
    }

    // GET ALL PATIENTS
    @GetMapping
    public ResponseEntity<?> getAllPatients(
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        // ADMIN → all patients
        if ("ROLE_ADMIN".equals(role)) {
            return ResponseEntity.ok(
                    patientService.getAllPatients()
            );
        }

        // PATIENT → only own patient
        if ("ROLE_PATIENT".equals(role)) {

            String username = authentication.getName();

            User user = userService.getUserByUsername(username);

            if (user.getPatient() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("No patient profile linked to this account");
            }

            return ResponseEntity.ok(
                    List.of(user.getPatient())
            );
        }

        // DOCTOR → all patients
        return ResponseEntity.ok(
                patientService.getAllPatients()
        );
    }

    // GET PATIENT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(
            @PathVariable Long id,
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        // ADMIN → any patient
        if ("ROLE_ADMIN".equals(role)) {

            return patientService.getPatientById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() ->
                            ResponseEntity.notFound().build()
                    );
        }

        // PATIENT → only own patient
        if ("ROLE_PATIENT".equals(role)) {

            String username = authentication.getName();

            User user = userService.getUserByUsername(username);

            if (user.getPatient() == null ||
                    !user.getPatient().getId().equals(id)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can access only your own patient profile");
            }

            return ResponseEntity.ok(user.getPatient());
        }

        // DOCTOR → any patient
        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // CREATE PATIENT
    @PostMapping
    public ResponseEntity<Patient> createPatient(
            @Valid @RequestBody Patient patient) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.addPatient(patient));
    }

    // UPDATE PATIENT
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody Patient patient,
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        // ADMIN → update any patient
        if ("ROLE_ADMIN".equals(role)) {

            return ResponseEntity.ok(
                    patientService.updatePatient(id, patient)
            );
        }

        // PATIENT → update own profile only
        if ("ROLE_PATIENT".equals(role)) {

            String username = authentication.getName();

            User user = userService.getUserByUsername(username);

            if (user.getPatient() == null ||
                    !user.getPatient().getId().equals(id)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can update only your own patient profile");
            }

            return ResponseEntity.ok(
                    patientService.updatePatient(id, patient)
            );
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You are not allowed to update patients");
    }

    // DELETE PATIENT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(
            @PathVariable Long id) {

        patientService.deletePatient(id);

        return ResponseEntity.ok(
                "Patient deleted successfully"
        );
    }
}