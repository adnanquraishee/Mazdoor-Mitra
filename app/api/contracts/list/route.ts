import { NextRequest, NextResponse } from 'next/server';
import { getAllContracts } from '@/lib/mockStorage';

export async function GET(request: NextRequest) {
    try {
        const contracts = getAllContracts();

        // Add mock job data for display
        const contractsWithJobs = contracts.map((contract) => ({
            ...contract,
            jobs: {
                job_id: contract.job_id,
                job_title: 'Construction Work - Mason',
                skill_required: 'Masonry',
                location: 'Navi Mumbai',
                contractor: {
                    name: 'Contractor',
                    phone: '+919876543210',
                },
            },
        }));

        console.log(`📊 Retrieved ${contractsWithJobs.length} contracts`);

        // Sort by created_at (newest first)
        contractsWithJobs.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json({
            success: true,
            contracts: contractsWithJobs,
        });
    } catch (error: any) {
        console.error('List contracts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
