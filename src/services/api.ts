import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export interface Player {
    _id: string;
    name: string;
    totalWin: number;
    avatar: string;
    createdAt: string;
}

export interface Application {
    _id: string;
    name: string;
    nickname: string;
    accountName: string;
    email: string;
    phoneNumber: string;
    totalWin: number;
    proofUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export interface CreatePlayerData {
    name: string;
    totalWin: number;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface CreateApplicationData {
    name: string;
    email: string;
    phoneNumber: string;
    totalWin: number;
    proofUrl: string;
}

export interface ApplicationSubmission {
    name: string;
    email: string;
    phoneNumber: string;
    nickname: string;
    accountName: string;
    totalWin: number;
    proofUrl?: string;
}

class LeaderboardAPI {
    // Auth methods
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    }

    // Get all players sorted by totalWin
    async getPlayers(): Promise<Player[]> {
        const response = await api.get<Player[]>('/players');
        return response.data;
    }

    // Get weekly top players
    async getWeeklyPlayers(): Promise<Player[]> {
        const response = await api.get<Player[]>('/players/weekly');
        return response.data;
    }

    // Get monthly top players
    async getMonthlyPlayers(): Promise<Player[]> {
        const response = await api.get<Player[]>('/players/monthly');
        return response.data;
    }

    // Get top players
    async getTopPlayers(limit: number = 10): Promise<Player[]> {
        const response = await api.get<Player[]>(`/players/top?limit=${limit}`);
        return response.data;
    }

    // Search players by name
    async searchPlayers(query: string): Promise<Player[]> {
        try {
            const response = await api.get<Player[]>(`/players/search?q=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching players:', error);
            throw error;
        }
    }

    // Create a new player
    async createPlayer(data: CreatePlayerData): Promise<Player> {
        try {
            const response = await api.post<Player>('/players', data);
            return response.data;
        } catch (error) {
            console.error('Error creating player:', error);
            throw error;
        }
    }

    // Update player's totalWin
    async updatePlayerScore(id: string, totalWin: number): Promise<Player> {
        try {
            const response = await api.patch<Player>(`/players/${id}`, { totalWin });
            return response.data;
        } catch (error) {
            console.error('Error updating player score:', error);
            throw error;
        }
    }

    // Delete a player
    async deletePlayer(id: string): Promise<void> {
        try {
            await api.delete(`/players/${id}`);
        } catch (error) {
            console.error('Error deleting player:', error);
            throw error;
        }
    }

    // Application methods
    async submitApplication(data: CreateApplicationData): Promise<Application> {
        const response = await api.post<Application>('/applications', data);
        return response.data;
    }

    async getApplications(): Promise<Application[]> {
        const response = await api.get<Application[]>('/applications');
        return response.data;
    }

    async updateApplicationStatus(id: string, status: 'approved' | 'rejected'): Promise<Application> {
        const response = await api.patch<Application>(`/applications/${id}`, { status });
        return response.data;
    }

    // Submit new application
    async submitNewApplication(data: ApplicationSubmission): Promise<Application> {
        try {
            const response = await api.post<Application>('/applications', data);
            return response.data;
        } catch (error) {
            console.error('Error submitting application:', error);
            throw error;
        }
    }
}

// Helper function to format currency in IDR
export function formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export const leaderboardAPI = new LeaderboardAPI();
