'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { CheckCircle, Shield, TrendingUp, LogIn } from 'lucide-react';
import { useEffect } from 'react';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'worker') {
                router.push('/worker/dashboard');
            } else {
                router.push('/contractor/dashboard');
            }
        }
    }, [isAuthenticated, user, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <Shield className="w-24 h-24 text-primary-600" />
                    </div>
                    <h1 className="text-6xl font-bold mb-4 text-primary-900">
                        MazdoorMitra
                    </h1>
                    <p className="text-3xl mb-2 text-primary-700">
                        मजदूर का साथी
                    </p>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        Friend of the Laborer - Protecting Workers Through Digital Contracts
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-100">
                        <CheckCircle className="w-12 h-12 mb-4 text-primary-600" />
                        <h3 className="text-2xl font-bold mb-3 text-primary-900">
                            सुरक्षा कॉन्ट्रैक्ट
                        </h3>
                        <p className="text-gray-700">
                            Mandatory digital contracts with dual signatures ensure fair wages and protection
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-100">
                        <Shield className="w-12 h-12 mb-4 text-secondary-600" />
                        <h3 className="text-2xl font-bold mb-3 text-primary-900">
                            Contract Marketplace
                        </h3>
                        <p className="text-gray-700">
                            Browse available contracts, choose work that suits you, and get paid fairly
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-primary-100">
                        <TrendingUp className="w-12 h-12 mb-4 text-success-600" />
                        <h3 className="text-2xl font-bold mb-3 text-primary-900">
                            Role-Based Access
                        </h3>
                        <p className="text-gray-700">
                            Separate dashboards for workers and contractors with tailored features
                        </p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-6 h-6" />
                        Login / लॉगिन करें
                    </button>
                </div>

                {/* Demo Notice */}
                <div className="mt-16 max-w-2xl mx-auto bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                    <p className="text-lg font-semibold mb-2 text-yellow-900">🧪 Demo Mode</p>
                    <p className="text-sm text-yellow-800">
                        Login as Worker or Contractor to explore the system. No password needed!
                        Contractors can create contracts, workers can browse marketplace and accept work.
                    </p>
                </div>
            </div>
        </div>
    );
}
