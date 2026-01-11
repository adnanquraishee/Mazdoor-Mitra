import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser } from '@/lib/mockStorage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, role } = body;

        // Validation
        if (!name || !phone || !role) {
            return NextResponse.json(
                { error: 'Name, phone, and role are required' },
                { status: 400 }
            );
        }

        if (role !== 'worker' && role !== 'contractor') {
            return NextResponse.json(
                { error: 'Invalid role. Must be worker or contractor' },
                { status: 400 }
            );
        }

        // Create or get existing user
        const user = createOrGetUser(name, phone, role);

        return NextResponse.json({
            success: true,
            user,
            message: user.created_at === new Date().toISOString()
                ? 'New user created'
                : 'Welcome back!',
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
