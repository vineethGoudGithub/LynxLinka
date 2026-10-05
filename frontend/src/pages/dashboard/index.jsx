import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, BarChart2, Plus, LogOut,
  Zap, TrendingUp, MousePointer,
  RefreshCw, ChevronRight, ExternalLink, Calendar,
  Download, Search, X, Filter
} from 'lucide-react';
import { API_BASE, BASE_DOMAIN } from './constants';
import { useAuth } from '../../context/AuthContext';
import { urlApi } from '../../services/api';
import { toast, ToastContainer } from '../../components/ui/Toast';
import StatCard from './StatCard';
import UrlRow from './UrlRow';
import AnalyticsModal from './AnalyticsModal';
import QrModal from './QrModal';
import CreatePanel from './CreatePanel';
import LynxLogo from '../../components/layout/LynxLogo';
import { PAGE_SIZE } from './constants';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('create');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [analyticsFor, setAnalyticsFor] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadUrls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await urlApi.getAll();
      setUrls(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUrls(); }, [loadUrls]);

  const handleCopy = async (shortCode) => {
    try {
      await navigator.clipboard.writeText(`${API_BASE}/${shortCode}`);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await urlApi.delete(id);
      setUrls((prev) => {
        const next = prev.filter((u) => u.uuid !== id);
        const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, maxPage));
        return next;
      });
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleQr = (shortCode) => setQrModal(shortCode);

  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount ?? 0), 0);

  const handleExportAllCsv = () => {
    if (!urls || urls.length === 0) {
      toast.error('No links available to export');
      return;
    }
    let csv = "Short Code,Full Short Link,Destination URL,Click Count,Created Date\n";
    urls.forEach((u) => {
      const dateStr = u.createdAt ? new Date(u.createdAt).toISOString() : '';
      const dest = (u.originalUrl || '').replace(/"/g, '""');
      csv += `"${u.shortUrl}","${API_BASE}/${u.shortUrl}","${dest}",${u.clickCount ?? 0},"${dateStr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lynxlink-all-links-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${urls.length} links to CSV!`);
  };

  const filteredUrls = useMemo(() => {
    return urls
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          (u.shortUrl || '').toLowerCase().includes(q) ||
          (u.originalUrl || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'clicks') return (b.clickCount ?? 0) - (a.clickCount ?? 0);
        if (sortBy === 'alias') return (a.shortUrl || '').localeCompare(b.shortUrl || '');
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [urls, searchQuery, sortBy]);

  const navItems = [
    { id: 'create', label: 'New Link', icon: <Plus className="w-4 h-4" /> },
    { id: 'links', label: 'My Links', icon: <Link2 className="w-4 h-4" />, badge: urls.length || null },
    { id: 'stats', label: 'Stats', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-neutral-900">
      <ToastContainer />

      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <LynxLogo className="w-7 h-7" showText={true} textClassName="text-base" />
          </div>

          {/* Center nav */}
          <nav className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 border border-neutral-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-inter
                  transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:block">{item.label}</span>
                {item.badge ? (
                  <span className="ml-1 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-mono">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Right — user + actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadUrls}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500
                hover:text-neutral-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-1.5 text-xs font-inter text-neutral-500 hover:text-neutral-900
                px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ── CREATE ── */}
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CreatePanel
                onCreated={(newUrl) => {
                  setUrls((prev) => [newUrl, ...prev]);
                  setPage(1);
                }}
              />
            </motion.div>
          )}

          {/* ── LINKS ── */}
          {activeTab === 'links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {/* Subheader */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-grotesk font-semibold text-neutral-900 text-lg">My Links</h2>
                  <p className="text-neutral-500 text-xs font-inter">
                    {urls.length} total link{urls.length !== 1 ? 's' : ''} · {totalClicks} total clicks
                    {searchQuery && ` · ${filteredUrls.length} matching`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportAllCsv}
                    disabled={urls.length === 0}
                    className="flex items-center gap-1.5 text-xs font-inter font-medium
                      bg-white border border-neutral-300 text-neutral-700 hover:text-emerald-800 hover:border-emerald-300
                      hover:bg-emerald-50/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                    title="Export all links as CSV spreadsheet"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="flex items-center gap-1.5 text-xs font-inter font-medium
                      bg-neutral-900 text-white px-3 py-1.5 rounded-lg
                      hover:bg-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New link
                  </button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              {urls.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-4">
                  {/* Search box */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                      placeholder="Search links by alias or destination URL..."
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2 text-xs font-inter text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); setPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[11px] font-inter text-neutral-400 hidden sm:inline">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                      className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-inter text-neutral-700 focus:outline-none focus:border-emerald-400 cursor-pointer w-full sm:w-auto"
                    >
                      <option value="newest">Newest First</option>
                      <option value="clicks">Most Clicks</option>
                      <option value="alias">Alias (A–Z)</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-7 h-7 border-2 border-neutral-300 border-t-emerald-600 rounded-full animate-spin" />
                </div>
              ) : urls.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-7 h-7 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 font-inter text-sm mb-1">No links yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-inter mt-1 transition-colors"
                  >
                    Create your first link →
                  </button>
                </div>
              ) : filteredUrls.length === 0 ? (
                <div className="text-center py-14 bg-white border border-neutral-200 rounded-2xl">
                  <Search className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-700 font-inter text-sm font-medium">No matching links found</p>
                  <p className="text-neutral-400 font-inter text-xs mt-0.5">Try a different search query or clear the filter</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-inter font-medium"
                  >
                    Reset search
                  </button>
                </div>
              ) : (() => {
                const totalPages = Math.max(1, Math.ceil(filteredUrls.length / PAGE_SIZE));
                const safePage = Math.min(page, totalPages);
                const pageUrls = filteredUrls.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

                const getPageNums = () => {
                  const nums = new Set([1, totalPages]);
                  for (let i = Math.max(1, safePage - 1); i <= Math.min(totalPages, safePage + 1); i++) nums.add(i);
                  return [...nums].sort((a, b) => a - b);
                };

                return (
                  <>
                    <AnimatePresence>
                      {pageUrls.map((url, i) => (
                        <UrlRow
                          key={url.uuid}
                          url={url}
                          index={i}
                          onCopy={handleCopy}
                          onDelete={handleDelete}
                          onQr={handleQr}
                          onAnalytics={setAnalyticsFor}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-200">
                        <p className="text-xs text-neutral-500 font-inter">
                          {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredUrls.length)} of {filteredUrls.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500
                              hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30
                              disabled:cursor-not-allowed transition-all text-xs"
                          >
                            ‹
                          </button>
                          {getPageNums().map((num, idx, arr) => (
                            <>
                              {idx > 0 && arr[idx - 1] < num - 1 && (
                                <span key={`ellipsis-${num}`} className="w-7 h-7 flex items-center justify-center text-neutral-400 text-xs">…</span>
                              )}
                              <button
                                key={num}
                                onClick={() => setPage(num)}
                                className={`w-7 h-7 rounded-lg text-xs font-mono transition-all ${
                                  num === safePage
                                    ? 'bg-neutral-900 text-white border border-neutral-900'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                }`}
                              >
                                {num}
                              </button>
                            </>
                          ))}
                          <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500
                              hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30
                              disabled:cursor-not-allowed transition-all text-xs"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-grotesk font-semibold text-neutral-900 text-lg mb-0.5">Performance Overview</h2>
                  <p className="text-neutral-500 text-xs font-inter">Live performance analytics across all created links</p>
                </div>
                <button
                  onClick={handleExportAllCsv}
                  disabled={urls.length === 0}
                  className="flex items-center gap-1.5 text-xs font-inter font-medium
                    bg-white border border-neutral-300 text-neutral-700 hover:text-emerald-800 hover:border-emerald-300
                    hover:bg-emerald-50/50 px-3.5 py-2 rounded-xl transition-all disabled:opacity-40 w-fit"
                  title="Export all links & clicks to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Export All Stats CSV
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<Link2 className="w-4 h-4 text-neutral-900" />}
                  label="Total Links"
                  value={urls.length}
                  gradient="bg-violet-500/5"
                />
                <StatCard
                  icon={<MousePointer className="w-4 h-4 text-emerald-600" />}
                  label="Total Clicks"
                  value={totalClicks}
                  gradient="bg-emerald-500/5"
                />
                <StatCard
                  icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
                  label="Avg. Clicks"
                  value={urls.length ? Math.round(totalClicks / urls.length) : 0}
                  sub="per link"
                  gradient="bg-indigo-500/5"
                />
                <StatCard
                  icon={<Zap className="w-4 h-4 text-emerald-600" />}
                  label="Cache Engine"
                  value="Active"
                  sub="Redis & Neon DB"
                  gradient="bg-emerald-500/5"
                />
              </div>

              {/* Top links table */}
              {urls.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-grotesk font-medium text-neutral-900">Top links by clicks</p>
                      <p className="text-xs text-neutral-400 font-inter mt-0.5">Sorted by total click volume</p>
                    </div>
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg font-medium">
                      top {Math.min(8, urls.length)}
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {[...urls]
                      .sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0))
                      .slice(0, 8)
                      .map((url, idx) => {
                        const pct = totalClicks > 0 ? ((url.clickCount ?? 0) / totalClicks) * 100 : 0;
                        const favicon = (() => {
                          try { return `https://icons.duckduckgo.com/ip3/${new URL(url.originalUrl).hostname}.ico`; }
                          catch { return null; }
                        })();
                        const createdDate = url.createdAt
                          ? new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : null;
                        const rankColors = ['text-emerald-700', 'text-neutral-700', 'text-amber-700'];
                        const rankBg = ['bg-emerald-50 border-emerald-300', 'bg-neutral-100 border-neutral-200', 'bg-amber-50 border-amber-200'];

                        return (
                          <div key={url.uuid} className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50/80 transition-colors group">
                            {/* Rank */}
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold
                              ${idx < 3 ? rankBg[idx] + ' ' + rankColors[idx] : 'bg-neutral-50 border-neutral-200 text-neutral-400'}`}>
                              {idx + 1}
                            </div>

                            {/* Favicon + URLs */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {favicon && (
                                  <img src={favicon} alt="" className="w-3.5 h-3.5 rounded-sm flex-shrink-0 object-contain"
                                    onError={(e) => e.currentTarget.style.display = 'none'} />
                                )}
                                <a
                                  href={`${API_BASE}/${url.shortUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-xs font-medium text-neutral-900 hover:text-emerald-600 transition-colors truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {BASE_DOMAIN}/{url.shortUrl}
                                </a>
                                <ExternalLink className="w-2.5 h-2.5 text-neutral-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-neutral-400 font-inter truncate leading-tight">
                                {url.originalUrl}
                              </p>
                            </div>

                            {/* Progress + stats */}
                            <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0 w-36">
                              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                                  className="h-full rounded-full bg-emerald-500"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                                {createdDate && (
                                  <span className="flex items-center gap-0.5">
                                    <Calendar className="w-2.5 h-2.5" />{createdDate}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Click count */}
                            <div className="flex flex-col items-end flex-shrink-0 w-16">
                              <span className="text-sm font-grotesk font-semibold text-neutral-900">
                                {(url.clickCount ?? 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-600 font-medium">
                                {pct.toFixed(1)}%
                              </span>
                            </div>

                            {/* Analytics button */}
                            <button
                              onClick={() => setAnalyticsFor(url.shortUrl)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400
                                hover:text-emerald-700 hover:bg-emerald-50 transition-all flex-shrink-0"
                              title="View analytics"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Analytics modal */}
      <AnimatePresence>
        {analyticsFor && (
          <AnalyticsModal shortCode={analyticsFor} onClose={() => setAnalyticsFor(null)} />
        )}
      </AnimatePresence>

      {/* QR code modal */}
      <AnimatePresence>
        {qrModal && (
          <QrModal shortCode={qrModal} onClose={() => setQrModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
