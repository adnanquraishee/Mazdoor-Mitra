import { NextRequest, NextResponse } from 'next/server';
import { getContract } from '@/lib/mockStorage';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const contractId = params.id;

        // Get contract from in-memory store
        const contract = getContract(contractId);

        if (!contract) {
            return NextResponse.json(
                { error: 'Contract not found. Please create a contract first from /contracts/create' },
                { status: 404 }
            );
        }

        // Add mock job data for display
        const contractWithJob = {
            ...contract,
            jobs: {
                id: contract.job_id,
                job_title: 'Construction Work',
                skill_required: 'Mason (Rajmistri)',
                location_address: 'Sector 15, Navi Mumbai, Maharashtra',
                status: contract.contract_status === 'active' ? 'active' : 'pending',
                contractor: {
                    id: 'contractor-1',
                    name: 'Raj Kumar',
                    phone_number: '+919876543210',
                },
                worker: {
                    id: 'worker-1',
                    name: 'Ramesh Kumar',
                    phone_number: '+919876543211',
                },
            },
        };

        return NextResponse.json({ contract: contractWithJob });
    } catch (error: any) {
        console.error('Fetch contract error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
