const A = require('./_auth');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', A.cookieBorrada());
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 302; res.setHeader('Location', '/'); res.end();
};
