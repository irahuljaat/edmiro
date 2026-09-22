'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineExclamationCircle, HiOutlinePhone, HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi';

export default function ExpiredPlanPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-6 sm:p-10 font-sans text-slate-800">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <HiOutlineArrowLeft className="text-base" /> Back to Login
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Campus System Portal
        </span>
      </div>

      {/* Main Notice Card */}
      <div className="flex items-center justify-center my-auto py-10">
        <div className="w-full max-w-[500px] bg-white p-8 sm:p-12 rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100 text-center space-y-6">
          
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner">
            <HiOutlineExclamationCircle />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">
              Subscription Inactive
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Plan Expired
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              Your institutional portal access is currently disabled or your subscription plan has reached its expiration date.
            </p>
          </div>

          {/* Contact Support Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Contact Support for Renewal
            </span>
            
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <HiOutlinePhone className="text-base text-amber-500" />
              <span>+91 98765 43210 / Support Desk</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <HiOutlineMail className="text-base text-amber-500" />
              <span>support@edmiro.com</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white transition shadow-md cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-semibold text-slate-400">
        Campus Management System • All Rights Reserved
      </footer>

    </div>
  );
}