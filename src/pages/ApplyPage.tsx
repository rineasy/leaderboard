import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';

export default function ApplyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    nickname: '',
    accountName: '',
    totalWin: '',
    proofUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applicationData = {
        ...formData,
        totalWin: parseInt(formData.totalWin.replace(/[^0-9]/g, '')),
        proofUrl: formData.proofUrl || undefined // Only include proofUrl if it has a value
      };

      await leaderboardAPI.submitNewApplication(applicationData);
      
      navigate('/');
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'totalWin') {
      // Format as IDR currency
      const numericValue = value.replace(/[^0-9]/g, '');
      const formattedValue = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseInt(numericValue) || 0);
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl font-bold mb-6">🎮 Daftar Leaderboard</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nama Lengkap:</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email:</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nomor Telepon:</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nama Samaran:</span>
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nama Akun Di LAPAKTOTO:</span>
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Total Kemenangan:</span>
                  </label>
                  <input
                    type="text"
                    name="totalWin"
                    value={formData.totalWin}
                    onChange={handleChange}
                    className="input input-bordered w-full font-mono"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Bukti Kemenangan (URL) Optional:</span>
                  </label>
                  <input
                    type="url"
                    name="proofUrl"
                    value={formData.proofUrl}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="https://"
                  />
                </div>

                <div className="form-control mt-6">
                  <button 
                    type="submit" 
                    className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Mengirim...' : 'Kirim'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
