'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Shield, IndianRupee, Calendar, Clock, AlertCircle, TrendingUp, User } from 'lucide-react';

const MINIMUM_WAGE = 400;

export default function CreateContractPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        location: '',
        daily_wage: 0,
        number_of_days: 1,
        workers_required: 1,
        work_hours_per_day: 8,
        overtime_rate_per_hour: 0,
    });

    const minimumWageAlert = formData.daily_wage > 0 && formData.daily_wage < MINIMUM_WAGE;
    const totalAmount = formData.daily_wage * formData.number_of_days;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user?.role !== 'contractor') {
            alert('Only contractors can create contracts');
            router.push('/marketplace');
        }
    }, [isAuthenticated, user, router]);

    const handleInputChange = (field: string, value: number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const generateContract = () => {
        if (!formData.location || formData.location.trim() === '') {
            setError('Location is required');
            return;
        }
        if (formData.daily_wage <= 0) {
            setError('Daily wage must be greater than 0');
            return;
        }
        if (formData.number_of_days <= 0) {
            setError('Number of days must be at least 1');
            return;
        }
        setError('');
        setShowPreview(true);
    };

    const createContract = async () => {
        if (!user) {
            setError('You must be logged in as a contractor');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const { location, ...rest } = formData;

            const response = await fetch('/api/contracts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractor_id: user.id,
                    contractor_name: user.name,
                    job_id: jobId,
                    location,
                    ...rest,
                    minimum_wage_alert: minimumWageAlert,
                    total_contract_amount: totalAmount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create contract');
            }

            alert('✅ Contract posted to marketplace successfully!');
            // Redirect to contractor dashboard
            router.push('/contractor/dashboard');
        } catch (err: any) {
            console.error('Contract creation error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-10 h-10 text-primary-600" />
                    <div>
                        <h1 className="text-4xl font-bold">Create Contract</h1>
                        <p className="text-gray-600">कॉन्ट्रैक्ट बनाएं</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-error-50 border border-error-200 text-error-900 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {!showPreview ? (
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h2 className="text-2xl font-bold mb-6">Contract Details</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    📍 Location / स्थान
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="input-field"
                                    placeholder="e.g., Navi Mumbai, Sector 15"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <IndianRupee className="inline w-4 h-4" /> Daily Wage / दैनिक वेतन
                                </label>
                                <input
                                    type="number"
                                    value={formData.daily_wage || ''}
                                    onChange={(e) => handleInputChange('daily_wage', Number(e.target.value))}
                                    className="input-field"
                                    placeholder="₹500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <Calendar className="inline w-4 h-4" /> Number of Days / दिनों की संख्या
                                </label>
                                <input
                                    type="number"
                                    value={formData.number_of_days}
                                    onChange={(e) => handleInputChange('number_of_days', Number(e.target.value))}
                                    className="input-field"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <User className="inline w-4 h-4" /> Workers Required / आवश्यक मजदूर
                                </label>
                                <input
                                    type="number"
                                    value={formData.workers_required}
                                    onChange={(e) => handleInputChange('workers_required', Number(e.target.value))}
                                    className="input-field"
                                    min="1"
                                    placeholder="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <Clock className="inline w-4 h-4" /> Work Hours per Day / प्रतिदिन घंटे
                                </label>
                                <input
                                    type="number"
                                    value={formData.work_hours_per_day}
                                    onChange={(e) => handleInputChange('work_hours_per_day', Number(e.target.value))}
                                    className="input-field"
                                    min="1"
                                    max="12"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <TrendingUp className="inline w-4 h-4" /> Overtime Rate (per hour) / ओवरटाइम दर
                                </label>
                                <input
                                    type="number"
                                    value={formData.overtime_rate_per_hour || ''}
                                    onChange={(e) => handleInputChange('overtime_rate_per_hour', Number(e.target.value))}
                                    className="input-field"
                                    placeholder="₹75"
                                />
                            </div>

                            {minimumWageAlert && (
                                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-warning-900">Below Minimum Wage</p>
                                        <p className="text-sm text-warning-800">
                                            This daily wage is below the minimum wage of ₹400/day
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button onClick={generateContract} className="btn-primary w-full">
                                Preview Contract / कॉन्ट्रैक्ट प्रीव्यू देखें
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h2 className="text-2xl font-bold mb-6">Contract Preview</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Daily Wage:</span>
                                <span className="font-semibold">₹{formData.daily_wage}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Number of Days:</span>
                                <span className="font-semibold">{formData.number_of_days}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Work Hours/Day:</span>
                                <span className="font-semibold">{formData.work_hours_per_day} hours</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Overtime Rate:</span>
                                <span className="font-semibold">₹{formData.overtime_rate_per_hour}/hour</span>
                            </div>
                            <div className="flex justify-between py-4 bg-success-50 rounded-lg px-4">
                                <span className="font-bold text-lg">Total Amount:</span>
                                <span className="font-bold text-2xl text-success-700">₹{totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="btn-secondary flex-1"
                            >
                                ← Edit
                            </button>
                            <button
                                onClick={createContract}
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Creating...' : 'Post to Marketplace →'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
