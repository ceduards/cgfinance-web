const A = require('./_auth');

module.exports = (req, res) => {
  if (!A.sesion(req)) { res.statusCode = 302; res.setHeader('Location', '/login'); res.setHeader('Cache-Control', 'no-store'); return res.end(); }
  const html = Buffer.from(require('./_app.js'), 'base64');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Frame-Options', 'DENY');
  res.end(html);
};
