import { NextRequest, NextResponse } from 'next/server';
import { storeContract } from '@/lib/mockStorage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            contractor_id,
            job_id,
            location,
            daily_wage,
            number_of_days,
            workers_required,
            work_hours_per_day,
            overtime_rate_per_hour,
            minimum_wage_alert,
            total_contract_amount,
        } = body;

        // Get contractor name from user context (or you can pass it)
        // For now, we'll extract from contractor_id or require it in body
        const contractor_name = body.contractor_name || 'Contractor';

        // Validation
        if (!contractor_id) {
            return NextResponse.json(
                { error: 'Contractor ID is required' },
                { status: 400 }
            );
        }

        if (!job_id) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        if (daily_wage <= 0 || number_of_days <= 0) {
            return NextResponse.json(
                { error: 'Invalid wage or days' },
                { status: 400 }
            );
        }

        // Generate unique contract ID
        const contract_id = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const currentTime = new Date().toISOString();

        // Create contract posted to marketplace
        const contractData = {
            id: contract_id,
            job_id,
            contractor_id,
            contractor_name,
            location: location || 'Not specified',
            worker_id: null,
            enrolled_workers: [],
            daily_wage,
            number_of_days,
            workers_required: workers_required || 1,
            workers_enrolled: 0,
            work_hours_per_day,
            overtime_rate_per_hour,
            minimum_wage_alert: minimum_wage_alert || false,
            total_contract_amount,
            contractor_accepted_at: currentTime,
            worker_accepted_at: null,
            contract_status: 'available' as const,
            created_at: currentTime,
            posted_at: currentTime,
        };

        // Store in memory
        storeContract(contractData);

        console.log(`\n✅ ========================================`);
        console.log(`✅ Contract created: ${contract_id}`);
        console.log(`📢 Posted to marketplace - Status: available`);
        console.log(`✅ ========================================\n`);

        return NextResponse.json({
            success: true,
            contract: contractData,
            message: 'Contract posted to marketplace successfully!',
        });
    } catch (error: any) {
        console.error('Create contract error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
