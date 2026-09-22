"use client";

import React, { memo, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HiOutlineAcademicCap, HiOutlineClipboardList, HiOutlineHome, 
  HiOutlineUserGroup, HiOutlineCurrencyDollar, HiX,
  HiOutlineBell, HiOutlineCog, HiOutlineBookOpen, HiChevronRight,
  HiOutlineCalendar, HiOutlineDocumentText, HiOutlineTruck, HiOutlineChatAlt2, HiOutlineIdentification,
  HiOutlinePrinter, HiOutlineOfficeBuilding, HiOutlineShieldCheck, HiOutlineSparkles,
  HiOutlineAdjustments
} from 'react-icons/hi';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { useColors } from './ColorComponent';

// Master Navigation Item Definitions
const NAV_CONFIG = [
  { 
    section: 'CORE CENTER', 
    items: [
      { name: 'Dashboard', icon: HiOutlineHome, path: '/dashboard', featureKey: null }, // Always available
      { name: 'Subscriptions', icon: HiOutlineAdjustments, path: '/subscriptions', featureKey: null }, // Always available for Ultimate Admin
      { name: 'Schools', icon: HiOutlineUserGroup, path: '/schools', featureKey: 'Students Hub' },
      { name: 'Poster Designs', icon: HiOutlineAcademicCap, path: '/page-designs', featureKey: 'Faculty Hub' },
      { name: 'Marksheet Designs', icon: HiOutlineCalendar, path: '/marksheet-designs', featureKey: 'Schedule Hub' },
      { name: 'Admit Card Designs', icon: HiOutlineDocumentText, path: '/syllabus-manager', featureKey: 'Syllabus Hub' },
      { name: 'Notices', icon: HiOutlineClipboardList, path: '/attendance', featureKey: 'Attendance' },
      { name: 'Settings', icon: HiOutlineShieldCheck, path: '/behaviour', featureKey: 'Behavior' },
     
     
    ]
  },
];

const NavItem = memo(({ name, icon: Icon, path, isActive, onClick, subMenus, activePath }) => {
  const colors = useColors();
  const primaryColor = colors.primary || '#ffc107';
  
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubMenus = subMenus && subMenus.length > 0;
  const isSubActive = hasSubMenus && subMenus.some(sub => sub.path === activePath);

  return (
    <div className="relative">
      <Link 
        href={hasSubMenus ? '#' : (path || '#')}
        onClick={(e) => {
          if (hasSubMenus) {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          } else {
            onClick();
          }
        }}
        className="relative flex items-center px-4 py-1 transition-colors group cursor-pointer"
      >
        {/* Active Vertical Indicator */}
        {(isActive || isSubActive) && (
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-md" 
            style={{ backgroundColor: primaryColor }}
          />
        )}
        
        {/* Pill Background with Distinct Active State */}
        <div className={`flex items-center justify-between w-full px-4 py-3 rounded-[16px] text-sm font-medium transition-all ${
          (isActive || isSubActive) 
            ? 'bg-slate-900 text-white font-bold shadow-md' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}>
          <div className="flex items-center">
            <Icon 
              className={`w-5 h-5 mr-3 transition-colors`}
              style={{ color: (isActive || isSubActive) ? primaryColor : undefined }}
              strokeWidth={2} 
            />
            <span className={!(isActive || isSubActive) ? 'text-slate-500 group-hover:text-slate-900' : ''}>{name}</span>
          </div>
          {hasSubMenus && (
            <HiChevronRight 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : 'text-slate-400'}`} 
              style={{ color: isExpanded ? primaryColor : undefined }}
            />
          )}
        </div>
      </Link>

      {/* Sub Menus */}
      {hasSubMenus && isExpanded && (
        <div className="pl-12 pr-4 py-1 space-y-1">
          {subMenus.map((sub) => {
            const isSubItemActive = activePath === sub.path;
            return (
              <Link
                key={sub.name}
                href={sub.path}
                onClick={onClick}
                className={`block py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  isSubItemActive 
                    ? 'text-slate-900 font-bold' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                style={{ backgroundColor: isSubItemActive ? primaryColor : undefined }}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
});

NavItem.displayName = 'NavItem';

export default function Sidebar({ activePath, isOpen, onClose }) {
  const colors = useColors();
  const primaryColor = colors.primary || '#ffc107';
  const router = useRouter();

  const [currentSchoolId, setCurrentSchoolId] = useState('TEST_EDMIRO_ACADEMY');
  const [assignedFeatures, setAssignedFeatures] = useState([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
  const [activeSession, setActiveSession] = useState('Loading...');

  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: 'Edmiro Test Academy',
    schoolAddress: 'Jaipur, Rajasthan',
    logoUrl: ''
  });

  // Get active school ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSchoolId = localStorage.getItem('currentSchoolId');
      if (storedSchoolId) {
        setCurrentSchoolId(storedSchoolId);
      }
    }
  }, []);

  // Listen in real-time to Data -> {schoolId} -> config -> schoolDetails
  useEffect(() => {
    if (!currentSchoolId) return;

    setIsLoadingFeatures(true);
    const db = getFirestore();
    const schoolDetailsRef = doc(db, 'Data', currentSchoolId, 'config', 'schoolDetails');

    const unsubscribeDetails = onSnapshot(schoolDetailsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchoolDetails({
          schoolName: data.schoolName || data.name || 'Edmiro Test Academy',
          schoolAddress: data.address || data.schoolAddress || 'Jaipur, Rajasthan',
          logoUrl: data.schoolLogo || data.logoUrl || data.logo || ''
        });

        if (Array.isArray(data.assignedFeatures)) {
          setAssignedFeatures(data.assignedFeatures);
        } else {
          setAssignedFeatures([]);
        }
      }
      setIsLoadingFeatures(false);
    }, (error) => {
      console.error("Error fetching school details:", error);
      setIsLoadingFeatures(false);
    });

    // Listen in real-time to Data -> {schoolId} -> config -> settings (for activeSession)
    const settingsRef = doc(db, 'Data', currentSchoolId, 'config', 'settings');
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const settingsData = docSnap.data();
        setActiveSession(settingsData.activeSession || settingsData.session || '2026-2027');
      } else {
        setActiveSession('2026-2027');
      }
    }, (error) => {
      console.error("Error fetching settings:", error);
      setActiveSession('2026-2027');
    });

    return () => {
      unsubscribeDetails();
      unsubscribeSettings();
    };
  }, [currentSchoolId]);

  // Filter allowed navigation items based on assignedFeatures
  const filteredNavConfig = useMemo(() => {
    return NAV_CONFIG.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.featureKey) return true;
        return assignedFeatures.includes(item.featureKey);
      })
    }));
  }, [assignedFeatures]);

  // Route Protection: Prevent unauthorized access via direct URL typing
  useEffect(() => {
    if (isLoadingFeatures || !activePath) return;

    const allowedPaths = new Set(['/subscriptions']); // Expressly permit subscriptions
    NAV_CONFIG.forEach(group => {
      group.items.forEach(item => {
        if (!item.featureKey || assignedFeatures.includes(item.featureKey)) {
          allowedPaths.add(item.path);
          if (item.subMenus) {
            item.subMenus.forEach(sub => allowedPaths.add(sub.path));
          }
        }
      });
    });

    if (activePath !== '/' && !allowedPaths.has(activePath)) {
      console.warn(`Access restricted for ${activePath}. Redirecting to /dashboard.`);
      router.replace('/dashboard');
    }
  }, [activePath, assignedFeatures, isLoadingFeatures, router]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transform transition-transform lg:translate-x-0 lg:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {schoolDetails.logoUrl ? (
              <img src={schoolDetails.logoUrl} alt="School Logo" className="w-10 h-10 rounded-xl object-contain shadow-md" />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <HiOutlineBookOpen size={22} />
              </div>
            )}
            <div>
              <span className="text-base font-black text-slate-900 tracking-tight block leading-tight truncate max-w-[150px]">{schoolDetails.schoolName}</span>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[150px]">{schoolDetails.schoolAddress}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <HiX size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
          {filteredNavConfig.map((group) => (
            <div key={group.section} className="mb-4">
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem 
                    key={item.name} 
                    {...item} 
                    activePath={activePath}
                    isActive={activePath === item.path} 
                    onClick={onClose} 
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Dynamic Footer Session Area */}
        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="bg-amber-50/50 rounded-[20px] p-4 border border-amber-200/50 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-700/70 uppercase tracking-wider">Current Session</p>
              <p className="text-sm font-bold text-slate-900">{activeSession}</p>
            </div>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <HiOutlineClipboardList size={16} />
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}