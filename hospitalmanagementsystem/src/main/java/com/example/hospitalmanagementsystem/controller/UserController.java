package com.example.hospitalmanagementsystem.controller;

import com.example.hospitalmanagementsystem.dto.DoctorAccountRequest;
import com.example.hospitalmanagementsystem.dto.LoginRequest;
import com.example.hospitalmanagementsystem.dto.RegisterRequest;
import com.example.hospitalmanagementsystem.dto.UserResponse;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.service.UserService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Register User
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User savedUser = userService.register(request);

        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getPatient() != null
                        ? savedUser.getPatient().getId()
                        : null,
                savedUser.getDoctor() != null
                        ? savedUser.getDoctor().getId()
                        : null
        );

        return ResponseEntity.ok(response);
    }
    @PostMapping("/create-doctor")
    public ResponseEntity<UserResponse> createDoctorAccount(
            @Valid @RequestBody DoctorAccountRequest request) {

        User savedUser = userService.createDoctorAccount(request);

        UserResponse response = new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getPatient() != null
                        ? savedUser.getPatient().getId()
                        : null,
                savedUser.getDoctor() != null
                        ? savedUser.getDoctor().getId()
                        : null
        );

        return ResponseEntity.ok(response);
    }

    // Login User
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest request) {

        String token =
                userService.login(
                        request.getUsername(),
                        request.getPassword()
                );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "message",
                "Login successful"
        );

        response.put(
                "token",
                token
        );

        return ResponseEntity.ok(response);
    }
}