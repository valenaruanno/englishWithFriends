package com.englishproject.englishteacherapi.dto;

import com.englishproject.englishteacherapi.model.Activity;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    private String title;
    private String description;
    private String content;
    private Activity.ActivityType type;
    private String resourceFileUrl;  // URL del archivo
    private String resourceFileName; // Nombre original del archivo
    private Long levelId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
