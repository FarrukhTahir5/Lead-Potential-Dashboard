export interface Customer {
    id: string;
    name: string;
    email: string;
    systemSizeKw: number;
    systemAgeYears: number;
    healthScore: number; // 0-100
    chatbotEngagement: number; // instances per month
    servicePlanStatus: 'none' | 'basic' | 'premium';
    lastServiceDate: string;
    estimatedLtv: number;
    nonCriticalIssuesCount: number;
    city?: string;
}

export type PriorityBand = 'High' | 'Medium' | 'Low';

export interface LeadScoreBreakdown {
    ageWeight: number;
    engagementWeight: number;
    healthWeight: number;
    valueWeight: number;
    statusWeight: number;
}

export interface Lead {
    customer: Customer;
    score: number;
    priority: PriorityBand;
    breakdown: LeadScoreBreakdown;
    recommendedAction: string;
    potentialRevenue: number;
}
