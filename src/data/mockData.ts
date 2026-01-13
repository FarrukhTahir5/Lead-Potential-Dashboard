import { Customer, Lead } from '../types/scoring';
import { calculateLeadScore } from '../services/scoringService';

const firstNames = ['Arshad', 'Fatima', 'Zia', 'Meher', 'Osman', 'Sana', 'Hamza', 'Layla', 'Bilal', 'Zainab'];
const lastNames = ['Khan', 'Ahmed', 'Malik', 'Sheikh', 'Qureshi', 'Iqbal', 'Hassan', 'Farooq'];

const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export const generateMockLeads = (count: number): Lead[] => {
    const customers: Customer[] = Array.from({ length: count }, (_, i) => ({
        id: `CUST-${1000 + i}`,
        name: `${firstNames[getRandom(0, firstNames.length - 1)]} ${lastNames[getRandom(0, lastNames.length - 1)]}`,
        email: `customer${i}@example.com`,
        systemSizeKw: getRandom(5, 20),
        systemAgeYears: getRandom(1, 8),
        healthScore: getRandom(75, 98), // Keeping it high as requested (no technical fault)
        chatbotEngagement: getRandom(0, 15),
        servicePlanStatus: i % 3 === 0 ? 'none' : (i % 3 === 1 ? 'basic' : 'premium'),
        lastServiceDate: `2024-${getRandom(1, 12).toString().padStart(2, '0')}-01`,
        estimatedLtv: getRandom(5000, 25000),
        nonCriticalIssuesCount: getRandom(0, 3)
    }));

    return customers.map(calculateLeadScore);
};

export const mockLeads = generateMockLeads(50);
