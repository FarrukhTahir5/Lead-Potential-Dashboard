import React from 'react';
import { Lead } from '../types/scoring';

interface Props {
    leads: Lead[];
}

export const SummaryCards: React.FC<Props> = ({ leads }) => {
    const highPriority = leads.filter(l => l.priority === 'High').length;
    const totalPotentialRevenue = leads.reduce((acc, l) => acc + l.potentialRevenue, 0);
    const avgScore = Math.round(leads.reduce((acc, l) => acc + l.score, 0) / (leads.length || 1));
    const conversionOpp = leads.filter(l => l.customer.servicePlanStatus === 'none').length;

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `Rs. ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `Rs. ${(val / 1000).toFixed(0)}k`;
        return `Rs. ${val}`;
    };

    const cards = [
        { label: 'Total Systems Analyzed', value: leads.length, sub: 'Live from API', color: 'var(--primary-color)' },
        { label: 'Potential LTV Revenue', value: formatCurrency(totalPotentialRevenue), sub: '3-Year Projection', color: 'var(--success)' },
        { label: 'Avg. Potential Score', value: avgScore, sub: 'Priority Index', color: 'var(--secondary-color)' },
        { label: 'Service Conversions', value: conversionOpp, sub: 'Systems without plan', color: 'var(--high-priority-text)' },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {cards.map((card, i) => (
                <div key={i} className="glass-card" style={{ padding: '24px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>{card.label}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{card.sub}</p>
                </div>
            ))}
        </div>
    );
};
