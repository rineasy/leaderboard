import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaderboardAPI, Application, formatIDR } from '../services/api';

const ApplicationList: React.FC = () => {
    const queryClient = useQueryClient();
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const { data: applications, isLoading, isError } = useQuery({
        queryKey: ['applications'],
        queryFn: leaderboardAPI.getApplications,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
            leaderboardAPI.updateApplicationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['players'] });
            setSuccess('Application status updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        },
        onError: (error: Error) => {
            setError(error.message);
            setTimeout(() => setError(''), 3000);
        },
    });

    const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
        updateStatusMutation.mutate({ id, status });
    };

    const getStatusBadgeClass = (status: Application['status']) => {
        switch (status) {
            case 'pending':
                return 'badge badge-warning';
            case 'approved':
                return 'badge badge-success';
            case 'rejected':
                return 'badge badge-error';
            default:
                return 'badge';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error loading applications</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Applications</h2>

            {error && (
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{success}</span>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Nama Palsu</th>
                            <th>Nama Akun</th>
                            <th>Contact</th>
                            <th>Total Win</th>
                            <th>Status</th>
                            <th>Proof</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications?.map((application) => (
                            <tr key={application._id}>
                                <td>{application.name}</td>
                                <td>{application.nickname}</td>
                                <td>{application.accountName}</td>
                                <td>
                                    <div className="flex flex-col">
                                        <span>{application.email}</span>
                                        <span className="text-sm opacity-70">{application.phoneNumber}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono">{formatIDR(application.totalWin)}</span>
                                </td>
                                <td>
                                    <span className={getStatusBadgeClass(application.status)}>
                                        {application.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    {application.proofUrl && (
                                        <a
                                            href={application.proofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-xs btn-ghost"
                                        >
                                            View Proof
                                        </a>
                                    )}
                                </td>
                                <td>
                                    {application.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(application._id, 'approved')}
                                                className="btn btn-success btn-sm"
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                                className="btn btn-error btn-sm"
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationList;
