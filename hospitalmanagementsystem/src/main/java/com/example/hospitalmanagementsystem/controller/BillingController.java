package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.entity.Billing;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.service.BillingService;
import com.example.hospitalmanagementsystem.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billings")
@CrossOrigin
public class BillingController {

    private final BillingService billingService;
    private final UserService userService;

    public BillingController(BillingService billingService, UserService userService) {
        this.billingService = billingService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Billing> addBilling(
            @RequestBody Billing billing,
            Authentication authentication) {

        User user = userService.getUserByUsername(authentication.getName());

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        Billing savedBilling = billingService.addBilling(billing);

        return new ResponseEntity<>(savedBilling, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Billing>> getAllBillings(
            Authentication authentication) {

        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        // ADMIN can see all billing records
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(
                    billingService.getAllBillings()
            );
        }

        // PATIENT can see only their own billing records
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                return ResponseEntity.status(403).build();
            }

            Long patientId = user.getPatient().getId();

            List<Billing> billings = billingService
                    .getAllBillings()
                    .stream()
                    .filter(billing ->
                            billing.getPatient() != null &&
                                    billing.getPatient().getId().equals(patientId)
                    )
                    .toList();

            return ResponseEntity.ok(billings);
        }

        // DOCTOR is not allowed
        return ResponseEntity.status(403).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Billing> getBillingById(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userService.getUserByUsername(authentication.getName());

        Billing billing = billingService.getBillingById(id)
                .orElseThrow(() ->
                        new RuntimeException("Billing not found"));

        // ADMIN → allowed
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(billing);
        }

        // PATIENT → only own billing
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {

            if (user.getPatient() == null) {
                throw new RuntimeException(
                        "No patient profile is linked to this account"
                );
            }

            if (billing.getPatient() == null ||
                    !billing.getPatient().getId()
                            .equals(user.getPatient().getId())) {

                throw new RuntimeException(
                        "You are not allowed to view this billing"
                );
            }

            return ResponseEntity.ok(billing);
        }

        throw new RuntimeException("Unauthorized role");
    }
    @PutMapping("/{id}")
    public ResponseEntity<Billing> updateBilling(
            @PathVariable Long id,
            @RequestBody Billing billing,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // Only ADMIN can update billing
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).build();
        }

        Billing updatedBilling =
                billingService.updateBilling(id, billing);

        return ResponseEntity.ok(updatedBilling);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBilling(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        // Only ADMIN can delete billing
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403)
                    .body("Only ADMIN can delete billing");
        }

        billingService.deleteBilling(id);

        return ResponseEntity.ok(
                "Billing deleted successfully"
        );
    }
}