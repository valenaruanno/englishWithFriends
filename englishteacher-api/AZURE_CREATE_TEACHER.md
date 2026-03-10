# Guía para crear el profesor en SQLite de Azure

## Opción 1: Usando Azure CLI (Recomendado)

### Paso 1: Conectarse por SSH al App Service
```bash
az webapp ssh --name englishteacher-app --resource-group <tu-resource-group>
```

Si no sabes tu resource group, usa:
```bash
az webapp list --query "[].{name:name, resourceGroup:resourceGroup}" --output table
```

### Paso 2: Una vez dentro del SSH, ejecutar los comandos SQL

```bash
# Ir al directorio donde está la base de datos
cd /home/site/wwwroot

# Ejecutar el script SQL
sqlite3 englishteacher.db << 'EOF'
-- Crear tabla teachers si no existe
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    description TEXT,
    qualifications TEXT,
    specialties TEXT,
    years_of_experience INTEGER,
    profile_image_url VARCHAR(500)
);

-- Insertar el profesor
INSERT INTO teachers (
    id,
    name,
    last_name,
    email,
    password,
    phone,
    description,
    qualifications,
    specialties,
    years_of_experience,
    profile_image_url
) VALUES (
    1,
    'Paz',
    'Valdez',
    'paz.valdez@englishteacher.com',
    '$2a$10$6gJkWS1LxtYeGX8x89hV6efNQah4nprMg.5chRpesQblowQ.nnCzS',
    '+54 11 1234-5678',
    'Profesora de inglés con más de 10 años de experiencia enseñando a estudiantes de todos los niveles. Me especializo en conversación, gramática y preparación para exámenes internacionales. Mi objetivo es ayudar a mis estudiantes a ganar confianza y fluidez',
    'Licenciatura en Lenguas Modernas, Certificación TESOL, Cambridge CELTA',
    'Conversación, Gramática, Preparación de exámenes, Business English',
    10,
    NULL
);
EOF
```

### Paso 3: Verificar que se creó correctamente
```bash
sqlite3 englishteacher.db "SELECT * FROM teachers;"
```

---

## Opción 2: Usando Azure Portal (Más simple, sin CLI)

### Paso 1: Ir al Azure Portal
1. Ve a https://portal.azure.com
2. Busca tu App Service "englishteacher-app"
3. En el menú izquierdo, busca **"SSH"** o **"Advanced Tools"** → **"Go"**
4. Se abrirá la consola Kudu

### Paso 2: Abrir SSH desde Kudu
1. En Kudu, en el menú superior, click en **"SSH"**
2. Se abrirá una terminal

### Paso 3: Ejecutar los comandos
Copia y pega el comando de la Opción 1, Paso 2.

---

## Opción 3: Comando único (Copia y pega en PowerShell local)

```powershell
# Conectarse y ejecutar todo de una vez
az webapp ssh --name englishteacher-app --resource-group <tu-resource-group> --command "cd /home/site/wwwroot && sqlite3 englishteacher.db \"INSERT INTO teachers (id, name, last_name, email, password, phone, description, qualifications, specialties, years_of_experience) VALUES (1, 'Paz', 'Valdez', 'paz.valdez@englishteacher.com', '\$2a\$10\$6gJkWS1LxtYeGX8x89hV6efNQah4nprMg.5chRpesQblowQ.nnCzS', '+54 11 1234-5678', 'Profesora de inglés con más de 10 años de experiencia enseñando a estudiantes de todos los niveles. Me especializo en conversación, gramática y preparación para exámenes internacionales. Mi objetivo es ayudar a mis estudiantes a ganar confianza y fluidez', 'Licenciatura en Lenguas Modernas, Certificación TESOL, Cambridge CELTA', 'Conversación, Gramática, Preparación de exámenes, Business English', 10);\""
```

---

## Verificación final

Después de ejecutar el script, puedes verificar desde tu aplicación web que el profesor existe intentando hacer login con:
- **Email**: paz.valdez@englishteacher.com
- **Contraseña**: (la que usabas localmente)

---

## Troubleshooting

### Si recibes error "table already exists"
```bash
sqlite3 englishteacher.db "DROP TABLE IF EXISTS teachers;"
# Luego vuelve a ejecutar el script
```

### Si necesitas ver la estructura de la tabla
```bash
sqlite3 englishteacher.db ".schema teachers"
```

### Si necesitas eliminar y volver a crear
```bash
sqlite3 englishteacher.db << 'EOF'
DELETE FROM teachers WHERE email = 'paz.valdez@englishteacher.com';
EOF
# Luego ejecuta el INSERT nuevamente
```

