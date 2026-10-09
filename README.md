# CG Finance S.A.S.

- `index.html` — sitio web institucional (con el botón **Ingresar** en la barra superior).
- Contabilidad y CRM — aplicación autocontenida, protegida con usuario y contraseña. Se abre en `https://cgfinance.co/app` (o desde **Ingresar**).

## Acceso restringido (Vercel)

- `api/login.js`, `api/app.js`, `api/salir.js`, `api/_auth.js`: inicio de sesión y entrega de la app solo a quien tiene sesión válida (cookie firmada, 7 días).
- `api/_app.js`: la aplicación empaquetada (ya no existe como archivo público). Para editarla: `node herramientas/empaquetar-app.js --extraer` (crea `app.html`), modificar y volver a empaquetar con `node herramientas/empaquetar-app.js app.html`.
- `generar-usuario.html`: genera en el navegador la línea de `USUARIOS` (contraseñas cifradas con PBKDF2) y el `SESION_SECRETO`.
- Variables de entorno en Vercel: `USUARIOS` y `SESION_SECRETO`. Si faltan, nadie puede entrar.

## Formulario de contacto

- `api/contacto.js` recibe el formulario del sitio y lo envía por correo con [Resend](https://resend.com) (sin dependencias).
- Variables en Vercel: `RESEND_API_KEY` (obligatoria; sin ella el formulario avisa que use WhatsApp o correo), `CONTACTO_DESTINO` (por defecto `comercial@cgfinance.co`) y `CONTACTO_REMITENTE` (remitente verificado en Resend, p. ej. `CG Finance <contacto@cgfinance.co>`).
- **Propuesta automática:** al enviar el formulario (con la autorización de datos marcada), `api/contacto.js` envía al cliente el portafolio que corresponde (`api/_portafolio_empresas.js` o `_personas.js`, PDF en base64) con el texto de `api/_propuesta.js`, con copia oculta y respuesta a `comercial@`. El aviso a `comercial@` indica si se envió. Para personas naturales no se envía nada hasta que `_propuesta.js` tenga el texto aprobado.
  - `PROPUESTA_AUTOMATICA`: `prueba` (por defecto: solo a los correos de `PROPUESTA_PRUEBA`, separados por coma), `si` (a todos) o `no`.
  - El remitente (`CONTACTO_REMITENTE`) debe ser una dirección de un dominio verificado en Resend.
- **Bandeja para el CRM:** cada solicitud se guarda en Upstash Redis (integración de Vercel → Storage; variables `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` o `KV_REST_API_URL`/`KV_REST_API_TOKEN`). `api/leads.js` (solo con sesión) las entrega a la app, que las convierte en contacto, oportunidad e interacción al abrirse o con el botón *Traer solicitudes del formulario*, y luego las borra de la bandeja.
- Imágenes del sitio en `img/` (`hero.jpg`, `carlos.jpg`, `og.jpg`).

## Uso de la app

- **Respaldo automático en OneDrive:** *Respaldo y configuración → Conectar carpeta de respaldo* (Edge o Chrome). Guarda `cgfinance-actual.json` en cada cambio y `cgfinance-respaldo-AAAA-MM-DD.json` en el primer guardado de cada día (se conservan 30).
- **Equipo nuevo:** conectar la misma carpeta y restaurar `cgfinance-actual.json`.
- **OneDrive directo (Microsoft Graph, PKCE):** desactivado; se activa al pegar el identificador de cliente de Azure en `ONEDRIVE_CLIENT_ID`.
- **Catálogo:** plan de cuentas de Xubio (446 cuentas). **Exportaciones:** CSV UTF-8 con BOM y JSON completo.
- La aplicación **no emite facturas electrónicas**: se emiten en el portal gratuito de la DIAN.
