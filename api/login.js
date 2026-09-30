const A = require('./_auth');

const pagina = (mensaje, usuario) => `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>Ingresar · CG Finance</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:#0f1c3b;color:#1a2340;min-height:100vh;display:grid;place-items:center;padding:20px}
.card{background:#fff;border-radius:12px;padding:32px 28px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.35);border-top:4px solid #d6a23e}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:20px;font-family:Georgia,serif;font-weight:700;font-size:1.2rem;color:#16274f}
.logo{width:36px;height:36px;border-radius:7px;background:#d6a23e;color:#0f1c3b;display:grid;place-items:center;font-weight:800;font-size:1rem}
h1{font-family:Georgia,serif;font-size:1.3rem;margin-bottom:4px}.sub{color:#5c6579;font-size:.9rem;margin-bottom:18px}
label{display:block;font-size:.76rem;font-weight:700;color:#5c6579;text-transform:uppercase;letter-spacing:.05em;margin:12px 0 4px}
input{width:100%;min-height:44px;padding:9px 12px;border:1px solid #c9d0de;border-radius:6px;font:inherit}
input:focus{outline:2px solid #d6a23e;border-color:#d6a23e}
button{margin-top:20px;width:100%;min-height:46px;border:none;border-radius:6px;background:#d6a23e;color:#0f1c3b;font:inherit;font-weight:700;cursor:pointer}
button:hover{background:#e4b552}
.err{background:#fde8e5;border:1px solid #f0c2bc;color:#c0392b;padding:9px 12px;border-radius:6px;font-size:.88rem;margin-bottom:6px}
.volver{display:block;text-align:center;margin-top:16px;font-size:.85rem;color:#5c6579}
</style></head><body><form class="card" method="POST" action="/login" autocomplete="on">
<div class="brand"><div class="logo">CG</div>CG Finance S.A.S.</div>
<h1>Acceso restringido</h1><p class="sub">Contabilidad y CRM. Ingrese con su usuario y contraseña.</p>
${mensaje ? `<div class="err">${A.esc(mensaje)}</div>` : ''}
<label for="u">Usuario</label><input id="u" name="usuario" autocomplete="username" autocapitalize="none" required autofocus value="${A.esc(usuario || '')}">
<label for="c">Contraseña</label><input id="c" name="clave" type="password" autocomplete="current-password" required>
<button type="submit">Ingresar</button><a class="volver" href="/">← Volver a cgfinance.co</a></form></body></html>`;

function responder(res, estado, html) {
  res.statusCode = estado;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Frame-Options', 'DENY');
  res.end(html);
}
function ir(res, destino) { res.statusCode = 302; res.setHeader('Location', destino); res.setHeader('Cache-Control', 'no-store'); res.end(); }

module.exports = async (req, res) => {
  if (!A.configurado()) return responder(res, 503, pagina('El acceso aún no está configurado. Contacte al administrador.'));
  if (req.method === 'POST') {
    const f = await A.leerCuerpo(req);
    const usuario = A.verificar(f.get('usuario'), f.get('clave'));
    if (!usuario) { await A.pausa(800); return responder(res, 401, pagina('Usuario o contraseña incorrectos.', f.get('usuario'))); }
    res.setHeader('Set-Cookie', A.crearCookie(usuario));
    return ir(res, '/app');
  }
  if (A.sesion(req)) return ir(res, '/app');
  return responder(res, 200, pagina(''));
};
