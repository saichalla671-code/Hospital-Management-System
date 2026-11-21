package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.service.DoctorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // Add Doctor
    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor doctor) {

        Doctor savedDoctor = doctorService.addDoctor(doctor);

        return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED);
    }

    // Get All Doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {

        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // Get Doctor By ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {

        Optional<Doctor> doctor = doctorService.getDoctorById(id);

        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        }

        return ResponseEntity.notFound().build();
    }

    // Update Doctor
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(
            @PathVariable Long id,
            @RequestBody Doctor doctor) {

        Doctor updatedDoctor = doctorService.updateDoctor(id, doctor);

        return ResponseEntity.ok(updatedDoctor);
    }

    // Delete Doctor
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {

        doctorService.deleteDoctor(id);

        return ResponseEntity.ok("Doctor deleted successfully");
    }
}
