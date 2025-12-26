/**
 * SAMLA UI Strings - Spanish (MX-neutral)
 * 
 * CRITICAL: This file contains all user-facing text.
 * Provider names must NEVER appear in UI copy.
 * 
 * Forbidden words in UI: twilio, elevenlabs, kapso, apollo, apify, google, outlook, stripe
 */

export const UI = {
  // Brand
  brand: {
    name: "SAMLA",
    tagline: "Tu plataforma de conversaciones con IA",
    slogan: "Una bandeja. Cada conversación.",
  },

  // Navigation
  nav: {
    home: "Inicio",
    inbox: "Bandeja",
    contacts: "Clientes",
    leads: "Búsqueda de leads",
    agents: "Agentes",
    knowledge: "Base de conocimiento",
    calendar: "Calendario",
    triggers: "Automatizaciones",
    settings: "Configuración",
    admin: "Administración",
  },

  // Onboarding Checklist
  onboarding: {
    title: "Configura tu espacio",
    subtitle: "Completa estos pasos para empezar",
    steps: {
      whatsapp: "Conecta mensajería",
      phone: "Conecta llamadas telefónicas",
      calendar: "Conecta calendario",
      agent: "Crea un agente",
      voice: "Elige una voz",
      knowledge: "Agrega material",
      liveMode: "Activa modo en vivo",
      billing: "Configura tu plan",
    },
    complete: "¡Configuración completa!",
  },

  // Live Mode
  liveMode: {
    label: "Modo en vivo",
    on: "Activado",
    off: "Desactivado",
    description: "Cuando está activado, los agentes responden automáticamente",
  },

  // Inbox
  inbox: {
    title: "Bandeja de entrada",
    empty: "No hay conversaciones",
    emptySubtitle: "Las conversaciones aparecerán aquí",
    tabs: {
      all: "Todas",
      open: "Abiertas",
      closed: "Cerradas",
    },
    channels: {
      whatsapp: "Mensajería",
      phone: "Llamadas",
    },
    message: {
      you: "Tú",
      agent: "Agente",
      system: "Sistema",
    },
  },

  // Contacts / CRM
  contacts: {
    title: "Clientes",
    addNew: "Agregar cliente",
    status: {
      prospect: "Prospecto",
      client: "Cliente",
      lost: "Perdido",
    },
    fields: {
      name: "Nombre",
      phone: "Teléfono",
      email: "Correo",
      company: "Empresa",
      status: "Estado",
      clientSince: "Cliente desde",
      debtSince: "Debe desde",
      debtAmount: "Monto adeudado",
      lastContact: "Último contacto",
      nextAction: "Próxima acción",
    },
    tabs: {
      overview: "General",
      timeline: "Historial",
      tasks: "Tareas",
      notes: "Notas",
    },
  },

  // Tasks
  tasks: {
    title: "Tareas",
    addNew: "Nueva tarea",
    status: {
      pending: "Pendiente",
      inProgress: "En progreso",
      completed: "Completada",
      cancelled: "Cancelada",
    },
    priority: {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
    },
  },

  // Agents
  agents: {
    title: "Agentes",
    addNew: "Crear agente",
    templates: {
      sales: "Ventas",
      support: "Soporte",
      collections: "Cobranza",
      custom: "Personalizado",
    },
    fields: {
      name: "Nombre del agente",
      template: "Plantilla",
      tone: "Tono",
      voice: "Voz del agente",
      goals: "Objetivos",
      knowledge: "Base de conocimiento",
      tools: "Herramientas",
    },
    tools: {
      sendWhatsapp: "Enviar mensaje",
      scheduleMeeting: "Agendar cita",
      createTask: "Crear tarea",
      tagContact: "Etiquetar contacto",
    },
    tones: {
      professional: "Profesional",
      friendly: "Amigable",
      formal: "Formal",
      casual: "Casual",
    },
  },

  // Voice
  voice: {
    title: "Voces",
    library: "Biblioteca de voces",
    addCustom: "Agregar voz",
    preview: "Escuchar",
    fields: {
      name: "Nombre",
      language: "Idioma",
      tone: "Tono",
    },
    clone: {
      title: "Clonar voz",
      upload: "Subir muestra de audio",
      disclosure: "Confirmo que tengo derechos y consentimiento para usar esta voz",
      consent: "Acepto los términos de uso de voces personalizadas",
    },
  },

  // Knowledge Base
  knowledge: {
    title: "Base de conocimiento",
    addCollection: "Nueva colección",
    addSource: "Agregar material",
    sourceTypes: {
      pdf: "Documento PDF",
      url: "Página web",
      faq: "Preguntas frecuentes",
      text: "Texto libre",
    },
    status: {
      pending: "Pendiente",
      processing: "Procesando",
      ready: "Listo",
      failed: "Error",
    },
  },

  // Calendar
  calendar: {
    title: "Calendario",
    connect: "Conectar calendario",
    disconnect: "Desconectar",
    upcoming: "Próximas citas",
    settings: {
      workingHours: "Horario laboral",
      workingDays: "Días laborales",
      buffer: "Tiempo entre citas",
      duration: "Duración predeterminada",
      defaultCalendar: "Calendario predeterminado",
    },
    days: {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    },
    event: {
      scheduled: "Cita agendada",
      confirmed: "Confirmada",
      cancelled: "Cancelada",
    },
  },

  // Triggers
  triggers: {
    title: "Automatizaciones",
    addNew: "Nueva automatización",
    triggerTypes: {
      keyword: "Palabra clave",
      callOutcome: "Resultado de llamada",
      noReply: "Sin respuesta",
      overdueTask: "Tarea vencida",
      newContact: "Nuevo contacto",
      scheduleEvent: "Evento programado",
    },
    actions: {
      sendWhatsapp: "Enviar mensaje",
      startCall: "Iniciar llamada",
      createTask: "Crear tarea",
      scheduleFollowup: "Programar seguimiento",
    },
    conditions: {
      if: "Si",
      then: "Entonces",
      and: "Y",
      or: "O",
    },
  },

  // Lead Search
  leads: {
    title: "Búsqueda de leads",
    b2b: {
      title: "Búsqueda empresarial",
      search: "Buscar empresas",
    },
    maps: {
      title: "Búsqueda local",
      search: "Buscar negocios",
    },
    lists: {
      title: "Listas guardadas",
      create: "Nueva lista",
    },
    save: "Guardar selección",
    import: "Importar a clientes",
  },

  // Campaigns
  campaigns: {
    title: "Campañas",
    addNew: "Nueva campaña",
    types: {
      whatsapp: "Mensajería",
      phone: "Llamadas",
    },
    status: {
      draft: "Borrador",
      scheduled: "Programada",
      running: "En curso",
      paused: "Pausada",
      completed: "Completada",
      cancelled: "Cancelada",
    },
    fields: {
      name: "Nombre",
      type: "Tipo",
      list: "Lista de leads",
      agent: "Agente",
      callerId: "Número saliente",
      schedule: "Programación",
      window: "Ventana de llamadas",
      pace: "Llamadas por hora",
      fallback: "Enviar mensaje si no contesta",
    },
  },

  // Phone / Calls
  calls: {
    title: "Llamadas",
    incoming: "Entrante",
    outgoing: "Saliente",
    status: {
      initiated: "Iniciando",
      ringing: "Timbrando",
      inProgress: "En curso",
      completed: "Completada",
      failed: "Fallida",
      busy: "Ocupado",
      noAnswer: "Sin respuesta",
      cancelled: "Cancelada",
    },
    outcomes: {
      answered: "Contestada",
      voicemail: "Buzón de voz",
      noAnswer: "Sin respuesta",
      busy: "Ocupado",
      failed: "Fallida",
      scheduledMeeting: "Cita agendada",
      sentInfo: "Información enviada",
      callbackRequested: "Solicita devolución",
    },
    recording: "Grabación",
    transcript: "Transcripción",
  },

  // Settings
  settings: {
    title: "Configuración",
    tabs: {
      general: "General",
      team: "Equipo",
      channels: "Canales",
      callerId: "Números salientes",
      calendar: "Calendario",
      voices: "Voces",
      templates: "Plantillas",
      billing: "Plan y facturación",
    },
    general: {
      workspace: "Espacio de trabajo",
      name: "Nombre",
      timezone: "Zona horaria",
    },
    team: {
      members: "Miembros",
      invite: "Invitar",
      roles: {
        owner: "Propietario",
        admin: "Administrador",
        member: "Miembro",
      },
    },
    callerId: {
      title: "Números salientes",
      add: "Agregar número",
      verify: "Verificar",
      default: "Predeterminado",
    },
  },

  // Billing
  billing: {
    title: "Plan y facturación",
    currentPlan: "Plan actual",
    nextRenewal: "Próxima renovación",
    usage: "Uso del período",
    included: "Incluido",
    used: "Usado",
    remaining: "Disponible",
    callMinutes: "Minutos de llamada",
    whatsappConversations: "Conversaciones",
    seats: "Usuarios",
    agents: "Agentes",
    phoneNumbers: "Números telefónicos",
    manageBilling: "Administrar pago",
    changePlan: "Cambiar plan",
    plans: {
      starter: "Inicial",
      growth: "Crecimiento",
      pro: "Profesional",
      enterprise: "Empresarial",
    },
    perMonth: "/mes",
    warnings: {
      approaching: "Te estás acercando a tu límite",
      exceeded: "Has excedido tu límite incluido",
    },
    cta: {
      upgrade: "Mejorar plan",
      subscribe: "Suscribirse",
    },
  },

  // Admin (Global)
  admin: {
    title: "Administración",
    tabs: {
      plans: "Planes y precios",
      usage: "Uso y márgenes",
      customers: "Clientes",
      overrides: "Excepciones",
      audit: "Auditoría",
    },
    plans: {
      title: "Planes",
      addPlan: "Nuevo plan",
      regions: "Regiones",
      addRegion: "Nueva región",
      pricing: "Precios por región",
    },
    usage: {
      title: "Uso y márgenes",
      byRegion: "Por región",
      byWorkspace: "Por cliente",
      metrics: {
        mrr: "Ingresos mensuales",
        activeSubscriptions: "Suscripciones activas",
        totalMinutes: "Minutos totales",
        totalConversations: "Conversaciones totales",
        estimatedCogs: "Costo estimado",
        estimatedMargin: "Margen estimado",
      },
    },
    customers: {
      title: "Clientes",
      details: "Detalles",
      usageHistory: "Historial de uso",
    },
    overrides: {
      title: "Excepciones",
      add: "Nueva excepción",
    },
    audit: {
      title: "Auditoría",
      action: "Acción",
      user: "Usuario",
      timestamp: "Fecha",
      changes: "Cambios",
    },
  },

  // Common
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    update: "Actualizar",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    search: "Buscar",
    filter: "Filtrar",
    export: "Exportar",
    import: "Importar",
    loading: "Cargando...",
    noResults: "Sin resultados",
    confirm: "Confirmar",
    yes: "Sí",
    no: "No",
    active: "Activo",
    inactive: "Inactivo",
    enabled: "Habilitado",
    disabled: "Deshabilitado",
    all: "Todos",
    none: "Ninguno",
    select: "Seleccionar",
    optional: "Opcional",
    required: "Requerido",
    actions: "Acciones",
    status: "Estado",
    date: "Fecha",
    time: "Hora",
    name: "Nombre",
    description: "Descripción",
    phone: "Teléfono",
    email: "Correo electrónico",
    success: "¡Listo!",
    error: "Error",
    warning: "Atención",
    info: "Información",
  },

  // Errors
  errors: {
    generic: "Algo salió mal. Intenta de nuevo.",
    notFound: "No encontrado",
    unauthorized: "No autorizado",
    forbidden: "Acceso denegado",
    validation: "Revisa los campos marcados",
    network: "Error de conexión",
    server: "Error del servidor",
  },

  // Time
  time: {
    justNow: "Ahora",
    minutesAgo: "hace {n} min",
    hoursAgo: "hace {n} h",
    daysAgo: "hace {n} días",
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
  },
} as const;

export type UIStrings = typeof UI;

