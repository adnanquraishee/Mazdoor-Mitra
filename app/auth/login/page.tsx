'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { User, Briefcase, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+91');

    const handleLogin = async () => {
        if (!selectedRole || !name || phone.length < 13) {
            alert('Please fill all fields');
            return;
        }

        try {
            // Call login API to create or get user
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    role: selectedRole,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user in context (localStorage)
            login(data.user);

            // Show welcome message if returning user
            if (data.message === 'Welcome back!') {
                alert(`Welcome back, ${data.user.name}! 👋`);
            }

            // Redirect based on role
            if (selectedRole === 'worker') {
                router.push('/worker/dashboard');
            } else {
                router.push('/contractor/dashboard');
            }
        } catch (error: any) {
            alert(`Login error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Shield className="w-20 h-20 text-secondary-300 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-white mb-2">MazdoorMitra</h1>
                    <p className="text-primary-200">मजदूर का साथी</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Login / लॉगिन करें</h2>

                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">Select Role / भूमिका चुनें</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedRole('worker')}
                                className={`p-4 rounded-xl border-2 transition-all ${selectedRole === 'worker'
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                    }`}
                            >
                                <User
                                    className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'worker' ? 'text-primary-600' : 'text-gray-400'
                                        }`}
                                />
                                <p className="font-semibold text-center">Worker</p>
                                <p className="text-xs text-gray-500 text-center">मजदूर</p>
                            </button>

                            <button
                                onClick={() => setSelectedRole('contractor')}
                                className={`p-4 rounded-xl border-2 transition-all ${selectedRole === 'contractor'
                                    ? 'border-secondary-600 bg-secondary-50'
                                    : 'border-gray-200 hover:border-secondary-300'
                                    }`}
                            >
                                <Briefcase
                                    className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'contractor' ? 'text-secondary-600' : 'text-gray-400'
                                        }`}
                                />
                                <p className="font-semibold text-center">Contractor</p>
                                <p className="text-xs text-gray-500 text-center">ठेकेदार</p>
                            </button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Name / नाम
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Phone Number / फोन नंबर
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field"
                            placeholder="+919876543210"
                            maxLength={13}
                        />
                        <p className="text-xs text-gray-500 mt-1">Demo: Any number works</p>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={!selectedRole || !name || phone.length < 13}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <span>Login / लॉगिन करें</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Demo Notice */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-900">
                            <strong>🧪 Demo Mode:</strong> No password needed. Just enter your name and any phone number to login.
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-white hover:text-primary-200 transition-colors mx-auto block"
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}
