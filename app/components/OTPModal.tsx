'use client';

import { useState } from 'react';
import { X, Smartphone, Shield } from 'lucide-react';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    phoneNumber: string;
    onVerifySuccess: (otp: string) => void;
    title?: string;
}

export default function OTPModal({
    isOpen,
    onClose,
    phoneNumber,
    onVerifySuccess,
    title = 'Verify OTP to Accept Contract',
}: OTPModalProps) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [fakeOtp, setFakeOtp] = useState('');

    const sendOTP = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setOtpSent(true);

            // In development, show the OTP
            if (data.otp) {
                setFakeOtp(data.otp);
                console.log('📱 Development OTP:', data.otp);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = () => {
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        onVerifySuccess(otp);
    };

    const handleOtpChange = (value: string) => {
        // Only allow numbers and max 6 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setOtp(numericValue);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <p className="text-gray-600 text-sm">
                        OTP भेजें | Send OTP to {phoneNumber}
                    </p>
                </div>

                {!otpSent ? (
                    /* Send OTP Step */
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-semibold mb-1">सुरक्षित डिजिटल हस्ताक्षर</p>
                                    <p>
                                        You will receive a 6-digit OTP to digitally sign this contract.
                                        This ensures both parties agree to the terms.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="alert-error">
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={sendOTP}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Sending OTP...' : 'OTP भेजें | Send OTP'}
                        </button>
                    </div>
                ) : (
                    /* Enter OTP Step */
                    <div className="space-y-4">
                        {fakeOtp && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                                <p className="text-sm font-semibold text-yellow-900 mb-1">
                                    🧪 Development Mode
                                </p>
                                <p className="text-2xl font-mono font-bold text-yellow-900 text-center">
                                    {fakeOtp}
                                </p>
                                <p className="text-xs text-yellow-800 mt-1 text-center">
                                    Use this OTP for testing
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2 text-center">
                                OTP दर्ज करें | Enter 6-Digit OTP
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onChange={(e) => handleOtpChange(e.target.value)}
                                className="input-field text-center text-2xl font-mono tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="alert-error">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={sendOTP}
                                disabled={loading}
                                className="btn-outline flex-1"
                            >
                                {loading ? 'Resending...' : 'Resend OTP'}
                            </button>
                            <button
                                onClick={verifyOTP}
                                disabled={otp.length !== 6}
                                className="btn-primary flex-1"
                            >
                                Verify & Accept
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            ⏰ OTP expires in 5 minutes
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
