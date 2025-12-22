package com.englishproject.englishteacherapi.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {
    
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    private static final java.util.regex.Pattern SAFE_FILENAME_PATTERN = java.util.regex.Pattern.compile("^[a-zA-Z0-9._-]+$");
    private static final int MAX_FILENAME_LENGTH = 100;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    /**
     * Valida que el nombre de archivo sea seguro y esté dentro del directorio permitido
     */
    private boolean isSecureFilePath(String fileName, String subdirectory) {
        try {
            // Validar que el nombre de archivo no esté vacío
            if (fileName == null || fileName.trim().isEmpty()) {
                logger.warn("Intento de acceso con nombre de archivo vacío");
                return false;
            }
            
            // Validar longitud
            if (fileName.length() > MAX_FILENAME_LENGTH) {
                logger.warn("Intento de acceso con nombre de archivo demasiado largo: {}", fileName);
                return false;
            }
            
            // Validar caracteres permitidos (solo alfanuméricos, puntos, guiones y guiones bajos)
            if (!SAFE_FILENAME_PATTERN.matcher(fileName).matches()) {
                logger.warn("Intento de acceso con caracteres no permitidos en el nombre: {}", fileName);
                return false;
            }
            
            // Validar que no contenga secuencias peligrosas
            String normalizedName = fileName.toLowerCase();
            if (normalizedName.contains("..") || normalizedName.contains("/") || 
                normalizedName.contains("\\") || normalizedName.contains(":")) {
                logger.warn("Intento de path traversal detectado: {}", fileName);
                return false;
            }
            
            // Construir y validar el path completo
            Path basePath = Paths.get(uploadDir, subdirectory).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(fileName).normalize();
            
            // Verificar que el archivo resuelto esté dentro del directorio permitido
            if (!filePath.startsWith(basePath)) {
                logger.warn("Intento de acceso fuera del directorio permitido: {} -> {}", fileName, filePath);
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            logger.error("Error validando path de archivo: {}", fileName, e);
            return false;
        }
    }

    @PostMapping("/upload/activity")
    public ResponseEntity<Map<String, Object>> uploadActivityFile(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Archivo vacío");
                return ResponseEntity.badRequest().body(response);
            }

            // Validar tipo de archivo
            String contentType = file.getContentType();
            if (!isValidFileType(contentType)) {
                response.put("success", false);
                response.put("message", "Tipo de archivo no permitido. Solo se permiten: jpg, jpeg, png, webp, pdf, mp3, mp4, doc, docx");
                return ResponseEntity.badRequest().body(response);
            }

            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir + "/activities");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generar nombre único para el archivo
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Guardar archivo
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Respuesta exitosa
            response.put("success", true);
            response.put("message", "Archivo subido exitosamente");
            response.put("fileName", uniqueFileName);
            response.put("originalName", originalFileName);
            response.put("filePath", "activities/" + uniqueFileName);
            response.put("fileUrl", "/api/files/activities/" + uniqueFileName);
            response.put("fileSize", file.getSize());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Error al subir archivo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/activities/{fileName}")
    public ResponseEntity<Resource> downloadActivityFile(
            @PathVariable 
            @Pattern(regexp = "^[a-zA-Z0-9._-]{1,100}$", message = "Nombre de archivo inválido")
            String fileName) {
        
        try {
            // Validación de seguridad
            if (!isSecureFilePath(fileName, "activities")) {
                logger.warn("Intento de acceso no autorizado al archivo: {}", fileName);
                return ResponseEntity.badRequest().build();
            }
            
            // Construir path seguro
            Path basePath = Paths.get(uploadDir, "activities").toAbsolutePath().normalize();
            Path filePath = basePath.resolve(fileName).normalize();
            
            // Verificación adicional de seguridad
            if (!filePath.startsWith(basePath)) {
                logger.error("Path traversal bloqueado: {}", filePath);
                return ResponseEntity.badRequest().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determinar el tipo de contenido
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                // Sanitizar el nombre del archivo para la respuesta
                String safeFileName = StringUtils.cleanPath(resource.getFilename());

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeFileName + "\"")
                        .body(resource);
            } else {
                logger.info("Archivo no encontrado o no legible: {}", fileName);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            logger.error("URL malformada para archivo: {}", fileName, e);
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            logger.error("Error de E/O accediendo al archivo: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            logger.error("Error inesperado accediendo al archivo: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/activities/{fileName}")
    public ResponseEntity<Map<String, Object>> deleteActivityFile(
            @PathVariable 
            @Pattern(regexp = "^[a-zA-Z0-9._-]{1,100}$", message = "Nombre de archivo inválido")
            String fileName) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validación de seguridad
            if (!isSecureFilePath(fileName, "activities")) {
                logger.warn("Intento de eliminación no autorizada del archivo: {}", fileName);
                response.put("success", false);
                response.put("message", "Nombre de archivo inválido o no permitido");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Construir path seguro
            Path basePath = Paths.get(uploadDir, "activities").toAbsolutePath().normalize();
            Path filePath = basePath.resolve(fileName).normalize();
            
            // Verificación adicional de seguridad
            if (!filePath.startsWith(basePath)) {
                logger.error("Intento de path traversal en eliminación bloqueado: {}", filePath);
                response.put("success", false);
                response.put("message", "Acceso denegado");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Archivo eliminado exitosamente: {}", fileName);
                response.put("success", true);
                response.put("message", "Archivo eliminado exitosamente");
                return ResponseEntity.ok(response);
            } else {
                logger.info("Intento de eliminar archivo inexistente: {}", fileName);
                response.put("success", false);
                response.put("message", "Archivo no encontrado");
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            logger.error("Error eliminando archivo: {}", fileName, e);
            response.put("success", false);
            response.put("message", "Error al eliminar archivo");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            logger.error("Error inesperado eliminando archivo: {}", fileName, e);
            response.put("success", false);
            response.put("message", "Error interno del servidor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private boolean isValidFileType(String contentType) {
        if (contentType == null) return false;
        
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/webp") ||
               contentType.equals("application/pdf") ||
               contentType.equals("audio/mpeg") ||
               contentType.equals("audio/mp3") ||
               contentType.equals("video/mp4") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }
}