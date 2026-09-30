# CG Finance S.A.S.

- `index.html` — sitio web institucional (con el botón **Ingresar** en la barra superior).
- Contabilidad y CRM — aplicación autocontenida, protegida con usuario y contraseña. Se abre en `https://cgfinance.co/app` (o desde **Ingresar**).

## Acceso restringido (Vercel)

- `api/login.js`, `api/app.js`, `api/salir.js`, `api/_auth.js`: inicio de sesión y entrega de la app solo a quien tiene sesión válida (cookie firmada, 7 días).
- `api/_app.js`: la aplicación empaquetada (ya no existe como archivo público). Para editarla: `node herramientas/empaquetar-app.js --extraer` (crea `app.html`), modificar y volver a empaquetar con `node herramientas/empaquetar-app.js app.html`.
- `generar-usuario.html`: genera en el navegador la línea de `USUARIOS` (contraseñas cifradas con PBKDF2) y el `SESION_SECRETO`.
- Variables de entorno en Vercel: `USUARIOS` y `SESION_SECRETO`. Si faltan, nadie puede entrar.

## Uso de la app

- **Respaldo automático en OneDrive:** *Respaldo y configuración → Conectar carpeta de respaldo* (Edge o Chrome). Guarda `cgfinance-actual.json` en cada cambio y `cgfinance-respaldo-AAAA-MM-DD.json` en el primer guardado de cada día (se conservan 30).
- **Equipo nuevo:** conectar la misma carpeta y restaurar `cgfinance-actual.json`.
- **OneDrive directo (Microsoft Graph, PKCE):** desactivado; se activa al pegar el identificador de cliente de Azure en `ONEDRIVE_CLIENT_ID`.
- **Catálogo:** plan de cuentas de Xubio (446 cuentas). **Exportaciones:** CSV UTF-8 con BOM y JSON completo.
- La aplicación **no emite facturas electrónicas**: se emiten en el portal gratuito de la DIAN.
