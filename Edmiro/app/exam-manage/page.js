'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot, collection, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { 
    HiOutlineDocumentAdd, 
    HiOutlineClock, 
    HiOutlinePencil, 
    HiOutlineChartBar,
    HiChevronRight,
    HiOutlineDatabase,
    HiOutlineEye,
    HiOutlineIdentification, 
    HiOutlineRefresh
} from 'react-icons/hi';
import { Building2 } from 'lucide-react';
import { useColors } from '../components/ColorComponent';

// --- Components ---
import ExamDefinitionAndAssignment from '../components/ExamDefinitionAndAssignment';
import TimeTableCreator from '../components/TimeTableCreator'; 
import MarksEntry from '../components/MarkEntry';               
import DocumentGenerator from '../components/DocumentSelector'; 
import ResultReleasePortal from '../components/ResultReleasePortal.jsx';

const VIEWS = {
    ASSIGNMENT: { id: 'ASSIGNMENT', label: 'Define & Assign', icon: HiOutlineDocumentAdd },
    TIMETABLE: { id: 'TIMETABLE', label: 'Time Table', icon: HiOutlineClock },
    MARKS_ENTRY: { id: 'MARKS_ENTRY', label: 'Marks Entry', icon: HiOutlinePencil },
    GENERATE: { id: 'GENERATE', label: 'Finalize & Print', icon: HiOutlineChartBar },
    RELEASE: { id: 'RELEASE', label: 'Result Control', icon: HiOutlineEye },
};

// Roll Number Starting Points Mapping
const CLASS_ROLL_START = {
    'LKG': 101, 'UKG': 201, 'PREP': 301,
    '1': 401, '2': 501, '3': 601, '4': 701, '5': 801,
    '6': 901, '7': 1001, '8': 1101, '9': 1201, '10': 1301,
    '11': 1401, '12': 1501
};

function ExamManagementPage() {
    const colors = useColors();
    const [currentView, setCurrentView] = useState(VIEWS.ASSIGNMENT.id);

    // Branch & Multi-School Context State
    const [currentSchoolId, setCurrentSchoolId] = useState('TEST_EDMIRO_ACADEMY');
    const [userRole, setUserRole] = useState('branch');
    const [availableBranches, setAvailableBranches] = useState([]);

    const [activeSession, setActiveSession] = useState(null);
    const [isAssigning, setIsAssigning] = useState(false);

    // Load branch context & user credentials on mount
    useEffect(() => {
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

    // Fetch available branches for Super Admin Switcher
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

    // Listen to Active Session under Data -> {schoolId} -> config -> settings
    useEffect(() => {
        if (!currentSchoolId) return;

        const configRef = doc(db, 'Data', currentSchoolId, 'config', 'settings');
        const unsub = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setActiveSession(data.activeSession || data.session || '2024-25');
            } else {
                setActiveSession('2024-25');
            }
        });
        return () => unsub();
    }, [currentSchoolId]);

    const handleBranchChange = (newSchoolId) => {
        setCurrentSchoolId(newSchoolId);
        localStorage.setItem('currentSchoolId', newSchoolId);
    };

    // --- Roll Number Assignment Logic ---
    const handleAssignRollNumbers = async () => {
        if (!activeSession || !currentSchoolId) return;
        const confirmAction = window.confirm("This will overwrite existing roll numbers for ALL students in alphabetical order. Continue?");
        if (!confirmAction) return;

        setIsAssigning(true);
        try {
            // Read students from Data -> {schoolId} -> sessions -> {activeSession} -> students
            const studentsRef = collection(db, 'Data', currentSchoolId, 'sessions', activeSession, 'students');
            const snapshot = await getDocs(studentsRef);
            
            if (snapshot.empty) {
                alert("No students found in this session.");
                return;
            }

            const studentsByClass = {};
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const className = (data.grade || data.class || data.studentClass || '').toString().toUpperCase();
                if (!studentsByClass[className]) studentsByClass[className] = [];
                studentsByClass[className].push({ id: docSnap.id, name: data.name || data.studentName || 'Unnamed' });
            });

            const batch = writeBatch(db);

            Object.keys(studentsByClass).forEach(className => {
                const startRange = CLASS_ROLL_START[className];
                if (!startRange) return;

                const sortedList = studentsByClass[className].sort((a, b) => 
                    a.name.localeCompare(b.name)
                );

                sortedList.forEach((student, index) => {
                    const newRollNumber = startRange + index;
                    const studentDocRef = doc(db, 'Data', currentSchoolId, 'sessions', activeSession, 'students', student.id);
                    batch.update(studentDocRef, { rollNumber: newRollNumber });
                });
            });

            await batch.commit();
            alert("Roll numbers assigned successfully based on alphabetical order!");
        } catch (error) {
            console.error("Roll Number Assignment Error:", error);
            alert("Failed to assign roll numbers.");
        } finally {
            setIsAssigning(false);
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case VIEWS.TIMETABLE.id: 
                return <TimeTableCreator isModal={false} activeSession={activeSession} schoolId={currentSchoolId} />; 
            case VIEWS.MARKS_ENTRY.id: 
                return <MarksEntry activeSession={activeSession} schoolId={currentSchoolId} />;
            case VIEWS.GENERATE.id: 
                return <DocumentGenerator activeSession={activeSession} schoolId={currentSchoolId} />;
            case VIEWS.RELEASE.id: 
                return <ResultReleasePortal activeSession={activeSession} schoolId={currentSchoolId} />;
            default: 
                return <ExamDefinitionAndAssignment activeSession={activeSession} schoolId={currentSchoolId} />;
        }
    };

    return (
        <div className="min-h-screen font-sans relative overflow-hidden p-6 lg:p-8" style={{ backgroundColor: colors.background }}>
            {/* Soft Background Decorative Blur Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 pointer-events-none -mr-20 -mt-20" style={{ backgroundColor: colors.primary }}></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none -ml-20 -mb-20" style={{ backgroundColor: colors.primary }}></div>

            <div className="max-w-[1440px] mx-auto relative z-10 space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-8 rounded-[28px] shadow-sm border border-slate-100">
                    <div className="text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                                Academic Session {activeSession || 'Loading...'}
                            </span>

                            {/* Super Admin Branch Switcher */}
                            {userRole === 'super' && availableBranches.length > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
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
                        <h1 className="text-2xl font-black tracking-tight text-slate-800">
                            Exam <span style={{ color: colors.primary }}>Controller</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-center md:justify-end">
                        <button
                            onClick={handleAssignRollNumbers}
                            disabled={isAssigning || !activeSession}
                            className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all disabled:opacity-50 text-slate-700 cursor-pointer"
                        >
                            {isAssigning ? (
                                <HiOutlineRefresh className="w-4 h-4 animate-spin" style={{ color: colors.primary }} />
                            ) : (
                                <HiOutlineIdentification className="w-4 h-4" style={{ color: colors.primary }} />
                            )}
                            {isAssigning ? 'ASSIGNING...' : 'AUTO ROLL NO'}
                        </button>

                        <nav className="flex items-center bg-slate-50 p-1.5 rounded-full border border-slate-200 overflow-x-auto">
                            {Object.values(VIEWS).map((view, index) => {
                                const Icon = view.icon;
                                const isActive = currentView === view.id;
                                return (
                                    <React.Fragment key={view.id}>
                                        <button
                                            onClick={() => setCurrentView(view.id)}
                                            className={`flex items-center px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap text-xs font-bold cursor-pointer ${
                                                isActive 
                                                ? 'bg-white shadow-sm' 
                                                : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                            style={{ color: isActive ? colors.primary : undefined }}
                                        >
                                            <Icon className={`w-4 h-4 mr-2`} style={{ color: isActive ? colors.primary : undefined }} />
                                            <span className="hidden lg:inline">{view.label}</span>
                                        </button>
                                        {index < Object.values(VIEWS).length - 1 && (
                                            <HiChevronRight className="w-4 h-4 text-slate-300 mx-1 hidden lg:block" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Section Card Container */}
                <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden p-6 md:p-8">
                    <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-slate-100">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                            {React.createElement(VIEWS[currentView].icon, { className: "w-6 h-6" })}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{VIEWS[currentView].label}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                {currentView === 'ASSIGNMENT' && "Configure exam types and link them to classes."}
                                {currentView === 'TIMETABLE' && "Schedule dates and times for each subject."}
                                {currentView === 'MARKS_ENTRY' && "Securely input student marks and remarks."}
                                {currentView === 'GENERATE' && "Preview and batch print official marksheets."}
                                {currentView === 'RELEASE' && "Control online visibility of student results."}
                            </p>
                        </div>
                    </div>

                    <main className="min-h-[500px]">
                        {!activeSession ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 animate-pulse">
                                <HiOutlineDatabase className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Initializing Session Context...</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {renderContent()}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default ExamManagementPage;