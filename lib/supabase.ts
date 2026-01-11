import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set. Please configure .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Helper functions for authentication
export const auth = {
    async signInWithOTP(phone: string, otp: string) {
        // Custom implementation - verify OTP from our database
        const { data, error } = await supabase
            .from('otp_verifications')
            .select('*')
            .eq('phone_number', phone)
            .eq('otp_code', otp)
            .eq('is_verified', false)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (error || !data) {
            throw new Error('Invalid or expired OTP');
        }

        // Mark OTP as verified
        await supabase
            .from('otp_verifications')
            .update({ is_verified: true })
            .eq('id', data.id);

        // Get or create user
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', phone)
            .single();

        return user;
    },

    async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return null;
        }

        // Get user details from our users table
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return user;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
};

// Database query helpers
export const db = {
    users: {
        async create(userData: any) {
            const { data, error } = await supabase
                .from('users')
                .insert(userData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        async getByPhone(phone: string) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('phone_number', phone)
                .single();

            return data; // May be null if not found
        },
    },

    workers: {
        async searchBySkill(skill: string, location?: string) {
            let query = supabase
                .from('worker_profiles')
                .select(`
          *,
          users!inner (*)
        `)
                .eq('is_available', true);

            if (skill) {
                query = query.eq('primary_skill', skill);
            }

            if (location) {
                query = query.ilike('location_city', `%${location}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },

        async updateAvailability(userId: string, isAvailable: boolean) {
            const { data, error } = await supabase
                .from('worker_profiles')
                .update({ is_available: isAvailable })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    },

    contracts: {
        async create(contractData: any) {
            const { data, error } = await supabase
                .from('suraksha_contracts')
                .insert(contractData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('suraksha_contracts')
                .select(`
          *,
          jobs!inner (
            *,
            contractor:users!jobs_contractor_id_fkey (*),
            worker:users!jobs_worker_id_fkey (*, worker_profiles (*))
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        async accept(contractId: string, userType: 'worker' | 'contractor') {
            const field = userType === 'worker' ? 'worker_accepted_at' : 'contractor_accepted_at';

            const { data: contract, error } = await supabase
                .from('suraksha_contracts')
                .update({ [field]: new Date().toISOString() })
                .eq('id', contractId)
                .select()
                .single();

            if (error) throw error;

            // Check if both have accepted - activate contract
            if (contract.worker_accepted_at && contract.contractor_accepted_at) {
                await supabase
                    .from('suraksha_contracts')
                    .update({ contract_status: 'active' })
                    .eq('id', contractId);

                await supabase
                    .from('jobs')
                    .update({
                        status: 'active',
                        started_at: new Date().toISOString()
                    })
                    .eq('id', contract.job_id);
            }

            return contract;
        },

        async getUserContracts(userId: string, userType: 'worker' | 'contractor') {
            const { data, error } = await supabase
                .from('suraksha_contracts')
                .select(`
          *,
          jobs!inner (
            *,
            contractor:users!jobs_contractor_id_fkey (*),
            worker:users!jobs_worker_id_fkey (*, worker_profiles (*))
          )
        `)
                .eq(userType === 'worker' ? 'jobs.worker_id' : 'jobs.contractor_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    },

    workLogs: {
        async create(logData: any) {
            const { data, error } = await supabase
                .from('work_logs')
                .insert(logData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async getByContract(contractId: string) {
            const { data, error } = await supabase
                .from('work_logs')
                .select('*')
                .eq('contract_id', contractId)
                .order('work_date', { ascending: false });

            if (error) throw error;
            return data || [];
        },
    },
};
