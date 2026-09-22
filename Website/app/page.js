"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  Palette,
  Smartphone,
  Globe,
  Search,
  Bell,
  Play,
  ArrowRight,
  School,
  ShieldCheck,
  Cloud,
  Sparkles,
  ClipboardList,
  BookOpen,
  Wallet,
  Users,
  Bus,
  Library,
  Building2,
  MessageSquare,
  BarChart3,
  Star,
  Check,
} from "lucide-react";

/**
 * EDMIRO — School & College Management System
 * Landing page (Next.js App Router — app/page.js)
 *
 * NOTES BEFORE YOU RUN THIS:
 * 1. Tailwind CSS must be configured in this project (create-next-app --tailwind).
 * 2. Install icons:  npm install lucide-react
 * 3. Replace the placeholder image URLs below (search for "REPLACE_WITH_")
 *    with your real dashboard/mobile screenshots. Easiest way:
 *      - Drop your images into the /public folder, e.g. /public/dashboard.png
 *        and /public/mobile-app.png
 *      - Then set:
 *          const dashboardImg = "/dashboard.png";
 *          const mobileImg = "/mobile-app.png";
 *    Until you do that, placehold.co placeholders are used so the page
 *    still renders correctly.
 */

const dashboardImg = "https://placehold.co/900x640/0b1f3a/ffffff?text=EDMIRO+Dashboard+Screenshot";
const mobileImg = "https://placehold.co/430x900/0b1f3a/ffffff?text=EDMIRO+Mobile+App";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions", hasDropdown: true },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];



const highlights = [
  {
    icon: School,
    title: "Complete Education Ecosystem",
    desc: "From admissions to alumni, everything you need in one platform.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    desc: "Your data is protected with enterprise-grade security and privacy standards.",
  },
  {
    icon: Cloud,
    title: "Cloud Powered",
    desc: "Access anytime, anywhere, on any device — web, iOS or Android.",
  },
  {
    icon: Sparkles,
    title: "AI Ready",
    desc: "Smarter insights, better decisions, with the power of AI.",
  },
];

export const modules = [
  {
    icon: GraduationCap,
    title: "Student Management",
    desc: "Admissions enquiry, enrollment, ID cards, and student profiles.",
    bg: "bg-blue-100",
    fg: "text-blue-600",
  },
  {
    icon: Users,
    title: "Staff & HR",
    desc: "Teacher records, staff directory, biometric logs, and leave workflows.",
    bg: "bg-amber-100",
    fg: "text-amber-600",
  },
  {
    icon: Wallet,
    title: "Finance & Accounts",
    desc: "Automated fee collection, salary disbursements, and income/expenses.",
    bg: "bg-emerald-100",
    fg: "text-emerald-600",
  },
  {
    icon: CalendarCheck,
    title: "Attendance & Leaves",
    desc: "Real-time daily attendance tracking for students, teachers, and staff.",
    bg: "bg-teal-100",
    fg: "text-teal-600",
  },
  {
    icon: Sparkles,
    title: "AI Academics & Timetable",
    desc: "AI timetable generator, syllabus progress, and daily homework tracking.",
    bg: "bg-indigo-100",
    fg: "text-indigo-600",
  },
  {
    icon: FileCheck2,
    title: "Exams & Paper Maker",
    desc: "Class tests, terminal exams, auto question papers, and admit cards.",
    bg: "bg-violet-100",
    fg: "text-violet-600",
  },
  {
    icon: Palette,
    title: "Creative & Branding Studio",
    desc: "Festival post maker, institutional identity, and custom school website.",
    bg: "bg-pink-100",
    fg: "text-pink-600",
  },
  {
    icon: Bell,
    title: "Push Notifications & Alerts",
    desc: "Instant parent updates, event broadcasts, SMS, and feedback surveys.",
    bg: "bg-orange-100",
    fg: "text-orange-600",
  },
  {
    icon: Bus,
    title: "Transport Management",
    desc: "Live route tracking, driver assignments, and bus fee allocations.",
    bg: "bg-sky-100",
    fg: "text-sky-600",
  },
  {
    icon: Building2,
    title: "Library & Hostel",
    desc: "Book cataloging, room allocations, meal plans, and inventory tracking.",
    bg: "bg-rose-100",
    fg: "text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Reports & Admin Panel",
    desc: "Executive command dashboard with audit logs and financial analytics.",
    bg: "bg-purple-100",
    fg: "text-purple-600",
  },
  {
    icon: Smartphone,
    title: "Mobile App Ecosystem",
    desc: "Dedicated cross-platform apps for Admin, Teachers, and Students.",
    bg: "bg-cyan-100",
    fg: "text-cyan-600",
  },
];

const pricingPlans = [
  {
    name: "Campus Starter",
    price: "₹13,999",
    period: "/Year",
    desc: "For small schools getting started with digital management.",
    features: ["Up to 300 students", "Student Management", "Staff Management" , " Website (Additional Charges for Domain)" , "Income & Expense" , "Fee collection", "Push Notification" , "Salary Management", "Exam Management"],
    highlighted: false,
  },
  {
    name: "Campus Growth",
    price: "₹19,999",
    period: "/month",
    desc: "For growing institutions that need the full toolkit.",
    features: [
      "Up to 2,000 students",
      "All Campus Starter features",
      "Homework Management",
      "Admission Enquiry",
      "Leave Management",
      "AI Paper Maker",
      "Student Reports",
      "Feedbacks",
      "Separate Student App",
    ],
    highlighted: true,
  },
  {
    name: "Campus Enterprise",
    price: "₹26,999",
    period: "/Year",
    desc: "With all features and AI Ready Digital School.",
    features: [
      "Unlimited students",
      "All Campus Growth features",
      "Transport Management",
      "Teacher Reports",
      "Behavioural Reports" ,
      "Library Management",
      "Hostel Management",
      "Class Test",
      "Post Maker",
      "Syllabus Manager",
      "AI Time Table",
      "Separate Teacher App",
      "Separate Admin App",

    ],
    highlighted: false,
  },
];

const testimonials = [
  {
    quote:
      "EDMIRO brought every department onto one screen. Admissions that used to take days now take minutes.",
    name: "Kedar Mal Jat",
    role: "Principal, MVG Public School",
  },
  {
    quote:
      "Fee collection and reporting used to be our biggest headache. It's now the easiest part of our week.",
    name: "Pawan Kumar Sharma",
    role: "Director, Parashar Public School",
  },
  {
    quote:
      "Parents love the mobile app, and our staff finally have one login for everything they need.",
    name: "Ghanshyam Sharma",
    role: "Director, Aakriti Public School",
  },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
              <School className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <span className="block text-xl font-bold leading-none tracking-tight text-slate-900">
                EDMIRO
              </span>
              <span className="block text-[11px] leading-none text-slate-400">
                Smarter Schools. Better Future.
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setSolutionsOpen(true)}
                  onMouseLeave={() => setSolutionsOpen(false)}
                >
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600">
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {solutionsOpen && (
                    <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                      <div className="rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                        {["For Schools", "For Colleges", "For Universities", "For Coaching Institutes"].map(
                          (item) => (
                            <a
                              key={item}
                              href="#solutions"
                              className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            >
                              {item}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              <Globe className="h-4 w-4" />
              EN
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <a
              href="#login"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Login
            </a>
            <a
              href="#get-started"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex gap-3">
              <a
                href="#login"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
              >
                Login
              </a>
              <a
                href="#get-started"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- HERO ---------------- */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          {/* Left column */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              All-in-One School &amp; College Management System
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Smarter Schools.
              <br />
              <span className="text-blue-600">Better Future.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              EDMIRO is a powerful, easy-to-use platform that brings together
              admissions, academics, finance, HR, communication and more —
              all in one place. Built for schools, colleges and universities
              worldwide.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Free Demo
                <ArrowRight className="h-4 w-4" />
              </a>
              
            </div>

          </div>

          {/* Right column — dashboard + mobile mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200">
              <Image
  src={dashboardImg}
  alt="EDMIRO dashboard screenshot showing student stats and attendance overview"
  width={900}
  height={640}
  unoptimized
/>
            </div>

            <div className="absolute -bottom-8 -right-4 hidden w-40 overflow-hidden rounded-[1.75rem] border-4 border-slate-900 bg-slate-900 shadow-2xl sm:block sm:w-48 lg:-right-10 lg:w-52">
              <Image
                src={mobileImg}
                alt="EDMIRO mobile app screenshot showing student attendance, homework and fees"
                width={430}
                height={900}
                unoptimized
              />
            </div>

            {/* decorative blobs */}
            <div className="pointer-events-none absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 right-10 -z-10 h-48 w-48 rounded-full bg-sky-100 blur-3xl" />
          </div>
        </div>
      </section>

      {/* ---------------- HIGHLIGHTS STRIP ---------------- */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {highlights.map((h) => (
            <div key={h.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <h.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{h.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- MODULES / FEATURES ---------------- */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Powerful Modules
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need, All in One Place
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              EDMIRO brings all essential school and college management tools
              together — simple, powerful and designed for your success.
            </p>
          </div>
          <a
            href="#all-features"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Explore All Features
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <div
              key={m.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${m.bg} ${m.fg}`}>
                <m.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section id="pricing" className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              Simple Pricing
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Plans for every institution
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              Start free, upgrade any time. No hidden fees, cancel whenever
              you like. Also Prices are Negotiable.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-blue-600 bg-slate-900 text-white shadow-2xl shadow-blue-200 lg:-translate-y-3"
                    : "border-slate-100 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-lg font-semibold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.desc}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className={plan.highlighted ? "text-slate-300" : "text-slate-500"}>
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlighted ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <span className={plan.highlighted ? "text-slate-200" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#get-started"
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "border border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
            Loved by Educators
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by schools worldwide
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

     

      {/* ---------------- FOOTER ---------------- */}
      <footer id="contact" className="border-t border-slate-100 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <School className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">EDMIRO</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                All-in-one school and college management system trusted by
                educators worldwide, built to make administration effortless.
              </p>
              <div className="mt-6 flex gap-3">
                {["Twitter", "LinkedIn", "Facebook", "Instagram"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    aria-label={s}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {s.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Product</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {["Features", "Solutions", "Pricing", "Security", "Integrations"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-400 hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {["About Us", "Careers", "Blog", "Press", "Contact"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-400 hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Support</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {["Help Center", "Documentation", "API Reference", "Status", "Community"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-400 hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} EDMIRO. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}