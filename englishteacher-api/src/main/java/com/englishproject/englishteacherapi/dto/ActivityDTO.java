package com.englishproject.englishteacherapi.dto;

import com.englishproject.englishteacherapi.model.Activity;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    
    @NotBlank(message = "Título es obligatorio")
    @Size(min = 3, max = 200, message = "Título debe tener entre 3 y 200 caracteres")
    private String title;
    
    @NotBlank(message = "Descripción es obligatoria")
    @Size(min = 10, max = 1000, message = "Descripción debe tener entre 10 y 1000 caracteres")
    private String description;
    
    @Size(max = 5000, message = "Contenido no puede exceder 5000 caracteres")
    private String content;
    
    @NotNull(message = "Tipo de actividad es obligatorio")
    private Activity.ActivityType type;
    
    @Size(max = 500, message = "URL del archivo no puede exceder 500 caracteres")
    private String resourceFileUrl;  // URL del archivo
    
    @Size(max = 255, message = "Nombre del archivo no puede exceder 255 caracteres")
    private String resourceFileName; // Nombre original del archivo
    
    @NotNull(message = "ID del nivel es obligatorio")
    @Positive(message = "ID del nivel debe ser positivo")
    private Long levelId;
    
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
