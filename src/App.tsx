import React, { useState, useMemo, useEffect } from 'react';
import { Lead, PriorityBand } from './types/scoring';
import { mockLeads } from './data/mockData';
import './styles/index.css';

// Sub-components
import { SummaryCards } from './components/SummaryCards';
import { LeadsTable } from './components/LeadsTable';
import { LeadDetails } from './components/LeadDetails';
import { LoadingBar } from './components/LoadingBar';
import { RevenueCharts } from './components/RevenueCharts';

const App: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<PriorityBand | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/api/leads');
                if (!response.ok) throw new Error('Failed to fetch live data from proxy.');
                const data = await response.json();
                setLeads(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    const [cityFilter, setCityFilter] = useState<string>('All');
    const [sizeFilter, setSizeFilter] = useState<'All' | '< 10kW' | '10-20kW' | '> 20kW'>('All');

    // Extract unique cities from data
    const cities = useMemo(() => {
        const unique = new Set(leads.map(l => l.customer.city || 'Unknown'));
        return ['All', ...Array.from(unique).sort()];
    }, [leads]);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesPriority = filter === 'All' || lead.priority === filter;

            const matchesCity = cityFilter === 'All' || (lead.customer.city || 'Unknown') === cityFilter;

            let matchesSize = true;
            if (sizeFilter === '< 10kW') matchesSize = lead.customer.systemSizeKw < 10;
            else if (sizeFilter === '10-20kW') matchesSize = lead.customer.systemSizeKw >= 10 && lead.customer.systemSizeKw <= 20;
            else if (sizeFilter === '> 20kW') matchesSize = lead.customer.systemSizeKw > 20;

            const matchesSearch = lead.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.customer.id.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesPriority && matchesCity && matchesSize && matchesSearch;
        });
    }, [leads, filter, searchTerm, cityFilter, sizeFilter]);

    return (
        <div className="app">
            <div className="auth-notice">
                INTERNAL ONLY: CONFIDENTIAL CUSTOMER LEAD DATA - FOR AUTHORIZED SERVICE PERSONNEL ONLY
            </div>

            <header style={{ padding: '40px 24px 20px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <div className="dashboard-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Lead Potential Dashboard</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Identifying and prioritizing service conversion opportunities since last sync.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => window.location.href = 'http://localhost:8000/api/export'}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--accent-color)',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dashboard-container" style={{ marginTop: '24px' }}>
                {loading ? (
                    <LoadingBar />
                ) : error ? (
                    <div style={{ padding: '40px', background: '#fee2e2', borderRadius: '12px', color: '#991b1b', textAlign: 'center' }}>
                        <strong>Error Connecting to Proxy:</strong> {error}
                    </div>
                ) : (
                    <>
                        <SummaryCards leads={leads} />

                        <RevenueCharts leads={leads} />

                        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Prioritized Leads</h2>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {/* Priority Filter */}
                                        {(['All', 'High', 'Medium', 'Low'] as const).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFilter(p)}
                                                className={`badge ${filter === p ? 'badge-' + p.toLowerCase() : ''}`}
                                                style={{
                                                    cursor: 'pointer',
                                                    border: '1px solid #e2e8f0',
                                                    backgroundColor: filter === p ? undefined : 'white',
                                                    color: filter === p ? undefined : 'var(--text-secondary)'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        {/* City Filter */}
                                        <select
                                            value={cityFilter}
                                            onChange={(e) => setCityFilter(e.target.value)}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        >
                                            {cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
                                        </select>

                                        {/* Size Filter */}
                                        <select
                                            value={sizeFilter}
                                            onChange={(e) => setSizeFilter(e.target.value as any)}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                        >
                                            <option value="All">All System Sizes</option>
                                            <option value="< 10kW">&lt; 10kW (Residential)</option>
                                            <option value="10-20kW">10-20kW (Large Home)</option>
                                            <option value="> 20kW">&gt; 20kW (Commercial)</option>
                                        </select>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by customer name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--accent-color)',
                                        width: '300px',
                                        outline: 'none',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                />
                            </div>
                        </div>
                        <LeadsTable leads={filteredLeads} onSelectLead={setSelectedLead} />
                    </>
                )}
            </main>

            {
                selectedLead && (
                    <LeadDetails lead={selectedLead} onClose={() => setSelectedLead(null)} />
                )
            }

            <footer style={{ marginTop: '60px', padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid #e2e8f0' }}>
                <p>&copy; 2026 SkyElectric Internal Ops Dashboard. Data refreshed every 15 minutes.</p>
            </footer>
        </div >
    );
};

export default App;
