import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create regions
  const regions = await Promise.all([
    prisma.region.upsert({
      where: { code: 'NA' },
      update: {},
      create: { code: 'NA', name: 'Norteamérica' },
    }),
    prisma.region.upsert({
      where: { code: 'LATAM_NORTE' },
      update: {},
      create: { code: 'LATAM_NORTE', name: 'LATAM Norte' },
    }),
    prisma.region.upsert({
      where: { code: 'LATAM_SUR' },
      update: {},
      create: { code: 'LATAM_SUR', name: 'LATAM Sur' },
    }),
    prisma.region.upsert({
      where: { code: 'EU' },
      update: {},
      create: { code: 'EU', name: 'Europa' },
    }),
  ]);

  console.log('✅ Regions created:', regions.length);

  // Create country mappings
  const countryMappings = [
    { countryCode: 'MX', regionCode: 'LATAM_NORTE' },
    { countryCode: 'GT', regionCode: 'LATAM_NORTE' },
    { countryCode: 'CO', regionCode: 'LATAM_NORTE' },
    { countryCode: 'PE', regionCode: 'LATAM_SUR' },
    { countryCode: 'CL', regionCode: 'LATAM_SUR' },
    { countryCode: 'AR', regionCode: 'LATAM_SUR' },
    { countryCode: 'US', regionCode: 'NA' },
    { countryCode: 'CA', regionCode: 'NA' },
    { countryCode: 'ES', regionCode: 'EU' },
  ];

  for (const mapping of countryMappings) {
    await prisma.countryRegionMap.upsert({
      where: { countryCode: mapping.countryCode },
      update: { regionCode: mapping.regionCode },
      create: mapping,
    });
  }

  console.log('✅ Country mappings created:', countryMappings.length);

  // Create plans
  const starterPlan = await prisma.plan.upsert({
    where: { code: 'starter' },
    update: {},
    create: {
      code: 'starter',
      name: 'Inicial',
      description: 'Perfecto para empezar',
      sortOrder: 1,
    },
  });

  const growthPlan = await prisma.plan.upsert({
    where: { code: 'growth' },
    update: {},
    create: {
      code: 'growth',
      name: 'Crecimiento',
      description: 'Para negocios en expansión',
      sortOrder: 2,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: 'pro' },
    update: {},
    create: {
      code: 'pro',
      name: 'Profesional',
      description: 'Para equipos establecidos',
      sortOrder: 3,
    },
  });

  console.log('✅ Plans created: starter, growth, pro');

  // Create plan regions for LATAM_NORTE
  await prisma.planRegion.upsert({
    where: { planId_regionCode: { planId: starterPlan.id, regionCode: 'LATAM_NORTE' } },
    update: {},
    create: {
      planId: starterPlan.id,
      regionCode: 'LATAM_NORTE',
      currency: 'MXN',
      displayPriceMonthly: 499,
      includedCallMinutes: 100,
      includedWhatsappConversations: 500,
      includedSeats: 2,
      includedAgents: 1,
      includedPhoneNumbers: 1,
      overageCallMinutePrice: 1.5,
      overageWhatsappConversationPrice: 0.5,
      limitMode: 'SOFT',
    },
  });

  await prisma.planRegion.upsert({
    where: { planId_regionCode: { planId: growthPlan.id, regionCode: 'LATAM_NORTE' } },
    update: {},
    create: {
      planId: growthPlan.id,
      regionCode: 'LATAM_NORTE',
      currency: 'MXN',
      displayPriceMonthly: 1499,
      includedCallMinutes: 500,
      includedWhatsappConversations: 2000,
      includedSeats: 5,
      includedAgents: 3,
      includedPhoneNumbers: 2,
      overageCallMinutePrice: 1.2,
      overageWhatsappConversationPrice: 0.4,
      limitMode: 'SOFT',
    },
  });

  await prisma.planRegion.upsert({
    where: { planId_regionCode: { planId: proPlan.id, regionCode: 'LATAM_NORTE' } },
    update: {},
    create: {
      planId: proPlan.id,
      regionCode: 'LATAM_NORTE',
      currency: 'MXN',
      displayPriceMonthly: 3999,
      includedCallMinutes: 2000,
      includedWhatsappConversations: 10000,
      includedSeats: 10,
      includedAgents: 10,
      includedPhoneNumbers: 5,
      overageCallMinutePrice: 1.0,
      overageWhatsappConversationPrice: 0.3,
      limitMode: 'SOFT',
    },
  });

  // Create plan regions for NA (USD pricing)
  await prisma.planRegion.upsert({
    where: { planId_regionCode: { planId: starterPlan.id, regionCode: 'NA' } },
    update: {},
    create: {
      planId: starterPlan.id,
      regionCode: 'NA',
      currency: 'USD',
      displayPriceMonthly: 29,
      includedCallMinutes: 100,
      includedWhatsappConversations: 500,
      includedSeats: 2,
      includedAgents: 1,
      includedPhoneNumbers: 1,
      overageCallMinutePrice: 0.10,
      overageWhatsappConversationPrice: 0.03,
      limitMode: 'SOFT',
    },
  });

  await prisma.planRegion.upsert({
    where: { planId_regionCode: { planId: growthPlan.id, regionCode: 'NA' } },
    update: {},
    create: {
      planId: growthPlan.id,
      regionCode: 'NA',
      currency: 'USD',
      displayPriceMonthly: 89,
      includedCallMinutes: 500,
      includedWhatsappConversations: 2000,
      includedSeats: 5,
      includedAgents: 3,
      includedPhoneNumbers: 2,
      overageCallMinutePrice: 0.08,
      overageWhatsappConversationPrice: 0.025,
      limitMode: 'SOFT',
    },
  });

  console.log('✅ Plan regions created for LATAM_NORTE and NA');

  // Create region cost assumptions
  await prisma.regionCostAssumption.upsert({
    where: { regionCode: 'LATAM_NORTE' },
    update: {},
    create: {
      regionCode: 'LATAM_NORTE',
      callCostPerMinute: 0.35,
      whatsappCostPerConversation: 0.08,
      aiCostPerUnit: 0.001,
    },
  });

  await prisma.regionCostAssumption.upsert({
    where: { regionCode: 'NA' },
    update: {},
    create: {
      regionCode: 'NA',
      callCostPerMinute: 0.02,
      whatsappCostPerConversation: 0.005,
      aiCostPerUnit: 0.001,
    },
  });

  console.log('✅ Region cost assumptions created');

  // Create system voices
  const voices = [
    { name: 'Sofia', language: 'es-MX', tone: 'Amigable', externalId: 'voice_sofia' },
    { name: 'Carlos', language: 'es-MX', tone: 'Profesional', externalId: 'voice_carlos' },
    { name: 'María', language: 'es-ES', tone: 'Formal', externalId: 'voice_maria' },
    { name: 'Diego', language: 'es-MX', tone: 'Casual', externalId: 'voice_diego' },
  ];

  for (const voice of voices) {
    await prisma.voice.upsert({
      where: { id: voice.externalId },
      update: {},
      create: {
        id: voice.externalId,
        name: voice.name,
        language: voice.language,
        tone: voice.tone,
        externalId: voice.externalId,
        isPublic: true,
        isCustom: false,
      },
    });
  }

  console.log('✅ System voices created:', voices.length);

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Demo data summary:');
  console.log('  - 4 regions (NA, LATAM_NORTE, LATAM_SUR, EU)');
  console.log('  - 9 country mappings');
  console.log('  - 3 plans (starter, growth, pro)');
  console.log('  - 5 plan-region pricing configurations');
  console.log('  - 2 region cost assumptions');
  console.log('  - 4 system voices');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

