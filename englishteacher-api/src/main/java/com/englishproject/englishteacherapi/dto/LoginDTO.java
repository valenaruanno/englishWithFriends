package com.englishproject.englishteacherapi.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDTO {
    @NotBlank(message = "Email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Size(max = 100, message = "Email no puede exceder 100 caracteres")
    private String email;
    
    @NotBlank(message = "Password es obligatorio")
    @Size(min = 6, max = 100, message = "Password debe tener entre 6 y 100 caracteres")
    private String password;
}
