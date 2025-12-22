package com.englishproject.englishteacherapi.controller;

import com.englishproject.englishteacherapi.dto.ActivityDTO;
import com.englishproject.englishteacherapi.model.Activity;
import com.englishproject.englishteacherapi.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityDTO>> getAllActivities() {
        List<ActivityDTO> activities = activityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivityById(@PathVariable @Positive(message = "ID debe ser positivo") Long id) {
        return activityService.getActivityById(id)
                .map(activity -> ResponseEntity.ok(activity))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/level/{levelId}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByLevelId(@PathVariable @Positive(message = "ID del nivel debe ser positivo") Long levelId) {
        List<ActivityDTO> activities = activityService.getActivitiesByLevelId(levelId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByType(@PathVariable Activity.ActivityType type) {
        List<ActivityDTO> activities = activityService.getActivitiesByType(type);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/level/{levelId}/type/{type}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByLevelAndType(
            @PathVariable Long levelId,
            @PathVariable Activity.ActivityType type) {
        List<ActivityDTO> activities = activityService.getActivitiesByLevelAndType(levelId, type);
        return ResponseEntity.ok(activities);
    }

    @PostMapping
    public ResponseEntity<Object> createActivity(@Valid @RequestBody ActivityDTO activityDTO, 
                                                  BindingResult result) {
        if (result.hasErrors()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Datos de entrada inválidos");
            response.put("errors", result.getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .toList());
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            ActivityDTO createdActivity = activityService.createActivity(activityDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdActivity);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> updateActivity(@PathVariable Long id, @RequestBody ActivityDTO activityDTO) {
        return activityService.updateActivity(id, activityDTO)
                .map(activity -> ResponseEntity.ok(activity))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ActivityDTO> deactivateActivity(@PathVariable Long id) {
        return activityService.deactivateActivity(id)
                .map(activity -> ResponseEntity.ok(activity))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        if (activityService.deleteActivity(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
