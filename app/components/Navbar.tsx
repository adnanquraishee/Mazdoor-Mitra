'use client';

import { useAuth, UserRole } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, User, Briefcase, LayoutDashboard, ShoppingBag, FileText } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const menuItems = {
        worker: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/worker/dashboard' },
            { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
        ],
        contractor: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/contractor/dashboard' },
            { label: 'Create Contract', icon: FileText, href: '/contracts/create' },
            { label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
        ],
    };

    if (!isAuthenticated) {
        return null;
    }

    const items = user ? menuItems[user.role] : [];

    return (
        <nav className="bg-white shadow-md border-b-2 border-primary-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <Shield className="w-8 h-8 text-primary-600" />
                        <div>
                            <h1 className="text-xl font-bold text-primary-900">MazdoorMitra</h1>
                            <p className="text-xs text-gray-500">मजदूर का साथी</p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex items-center gap-4">
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => router.push(item.href)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </button>
                            );
                        })}

                        {/* User Info and Logout */}
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                                    {user.role === 'worker' ? (
                                        <User className="w-4 h-4 text-primary-600" />
                                    ) : (
                                        <Briefcase className="w-4 h-4 text-secondary-600" />
                                    )}
                                    <span className="font-semibold text-sm">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-error-600 hover:bg-error-700 text-white pl-3 pr-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
