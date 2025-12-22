package com.englishproject.englishteacherapi.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Rutas públicas de autenticación
                .requestMatchers("/api/auth/login", "/api/auth/check-email", "/api/auth/validate-token").permitAll()

                // Rutas públicas de consulta (solo lectura)
                .requestMatchers("/api/teachers/all", "/api/teachers/{id}").permitAll()
                .requestMatchers("/api/levels", "/api/levels/**").permitAll()
                // Permitir GET de actividades públicamente
                .requestMatchers(HttpMethod.GET, "/api/activities", "/api/activities/{id}", "/api/activities/level/{levelId}").permitAll()
                
                // Rutas de archivos - descarga pública, upload requiere autenticación
                .requestMatchers(HttpMethod.GET, "/api/files/activities/**").permitAll() // Descargar archivos
                .requestMatchers("/uploads/**").permitAll() // Servir archivos estáticos
                
                // Rutas administrativas que requieren JWT
                .requestMatchers("/api/files/upload/**").authenticated() // Upload requiere auth
                .requestMatchers("/api/teachers/create", "/api/teachers/update/**", "/api/teachers/delete/**").authenticated()
                .requestMatchers("/api/teachers/admin/**").authenticated()
                .requestMatchers("/api/levels/create", "/api/levels/update/**", "/api/levels/delete/**").authenticated()
                // Operaciones CUD de actividades requieren autenticación
                .requestMatchers(HttpMethod.POST, "/api/activities").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/activities/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/activities/**").authenticated()

                // H2 Console para desarrollo
                .requestMatchers("/h2-console/**").permitAll()

                .anyRequest().authenticated()
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
                .contentTypeOptions(contentTypeOptions -> {})
            )
            .addFilterBefore(rateLimitingFilter, BasicAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permitir los orígenes configurados en las variables de entorno
        String allowedOrigins = System.getenv("CORS_ORIGINS");
        if (allowedOrigins != null && !allowedOrigins.equals("*")) {
            configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        } else {
            // Fallback para desarrollo - NUNCA usar "*" en producción
            configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "https://*.railway.app"));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight por 1 hora

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
