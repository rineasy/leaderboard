import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { leaderboardAPI } from '../services/api';
import { Link } from 'react-router-dom';

const ApplicationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        totalWin: '',
        proofUrl: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const applicationMutation = useMutation({
        mutationFn: leaderboardAPI.submitApplication,
        onSuccess: () => {
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                totalWin: '',
                proofUrl: ''
            });
        },
        onError: (error: Error) => {
            setError(error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!formData.name || !formData.email || !formData.phoneNumber || !formData.totalWin || !formData.proofUrl) {
            setError('Please fill in all fields');
            return;
        }

        applicationMutation.mutate({
            ...formData,
            totalWin: parseInt(formData.totalWin)
        });
    };

    if (success) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <div className="card w-96 bg-base-200 shadow-xl">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title text-2xl mb-4">Application Submitted!</h2>
                        <p className="mb-4">Thank you for your application. We will review it and get back to you soon.</p>
                        <div className="card-actions">
                            <Link to="/" className="btn btn-primary">Back to Leaderboard</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
            <div className="card w-full max-w-lg bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Apply for Leaderboard</h2>
                    <p className="mb-4">Please fill in your details to apply for the leaderboard. Make sure to provide accurate information and proof of your total winnings.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className="input input-bordered"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={applicationMutation.isPending}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input input-bordered"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={applicationMutation.isPending}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Phone Number</span>
                            </label>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                className="input input-bordered"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                disabled={applicationMutation.isPending}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Total Win (IDR)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="Enter your total winnings"
                                className="input input-bordered"
                                value={formData.totalWin}
                                onChange={(e) => setFormData({ ...formData, totalWin: e.target.value })}
                                disabled={applicationMutation.isPending}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Proof URL</span>
                            </label>
                            <input
                                type="url"
                                placeholder="Enter URL to your proof (screenshot, video, etc.)"
                                className="input input-bordered"
                                value={formData.proofUrl}
                                onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                                disabled={applicationMutation.isPending}
                            />
                            <label className="label">
                                <span className="label-text-alt">Upload your proof to a hosting service and paste the URL here</span>
                            </label>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-control mt-6">
                            <button
                                type="submit"
                                className={`btn btn-primary ${applicationMutation.isPending ? 'loading' : ''}`}
                                disabled={applicationMutation.isPending}
                            >
                                {applicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplicationPage;
