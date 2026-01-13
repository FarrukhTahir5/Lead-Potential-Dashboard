import { Customer, Lead, PriorityBand } from '../types/scoring';

export const calculateLeadScore = (customer: Customer): Lead => {
    const weights = {
        age: 0.30,
        engagement: 0.25,
        health: 0.20,
        value: 0.15,
        status: 0.10
    };

    // Age score: Higher for older systems (3+ years)
    const ageScore = Math.min(customer.systemAgeYears / 5, 1) * 100;

    // Engagement score: Higher for frequent chatbot usage
    const engagementScore = Math.min(customer.chatbotEngagement / 10, 1) * 100;

    // Health score inverse: Lower health = higher lead potential (but not critical)
    const healthScore = 100 - customer.healthScore;

    // Value score: Higher for larger systems
    const valueScore = Math.min(customer.systemSizeKw / 15, 1) * 100;

    // Status score: 100 if no plan, 50 if basic, 0 if premium
    const statusScore = customer.servicePlanStatus === 'none' ? 100 : (customer.servicePlanStatus === 'basic' ? 50 : 0);

    const finalScore = Math.round(
        (ageScore * weights.age) +
        (engagementScore * weights.engagement) +
        (healthScore * weights.health) +
        (valueScore * weights.value) +
        (statusScore * weights.status)
    );

    let priority: PriorityBand = 'Low';
    if (finalScore >= 75) priority = 'High';
    else if (finalScore >= 45) priority = 'Medium';

    const recommendedAction = priority === 'High'
        ? 'Schedule Immediate Optimization Consultation'
        : (priority === 'Medium' ? 'Send Personalized Service Upgrade Offer' : 'Add to Monthly Newsletter');

    return {
        customer,
        score: finalScore,
        priority,
        breakdown: {
            ageWeight: Math.round(ageScore * weights.age),
            engagementWeight: Math.round(engagementScore * weights.engagement),
            healthWeight: Math.round(healthScore * weights.health),
            valueWeight: Math.round(valueScore * weights.value),
            statusWeight: Math.round(statusScore * weights.status)
        },
        recommendedAction,
        potentialRevenue: customer.systemSizeKw * 150 // Mock revenue formula
    };
};
