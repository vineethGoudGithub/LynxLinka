import { Zap, BarChart2, Link, Shield, QrCode, Lock } from 'lucide-react';

export const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Sub-10ms Redirects',
    desc: 'High-speed Redis caching delivers instant redirects with sub-10ms latency.',
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'text-emerald-600',
    border: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Real-time Analytics & CSV Export',
    desc: 'Track clicks, devices, referrers, and export comprehensive CSV data reports in one click.',
    color: 'bg-indigo-50 text-indigo-600',
    accent: 'text-indigo-600',
    border: 'hover:border-indigo-300 hover:shadow-indigo-500/10',
  },
  {
    icon: <Link className="w-6 h-6" />,
    title: 'Custom Branded Aliases',
    desc: 'Create memorable custom URLs like lynxlink/my-project instead of random strings.',
    color: 'bg-cyan-50 text-cyan-600',
    accent: 'text-cyan-600',
    border: 'hover:border-cyan-300 hover:shadow-cyan-500/10',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Cloud PostgreSQL & Neon DB',
    desc: 'Powered by Neon Serverless PostgreSQL with auto-scaling connection pooling.',
    color: 'bg-teal-50 text-teal-600',
    accent: 'text-teal-600',
    border: 'hover:border-teal-300 hover:shadow-teal-500/10',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: 'Instant QR Generation',
    desc: 'Generate, preview, and download crisp QR codes for digital marketing and print.',
    color: 'bg-emerald-50 text-emerald-600',
    accent: 'text-emerald-600',
    border: 'hover:border-emerald-300 hover:shadow-emerald-500/10',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'JWT Auth & Security',
    desc: 'Secured with stateless JWT tokens, BCrypt hashing, and resilient sliding rate limits.',
    color: 'bg-slate-100 text-slate-800',
    accent: 'text-slate-800',
    border: 'hover:border-slate-300 hover:shadow-slate-500/10',
  },
];

export const steps = [
  { num: '01', title: 'Paste your URL', desc: 'Drop any long URL into the input field on your dashboard.' },
  { num: '02', title: 'Customize (optional)', desc: 'Add a custom alias to make your link memorable and on-brand.' },
  { num: '03', title: 'Share & track', desc: 'Get your short link instantly. Every click is tracked in real time.' },
];

export const stats = [
  { label: 'Links created', value: 100, suffix: '+' },
  { label: 'Clicks tracked', value: 500, suffix: '+' },
  { label: 'Avg. redirect time', value: 8, suffix: 'ms' },
  { label: 'Uptime', value: 99.9, suffix: '%' },
];
