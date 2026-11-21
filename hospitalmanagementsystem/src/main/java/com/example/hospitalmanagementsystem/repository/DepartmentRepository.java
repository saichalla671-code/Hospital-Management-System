package com.example.hospitalmanagementsystem.repository;

import com.example.hospitalmanagementsystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
