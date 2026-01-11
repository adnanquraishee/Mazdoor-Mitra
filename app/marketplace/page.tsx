'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Briefcase, MapPin, IndianRupee, Users, User, Clock, Calendar, AlertCircle, CheckCircle, ShoppingBag } from 'lucide-react';
import ContractStatusBadge from '@/app/components/ContractStatusBadge';
import OTPModal from '@/app/components/OTPModal';

export default function MarketplacePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [showOTPModal, setShowOTPModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        fetchMarketplaceContracts();
    }, [isAuthenticated, router]);

    const fetchMarketplaceContracts = async () => {
        try {
            const response = await fetch('/api/contracts/list');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch contracts');
            }

            // Filter to show only available contracts
            const available = (data.contracts || []).filter(
                (c: any) => c.contract_status === 'available'
            );

            setContracts(available);
        } catch (err: any) {
            console.error('Fetch marketplace error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptContract = async (contractId: string) => {
        if (!user) {
            alert('Please login as a worker to accept contracts');
            router.push('/auth/login');
            return;
        }

        if (user.role !== 'worker') {
            alert('Only workers can accept contracts');
            return;
        }

        // Show OTP modal for verification
        setSelectedContractId(contractId);
        setShowOTPModal(true);
    };

    const handleOTPVerified = async (otp: string) => {
        if (!selectedContractId || !user) return;

        try {
            // STEP 1: First enroll the worker in the contract
            const assignResponse = await fetch('/api/contracts/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_id: selectedContractId,
                    worker_id: user.id,
                    worker_name: user.name,
                    worker_phone: user.phone,
                }),
            });

            const assignData = await assignResponse.json();

            if (!assignResponse.ok) {
                throw new Error(assignData.error || 'Failed to enroll in contract');
            }

            // STEP 2: Now verify OTP to mark the worker's signature
            const otpResponse = await fetch('/api/contracts/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_id: selectedContractId,
                    phone_number: user.phone,
                    otp_code: otp,
                    user_type: user.role,
                }),
            });

            if (!otpResponse.ok) {
                const otpData = await otpResponse.json();
                throw new Error(otpData.error || 'OTP verification failed');
            }

            // Show success with spots remaining
            const spotsMsg = assignData.spots_remaining
                ? `${assignData.spots_remaining} spots remaining`
                : 'Contract full';

            setShowOTPModal(false);
            alert(`✅ Contract accepted and signed! ${spotsMsg}`);
            router.push(`/contracts/${selectedContractId}`);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Clock className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading marketplace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="w-10 h-10 text-primary-600" />
                        <h1 className="text-4xl font-bold">
                            Contract Marketplace
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        कॉन्ट्रैक्ट बाजार - Browse and accept available work contracts
                    </p>
                </div>

                {error && (
                    <div className="bg-error-50 border border-error-200 text-error-900 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Contracts Grid */}
                {contracts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Contracts Available
                        </h3>
                        <p className="text-gray-600">
                            Check back soon for new work opportunities
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contracts.map((contract) => (
                            <div
                                key={contract.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-gray-100"
                            >
                                {/* Status Badge */}
                                <div className="mb-4">
                                    <ContractStatusBadge status={contract.contract_status} />
                                </div>

                                {/* Job Details */}
                                <h3 className="text-xl font-bold mb-2">
                                    {contract.jobs?.job_title || 'Construction Work'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {contract.jobs?.skill_required || 'General Labor'}
                                </p>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <IndianRupee className="w-4 h-4 text-success-600" />
                                        <span className="font-semibold text-lg">₹{contract.daily_wage}/day</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{contract.number_of_days} days</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>{contract.work_hours_per_day} hours/day</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span>
                                            {contract.workers_enrolled || 0} / {contract.workers_required} enrolled
                                        </span>
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div className="bg-success-50 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-gray-600">Total Contract Value</p>
                                    <p className="text-2xl font-bold text-success-700">
                                        ₹{contract.total_contract_amount.toLocaleString('en-IN')}
                                    </p>
                                </div>

                                {/* Minimum Wage Alert */}
                                {contract.minimum_wage_alert && (
                                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-warning-900">
                                            Below minimum wage (₹400/day)
                                        </p>
                                    </div>
                                )}

                                {/* Contractor Info & Location */}
                                <div className="mb-4 pt-4 border-t">
                                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                                        <Briefcase className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            {contract.contractor_name || 'Contractor'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-sm">📍 {contract.location || 'Location not specified'}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {user?.role === 'worker' ? (
                                        <button
                                            onClick={() => handleAcceptContract(contract.id)}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Accept Contract
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push(`/contracts/${contract.id}`)}
                                            className="btn-secondary flex-1"
                                        >
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            <OTPModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                phoneNumber={user?.phone || ''}
                onVerifySuccess={handleOTPVerified}
                title="Verify OTP to Accept Contract"
            />
        </div>
    );
}