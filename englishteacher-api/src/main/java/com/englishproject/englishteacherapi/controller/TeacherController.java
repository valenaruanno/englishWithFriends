package com.englishproject.englishteacherapi.controller;

import com.englishproject.englishteacherapi.dto.TeacherDTO;
import com.englishproject.englishteacherapi.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    // Endpoint público para obtener todos los teachers
    @GetMapping("/all")
    public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
        List<TeacherDTO> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    // Endpoint público para obtener un teacher por ID
    @GetMapping("/{id}")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable @Positive(message = "ID debe ser positivo") Long id) {
        return teacherService.getTeacherById(id)
                .map(teacher -> ResponseEntity.ok(teacher))
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint administrativo protegido para crear un teacher
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createTeacher(@Valid @RequestBody TeacherDTO teacherDTO, 
                                                             BindingResult result) {
        Map<String, Object> response = new HashMap<>();

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
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String authenticatedEmail = auth.getName();

            TeacherDTO createdTeacher = teacherService.createTeacher(teacherDTO);

            response.put("success", true);
            response.put("message", "Profesor creado exitosamente");
            response.put("teacher", createdTeacher);
            response.put("created_by", authenticatedEmail);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear profesor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint administrativo protegido para actualizar un teacher
    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateTeacher(@PathVariable Long id, @RequestBody TeacherDTO teacherDTO) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String authenticatedEmail = auth.getName();

            return teacherService.updateTeacher(id, teacherDTO)
                .map(teacher -> {
                    response.put("success", true);
                    response.put("message", "Profesor actualizado exitosamente");
                    response.put("teacher", teacher);
                    response.put("updated_by", authenticatedEmail);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    response.put("success", false);
                    response.put("message", "Profesor no encontrado");
                    return ResponseEntity.notFound().build();
                });
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar profesor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint administrativo protegido para eliminar un teacher
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteTeacher(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String authenticatedEmail = auth.getName();

            if (teacherService.deleteTeacher(id)) {
                response.put("success", true);
                response.put("message", "Profesor eliminado exitosamente");
                response.put("deleted_by", authenticatedEmail);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Profesor no encontrado");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar profesor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint administrativo para obtener información del admin autenticado
    @GetMapping("/admin/profile")
    public ResponseEntity<Map<String, Object>> getAdminProfile() {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String authenticatedEmail = auth.getName();

            response.put("success", true);
            response.put("email", authenticatedEmail);
            response.put("message", "Perfil de administrador obtenido exitosamente");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener perfil de administrador");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
