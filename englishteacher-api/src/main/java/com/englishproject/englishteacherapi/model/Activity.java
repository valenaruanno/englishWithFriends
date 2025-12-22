package com.englishproject.englishteacherapi.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 5000)
    private String content; // Contenido de la actividad

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type; // READING, WRITING, LISTENING, SPEAKING, GRAMMAR, VOCABULARY

    @Column
    private String resourceFileUrl; // URL a archivos multimedia, documentos, etc.

    @Column
    private String resourceFileName; // Nombre original del archivo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_id", nullable = false)
    private Level level;

    @Column
    private Boolean isActive = true;

    @Column
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum ActivityType {
        READING,
        WRITING,
        LISTENING,
        SPEAKING,
        GRAMMAR,
        VOCABULARY,
        EXERCISE,
        GAME
    }
}
