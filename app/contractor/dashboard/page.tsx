'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Briefcase, TrendingUp, FileText, Clock, Plus, IndianRupee, CheckCircle } from 'lucide-react';
import ContractStatusBadge from '@/app/components/ContractStatusBadge';

export default function ContractorDashboardPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'contractor') {
            router.push('/auth/login');
            return;
        }
        fetchContractorContracts();
    }, [isAuthenticated, user, router]);

    const fetchContractorContracts = async () => {
        try {
            const response = await fetch('/api/contracts/list');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch contracts');
            }

            // Filter contracts created by this contractor
            const contractorContracts = (data.contracts || []).filter(
                (c: any) => c.contractor_id === user?.id
            );

            setContracts(contractorContracts);
        } catch (err: any) {
            console.error('Fetch contracts error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: contracts.length,
        available: contracts.filter((c) => c.contract_status === 'available').length,
        active: contracts.filter((c) => c.contract_status === 'active').length,
        completed: contracts.filter((c) => c.contract_status === 'completed').length,
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
                        Contractor Dashboard / ठेकेदार डैशबोर्ड
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
                                <p className="text-gray-600 text-sm">Total Contracts</p>
                                <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
                            </div>
                            <FileText className="w-12 h-12 text-primary-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">In Marketplace</p>
                                <p className="text-3xl font-bold text-warning-600">{stats.available}</p>
                            </div>
                            <Clock className="w-12 h-12 text-warning-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Active</p>
                                <p className="text-3xl font-bold text-success-600">{stats.active}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-success-200" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-3xl font-bold text-info-600">{stats.completed}</p>
                            </div>
                            <Briefcase className="w-12 h-12 text-info-200" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-xl shadow-md p-6 mb-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Create New Contract</h2>
                    <p className="mb-4">Post a new job contract to the marketplace and find skilled workers</p>
                    <button
                        onClick={() => router.push('/contracts/create')}
                        className="bg-white text-secondary-700 px-6 py-3 rounded-lg font-semibold hover:bg-secondary-50 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Contract
                    </button>
                </div>

                {/* Contracts List */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">My Contracts / मेरे कॉन्ट्रैक्ट</h2>

                    {contracts.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Contracts Yet</h3>
                            <p className="text-gray-600 mb-4">
                                Create your first contract to start hiring workers
                            </p>
                            <button
                                onClick={() => router.push('/contracts/create')}
                                className="btn-primary"
                            >
                                <Plus className="inline w-5 h-5 mr-2" />
                                Create Contract
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="p-4 border-2 border-gray-100 rounded-lg hover:border-secondary-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <ContractStatusBadge status={contract.contract_status} />
                                                <h3 className="font-semibold">{contract.jobs?.job_title || 'Contract'}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                ₹{contract.daily_wage}/day • {contract.number_of_days} days •
                                                Total: ₹{contract.total_contract_amount.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                📍 {contract.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Posted: {new Date(contract.posted_at || contract.created_at).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Enrolled Workers */}
                                    {contract.enrolled_workers && contract.enrolled_workers.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                👥 Enrolled Workers ({contract.workers_enrolled || 0}/{contract.workers_required}):
                                            </p>
                                            <div className="space-y-1">
                                                {contract.enrolled_workers.map((worker: any, idx: number) => (
                                                    <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                        <span className="font-medium">{idx + 1}.</span>
                                                        <span>{worker.worker_name}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500">{worker.worker_phone}</span>
                                                        {worker.worker_accepted_at && (
                                                            <CheckCircle className="w-4 h-4 text-success-600 ml-auto" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => router.push(`/contracts/${contract.id}`)}
                                        className="btn-secondary w-full mt-3"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
