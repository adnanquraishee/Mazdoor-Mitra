```
'use client';

import {useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Shield, IndianRupee, Calendar, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { ContractFormData } from '@/types';

const MINIMUM_WAGE = 400; // ₹400 per day

export default function CreateContractPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const jobId = 'job-demo-001'; // Mock job ID for demo');

    const [formData, setFormData] = useState<ContractFormData>({
        daily_wage: 0,
        number_of_days: 1,
        work_hours_per_day: 8,
        overtime_rate_per_hour: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const minimumWageAlert = formData.daily_wage > 0 && formData.daily_wage < MINIMUM_WAGE;
    const totalAmount = formData.daily_wage * formData.number_of_days;

    const handleInputChange = (field: keyof ContractFormData, value: number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const generateContract = async () => {
        if (formData.daily_wage <= 0) {
            setError('दैनिक वेतन 0 से अधिक होना चाहिए / Daily wage must be greater than 0');
            return;
        }

        if (formData.number_of_days <= 0) {
            setError('दिनों की संख्या 1 से अधिक होनी चाहिए / Number of days must be at least 1');
            return;
        }

        setShowPreview(true);
    };

    // Redirect if not authenticated or not a contractor
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user?.role !== 'contractor') {
            alert('Only contractors can create contracts');
            router.push('/marketplace');
        }
    }, [isAuthenticated, user, router]);

    const createContract = async () => {
        setLoading(true);
        setError('');

        if (!user) {
            setError('You must be logged in as a contractor');
            setLoading(false);
            return;
        }

        try {
            // Auto-generate job_id if not provided (for demo/testing)
            const jobIdToUse = jobId || `job - ${ Date.now() } -${ Math.random().toString(36).substr(2, 9) } `;
            
            const response = await fetch('/api/contracts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractor_id: user.id,
                    job_id: jobIdToUse,
                    ...formData,
                    minimum_wage_alert: minimumWageAlert,
                    total_contract_amount: totalAmount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create contract');
            }

            // Redirect to marketplace or contractor dashboard
            router.push('/marketplace');
        } catch (err: any) {
            console.error('Contract creation error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showPreview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
                <div className="max-w-2xl mx-auto py-8">
                    <div className="card">
                        <div className="text-center mb-6">
                            <FileText className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold">सुरक्षा कॉन्ट्रैक्ट</h1>
                            <p className="text-gray-600">Suraksha Contract Preview</p>
                        </div>

                        <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
                            <h2 className="text-xl font-bold mb-4 text-center border-b pb-2">
                                Contract Summary / कॉन्ट्रैक्ट सारांश
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium">Daily Wage / दैनिक वेतन:</span>
                                    <span className="text-xl font-bold text-primary-600">
                                        ₹{formData.daily_wage.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium">Number of Days / दिनों की संख्या:</span>
                                    <span className="text-xl font-bold">{formData.number_of_days} days</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium">Work Hours/Day / काम के घंटे:</span>
                                    <span className="text-xl font-bold">{formData.work_hours_per_day} hours</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium">Overtime Rate / ओवरटाइम दर:</span>
                                    <span className="text-xl font-bold">
                                        ₹{formData.overtime_rate_per_hour}/hour
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-4 bg-secondary-50 px-4 rounded-lg mt-4">
                                    <span className="font-bold text-lg">Total Amount / कुल राशि:</span>
                                    <span className="text-2xl font-bold text-secondary-600">
                                        ₹{totalAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {minimumWageAlert && (
                                <div className="alert-warning mt-6">
                                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">चेतावनी / Warning</p>
                                        <p className="text-sm">
                                            यह दैनिक वेतन न्यूनतम मजदूरी (₹{MINIMUM_WAGE}) से कम है।
                                            This daily wage is below the minimum wage (₹{MINIMUM_WAGE}).
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900">
                                    📝 <strong>Note / नोट:</strong> Worker will review and accept this contract.
                                    Both parties must sign before the job becomes active. |
                                    मजदूर इस कॉन्ट्रैक्ट की समीक्षा करेगा और स्वीकार करेगा।
                                    काम शुरू होने से पहले दोनों पक्षों को साइन करना होगा।
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="alert-error mt-4">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setShowPreview(false)} className="btn-outline flex-1">
                                संपादित करें | Edit
                            </button>
                            <button
                                onClick={createContract}
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Creating...' : 'कॉन्ट्रैक्ट बनाएं | Create Contract'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
            <div className="max-w-2xl mx-auto py-8">
                <div className="card">
                    <div className="text-center mb-6">
                        <Calculator className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">नया कॉन्ट्रैक्ट बनाएं</h1>
                        <p className="text-gray-600">Create New Contract</p>
                    </div>

                    {error && (
                        <div className="alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Daily Wage */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                💰 दैनिक वेतन / Daily Wage (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.daily_wage || ''}
                                onChange={(e) => handleInputChange('daily_wage', Number(e.target.value))}
                                className="input-field"
                                placeholder="600"
                                min="0"
                                step="50"
                            />
                            {formData.daily_wage > 0 && !minimumWageAlert && (
                                <div className="flex items-center gap-2 mt-2 text-secondary-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm">न्यूनतम वेतन से अधिक | Above minimum wage</span>
                                </div>
                            )}
                            {minimumWageAlert && (
                                <div className="flex items-center gap-2 mt-2 text-warning-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="text-sm">
                                        न्यूनतम वेतन (₹{MINIMUM_WAGE}) से कम | Below minimum wage
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Number of Days */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                📅 कितने दिन / Number of Days
                            </label>
                            <input
                                type="number"
                                value={formData.number_of_days}
                                onChange={(e) => handleInputChange('number_of_days', Number(e.target.value))}
                                className="input-field"
                                min="1"
                                max="365"
                            />
                        </div>

                        {/* Work Hours */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ⏰ काम के घंटे (प्रति दिन) / Work Hours Per Day
                            </label>
                            <input
                                type="number"
                                value={formData.work_hours_per_day}
                                onChange={(e) => handleInputChange('work_hours_per_day', Number(e.target.value))}
                                className="input-field"
                                min="1"
                                max="16"
                                step="0.5"
                            />
                        </div>

                        {/* Overtime Rate */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                💵 ओवरटाइम दर (प्रति घंटा) / Overtime Rate Per Hour (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.overtime_rate_per_hour || ''}
                                onChange={(e) =>
                                    handleInputChange('overtime_rate_per_hour', Number(e.target.value))
                                }
                                className="input-field"
                                placeholder="75"
                                min="0"
                                step="10"
                            />
                        </div>

                        {/* Total Calculation */}
                        {formData.daily_wage > 0 && formData.number_of_days > 0 && (
                            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg border-2 border-primary-200">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">कुल राशि / Total Contract Amount</p>
                                    <p className="text-4xl font-bold text-primary-600">
                                        ₹{totalAmount.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        ({formData.daily_wage} × {formData.number_of_days} days)
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Generate Button */}
                        <button onClick={generateContract} className="btn-primary w-full">
                            <FileText className="inline-block w-5 h-5 mr-2" />
                            कॉन्ट्रैक्ट प्रीव्यू देखें | Preview Contract
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
