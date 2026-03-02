 # ========================================
# ETAPA 1: Build (Construcción)
# ========================================
FROM eclipse-temurin:21-jdk-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dar permisos de ejecución al Maven wrapper
RUN chmod +x mvnw

# Descargar dependencias (esto se cachea si el pom.xml no cambia)
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente
COPY src src

# Compilar la aplicación (sin ejecutar tests para agilizar)
RUN ./mvnw clean package -DskipTests

# ========================================
# ETAPA 2: Runtime (Ejecución)
# ========================================
FROM eclipse-temurin:21-jre-alpine

# Instalar curl para healthchecks
RUN apk add --no-cache curl

# Crear usuario no-root para ejecutar la aplicación (seguridad)
RUN addgroup -S spring && adduser -S spring -G spring

# Establecer directorio de trabajo
WORKDIR /app

# Crear directorio para uploads
RUN mkdir -p /app/uploads/activities && \
    chown -R spring:spring /app

# Copiar el JAR compilado desde la etapa de build
COPY --from=builder /app/target/*.jar app.jar

# Cambiar al usuario spring
USER spring

# Exponer el puerto 8080
EXPOSE 8080

# Healthcheck para verificar que la aplicación está corriendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Variables de entorno por defecto (pueden ser sobrescritas)
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xmx512m -Xms256m"

# Comando para ejecutar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

