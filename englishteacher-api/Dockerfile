FROM openjdk:21-jdk-slim

# Instalar PostgreSQL client para conexiones
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar pom.xml y descargar dependencias
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src ./src

# Construir aplicación
RUN ./mvnw clean package -DskipTests

# Ejecutar aplicación
EXPOSE 8080
CMD ["java", "-jar", "target/englishteacher-api-0.0.1-SNAPSHOT.jar"]