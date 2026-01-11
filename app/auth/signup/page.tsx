'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserType } from '@/types';
import { Users, Briefcase, Phone, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type') as UserType | null;

    const [step, setStep] = useState<'select' | 'phone' | 'otp' | 'profile'>(
        typeParam ? 'phone' : 'select'
    );
    const [userType, setUserType] = useState<UserType | null>(typeParam);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTypeSelection = (type: UserType) => {
        setUserType(type);
        setStep('phone');
    };

    const sendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('कृपया सही फोन नंबर दर्ज करें / Please enter valid phone number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: `+91${phoneNumber}` }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setStep('otp');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOTPAndSignup = async () => {
        if (!otp || otp.length !== 6) {
            setError('कृपया 6 अंकों का OTP दर्ज करें / Please enter 6-digit OTP');
            return;
        }

        if (!name.trim()) {
            setError('कृपया अपना नाम दर्ज करें / Please enter your name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: `+91${phoneNumber}`,
                    otp_code: otp,
                    name,
                    user_type: userType,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Redirect to profile creation
            if (userType === 'worker') {
                router.push('/profile/worker/create');
            } else {
                router.push('/profile/contractor/create');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Back button */}
                {step !== 'select' && (
                    <button
                        onClick={() => {
                            if (step === 'phone') setStep('select');
                            else if (step === 'otp') setStep('phone');
                        }}
                        className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back / वापस जाएं
                    </button>
                )}

                <div className="card">
                    <h1 className="text-2xl font-bold text-center mb-6">
                        साइन अप करें | Sign Up
                    </h1>

                    {error && (
                        <div className="alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: User Type Selection */}
                    {step === 'select' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => handleTypeSelection('worker')}
                                className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary-100 group-hover:bg-primary-200 w-16 h-16 rounded-full flex items-center justify-center">
                                        <Users className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold">मैं मजदूर हूं</h3>
                                        <p className="text-gray-600">I am a Worker</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleTypeSelection('contractor')}
                                className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-secondary-100 group-hover:bg-secondary-200 w-16 h-16 rounded-full flex items-center justify-center">
                                        <Briefcase className="w-8 h-8 text-secondary-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold">मैं ठेकेदार हूं</h3>
                                        <p className="text-gray-600">I am a Contractor</p>
                                    </div>
                                </div>
                            </button>

                            <div className="text-center mt-6">
                                <p className="text-gray-600">
                                    Already have an account? |{' पहले से खाता है?'}
                                </p>
                                <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
                                    Login / लॉगिन करें
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Phone Number */}
                    {step === 'phone' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    फोन नंबर | Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <div className="input-field w-20 text-center">+91</div>
                                    <input
                                        type="tel"
                                        placeholder="9876543210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="input-field flex-1"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={sendOTP}
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="spinner w-5 h-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <>
                                        <Phone className="inline-block w-5 h-5 mr-2" />
                                        OTP भेजें | Send OTP
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 3: OTP & Name */}
                    {step === 'otp' && (
                        <div className="space-y-4">
                            <div className="alert-success">
                                <span>
                                    OTP भेज दिया गया है! | OTP has been sent to +91{phoneNumber}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    OTP कोड | OTP Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input-field text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    आपका नाम | Your Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="राज कुमार / Raj Kumar"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <button
                                onClick={verifyOTPAndSignup}
                                disabled={loading}
                                className="btn-primary w-full"
                            >
                                {loading ? 'Verifying...' : 'खाता बनाएं | Create Account'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
