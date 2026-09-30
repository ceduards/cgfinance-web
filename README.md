# CG Finance S.A.S.

- `index.html` — sitio web institucional.
- `app.html` — **Contabilidad y CRM** (aplicación autocontenida, sin servidor ni dependencias). Solución puente hasta migrar a Xubio.

## Uso de `app.html`

Ábrala en Microsoft Edge o Google Chrome (doble clic sobre el archivo, o publicada por https). Los datos se guardan en el navegador (IndexedDB).

- **Respaldo automático en OneDrive:** *Respaldo y configuración → Conectar carpeta de respaldo* y elegir una carpeta dentro de OneDrive. Se guarda `cgfinance-actual.json` en cada cambio y `cgfinance-respaldo-AAAA-MM-DD.json` en el primer guardado de cada día (se conservan 30).
- **Equipo nuevo:** conectar la misma carpeta (o *Restaurar desde una carpeta…*) y elegir `cgfinance-actual.json`.
- **OneDrive directo (Microsoft Graph, PKCE):** desactivado; se activa solo al pegar el identificador de cliente de Azure en `ONEDRIVE_CLIENT_ID` (inicio del `<script>`).
- **Exportaciones:** *Exportar a CSV* (UTF-8 con BOM; asientos, terceros, oportunidades, interacciones, tareas, catálogo) y JSON completo.
- La aplicación **no emite facturas electrónicas**: se emiten en el portal gratuito de la DIAN y aquí solo se registra el asiento.
