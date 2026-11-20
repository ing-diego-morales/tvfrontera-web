# Televentas Fest · Web (frontend)

Sitio web de **Televentas Fest**, la gran tienda virtual de **TV Frontera** (canal de televisión de Cúcuta, Colombia):

- Tienda de los Puntos Aliados, con pedidos por WhatsApp.
- Noticias, radio en vivo y programación del canal.
- Programa "Refiere y gana" con premios diarios.
- Verificación de identidad con fotos.
- Panel de administración donde se edita todo el contenido del sitio.

Los datos vienen del backend **`tvfrontera-api`** (Express + MySQL), que vive en otro repositorio.

---

## Contenido

1. [Tecnologías](#tecnologías)
2. [Arquitectura](#arquitectura)
3. [Instalación local](#instalación-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Scripts](#scripts)
6. [Páginas](#páginas)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Funcionalidades](#funcionalidades)
9. [Panel de administración](#panel-de-administración)
10. [Diseño y estilo](#diseño-y-estilo)
11. [Rendimiento](#rendimiento)
12. [Seguridad y privacidad](#seguridad-y-privacidad)
13. [Despliegue](#despliegue)
14. [Solución de problemas](#solución-de-problemas)

---

## Tecnologías

| | |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components) con webpack |
| UI | React 19 · Tailwind CSS 4 |
| Íconos | `lucide-react` · `react-icons` (logos de redes sociales) |
| Lenguaje | TypeScript |
| Node.js | ≥ 22 |

Las dependencias son mínimas a propósito: no hay librerías de estado, de animación ni de UI. Todo está hecho con React y CSS para que la página cargue rápido.

> ⚠️ **Next.js 16 tiene cambios importantes** respecto a versiones anteriores. Antes de escribir código, consulta la documentación incluida en `node_modules/next/dist/docs/`.

## Arquitectura

```
Navegador ──► Next.js (este proyecto) ──► tvfrontera-api ──► MySQL
               │
               ├─ Páginas públicas: Server Components con caché (60 s) y etiquetas.
               │   La API llama a /api/revalidar para refrescarlas al instante.
               ├─ Paneles privados (/cuenta, /panel, /admin): componentes de cliente
               │   que piden los datos con la cookie de sesión.
               └─ /api/* y /uploads/* se reenvían a la API (rewrites en next.config.ts)
```

- **Un solo dominio.** El navegador nunca llama a la API directamente: usa rutas relativas (`/api/...`) que Next reenvía. Por eso funciona igual desde el PC, desde el celular (con la IP de la red local) o con el dominio final, y la cookie de sesión es del mismo sitio.
- **Dos formas de pedir datos:**
  - `src/lib/api-server.ts`: lado servidor, con caché y etiquetas (`avisos`, `noticias`, `aliados`, `productos`, `secciones`, `programacion`, `sitio`, `referidos`, `categorias`, `preguntas`).
  - `src/lib/api.ts` y `src/lib/useApi.ts`: lado navegador, con la cookie de sesión.
- **Revalidación inmediata.** `src/app/api/revalidar/route.ts` acepta únicamente llamadas con `REVALIDATE_SECRET` (comparación en tiempo constante) y solo borra etiquetas conocidas.

## Instalación local

**Requisitos:** Node.js 22 o superior, y la API `tvfrontera-api` corriendo (por defecto en `http://localhost:4000`).

```powershell
npm install
npm run dev                      # http://localhost:3000  (el archivo .env ya viene listo para local)
```

**Para probar desde el celular**, en la misma red Wi-Fi, abre `http://IP-DE-TU-PC:3000`. La IP aparece en la consola como *Network*. Las IP locales se permiten solas, así que no hay que configurar nada.

## Variables de entorno

Un solo archivo: **`.env`**. Se sube al repositorio con los valores de desarrollo y **sin secretos**.

- En producción, los valores reales van en las variables del hosting, que tienen prioridad sobre el `.env`.
- Si necesitas valores propios solo en tu PC, usa `.env.local`, que no se sube.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `API_INTERNA_URL` | ✅ | Dirección de la API **vista desde el servidor de Next**. Local: `http://localhost:4000`. En Railway: la dirección privada de la API. Se graba al compilar, así que si la cambias tienes que volver a compilar. |
| `REVALIDATE_SECRET` | ✅ | El **mismo** valor que en la API |
| `NEXT_PUBLIC_SITE_URL` | prod. | Dominio público (`https://tudominio.com`): SEO, sitemap, robots y textos legales |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | — | Anti-robots Cloudflare Turnstile (vacío = desactivado) |
| `NEXT_PUBLIC_COMPRAS_WEB` | — | `true` activa la compra directa por la web. Hoy está apagada: se pide por WhatsApp y el botón dice "Próximamente" |
| `NEXT_PUBLIC_TV_EN_VIVO` | — | `true` muestra la señal de TV en vivo cuando esté disponible |

Las variables `NEXT_PUBLIC_*` se incluyen en el código del navegador al compilar. **No pongas secretos en ellas.**

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo (`next dev --webpack`) |
| `npm run build` | Compilación de producción (`next build --webpack`). Funciona aunque la API no responda: las páginas se completan solas al primer minuto |
| `npm start` | Servidor de producción (usa la variable `PORT`) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Revisión de tipos |

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Portada armada desde el admin: hero con categorías en cinta infinita, productos destacados, promociones con cuenta regresiva, referidos, noticias, Facebook, programación |
| `/productos` | Catálogo con buscador, filtros por categoría y "Te podría interesar" cuando no hay resultados |
| `/puntos-aliados` | Directorio de negocios |
| `/puntos-aliados/[slug]` | Tienda del aliado: productos, contacto, horario y **Pedir por WhatsApp** |
| `/noticias` · `/noticias/[slug]` | Noticias por categoría y detalle (con datos estructurados `NewsArticle`) |
| `/referidos` | Programa "Refiere y gana": reto del día, metas y ranking |
| `/radio` | Radio en vivo |
| `/nosotros` | Quiénes somos (historia editable) |
| `/preguntas-frecuentes` | Centro de ayuda con buscador y datos estructurados `FAQPage` |
| `/contacto` | Contacto y publicidad |
| `/login` · `/registro` · `/recuperar` · `/restablecer` · `/confirmar` | Cuenta: entrar, crear cuenta (cliente o aliado), recuperar contraseña, confirmar correo |
| `/cuenta` | Mi cuenta: pedidos, referidos, datos, seguridad y verificación de identidad (el admin solo ve perfil y seguridad) |
| `/panel` | Panel del aliado: mi negocio, productos y ventas |
| `/admin` | Panel de administración (ver abajo) |
| `/privacidad` · `/terminos` | Documentos legales con índice |
| `/baja` | Darse de baja del boletín |
| `/sitemap.xml` · `/robots.txt` | SEO (los paneles privados no se indexan) |

## Estructura del proyecto

```
src/
├── app/                     # rutas (App Router), layout, loading, errores, sitemap, robots
│   └── api/revalidar/       # única ruta de API propia: refresca la caché
├── components/
│   ├── admin/               # pestañas del panel de administración
│   ├── aliado/              # panel del aliado (negocio, productos, ventas)
│   ├── aliados/             # tarjetas, tienda, contacto, pedido por WhatsApp
│   ├── auth/                # formularios de cuenta
│   ├── cuenta/              # Mi cuenta, verificación con cámara
│   ├── faq/                 # buscador y acordeón de preguntas frecuentes
│   ├── inicio/              # bloques de la portada
│   ├── legal/               # plantilla de documentos legales
│   ├── panel/               # piezas compartidas de los paneles
│   ├── referidos/           # panel y progreso de referidos
│   ├── ui.tsx               # botones, campos, avisos, tarjetas, encabezados
│   ├── FilaDeslizable.tsx   # fila con flechas y cinta infinita (categorías)
│   ├── EfectosScroll.tsx    # aparición al hacer scroll (Web Animations API)
│   ├── BotonArriba.tsx      # flecha flotante "volver arriba"
│   └── …                    # header, footer, menú, radio, WhatsApp, cookies, etc.
└── lib/
    ├── api.ts · useApi.ts   # llamadas desde el navegador
    ├── api-server.ts        # llamadas desde el servidor, con caché y etiquetas
    ├── sitio.ts             # datos de la marca y la empresa en un solo lugar
    ├── features.ts          # interruptores (compras por web, TV en vivo)
    ├── menu.ts              # menú principal
    ├── iconos-categorias.ts # íconos disponibles para las categorías
    └── …                    # formatos, imágenes, noticias, referidos
public/
├── marca/                   # logo e íconos de Televentas Fest
├── promos/                  # afiches promocionales
└── demo/                    # fotos de los datos de prueba (créditos en CREDITOS.txt)
```

## Funcionalidades

- **Tienda.** Catálogo de productos de los Puntos Aliados. La disponibilidad se muestra sin números ("Disponible", "¡Últimas unidades!", "Agotado") y el orden respeta el posicionamiento pagado y la rotación diaria.
- **Pedido por WhatsApp.**
  - El cliente elige productos y cantidades, y la web abre WhatsApp con el pedido ya escrito: productos, total, nota y nombre.
  - Hay que iniciar sesión. Así crece la base de usuarios y el número del negocio no queda expuesto a robots.
  - La compra directa por la web está lista en el código y se activa con `NEXT_PUBLIC_COMPRAS_WEB=true`.
- **Buscador** en el encabezado y en el catálogo. Si no hay resultados, muestra recomendaciones.
- **Categorías** en una cinta infinita que avanza sola. Se pausa al pasar el mouse o tocarla y se puede deslizar con el dedo o con las flechas.
- **Refiere y gana.** Enlace personal, progreso, reto del día, metas con cupo y ranking semanal.
- **Verificación de identidad.**
  - Asistente de 4 pasos: frente de la cédula, reverso, selfie en vivo (con guía ovalada y cuenta regresiva) y revisión.
  - Las fotos se reducen y se vuelven a codificar como JPEG en el navegador, lo que elimina los metadatos (ubicación incluida).
  - Si la cámara no está disponible, usa la cámara nativa del teléfono.
- **Estado "en línea"** de aliados y administradores, e insignia de verificado.
- **Radio en vivo** con reproductor propio (`components/radio/`):
  - un solo audio para todo el sitio, que sigue sonando al cambiar de página;
  - "sonando ahora" e historial;
  - volumen recordado y controles en la pantalla de bloqueo del celular;
  - "Pedir canción", que envía la solicitud a la cabina por WhatsApp;
  - al pausar se corta la descarga.

  La dirección de la transmisión está en `src/lib/radio.ts`.
- **Noticias**, **programación**, **boletín**, **pico y placa** y **clima**.
- **Experiencia:**
  - Pantalla de carga con la marca y aparición suave de las secciones al hacer scroll. Respeta "reducir movimiento" y no altera el HTML, así que no causa errores de hidratación.
  - Botón para volver arriba y contador de visitas compacto en celular.
  - En pantallas táctiles, los campos usan letra de 16 px para que el iPhone no haga zoom al escribir.

## Panel de administración

Todo se administra desde `/admin`, sin tocar código:

| Pestaña | Qué se maneja |
|---|---|
| Resumen | Indicadores y tareas pendientes, con acceso directo a cada sección |
| Portada | Orden y visibilidad de los bloques, promociones con cuenta regresiva, textos del sitio |
| Categorías | Crear, renombrar, ordenar, ocultar y elegir ícono |
| Referidos | Requisito para contar un referido, metas, retos por día o fecha, ganadores y sospechosos |
| Puntos Aliados | Aprobación, plan, mensualidades, impulso pagado y prioridad |
| Usuarios | Roles y activación |
| Verificaciones | Revisión manual de las fotos: aprobar o rechazar con motivo, y borrar fotos |
| Noticias | Crear, editar, borradores e importación desde Facebook |
| Programación | Parrilla del canal |
| Avisos | Cinta de avisos bajo el menú |
| Preguntas | Preguntas frecuentes |
| Suscriptores | Lista y envío del boletín |
| Pedidos | Supervisión de los pedidos hechos por la web |

## Diseño y estilo

- **Colores:** se definen como tokens en `src/app/globals.css` (`@theme`). **No uses colores hexadecimales sueltos.**

  | Token | Color |
  |---|---|
  | `naranja` | `#f26b1d` (principal) |
  | `naranja-oscuro` · `naranja-claro` | variantes |
  | `amarillo` | `#ffc20e` |
  | `indigo` | `#2b2f8a` |
  | `indigo-oscuro` | `#1c1e5c` |
  | `rojo` | `#e53935` |

- **Clases de marca:** `.fondo-marca` (naranja con rayos), `.fondo-header`, `.img-ph` (fondo mientras carga una imagen).
- **Tema claro** únicamente.
- **Componentes base** en `src/components/ui.tsx`: `Boton`, `Campo`, `AreaTexto`, `Aviso`, `Tarjeta`, `TituloSeccion`, `EncabezadoPagina`.
- **Datos de la marca** (nombre, empresa, contacto, redes) en `src/lib/sitio.ts`.
- **Textos de la interfaz** en español.

## Rendimiento

- **Server Components** para todo lo público: el HTML llega listo y con caché.
- **Imágenes:** `next/image` con AVIF/WebP. Las fotos que se ven al abrir la página cargan de inmediato y el resto a medida que bajas.
- **Animaciones** con CSS y la Web Animations API, sin librerías.
- **Pocas dependencias:** el paquete de JavaScript es pequeño.
- **Revalidación por etiquetas:** los cambios del admin se ven al instante sin sacrificar la caché.

## Seguridad y privacidad

- **Cabeceras:**
  - `X-Content-Type-Options` y `Referrer-Policy`.
  - `X-Frame-Options: SAMEORIGIN`.
  - `Permissions-Policy`: cámara solo para este sitio; micrófono, ubicación y pagos bloqueados.
  - HSTS en producción.
- **Sesión:** cookie `httpOnly` emitida por la API; el JavaScript del navegador no puede leerla.
- **Datos de contacto de los aliados:** nunca van en el HTML público ni en la caché. Se piden con sesión iniciada.
- **Imágenes:** solo se aceptan URLs `http(s)` (nunca `javascript:`), con una lista blanca de dominios externos en `src/lib/images.ts`.
- **Anti-robots** en los formularios públicos (`AntiBot.tsx`): campo trampa, tiempo mínimo y Turnstile opcional.
- **Cookies:** aviso con opciones de aceptar, rechazar o personalizar.
- **Datos estructurados (JSON-LD):** el texto se escapa para evitar inyección de HTML.

## Despliegue

Guía completa, paso a paso: **[docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)** (Railway + dominio de Namecheap con DNS en Cloudflare).
`railway.json` define la compilación, el arranque y la ruta de salud.

Puntos clave:
- Configura `API_INTERNA_URL`, `REVALIDATE_SECRET` y `NEXT_PUBLIC_SITE_URL` **antes** de la primera compilación.
- **No** definas `NODE_ENV` en el servicio web; Next la maneja solo.
- Para actualizar el sitio basta con `git push`: Railway compila y publica sin cortar el servicio.

## Solución de problemas

| Síntoma | Solución |
|---|---|
| "API no disponible" o páginas vacías | Verifica que la API esté encendida y que `API_INTERNA_URL` sea correcta. En producción, vuelve a compilar después de cambiarla |
| La consola muestra `[webpack.cache…] unexpected end of file` | La caché de compilación se dañó (suele pasar si el proyecto está dentro de OneDrive). Detén el servidor, borra la carpeta `.next` y vuelve a ejecutar `npm run dev` |
| Advertencia de hidratación con atributos como `__gcruniqueid` | Los agrega una extensión del navegador. Los formularios ya los ignoran |
| Desde el celular no inicia sesión | Entra por `http://IP:3000`, no por el puerto de la API |
| En el celular la cámara abre la app nativa en vez de la cámara en vivo | Por `http` el navegador no permite la cámara en vivo; con `https` (producción) sí |
| Los cambios del admin tardan 1 minuto | `REVALIDATE_SECRET` distinto en la web y en la API |

---

© TV Frontera · Televentas Fest. Código privado, todos los derechos reservados.
