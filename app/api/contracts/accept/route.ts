import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, getContract, updateContract } from '@/lib/mockStorage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { contract_id, phone_number, otp_code, user_type } = body;

        // Validation
        if (!contract_id || !phone_number || !otp_code || !user_type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (user_type !== 'worker' && user_type !== 'contractor') {
            return NextResponse.json(
                { error: 'Invalid user type' },
                { status: 400 }
            );
        }

        // Verify OTP
        if (!verifyOTP(phone_number, otp_code)) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Get contract
        const contract = getContract(contract_id);

        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found' },
                { status: 404 }
            );
        }

        // Update contract based on user type
        const currentTime = new Date().toISOString();
        let updates: any = {};

        if (user_type === 'contractor') {
            if (!contract.contractor_accepted_at) {
                updates.contractor_accepted_at = currentTime;
            }
        } else if (user_type === 'worker') {
            // Find the worker in enrolled_workers and mark them as accepted
            const enrolledWorkers = contract.enrolled_workers || [];
            const workerIndex = enrolledWorkers.findIndex(
                (w: any) => w.worker_phone === phone_number
            );

            if (workerIndex >= 0) {
                enrolledWorkers[workerIndex].worker_accepted_at = currentTime;
                updates.enrolled_workers = enrolledWorkers;
            }

            // Also update legacy worker_accepted_at if this is the first/primary worker
            if (!contract.worker_accepted_at && contract.worker_id) {
                updates.worker_accepted_at = currentTime;
            }
        }

        // Check if both parties have accepted
        const contractorAccepted = updates.contractor_accepted_at || contract.contractor_accepted_at;
        const workerAccepted = updates.worker_accepted_at || contract.worker_accepted_at;
        const bothAccepted = contractorAccepted && workerAccepted;

        // If both have accepted, activate the contract
        if (bothAccepted && contract.contract_status === 'assigned') {
            updates.contract_status = 'active';
        }

        const updatedContract = updateContract(contract_id, updates);

        console.log(`\n✅ ========================================`);
        console.log(`✅ Contract ${contract_id} accepted by ${user_type}`);
        if (bothAccepted) {
            console.log(`🎉 Contract ${contract_id} is now ACTIVE!`);
        }
        console.log(`✅ ========================================\n`);

        return NextResponse.json({
            success: true,
            contract: updatedContract,
            message: bothAccepted
                ? 'Contract activated! Both parties have accepted.'
                : `Contract accepted by ${user_type}. Waiting for other party.`,
        });
    } catch (error: any) {
        console.error('Accept contract error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
