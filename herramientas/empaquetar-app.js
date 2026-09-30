/* Uso:  node herramientas/empaquetar-app.js app.html     → genera api/_app.js (la app protegida)
         node herramientas/empaquetar-app.js --extraer     → recupera app.html desde api/_app.js
   La app ya no se publica como archivo suelto: solo la entrega /api/app a quien inició sesión. */
const fs = require('fs'), path = require('path');
const destino = path.join(__dirname, '..', 'api', '_app.js');
const a = process.argv[2];
if (a === '--extraer') { fs.writeFileSync('app.html', Buffer.from(require(destino), 'base64')); console.log('app.html recuperado'); }
else if (a) { fs.writeFileSync(destino, 'module.exports = "' + fs.readFileSync(a).toString('base64') + '";\n'); console.log('api/_app.js generado'); }
else console.log('Indique app.html o --extraer');
