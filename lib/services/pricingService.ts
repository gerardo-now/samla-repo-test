/**
 * Pricing Service
 * 
 * Handles plan and pricing management for global admin
 */

import { db } from '@/lib/db';

export async function getAllPlans() {
  return db.plan.findMany({
    include: {
      planRegions: {
        include: {
          region: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getPlanByCode(code: string) {
  return db.plan.findUnique({
    where: { code },
    include: {
      planRegions: {
        include: {
          region: true,
        },
      },
    },
  });
}

export async function createPlan(data: {
  code: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  sortOrder?: number;
}) {
  return db.plan.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      isPublic: data.isPublic ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updatePlan(
  id: string,
  data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    isActive?: boolean;
    sortOrder?: number;
  }
) {
  return db.plan.update({
    where: { id },
    data,
  });
}

export async function createPlanRegion(data: {
  planId: string;
  regionCode: string;
  currency: string;
  displayPriceMonthly: number;
  stripePriceId?: string;
  includedCallMinutes: number;
  includedWhatsappConversations: number;
  includedSeats?: number;
  includedAgents?: number;
  includedPhoneNumbers?: number;
  overageCallMinutePrice: number;
  overageWhatsappConversationPrice: number;
  limitMode?: 'SOFT' | 'HARD';
}) {
  return db.planRegion.create({
    data: {
      planId: data.planId,
      regionCode: data.regionCode,
      currency: data.currency,
      displayPriceMonthly: data.displayPriceMonthly,
      stripePriceId: data.stripePriceId,
      includedCallMinutes: data.includedCallMinutes,
      includedWhatsappConversations: data.includedWhatsappConversations,
      includedSeats: data.includedSeats,
      includedAgents: data.includedAgents,
      includedPhoneNumbers: data.includedPhoneNumbers,
      overageCallMinutePrice: data.overageCallMinutePrice,
      overageWhatsappConversationPrice: data.overageWhatsappConversationPrice,
      limitMode: data.limitMode ?? 'SOFT',
    },
  });
}

export async function updatePlanRegion(
  id: string,
  data: {
    currency?: string;
    displayPriceMonthly?: number;
    stripePriceId?: string;
    includedCallMinutes?: number;
    includedWhatsappConversations?: number;
    includedSeats?: number;
    includedAgents?: number;
    includedPhoneNumbers?: number;
    overageCallMinutePrice?: number;
    overageWhatsappConversationPrice?: number;
    limitMode?: 'SOFT' | 'HARD';
    isActive?: boolean;
  }
) {
  // Increment version on update
  const current = await db.planRegion.findUnique({ where: { id } });

  return db.planRegion.update({
    where: { id },
    data: {
      ...data,
      version: (current?.version ?? 0) + 1,
    },
  });
}

export async function getAllRegions() {
  return db.region.findMany({
    include: {
      countryMaps: true,
      _count: {
        select: { planRegions: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function createRegion(data: { code: string; name: string }) {
  return db.region.create({
    data: {
      code: data.code,
      name: data.name,
    },
  });
}

export async function updateRegion(
  id: string,
  data: { name?: string; isActive?: boolean }
) {
  return db.region.update({
    where: { id },
    data,
  });
}

export async function setCountryRegion(countryCode: string, regionCode: string) {
  return db.countryRegionMap.upsert({
    where: { countryCode },
    create: { countryCode, regionCode },
    update: { regionCode },
  });
}

export async function getRegionForCountry(countryCode: string): Promise<string> {
  const mapping = await db.countryRegionMap.findUnique({
    where: { countryCode },
  });

  // Default region if not found
  return mapping?.regionCode ?? 'NA';
}

export async function updateRegionCostAssumptions(
  regionCode: string,
  data: {
    callCostPerMinute: number;
    whatsappCostPerConversation: number;
    aiCostPerUnit?: number;
  }
) {
  return db.regionCostAssumption.upsert({
    where: { regionCode },
    create: {
      regionCode,
      callCostPerMinute: data.callCostPerMinute,
      whatsappCostPerConversation: data.whatsappCostPerConversation,
      aiCostPerUnit: data.aiCostPerUnit,
    },
    update: {
      callCostPerMinute: data.callCostPerMinute,
      whatsappCostPerConversation: data.whatsappCostPerConversation,
      aiCostPerUnit: data.aiCostPerUnit,
    },
  });
}

