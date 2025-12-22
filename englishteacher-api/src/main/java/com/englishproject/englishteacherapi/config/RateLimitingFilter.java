package com.englishproject.englishteacherapi.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);
    
    // Configuración de límites realista para una profesora de inglés
    private static final int LOGIN_MAX_REQUESTS = 10;       // 10 intentos por minuto (más permisivo)
    private static final int API_MAX_REQUESTS = 200;        // 200 requests por minuto (generoso)
    private static final int FILE_MAX_REQUESTS = 50;        // 50 descargas por minuto (suficiente)
    private static final long WINDOW_SIZE_MINUTES = 1;      // Ventana de 1 minuto
    
    // Almacenamiento de contadores por IP y endpoint
    private final Map<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newScheduledThreadPool(1);
    
    public RateLimitingFilter() {
        // Limpiar contadores expirados cada 2 minutos
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredCounters, 2, 2, TimeUnit.MINUTES);
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String clientIP = getClientIP(httpRequest);
        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        
        // Determinar límite según el endpoint
        int maxRequests = getMaxRequestsForEndpoint(requestURI, method);
        
        if (maxRequests > 0) { // Solo aplicar rate limiting a endpoints configurados
            String key = clientIP + ":" + getEndpointCategory(requestURI, method);
            
            if (isRateLimited(key, maxRequests)) {
                logger.warn("Rate limit excedido para IP: {} en endpoint: {} {}", clientIP, method, requestURI);
                handleRateLimitExceeded(httpResponse, clientIP, requestURI);
                return;
            }
        }
        
        chain.doFilter(request, response);
    }
    
    private String getClientIP(HttpServletRequest request) {
        // Obtener IP real considerando proxies
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
    
    private int getMaxRequestsForEndpoint(String uri, String method) {
        // Endpoints de autenticación - MUY restrictivo
        if (uri.startsWith("/api/auth/login") || 
            uri.startsWith("/api/auth/validate-token")) {
            return LOGIN_MAX_REQUESTS;
        }
        
        // Endpoints de archivos - Moderadamente restrictivo
        if (uri.startsWith("/api/files/")) {
            return FILE_MAX_REQUESTS;
        }
        
        // Endpoints administrativos - Restrictivo
        if (uri.contains("/create") || uri.contains("/update") || 
            uri.contains("/delete") || uri.contains("/admin")) {
            return LOGIN_MAX_REQUESTS * 2; // 10 requests por minuto
        }
        
        // APIs públicas de lectura - Menos restrictivo
        if (uri.startsWith("/api/") && method.equals("GET")) {
            return API_MAX_REQUESTS;
        }
        
        // Otros endpoints de API
        if (uri.startsWith("/api/")) {
            return API_MAX_REQUESTS / 2; // 50 requests por minuto
        }
        
        // No aplicar rate limiting a otros endpoints
        return -1;
    }
    
    private String getEndpointCategory(String uri, String method) {
        if (uri.startsWith("/api/auth/")) return "auth";
        if (uri.startsWith("/api/files/")) return "files";
        if (uri.contains("/create") || uri.contains("/update") || uri.contains("/delete")) return "admin";
        if (method.equals("GET")) return "read";
        return "api";
    }
    
    private boolean isRateLimited(String key, int maxRequests) {
        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - (WINDOW_SIZE_MINUTES * 60 * 1000);
        
        RequestCounter counter = requestCounters.compute(key, (k, v) -> {
            if (v == null) {
                v = new RequestCounter();
            }
            
            // Limpiar requests fuera de la ventana
            v.requests.removeIf(timestamp -> timestamp < windowStart);
            
            // Agregar request actual
            v.requests.add(currentTime);
            v.lastAccess = currentTime;
            
            return v;
        });
        
        boolean isLimited = counter.requests.size() > maxRequests;
        
        if (isLimited) {
            logger.info("Rate limiting aplicado para clave: {} ({} requests en ventana de {} min)", 
                       key, counter.requests.size(), WINDOW_SIZE_MINUTES);
        }
        
        return isLimited;
    }
    
    private void handleRateLimitExceeded(HttpServletResponse response, String clientIP, String uri) 
            throws IOException {
        
        response.setStatus(429); // Too Many Requests
        response.setContentType("application/json");
        response.setHeader("Retry-After", String.valueOf(WINDOW_SIZE_MINUTES * 60)); // Segundos
        response.setHeader("X-RateLimit-Limit", "Varies by endpoint");
        response.setHeader("X-RateLimit-Window", WINDOW_SIZE_MINUTES + " minutes");
        
        String jsonResponse = String.format(
            "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please try again later.\",\"retryAfter\":%d}",
            WINDOW_SIZE_MINUTES * 60
        );
        
        response.getWriter().write(jsonResponse);
        
        // Log de seguridad para monitoreo
        logger.warn("SECURITY: Rate limit exceeded - IP: {}, Endpoint: {}, Time: {}", 
                   clientIP, uri, System.currentTimeMillis());
    }
    
    private void cleanupExpiredCounters() {
        long currentTime = System.currentTimeMillis();
        long cleanupThreshold = currentTime - (WINDOW_SIZE_MINUTES * 60 * 1000 * 2); // 2 ventanas
        
        requestCounters.entrySet().removeIf(entry -> entry.getValue().lastAccess < cleanupThreshold);
        
        logger.debug("Cleanup de rate limiting completado. Contadores activos: {}", requestCounters.size());
    }
    
    @Override
    public void destroy() {
        cleanupExecutor.shutdown();
        try {
            if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                cleanupExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    // Clase interna para almacenar contadores de requests
    private static class RequestCounter {
        final java.util.List<Long> requests = new java.util.concurrent.CopyOnWriteArrayList<>();
        volatile long lastAccess = System.currentTimeMillis();
    }
}