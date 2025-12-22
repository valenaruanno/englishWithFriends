package com.englishproject.englishteacherapi.service;

import com.englishproject.englishteacherapi.dto.ActivityDTO;
import com.englishproject.englishteacherapi.model.Activity;
import com.englishproject.englishteacherapi.model.Level;
import com.englishproject.englishteacherapi.repository.ActivityRepository;
import com.englishproject.englishteacherapi.repository.LevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private LevelRepository levelRepository;

    public List<ActivityDTO> getAllActivities() {
        return activityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ActivityDTO> getActivityById(Long id) {
        return activityRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<ActivityDTO> getActivitiesByLevelId(Long levelId) {
        return activityRepository.findActiveActivitiesByLevelId(levelId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ActivityDTO> getActivitiesByType(Activity.ActivityType type) {
        return activityRepository.findByTypeAndIsActiveTrue(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ActivityDTO> getActivitiesByLevelAndType(Long levelId, Activity.ActivityType type) {
        return activityRepository.findByLevelIdAndTypeAndIsActiveTrue(levelId, type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ActivityDTO createActivity(ActivityDTO activityDTO) {
        System.out.println("=== ActivityService.createActivity() ===");
        System.out.println("DTO ResourceFileUrl: " + activityDTO.getResourceFileUrl());
        System.out.println("DTO ResourceFileName: " + activityDTO.getResourceFileName());
        
        Optional<Level> level = levelRepository.findById(activityDTO.getLevelId());
        if (level.isPresent()) {
            Activity activity = convertToEntity(activityDTO);
            activity.setLevel(level.get());
            activity.setCreatedAt(LocalDateTime.now());
            activity.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Entity antes de guardar:");
            System.out.println("Entity ResourceFileUrl: " + activity.getResourceFileUrl());
            System.out.println("Entity ResourceFileName: " + activity.getResourceFileName());
            
            Activity savedActivity = activityRepository.save(activity);
            
            System.out.println("Entity después de guardar:");
            System.out.println("Saved ResourceFileUrl: " + savedActivity.getResourceFileUrl());
            System.out.println("Saved ResourceFileName: " + savedActivity.getResourceFileName());
            
            ActivityDTO result = convertToDTO(savedActivity);
            
            System.out.println("DTO resultado:");
            System.out.println("Result ResourceFileUrl: " + result.getResourceFileUrl());
            System.out.println("Result ResourceFileName: " + result.getResourceFileName());
            System.out.println("=====================================");
            
            return result;
        }
        throw new IllegalArgumentException("Level not found with id: " + activityDTO.getLevelId());
    }

    public Optional<ActivityDTO> updateActivity(Long id, ActivityDTO activityDTO) {
        return activityRepository.findById(id)
                .map(activity -> {
                    updateActivityFromDTO(activity, activityDTO);
                    activity.setUpdatedAt(LocalDateTime.now());
                    Activity savedActivity = activityRepository.save(activity);
                    return convertToDTO(savedActivity);
                });
    }

    public boolean deleteActivity(Long id) {
        if (activityRepository.existsById(id)) {
            activityRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<ActivityDTO> deactivateActivity(Long id) {
        return activityRepository.findById(id)
                .map(activity -> {
                    activity.setIsActive(false);
                    activity.setUpdatedAt(LocalDateTime.now());
                    Activity savedActivity = activityRepository.save(activity);
                    return convertToDTO(savedActivity);
                });
    }

    private ActivityDTO convertToDTO(Activity activity) {
        return new ActivityDTO(
                activity.getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getContent(),
                activity.getType(),
                activity.getResourceFileUrl(),
                activity.getResourceFileName(),
                activity.getLevel().getId(),
                activity.getIsActive(),
                activity.getCreatedAt(),
                activity.getUpdatedAt()
        );
    }

    private Activity convertToEntity(ActivityDTO activityDTO) {
        Activity activity = new Activity();
        updateActivityFromDTO(activity, activityDTO);
        return activity;
    }

    private void updateActivityFromDTO(Activity activity, ActivityDTO activityDTO) {
        activity.setTitle(activityDTO.getTitle());
        activity.setDescription(activityDTO.getDescription());
        activity.setContent(activityDTO.getContent());
        activity.setType(activityDTO.getType());
        activity.setResourceFileUrl(activityDTO.getResourceFileUrl());
        activity.setResourceFileName(activityDTO.getResourceFileName());
        // Asegurar que isActive nunca sea null
        activity.setIsActive(activityDTO.getIsActive() != null ? activityDTO.getIsActive() : true);
    }
}
