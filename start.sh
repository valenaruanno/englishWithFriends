#!/bin/bash
cd englishteacher-api
chmod +x mvnw
./mvnw clean package -DskipTests
java -jar target/englishteacher-api-0.0.1-SNAPSHOT.jar