package com.example.hospitalmanagementsystem.service;

import com.example.hospitalmanagementsystem.dto.DoctorAccountRequest;
import com.example.hospitalmanagementsystem.dto.RegisterRequest;
import com.example.hospitalmanagementsystem.entity.Doctor;
import com.example.hospitalmanagementsystem.entity.Patient;
import com.example.hospitalmanagementsystem.entity.User;
import com.example.hospitalmanagementsystem.exception.DuplicateUsernameException;
import com.example.hospitalmanagementsystem.exception.InvalidCredentialsException;
import com.example.hospitalmanagementsystem.repository.DoctorRepository;
import com.example.hospitalmanagementsystem.repository.PatientRepository;
import com.example.hospitalmanagementsystem.repository.UserRepository;
import com.example.hospitalmanagementsystem.security.JwtService;
import com.example.hospitalmanagementsystem.exception.InvalidRoleException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register User
    public User register(RegisterRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateUsernameException(
                    "Username already exists"
            );
        }
        if (!"ADMIN".equalsIgnoreCase(request.getRole())
                && !"DOCTOR".equalsIgnoreCase(request.getRole())
                && !"PATIENT".equalsIgnoreCase(request.getRole())) {

            throw new InvalidRoleException(
                    "Invalid role. Allowed roles: ADMIN, DOCTOR, PATIENT"
            );
        }
        if ("ADMIN".equalsIgnoreCase(request.getRole())
                || "DOCTOR".equalsIgnoreCase(request.getRole())) {

            throw new InvalidRoleException(
                    "Public registration is allowed only for PATIENT"
            );
        }

        User user = new User();

        user.setUsername(request.getUsername());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        user.setRole(request.getRole());

        // Connect Patient
        if ("PATIENT".equalsIgnoreCase(request.getRole())) {

            if (request.getPatientId() == null) {
                throw new RuntimeException(
                        "Patient ID is required"
                );
            }

            Patient patient = patientRepository
                    .findById(request.getPatientId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Patient not found"
                            )
                    );

            user.setPatient(patient);
        }

        // Connect Doctor
        if ("DOCTOR".equalsIgnoreCase(request.getRole())) {

            if (request.getDoctorId() == null) {
                throw new RuntimeException(
                        "Doctor ID is required"
                );
            }

            Doctor doctor = doctorRepository
                    .findById(request.getDoctorId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Doctor not found"
                            )
                    );

            user.setDoctor(doctor);
        }

        return userRepository.save(user);
    }

    // Login User
    public String login(
            String username,
            String password) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getPassword()
                );

        if (!passwordMatches) {
            throw new InvalidCredentialsException(
                    "Invalid username or password"
            );
        }

        return jwtService.generateToken(
                user.getUsername(),
                user.getRole()
        );
    }
    public User getUserByUsername(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }
    public User createDoctorAccount(DoctorAccountRequest request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateUsernameException("Username already exists");
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("DOCTOR");
        user.setDoctor(doctor);

        return userRepository.save(user);
    }
}