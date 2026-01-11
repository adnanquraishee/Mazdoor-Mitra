// Application-wide type definitions

export type UserType = 'worker' | 'contractor';

export type JobStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type ContractStatus = 'draft' | 'active' | 'completed' | 'disputed';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface User {
    id: string;
    phone_number: string;
    user_type: UserType;
    name: string;
    preferred_language: string;
    profile_image_url?: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkerProfile {
    id: string;
    user_id: string;
    primary_skill: string;
    secondary_skills?: string[];
    daily_rate: number;
    experience_years: number;
    location_city: string;
    location_state: string;
    location_pincode?: string;
    is_available: boolean;
    rating_average: number;
    total_jobs_completed: number;
    created_at: string;
}

export interface ContractorProfile {
    id: string;
    user_id: string;
    company_name?: string;
    location_city: string;
    location_state: string;
    rating_average: number;
    total_jobs_posted: number;
    created_at: string;
}

export interface Job {
    id: string;
    contractor_id: string;
    worker_id?: string;
    job_title: string;
    skill_required: string;
    location_address: string;
    status: JobStatus;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface SurakshaContract {
    id: string;
    job_id: string;
    daily_wage: number;
    number_of_days: number;
    work_hours_per_day: number;
    overtime_rate_per_hour: number;
    minimum_wage_alert: boolean;
    total_contract_amount: number;
    contractor_accepted_at?: string;
    worker_accepted_at?: string;
    contract_status: ContractStatus;
    created_at: string;
}

export interface WorkLog {
    id: string;
    contract_id: string;
    work_date: string;
    hours_worked: number;
    overtime_hours: number;
    daily_payment: number;
    marked_by: string;
    created_at: string;
}

export interface Payment {
    id: string;
    contract_id: string;
    amount: number;
    payment_status: PaymentStatus;
    payment_method?: string;
    transaction_reference?: string;
    paid_at?: string;
    created_at: string;
}

export interface OTPVerification {
    id: string;
    phone_number: string;
    otp_code: string;
    is_verified: boolean;
    expires_at: string;
    created_at: string;
}

// Extended types with joined data
export interface WorkerWithProfile extends User {
    worker_profile: WorkerProfile;
}

export interface ContractWithDetails extends SurakshaContract {
    job: Job;
    worker: User;
    contractor: User;
    worker_profile?: WorkerProfile;
}

// Form input types
export interface SignupFormData {
    phone_number: string;
    name: string;
    user_type: UserType;
    otp_code: string;
}

export interface WorkerProfileFormData {
    primary_skill: string;
    secondary_skills: string[];
    daily_rate: number;
    experience_years: number;
    location_city: string;
    location_state: string;
    location_pincode?: string;
}

export interface ContractFormData {
    daily_wage: number;
    number_of_days: number;
    work_hours_per_day: number;
    overtime_rate_per_hour: number;
}

// Constants
export const SKILL_CATEGORIES = [
    'Mason (Rajmistri)',
    'Plumber',
    'Electrician',
    'Carpenter',
    'Painter',
    'Helper (Mistri ka Helper)',
    'Steel Fixer',
    'Welder',
    'Loading/Unloading',
    'General Labor',
] as const;

export const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
] as const;

export const MINIMUM_WAGE = 400; // ₹400 per day
export const OTP_EXPIRY_MINUTES = 5;
export const DEFAULT_WORK_HOURS = 8;
