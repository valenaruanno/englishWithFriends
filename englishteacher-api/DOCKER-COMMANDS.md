# 🐳 GUÍA DE COMANDOS DOCKER - English Teacher API

## 📋 REQUISITOS PREVIOS
- Docker Desktop debe estar corriendo
- Tener el archivo .env configurado

---

## 🚀 COMANDOS PRINCIPALES

### 1️⃣ Construir y levantar contenedores (primera vez)
```powershell
docker-compose up --build -d
```
- `--build`: Construye las imágenes desde cero
- `-d`: Modo detached (corre en segundo plano)

### 2️⃣ Levantar contenedores (después de la primera vez)
```powershell
docker-compose up -d
```

### 3️⃣ Detener contenedores
```powershell
docker-compose down
```

### 4️⃣ Detener y eliminar volúmenes (⚠️ ELIMINA DATOS)
```powershell
docker-compose down -v
```

### 5️⃣ Ver logs de todos los servicios
```powershell
docker-compose logs -f
```

### 6️⃣ Ver logs solo de la API
```powershell
docker-compose logs -f api
```

### 7️⃣ Ver logs solo de PostgreSQL
```powershell
docker-compose logs -f postgres
```

### 8️⃣ Reiniciar un servicio específico
```powershell
docker-compose restart api
docker-compose restart postgres
```

### 9️⃣ Reconstruir solo la API (después de cambios en código)
```powershell
docker-compose up --build api -d
```

### 🔟 Ver estado de los contenedores
```powershell
docker-compose ps
```

---

## 🔧 COMANDOS DE DEPURACIÓN

### Ver todos los contenedores corriendo
```powershell
docker ps
```

### Ver todos los contenedores (incluso detenidos)
```powershell
docker ps -a
```

### Entrar al contenedor de la API (shell interactivo)
```powershell
docker exec -it englishteacher-api sh
```

### Entrar al contenedor de PostgreSQL
```powershell
docker exec -it englishteacher-postgres psql -U englishteacher -d englishteacher_db
```

### Ver uso de recursos
```powershell
docker stats
```

### Limpiar imágenes no utilizadas
```powershell
docker system prune -a
```

---

## 📊 COMANDOS ÚTILES PARA BASE DE DATOS

### Hacer backup de la base de datos
```powershell
docker exec englishteacher-postgres pg_dump -U englishteacher englishteacher_db > backup.sql
```

### Restaurar backup
```powershell
Get-Content backup.sql | docker exec -i englishteacher-postgres psql -U englishteacher -d englishteacher_db
```

### Ver tablas en la base de datos
```powershell
docker exec -it englishteacher-postgres psql -U englishteacher -d englishteacher_db -c "\dt"
```

---

## 🌐 URLS IMPORTANTES

- **API Backend**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health
- **PostgreSQL**: localhost:5432

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: Docker Desktop no está corriendo
**Solución**: Inicia Docker Desktop manualmente o usa:
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Problema: Puerto 8080 ya está en uso
**Solución**: Cambia `API_PORT` en el archivo `.env` a otro puerto (ej: 8081)

### Problema: Puerto 5432 ya está en uso
**Solución**: Cambia `DB_PORT` en el archivo `.env` a otro puerto (ej: 5433)

### Problema: Cambios en código no se reflejan
**Solución**: Reconstruye la imagen:
```powershell
docker-compose up --build api -d
```

### Problema: Error de conexión a la base de datos
**Solución**: Verifica que PostgreSQL esté healthy:
```powershell
docker-compose ps
docker-compose logs postgres
```

### Problema: Volúmenes corruptos
**Solución**: Elimina y recrea volúmenes:
```powershell
docker-compose down -v
docker-compose up --build -d
```

---

## 📝 WORKFLOW TÍPICO DE DESARROLLO

1. **Iniciar el proyecto**:
   ```powershell
   docker-compose up -d
   ```

2. **Ver logs mientras desarrollas**:
   ```powershell
   docker-compose logs -f api
   ```

3. **Después de cambios en el código**:
   ```powershell
   docker-compose up --build api -d
   ```

4. **Al terminar de trabajar**:
   ```powershell
   docker-compose down
   ```

---

## ⚡ TIPS DE RENDIMIENTO

- Usa `--build` solo cuando cambias código o dependencias
- Los volúmenes persisten los datos entre reinicios
- `docker-compose down` NO elimina volúmenes (los datos persisten)
- Usa `docker system prune` periódicamente para liberar espacio

---

## 🎯 VERIFICACIÓN RÁPIDA

Para verificar que todo está funcionando correctamente:

```powershell
# 1. Ver que los contenedores estén corriendo
docker-compose ps

# 2. Ver los logs recientes
docker-compose logs --tail=50

# 3. Verificar health de la API
curl http://localhost:8080/actuator/health

# 4. Verificar conexión a PostgreSQL
docker exec englishteacher-postgres pg_isready -U englishteacher -d englishteacher_db
```

---

¡Listo! 🚀 Tu backend está dockerizado y listo para desarrollo.

