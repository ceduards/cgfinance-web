/* Formulario de contacto del sitio. Por cada solicitud:
   1) valida; 2) envía automáticamente la propuesta con el portafolio que corresponde (persona o empresa);
   3) avisa a comercial@ (con el resultado del envío); 4) deja la solicitud en la bandeja privada para el CRM.
   Cada paso falla por separado sin romper los demás.
   Variables de entorno (Vercel → Settings → Environment Variables):
   - RESEND_API_KEY          clave de API de resend.com
   - CONTACTO_DESTINO        correo que recibe los avisos (por defecto comercial@cgfinance.co)
   - CONTACTO_REMITENTE      remitente verificado en Resend, p. ej. "CG Finance <contacto@cgfinance.co>"
   - PROPUESTA_AUTOMATICA    "prueba" (por defecto: solo a PROPUESTA_PRUEBA), "si" (a todos) o "no"
   - PROPUESTA_PRUEBA        correos de prueba separados por coma (solo para el modo "prueba")
   - Bandeja del CRM: ver _leads.js */
const A = require('./_auth');
const L = require('./_leads');
const P = require('./_propuesta');

const DESTINO = () => process.env.CONTACTO_DESTINO || 'comercial@cgfinance.co';
const REMITENTE = () => process.env.CONTACTO_REMITENTE || 'CG Finance <onboarding@resend.dev>';
const MODO = () => { const m = String(process.env.PROPUESTA_AUTOMATICA || 'prueba').trim().toLowerCase(); return m === 'si' || m === 'no' ? m : 'prueba'; };
const PRUEBA = () => String(process.env.PROPUESTA_PRUEBA || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

function responder(res, estado, cuerpo) {
  res.statusCode = estado;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(cuerpo));
}
async function leerJson(req) {
  const partes = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 10000) return null; partes.push(c); }
  try { return JSON.parse(Buffer.concat(partes).toString('utf8')); } catch (e) { return null; }
}
const limpiar = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

async function resend(clave, cuerpo) {
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + clave, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  if (!r.ok) { const t = await r.text().catch(() => ''); console.error('Resend', r.status, t); throw new Error('Resend ' + r.status); }
}

/* Envía la propuesta si corresponde y devuelve { estado, portafolio, modo, detalle } */
async function enviarPropuesta(clave, d) {
  const portafolio = d.tipo === 'persona' ? 'personas' : 'empresas', modo = MODO(), base = { portafolio, modo };
  if (modo === 'no') return Object.assign(base, { estado: 'omitida', detalle: 'Envío automático apagado (PROPUESTA_AUTOMATICA=no).' });
  if (modo === 'prueba' && !PRUEBA().includes(d.correo.toLowerCase())) return Object.assign(base, { estado: 'omitida', detalle: 'Modo prueba: este correo no está en la lista de prueba.' });
  const def = P.PORTAFOLIOS[portafolio];
  if (!def.texto) return Object.assign(base, { estado: 'sin_texto', detalle: 'Falta el texto del correo para ' + portafolio + '.' });
  try {
    await resend(clave, {
      from: REMITENTE(), to: [d.correo], bcc: [DESTINO()], reply_to: DESTINO(), subject: P.ASUNTO,
      text: def.texto({ nombre: P.primerNombre(d.nombre), empresa: d.empresa }),
      attachments: [{ filename: def.archivo, content: def.pdf() }]
    });
    return Object.assign(base, { estado: 'enviada', detalle: 'Propuesta enviada con el portafolio de ' + portafolio + '.' });
  } catch (e) { return Object.assign(base, { estado: 'error', detalle: 'No se pudo enviar la propuesta: ' + e.message }); }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return responder(res, 405, { ok: false, error: 'Método no permitido.' }); }
  const d = await leerJson(req);
  if (!d) return responder(res, 400, { ok: false, error: 'Solicitud no válida.' });

  if (d.sitio) return responder(res, 200, { ok: true });   // campo trampa: un humano no lo llena

  const tipo = d.tipo === 'persona' ? 'persona' : 'empresa';
  const nombre = limpiar(d.nombre, 120), empresa = limpiar(d.empresa, 160), telefono = limpiar(d.telefono, 40), correo = limpiar(d.correo, 160);
  const mensaje = String(d.mensaje ?? '').replace(/\r/g, '').trim().slice(0, 2000);
  if (nombre.length < 2) return responder(res, 400, { ok: false, error: 'Escriba su nombre.' });
  if (tipo === 'empresa' && empresa.length < 2) return responder(res, 400, { ok: false, error: 'Escriba el nombre de su empresa.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return responder(res, 400, { ok: false, error: 'Escriba un correo electrónico válido.' });
  if (telefono.replace(/\D/g, '').length < 7) return responder(res, 400, { ok: false, error: 'Escriba un teléfono de contacto válido.' });
  if (d.autoriza !== true) return responder(res, 400, { ok: false, error: 'Debe autorizar el tratamiento de sus datos.' });

  const clave = process.env.RESEND_API_KEY;
  if (!clave) return responder(res, 503, { ok: false, error: 'El formulario aún no está disponible. Escríbanos por WhatsApp o correo.' });

  const lead = { id: 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), fecha: new Date().toISOString(), tipo, nombre, empresa: tipo === 'empresa' ? empresa : '', correo, telefono, mensaje, autoriza: true };
  lead.propuesta = await enviarPropuesta(clave, { tipo, nombre, empresa, correo });

  let guardada = false, nota = '';
  try { guardada = await L.guardar(lead); if (!guardada) nota = 'CRM: la bandeja de solicitudes aún no está configurada (la solicitud solo consta en este correo).'; }
  catch (e) { console.error('Bandeja', e.message); nota = 'CRM: no se pudo guardar la solicitud en la bandeja (' + e.message + ').'; }

  const p = lead.propuesta, etiqueta = { enviada: '✔ Propuesta enviada automáticamente', omitida: 'Propuesta no enviada', sin_texto: 'Propuesta no enviada (falta el texto)', error: '✖ Falló el envío de la propuesta' }[p.estado];
  const html = `<h2>Nueva solicitud de consulta</h2>
<p><b>Tipo:</b> ${tipo === 'persona' ? 'Persona natural' : 'Empresa'}<br><b>Nombre:</b> ${A.esc(nombre)}<br>${empresa ? `<b>Empresa:</b> ${A.esc(empresa)}<br>` : ''}<b>Correo:</b> ${A.esc(correo)}<br><b>Teléfono:</b> ${A.esc(telefono)}</p>
<p><b>Mensaje:</b><br>${A.esc(mensaje).replace(/\n/g, '<br>') || '(sin mensaje)'}</p>
<p><b>${etiqueta}</b> · Portafolio de ${p.portafolio}<br><span style="color:#666">${A.esc(p.detalle)}</span>${nota ? `<br><span style="color:#a15c00">${A.esc(nota)}</span>` : ''}</p>
<p style="color:#666;font-size:12px">Autorizó el tratamiento de datos · ${lead.fecha} · cgfinance.co</p>`;
  try {
    await resend(clave, { from: REMITENTE(), to: [DESTINO()], reply_to: correo, subject: `Consulta web: ${empresa || nombre} (${nombre})`, html });
    return responder(res, 200, { ok: true });
  } catch (e) {
    if (guardada || p.estado === 'enviada') return responder(res, 200, { ok: true });   // la solicitud no se perdió
    return responder(res, 502, { ok: false, error: 'No pudimos enviar su mensaje. Escríbanos por WhatsApp o correo.' });
  }
};
