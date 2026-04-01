import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, ArrowRight, Users, Zap, LayoutGrid,
  BarChart3, CheckCircle2, Clock, Target, Star,
  Check, ChevronRight, Shield,
} from 'lucide-react';

// ─── Animated word cycling ────────────────────────────────────────────────────
const WORDS = ['Teams', 'Projects', 'Deadlines', 'Workflows', 'Success'];

// ─── Counter that counts up when it enters the viewport ───────────────────────
const AnimatedStat = ({
  value, suffix, label,
}: { value: number; suffix: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const start = performance.now();
        const duration = 2000;
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * value));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-extrabold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-sm text-blue-200">{label}</div>
    </div>
  );
};

// ─── Mini floating Kanban board shown in hero ─────────────────────────────────
const KANBAN_COLS = [
  {
    label: 'To Do', dot: 'bg-gray-400', bg: 'bg-gray-50',
    cards: [
      { title: 'Design System', tag: 'Design', bar: 'bg-blue-500', pct: 20 },
      { title: 'User Research', tag: 'UX', bar: 'bg-purple-500', pct: 0 },
    ],
  },
  {
    label: 'In Progress', dot: 'bg-blue-400', bg: 'bg-blue-50',
    cards: [
      { title: 'Implement Auth', tag: 'Backend', bar: 'bg-orange-400', pct: 65 },
    ],
  },
  {
    label: 'Done', dot: 'bg-green-400', bg: 'bg-green-50',
    cards: [
      { title: 'Setup CI/CD', tag: 'DevOps', bar: 'bg-green-500', pct: 100 },
      { title: 'Wireframes', tag: 'Design', bar: 'bg-pink-500', pct: 100 },
    ],
  },
];

const HeroKanban = () => (
  <div className="flex gap-3 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-2xl backdrop-blur-md">
    {KANBAN_COLS.map((col, ci) => (
      <div key={col.label} className={`w-44 rounded-xl p-3 ${col.bg}`}>
        <div className="mb-3 flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${col.dot}`} />
          <span className="text-[11px] font-semibold text-gray-600">{col.label}</span>
          <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[10px] text-gray-400">
            {col.cards.length}
          </span>
        </div>

        <div className="space-y-2">
          {col.cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: [0, -5, 0] }}
              transition={{
                opacity: { delay: ci * 0.25 + idx * 0.15, duration: 0.4 },
                y: {
                  delay: ci * 0.25 + idx * 0.15 + 0.4,
                  duration: 3 + idx * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm"
            >
              <div className={`mb-2 h-1 w-full rounded-full ${card.bar}`} />
              <p className="mb-1.5 text-[11px] font-semibold text-gray-800">{card.title}</p>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">
                {card.tag}
              </span>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className={`h-full ${card.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${card.pct}%` }}
                  transition={{ delay: ci * 0.25 + idx * 0.15 + 0.6, duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── Feature card ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: LayoutGrid,
    color: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/30',
    title: 'Visual Kanban Board',
    desc: 'Drag-and-drop tasks across columns. See the whole project at a glance and keep everyone aligned.',
    bullets: ['Drag & drop', 'Custom columns', 'Color labels'],
  },
  {
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    glow: 'shadow-purple-500/30',
    title: 'Team Collaboration',
    desc: 'Assign tasks, mention teammates, and comment in real time. Everyone stays on the same page.',
    bullets: ['Assign members', 'Activity feed', 'Role control'],
  },
  {
    icon: BarChart3,
    color: 'from-emerald-500 to-emerald-600',
    glow: 'shadow-emerald-500/30',
    title: 'Smart Analytics',
    desc: 'Track velocity, spot bottlenecks, and celebrate wins with beautiful progress charts.',
    bullets: ['Progress tracking', 'Priority insights', 'Deadline alerts'],
  },
];

// ─── How-it-works steps ───────────────────────────────────────────────────────
const steps = [
  {
    num: '01',
    icon: Briefcase,
    title: 'Create a Project',
    desc: 'Set up your workspace in seconds. Name your project, invite your team, and you\'re ready.',
  },
  {
    num: '02',
    icon: Target,
    title: 'Add & Assign Tasks',
    desc: 'Break work into tasks, set priorities and due dates, and assign them to the right people.',
  },
  {
    num: '03',
    icon: CheckCircle2,
    title: 'Track & Deliver',
    desc: 'Move tasks across the board as they progress and ship with confidence every sprint.',
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Sarah K.', role: 'Product Manager', text: 'TaskFlow cut our stand-up time in half. The kanban view is chef\'s kiss.', stars: 5 },
  { name: 'James T.', role: 'Engineering Lead', text: 'Finally a tool the whole team actually uses. Clean, fast, and no bloat.', stars: 5 },
  { name: 'Mia R.', role: 'Startup Founder', text: 'We shipped our MVP 2 weeks early. I credit TaskFlow entirely.', stars: 5 },
];

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWordIdx(i => (i + 1) % WORDS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const handleCTA = () => navigate(isAuth ? '/app' : '/login');

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-gray-950/80 px-8 py-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/40">
            <Briefcase className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold text-white">TaskFlow</span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {['Features', 'How it works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm text-gray-400 transition-colors hover:text-white">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="text-sm text-gray-400 transition-colors hover:text-white cursor-pointer">
            Sign in
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCTA}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-500 cursor-pointer"
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gray-950 pt-20">

        {/* Background orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="pointer-events-none absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-purple-600/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-8 py-20 lg:flex-row lg:items-center">

          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">Built for modern teams</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-2 text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-6xl xl:text-7xl"
            >
              Manage your
            </motion.h1>

            {/* Animated cycling word */}
            <div className="mb-4 h-[1.2em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wordIdx}
                  initial={{ y: 40, opacity: 0, rotateX: -30 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -40, opacity: 0, rotateX: 30 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent lg:text-6xl xl:text-7xl"
                >
                  {WORDS[wordIdx]}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white lg:text-6xl xl:text-7xl"
            >
              smarter.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-10 max-w-lg text-lg leading-relaxed text-gray-400 lg:mx-0"
            >
              TaskFlow brings your team's work together in one visual, intuitive workspace.
              Plan sprints, track progress, and ship on time — every time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCTA}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/40 transition-colors hover:bg-blue-500 cursor-pointer"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#how-it-works"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 cursor-pointer"
              >
                See how it works <ChevronRight className="h-4 w-4" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-wrap justify-center gap-6 lg:justify-start"
            >
              {['No credit card required', 'Free forever plan', 'Setup in 2 minutes'].map(txt => (
                <div key={txt} className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Check className="h-3.5 w-3.5 text-blue-500" />
                  {txt}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: floating kanban mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <HeroKanban />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 pt-2">
            <div className="h-2 w-0.5 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-8 md:grid-cols-4">
          <AnimatedStat value={12000} suffix="+" label="Teams worldwide" />
          <AnimatedStat value={580000} suffix="+" label="Tasks completed" />
          <AnimatedStat value={99} suffix="%" label="Uptime SLA" />
          <AnimatedStat value={48} suffix="+" label="Integrations" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Everything your team needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              From solo freelancers to enterprise squads — TaskFlow scales with you.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} shadow-lg ${f.glow}`}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="mb-5 text-gray-500 leading-relaxed">{f.desc}</p>
                <ul className="space-y-2">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-purple-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-600">
              How it works
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Up and running in minutes
            </h2>
          </motion.div>

          <div className="relative grid gap-12 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30"
                >
                  <step.icon className="h-9 w-9 text-white" />
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-blue-600 shadow-md">
                    {i + 1}
                  </div>
                </motion.div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
              Loved by teams
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900">
              Don't take our word for it
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array(t.stars).fill(0).map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-4 leading-relaxed text-gray-700">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden bg-gray-950 py-28 text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-2xl shadow-blue-600/40">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
              Ready to take control?
            </h2>
            <p className="mb-10 text-lg text-gray-400">
              Join thousands of teams already shipping faster with TaskFlow.
            </p>

            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(59,130,246,0.6)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/40 transition-colors hover:bg-blue-500 cursor-pointer"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </motion.button>

            <p className="mt-5 text-sm text-gray-500">No credit card · Free plan forever · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 border-t border-white/5 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-400">TaskFlow</span>
          <span className="text-gray-600">·</span>
          <span className="text-sm text-gray-600">© {new Date().getFullYear()} All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
