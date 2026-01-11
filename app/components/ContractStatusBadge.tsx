'use client';

import { CheckCircle, Clock, AlertCircle, ShoppingBag } from 'lucide-react';
import { ContractStatus } from '@/types';

interface ContractStatusBadgeProps {
    status: ContractStatus;
    className?: string;
}

export default function ContractStatusBadge({ status, className = '' }: ContractStatusBadgeProps) {
    const statusConfig = {
        available: {
            label: 'Available / उपलब्ध',
            bgColor: 'bg-info-100',
            textColor: 'text-info-900',
            borderColor: 'border-info-300',
            icon: ShoppingBag,
        },
        assigned: {
            label: 'Assigned / सौंपा गया',
            bgColor: 'bg-warning-100',
            textColor: 'text-warning-900',
            borderColor: 'border-warning-300',
            icon: Clock,
        },
        draft: {
            label: 'Draft / ड्राफ्ट',
            icon: Clock,
            bgColor: 'bg-warning-100',
            textColor: 'text-warning-900',
            borderColor: 'border-warning-300',
        },
        active: {
            label: 'Active / सक्रिय',
            icon: CheckCircle,
            bgColor: 'bg-success-100',
            textColor: 'text-success-900',
            borderColor: 'border-success-300',
        },
        completed: {
            label: 'Completed / पूर्ण',
            icon: CheckCircle,
            bgColor: 'bg-info-100',
            textColor: 'text-info-900',
            borderColor: 'border-info-300',
        },
        disputed: {
            label: 'Disputed / विवादित',
            icon: AlertCircle,
            bgColor: 'bg-error-100',
            textColor: 'text-error-900',
            borderColor: 'border-error-300',
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-semibold text-sm">{config.label}</span>
        </div>
    );
}
