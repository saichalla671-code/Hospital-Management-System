package com.example.hospitalmanagementsystem.dto;

public class UserResponse {

    private Long id;
    private String username;
    private String role;
    private Long patientId;
    private Long doctorId;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String username,
            String role,
            Long patientId,
            Long doctorId) {

        this.id = id;
        this.username = username;
        this.role = role;
        this.patientId = patientId;
        this.doctorId = doctorId;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public Long getPatientId() {
        return patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }
}