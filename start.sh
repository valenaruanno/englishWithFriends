#!/bin/bash
chmod +x mvnw
./mvnw clean package -DskipTests -Dmaven.compiler.release=21 -f englishteacher-api/pom.xml
java -Dserver.port=${PORT:-8080} -jar englishteacher-api/target/englishteacher-api-0.0.1-SNAPSHOT.jar