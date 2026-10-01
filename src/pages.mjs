// Contenido de cada página de error personalizada de Cloudflare.
//
// slug   -> nombre del archivo generado en dist/ (se publica en /<slug>)
// type   -> identificador del tipo de página en Cloudflare (Custom Pages / API)
// token  -> token obligatorio que Cloudflare exige para aceptar la página
// nodes  -> estado de [navegador, Cloudflare, sitio]: ok | fail | block | wait | idle
// lines  -> estado de los tramos [navegador→Cloudflare, Cloudflare→sitio]: ok | bad | wait | idle

const RETRY = '<a class="retry" href="javascript:location.reload()">Volver a intentar</a>';
const HOME = '<a class="retry" href="/">Ir a la página de inicio</a>';

export const pages = [
  {
    slug: '1000',
    type: '1000_errors',
    label: 'Errores clase 1000',
    token: '::CLOUDFLARE_ERROR_1000S_BOX::',
    code: 'Error 1xxx',
    heading: 'Este sitio no está disponible por ahora',
    lead: 'El sitio tiene un problema de configuración que impide mostrar la página. Tu navegador y la protección de Cloudflare funcionan bien.',
    aria: 'Tu navegador funciona. Cloudflare funciona. El sitio web no está configurado correctamente.',
    nodes: [
      ['ok', 'Tu navegador', 'Funciona'],
      ['ok', 'Cloudflare', 'Funciona'],
      ['fail', 'Este sitio', 'Mal configurado'],
    ],
    lines: ['ok', 'bad'],
    steps: [
      'Vuelve a intentarlo en unos minutos. Si el equipo del sitio ya lo está corrigiendo, se resolverá solo.',
      'Si el problema continúa, avisa a quien administra el sitio e indícale el ID de Ray que aparece abajo.',
    ],
    action: RETRY,
  },
  {
    slug: '500',
    type: '500_errors',
    label: 'Errores clase 500',
    token: '::CLOUDFLARE_ERROR_500S_BOX::',
    code: 'Error 5xx',
    heading: 'El sitio no responde en este momento',
    lead: 'El servidor del sitio no pudo completar tu solicitud. Tu navegador y Cloudflare funcionan bien; el problema está en el servidor de origen.',
    aria: 'Tu navegador funciona. Cloudflare funciona. El servidor del sitio no responde.',
    nodes: [
      ['ok', 'Tu navegador', 'Funciona'],
      ['ok', 'Cloudflare', 'Funciona'],
      ['fail', 'Este sitio', 'No responde'],
    ],
    lines: ['ok', 'bad'],
    steps: [
      'Espera unos minutos y vuelve a intentarlo. Puede tratarse de un mantenimiento o de un pico de tráfico.',
      'Si el error persiste, avisa a quien administra el sitio e indícale el ID de Ray que aparece abajo.',
    ],
    action: RETRY,
  },
  {
    slug: 'waf-block',
    type: 'waf_block',
    label: 'Bloqueo del WAF',
    token: '::CLOUDFLARE_ERROR_1000S_BOX::',
    code: 'Error 403 · Firewall',
    heading: 'Tu solicitud fue bloqueada',
    lead: 'El firewall de Cloudflare detectó en esta solicitud algo que coincide con una regla de seguridad del sitio y la detuvo antes de que llegara.',
    aria: 'Tu navegador envió la solicitud. Cloudflare la bloqueó. El sitio no la recibió.',
    nodes: [
      ['ok', 'Tu navegador', 'Envió la solicitud'],
      ['block', 'Cloudflare', 'La bloqueó'],
      ['idle', 'Este sitio', 'No la recibió'],
    ],
    lines: ['ok', 'idle'],
    steps: [
      'Si estabas enviando un formulario, revisa su contenido: fragmentos de código o ciertos caracteres especiales pueden activar las reglas de seguridad.',
      'Desactiva extensiones del navegador, VPN o proxys que puedan modificar tus solicitudes y vuelve a intentarlo.',
      'Si crees que es un error, contacta a quien administra el sitio e indícale el ID de Ray que aparece abajo.',
    ],
    action: HOME,
  },
  {
    slug: 'ip-block',
    type: 'ip_block',
    label: 'Bloqueo por IP o país',
    token: '::CLOUDFLARE_ERROR_1000S_BOX::',
    code: 'Error 403 · Acceso restringido',
    heading: 'El acceso desde tu red no está permitido',
    lead: 'Quien administra el sitio restringió el acceso desde tu dirección IP o desde tu región. No es un fallo de tu navegador ni de tu conexión.',
    aria: 'Tu navegador funciona. Cloudflare restringió el acceso. El sitio no está disponible para tu red.',
    nodes: [
      ['ok', 'Tu navegador', 'Funciona'],
      ['block', 'Cloudflare', 'Acceso restringido'],
      ['idle', 'Este sitio', 'Sin acceso'],
    ],
    lines: ['ok', 'idle'],
    steps: [
      'Si usas una VPN o un proxy, desconéctalo y vuelve a intentarlo.',
      'Prueba desde otra red, por ejemplo tus datos móviles en lugar del wifi.',
      'Si necesitas acceso, contacta a quien administra el sitio e indícale tu IP y el ID de Ray que aparecen abajo.',
    ],
    action: RETRY,
  },
  {
    slug: 'rate-limit',
    type: 'ratelimit_block',
    label: 'Límite de solicitudes (429)',
    token: '::CLOUDFLARE_ERROR_1000S_BOX::',
    code: 'Error 429',
    heading: 'Demasiadas solicitudes en poco tiempo',
    lead: 'Recibimos muchas solicitudes desde tu conexión en muy poco tiempo, así que el acceso se pausó temporalmente para proteger el sitio.',
    aria: 'Tu navegador funciona. Cloudflare pausó el acceso temporalmente. El sitio está disponible.',
    nodes: [
      ['ok', 'Tu navegador', 'Funciona'],
      ['wait', 'Cloudflare', 'Acceso en pausa'],
      ['idle', 'Este sitio', 'Disponible'],
    ],
    lines: ['ok', 'wait'],
    steps: [
      'Espera uno o dos minutos antes de volver a intentarlo. La pausa se levanta sola.',
      'Evita recargar la página repetidamente: cada recarga cuenta como una solicitud nueva.',
      'Si compartes red (oficina, universidad o VPN), las solicitudes de otras personas también pueden sumar al límite.',
    ],
    action: RETRY,
  },
  {
    slug: 'managed-challenge',
    type: 'managed_challenge',
    label: 'Desafío gestionado / Modo "Estoy bajo ataque"',
    token: '::CAPTCHA_BOX::',
    code: 'Verificación de seguridad',
    heading: 'Comprobando que eres una persona',
    lead: 'Antes de continuar, Cloudflare necesita verificar tu navegador. Normalmente solo tarda unos segundos.',
    aria: 'Tu navegador funciona. Cloudflare está verificando la conexión. El sitio te espera.',
    nodes: [
      ['ok', 'Tu navegador', 'Funciona'],
      ['wait', 'Cloudflare', 'Verificando'],
      ['idle', 'Este sitio', 'En espera'],
    ],
    lines: ['ok', 'wait'],
    challenge: true,
    steps: [
      'Si aparece una casilla o una prueba, complétala para continuar.',
      'Asegúrate de tener activados JavaScript y las cookies en tu navegador.',
      'Si la verificación no termina, desactiva las extensiones que bloquean scripts y recarga la página.',
    ],
  },
  {
    slug: 'country-challenge',
    type: 'country_challenge',
    label: 'Desafío por IP o país',
    token: '::CAPTCHA_BOX::',
    code: 'Verificación de seguridad',
    heading: 'Necesitamos una verificación adicional',
    lead: 'Las visitas desde tu red o tu región requieren una comprobación rápida antes de acceder al sitio.',
    aria: 'Tu navegador funciona. Cloudflare solicita una verificación adicional. El sitio te espera.',
    nodes: [
      ['ok', 'Tu navegador', 'Funciona'],
      ['wait', 'Cloudflare', 'Verificación extra'],
      ['idle', 'Este sitio', 'En espera'],
    ],
    lines: ['ok', 'wait'],
    challenge: true,
    steps: [
      'Completa la verificación de arriba para continuar.',
      'Si usas una VPN o un proxy, desconectarlo puede evitar esta comprobación en el futuro.',
      'Asegúrate de tener activados JavaScript y las cookies en tu navegador.',
    ],
  },
];
