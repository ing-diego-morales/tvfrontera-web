# Publicar Televentas Fest en internet (Railway + dominio de Namecheap)

Guía para hacerlo **por primera vez**. Síguela en orden y marca cada casilla al terminar.
Tiempo total: unas 2 a 3 horas, más la espera mientras se activa el dominio (de 15 minutos a 24 horas).

> En esta guía, **`tudominio.com`** es el dominio que vas a comprar. Cámbialo por el real en cada paso.

---

## Cómo va a quedar

```
Visitante ──► tudominio.com (Cloudflare: solo DNS)
                   │
                   ▼
   ┌──────────── Railway (un solo proyecto, región US East) ────────────┐
   │                                                                     │
   │  tvfrontera-web (Next)  ──red privada──►  tvfrontera-api (Express)  │
   │   página pública                           sin dirección pública    │
   │   /api/* y /uploads/* se reenvían a la API     │                    │
   │                                                ▼                    │
   │                                           MySQL + volumen /data     │
   └─────────────────────────────────────────────────────────────────────┘
Correos: la API los envía con Resend (por HTTPS)
```

**La API no tiene dirección pública**: solo la web puede hablar con ella. Así es más seguro.

## Cuentas que vas a necesitar

| Servicio | Para qué | Costo aproximado |
|---|---|---|
| **GitHub** (github.com) | Guardar el código; Railway lo toma de ahí | Gratis |
| **Railway** (railway.com) | Servidores: web, API y base de datos | Plan Hobby: USD 5/mes, que incluye USD 5 de uso |
| **Namecheap** | Comprar el dominio | USD 10–15/año según la extensión |
| **Cloudflare** (cloudflare.com) | Manejar el DNS del dominio | Gratis |
| **Resend** (resend.com) | Enviar correos (recuperar contraseña, confirmaciones, boletín) | Gratis hasta 3.000 correos/mes |

> **¿Por qué Resend y no Gmail?** El plan Hobby de Railway bloquea el envío por SMTP (los puertos 25, 465 y 587), que es lo que usa Gmail. La API ya está preparada para Resend: basta con poner la clave.

---

## PASO 0 · Antes de empezar (en tu PC)

- [ ] **0.1** Abre XAMPP e inicia **MySQL**.
- [ ] **0.2** Crea los secretos nuevos de producción. **No reutilices los de tu PC**, porque ya se compartieron en el chat. En PowerShell, ejecuta este comando **dos veces** y guarda los dos resultados en un lugar seguro (Bloc de notas privado o un gestor de contraseñas):
  ```powershell
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```
  - El primero será tu **AUTH_SECRET** (firma las sesiones).
  - El segundo será tu **REVALIDATE_SECRET** (lo comparten la web y la API).
- [ ] **0.3** Revoca la contraseña de aplicación de Gmail que compartiste en el chat: en https://myaccount.google.com/apppasswords bórrala. Si quieres seguir usando Gmail en tu PC, crea otra y ponla en un archivo `tvfrontera-api/.env.local` (**no** en `.env`, que se sube a GitHub):
  ```env
  SMTP_USER=tucorreo@gmail.com
  SMTP_PASS=las16letras
  ```

---

## PASO 1 · Comprar el dominio (Namecheap)

- [ ] **1.1** Entra a namecheap.com y busca el dominio, por ejemplo `televentasfest.com` o `.com.co`.
- [ ] **1.2** Cómpralo. **No** compres hosting ni el correo "Private Email" por ahora; no hacen falta.
- [ ] **1.3** Deja activada la opción **Domain Privacy** (gratis), para que tus datos personales no aparezcan públicos.

## PASO 2 · Pasar el DNS a Cloudflare (gratis)

El DNS de Namecheap da problemas para apuntar el dominio principal (sin `www`) a Railway. Con Cloudflare funciona bien.

- [ ] **2.1** Crea tu cuenta en cloudflare.com → **Add a domain** → escribe `tudominio.com` → elige el plan **Free**.
- [ ] **2.2** Cloudflare te muestra **2 nameservers**, por ejemplo `ana.ns.cloudflare.com` y `bob.ns.cloudflare.com`. Cópialos.
- [ ] **2.3** En Namecheap: **Domain List** → **Manage** (en tu dominio) → **Nameservers** → elige **Custom DNS** → pega los 2 de Cloudflare → ✔ guardar.
- [ ] **2.4** Espera el correo de Cloudflare que dice que tu dominio está activo. Suele tardar menos de 1 hora, aunque puede tardar hasta 24.

---

## PASO 3 · Subir el código a GitHub (2 repositorios privados)

- [ ] **3.1** Crea tu cuenta en github.com.
- [ ] **3.2** Crea **2 repositorios vacíos y PRIVADOS**: **New repository** → nombre `tvfrontera-api` → **Private** → **sin** README → Create. Repite con `tvfrontera-web`.
  > ⚠️ **Siempre privados.** El código incluye la lista de correos de las cuentas demo.
- [ ] **3.3** Sube la API. En la terminal de VS Code (PowerShell), cambiando `TU_USUARIO` por tu usuario de GitHub:
  ```powershell
  cd C:\Users\boste\OneDrive\Desktop\PROJECT\tvfrontera-api
  git init
  git add .
  git status
  ```
  **Revisa la lista que muestra `git status`.** **SÍ** debe aparecer `.env`, que va sin claves. **NO** deben aparecer `.env.local`, `node_modules`, `uploads` ni `privado`. Si aparecen, detente y avísame. Si todo está bien:
  ```powershell
  git commit -m "Televentas Fest API - primera version"
  git branch -M main
  git remote add origin https://github.com/TU_USUARIO/tvfrontera-api.git
  git push -u origin main
  ```
  La primera vez se abre el navegador para que inicies sesión en GitHub. Acepta.
- [ ] **3.4** Sube la web. Esta carpeta ya tiene git; no hace falta `git init`:
  ```powershell
  cd C:\Users\boste\OneDrive\Desktop\PROJECT\tvfrontera-web
  git add .
  git status
  ```
  **SÍ** debe aparecer `.env`, que va sin claves. **NO** deben aparecer `.env.local`, `.next` ni `node_modules`. Si todo está bien:
  ```powershell
  git commit -m "Televentas Fest web - primera version"
  git branch -M main
  git remote add origin https://github.com/TU_USUARIO/tvfrontera-web.git
  git push -u origin main
  ```

---

## PASO 4 · Crear el proyecto en Railway y la base de datos

- [ ] **4.1** Entra a railway.com → **Login with GitHub** → acepta los permisos.
- [ ] **4.2** Activa el plan **Hobby**: Account Settings → Plans, con tarjeta.
- [ ] **4.3** **New Project** → **Database** → **MySQL**. En unos segundos aparece el cuadro "MySQL" en el lienzo.
- [ ] **4.4** Elige la región: clic en MySQL → **Settings** → **Region** → **US East**, la más cercana a Colombia. Usa esta misma región para todo.

### Importar tu base de datos actual

> **¿Prefieres empezar en limpio, sin usuarios ni datos de prueba?** En vez de los pasos 4.5 y 4.8, importa
> `tvfrontera-api/sql/000_esquema_completo.sql` (estructura más configuración inicial: categorías, portada, preguntas
> frecuentes, retos). Luego crea tu administrador con `npm run crear-admin`, usando `DATABASE_URL` igual que en el paso 10.1.

- [ ] **4.5** Exporta la base de tu PC, con XAMPP encendido. En PowerShell:
  ```powershell
  cd C:\Users\boste\OneDrive\Desktop\PROJECT
  & "C:\xampp\mysql\bin\mysqldump.exe" -u root --single-transaction --no-tablespaces --skip-comments --default-character-set=utf8mb4 tvfrontera --result-file="respaldos\tvfrontera_para_railway.sql"
  ```
  > Este archivo incluye los **datos demo** (45 cuentas, productos, noticias). Sirven para probar el sitio publicado; en el **Paso 10** se borran antes de abrirlo al público.
- [ ] **4.6** Abre temporalmente la base de Railway desde internet: MySQL → **Settings** → **Networking** → **TCP Proxy** → puerto `3306` → Add. Railway muestra algo como `xxxx.proxy.rlwy.net:12345`.
- [ ] **4.7** Copia la contraseña: MySQL → pestaña **Variables** → `MYSQLPASSWORD` (ícono del ojo → copiar).
- [ ] **4.8** Importa, cambiando HOST y PUERTO por los del paso 4.6. Te pedirá la contraseña del paso 4.7:
  ```powershell
  cmd /c "C:\xampp\mysql\bin\mysql.exe -h HOST -P PUERTO -u root -p --default-character-set=utf8mb4 railway < respaldos\tvfrontera_para_railway.sql"
  ```
  Si no aparece ningún error, se importó bien.
- [ ] **4.9** Comprueba que los datos llegaron:
  ```powershell
  & "C:\xampp\mysql\bin\mysql.exe" -h HOST -P PUERTO -u root -p railway -e "SELECT COUNT(*) AS usuarios FROM usuarios; SELECT COUNT(*) AS productos FROM productos;"
  ```
- [ ] **4.10** **Cierra el acceso público**: MySQL → Settings → Networking → borra el **TCP Proxy** (ícono de basura). La API se conectará por la red privada.

---

## PASO 5 · Publicar la API

- [ ] **5.1** En el proyecto: **+ Create** → **GitHub Repo** → `tvfrontera-api`. Railway empieza a compilar. El primer intento puede fallar porque aún faltan las variables; es normal.
- [ ] **5.2** Clic en el servicio **tvfrontera-api** → **Settings**:
  - **Region:** US East.
  - **Networking → Public Networking:** **no** generes dominio. La API no debe ser pública.
- [ ] **5.3** **Disco para las fotos.** Clic derecho en el servicio (o el botón **+**) → **Volume** → conéctalo a `tvfrontera-api` → **Mount path:** `/data`.
- [ ] **5.4** Pestaña **Variables** → **Raw Editor** → pega esto. Cambia los valores marcados con ⬅️; los de `RESEND_API_KEY` y `MAIL_FROM` los completas en el Paso 8.
  ```env
  NODE_ENV=production
  PORT=4000
  DATABASE_URL=${{MySQL.MYSQL_URL}}
  DATA_DIR=/data
  AUTH_SECRET=PEGA_AQUI_EL_PRIMER_SECRETO            ⬅️ del paso 0.2
  REVALIDATE_SECRET=PEGA_AQUI_EL_SEGUNDO_SECRETO     ⬅️ del paso 0.2
  APP_URL=https://tudominio.com                      ⬅️
  API_URL=https://tudominio.com                      ⬅️
  CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com   ⬅️
  COOKIE_SAMESITE=lax
  COOKIE_SECURE=true
  COOKIE_DOMAIN=
  CONTACTO_PUBLICO_ALIADOS=false
  RESEND_API_KEY=
  MAIL_FROM=Televentas Fest <no-responder@tudominio.com>   ⬅️
  TURNSTILE_SECRET=
  FB_PAGE_ID=
  FB_PAGE_TOKEN=
  ```
  > Borra los textos `⬅️ ...` del final de cada línea antes de guardar.
  > `${{MySQL.MYSQL_URL}}` se escribe tal cual: Railway lo reemplaza por la conexión privada a la base de datos.
- [ ] **5.5** Guarda (**Update Variables**). Railway vuelve a desplegar. Abre **Deployments** → el último → **View logs**. Debes ver:
  - `API Televentas Fest escuchando en ...:4000`
  - `MySQL conectado`
  > Si sale `No se pudo conectar a MySQL`, revisa que `DATABASE_URL` esté escrito exactamente como arriba y que el cuadro de la base se llame **MySQL**.
- [ ] **5.6** Anota la dirección privada: **Settings** → **Networking** → **Private Networking**. Será algo como `tvfrontera-api.railway.internal`.

---

## PASO 6 · Publicar la web

- [ ] **6.1** **+ Create** → **GitHub Repo** → `tvfrontera-web`.
- [ ] **6.2** **Settings** → **Region:** US East.
- [ ] **6.3** **Variables** → **Raw Editor**. **Ponlas antes de que termine la primera compilación**: la web las "graba" al compilar.
  ```env
  API_INTERNA_URL=http://${{tvfrontera-api.RAILWAY_PRIVATE_DOMAIN}}:4000
  REVALIDATE_SECRET=PEGA_AQUI_EL_SEGUNDO_SECRETO     ⬅️ el MISMO de la API
  NEXT_PUBLIC_SITE_URL=https://tudominio.com         ⬅️
  NEXT_PUBLIC_TURNSTILE_SITEKEY=
  ```
  > **No** pongas `NODE_ENV` en la web: Next la configura solo. Si la pones, la compilación falla.
  > Si `${{tvfrontera-api.RAILWAY_PRIVATE_DOMAIN}}` no funciona, escribe a mano la dirección del paso 5.6: `API_INTERNA_URL=http://tvfrontera-api.railway.internal:4000`.
- [ ] **6.4** Si la compilación empezó antes de guardar las variables: **Deployments** → **⋮** → **Redeploy**.
- [ ] **6.5** Para probar ya, sin esperar el dominio: **Settings** → **Networking** → **Generate Domain**. Te da una dirección tipo `tvfrontera-web-production.up.railway.app`.
  Para que el inicio de sesión funcione en esa dirección de prueba, agrégala en la API:
  - `CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com,https://tvfrontera-web-production.up.railway.app`
- [ ] **6.6** Abre esa dirección. Si la portada sale vacía, espera 1 o 2 minutos y recarga: la primera versión de algunas páginas se armó sin datos durante la compilación y se actualiza sola.

---

## PASO 7 · Conectar tu dominio

- [ ] **7.1** En Railway: servicio **tvfrontera-web** → **Settings** → **Networking** → **Custom Domain** → escribe `tudominio.com` → Add. Railway muestra los registros que debes crear: un **CNAME** y un **TXT** de verificación.
- [ ] **7.2** Repite con `www.tudominio.com`.
- [ ] **7.3** En **Cloudflare** → tu dominio → **DNS** → **Records** → **Add record**, crea **exactamente** lo que te mostró Railway en cada caso:
  - Tipo **CNAME**, nombre `@` (el dominio principal), destino el que dio Railway.
  - Tipo **CNAME**, nombre `www`, destino el que dio Railway.
  - Los registros **TXT** que pidió Railway.
  - ⚠️ En los CNAME, **apaga la nube naranja** para que quede gris, "DNS only". Con la nube naranja, Railway no puede crear el certificado HTTPS.
- [ ] **7.4** Espera a que Railway muestre ✅ en los dos dominios (de 5 a 30 minutos). El candado HTTPS se crea solo.
- [ ] **7.5** Abre `https://tudominio.com`. 🎉

---

## PASO 8 · Correos con Resend

- [ ] **8.1** Crea tu cuenta en resend.com → **Domains** → **Add Domain** → `tudominio.com` → región **North Virginia (us-east-1)**.
- [ ] **8.2** Resend muestra 3 o 4 registros DNS (MX, TXT/SPF y DKIM). Créalos en **Cloudflare → DNS** exactamente igual, **todos en gris** ("DNS only").
- [ ] **8.3** En Resend pulsa **Verify**. Puede tardar unos minutos.
- [ ] **8.4** **API Keys** → **Create API Key** → permiso **Sending access** → copia la clave (empieza por `re_`). Solo se muestra una vez.
- [ ] **8.5** En Railway → **tvfrontera-api** → **Variables**:
  - `RESEND_API_KEY=re_...`
  - `MAIL_FROM=Televentas Fest <no-responder@tudominio.com>`
- [ ] **8.6** En los logs de la API debe aparecer: `✅ Correo listo (Resend)`.
- [ ] **8.7** Prueba: en el sitio, "¿Olvidaste tu contraseña?" con tu correo. Debe llegarte el enlace.

---

## PASO 9 · Probar todo

Usa una cuenta demo (clave `Televentas2026*`) y tu cuenta de administrador, la misma de tu PC.

- [ ] Portada: hero, categorías en cinta, productos con foto, noticias.
- [ ] Clic en una categoría → `/productos?categoria=...`.
- [ ] Buscar "piñas" → sale "Te podría interesar".
- [ ] Registro de un usuario nuevo → llega el correo de confirmación.
- [ ] Iniciar sesión y cerrar sesión.
- [ ] Tienda de un aliado → elegir productos → **Pedir por WhatsApp** abre WhatsApp con el mensaje.
- [ ] Mi cuenta → verificación con fotos (en celular, la cámara funciona porque ya es HTTPS).
- [ ] Admin → aprobar esa verificación → la foto se ve. Esto confirma que el volumen `/data` funciona.
- [ ] Admin → crear una pregunta frecuente → aparece al instante en `/preguntas-frecuentes`. Esto confirma que la API le avisa a la web.
- [ ] Celular: abrir `https://tudominio.com`, escribir en el buscador (no debe hacer zoom), botón para subir al inicio.
- [ ] `https://tudominio.com/sitemap.xml` muestra direcciones con tu dominio.

---

## PASO 10 · Antes de abrirlo al público

- [ ] **10.1** **Borrar los datos demo.** Abre otra vez el TCP Proxy de MySQL (paso 4.6), copia `MYSQL_PUBLIC_URL` de las variables de MySQL y en PowerShell:
  ```powershell
  cd C:\Users\boste\OneDrive\Desktop\PROJECT\tvfrontera-api
  $env:DATABASE_URL="PEGA_AQUI_MYSQL_PUBLIC_URL"
  $env:AUTH_SECRET="cualquier-texto-de-mas-de-32-caracteres-123456"
  npm run demo -- borrar
  Remove-Item Env:DATABASE_URL
  ```
  Luego vuelve a borrar el TCP Proxy.
- [ ] **10.2** Haz que un abogado revise **Términos** y **Privacidad**, sobre todo por los datos biométricos de la verificación y la Ley 1581.
- [ ] **10.3** Opcional: anti-robots **Turnstile**. Créalo gratis en Cloudflare → Turnstile para tu dominio. Pon la *site key* en la web (`NEXT_PUBLIC_TURNSTILE_SITEKEY`) y la *secret key* en la API (`TURNSTILE_SECRET`).

---

## Cómo actualizar el sitio después

Trabajas en tu PC igual que ahora (`npm run dev`). Cuando algo quede listo:

```powershell
cd C:\Users\boste\OneDrive\Desktop\PROJECT\tvfrontera-web    # o tvfrontera-api
git add .
git commit -m "Describe el cambio"
git push
```

Railway detecta el `git push` y publica la versión nueva sola, en 1 a 3 minutos y sin cortar el servicio. Si la versión nueva falla al arrancar, se queda la anterior funcionando.

- **Cambios en la base de datos** (archivos `sql/00X_...sql` nuevos): aplícalos en Railway con el TCP Proxy, como en el paso 4.8, **antes** de subir el código que los usa.
- **Volver atrás:** Railway → servicio → **Deployments** → una versión anterior → **⋮** → **Redeploy**.

## Respaldos

Haz uno cada semana: abre el TCP Proxy y ejecuta:

```powershell
& "C:\xampp\mysql\bin\mysqldump.exe" -h HOST -P PUERTO -u root -p --single-transaction --no-tablespaces railway --result-file="respaldos\railway_AAAA-MM-DD.sql"
```

Revisa también si tu plan de Railway ofrece **Backups** automáticos en la pestaña del volumen de MySQL.

## Si algo falla

| Síntoma | Causa probable | Solución |
|---|---|---|
| La web compila pero dice "API no disponible" | `API_INTERNA_URL` mal o puesta después de compilar | Revísala (paso 6.3) y haz **Redeploy** de la web |
| No puedo iniciar sesión | `CORS_ORIGINS` no incluye la dirección que estás usando | Agrégala en la API (sin `/` al final) |
| No llegan los correos | Dominio no verificado en Resend o `MAIL_FROM` con otro dominio | Paso 8; mira los logs de la API |
| Las fotos subidas desaparecen tras actualizar | Falta el volumen o `DATA_DIR` | Paso 5.3 y `DATA_DIR=/data` |
| Un cambio del admin tarda 1 minuto en verse | `REVALIDATE_SECRET` distinto en web y API | Pon el mismo valor en ambos |
| El dominio no muestra el candado HTTPS | Nube naranja activa en Cloudflare | Ponla gris ("DNS only") en los CNAME |
