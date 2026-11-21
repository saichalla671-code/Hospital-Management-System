package com.example.hospitalmanagementsystem.config;

import com.example.hospitalmanagementsystem.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())


                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public
                                .requestMatchers(
                                        "/api/users/register",
                                        "/api/users/login",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/v3/api-docs/**"
                                ).permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/users/create-doctor")
                                .hasRole("ADMIN")

                        // Patients
                        .requestMatchers("/api/patients/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "PATIENT")

                        // Doctors//
                                .requestMatchers(HttpMethod.GET, "/api/doctors/**")
                                .hasAnyRole("ADMIN", "DOCTOR", "PATIENT")

                        // Departments
                        .requestMatchers(
                                "/api/departments/**"
                        )
                        .hasRole("ADMIN")

                        // Appointments
//                        .requestMatchers(
//                                "/api/appointments/**"
//                        )
//                        .hasAnyRole(
//                                "ADMIN",
//                                "DOCTOR",
//                                "PATIENT"
//                        )
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "PATIENT")

                        .requestMatchers(HttpMethod.POST, "/api/appointments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "PATIENT")

                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "PATIENT")

                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                        .hasRole("ADMIN")

                        // Prescriptions
                                .requestMatchers(HttpMethod.GET, "/api/prescriptions/**")
                                .hasAnyRole("ADMIN", "DOCTOR", "PATIENT")

                                .requestMatchers(HttpMethod.POST, "/api/prescriptions/**")
                                .hasAnyRole("ADMIN", "DOCTOR")

                                .requestMatchers(HttpMethod.PUT, "/api/prescriptions/**")
                                .hasAnyRole("ADMIN", "DOCTOR")

                                .requestMatchers(HttpMethod.DELETE, "/api/prescriptions/**")
                                .hasRole("ADMIN")
                        // Billing
                                .requestMatchers(HttpMethod.GET, "/api/billings/**")
                                .hasAnyRole("ADMIN", "PATIENT")

                                .requestMatchers(HttpMethod.POST, "/api/billings/**")
                                .hasRole("ADMIN")

                                .requestMatchers(HttpMethod.PUT, "/api/billings/**")
                                .hasRole("ADMIN")

                                .requestMatchers(HttpMethod.DELETE, "/api/billings/**")
                                .hasRole("ADMIN")


                                // Other APIs
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}