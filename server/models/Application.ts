import mongoose from 'mongoose';

export interface IApplication {
    name: string;
    email: string;
    phoneNumber: string;
    nickname: string;
    accountName: string;
    totalWin: number;
    proofUrl?: string; 
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

const applicationSchema = new mongoose.Schema<IApplication>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    nickname: {
        type: String,
        required: true,
        trim: true
    },
    accountName: {
        type: String,
        required: true,
        trim: true
    },
    totalWin: {
        type: Number,
        required: true,
        min: 0
    },
    proofUrl: {
        type: String,
        required: false, 
        default: '',
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IApplication>('Application', applicationSchema);
