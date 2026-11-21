package com.example.hospitalmanagementsystem.repository;

import com.example.hospitalmanagementsystem.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {
}