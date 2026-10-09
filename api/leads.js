/* Solicitudes del formulario pendientes de pasar al CRM. Solo con sesión iniciada.
   GET  → { ok, configurado, leads: [...] }
   POST { ids: [...] } → borra de la bandeja las solicitudes que el CRM ya importó */
const A = require('./_auth');
const L = require('./_leads');

function responder(res, estado, cuerpo) {
  res.statusCode = estado;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(cuerpo));
}
async function leerJson(req) {
  const partes = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 20000) return null; partes.push(c); }
  try { return JSON.parse(Buffer.concat(partes).toString('utf8')); } catch (e) { return null; }
}

module.exports = async (req, res) => {
  if (!A.sesion(req)) return responder(res, 401, { ok: false, error: 'Inicie sesión.' });
  try {
    if (req.method === 'GET') return responder(res, 200, { ok: true, configurado: L.configurado(), leads: await L.listar() });
    if (req.method === 'POST') {
      if (req.headers['x-requested-with'] !== 'cgfinance') return responder(res, 403, { ok: false, error: 'Solicitud no válida.' });
      const d = await leerJson(req), ids = d && Array.isArray(d.ids) ? d.ids.filter(x => typeof x === 'string' && /^w_[a-z0-9]+$/.test(x)).slice(0, 200) : null;
      if (!ids) return responder(res, 400, { ok: false, error: 'Solicitud no válida.' });
      return responder(res, 200, { ok: true, borradas: await L.borrar(ids) });
    }
    res.setHeader('Allow', 'GET, POST'); return responder(res, 405, { ok: false, error: 'Método no permitido.' });
  } catch (e) { console.error('leads', e.message); return responder(res, 502, { ok: false, error: 'La bandeja no respondió.' }); }
};
