// Shared in-memory storage for development (no database required)
// Uses Node.js global to persist across API requests

interface OTPRecord {
    otp: string;
    expires: Date;
}

export interface EnrolledWorker {
    worker_id: string;
    worker_name: string;
    worker_phone: string;
    enrolled_at: string;
    worker_accepted_at: string | null;
}

export interface User {
    id: string;
    name: string;
    phone: string;
    role: 'worker' | 'contractor';
    created_at: string;
}

export interface Contract {
    id: string;
    job_id: string;
    contractor_id: string;
    contractor_name: string;
    location: string;
    worker_id: string | null; // Deprecated - kept for compatibility
    enrolled_workers: EnrolledWorker[];
    daily_wage: number;
    number_of_days: number;
    workers_required: number;
    workers_enrolled: number;
    work_hours_per_day: number;
    overtime_rate_per_hour: number;
    minimum_wage_alert: boolean;
    total_contract_amount: number;
    contractor_accepted_at: string | null;
    worker_accepted_at: string | null; // Deprecated
    contract_status: 'available' | 'assigned' | 'active' | 'completed' | 'disputed';
    created_at: string;
    posted_at: string;
}

// Initialize global stores using Node.js global namespace
declare global {
    var _contractsStore: Map<string, Contract> | undefined;
    var _otpStore: Map<string, OTPRecord> | undefined;
    var _usersStore: Map<string, User> | undefined;
}

// Initialize contracts store
if (!global._contractsStore) {
    global._contractsStore = new Map<string, Contract>();
    console.log('🔧 Initialized global contracts store');
}

// Initialize OTP store
if (!global._otpStore) {
    global._otpStore = new Map<string, OTPRecord>();
    console.log('🔧 Initialized global OTP store');
}

// Initialize users store
if (!global._usersStore) {
    global._usersStore = new Map<string, User>();
    console.log('🔧 Initialized global users store');
}

const contractsStore = global._contractsStore;
const otpStore = global._otpStore;
const usersStore = global._usersStore;

// User storage functions
export function createOrGetUser(name: string, phone: string, role: 'worker' | 'contractor'): User {
    // Check if user already exists by phone number
    for (const user of usersStore.values()) {
        if (user.phone === phone && user.role === role) {
            console.log(`✅ Existing user found: ${user.name} (${user.phone})`);
            return user;
        }
    }

    // Create new user
    const userId = `${role}-${phone.replace(/\+/g, '')}`;
    const newUser: User = {
        id: userId,
        name,
        phone,
        role,
        created_at: new Date().toISOString(),
    };

    usersStore.set(userId, newUser);
    console.log(`✅ New user created: ${newUser.name} (${newUser.phone})`);
    return newUser;
}

export function getUser(userId: string): User | null {
    return usersStore.get(userId) || null;
}

export function getAllUsers(): User[] {
    return Array.from(usersStore.values());
}

// Helper functions
export function storeOTP(phone: string, otp: string, expiryMinutes: number = 5) {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expiryMinutes);
    otpStore.set(phone, { otp, expires });
    console.log(`💾 Stored OTP for ${phone}: ${otp} (${otpStore.size} total)`);
}

export function verifyOTP(phone: string, otp: string): boolean {
    const record = otpStore.get(phone);

    if (!record) {
        console.log(`❌ No OTP found for ${phone}`);
        return false;
    }

    if (new Date() > record.expires) {
        console.log(`⏰ OTP expired for ${phone}`);
        otpStore.delete(phone);
        return false;
    }

    if (record.otp !== otp) {
        console.log(`❌ Invalid OTP: expected ${record.otp}, got ${otp}`);
        return false;
    }

    console.log(`✅ OTP verified for ${phone}`);
    otpStore.delete(phone);
    return true;
}

export function storeContract(contract: Contract) {
    contractsStore.set(contract.id, contract);
    console.log(`💾 Stored contract: ${contract.id}`);
    console.log(`📊 Total contracts: ${contractsStore.size}`);
}

export function getContract(id: string): Contract | undefined {
    const contract = contractsStore.get(id);
    if (!contract) {
        console.log(`❌ Contract ${id} not found`);
        console.log(`📊 Available: [${Array.from(contractsStore.keys()).join(', ')}]`);
    } else {
        console.log(`✅ Found contract: ${id}`);
    }
    return contract;
}

export function getAllContracts(): Contract[] {
    const contracts = Array.from(contractsStore.values());
    console.log(`📊 Retrieved ${contracts.length} contracts`);
    return contracts;
}

export function updateContract(id: string, updates: Partial<Contract>): Contract | null {
    const contract = contractsStore.get(id);
    if (!contract) {
        console.log(`❌ Cannot update - contract ${id} not found`);
        return null;
    }

    const updated = { ...contract, ...updates };
    contractsStore.set(id, updated);
    console.log(`📝 Updated contract: ${id}`);
    return updated;
}
