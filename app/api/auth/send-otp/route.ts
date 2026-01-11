import { NextRequest, NextResponse } from 'next/server';
import { storeOTP } from '@/lib/mockStorage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone_number } = body;

        if (!phone_number || !phone_number.startsWith('+91')) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otp_code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP (expires in 5 minutes)
        storeOTP(phone_number, otp_code, 5);

        // Log OTP to console for testing
        console.log(`\n📱 ========================================`);
        console.log(`📱 OTP for ${phone_number}: ${otp_code}`);
        console.log(`📱 ========================================\n`);

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully',
            // Return OTP in development mode for testing
            otp: otp_code,
            phone_number: phone_number,
        });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
