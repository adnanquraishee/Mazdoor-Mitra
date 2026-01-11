import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone_number, otp_code, name, user_type } = body;

        if (!phone_number || !otp_code || !name || !user_type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify OTP
        const { data: otpData, error: otpError } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('phone_number', phone_number)
            .eq('otp_code', otp_code)
            .eq('is_verified', false)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (otpError || !otpData) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', phone_number)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists. Please login.' },
                { status: 409 }
            );
        }

        // Create new user
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
                phone_number,
                name,
                user_type,
                is_verified: true,
                preferred_language: 'hi',
            })
            .select()
            .single();

        if (userError) {
            console.error('User creation error:', userError);
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            );
        }

        // Mark OTP as verified
        await supabase
            .from('otp_verifications')
            .update({ is_verified: true })
            .eq('id', otpData.id);

        return NextResponse.json({
            success: true,
            user: newUser,
            message: 'Account created successfully',
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
