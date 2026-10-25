import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Languages, 
  Download, 
  ExternalLink, 
  GraduationCap, 
  Briefcase, 
  Code, 
  User,
  ChevronRight,
  Mail,
  Database,
  Server,
  Palette,
  Atom,
  Target,
  BookOpen,
  History,
  Award,
  Coffee,
  Terminal,
  Menu,
  X,
  LayoutGrid,
  ArrowLeft,
  Plus,
  Trash2,
  NotebookPen,
  DownloadCloud
} from 'lucide-react';
import { translations, Language } from './translations';
import Markdown from 'react-markdown';

type Student = { id: string; name: string; grades: [number, number, number] };

const STORAGE_KEY = 'inotas.students';
const LIMIT_KEY = 'inotas.limit';
const BOM_PREFIX = String.fromCharCode(0xFEFF);

const averageOf = (g: [number, number, number]) => (g[0] + g[1] + g[2]) / 3;

function INotesApp({ t }: { t: any }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [grades, setGrades] = useState<[string, string, string]>(['', '', '']);
  const [limit, setLimit] = useState(70);
  const [sortBy, setSortBy] = useState<'name' | 'average'>('name');
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStudents(JSON.parse(raw));
      const lim = localStorage.getItem(LIMIT_KEY);
      if (lim) setLimit(Number(lim));
    } catch {
      /* dados corrompidos: inicia vazio */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LIMIT_KEY, String(limit));
  }, [limit, hydrated]);

  const setGrade = (index: number, value: string) => {
    const next: [string, string, string] = [...grades];
    next[index] = value;
    setGrades(next);
  };

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = grades.map((g) => Number(g.replace(',', '.')));
    const filled = grades.every((g) => g.trim().length > 0);
    const valid = name.trim().length > 0 && filled && parsed.every((g) => !Number.isNaN(g) && g >= 0 && g <= 100);
    if (!valid) {
      setError(t.invalidGrades);
      return;
    }
    setError('');
    setStudents((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        grades: [parsed[0], parsed[1], parsed[2]],
      },
    ]);
    setName('');
    setGrades(['', '', '']);
  };

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    setStudents([]);
    setError('');
  };

  const exportCsv = () => {
    const header = ['Aluno', 'Avaliacao 1', 'Avaliacao 2', 'Avaliacao 3', 'Media', 'Situacao'];
    const rows = sortedStudents.map((s) => {
      const avg = averageOf(s.grades);
      return [
        s.name,
        s.grades[0].toFixed(1),
        s.grades[1].toFixed(1),
        s.grades[2].toFixed(1),
        avg.toFixed(1),
        avg >= limit ? 'Aprovado' : 'Reprovado',
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([BOM_PREFIX, csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inotas.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const classAverage = students.length
    ? students.reduce((acc, s) => acc + averageOf(s.grades), 0) / students.length
    : 0;
  const approvedCount = students.filter((s) => averageOf(s.grades) >= limit).length;
  const repassedCount = students.length - approvedCount;

  const sortedStudents = [...students].sort((a, b) =>
    sortBy === 'name'
      ? a.name.localeCompare(b.name, 'pt-BR')
      : averageOf(b.grades) - averageOf(a.grades)
  );

  const inputClass =
    'w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400';

  return (
    <div className="space-y-8">
      {/* Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: t.totalStudents, value: String(students.length) },
          { label: t.classAverage, value: classAverage.toFixed(1) },
          { label: t.approvedCount, value: String(approvedCount) },
          { label: t.repassedCount, value: String(repassedCount) },
        ].map((card) => (
          <div key={card.label} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 truncate">
              {card.label}
            </p>
            <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Add student form */}
      <form onSubmit={addStudent} className="p-5 md:p-6 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Plus size={20} />
          </div>
          <h4 className="text-lg md:text-xl font-display font-bold">{t.addStudent}</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              {t.studentName}
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
            />
          </div>
          {([t.grade1, t.grade2, t.grade3] as string[]).map((label, i) => (
            <div key={label}>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                {label}
              </label>
              <input
                className={inputClass}
                value={grades[i]}
                onChange={(e) => setGrade(i, e.target.value)}
                inputMode="decimal"
                placeholder="0 - 100"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-sm"
        >
          <Plus size={16} />
          {t.add}
        </button>
      </form>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <div className="max-w-sm">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            {t.approvalLimit}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={limit}
            onChange={(e) => setLimit(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
            className={`${inputClass} max-w-[140px]`}
          />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">{t.limitHint}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
            {(['name', 'average'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  sortBy === option
                    ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100'
                }`}
              >
                {option === 'name' ? t.sortName : t.sortAverage}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportCsv}
            disabled={students.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadCloud size={16} />
            {t.export}
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={students.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            {t.clearAll}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {students.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-zinc-900">
            <NotebookPen size={36} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">{t.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-100/70 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {t.studentName}
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.grade1}
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.grade2}
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.grade3}
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.average}
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.status}
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((s) => {
                  const avg = averageOf(s.grades);
                  const approved = avg >= limit;
                  return (
                    <tr key={s.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">{s.grades[0].toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">{s.grades[1].toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">{s.grades[2].toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white">{avg.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
                            approved
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {approved ? t.approved : t.repassed}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeStudent(s.id)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title={t.remove}
                          aria-label={t.remove}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const Github = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [activeSection, setActiveSection] = useState('about');
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const t = translations[lang];

  // Theme application
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const formatDynamicDate = (text: string) => {
    const currentYear = new Date().getFullYear();
    const isPt = lang === 'pt';
    
    const concludingRegex = /(\d{4})\s+(em conclusão|in completion)/i;
    const match = text.match(concludingRegex);
    
    if (match) {
      const year = parseInt(match[1]);
      if (year < currentYear) {
        const replacement = isPt ? `concluído em ${year}` : `completed in ${year}`;
        return text.replace(match[0], replacement);
      } else if (year === currentYear) {
        const replacement = isPt ? `em andamento (conclusão ${year})` : `in progress (completion ${year})`;
        return text.replace(match[0], replacement);
      } else {
        const replacement = isPt ? `em andamento (previsão ${year})` : `in progress (expected ${year})`;
        return text.replace(match[0], replacement);
      }
    }
    
    return text;
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-3 mb-6 group">
      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
        <Icon size={18} />
      </div>
      <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase text-[11px] tracking-[0.2em]">{title}</h4>
    </div>
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleLang = () => setLang(prev => prev === 'pt' ? 'en' : 'pt');
  const toggleDark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDark(prev => !prev);
  };

  const sections = [
    { id: 'about', label: t.nav.about, icon: User },
    { id: 'educator', label: t.nav.educator, icon: GraduationCap },
    { id: 'business', label: t.nav.business, icon: Briefcase },
    { id: 'tech', label: t.nav.tech, icon: Code },
    { id: 'apps', label: t.nav.apps, icon: LayoutGrid },
  ];

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen font-sans selection:bg-emerald-500/30 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-1.5 md:px-4 h-16 md:h-20 flex items-center justify-between gap-1 md:gap-4">
          {/* Centered Navigation Pill */}
          <div className="flex-1 flex justify-center overflow-hidden px-1">
            <div className="relative flex items-center bg-zinc-100/50 dark:bg-zinc-800/30 backdrop-blur-xl p-0.5 md:p-1 rounded-full border border-zinc-200/50 dark:border-zinc-700/30 shadow-inner shadow-black/5 overflow-x-auto no-scrollbar max-w-full">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`relative z-10 px-2 md:px-6 py-1.5 md:py-2 text-[9px] md:text-sm font-bold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap ${
                    activeSection === s.id 
                      ? 'text-emerald-600 dark:text-white' 
                      : 'text-zinc-500 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  {activeSection === s.id && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white dark:bg-emerald-500 rounded-full shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="flex flex-col md:flex-row items-center gap-0 md:gap-2">
                    <s.icon size={14} className={`${activeSection === s.id ? 'opacity-100' : 'opacity-70'} md:w-4 md:h-4`} />
                    <span className="text-[8px] md:text-sm font-bold uppercase md:capitalize tracking-tighter md:tracking-normal">{s.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {/* Language Switcher inspired by the image */}
            <div className="relative flex items-center bg-gradient-to-r from-violet-600 to-indigo-600 p-0.5 md:p-1 rounded-full w-14 md:w-24 h-6 md:h-9 overflow-hidden shadow-inner shadow-black/10">
              <motion.div
                className="absolute top-0.5 bottom-0.5 left-0.5 bg-white rounded-full shadow-md z-0"
                initial={false}
                animate={{
                  x: lang === 'pt' ? 0 : (isMobile ? 26 : 44),
                  width: isMobile ? '26px' : '44px'
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
              <button 
                onClick={() => setLang('pt')}
                className={`relative z-10 flex-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  lang === 'pt' ? 'text-violet-600' : 'text-white/70 hover:text-white'
                }`}
              >
                PT
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`relative z-10 flex-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  lang === 'en' ? 'text-violet-600' : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button 
              type="button"
              onClick={toggleDark}
              className="p-2 md:p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300 active:scale-90 cursor-pointer relative z-[60]"
              title={isDark ? "Modo Claro" : "Modo Escuro"}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} className="md:w-[22px] md:h-[22px] text-amber-400" /> : <Moon size={20} className="md:w-[22px] md:h-[22px]" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 md:pt-28 pb-12 px-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative shrink-0"
            >
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 bg-zinc-100 dark:bg-zinc-800 relative">
                <img 
                  src="https://lh3.googleusercontent.com/d/1Fms18CFX16ZpwC3blK8IAT1A9EPzFFMj" 
                  alt={t.hero.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400";
                  }}
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg z-10">
                <Code size={20} />
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2"
              >
                {t.hero.greeting}
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-3"
              >
                {t.hero.name}
              </motion.h1>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-medium mb-5"
              >
                {t.hero.role}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 text-sm md:text-base whitespace-pre-line"
              >
                {t.hero.description.split('\n').map((line, i) => (
                  <span key={i} className={line.toLowerCase().includes('possum') || line.toLowerCase().includes('confirmat') ? 'font-bold text-zinc-800 dark:text-zinc-200 block mb-1' : 'block'}>
                    {line}
                  </span>
                ))}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center md:justify-start gap-3"
              >
                <a href="mailto:anildo@outlook.com.br" className="flex items-center justify-center w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:scale-110 transition-transform shadow-lg shadow-black/10 dark:shadow-white/5" title="Contato">
                  <Mail size={20} />
                </a>
                <div className="flex flex-wrap gap-2 justify-center">
                  <a href="https://www.linkedin.com/in/anildo?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400" title="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://github.com/anildogomes" target="_blank" rel="noopener noreferrer" className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400" title="GitHub">
                    <Github size={18} />
                  </a>
                  <a href="https://www.instagram.com/anildosgomes?igsh=dzBxY3U0MzkxazQx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400" title="Instagram">
                    <Instagram size={18} />
                  </a>
                  <a href="https://x.com/anildo?s=21" target="_blank" rel="noopener noreferrer" className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-600 dark:text-zinc-400" title="X (Twitter)">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Dynamic Content Sections */}
        <div className="w-full">
          {/* Content Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-sm"
              >
                {activeSection === 'about' && (
                  <div className="space-y-12">
                    {/* About Content */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                          <User size={28} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold">{t.about.title}</h3>
                      </div>
                      <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {t.about.content}
                      </p>
                    </div>

                    {/* Profile Selection Prompt */}
                    <div className="space-y-6 py-8 border-y border-zinc-200/50 dark:border-zinc-800/50">
                      <p className="text-center text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-300 mb-6">
                        {t.about.profilePrompt}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {[
                          { id: 'educator', label: t.nav.educator, icon: GraduationCap },
                          { id: 'business', label: t.nav.business, icon: Briefcase },
                          { id: 'tech', label: t.nav.tech, icon: Code },
                          { id: 'apps', label: t.nav.apps, icon: LayoutGrid },
                        ].map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className="group relative flex items-center justify-center sm:justify-start gap-3 bg-zinc-100/80 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-emerald-500 px-4 md:px-6 py-3 rounded-2xl md:rounded-full border border-zinc-200 dark:border-zinc-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                          >
                            <s.icon size={18} className="text-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-white transition-colors shrink-0" />
                            <span className="font-bold text-[11px] md:text-sm uppercase tracking-wider text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-white truncate">
                              {s.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skills Component (Separate Div) */}
                    <div className="p-5 md:p-8 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[2rem] md:rounded-3xl border border-zinc-200/50 dark:border-zinc-800 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 md:p-3 bg-emerald-500/10 text-emerald-500 rounded-xl md:rounded-2xl">
                          <Award size={24} className="md:w-7 md:h-7" />
                        </div>
                        <h3 className="text-xl md:text-3xl font-display font-bold">{t.skills.title}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {t.skills.items.map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-xs md:text-base font-medium leading-tight">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'educator' && (
                  <div className="space-y-10">
                    {/* Print Header */}
                    <div className="hidden print:block mb-10 border-b-2 border-emerald-500 pb-6">
                      <h1 className="text-4xl font-bold mb-2">{t.hero.name}</h1>
                      <h2 className="text-xl text-emerald-600 font-medium mb-4">{t.hero.role}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                        <span>anildo@outlook.com.br</span>
                        <span>linkedin.com/in/anildo</span>
                        <span>github.com/anildogomes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 no-print">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <GraduationCap size={28} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold">{t.educator.title}</h3>
                    </div>
                    
                    <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed print:text-sm print:mb-8">
                      {t.educator.description}
                    </p>

                    <div className="grid gap-12">
                      {/* Objectives */}
                      <div className="space-y-4">
                        <SectionTitle icon={Target} title={t.educator.objectives.title} />
                        <ul className="space-y-3">
                          {t.educator.objectives.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Formation */}
                      <div className="space-y-4">
                        <SectionTitle icon={BookOpen} title={t.educator.formation.title} />
                        <ul className="space-y-4">
                          {t.educator.formation.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base">{formatDynamicDate(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Experience */}
                      <div className="space-y-6">
                        <SectionTitle icon={History} title={t.educator.experience.title} />
                        <div className="space-y-6">
                          {t.educator.experience.items.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800">
                              <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-emerald-500" />
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                                <h5 className="font-bold text-zinc-900 dark:text-white">{exp.role}</h5>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{formatDynamicDate(exp.period)}</span>
                              </div>
                              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">{exp.company}</p>
                              {exp.description && (
                                <div className="markdown-body">
                                  <Markdown>{exp.description}</Markdown>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certificates */}
                      <div className="space-y-4">
                        <SectionTitle icon={Award} title={t.educator.certificates.title} />
                        <ul className="space-y-4">
                          {t.educator.certificates.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base">{formatDynamicDate(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/20 text-sm"
                    >
                      <Download size={18} />
                      {t.educator.downloadCv}
                    </button>
                  </div>
                )}

                {activeSection === 'business' && (
                  <div className="space-y-10">
                    {/* Print Header */}
                    <div className="hidden print:block mb-10 border-b-2 border-emerald-500 pb-6">
                      <h1 className="text-4xl font-bold mb-2">{t.hero.name}</h1>
                      <h2 className="text-xl text-emerald-600 font-medium mb-4">{t.hero.role}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                        <span>anildo@outlook.com.br</span>
                        <span>linkedin.com/in/anildo</span>
                        <span>github.com/anildogomes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 no-print">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <Briefcase size={28} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold">{t.business.title}</h3>
                    </div>
                    
                    <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed print:text-sm print:mb-8">
                      {t.business.description}
                    </p>

                    <div className="grid gap-12">
                      {/* Objectives */}
                      <div className="space-y-4">
                        <SectionTitle icon={Target} title={t.business.objectives.title} />
                        <ul className="space-y-3">
                          {t.business.objectives.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Formation */}
                      <div className="space-y-4">
                        <SectionTitle icon={BookOpen} title={t.business.formation.title} />
                        <ul className="space-y-4">
                          {t.business.formation.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base">{formatDynamicDate(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Experience */}
                      <div className="space-y-6">
                        <SectionTitle icon={History} title={t.business.experience.title} />
                        <div className="space-y-6">
                          {t.business.experience.items.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800">
                              <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-emerald-500" />
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                                <h5 className="font-bold text-zinc-900 dark:text-white">{exp.role}</h5>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{formatDynamicDate(exp.period)}</span>
                              </div>
                              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">{exp.company}</p>
                              {exp.description && (
                                <div className="markdown-body">
                                  <Markdown>{exp.description}</Markdown>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/20 text-sm"
                    >
                      <Download size={18} />
                      {t.business.downloadCv}
                    </button>
                  </div>
                )}

                {activeSection === 'tech' && (
                  <div className="space-y-10">
                    {/* Print Header */}
                    <div className="hidden print:block mb-10 border-b-2 border-emerald-500 pb-6">
                      <h1 className="text-4xl font-bold mb-2">{t.hero.name}</h1>
                      <h2 className="text-xl text-emerald-600 font-medium mb-4">{t.hero.role}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
                        <span>anildo@outlook.com.br</span>
                        <span>linkedin.com/in/anildo</span>
                        <span>github.com/anildogomes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 no-print">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <Code size={28} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-bold">{t.tech.title}</h3>
                    </div>
                    
                    <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed print:text-sm print:mb-8">
                      {t.tech.description}
                    </p>

                    <div className="grid gap-12">
                      {/* Objectives */}
                      <div className="space-y-4">
                        <SectionTitle icon={Target} title={t.tech.objectives.title} />
                        <ul className="space-y-3">
                          {t.tech.objectives.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Formation */}
                      <div className="space-y-4">
                        <SectionTitle icon={BookOpen} title={t.tech.formation.title} />
                        <ul className="space-y-4">
                          {t.tech.formation.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base">{formatDynamicDate(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Certificates */}
                      <div className="space-y-4">
                        <SectionTitle icon={Award} title={t.tech.certificates.title} />
                        <ul className="space-y-4">
                          {t.tech.certificates.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="text-sm md:text-base">{formatDynamicDate(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Experience */}
                      <div className="space-y-6">
                        <SectionTitle icon={History} title={t.tech.experience.title} />
                        <div className="space-y-6">
                          {t.tech.experience.items.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800">
                              <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-emerald-500" />
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                                <h5 className="font-bold text-zinc-900 dark:text-white">{exp.role}</h5>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{formatDynamicDate(exp.period)}</span>
                              </div>
                              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">{exp.company}</p>
                              {exp.description && (
                                <div className="markdown-body">
                                  <Markdown>{exp.description}</Markdown>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div className="space-y-4 no-print">
                        <SectionTitle icon={Code} title={t.tech.projects.title} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {t.tech.projects.items.map((project: any, i: number) => (
                            <div key={i} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 group hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h5 className="text-lg font-bold mb-1">{project.name}</h5>
                                  <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">{project.description}</p>
                                </div>
                                {project.url !== '#' && (
                                  <a 
                                    href={project.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors"
                                  >
                                    <ExternalLink size={18} />
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag: string, j: number) => (
                                  <span key={j} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{tag}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-6">
                        <SectionTitle icon={Palette} title={t.tech.skills.title} />
                        <div className="flex flex-wrap gap-6">
                          {t.tech.skills.items.map((skill: string, i: number) => {
                            const icons: Record<string, any> = {
                              'HTML': <Code size={24} />,
                              'CSS': <Palette size={24} />,
                              'Javascript': <Code size={24} />,
                              'Tailwind': <Palette size={24} />,
                              'React': <Atom size={24} />,
                              'Node JS': <Server size={24} />,
                              'Java': <Coffee size={24} />,
                              'Python': <Terminal size={24} />,
                              'MongoDB': <Database size={24} />,
                              'PostgreSQL': <Database size={24} />
                            };
                            return (
                              <div key={i} className="flex flex-col items-center gap-2 group">
                                <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 group-hover:border-emerald-500/50 group-hover:text-emerald-500 transition-all duration-300 shadow-sm">
                                  {icons[skill] || <Code size={24} />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{skill}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/20 text-sm"
                    >
                      <Download size={18} />
                      {t.tech.downloadCv}
                    </button>
                  </div>
                )}

                {activeSection === 'apps' && (
                  <div className="space-y-10">
                    <motion.div
                      key={activeApp || 'list'}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-10"
                    >
                      {activeApp === 'inotas' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveApp(null)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <ArrowLeft size={16} />
                            {t.apps.backToApps}
                          </button>

                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
                              <NotebookPen size={28} />
                            </div>
                            <div>
                              <h3 className="text-2xl md:text-3xl font-display font-bold">{t.inotas.title}</h3>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.inotas.subtitle}</p>
                            </div>
                          </div>

                          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {t.apps.items.find((app: any) => app.id === activeApp)?.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {(t.apps.items.find((app: any) => app.id === activeApp)?.tags || []).map((tag: string, j: number) => (
                              <span key={j} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <INotesApp t={t.inotas} />
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                              <LayoutGrid size={28} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-display font-bold">{t.apps.title}</h3>
                          </div>

                          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {t.apps.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {t.apps.items.map((app: any) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => app.status === 'ready' && setActiveApp(app.id)}
                                className={`p-6 text-left bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 group transition-all duration-300 shadow-sm hover:shadow-md ${
                                  app.status === 'ready'
                                    ? 'hover:border-emerald-500/50 hover:-translate-y-1'
                                    : 'opacity-60 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-4 gap-3">
                                  <div>
                                    <h5 className="text-lg font-bold mb-1">{app.name}</h5>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">{app.tagline}</p>
                                  </div>
                                  <span
                                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                      app.status === 'ready'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    {app.status === 'ready' ? t.apps.status.ready : t.apps.status.soon}
                                  </span>
                                </div>

                                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">{app.description}</p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                  {app.tags.map((tag: string, j: number) => (
                                    <span key={j} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                <div className="space-y-2">
                                  {app.features.items.map((feature: string, j: number) => (
                                    <div key={j} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="leading-tight">{feature}</span>
                                    </div>
                                  ))}
                                </div>

                                {app.status === 'ready' && (
                                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover:gap-3 transition-all">
                                    {t.apps.openApp}
                                    <ChevronRight size={16} />
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-8">
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} {t.hero.name}. {t.footer.rights}
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <a href="https://www.linkedin.com/in/anildo?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="LinkedIn"><Linkedin size={20} /></a>
            <a href="https://github.com/anildogomes" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="GitHub"><Github size={20} /></a>
            <a href="https://www.instagram.com/anildosgomes?igsh=dzBxY3U0MzkxazQx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="Instagram"><Instagram size={20} /></a>
            <a href="https://x.com/anildo?s=21" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="X (Twitter)">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
            <a href="mailto:anildo@outlook.com.br" className="text-zinc-400 hover:text-emerald-500 transition-colors" title="Mail"><Mail size={20} /></a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
