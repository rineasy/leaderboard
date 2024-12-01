import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaderboardAPI, formatIDR } from '../services/api';
import ApplicationList from '../components/ApplicationList';
import { Helmet } from 'react-helmet-async';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newPlayer, setNewPlayer] = useState({ name: '', totalWin: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'applications'>('applications');

  // Check for authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch players query
  const { 
    data: players, 
    isLoading,
    isError,
    error: queryError 
  } = useQuery({
    queryKey: ['players', searchQuery],
    queryFn: () => searchQuery ? leaderboardAPI.searchPlayers(searchQuery) : leaderboardAPI.getPlayers(),
    enabled: activeTab === 'players'
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: leaderboardAPI.createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setSuccess('Player added successfully!');
      setNewPlayer({ name: '', totalWin: '' });
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.message);
      }
    },
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: leaderboardAPI.deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setSuccess('Player deleted successfully!');
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.message);
      }
    },
  });

  // Update totalWin mutation
  const updateTotalWinMutation = useMutation({
    mutationFn: ({ id, totalWin }: { id: string; totalWin: number }) => 
      leaderboardAPI.updatePlayerScore(id, totalWin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setSuccess('Total win updated successfully!');
    },
    onError: (error: Error) => {
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.message);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newPlayer.name || !newPlayer.totalWin) {
      setError('Please fill in all fields');
      return;
    }

    addPlayerMutation.mutate({
      name: newPlayer.name,
      totalWin: parseInt(newPlayer.totalWin),
    });
  };

  const handleDelete = async (id: string) => {
    deletePlayerMutation.mutate(id);
  };

  const handleUpdateTotalWin = async (id: string, currentTotalWin: number) => {
    const newTotalWin = window.prompt('Enter new total win amount:', currentTotalWin.toString());
    if (newTotalWin === null) return;

    const totalWin = parseInt(newTotalWin);
    if (isNaN(totalWin)) {
      setError('Please enter a valid number');
      return;
    }

    updateTotalWinMutation.mutate({ id, totalWin });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-xl">Loading players...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Error!</h3>
            <div className="text-sm">{queryError instanceof Error ? queryError.message : 'Failed to load players'}</div>
          </div>
          <button onClick={() => window.location.reload()} className="btn btn-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Helmet>
        <title>Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-ghost">
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed mb-8">
          <button
            className={`tab ${activeTab === 'applications' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`tab ${activeTab === 'players' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
        </div>

        {activeTab === 'applications' ? (
          <ApplicationList />
        ) : (
          <>
            {/* Add Player Form */}
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title mb-4">Add New Player</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Player Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter player name"
                      className="input input-bordered"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      disabled={addPlayerMutation.isPending}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total Win (IDR)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter total win amount"
                      className="input input-bordered"
                      value={newPlayer.totalWin}
                      onChange={(e) => setNewPlayer({ ...newPlayer, totalWin: e.target.value })}
                      disabled={addPlayerMutation.isPending}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={`btn btn-primary ${addPlayerMutation.isPending ? 'loading' : ''}`}
                    disabled={addPlayerMutation.isPending}
                  >
                    {addPlayerMutation.isPending ? 'Adding...' : 'Add Player'}
                  </button>
                </form>

                {error && <div className="alert alert-error mt-4">{error}</div>}
                {success && <div className="alert alert-success mt-4">{success}</div>}
              </div>
            </div>

            {/* Search Bar */}
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="input input-bordered flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')} 
                      className="btn btn-ghost"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Players List</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Total Win</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players?.map((player) => (
                        <tr key={player._id}>
                          <td>
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <img src={player.avatar} alt={player.name} />
                              </div>
                            </div>
                          </td>
                          <td>{player.name}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{formatIDR(player.totalWin)}</span>
                              <button
                                onClick={() => handleUpdateTotalWin(player._id, player.totalWin)}
                                className="btn btn-xs btn-ghost"
                                disabled={updateTotalWinMutation.isPending}
                              >
                                ✏️
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDelete(player._id)}
                              className={`btn btn-error btn-sm ${deletePlayerMutation.isPending ? 'loading' : ''}`}
                              disabled={deletePlayerMutation.isPending}
                            >
                              {deletePlayerMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
