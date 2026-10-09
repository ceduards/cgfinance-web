/* Propuesta comercial que se envía automáticamente al cliente que llena el formulario.
   Los textos son los que entregó CG Finance; no se agrega ningún dato, precio, promesa ni enlace.
   Para personas naturales falta el texto: mientras sea null, no se envía nada a personas. */
const ASUNTO = 'Portafolio de CG Finance S.A.S.';
const FIRMA = 'CG Finance S.A.S.\ncomercial@cgfinance.co · WhatsApp +57 300 428 7902 · cgfinance.co';

const TEXTO_EMPRESAS = ({ nombre, empresa }) => `Hola, ${nombre}:

Espero que estés muy bien. Te comparto adjunto el portafolio de CG Finance S.A.S, donde encontrarás nuestras soluciones de acompañamiento financiero y jurídico para empresas.

Podemos apoyarles en temas como la gestión de crédito empresarial, la planeación financiera, el control gerencial con Pulso Gerencial, el CFO fraccional y la automatización de procesos financieros. El acompañamiento se adapta a las necesidades de cada empresa y se integra con su contabilidad o ERP, sin reemplazar al contador ni cambiar su operación.

Me gustaría conocer los objetivos y retos actuales de ${empresa} para conversar sobre qué soluciones podrían ser más útiles. La primera consulta de diagnóstico no tiene costo ni compromiso.

¿Te parece si coordinamos una conversación? Puedes responder a este correo o escribirme por WhatsApp al +57 300 428 7902.

${FIRMA}
`;

const PORTAFOLIOS = {
  empresas: { texto: TEXTO_EMPRESAS, archivo: 'portafolio_empresas.pdf', pdf: () => require('./_portafolio_empresas.js') },
  personas: { texto: null, archivo: 'portafolio_personas.pdf', pdf: () => require('./_portafolio_personas.js') }   // texto pendiente
};
const primerNombre = n => String(n || '').trim().split(/\s+/)[0] || '';
module.exports = { ASUNTO, PORTAFOLIOS, primerNombre };
