import React, { useState, useMemo } from 'react';
import { Lead } from '../types/scoring';

interface Props {
    leads: Lead[];
    onSelectLead: (lead: Lead) => void;
}

type SortField = 'name' | 'id' | 'systemSize' | 'age' | 'health' | 'score' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 50;

export const LeadsTable: React.FC<Props> = ({ leads, onSelectLead }) => {
    const [sortField, setSortField] = useState<SortField>('score');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [contactedLeads, setContactedLeads] = useState<Set<string>>(new Set());

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    useMemo(() => {
        const stored = localStorage.getItem('contactedLeads');
        if (stored) {
            setContactedLeads(new Set(JSON.parse(stored)));
        }
    }, []);

    const toggleContacted = (id: string) => {
        const newSet = new Set(contactedLeads);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);

        setContactedLeads(newSet);
        localStorage.setItem('contactedLeads', JSON.stringify(Array.from(newSet)));
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1); // Reset to first page on sort
    };

    const sortedLeads = useMemo(() => {
        return [...leads].sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortField) {
                case 'name':
                    valA = (a.customer.name || '').toLowerCase();
                    valB = (b.customer.name || '').toLowerCase();
                    break;
                case 'id':
                    valA = (a.customer.id || '').toLowerCase();
                    valB = (b.customer.id || '').toLowerCase();
                    break;
                case 'systemSize':
                    valA = Number(a.customer.systemSizeKw) || 0;
                    valB = Number(b.customer.systemSizeKw) || 0;
                    break;
                case 'age':
                    valA = Number(a.customer.systemAgeYears) || 0;
                    valB = Number(b.customer.systemAgeYears) || 0;
                    break;
                case 'health':
                    valA = Number(a.customer.healthScore) || 0;
                    valB = Number(b.customer.healthScore) || 0;
                    break;
                case 'score':
                    valA = Number(a.score) || 0;
                    valB = Number(b.score) || 0;
                    break;
                case 'priority':
                    const priorityOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    valA = priorityOrder[a.priority] || 0;
                    valB = priorityOrder[b.priority] || 0;
                    break;
                case 'status':
                    valA = (a.customer.servicePlanStatus || '').toLowerCase();
                    valB = (b.customer.servicePlanStatus || '').toLowerCase();
                    break;
                default:
                    valA = '';
                    valB = '';
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [leads, sortField, sortDirection]);

    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return sortedLeads.slice(startIndex, startIndex + PAGE_SIZE);
    }, [sortedLeads, currentPage]);

    const totalPages = Math.ceil(leads.length / PAGE_SIZE);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
        return <span style={{ marginLeft: '4px' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    const Th = ({ field, label, width }: { field: SortField, label: string, width?: string }) => (
        <th
            style={{
                padding: '16px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: 'bold',
                textAlign: 'left',
                width: width,
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f1f5f9'
            }}
            onClick={() => handleSort(field)}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {label}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <div className="glass-card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <Th field="name" label="Customer" />
                            <Th field="systemSize" label="System Info" />
                            <Th field="status" label="Status" />
                            <Th field="score" label="Lead Score" />
                            <Th field="priority" label="Priority" />
                            <th style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLeads.map(lead => {
                            const isContacted = contactedLeads.has(lead.customer.id);
                            return (
                                <tr
                                    key={lead.customer.id}
                                    style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        backgroundColor: 'white',
                                        opacity: isContacted ? 0.5 : 1,
                                        transition: 'background-color 0.2s'
                                    }}
                                    onClick={() => onSelectLead(lead)}
                                    className="table-row-hover"
                                >
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <input
                                                type="checkbox"
                                                checked={isContacted}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleContacted(lead.customer.id);
                                                }}
                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                title="Mark as Contacted"
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{lead.customer.name}</div>
                                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{lead.customer.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.875rem' }}>{lead.customer.systemSizeKw} kW | {lead.customer.systemAgeYears}y</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Health: {lead.customer.healthScore}%</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: lead.customer.servicePlanStatus === 'none' ? '#fee2e2' : '#d1fae5',
                                            color: lead.customer.servicePlanStatus === 'none' ? '#991b1b' : '#065f46'
                                        }}>
                                            {lead.customer.servicePlanStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
                                            {lead.score}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span className={`badge badge-${lead.priority.toLowerCase()}`}>
                                            {lead.priority}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: 'var(--primary-color)',
                                                color: 'white',
                                                fontSize: '0.8125rem',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectLead(lead);
                                            }}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {leads.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No leads found matching your criteria.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
                borderBottomLeftRadius: 'var(--radius-md)',
                borderBottomRightRadius: 'var(--radius-md)'
            }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, leads.length)} to {Math.min(currentPage * PAGE_SIZE, leads.length)} of {leads.length} leads
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: currentPage === 1 ? '#f8fafc' : 'white',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            color: currentPage === 1 ? '#cbd5e1' : 'var(--text-primary)'
                        }}
                    >
                        Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: (currentPage === totalPages || totalPages === 0) ? '#f8fafc' : 'white',
                            cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                            color: (currentPage === totalPages || totalPages === 0) ? '#cbd5e1' : 'var(--text-primary)'
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
