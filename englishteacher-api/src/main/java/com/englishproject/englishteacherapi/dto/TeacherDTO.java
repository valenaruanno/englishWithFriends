package com.englishproject.englishteacherapi.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDTO {
    private Long id;
    
    @NotBlank(message = "Nombre es obligatorio")
    @Size(min = 2, max = 50, message = "Nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Nombre solo puede contener letras y espacios")
    private String name;
    
    @NotBlank(message = "Apellido es obligatorio")
    @Size(min = 2, max = 50, message = "Apellido debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "Apellido solo puede contener letras y espacios")
    private String lastName;
    
    @Size(max = 1000, message = "Descripción no puede exceder 1000 caracteres")
    private String description;
    
    @NotBlank(message = "Email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 100, message = "Email no puede exceder 100 caracteres")
    private String email;
    
    @Pattern(regexp = "^[\\+]?[1-9]?[0-9]{7,15}$", message = "Formato de teléfono inválido")
    private String phone;
    
    @Size(max = 500, message = "URL de imagen no puede exceder 500 caracteres")
    private String profileImageUrl;
    
    @Min(value = 0, message = "Años de experiencia no puede ser negativo")
    @Max(value = 50, message = "Años de experiencia no puede exceder 50")
    private Integer yearsOfExperience;
    
    @Size(max = 2000, message = "Cualificaciones no pueden exceder 2000 caracteres")
    private String qualifications;
    
    @Size(max = 1000, message = "Especialidades no pueden exceder 1000 caracteres")
    private String specialties;
    
    @Size(min = 6, max = 100, message = "Password debe tener entre 6 y 100 caracteres")
    private String password; // Solo para creación/actualización, no se devuelve en respuestas
}
