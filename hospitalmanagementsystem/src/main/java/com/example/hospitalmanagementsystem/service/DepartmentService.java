package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.entity.Department;
import com.example.hospitalmanagementsystem.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public Department addDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Department updateDepartment(Long id, Department department) {

        Department existing = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        existing.setName(department.getName());
        existing.setDescription(department.getDescription());

        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}
