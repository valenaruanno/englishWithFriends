package com.englishproject.englishteacherapi.service;

import com.englishproject.englishteacherapi.dto.LevelDTO;
import com.englishproject.englishteacherapi.model.Level;
import com.englishproject.englishteacherapi.repository.LevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LevelService {

    @Autowired
    private LevelRepository levelRepository;

    public List<LevelDTO> getAllLevels() {
        return levelRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<LevelDTO> getLevelById(Long id) {
        return levelRepository.findById(id)
                .map(this::convertToDTO);
    }

    public Optional<LevelDTO> getLevelByName(String name) {
        return levelRepository.findByName(name)
                .map(this::convertToDTO);
    }

    public LevelDTO createLevel(LevelDTO levelDTO) {
        Level level = convertToEntity(levelDTO);
        Level savedLevel = levelRepository.save(level);
        return convertToDTO(savedLevel);
    }

    public Optional<LevelDTO> updateLevel(Long id, LevelDTO levelDTO) {
        return levelRepository.findById(id)
                .map(level -> {
                    updateLevelFromDTO(level, levelDTO);
                    Level savedLevel = levelRepository.save(level);
                    return convertToDTO(savedLevel);
                });
    }

    public boolean deleteLevel(Long id) {
        if (levelRepository.existsById(id)) {
            levelRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private LevelDTO convertToDTO(Level level) {
        Long activitiesCount = level.getActivities() != null ?
            level.getActivities().stream()
                .filter(activity -> Boolean.TRUE.equals(activity.getIsActive()))
                .count() : 0L;

        return new LevelDTO(
                level.getId(),
                level.getName(),
                level.getDescription(),
                activitiesCount
        );
    }

    private Level convertToEntity(LevelDTO levelDTO) {
        Level level = new Level();
        updateLevelFromDTO(level, levelDTO);
        return level;
    }

    private void updateLevelFromDTO(Level level, LevelDTO levelDTO) {
        level.setName(levelDTO.getName());
        level.setDescription(levelDTO.getDescription());
    }
}
