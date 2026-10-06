/* Formulario de contacto del sitio: valida y envía el mensaje por correo con Resend (sin dependencias).
   Variables de entorno (Vercel → Settings → Environment Variables):
   - RESEND_API_KEY    clave de API de resend.com
   - CONTACTO_DESTINO  correo que recibe los mensajes (opcional; por defecto comercial@cgfinance.co)
   - CONTACTO_REMITENTE remitente verificado en Resend, p. ej. "CG Finance <contacto@cgfinance.co>"
                        (opcional; por defecto onboarding@resend.dev, que solo entrega al dueño de la cuenta de Resend) */
const A = require('./_auth');

const DESTINO = () => process.env.CONTACTO_DESTINO || 'comercial@cgfinance.co';
const REMITENTE = () => process.env.CONTACTO_REMITENTE || 'CG Finance <onboarding@resend.dev>';

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

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return responder(res, 405, { ok: false, error: 'Método no permitido.' }); }
  const d = await leerJson(req);
  if (!d) return responder(res, 400, { ok: false, error: 'Solicitud no válida.' });

  if (d.sitio) return responder(res, 200, { ok: true });   // campo trampa: un humano no lo llena

  const nombre = limpiar(d.nombre, 120), empresa = limpiar(d.empresa, 160), telefono = limpiar(d.telefono, 40), correo = limpiar(d.correo, 160);
  const mensaje = String(d.mensaje ?? '').replace(/\r/g, '').trim().slice(0, 2000);
  if (nombre.length < 2 || empresa.length < 2) return responder(res, 400, { ok: false, error: 'Escriba su nombre y el de su empresa.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return responder(res, 400, { ok: false, error: 'Escriba un correo electrónico válido.' });
  if (telefono.replace(/\D/g, '').length < 7) return responder(res, 400, { ok: false, error: 'Escriba un teléfono de contacto válido.' });
  if (d.autoriza !== true) return responder(res, 400, { ok: false, error: 'Debe autorizar el tratamiento de sus datos.' });

  const clave = process.env.RESEND_API_KEY;
  if (!clave) return responder(res, 503, { ok: false, error: 'El formulario aún no está disponible. Escríbanos por WhatsApp o correo.' });

  const html = `<h2>Nueva solicitud de consulta</h2>
<p><b>Nombre:</b> ${A.esc(nombre)}<br><b>Empresa:</b> ${A.esc(empresa)}<br><b>Correo:</b> ${A.esc(correo)}<br><b>Teléfono:</b> ${A.esc(telefono)}</p>
<p><b>Mensaje:</b><br>${A.esc(mensaje).replace(/\n/g, '<br>') || '(sin mensaje)'}</p>
<p style="color:#666;font-size:12px">Autorizó el tratamiento de datos · ${new Date().toISOString()} · cgfinance.co</p>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + clave, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: REMITENTE(), to: [DESTINO()], reply_to: correo, subject: `Consulta web: ${empresa} (${nombre})`, html })
    });
    if (!r.ok) { console.error('Resend', r.status, await r.text().catch(() => '')); return responder(res, 502, { ok: false, error: 'No pudimos enviar su mensaje. Escríbanos por WhatsApp o correo.' }); }
    return responder(res, 200, { ok: true });
  } catch (e) {
    return responder(res, 502, { ok: false, error: 'No pudimos enviar su mensaje. Escríbanos por WhatsApp o correo.' });
  }
};
