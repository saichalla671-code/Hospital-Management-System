package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.entity.Prescription;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.service.PrescriptionService;
import com.example.hospitalmanagementsystem.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserService userService;

    public PrescriptionController(
            PrescriptionService prescriptionService,
            UserService userService) {

        this.prescriptionService = prescriptionService;
        this.userService = userService;
    }


    // =========================================================
    // CREATE PRESCRIPTION
    // =========================================================

    @PostMapping
    public ResponseEntity<Prescription> addPrescription(
            @RequestBody Prescription prescription,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // ADMIN can create any prescription
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            Prescription savedPrescription =
                    prescriptionService.addPrescription(prescription);

            return new ResponseEntity<>(
                    savedPrescription,
                    HttpStatus.CREATED
            );
        }

        // DOCTOR can create prescription only as themselves
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (user.getDoctor() == null ||
                    prescription.getDoctor() == null) {

                return ResponseEntity.status(403).build();
            }

            if (!user.getDoctor().getId()
                    .equals(prescription.getDoctor().getId())) {

                return ResponseEntity.status(403).build();
            }

            Prescription savedPrescription =
                    prescriptionService.addPrescription(prescription);

            return new ResponseEntity<>(
                    savedPrescription,
                    HttpStatus.CREATED
            );
        }

        return ResponseEntity.status(403).build();
    }


    // =========================================================
    // GET ALL PRESCRIPTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions(
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // ADMIN → all prescriptions
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity.ok(
                    prescriptionService.getAllPrescriptions()
            );
        }

        // DOCTOR → only their prescriptions
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (user.getDoctor() == null) {
                return ResponseEntity.status(403).build();
            }

            Long doctorId = user.getDoctor().getId();

            List<Prescription> prescriptions =
                    prescriptionService.getAllPrescriptions()
                            .stream()
                            .filter(prescription ->
                                    prescription.getDoctor() != null &&
                                            prescription.getDoctor()
                                                    .getId()
                                                    .equals(doctorId)
                            )
                            .toList();

            return ResponseEntity.ok(prescriptions);
        }

        // PATIENT → only their prescriptions
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                return ResponseEntity.status(403).build();
            }

            Long patientId = user.getPatient().getId();

            List<Prescription> prescriptions =
                    prescriptionService.getAllPrescriptions()
                            .stream()
                            .filter(prescription ->
                                    prescription.getPatient() != null &&
                                            prescription.getPatient()
                                                    .getId()
                                                    .equals(patientId)
                            )
                            .toList();

            return ResponseEntity.ok(prescriptions);
        }

        return ResponseEntity.status(403).build();
    }


    // =========================================================
    // GET PRESCRIPTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userService.getUserByUsername(authentication.getName());

        Prescription prescription =
                prescriptionService.getPrescriptionById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Prescription not found"
                                ));

        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                throw new RuntimeException(
                        "No patient profile is linked to this account"
                );
            }

            if (prescription.getPatient() == null ||
                    !prescription.getPatient().getId()
                            .equals(user.getPatient().getId())) {

                throw new RuntimeException(
                        "You are not allowed to view this prescription"
                );
            }
        }

        return ResponseEntity.ok(prescription);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Prescription> updatePrescription(
            @PathVariable Long id,
            @RequestBody Prescription prescription,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // ADMIN → can update any prescription
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            Prescription updatedPrescription =
                    prescriptionService.updatePrescription(
                            id,
                            prescription
                    );

            return ResponseEntity.ok(updatedPrescription);
        }

        // DOCTOR → can update only their own prescription
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {

            if (user.getDoctor() == null) {
                return ResponseEntity.status(403).build();
            }

            Long doctorId = user.getDoctor().getId();

            return prescriptionService
                    .getPrescriptionById(id)
                    .filter(existingPrescription ->
                            existingPrescription.getDoctor() != null &&
                                    existingPrescription.getDoctor()
                                            .getId()
                                            .equals(doctorId)
                    )
                    .map(existingPrescription ->
                            ResponseEntity.ok(
                                    prescriptionService
                                            .updatePrescriptionByDoctor(
                                                    id,
                                                    prescription
                                            )
                            )
                    )
                    .orElse(ResponseEntity.status(403).build());
        }

        // PATIENT cannot update
        return ResponseEntity.status(403).build();
    }


    // =========================================================
    // DELETE PRESCRIPTION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePrescription(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // Only ADMIN can delete
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {

            return ResponseEntity.status(403)
                    .body("Only ADMIN can delete prescriptions");
        }

        prescriptionService.deletePrescription(id);

        return ResponseEntity.ok(
                "Prescription deleted successfully"
        );
    }
}