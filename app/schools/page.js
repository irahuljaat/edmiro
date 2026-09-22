'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineCalendar, 
  HiOutlineEye, 
  HiOutlineEyeOff,
  HiOutlineAdjustments, 
  HiOutlineUserAdd, 
  HiOutlinePlus, 
  HiOutlineSearch, 
  HiOutlineCheckCircle,
  HiX,
  HiOutlineShieldCheck,
  HiOutlineLocationMarker,
  HiOutlineBadgeCheck,
  HiOutlinePencilAlt,
  HiOutlineRefresh
} from 'react-icons/hi';

const DEFAULT_FEATURES_LIST = [
  "Students Hub", "Faculty Hub", "Attendance", "Accounts Hub", 
  "Syllabus Hub", "Schedule Hub", "Leave Center", "Reports Hub", 
  "Id Hub", "Class Tests", "Feedbacks", "Website", 
  "Behavior", "Events", "Income & Expense", "Notice", 
  "Gallery", "Home Work", "Library"
];

// Helper: Format Date to DD-MM-YYYY
function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function SchoolsManagementPage() {
  const [authAccounts, setAuthAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Slide-over Drawer
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolConfigData, setSchoolConfigData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Renew Modal State
  const [renewModalTarget, setRenewModalTarget] = useState(null);
  const [renewExpiryInput, setRenewExpiryInput] = useState('');

  // Full Details Edit Modal State
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [editDetailsForm, setEditDetailsForm] = useState({
    schoolName: '',
    schoolRegNo: '',
    affiliation: '',
    establishYear: '',
    address: '',
    website: '',
    directorName: '',
    principalName: '',
    schoolMail: '',
    schoolContact1: '',
    schoolContact2: '',
    schoolLogo: '',
    plan: 'Growth Campus',
    assignedFeatures: []
  });

  // Action Modals State
  const [featureModalTarget, setFeatureModalTarget] = useState(null);
  const [assignedFeaturesList, setAssignedFeaturesList] = useState([]);
  
  const [adminModalTarget, setAdminModalTarget] = useState(null);
  const [adminForm, setAdminForm] = useState({ id: '', password: '', role: 'branch' });

  const [branchModalTarget, setBranchModalTarget] = useState(null);
  const [branchForm, setBranchForm] = useState({
    displayName: '',
    schoolId: '',
    id: '',
    password: '',
    renewDate: '01-07-2026',
    expiryDate: '01-07-2027',
    address: 'Jaipur, Rajasthan',
    affiliation: '1985'
  });

  // 1. Fetch credentials from schools/authentication
  const fetchAuthData = async () => {
    setLoading(true);
    try {
      const authDocRef = doc(db, 'schools', 'authentication');
      const authSnap = await getDoc(authDocRef);
      if (authSnap.exists()) {
        setAuthAccounts(authSnap.data());
      }
    } catch (err) {
      console.error('Error fetching schools/authentication:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthData();
  }, []);

  const togglePasswordVisibility = (accountKey) => {
    setVisiblePasswords(prev => ({ ...prev, [accountKey]: !prev[accountKey] }));
  };

  // 2. Toggle Enable / Disable Status (Saves isEnabled in schools/authentication)
  const handleToggleEnable = async (e, accountKey, currentVal) => {
    e.stopPropagation();
    const nextStatus = currentVal === undefined ? false : !currentVal;

    try {
      const authDocRef = doc(db, 'schools', 'authentication');
      await updateDoc(authDocRef, {
        [`${accountKey}.isEnabled`]: nextStatus
      });

      setAuthAccounts(prev => ({
        ...prev,
        [accountKey]: {
          ...prev[accountKey],
          isEnabled: nextStatus
        }
      }));
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Error updating school status.');
    }
  };

  // 3. Open Renew Modal
  const openRenewModal = (e, accountKey, account) => {
    e.stopPropagation();
    setRenewModalTarget({ accountKey, ...account });

    // Pre-populate input with next year's date if possible
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    setRenewExpiryInput(nextYear.toISOString().split('T')[0]);
  };

  // 4. Save Renewal: Auto-compute Renew Date (1 year prior to expiry date)
  const handleSaveRenewal = async (e) => {
    e.preventDefault();
    if (!renewModalTarget || !renewExpiryInput) return;

    try {
      const expiry = new Date(renewExpiryInput);
      const renew = new Date(expiry);
      renew.setFullYear(expiry.getFullYear() - 1);

      const formattedExpiry = formatDate(expiry);
      const formattedRenew = formatDate(renew);

      const authDocRef = doc(db, 'schools', 'authentication');
      await updateDoc(authDocRef, {
        [`${renewModalTarget.accountKey}.expiryDate`]: formattedExpiry,
        [`${renewModalTarget.accountKey}.renewDate`]: formattedRenew
      });

      setAuthAccounts(prev => ({
        ...prev,
        [renewModalTarget.accountKey]: {
          ...prev[renewModalTarget.accountKey],
          expiryDate: formattedExpiry,
          renewDate: formattedRenew
        }
      }));

      alert(`Subscription renewed successfully!\nRenew Date: ${formattedRenew}\nExpiry Date: ${formattedExpiry}`);
      setRenewModalTarget(null);
    } catch (err) {
      console.error('Error renewing subscription:', err);
      alert('Failed to renew subscription.');
    }
  };

  // 5. Inspect School Data from Data/{schoolId}/config/schoolDetails
  const handleCardClick = async (accountKey, account) => {
    const targetSchoolId = account.schoolId || accountKey.replace(/\s+/g, '_').toUpperCase();
    setSelectedSchool({ accountKey, targetSchoolId, ...account });
    setLoadingDetails(true);
    setSchoolConfigData(null);

    try {
      const detailsDocRef = doc(db, 'Data', targetSchoolId, 'config', 'schoolDetails');
      const detailsSnap = await getDoc(detailsDocRef);
      if (detailsSnap.exists()) {
        setSchoolConfigData(detailsSnap.data());
      }
    } catch (err) {
      console.error('Error fetching Data config:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 6. Open Full Details Edit Modal
  const handleOpenEditDetails = () => {
    if (!selectedSchool) return;
    setEditDetailsForm({
      schoolName: schoolConfigData?.schoolName || selectedSchool.accountKey || '',
      schoolRegNo: schoolConfigData?.schoolRegNo || '',
      affiliation: schoolConfigData?.affiliation || '',
      establishYear: schoolConfigData?.establishYear || '',
      address: schoolConfigData?.address || '',
      website: schoolConfigData?.website || '',
      directorName: schoolConfigData?.directorName || '',
      principalName: schoolConfigData?.principalName || '',
      schoolMail: schoolConfigData?.schoolMail || '',
      schoolContact1: schoolConfigData?.schoolContact1 || '',
      schoolContact2: schoolConfigData?.schoolContact2 || '',
      schoolLogo: schoolConfigData?.schoolLogo || '',
      plan: schoolConfigData?.plan || 'Growth Campus',
      assignedFeatures: Array.isArray(schoolConfigData?.assignedFeatures) ? schoolConfigData.assignedFeatures : DEFAULT_FEATURES_LIST
    });
    setIsEditDetailsModalOpen(true);
  };

  // Save Full Details back to Data/{schoolId}/config/schoolDetails
  const handleSaveEditDetails = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return;

    try {
      const detailsDocRef = doc(db, 'Data', selectedSchool.targetSchoolId, 'config', 'schoolDetails');
      await setDoc(detailsDocRef, editDetailsForm, { merge: true });

      setSchoolConfigData(editDetailsForm);
      setIsEditDetailsModalOpen(false);
      alert('School details updated successfully!');
    } catch (err) {
      console.error('Error updating school details:', err);
      alert('Failed to update school details.');
    }
  };

  // 7. Open Assign Features Modal
  const openFeaturesModal = async (e, accountKey, account) => {
    e.stopPropagation();
    const targetSchoolId = account.schoolId || accountKey.replace(/\s+/g, '_').toUpperCase();
    setFeatureModalTarget({ accountKey, targetSchoolId, ...account });

    try {
      const detailsDocRef = doc(db, 'Data', targetSchoolId, 'config', 'schoolDetails');
      const detailsSnap = await getDoc(detailsDocRef);
      if (detailsSnap.exists() && Array.isArray(detailsSnap.data().assignedFeatures)) {
        setAssignedFeaturesList(detailsSnap.data().assignedFeatures);
      } else {
        setAssignedFeaturesList(DEFAULT_FEATURES_LIST);
      }
    } catch (err) {
      setAssignedFeaturesList(DEFAULT_FEATURES_LIST);
    }
  };

  const handleSaveFeatures = async () => {
    if (!featureModalTarget) return;
    try {
      const detailsDocRef = doc(db, 'Data', featureModalTarget.targetSchoolId, 'config', 'schoolDetails');
      await setDoc(detailsDocRef, { assignedFeatures: assignedFeaturesList }, { merge: true });
      alert(`Assigned features saved for ${featureModalTarget.accountKey}!`);
      setFeatureModalTarget(null);
    } catch (err) {
      console.error('Error saving assigned features:', err);
      alert('Failed to save features.');
    }
  };

  // 8. Open Assign Admin Modal
  const openAdminModal = (e, accountKey, account) => {
    e.stopPropagation();
    setAdminModalTarget({ accountKey, ...account });
    setAdminForm({
      id: account.id || '',
      password: account.password || '',
      role: account.role || 'branch'
    });
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    if (!adminModalTarget) return;

    try {
      const authDocRef = doc(db, 'schools', 'authentication');
      await updateDoc(authDocRef, {
        [`${adminModalTarget.accountKey}.id`]: adminForm.id,
        [`${adminModalTarget.accountKey}.password`]: adminForm.password,
        [`${adminModalTarget.accountKey}.role`]: adminForm.role
      });

      alert(`Credentials updated for ${adminModalTarget.accountKey}!`);
      setAdminModalTarget(null);
      fetchAuthData();
    } catch (err) {
      console.error('Failed to update credentials:', err);
      alert('Error updating credentials.');
    }
  };

  // 9. Open Add Branch Modal
  const openAddBranchModal = (e, accountKey, account) => {
    e.stopPropagation();
    setBranchModalTarget({ accountKey, ...account });
    setBranchForm({
      displayName: '',
      schoolId: '',
      id: '',
      password: '',
      renewDate: '01-07-2026',
      expiryDate: '01-07-2027',
      address: 'Jaipur, Rajasthan',
      affiliation: '1985'
    });
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!branchModalTarget || !branchForm.displayName) return;

    const parentGroupId = branchModalTarget.groupId || 'EDMIRO_MAIN_GROUP';
    const cleanBranchId = branchForm.schoolId.trim().toUpperCase().replace(/\s+/g, '_');

    try {
      const authDocRef = doc(db, 'schools', 'authentication');
      await updateDoc(authDocRef, {
        [branchForm.displayName]: {
          groupId: parentGroupId,
          schoolId: cleanBranchId,
          id: branchForm.id,
          password: branchForm.password,
          role: 'branch',
          renewDate: branchForm.renewDate,
          expiryDate: branchForm.expiryDate,
          isEnabled: true
        }
      });

      const detailsDocRef = doc(db, 'Data', cleanBranchId, 'config', 'schoolDetails');
      await setDoc(detailsDocRef, {
        schoolName: branchForm.displayName,
        address: branchForm.address,
        affiliation: branchForm.affiliation,
        plan: 'Growth Campus',
        assignedFeatures: DEFAULT_FEATURES_LIST
      }, { merge: true });

      alert(`Branch "${branchForm.displayName}" registered successfully!`);
      setBranchModalTarget(null);
      fetchAuthData();
    } catch (err) {
      console.error('Failed to register branch:', err);
      alert('Error registering branch.');
    }
  };

  const accountEntries = Object.entries(authAccounts);

  const filteredAccounts = accountEntries.filter(([name, data]) => 
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (data.id && data.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (data.schoolId && data.schoolId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">
        Loading Institutional Schools & Branches...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] p-6 lg:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Institutional Admin Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Schools & Branches Directory</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Manage school subscription timelines, branches, access credentials, and features</p>
          </div>

          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search school, ID, or schoolId..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-slate-400 transition"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map(([accountKey, account]) => {
            const isSuper = account.role === 'super';
            const showPass = visiblePasswords[accountKey];
            const isEnabled = account.isEnabled !== false; // Default true if undefined

            return (
              <div 
                key={accountKey}
                onClick={() => handleCardClick(accountKey, account)}
                className={`bg-white rounded-[32px] p-6 border shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md hover:-translate-y-1 ${
                  isSuper ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-100'
                } ${!isEnabled ? 'opacity-65 grayscale-[20%]' : ''}`}
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                        isSuper ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-indigo-600'
                      }`}>
                        {isSuper ? <HiOutlineShieldCheck size={26} /> : <HiOutlineOfficeBuilding size={24} />}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">{accountKey}</h3>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{account.schoolId || 'MASTER_ADMIN'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Enable/Disable Switch */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleEnable(e, accountKey, isEnabled)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isEnabled ? "Disable School" : "Enable School"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider ${
                        isSuper ? 'bg-amber-100 text-amber-900' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {account.role || 'branch'}
                      </span>
                    </div>
                  </div>

                  {/* Renew & Expiry Dates */}
                  <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Renew Date</span>
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 mt-0.5">
                        <HiOutlineCalendar className="text-slate-400" />
                        <span>{account.renewDate || '01-07-2026'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Expiry Date</span>
                      <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 mt-0.5">
                        <HiOutlineCalendar className="text-rose-400" />
                        <span>{account.expiryDate || '01-07-2027'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ID / Password Section */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Login ID:</span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {account.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {showPass ? account.password : '••••••••'}
                        </span>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePasswordVisibility(accountKey); }}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showPass ? <HiOutlineEyeOff size={14} /> : <HiOutlineEye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons: 4-Column Layout */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => openRenewModal(e, accountKey, account)}
                    className="py-2.5 px-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Renew Subscription"
                  >
                    <HiOutlineRefresh size={13} />
                    <span>Renew</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => openFeaturesModal(e, accountKey, account)}
                    className="py-2.5 px-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Assign Features"
                  >
                    <HiOutlineAdjustments size={13} />
                    <span>Features</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => openAdminModal(e, accountKey, account)}
                    className="py-2.5 px-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Assign Admin"
                  >
                    <HiOutlineUserAdd size={13} />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => openAddBranchModal(e, accountKey, account)}
                    className="py-2.5 px-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Add Branch"
                  >
                    <HiOutlinePlus size={13} />
                    <span>Branch</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL: RENEW SUBSCRIPTION */}
      {renewModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Renew Subscription</h3>
                <p className="text-xs text-slate-400 font-medium">{renewModalTarget.accountKey}</p>
              </div>
              <button onClick={() => setRenewModalTarget(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRenewal} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Select New Expiry Date
                </label>
                <input 
                  type="date"
                  value={renewExpiryInput}
                  onChange={(e) => setRenewExpiryInput(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono text-xs cursor-pointer"
                  required
                />
              </div>

              {renewExpiryInput && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-700">Calculated Renew Date:</span>
                    <span className="font-bold">
                      {formatDate(new Date(new Date(renewExpiryInput).setFullYear(new Date(renewExpiryInput).getFullYear() - 1)))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-700">New Expiry Date:</span>
                    <span className="font-bold">
                      {formatDate(new Date(renewExpiryInput))}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer mt-2"
              >
                Confirm & Save Renewal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: COMPLETE DATA INSPECTION */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {schoolConfigData?.schoolLogo ? (
                    <img 
                      src={schoolConfigData.schoolLogo} 
                      alt="Logo" 
                      className="w-12 h-12 rounded-2xl object-contain border border-slate-100 p-1 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
                      <HiOutlineOfficeBuilding />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{schoolConfigData?.schoolName || selectedSchool.accountKey}</h2>
                    <p className="text-xs font-mono text-slate-400">{selectedSchool.targetSchoolId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSchool(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                >
                  <HiX size={24} />
                </button>
              </div>

              {loadingDetails ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400">
                  Fetching school database configuration...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Configuration Details
                    </span>
                    <button
                      onClick={handleOpenEditDetails}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <HiOutlinePencilAlt size={14} /> Edit School Details
                    </button>
                  </div>

                  {/* Validity Box */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Subscription Validity</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Renewed On</span>
                        <span className="text-sm font-black text-slate-800">{selectedSchool.renewDate || '01-07-2026'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Expires On</span>
                        <span className="text-sm font-black text-rose-600">{selectedSchool.expiryDate || '01-07-2027'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Full School Details Cards */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Campus & Authority Info</h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Registration No</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.schoolRegNo || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Affiliation Code</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.affiliation || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Established Year</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.establishYear || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Subscription Plan</span>
                        <span className="font-bold text-indigo-700">{schoolConfigData?.plan || 'Growth Campus'}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-200/60 pt-2">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Campus Address</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.address || '—'}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-200/60 pt-2">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Official Website</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.website || '—'}</span>
                      </div>
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pt-2">Leadership & Contacts</h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Director Name</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.directorName || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Principal Name</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.principalName || '—'}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-200/60 pt-2">
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Official Email</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.schoolMail || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Contact Number 1</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.schoolContact1 || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] block">Contact Number 2</span>
                        <span className="font-semibold text-slate-800">{schoolConfigData?.schoolContact2 || '—'}</span>
                      </div>
                    </div>

                    {/* Assigned Features */}
                    <div className="pt-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Assigned Features ({schoolConfigData?.assignedFeatures?.length || 0})
                      </h3>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {(schoolConfigData?.assignedFeatures || DEFAULT_FEATURES_LIST).map((feat, i) => (
                          <span key={i} className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                            <HiOutlineCheckCircle className="text-indigo-600" /> {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setSelectedSchool(null)}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: FULL SCHOOL DETAILS EDIT */}
      {isEditDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit School Details</h3>
                <p className="text-xs text-slate-400 font-medium">Data → {selectedSchool?.targetSchoolId} → config → schoolDetails</p>
              </div>
              <button onClick={() => setIsEditDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditDetails} className="space-y-4 overflow-y-auto pr-2 text-xs font-bold text-slate-700 flex-1">
              
              {/* Campus Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">School Name</label>
                  <input 
                    type="text"
                    value={editDetailsForm.schoolName}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, schoolName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Registration No</label>
                  <input 
                    type="text"
                    value={editDetailsForm.schoolRegNo}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, schoolRegNo: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Affiliation Code</label>
                  <input 
                    type="text"
                    value={editDetailsForm.affiliation}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, affiliation: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Establishment Year</label>
                  <input 
                    type="text"
                    value={editDetailsForm.establishYear}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, establishYear: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Subscription Plan</label>
                  <select 
                    value={editDetailsForm.plan}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, plan: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="Starter Campus">Starter Campus</option>
                    <option value="Growth Campus">Growth Campus</option>
                    <option value="Enterprise SaaS">Enterprise SaaS</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Address</label>
                  <input 
                    type="text"
                    value={editDetailsForm.address}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, address: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Website URL</label>
                  <input 
                    type="text"
                    value={editDetailsForm.website}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, website: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">School Logo URL (Cloudinary / Web)</label>
                  <input 
                    type="text"
                    value={editDetailsForm.schoolLogo}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, schoolLogo: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Leadership Info */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Director Name</label>
                  <input 
                    type="text"
                    value={editDetailsForm.directorName}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, directorName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Principal Name</label>
                  <input 
                    type="text"
                    value={editDetailsForm.principalName}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, principalName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Official School Email</label>
                  <input 
                    type="email"
                    value={editDetailsForm.schoolMail}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, schoolMail: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Contact Phone 1</label>
                  <input 
                    type="text"
                    value={editDetailsForm.schoolContact1}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, schoolContact1: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Contact Phone 2</label>
                  <input 
                    type="text"
                    value={editDetailsForm.schoolContact2}
                    onChange={(e) => setEditDetailsForm({ ...editDetailsForm, schoolContact2: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer"
                >
                  Save Configuration Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ASSIGN FEATURES */}
      {featureModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-6 relative border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Assign Features</h3>
                <p className="text-xs text-slate-400 font-medium">{featureModalTarget.accountKey} ({featureModalTarget.targetSchoolId})</p>
              </div>
              <button onClick={() => setFeatureModalTarget(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <HiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_FEATURES_LIST.map((key) => {
                  const isChecked = assignedFeaturesList.includes(key);
                  return (
                    <div 
                      key={key} 
                      onClick={() => {
                        setAssignedFeaturesList(prev => 
                          prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                        );
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                        isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{key}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <HiOutlineCheckCircle size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleSaveFeatures}
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer"
              >
                Save Assigned Features
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN ADMIN */}
      {adminModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Assign Admin Credentials</h3>
                <p className="text-xs text-slate-400 font-medium">{adminModalTarget.accountKey}</p>
              </div>
              <button onClick={() => setAdminModalTarget(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Login ID</label>
                <input 
                  type="text"
                  value={adminForm.id}
                  onChange={(e) => setAdminForm({ ...adminForm, id: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Passcode / Password</label>
                <input 
                  type="text"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Role Authority</label>
                <select 
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer"
                >
                  <option value="branch">Branch Admin</option>
                  <option value="super">Master Super Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer mt-2"
              >
                Update Credentials
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD BRANCH */}
      {branchModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add School Branch</h3>
                <p className="text-xs text-slate-400 font-medium">Under Group: {branchModalTarget.groupId || 'EDMIRO_MAIN_GROUP'}</p>
              </div>
              <button onClick={() => setBranchModalTarget(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Branch Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Malviya Nagar Branch"
                    value={branchForm.displayName}
                    onChange={(e) => setBranchForm({ ...branchForm, displayName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">School ID (Key)</label>
                  <input 
                    type="text"
                    placeholder="e.g. test_test_jaipur"
                    value={branchForm.schoolId}
                    onChange={(e) => setBranchForm({ ...branchForm, schoolId: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Login ID</label>
                  <input 
                    type="text"
                    placeholder="e.g. jaipur"
                    value={branchForm.id}
                    onChange={(e) => setBranchForm({ ...branchForm, id: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Passcode</label>
                  <input 
                    type="text"
                    placeholder="e.g. admin"
                    value={branchForm.password}
                    onChange={(e) => setBranchForm({ ...branchForm, password: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Address</label>
                  <input 
                    type="text"
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Affiliation</label>
                  <input 
                    type="text"
                    value={branchForm.affiliation}
                    onChange={(e) => setBranchForm({ ...branchForm, affiliation: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Renew Date</label>
                  <input 
                    type="text"
                    value={branchForm.renewDate}
                    onChange={(e) => setBranchForm({ ...branchForm, renewDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Expiry Date</label>
                  <input 
                    type="text"
                    value={branchForm.expiryDate}
                    onChange={(e) => setBranchForm({ ...branchForm, expiryDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer mt-2"
              >
                Register & Link Branch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}