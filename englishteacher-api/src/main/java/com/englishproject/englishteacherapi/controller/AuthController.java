package com.englishproject.englishteacherapi.controller;

import com.englishproject.englishteacherapi.dto.LoginDTO;
import com.englishproject.englishteacherapi.dto.TeacherDTO;
import com.englishproject.englishteacherapi.model.Teacher;
import com.englishproject.englishteacherapi.service.AuthService;
import com.englishproject.englishteacherapi.service.TokenServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private TokenServices tokenServices;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginDTO loginDTO, 
                                                      BindingResult result) {
        Map<String, Object> response = new HashMap<>();
        final int EXPIRATION_TIME = 1800; // 30 minutos en segundos

        // Validar errores de entrada
        if (result.hasErrors()) {
            response.put("success", false);
            response.put("message", "Datos de entrada inválidos");
            response.put("errors", result.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .toList());
            return ResponseEntity.badRequest().body(response);
        }

        try {
            Optional<Teacher> authenticatedTeacher = authService.authenticateTeacher(
                loginDTO.getEmail(),
                loginDTO.getPassword()
            );

            if (authenticatedTeacher.isPresent()) {
                Teacher teacher = authenticatedTeacher.get();
                String token = tokenServices.generateToken(teacher.getEmail(), EXPIRATION_TIME);
                // Convertir a DTO sin incluir la contraseña
                TeacherDTO teacherDTO = new TeacherDTO(
                    teacher.getId(),
                    teacher.getName(),
                    teacher.getLastName(),
                    teacher.getDescription(),
                    teacher.getEmail(),
                    teacher.getPhone(),
                    teacher.getProfileImageUrl(),
                    teacher.getYearsOfExperience(),
                    teacher.getQualifications(),
                    teacher.getSpecialties(),
                    null
                );

                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("teacher", teacherDTO);
                response.put("token", token);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Credenciales inválidas");

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno del servidor");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = request.get("email");
            boolean exists = authService.teacherExists(email);

            response.put("exists", exists);
            response.put("message", exists ? "Email ya registrado" : "Email disponible");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String token = request.get("token");

            if (token == null || token.trim().isEmpty()) {
                response.put("valid", false);
                response.put("message", "Token no proporcionado");
                return ResponseEntity.badRequest().body(response);
            }

            boolean isValid = tokenServices.validateToken(token);

            if (isValid) {
                String email = tokenServices.extractEmail(token);
                response.put("valid", true);
                response.put("email", email);
                response.put("message", "Token válido");
            } else {
                response.put("valid", false);
                response.put("message", "Token inválido o expirado");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", "Error al validar token");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
