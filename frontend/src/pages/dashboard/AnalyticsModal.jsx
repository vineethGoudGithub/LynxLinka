import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MousePointer, Users, X, Download } from 'lucide-react';
import { urlApi } from '../../services/api';
import { toast } from '../../components/ui/Toast';
import { COLORS } from './constants';

export default function AnalyticsModal({ shortCode, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urlApi.getAnalytics(shortCode)
      .then(setData)
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  const handleExportCsv = () => {
    if (!data) return;
    let csv = "Section,Key,Value\n";
    csv += `Overview,Short Code,${shortCode}\n`;
    csv += `Overview,Total Clicks,${data.totalClicks || 0}\n`;
    csv += `Overview,Unique Visitors,${data.uniqueVisitors || 0}\n\n`;

    csv += `Timeline,Date,Clicks\n`;
    (data.clicksOverTime || []).forEach(row => {
      csv += `Timeline,${row.date},${row.count}\n`;
    });
    csv += `\nBrowser,Browser Name,Count\n`;
    (data.clicksByBrowser || []).forEach(row => {
      csv += `Browser,"${row.label || 'Unknown'}",${row.count}\n`;
    });
    csv += `\nOS,Operating System,Count\n`;
    (data.clicksByOs || []).forEach(row => {
      csv += `OS,"${row.label || 'Unknown'}",${row.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lynxlink-analytics-${shortCode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics CSV exported!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto
          rounded-3xl border border-neutral-200 bg-white"
        style={{ boxShadow: '0 20px 70px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
          <div>
            <h2 className="font-grotesk font-bold text-neutral-900 text-lg">Analytics Overview</h2>
            <p className="text-emerald-700 text-xs font-mono font-medium mt-0.5">/{shortCode}</p>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-emerald-300 bg-neutral-50 hover:bg-emerald-50/50 text-xs font-inter text-neutral-700 hover:text-emerald-800 transition-all"
                title="Export analytics data as CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500
                hover:text-neutral-900 hover:bg-neutral-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-neutral-300 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-neutral-500 text-center py-12 font-inter text-sm">No data available</p>
          ) : (
            <div className="space-y-5">
              {/* Top stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Clicks', value: data.totalClicks, icon: <MousePointer className="w-4 h-4 text-emerald-600" /> },
                  { label: 'Unique Visitors', value: data.uniqueVisitors, icon: <Users className="w-4 h-4 text-indigo-600" /> },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-neutral-200 bg-[#fafaf9] p-4 text-center">
                    <div className="flex justify-center mb-2">{s.icon}</div>
                    <div className="font-grotesk font-bold text-2xl text-neutral-900">{s.value}</div>
                    <div className="text-neutral-500 text-xs font-inter mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Clicks over time */}
              {data.clicksOverTime?.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-[#fafaf9] p-4">
                  <p className="text-xs text-neutral-500 font-inter uppercase tracking-wider mb-4">Clicks over time (30d)</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={data.clicksOverTime} barSize={8}>
                      <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip
                        cursor={{ fill: 'rgba(16,185,129,0.12)' }}
                        contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, color: '#111', fontSize: 12 }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Browser & OS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Browsers', key: 'clicksByBrowser' },
                  { title: 'Operating Systems', key: 'clicksByOs' },
                ].map(({ title, key }) =>
                  data[key]?.length > 0 ? (
                    <div key={title} className="rounded-2xl border border-neutral-200 bg-[#fafaf9] p-4">
                      <p className="text-xs text-neutral-500 font-inter uppercase tracking-wider mb-3">{title}</p>
                      <div className="space-y-2.5">
                        {data[key].slice(0, 5).map((item, i) => {
                          const total = data[key].reduce((sum, d) => sum + Number(d.count), 0);
                          const pct = total > 0 ? (Number(item.count) / total) * 100 : 0;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs font-inter text-neutral-500 w-20 truncate">{item.label || 'Unknown'}</span>
                              <div className="flex-1 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ background: COLORS[i % COLORS.length] }}
                                />
                              </div>
                              <span className="text-xs text-neutral-500 w-6 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null
                )}
              </div>


            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
