/* Propuesta comercial que se envía automáticamente al cliente que llena el formulario.
   Los textos son los que entregó CG Finance; no se agrega ningún dato, precio, promesa ni enlace.
   Si algún portafolio queda con texto null, no se envía nada a ese tipo de cliente. */
const ASUNTO = 'Portafolio de CG Finance S.A.S.';
const FIRMA = 'CG Finance S.A.S.\ncomercial@cgfinance.co · WhatsApp +57 300 428 7902 · cgfinance.co';

const TEXTO_EMPRESAS = ({ nombre, empresa }) => `Hola, ${nombre}:

Espero que estés muy bien. Te comparto adjunto el portafolio de CG Finance S.A.S, donde encontrarás nuestras soluciones de acompañamiento financiero y jurídico para empresas.

Podemos apoyarles en temas como la gestión de crédito empresarial, la planeación financiera, el control gerencial con Pulso Gerencial, el CFO fraccional y la automatización de procesos financieros. El acompañamiento se adapta a las necesidades de cada empresa y se integra con su contabilidad o ERP, sin reemplazar al contador ni cambiar su operación.

Me gustaría conocer los objetivos y retos actuales de ${empresa} para conversar sobre qué soluciones podrían ser más útiles. La primera consulta de diagnóstico no tiene costo ni compromiso.

¿Te parece si coordinamos una conversación? Puedes responder a este correo o escribirme por WhatsApp al +57 300 428 7902.

${FIRMA}
`;

const TEXTO_PERSONAS = ({ nombre }) => `Hola, ${nombre}:

Espero que estés muy bien. Te comparto adjunto el portafolio de CG Finance S.A.S, donde encontrarás nuestro acompañamiento financiero y jurídico para personas.

Podemos acompañarte a ordenar tus ingresos, gastos, deudas y metas con planeación financiera personal, y a hacer seguimiento a tus gastos y presupuesto con Pulso Financiero, nuestra app de control financiero personal. Si lo necesitas, también te orientamos en asesoría jurídica, como insolvencia de persona natural y reestructuración de deudas, con abogados aliados especializados.

Me gustaría conocer tu situación y tus metas para conversar sobre cuál de estos caminos podría ser el más útil para ti. La primera consulta de diagnóstico no tiene costo ni compromiso.

¿Te parece si coordinamos una conversación? Puedes responder a este correo o escribirme por WhatsApp al +57 300 428 7902.

${FIRMA}
`;

const PORTAFOLIOS = {
  empresas: { texto: TEXTO_EMPRESAS, archivo: 'portafolio_empresas.pdf', pdf: () => require('./_portafolio_empresas.js') },
  personas: { texto: TEXTO_PERSONAS, archivo: 'portafolio_personas.pdf', pdf: () => require('./_portafolio_personas.js') }
};
const primerNombre = n => String(n || '').trim().split(/\s+/)[0] || '';
module.exports = { ASUNTO, PORTAFOLIOS, primerNombre };
