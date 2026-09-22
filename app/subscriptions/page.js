'use client';

import React from 'react';
import { 
  HiOutlineSparkles, 
  HiOutlineCheckCircle, 
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter Campus',
    tagline: 'Essential academic & core school operations',
    price: '25,000',
    popular: false,
    icon: HiOutlineAcademicCap,
    accent: 'from-sky-500 to-teal-500',
    badgeBg: 'bg-slate-100 text-slate-700',
    features: [
      'Students Hub (Profiles & Directory)',
      'Faculty Hub (Staff Directory)',
      'Attendance (Daily Records)',
      'Syllabus Hub (Curriculum Plans)',
      'Schedule Hub (Timetable Manager)',
      'Id Hub (Standard ID Card Generator)',
      'Notice (Basic Push Notifications)'
    ]
  },
  {
    id: 'growth',
    name: 'Growth Campus',
    tagline: 'Complete finance, operations & examination suite',
    price: '50,000',
    popular: true,
    icon: HiOutlineSparkles,
    accent: 'from-indigo-600 via-purple-600 to-pink-500',
    badgeBg: 'bg-indigo-600 text-white shadow-sm',
    features: [
      'Everything in Starter Campus',
      'Accounts Hub (Fee Structures & Receipts)',
      'Income & Expense (Ledger & Reports)',
      'Reports Hub (Marksheets & Term Analytics)',
      'Class Tests (Paper Maker & Exam Hub)',
      'Library (Book Catalog & Issuance)',
      'Behavior (Disciplinary Records)',
      'Enquiries & Admissions Management'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise SaaS',
    tagline: 'Ultimate institutional suite with AI & full logistics',
    price: '90,000',
    popular: false,
    icon: HiOutlineOfficeBuilding,
    accent: 'from-purple-600 to-amber-500',
    badgeBg: 'bg-slate-100 text-slate-700',
    features: [
      'Everything in Growth Campus',
      'Vehicle (Transport Route & Bus Tracking)',
      'Hostel (Room Allocation & Records)',
      'Post Maker (AI Promotional Generator)',
      'Custom Domain & School App Package Sync',
      'Automated Multi-Branch Switcher',
      'Priority 24/7 Dedicated Server Support'
    ]
  }
];

export default function SubscriptionsViewPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 p-6 lg:p-12 font-sans relative overflow-hidden flex flex-col justify-center">
      
      {/* Subtle Pastel Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black uppercase tracking-widest shadow-xs">
            <HiOutlineShieldCheck size={16} /> Tier Breakdown
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Subscription Plans & Features
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Explore features, modules, and annual pricing included across institutional tiers.
          </p>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`backdrop-blur-xl bg-white/80 border rounded-[36px] p-8 flex flex-col justify-between shadow-xl shadow-slate-200/60 transition-all duration-300 relative overflow-hidden ${
                  plan.popular 
                    ? 'border-indigo-300 ring-2 ring-indigo-500/20 shadow-indigo-100/70 -translate-y-2' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Top Gradient Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${plan.accent}`} />

                <div>
                  {/* Badge & Icon */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-800 shadow-inner">
                      <Icon size={24} />
                    </div>
                    {plan.popular && (
                      <span className="px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                        Most Popular
                      </span>
                    )}
                  </div>

                  {/* Plan Name & Tagline */}
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 min-h-[32px]">{plan.tagline}</p>

                  {/* Pricing Display */}
                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">₹</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">/ Year</span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Features</p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-700">
                          <HiOutlineCheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Billing Cycle</span>
                  <span className="text-indigo-600 font-extrabold">Annual (B2B SaaS)</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}