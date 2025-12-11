#!/bin/bash
cd englishteacher-api
chmod +x mvnw
./mvnw clean package -DskipTests -Dmaven.compiler.release=21
java -Dserver.port=${PORT:-8080} -jar target/englishteacher-api-0.0.1-SNAPSHOT.jar