import { NextRequest, NextResponse } from 'next/server';
import { getAllContracts } from '@/lib/mockStorage';

export async function GET(request: NextRequest) {
    try {
        const contracts = getAllContracts();

        // Convert contracts to CSV format for Excel
        const headers = [
            'Contract ID',
            'Status',
            'Contractor ID',
            'Worker ID',
            'Daily Wage (₹)',
            'Days',
            'Workers Required',
            'Hours/Day',
            'Overtime Rate (₹)',
            'Total Amount (₹)',
            'Contractor Signed',
            'Worker Signed',
            'Created At',
            'Posted At',
        ];

        const rows = contracts.map((c) => [
            c.id,
            c.contract_status,
            c.contractor_id,
            c.worker_id || 'Not Assigned',
            c.daily_wage,
            c.number_of_days,
            c.workers_required,
            c.work_hours_per_day,
            c.overtime_rate_per_hour,
            c.total_contract_amount,
            c.contractor_accepted_at || 'Not Signed',
            c.worker_accepted_at || 'Not Signed',
            c.created_at,
            c.posted_at,
        ]);

        // Create CSV content
        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        // Return as downloadable CSV
        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="contracts_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error: any) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export contracts' }, { status: 500 });
    }
}
