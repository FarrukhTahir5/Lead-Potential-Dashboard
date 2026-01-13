import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Lead } from '../types/scoring';

interface Props {
    leads: Lead[];
}

export const RevenueCharts: React.FC<Props> = ({ leads }) => {
    // 1. Revenue by Priority
    const revenueData = useMemo(() => {
        const stats = { 'High': 0, 'Medium': 0, 'Low': 0 };
        leads.forEach(l => {
            if (stats[l.priority] !== undefined) {
                stats[l.priority] += l.potentialRevenue;
            }
        });
        return [
            { name: 'High Priority', revenue: stats['High'], fill: '#ef4444' },
            { name: 'Medium Priority', revenue: stats['Medium'], fill: '#f59e0b' },
            { name: 'Low Priority', revenue: stats['Low'], fill: '#10b981' }
        ];
    }, [leads]);

    // 2. Health Distribution
    const healthData = useMemo(() => {
        let critical = 0;
        let warning = 0;
        let healthy = 0;

        leads.forEach(l => {
            if (l.customer.healthScore < 60) critical++;
            else if (l.customer.healthScore < 85) warning++;
            else healthy++;
        });

        return [
            { name: 'Critical (<60%)', value: critical, color: '#ef4444' },
            { name: 'Warning (60-85%)', value: warning, color: '#f59e0b' },
            { name: 'Healthy (>85%)', value: healthy, color: '#10b981' }
        ];
    }, [leads]);

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `Rs. ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `Rs. ${(val / 1000).toFixed(0)}k`;
        return `Rs. ${val}`;
    };

    return (
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px', flexWrap: 'wrap' }}>
            {/* Revenue Bar Chart */}
            <div className="glass-card" style={{ flex: '1 1 500px', padding: '24px', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Potential Revenue by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                        <XAxis dataKey="name" fontSize={12} stroke="var(--text-secondary)" />
                        <YAxis
                            fontSize={12}
                            stroke="var(--text-secondary)"
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            formatter={(value: any) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                        />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={60} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Health Pie Chart */}
            <div className="glass-card" style={{ flex: '1 1 350px', padding: '24px', minHeight: '400px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>System Health Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={healthData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {healthData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
