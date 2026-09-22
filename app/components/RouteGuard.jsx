// components/RouteGuard.jsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

// Public or globally accessible routes
const PUBLIC_PATHS = ['/dashboard', '/settings', '/login', '/'];

// Feature Mapping matching assignedFeatures in Firestore
const FEATURE_PATH_MAP = {
  '/students': 'Students Hub',
  '/teacher-manage': 'Faculty Hub',
  '/time-table': 'Schedule Hub',
  '/syllabus-manager': 'Syllabus Hub',
  '/attendance': 'Attendance',
  '/behaviour': 'Behavior',
  '/route-management': 'Vehicle',
  '/enquiries': 'Enquiries',
  '/Adenquiry': 'Admissions',
  '/posts': 'Post Maker',
  '/library': 'Library',
  '/library/issue': 'Library',
  '/id-cards': 'Id Hub',
  '/papers': 'Class Tests',
  '/hostel': 'Hostel',
  '/fees-system': 'Accounts Hub',
  '/school-expenses': 'Income & Expense',
  '/exam-manage': 'Reports Hub',
  '/notify': 'Notice',
};

export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // State initialized as checking (loading = true, authorized = false)
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      // Always reset checking state on path change
      setChecking(true);
      setAuthorized(false);

      // 1. Immediately authorize public routes
      if (PUBLIC_PATHS.includes(pathname)) {
        if (isMounted) {
          setAuthorized(true);
          setChecking(false);
        }
        return;
      }

      // 2. Check mapped feature requirement
      const requiredFeature = FEATURE_PATH_MAP[pathname];
      if (!requiredFeature) {
        if (isMounted) {
          setAuthorized(true);
          setChecking(false);
        }
        return;
      }

      // 3. Get active school ID
      const schoolId = (typeof window !== 'undefined' ? localStorage.getItem('currentSchoolId') : null) || 'TEST_EDMIRO_ACADEMY';

      try {
        const docRef = doc(db, 'Data', schoolId, 'config', 'schoolDetails');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const assignedFeatures = docSnap.data().assignedFeatures || [];
          const hasAccess = assignedFeatures.includes(requiredFeature);

          if (isMounted) {
            if (hasAccess) {
              setAuthorized(true);
              setChecking(false);
            } else {
              setAuthorized(false);
              setChecking(false);
              // Perform immediate replace before rendering children
              router.replace('/dashboard');
            }
          }
        } else {
          if (isMounted) {
            setAuthorized(false);
            setChecking(false);
            router.replace('/dashboard');
          }
        }
      } catch (err) {
        console.error('RouteGuard Verification Error:', err);
        if (isMounted) {
          setAuthorized(false);
          setChecking(false);
          router.replace('/dashboard');
        }
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // While checking or unauthorized, return loader overlay ONLY (children remain unmounted)
  if (checking || !authorized) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Verifying Permissions...
        </p>
      </div>
    );
  }

  // Render children ONLY when checking is false AND authorized is true
  return <>{children}</>;
}