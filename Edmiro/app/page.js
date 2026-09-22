'use client';

import React, { useState } from 'react';
import { db } from './firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useColors } from './components/ColorComponent';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineGlobe, HiOutlineOfficeBuilding, HiX } from 'react-icons/hi';

export default function LoginPage() {
  const colors = useColors();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal & Branch State
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // School Visual State
  const [schoolName, setSchoolName] = useState('Edmiro Administration');
  const [logoUrl, setLogoUrl] = useState('');

  const router = useRouter();

  // Load school metadata from Data -> [schoolId] -> config -> schoolDetails
  const loadSchoolDetails = async (schoolId) => {
    if (!schoolId) return null;
    try {
      const detailsRef = doc(db, 'Data', schoolId, 'config', 'schoolDetails');
      const detailsSnap = await getDoc(detailsRef);

      if (detailsSnap.exists()) {
        const data = detailsSnap.data();
        if (data.schoolName) setSchoolName(data.schoolName);
        if (data.schoolLogo) setLogoUrl(data.schoolLogo);
        return data;
      }
    } catch (err) {
      console.error('Error fetching school details:', err);
    }
    return null;
  };

  // Fetch all branch schoolIds sharing the same groupId
  const fetchGroupBranches = async (userGroupId) => {
    const branches = [];
    try {
      const authRef = doc(db, 'schools', 'authentication');
      const authSnap = await getDoc(authRef);

      if (authSnap.exists()) {
        const authData = authSnap.data();
        for (const accountKey in authData) {
          const account = authData[accountKey];
          if (account.groupId === userGroupId && account.schoolId) {
            branches.push({
              label: accountKey,
              value: account.schoolId
            });
          }
        }
      }

      const dataColRef = collection(db, 'Data');
      const dataDocsSnap = await getDocs(dataColRef);
      dataDocsSnap.forEach((docSnap) => {
        const docId = docSnap.id;
        if (!branches.some((b) => b.value === docId)) {
          branches.push({
            label: docId.replace(/_/g, ' '),
            value: docId
          });
        }
      });

      setAvailableBranches(branches);
      if (branches.length > 0) {
        setSelectedBranch(branches[0].value);
        loadSchoolDetails(branches[0].value);
      }
    } catch (err) {
      console.error('Error loading group branches:', err);
    }
  };

  // Step 1: Validate ID & Password, check isEnable flag
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authRef = doc(db, 'schools', 'authentication');
      const authSnap = await getDoc(authRef);

      if (!authSnap.exists()) {
        alert("Authentication configuration not found.");
        setLoading(false);
        return;
      }

      const authData = authSnap.data();
      let matchedUser = null;

      for (const key in authData) {
        const userAccount = authData[key];
        if (userAccount.id === loginId && userAccount.password === password) {
          matchedUser = userAccount;
          break;
        }
      }

      if (!matchedUser) {
        alert("Login Failed: Invalid Login ID or Password.");
        setLoading(false);
        return;
      }

      // Check if account / plan is enabled
      if (matchedUser.isEnable === false) {
        setLoading(false);
        router.push('/expired-plan');
        return;
      }

      setAuthenticatedUser(matchedUser);

      // If user is super admin, trigger branch selection modal
      if (matchedUser.role === 'super') {
        await fetchGroupBranches(matchedUser.groupId || 'EDMIRO_MAIN_GROUP');
        setShowBranchModal(true);
        setLoading(false);
      } else {
        // Direct proceed for branch users
        const targetSchoolId = matchedUser.schoolId || matchedUser.groupId;
        await completeLoginSession(matchedUser, targetSchoolId);
      }
    } catch (err) {
      console.error(err);
      alert("Login Error: Unable to authenticate.");
      setLoading(false);
    }
  };

  // Step 2: Complete login and redirect after branch confirmation
  const completeLoginSession = async (user, targetSchoolId) => {
    if (targetSchoolId) {
      const schoolDetails = await loadSchoolDetails(targetSchoolId);
      localStorage.setItem('currentSchoolId', targetSchoolId);
      if (schoolDetails) {
        localStorage.setItem('schoolDetails', JSON.stringify(schoolDetails));
      }
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    document.cookie = "user_session=true; path=/; SameSite=Strict";

    router.push('/dashboard');
    router.refresh();
  };

  const handleBranchSelectConfirm = async () => {
    setLoading(true);
    await completeLoginSession(authenticatedUser, selectedBranch);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-6 sm:p-10 font-sans relative overflow-hidden text-slate-800">
      
      {/* TOP HEADER BRANDING */}
      <div className="absolute top-12 left-12 hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400">
        <HiOutlineGlobe className="text-base" /> Admin Portal
      </div>

      <div className="absolute top-8 right-10 hidden lg:flex flex-col items-center gap-1">
        {logoUrl ? (
          <img src={logoUrl} alt="School Logo" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm text-lg"
            style={{ backgroundColor: colors.primary || '#FFD166' }}
          >
            E
          </div>
        )}
        <span className="text-xs font-bold text-slate-700 tracking-tight">{schoolName}</span>
      </div>

      {/* CENTRAL LOGIN CARD */}
      <div className="flex-1 flex items-center justify-center my-auto py-10 relative z-10">
        <div className="w-full max-w-[460px] bg-white p-8 sm:p-12 rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] border border-slate-100/80 text-center space-y-6">
          
          <div className="space-y-2 flex flex-col items-center">
            {logoUrl ? (
              <img src={logoUrl} alt="School Logo" className="w-16 h-16 rounded-2xl object-cover shadow-md border border-slate-100" />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-md text-2xl"
                style={{ backgroundColor: colors.primary || '#FFD166' }}
              >
                E
              </div>
            )}
            
            <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase pt-1">
              {schoolName}
            </h2>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mt-1">
                Admin Login
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-1">
                Enter your User ID and Passcode to sign in
              </p>
            </div>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Login ID</label>
              <div className="relative flex items-center">
                <HiOutlineUser className="absolute left-4 text-slate-400 text-lg" />
                <input 
                  type="text" 
                  placeholder="Enter User ID (e.g. super, test, jaipur)"
                  className="w-full bg-[#FAFAFA] border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1 mr-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Passcode</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative flex items-center">
                <HiOutlineLockClosed className="absolute left-4 text-slate-400 text-lg" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-[#FAFAFA] border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 text-slate-900 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer"
              style={{ backgroundColor: colors.primary || '#FFD166' }}
            >
              {loading ? "VERIFYING..." : "Sign in"}
            </button>
          </form>

          <div className="pt-2">
            <p className="text-xs font-medium text-slate-400">
              Protected Institutional System | {schoolName}
            </p>
          </div>

        </div>
      </div>

      {/* POPUP MODAL FOR SUPER ADMIN BRANCH SELECTION */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            
            <button 
              onClick={() => setShowBranchModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition"
            >
              <HiX className="text-xl" />
            </button>

            <div className="space-y-2 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-3">
                <HiOutlineOfficeBuilding />
              </div>
              <h3 className="text-xl font-black text-slate-900">Select School Branch</h3>
              <p className="text-xs text-slate-500 font-medium">
                You hold Super Admin permissions. Select a target branch to load its dashboard details.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  const newBranch = e.target.value;
                  setSelectedBranch(newBranch);
                  loadSchoolDetails(newBranch);
                }}
                className="w-full bg-[#FAFAFA] border border-slate-200 rounded-2xl py-4 px-4 text-sm font-bold text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition appearance-none cursor-pointer"
              >
                {availableBranches.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label} ({branch.value})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleBranchSelectConfirm}
              disabled={loading}
              className="w-full text-slate-900 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all cursor-pointer"
              style={{ backgroundColor: colors.primary || '#FFD166' }}
            >
              {loading ? "LOADING DASHBOARD..." : "Proceed to Dashboard"}
            </button>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center text-xs font-semibold text-slate-400 space-x-4 relative z-10">
        <span>Copyright © {schoolName} 2026</span>
        <span>•</span>
        <a href="#" className="hover:underline">Privacy Policy</a>
      </footer>

    </div>
  );
}