import React from 'react';
import { Lead } from '../types/scoring';

interface Props {
    lead: Lead;
    onClose: () => void;
}

export const LeadDetails: React.FC<Props> = ({ lead, onClose }) => {
    const { customer, breakdown, score, priority, recommendedAction, potentialRevenue } = lead;
    const [activeTab, setActiveTab] = React.useState<'overview' | 'edit'>('overview');

    // Local state for editing assumptions
    const [assumptions, setAssumptions] = React.useState({
        systemSize: customer.systemSizeKw,
        annualFee: potentialRevenue > 0 ? Math.round(potentialRevenue / 3) : (customer.systemSizeKw > 12 ? 120000 : 55000), // Guess annual fee from total or default
        durationYears: 3,
        email: customer.email
    });

    const calculatedRevenue = assumptions.annualFee * assumptions.durationYears;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div
                className="glass-card"
                style={{
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    padding: '40px',
                    position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    &times;
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{customer.name}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Customer ID: {customer.id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${priority.toLowerCase()}`} style={{ fontSize: '0.875rem' }}>{priority} Priority</span>
                        <div style={{ marginTop: '8px', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>{score}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/100</span></div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' }}>
                    {['overview', 'edit'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                padding: '12px 0',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                                fontWeight: activeTab === tab ? 600 : 400,
                                cursor: 'pointer',
                                fontSize: '1rem',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'edit' ? 'Edit Assumptions' : 'Overview'}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>System Overview</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Generation Capacity</span>
                                    <span style={{ fontWeight: 600 }}>{customer.systemSizeKw} kW</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>System Age</span>
                                    <span style={{ fontWeight: 600 }}>{customer.systemAgeYears} Years</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Current Service Plan</span>
                                    <span style={{ fontWeight: 600, color: customer.servicePlanStatus === 'none' ? 'var(--danger)' : 'var(--success)' }}>
                                        {customer.servicePlanStatus === 'none' ? 'No Active Plan' : customer.servicePlanStatus.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Health Index</span>
                                    <span style={{ fontWeight: 600 }}>{customer.healthScore}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Contact Email</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customer.email}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '20px', background: 'var(--primary-color)', color: 'white', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ color: 'white', marginBottom: '8px' }}>Recommended Strategy</h4>
                                <p style={{ fontSize: '0.9375rem', opacity: 0.9 }}>{recommendedAction}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Lead Score Breakdown</h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {[
                                    { label: 'System Lifecycle', weight: breakdown.ageWeight, max: 30 },
                                    { label: 'Chatbot Engagement', weight: breakdown.engagementWeight, max: 25 },
                                    { label: 'Performance Optimization', weight: breakdown.healthWeight, max: 20 },
                                    { label: 'Revenue Potential (Size)', weight: breakdown.valueWeight, max: 15 },
                                    { label: 'Current Plan Status', weight: breakdown.statusWeight, max: 10 },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8125rem' }}>
                                            <span>{item.label}</span>
                                            <span style={{ fontWeight: 600 }}>{item.weight} / {item.max}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min((item.weight / item.max) * 100, 100)}%`, height: '100%', background: 'var(--secondary-color)' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Revenue Opportunity</h4>
                                {/* Use calculated revenue if available/edited, otherwise prompt edit */}
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rs. {calculatedRevenue.toLocaleString()}</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated annual service revenue + 3-year LTV projection.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '0 10px' }}>
                        <div style={{ marginBottom: '24px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '0.875rem' }}>
                            <strong>Note:</strong> Adjusting these values will recalculate the revenue opportunity projection for this session. Changes are not permanently solved to the database yet.
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                                        Contact Email <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>(Auto-generated)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={assumptions.email}
                                        onChange={e => setAssumptions({ ...assumptions, email: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>System Size (kW)</label>
                                    <input
                                        type="number"
                                        value={assumptions.systemSize}
                                        onChange={e => setAssumptions({ ...assumptions, systemSize: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Affects value score and base tier pricing.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Projected Annual Fee (PKR)</label>
                                    <input
                                        type="number"
                                        value={assumptions.annualFee}
                                        onChange={e => setAssumptions({ ...assumptions, annualFee: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>LTV Duration (Years)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="0.5"
                                        value={assumptions.durationYears}
                                        onChange={e => setAssumptions({ ...assumptions, durationYears: Number(e.target.value) })}
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    />
                                    <div style={{ textAlign: 'right', fontWeight: 600 }}>{assumptions.durationYears} Years</div>
                                </div>

                                <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '4px' }}>Recalculated Revenue Opportunity</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#15803d' }}>
                                        Rs. {calculatedRevenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '40px', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer' }}
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {activeTab === 'edit' ? (
                        <button
                            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => setActiveTab('overview')}
                        >
                            Save Assumptions & View
                        </button>
                    ) : (
                        <button
                            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--secondary-color)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => console.log('Action: Generate Invoice')}
                        >
                            Generate Priority Outreach
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
