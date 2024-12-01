import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardAPI, formatIDR } from '../services/api';
import { Helmet } from 'react-helmet-async';

const ITEMS_PER_PAGE = 10;

type TimeFilter = 'all' | 'weekly' | 'monthly';

// Custom debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center p-4 bg-base-200 rounded-lg">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="ml-4 space-y-2 flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const ShareButton: React.FC<{ player: any; rank: number }> = ({ player, rank }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = React.useRef<NodeJS.Timeout>();

  const showCopiedTooltip = () => {
    setShowTooltip(true);
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    tooltipTimeout.current = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

  const handleShare = async () => {
    const text = `🏆 LAPAKTOTO Leaderboard\n\n${rank}. ${player.name}\n💰 ${formatIDR(player.totalWin)}\n\nJoin now: ${window.location.origin}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'LAPAKTOTO Leaderboard',
          text: text,
          url: window.location.href,
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showCopiedTooltip();
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showCopiedTooltip();
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="btn btn-ghost btn-circle btn-sm"
        aria-label="Share"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-primary text-primary-content rounded shadow">
          Copied!
        </div>
      )}
    </div>
  );
};

const LeaderboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'totalWin' | 'name'>('totalWin');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const { data: players = [], isLoading, isError } = useQuery({
    queryKey: ['players', timeFilter],
    queryFn: () => {
      switch (timeFilter) {
        case 'weekly':
          return leaderboardAPI.getWeeklyPlayers();
        case 'monthly':
          return leaderboardAPI.getMonthlyPlayers();
        default:
          return leaderboardAPI.getPlayers();
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update positions for animation
  useEffect(() => {
    const positions: Record<string, number> = {};
    players.forEach((player, index) => {
      positions[player._id] = index;
    });
  }, [players]);

  const debouncedSetSearch = useDebounce((value: string) => {
    setSearch(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  };

  const toggleSort = (field: 'totalWin' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'totalWin') {
        return (a.totalWin - b.totalWin) * modifier;
      }
      return a.name.localeCompare(b.name) * modifier;
    });

    return result;
  }, [players, search, sortBy, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = filteredAndSortedPlayers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isError) {
    return (
      <>
        <Helmet>
          <title>Error - Leaderboard LAPAKTOTO | Papan Peringkat Slot</title>
          <meta name="description" content="Maaf, terjadi kesalahan saat memuat Leaderboard LAPAKTOTO. Silakan coba beberapa saat lagi untuk melihat papan peringkat slot terkini." />
        </Helmet>
        <main className="min-h-screen bg-base-100 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="alert alert-error shadow-lg">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Error! Gagal memuat data leaderboard.</span>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Leaderboard - Top Players Rankings</title>
        <meta 
          name="description" 
          content="View the top players rankings in our leaderboard. Check out weekly, monthly, and all-time champions. Track player wins and compete for the top spot!" 
        />
      </Helmet>
      <main className="min-h-screen bg-base-100 pt-16">
        <div className="container mx-auto px-4 py-8">
          <article className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <header>
                <h1 className="card-title text-2xl font-bold mb-6">🏆 Leaderboard LAPAKTOTO | Papan Peringkat Slot</h1>
                <p className="text-base-content/70 mb-4">
                  Saksikan para pemain terbaik LAPAKTOTO dalam papan peringkat slot yang diperbarui secara real-time setiap 30 detik.
                </p>
              </header>

              {/* Time Period Tabs */}
              <div className="tabs tabs-boxed mb-6">
                <button 
                  className={`tab ${timeFilter === 'all' ? 'tab-active' : ''}`}
                  onClick={() => {
                    setTimeFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  All-Time
                </button>
                <button 
                  className={`tab ${timeFilter === 'weekly' ? 'tab-active' : ''}`}
                  onClick={() => {
                    setTimeFilter('weekly');
                    setCurrentPage(1);
                  }}
                >
                  Weekly Top
                </button>
                <button 
                  className={`tab ${timeFilter === 'monthly' ? 'tab-active' : ''}`}
                  onClick={() => {
                    setTimeFilter('monthly');
                    setCurrentPage(1);
                  }}
                >
                  Monthly Top
                </button>
              </div>
              
              {/* Search and Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="form-control flex-1">
                  <input
                    type="text"
                    placeholder="Cari pemain slot..."
                    className="input input-bordered w-full"
                    onChange={handleSearchChange}
                    aria-label="Cari pemain slot"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-ghost ${sortBy === 'name' ? 'btn-active' : ''}`}
                    onClick={() => toggleSort('name')}
                    aria-label="Urutkan berdasarkan nama"
                  >
                    Nama {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    className={`btn btn-ghost ${sortBy === 'totalWin' ? 'btn-active' : ''}`}
                    onClick={() => toggleSort('totalWin')}
                    aria-label="Urutkan berdasarkan kemenangan"
                  >
                    Menang {sortBy === 'totalWin' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <section className="space-y-4" aria-label="Daftar Pemain">
                  {paginatedPlayers.map((player, index) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

                    return (
                      <div
                        key={player._id}
                        className={`flex items-center p-4 rounded-lg transition-all duration-300 hover:bg-base-200 ${
                          globalIndex < 3 ? 'bg-gradient-to-r from-base-200 to-base-100' : ''
                        }`}
                        style={{
                          transform: 'translateY(0)',
                          opacity: 1,
                          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
                        }}
                      >
                        <div className="flex items-center justify-center w-12 text-xl font-bold">
                          {globalIndex < 3 ? (
                            <span className="text-primary" aria-label={`Peringkat ${globalIndex + 1}`}>
                              {globalIndex === 0 ? '🥇' : globalIndex === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            `#${globalIndex + 1}`
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <img
                              src={player.avatar}
                              alt={`Avatar ${player.name}`}
                              className="w-8 h-8 rounded-full mr-3"
                              loading="lazy"
                            />
                            <div className="flex flex-col">
                              <h2 className="font-bold text-lg">{player.name}</h2>
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold">
                                  {formatIDR(player.totalWin)}
                                </span>
                                <span className="text-xs text-base-content/60">total kemenangan</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ShareButton player={player} rank={globalIndex + 1} />
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-6" aria-label="Navigasi halaman">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                  >
                    «
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`btn btn-ghost btn-sm ${currentPage === i + 1 ? 'btn-active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                      aria-label={`Halaman ${i + 1}`}
                      aria-current={currentPage === i + 1 ? 'page' : undefined}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman berikutnya"
                  >
                    »
                  </button>
                </nav>
              )}
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default LeaderboardPage;
