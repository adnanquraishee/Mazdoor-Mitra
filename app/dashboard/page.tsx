'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    IndianRupee,
    Calendar,
} from 'lucide-react';
import ContractStatusBadge from '@/app/components/ContractStatusBadge';

export default function DashboardPage() {
    const router = useRouter();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Mock user data - replace with actual auth context
    const mockUser = {
        id: '123',
        name: 'John Doe',
        user_type: 'worker', // or 'contractor'
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            const response = await fetch('/api/contracts/list');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch contracts');
            }

            setContracts(data.contracts || []);
        } catch (err: any) {
            console.error('Fetch contracts error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        active: contracts.filter((c) => c.contract_status === 'active').length,
        pending: contracts.filter((c) => c.contract_status === 'draft').length,
        completed: contracts.filter((c) => c.contract_status === 'completed').length,
        totalEarnings: contracts
            .filter((c) => c.contract_status === 'completed')
            .reduce((sum, c) => sum + c.total_contract_amount, 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
            <div className="max-w-7xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        नमस्ते, {mockUser.name}! 👋
                    </h1>
                    <p className="text-gray-600">Your Contract Dashboard | आपका कॉन्ट्रैक्ट डैशबोर्ड</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-2 border-secondary-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Contracts</p>
                                <p className="text-3xl font-bold text-secondary-700">{stats.active}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-secondary-500" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-warning-50 to-warning-100 border-2 border-warning-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-warning-700">{stats.pending}</p>
                            </div>
                            <Clock className="w-12 h-12 text-warning-500" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Completed</p>
                                <p className="text-3xl font-bold text-blue-700">{stats.completed}</p>
                            </div>
                            <FileText className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                                <p className="text-2xl font-bold text-primary-700">
                                    ₹{stats.totalEarnings.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-primary-500" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {mockUser.user_type === 'contractor' && (
                    <div className="card mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Create New Contract</h2>
                                <p className="text-primary-100">
                                    Start a new Suraksha Contract with a worker
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/contracts/create')}
                                className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Contract
                            </button>
                        </div>
                    </div>
                )}

                {/* Contracts List */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Your Contracts | आपके कॉन्ट्रैक्ट</h2>
                        <select className="input-field w-auto">
                            <option value="all">All Contracts</option>
                            <option value="active">Active</option>
                            <option value="draft">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {contracts.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                No contracts yet
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {mockUser.user_type === 'contractor'
                                    ? 'Create your first Suraksha Contract to get started'
                                    : 'Waiting for contract invitations from contractors'}
                            </p>
                            {mockUser.user_type === 'contractor' && (
                                <button
                                    onClick={() => router.push('/contracts/create')}
                                    className="btn-primary"
                                >
                                    <Plus className="inline-block w-5 h-5 mr-2" />
                                    Create First Contract
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    onClick={() => router.push(`/contracts/${contract.id}`)}
                                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-1">
                                                Contract #{contract.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {contract.jobs?.job_title || 'Loading...'}
                                            </p>
                                        </div>
                                        <ContractStatusBadge status={contract.contract_status} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Daily Wage</p>
                                                <p className="font-semibold">
                                                    ₹{contract.daily_wage.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Duration</p>
                                                <p className="font-semibold">{contract.number_of_days} days</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Total Amount</p>
                                                <p className="font-semibold text-primary-600">
                                                    ₹
                                                    {contract.total_contract_amount.toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {contract.contract_status === 'draft' && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-warning-600">
                                                <AlertCircle className="w-5 h-5" />
                                                <span className="text-sm font-medium">
                                                    Waiting for digital signatures
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
