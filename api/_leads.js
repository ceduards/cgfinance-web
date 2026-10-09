/* Bandeja privada de solicitudes del formulario (Upstash Redis por REST, sin dependencias).
   Variables de entorno (las crea la integración de Upstash/KV en Vercel → Storage):
   - UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN   (o KV_REST_API_URL y KV_REST_API_TOKEN) */
const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const configurado = () => !!url() && !!token();
const CLAVE = 'leads';

async function cmd(args) {
  const r = await fetch(url(), { method: 'POST', headers: { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'Upstash ' + r.status);
  return j.result;
}
async function guardar(lead) { if (!configurado()) return false; await cmd(['HSET', CLAVE, lead.id, JSON.stringify(lead)]); return true; }
async function listar() {
  if (!configurado()) return [];
  const r = await cmd(['HGETALL', CLAVE]), pares = Array.isArray(r) ? r : Object.entries(r || {}).flat(), out = [];
  for (let i = 1; i < pares.length; i += 2) { try { out.push(JSON.parse(pares[i])); } catch (e) { /* registro dañado: se ignora */ } }
  return out.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
}
async function borrar(ids) { if (!configurado() || !ids.length) return 0; return cmd(['HDEL', CLAVE, ...ids]); }
module.exports = { configurado, guardar, listar, borrar };
