# English Teacher App - Deployment Guide

Esta aplicación consta de un backend Spring Boot y un frontend React que se puede deployar completamente gratis.

## 🚀 Opciones de Deployment Gratuito

### Opción 1: Railway (Recomendada - Más Simple)
- **Costo**: $5 USD mensual gratis (suficiente para 100 usuarios)
- **Incluye**: PostgreSQL, SSL, dominio personalizado
- **Setup**: 1-click deployment desde GitHub

### Opción 2: Render + Supabase
- **Backend**: Render (750 horas gratis/mes)
- **Frontend**: Vercel/Netlify (ilimitado)
- **DB**: Supabase (500MB gratis)

## 📋 Instrucciones de Deployment

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tuusuario/english-teacher-app.git
git push -u origin main
```

### 2A. Deployment en Railway

1. Ve a [railway.app](https://railway.app)
2. Conecta tu GitHub
3. Selecciona tu repositorio
4. Railway detectará automáticamente Docker
5. Configura variables de entorno:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DDL_AUTO=update`
   - `CORS_ORIGINS=https://tu-frontend-url.com`

### 2B. Deployment en Render

**Backend:**
1. Ve a [render.com](https://render.com)
2. New → Web Service
3. Conecta GitHub repo
4. Build Command: `cd englishteacher-api && ./mvnw clean package -DskipTests`
5. Start Command: `java -jar target/englishteacher-api-0.0.1-SNAPSHOT.jar`

**Frontend:**
1. New → Static Site
2. Build Command: `cd english-teacher/frontend && npm install && npm run build`
3. Publish Directory: `english-teacher/frontend/dist`

**Base de Datos (Supabase):**
1. Ve a [supabase.com](https://supabase.com)
2. Crea nuevo proyecto
3. Copia la URL de conexión
4. Configura en variables de entorno del backend

## 🔧 Variables de Entorno

Para producción necesitas configurar:

```env
DATABASE_URL=postgresql://usuario:password@host:port/database
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
SPRING_PROFILES_ACTIVE=prod
DDL_AUTO=update
CORS_ORIGINS=https://tu-dominio-frontend.com
PORT=8080
```

## 🧪 Testing Local con Docker

```bash
# Levantar todo el stack
docker-compose up --build

# Acceder a:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# PostgreSQL: localhost:5432
```

## 💰 Costos Estimados

**Completamente Gratis (hasta ~500 usuarios):**
- Railway: $5 crédito mensual gratis
- Render + Supabase: 750 horas backend + ilimitado frontend
- Vercel + Railway DB: Frontend ilimitado + $5 crédito

**Si creces (más de 500 usuarios activos):**
- Railway Pro: ~$20/mes
- Render Pro: ~$25/mes
- VPS (DigitalOcean): $6/mes

## 📞 Soporte

Para una profesora con ~100 alumnos, cualquier opción gratuita será más que suficiente.

¿Dudas? Escríbeme y te ayudo con el deployment específico.