import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { leaderboardAPI } from '../services/api';
import { Helmet } from 'react-helmet-async';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loginMutation = useMutation({
        mutationFn: leaderboardAPI.login,
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            navigate('/admin');
        },
        onError: (error: Error) => {
            setError('Invalid username or password');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        loginMutation.mutate({ username, password });
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <Helmet>
                <title>Admin Login</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="card w-96 bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Admin Login</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="input input-bordered"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loginMutation.isPending}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="input input-bordered"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loginMutation.isPending}
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${loginMutation.isPending ? 'loading' : ''}`}
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
