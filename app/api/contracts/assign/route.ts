import { NextRequest, NextResponse } from 'next/server';
import { getContract, updateContract } from '@/lib/mockStorage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { contract_id, worker_id, worker_name, worker_phone } = body;

        // Validation
        if (!contract_id || !worker_id || !worker_name || !worker_phone) {
            return NextResponse.json(
                { error: 'Contract ID, Worker ID, name, and phone are required' },
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

        // Check if contract is available
        if (contract.contract_status !== 'available') {
            return NextResponse.json(
                { error: 'Contract is not available for enrollment' },
                { status: 400 }
            );
        }

        // Check if worker already enrolled
        const alreadyEnrolled = contract.enrolled_workers?.some(
            (w: any) => w.worker_id === worker_id
        );

        if (alreadyEnrolled) {
            return NextResponse.json(
                { error: 'You have already enrolled in this contract' },
                { status: 400 }
            );
        }

        // Check if spots available
        const currentEnrolled = contract.workers_enrolled || 0;
        if (currentEnrolled >= contract.workers_required) {
            return NextResponse.json(
                { error: 'No spots available - contract is full' },
                { status: 400 }
            );
        }

        // Add worker to enrolled list
        const enrolledWorkers = contract.enrolled_workers || [];
        enrolledWorkers.push({
            worker_id,
            worker_name,
            worker_phone,
            enrolled_at: new Date().toISOString(),
            worker_accepted_at: null, // Not yet signed with OTP
        });

        const newEnrolledCount = currentEnrolled + 1;

        // Update contract
        const updates: any = {
            enrolled_workers: enrolledWorkers,
            workers_enrolled: newEnrolledCount,
        };

        // Only change status to 'assigned' when ALL spots are filled
        if (newEnrolledCount >= contract.workers_required) {
            updates.contract_status = 'assigned';
        }
        // Otherwise, keep status as 'available'

        // Set legacy worker_id field
        if (!contract.worker_id) {
            updates.worker_id = worker_id;
        }

        const updated = updateContract(contract_id, updates);

        console.log(`\n✅ ========================================`);
        console.log(`✅ Worker ${worker_name} enrolled in contract ${contract_id}`);
        console.log(`📊 Spots: ${currentEnrolled + 1}/${contract.workers_required}`);
        console.log(`✅ ========================================\n`);

        return NextResponse.json({
            success: true,
            contract: updated,
            spots_remaining: contract.workers_required - (currentEnrolled + 1),
            message: 'Enrolled successfully! Now sign with OTP to confirm.',
        });
    } catch (error: any) {
        console.error('Assign contract error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
