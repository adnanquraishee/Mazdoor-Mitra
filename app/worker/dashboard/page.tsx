'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { User, TrendingUp, FileText, Clock, IndianRupee } from 'lucide-react';
import ContractStatusBadge from '@/app/components/ContractStatusBadge';

export default function WorkerDashboardPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'worker') {
            router.push('/auth/login');
            return;
        }
        fetchWorkerContracts();
    }, [isAuthenticated, user, router]);

    const fetchWorkerContracts = async () => {
        try {
            const response = await fetch('/api/contracts/list');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch contracts');
            }

            // Filter contracts where this worker is enrolled
            // Check both old worker_id field and new enrolled_workers array
            const workerContracts = (data.contracts || []).filter((c: any) => {
                // Check if worker is in enrolled_workers array
                const isEnrolled = c.enrolled_workers?.some(
                    (w: any) => w.worker_phone === user?.phone
                );
                // Also check legacy worker_id for backwards compatibility
                const isAssignedLegacy = c.worker_id === user?.id;

                return isEnrolled || isAssignedLegacy;
            });

            setContracts(workerContracts);
        } catch (err: any) {
            console.error('Fetch contracts error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        active: contracts.filter((c) => c.contract_status === 'active').length,
        pending: contracts.filter((c) => c.contract_status === 'assigned').length,
        completed: contracts.filter((c) => c.contract_status === 'completed').length,
        earnings: contracts
            .filter((c) => c.contract_status === 'active' || c.contract_status === 'completed')
            .reduce((sum, c) => sum + c.total_contract_amount, 0),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Clock className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-primary-900 mb-2">
                        Worker Dashboard / मजदूर डैशबोर्ड
                    </h1>
                    <p className="text-gray-600">
                        Welcome{user?.name ? `, ${user.name}` : ''}!
                    </p>
                </div>
                {error && (
                    <div className="bg-error-50 border border-error-200 text-error-900 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Active Contracts</p>
                                <p className="text-3xl font-bold text-success-600">{stats.active}</p>
                            </div>
                            <FileText className="w-12 h-12 text-success-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Pending Signatures</p>
                                <p className="text-3xl font-bold text-warning-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-12 h-12 text-warning-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-3xl font-bold text-info-600">{stats.completed}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-info-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Earnings</p>
                                <p className="text-3xl font-bold text-primary-600">
                                    ₹{stats.earnings.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <IndianRupee className="w-12 h-12 text-primary-200" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-md p-6 mb-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Browse More Work</h2>
                    <p className="mb-4">Find new contract opportunities in the marketplace</p>
                    <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                        View Marketplace →
                    </button>
                </div>

                {/* Contracts List */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">My Contracts / मेरे कॉन्ट्रैक्ट</h2>

                    {contracts.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Contracts Yet</h3>
                            <p className="text-gray-600 mb-4">
                                Browse the marketplace to find work opportunities
                            </p>
                            <button
                                onClick={() => router.push('/marketplace')}
                                className="btn-primary"
                            >
                                Go to Marketplace
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    onClick={() => router.push(`/contracts/${contract.id}`)}
                                    className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ContractStatusBadge status={contract.contract_status} />
                                            <h3 className="font-semibold">{contract.jobs?.job_title || 'Contract'}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            ₹{contract.daily_wage}/day • {contract.number_of_days} days •
                                            Total: ₹{contract.total_contract_amount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(contract.created_at).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
