# SAMLA - Plataforma de Conversaciones con IA

**Una bandeja. Cada conversación.**

SAMLA es una plataforma SaaS multi-tenant de plug-and-play para conversaciones con IA. Permite a usuarios no técnicos conectar WhatsApp y llamadas telefónicas reales, crear agentes de IA con voz humana, gestionar clientes, agendar citas automáticamente, y más.

## ✨ Características

- 📱 **Bandeja Unificada** - WhatsApp + Llamadas en un solo lugar
- 🤖 **Agentes de IA** - Responden automáticamente con voces humanas
- 📅 **Calendario Integrado** - Agenda citas sin fricción
- 👥 **CRM-Lite** - Gestiona clientes y prospectos
- 🔍 **Búsqueda de Leads** - B2B y búsqueda local
- 📞 **Campañas Outbound** - WhatsApp y llamadas programadas
- ⚡ **Automatizaciones** - Triggers basados en eventos
- 💳 **Facturación por Regiones** - Precios y cuotas por país
- 🛡️ **Admin Global** - Panel para gestionar planes y precios sin código

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js Route Handlers, Prisma ORM
- **Database**: PostgreSQL + pgvector (para RAG)
- **Cache/Queues**: Redis + BullMQ
- **Auth**: Clerk
- **Billing**: Stripe

## 📁 Estructura del Proyecto

```
/app
  /(auth)           # Sign in / Sign up
  /(app)            # App protegida
    /home           # Dashboard + Onboarding
    /inbox          # Bandeja unificada
    /contacts       # CRM-Lite
    /agents         # Editor de agentes
    /knowledge      # Base de conocimiento
    /calendar       # Citas
    /triggers       # Automatizaciones
    /leads          # Búsqueda de leads
    /settings       # Configuración
    /admin          # Admin global
  /api              # Route handlers
/components         # Componentes React
/lib
  /providers        # Abstracciones de proveedores externos
  /services         # Lógica de negocio
  /copy             # Strings de UI
/prisma             # Schema y migraciones
```

## 🚀 Instalación Local

### Requisitos

- Node.js 18+
- PostgreSQL 15+
- Redis
- Cuenta de Clerk
- Cuenta de Stripe

### Setup

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd samla-repo-test
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (ver sección abajo)

4. Configurar la base de datos:
```bash
npm run db:push
npm run db:seed
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

---

## 🚂 Variables de Entorno para Railway

### 📋 Configuración Paso a Paso

1. **Crear proyecto en Railway**
2. **Agregar PostgreSQL** → `DATABASE_URL` se configura automáticamente
3. **Agregar Redis** → `REDIS_URL` se configura automáticamente
4. **Configurar las siguientes variables manualmente:**

### 🔐 CLERK - Autenticación (REQUERIDO)
```env
# Obtén en: https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# URLs de redirección
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### 💳 STRIPE - Pagos (REQUERIDO)
```env
# Obtén en: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook: Configura en Stripe → Developers → Webhooks
# Endpoint: https://tu-app.railway.app/api/webhooks/billing
# Eventos: checkout.session.completed, customer.subscription.*, invoice.*
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 📱 KAPSO - WhatsApp Business (REQUERIDO para WhatsApp)
```env
# Contacta: https://kapso.io para credenciales
KAPSO_API_KEY=your_kapso_api_key
KAPSO_WEBHOOK_SECRET=your_kapso_webhook_secret
KAPSO_PHONE_NUMBER_ID=your_phone_number_id
```

### 🎙️ ELEVENLABS - Voces con IA (REQUERIDO para voces)
```env
# Obtén en: https://elevenlabs.io → Profile → API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### 📞 TWILIO - Telefonía (REQUERIDO para llamadas)
```env
# Obtén en: https://console.twilio.com
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 📅 GOOGLE CALENDAR (Opcional)
```env
# Configura en: https://console.cloud.google.com
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=https://tu-app.railway.app/api/auth/google/callback
```

### 🔍 APOLLO.IO - Leads B2B (Opcional)
```env
# Obtén en: https://app.apollo.io → Settings → API
# Referencia: https://docs.apollo.io/reference/people-api-search
APOLLO_API_KEY=your_apollo_api_key
```

### 🗺️ APIFY - Búsqueda Local/Maps (Opcional)
```env
# Obtén en: https://console.apify.com → Settings → Integrations → API
# Usa el actor: compass/crawler-google-places
# Referencia: https://apify.com/compass/crawler-google-places
APIFY_API_TOKEN=your_apify_api_token
```

### 📦 S3 STORAGE - Archivos (Opcional)
```env
# AWS S3 o compatible (Cloudflare R2, etc)
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=samla-files
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
```

### 🌐 APLICACIÓN
```env
NEXT_PUBLIC_APP_URL=https://tu-app.railway.app
NODE_ENV=production
```

---

## ✅ Checklist de Deploy en Railway

- [ ] PostgreSQL agregado
- [ ] Redis agregado
- [ ] Variables de Clerk configuradas
- [ ] Variables de Stripe configuradas
- [ ] Webhook de Stripe apuntando a `/api/webhooks/billing`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm run start`

## 📜 Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run lint         # Linter
npm run db:generate  # Generar Prisma client
npm run db:push      # Push schema a DB
npm run db:migrate   # Crear migración
npm run db:seed      # Sembrar datos demo
npm run db:studio    # Prisma Studio
```

## 🐳 Docker

```bash
docker build -t samla .
docker run -p 3000:3000 --env-file .env samla
```

## ⚠️ Regla de UI Crítica

**NUNCA** mostrar nombres de proveedores (Twilio, ElevenLabs, Stripe, etc.) en la UI. Todo el copy está centralizado en `/lib/copy/uiStrings.ts`.

## 🛡️ Admin Global

El panel de administración (`/admin`) permite:

- Gestionar planes y precios por región
- Ver métricas de uso y márgenes
- Aplicar excepciones por cliente
- Auditar todos los cambios

Acceso: usuarios con `isSuperAdmin: true`.

---

## 📞 Soporte

Para soporte técnico o preguntas sobre la plataforma, contacta al equipo de desarrollo.

## 📄 Licencia

Propietario - SAMLA © 2025
