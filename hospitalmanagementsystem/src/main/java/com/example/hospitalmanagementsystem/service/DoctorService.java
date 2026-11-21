package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // Add Doctor
    public Doctor addDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    // Get All Doctors
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    // Get Doctor By ID
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    // Update Doctor
    public Doctor updateDoctor(Long id, Doctor doctor) {

        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found with id: " + id));

        existingDoctor.setName(doctor.getName());
        existingDoctor.setSpecialization(doctor.getSpecialization());
        existingDoctor.setPhone(doctor.getPhone());
        existingDoctor.setEmail(doctor.getEmail());
        existingDoctor.setAddress(doctor.getAddress());
        existingDoctor.setQualification(doctor.getQualification());
        existingDoctor.setExperience(doctor.getExperience());

        return doctorRepository.save(existingDoctor);
    }

    // Delete Doctor
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}