/* Autenticación de CG Finance (funciones de Vercel, sin dependencias).
   Variables de entorno (Vercel → Settings → Environment Variables):
   - USUARIOS       JSON {"usuario":"pbkdf2$210000$<sal>$<hash>", ...}  (se genera en /generar-usuario.html)
   - SESION_SECRETO texto aleatorio de 32 caracteres o más                (se genera en /generar-usuario.html) */
const crypto = require('crypto');

const COOKIE = 'cg_sesion';
const DURACION_SEG = 7 * 24 * 3600;

const secreto = () => { const s = process.env.SESION_SECRETO; return s && s.length >= 32 ? s : null; };
const configurado = () => !!secreto() && Object.keys(usuarios()).length > 0;

function usuarios() {
  try { const u = JSON.parse(process.env.USUARIOS || '{}'); return u && typeof u === 'object' ? u : {}; } catch (e) { return {}; }
}

function firma(payload) { return crypto.createHmac('sha256', secreto()).update(payload).digest('base64url'); }

function crearCookie(usuario) {
  const payload = Buffer.from(JSON.stringify({ u: usuario, exp: Math.floor(Date.now() / 1000) + DURACION_SEG })).toString('base64url');
  return `${COOKIE}=${payload}.${firma(payload)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${DURACION_SEG}`;
}
const cookieBorrada = () => `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

/* Devuelve el nombre de usuario si la cookie de sesión es válida; si no, null */
function sesion(req) {
  if (!secreto()) return null;
  const c = String(req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
  if (!c) return null;
  const [payload, sig] = c.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const esperado = firma(payload);
  const a = Buffer.from(sig), b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!d.exp || d.exp < Date.now() / 1000) return null;
    return usuarios()[d.u] ? d.u : null;   // si el usuario fue retirado, la sesión deja de valer
  } catch (e) { return null; }
}

/* Verifica usuario y contraseña (PBKDF2-SHA256). Siempre hace el cálculo para no revelar qué usuarios existen. */
function verificar(usuario, clave) {
  const u = String(usuario || '').trim().toLowerCase();
  const guardado = usuarios()[u];
  const partes = String(guardado || 'pbkdf2$210000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA').split('$');
  if (partes[0] !== 'pbkdf2') return null;
  const iter = parseInt(partes[1], 10), sal = Buffer.from(partes[2], 'base64'), esperado = Buffer.from(partes[3], 'base64');
  if (!(iter > 0) || !esperado.length) return null;
  const calc = crypto.pbkdf2Sync(String(clave || ''), sal, iter, esperado.length, 'sha256');
  return guardado && crypto.timingSafeEqual(calc, esperado) ? u : null;
}

async function leerCuerpo(req) {
  const partes = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 10000) break; partes.push(c); }
  return new URLSearchParams(Buffer.concat(partes).toString('utf8'));
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pausa = ms => new Promise(r => setTimeout(r, ms));

module.exports = { configurado, crearCookie, cookieBorrada, sesion, verificar, leerCuerpo, esc, pausa };
