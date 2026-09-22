'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from './firebase/config';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Pure Firebase Authentication Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Store basic user info if needed
      localStorage.setItem('currentUser', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }));
      document.cookie = "user_session=true; path=/; SameSite=Strict";

      // Direct navigation to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      let errorMessage = "Login Failed: Unable to authenticate.";
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Login Failed: Invalid Email or Password.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Login Failed: Invalid Email format.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Access blocked temporarily due to too many failed attempts.";
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D9DCDD] flex items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* CARD CONTAINER */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl w-full max-w-[960px] p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center border border-white/60">
        
        {/* LEFT COLUMN: 3D ARTWORK */}
        <div className="relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#E2E6E8] flex items-center justify-center min-h-[320px] sm:min-h-[440px] h-full">
          <svg className="w-full h-full absolute inset-0 object-cover" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="500" height="500" fill="#E2E6E8" />
            
            {/* Background floating spheres */}
            <circle cx="100" cy="180" r="50" fill="#D3D8DB" />
            <circle cx="360" cy="120" r="45" fill="white" fillOpacity="0.6" />
            <circle cx="390" cy="220" r="80" fill="#6B78F6" />
            <circle cx="80" cy="400" r="60" fill="#7582F7" />
            <path d="M 120 460 C 120 380, 200 370, 200 460 Z" fill="#F1C232" />
            <path d="M 360 480 L 440 380 L 460 460 Z" fill="#3D4EEA" />

            {/* Central Flower Shape */}
            <g transform="translate(250, 240)">
              {Array.from({ length: 16 }).map((_, i) => (
                <ellipse
                  key={i}
                  cx="0"
                  cy="-75"
                  rx="22"
                  ry="50"
                  fill="#7B68EE"
                  transform={`rotate(${i * (360 / 16)})`}
                />
              ))}
              <circle cx="0" cy="0" r="45" fill="#7B68EE" />
              {/* Eyes */}
              <ellipse cx="-16" cy="-8" rx="8" ry="12" fill="#111111" />
              <ellipse cx="16" cy="-8" rx="8" ry="12" fill="#111111" />
              {/* Mouth */}
              <polygon points="0,6 -6,14 6,14" fill="#111111" />
            </g>
          </svg>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM */}
        <div className="px-2 sm:px-6 py-4 flex flex-col justify-center text-left">
          
          {/* LOGO BRAND */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-5 h-5 bg-black rounded-md flex items-center justify-center">
              <div className="w-2.5 h-1.5 border-t-2 border-b-2 border-white"></div>
            </div>
            <span className="text-xs font-bold tracking-tight text-black">Kreative</span>
          </div>

          {/* WELCOME HEADING */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-[11px] text-[#888888] font-medium mt-1">
              Enter Your Details Below
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            
            {/* EMAIL */}
            <div className="relative pt-2">
              <label className="text-[10px] text-[#888888] font-medium block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello.alex@gmail.com"
                className="w-full bg-transparent border-b border-[#CCCCCC] focus:border-black text-xs font-semibold text-[#111111] py-1.5 outline-none transition-colors"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative pt-1">
              <label className="text-[10px] text-[#888888] font-medium block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-transparent border-b border-[#CCCCCC] focus:border-black text-xs font-semibold text-[#111111] py-1.5 pr-8 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-[#888888] hover:text-black transition cursor-pointer"
                >
                  {showPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div className="flex items-center justify-between text-[11px] text-[#888888]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="hover:underline text-[#AAAAAA]">
                Forgot password?
              </a>
            </div>

            {/* LOG IN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#18191C] hover:bg-black text-white text-xs font-semibold py-3.5 rounded-full transition-all shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            {/* GOOGLE LOGIN BUTTON */}
            <button
              type="button"
              onClick={() => alert("Google Login clicked.")}
              className="w-full bg-[#F3F3F3] hover:bg-[#EAEAEA] text-black text-xs font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FcGoogle size={18} />
              <span>Log in with Google</span>
            </button>
          </form>

          {/* SIGN UP FOOTER */}
          <div className="text-center mt-8 text-[11px] text-[#888888]">
            Don't have an account?{' '}
            <a href="#" className="font-bold text-black hover:underline">
              Sign Up
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}