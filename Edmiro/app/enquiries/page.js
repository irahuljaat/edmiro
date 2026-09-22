'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { 
    HiOutlineMail, 
    HiOutlinePhone, 
    HiOutlineTrash, 
    HiOutlineChatAlt,
    HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { useColors } from '../components/ColorComponent';

export default function EnquiryPage() {
    const colors = useColors();
    const [hasMounted, setHasMounted] = useState(false);

    const [currentSchoolId, setCurrentSchoolId] = useState('TEST_EDMIRO_ACADEMY');
    const [userRole, setUserRole] = useState('branch');
    const [availableBranches, setAvailableBranches] = useState([]);

    const [activeSession, setActiveSession] = useState(null);
    const [enquiries, setEnquiries] = useState([]);

    // Initial setup & load user / branch credentials
    useEffect(() => {
        setHasMounted(true);

        const storedUser = localStorage.getItem('currentUser');
        const storedSchoolId = localStorage.getItem('currentSchoolId');

        if (storedSchoolId) {
            setCurrentSchoolId(storedSchoolId);
        }

        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setUserRole(userObj.role || 'branch');
                fetchAvailableBranches(userObj.groupId || 'EDMIRO_MAIN_GROUP');
            } catch (err) {
                console.error("Error parsing stored user", err);
            }
        }
    }, []);

    // Load available branches for selector
    const fetchAvailableBranches = async (groupId) => {
        try {
            const authRef = doc(db, 'schools', 'authentication');
            const authSnap = await getDoc(authRef);
            const branchList = [];

            if (authSnap.exists()) {
                const authData = authSnap.data();
                for (const accountKey in authData) {
                    const account = authData[accountKey];
                    if (account.groupId === groupId && account.schoolId) {
                        branchList.push({
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
                if (!branchList.some((b) => b.value === docId)) {
                    branchList.push({
                        label: docId.replace(/_/g, ' '),
                        value: docId
                    });
                }
            });

            setAvailableBranches(branchList);
        } catch (err) {
            console.error('Error loading branches:', err);
        }
    };

    // 1. Session listener for Data -> {schoolId} -> config -> settings
    useEffect(() => {
        if (!currentSchoolId) return;

        const configRef = doc(db, 'Data', currentSchoolId, 'config', 'settings');
        const unsubSettings = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setActiveSession(data.activeSession || data.session || '2024-25');
            } else {
                setActiveSession('2024-25');
            }
        });
        return () => unsubSettings();
    }, [currentSchoolId]);

    // 2. Enquiries listener for Data -> {schoolId} -> enquiries
    useEffect(() => {
        if (!currentSchoolId) return;

        const enquiriesRef = collection(db, 'Data', currentSchoolId, 'enquiries');
        const q = query(enquiriesRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Enquiries fetch error:", error);
            setEnquiries([]);
        });

        return () => unsubscribe();
    }, [currentSchoolId]);

    const handleBranchChange = (newSchoolId) => {
        setCurrentSchoolId(newSchoolId);
        localStorage.setItem('currentSchoolId', newSchoolId);
    };

    const updateStatus = async (id, status) => {
        if (!currentSchoolId || !id) return;
        try {
            await updateDoc(doc(db, 'Data', currentSchoolId, 'enquiries', id), { status });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteEnquiry = async (id) => {
        if (!currentSchoolId || !id) return;
        if (window.confirm("Are you sure you want to delete this enquiry?")) {
            try {
                await deleteDoc(doc(db, 'Data', currentSchoolId, 'enquiries', id));
            } catch (error) {
                console.error("Error deleting enquiry:", error);
            }
        }
    };

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen p-6 lg:p-8 font-sans transition-colors duration-300 relative overflow-hidden pb-36" style={{ backgroundColor: colors.background }}>
            {/* Background Decorative Graphic Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl -mr-20 -mt-20" style={{ backgroundColor: colors.primary }}></div>
            <div className="absolute bottom-10 left-0 w-72 h-72 rounded-full pointer-events-none opacity-5 blur-2xl -ml-20" style={{ backgroundColor: colors.primary }}></div>

            <div className="max-w-[1440px] mx-auto space-y-8 relative z-10">
                
                {/* Header Card */}
                <div 
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[28px] shadow-sm border border-slate-100 transition-colors duration-300 relative overflow-hidden"
                    style={{ backgroundColor: colors.cardBackground, color: colors.text }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3.5 rounded-full shadow-inner" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                            <HiOutlineChatAlt size={24} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                                    Active Session: <span style={{ color: colors.primary }}>{activeSession || 'Loading...'}</span>
                                </span>

                                {/* Super Admin Branch Switcher */}
                                {userRole === 'super' && availableBranches.length > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50">
                                        <HiOutlineOfficeBuilding className="text-slate-400 text-xs" />
                                        <select 
                                            value={currentSchoolId} 
                                            onChange={(e) => handleBranchChange(e.target.value)} 
                                            className="bg-transparent text-slate-800 font-bold text-[10px] uppercase outline-none cursor-pointer"
                                        >
                                            {availableBranches.map(b => (
                                                <option key={b.value} value={b.value}>
                                                    {b.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-2xl font-black tracking-tight mt-1" style={{ color: colors.text }}>General Enquiries</h1>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">Manage student and parent admission inquiries.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enquiries:</span>
                        <div className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                            {enquiries.length} Registered
                        </div>
                    </div>
                </div>

                {/* Main Table Container Card */}
                <div 
                    className="rounded-[28px] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6 transition-colors duration-300 relative overflow-hidden"
                    style={{ backgroundColor: colors.cardBackground, color: colors.text }}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inquiry Manifest</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{enquiries.length} Entries</span>
                    </div>

                    <div className="overflow-x-auto rounded-[24px] border border-slate-100 shadow-sm bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="p-5">Student & Parent</th>
                                    <th className="p-5">Grade Seeking</th>
                                    <th className="p-5">Contact Detail</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {enquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-16 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            No enquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    enquiries.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-5">
                                                <div className="font-extrabold text-sm" style={{ color: colors.text }}>{item.studentName}</div>
                                                <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Parent: {item.parentName}</div>
                                            </td>
                                            <td className="p-5">
                                                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block">
                                                    {item.gradeSeeking}
                                                </span>
                                            </td>
                                            <td className="p-5 space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                    <HiOutlinePhone className="text-slate-400 text-sm" /> {item.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <HiOutlineMail className="text-slate-400 text-sm" /> {item.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <select 
                                                    value={item.status || 'pending'} 
                                                    onChange={(e) => updateStatus(item.id, e.target.value)}
                                                    className="text-[10px] font-black uppercase border border-slate-200 rounded-full px-4 py-2.5 bg-slate-50 text-slate-700 outline-none focus:ring-2 transition-all cursor-pointer shadow-xs"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="called">Called</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button 
                                                    onClick={() => deleteEnquiry(item.id)} 
                                                    title="Delete Enquiry"
                                                    className="inline-flex items-center justify-center text-rose-500 p-2.5 hover:bg-rose-50 rounded-full border border-slate-200 hover:border-rose-200 transition-colors bg-white shadow-xs active:scale-95"
                                                >
                                                    <HiOutlineTrash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}