'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { FileText, User, Briefcase, Calendar, Clock, IndianRupee, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import ContractStatusBadge from '@/app/components/ContractStatusBadge';
import OTPModal from '@/app/components/OTPModal';

export default function ContractDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const contractId = params.id as string;

    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState('');
    const [showOTPModal, setShowOTPModal] = useState(false);

    useEffect(() => {
        fetchContract();
    }, [contractId]);

    const fetchContract = async () => {
        try {
            const response = await fetch(`/api/contracts/${contractId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch contract');
            }

            setContract(data.contract);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptClick = () => {
        setShowOTPModal(true);
    };

    const handleOTPVerified = async (otp: string) => {
        setAccepting(true);
        setError('');

        if (!user) {
            setError('User not logged in');
            setAccepting(false);
            return;
        }

        try {
            const response = await fetch('/api/contracts/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract_id: contractId,
                    phone_number: user.phone,
                    otp_code: otp,
                    user_type: user.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to accept contract');
            }

            // Refresh contract data
            await fetchContract();
            setShowOTPModal(false);

            if (data.contract.contract_status === 'active') {
                alert('🎉 कॉन्ट्रैक्ट सक्रिय हो गया है! | Contract is now active!');
                router.push('/dashboard');
            } else {
                alert('✅ कॉन्ट्रैक्ट स्वीकार किया गया | Contract accepted. Waiting for other party.');
            }
        } catch (err: any) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading contract... / कॉन्ट्रैक्ट लोड हो रहा है...</p>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="alert-error max-w-md">
                    <span>{error || 'Contract not found'}</span>
                </div>
            </div>
        );
    }

    const isActive = contract.contract_status === 'active';
    const isDraft = contract.contract_status === 'draft' || contract.contract_status === 'assigned';
    const contractorSigned = !!contract.contractor_accepted_at;

    // Check if current logged-in user (worker) has signed
    // Use the actual logged-in user's phone number from auth context
    const currentUserPhone = user?.phone;
    const currentWorkerData = contract.enrolled_workers?.find(
        (w: any) => w.worker_phone === currentUserPhone
    );
    const workerSigned = currentWorkerData?.worker_accepted_at ? true : false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
            <div className="max-w-3xl mx-auto py-8">
                {/* Header */}
                <div className="card mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-8 h-8 text-primary-600" />
                                <h1 className="text-3xl font-bold">सुरक्षा कॉन्ट्रैक्ट</h1>
                            </div>
                            <p className="text-gray-600">Suraksha Contract</p>
                            <p className="text-sm text-gray-500 mt-1">Contract ID: {contractId}</p>
                        </div>
                        <ContractStatusBadge status={contract.contract_status} />
                    </div>
                </div>

                {/* Contract Details */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">
                        Contract Details / कॉन्ट्रैक्ट विवरण
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="flex items-center gap-2 font-medium">
                                <IndianRupee className="w-5 h-5 text-gray-600" />
                                Daily Wage / दैनिक वेतन
                            </span>
                            <span className="text-2xl font-bold text-primary-600">
                                ₹{contract.daily_wage.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="flex items-center gap-2 font-medium">
                                <Calendar className="w-5 h-5 text-gray-600" />
                                Number of Days / दिनों की संख्या
                            </span>
                            <span className="text-xl font-bold">{contract.number_of_days} days</span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="flex items-center gap-2 font-medium">
                                <Clock className="w-5 h-5 text-gray-600" />
                                Work Hours/Day / काम के घंटे
                            </span>
                            <span className="text-xl font-bold">{contract.work_hours_per_day} hours</span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b">
                            <span className="font-medium">Overtime Rate / ओवरटाइम दर</span>
                            <span className="text-xl font-bold">
                                ₹{contract.overtime_rate_per_hour}/hour
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-4 bg-secondary-50 px-4 rounded-lg">
                            <span className="font-bold text-lg">Total Amount / कुल राशि</span>
                            <span className="text-3xl font-bold text-secondary-600">
                                ₹{contract.total_contract_amount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {contract.minimum_wage_alert && (
                        <div className="alert-warning mt-4">
                            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Minimum Wage Alert</p>
                                <p className="text-sm">
                                    This contract has a wage below the recommended minimum (₹400/day)
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Signature Status */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        Signatures / हस्ताक्षर
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-8 h-8 text-gray-600" />
                                <div>
                                    <p className="font-semibold">Contractor / ठेकेदार</p>
                                    <p className="text-sm text-gray-600">
                                        {contractorSigned
                                            ? new Date(contract.contractor_accepted_at).toLocaleString('en-IN')
                                            : 'Not signed yet'}
                                    </p>
                                </div>
                            </div>
                            {contractorSigned ? (
                                <CheckCircle className="w-8 h-8 text-secondary-500" />
                            ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <User className="w-8 h-8 text-gray-600" />
                                <div>
                                    <p className="font-semibold">Worker / मजदूर</p>
                                    <p className="text-sm text-gray-600">
                                        {workerSigned
                                            ? new Date(contract.worker_accepted_at).toLocaleString('en-IN')
                                            : 'Not signed yet'}
                                    </p>
                                </div>
                            </div>
                            {workerSigned ? (
                                <CheckCircle className="w-8 h-8 text-secondary-500" />
                            ) : (
                                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrolled Workers Table - Only visible to Contractors */}
                {user?.role === 'contractor' && contract.enrolled_workers && contract.enrolled_workers.length > 0 && (
                    <div className="card mb-6">
                        <h2 className="text-xl font-bold mb-4">
                            Enrolled Workers / नामांकित मजदूर ({contract.workers_enrolled}/{contract.workers_required})
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left p-3 font-semibold">#</th>
                                        <th className="text-left p-3 font-semibold">Name / नाम</th>
                                        <th className="text-left p-3 font-semibold">Phone / फोन</th>
                                        <th className="text-left p-3 font-semibold">Enrolled At</th>
                                        <th className="text-left p-3 font-semibold">Signature Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contract.enrolled_workers.map((worker: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{idx + 1}</td>
                                            <td className="p-3">{worker.worker_name}</td>
                                            <td className="p-3 text-gray-600">{worker.worker_phone}</td>
                                            <td className="p-3 text-sm text-gray-500">
                                                {new Date(worker.enrolled_at).toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-3">
                                                {worker.worker_accepted_at ? (
                                                    <div className="flex items-center gap-2 text-success-600">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="text-sm font-medium">Signed</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                                        <span className="text-sm">Pending</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {isDraft && (
                    <div className="card">
                        <p className="text-center mb-4 text-gray-700">
                            {!workerSigned && (
                                <>
                                    <span className="font-semibold">मजदूर:</span> कृपया कॉन्ट्रैक्ट की समीक्षा करें और स्वीकार करें
                                    <br />
                                    <span className="font-semibold">Worker:</span> Please review and accept the contract
                                </>
                            )}
                            {workerSigned && !contractorSigned && (
                                <>Worker has accepted. Waiting for contractor signatures.</>
                            )}
                        </p>

                        <div className="flex gap-4">
                            <button className="btn-outline flex-1">
                                Reject / अस्वीकार करें
                            </button>
                            <button
                                onClick={handleAcceptClick}
                                disabled={accepting}
                                className="btn-primary flex-1"
                            >
                                <Shield className="inline-block w-5 h-5 mr-2" />
                                {accepting ? 'Processing...' : '✓ Accept / स्वीकार करें'}
                            </button>
                        </div>
                    </div>
                )}

                {isActive && (
                    <div className="alert-success">
                        <CheckCircle className="w-6 h-6" />
                        <p>
                            <strong>Contract is Active!</strong> Work has begun. Track progress in your dashboard.
                        </p>
                    </div>
                )}
            </div>

            {/* OTP Modal */}
            <OTPModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                phoneNumber={user?.phone || ''}
                onVerifySuccess={handleOTPVerified}
                title="Accept Contract with OTP"
            />
        </div>
    );
}
