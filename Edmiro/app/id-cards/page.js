'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
    HiOutlineIdentification, 
    HiOutlinePrinter, 
    HiOutlineSearch, 
    HiOutlineUserGroup,
    HiOutlineColorSwatch,
    HiOutlineCheckCircle,
    HiOutlineUser,
    HiOutlineAcademicCap,
    HiOutlinePhone,
    HiOutlineLocationMarker
} from 'react-icons/hi';
import { useColors } from '../components/ColorComponent';

const DEFAULT_LOGO = "https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png";

// ─── ID CARD DESIGNS ──────────────────────────────────────────────────────────

// Design 1: Classic Vertical Badge
function DesignClassic({ student, school, primaryColor }) {
    return (
        <div className="id-card w-[2.125in] h-[3.375in] bg-white border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm relative text-slate-800">
            {/* Header */}
            <div className="p-2 text-center text-white flex flex-col items-center justify-center gap-1" style={{ backgroundColor: primaryColor }}>
                <img src={school.logoUrl} alt="Logo" className="w-7 h-7 object-contain bg-white rounded-full p-0.5 shadow-sm" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-1">{school.name}</h3>
                    <p className="text-[6.5px] opacity-90 font-medium line-clamp-1">{school.address}</p>
                </div>
            </div>

            {/* Photo & Badge */}
            <div className="flex flex-col items-center mt-2">
                <div className="w-16 h-20 border-2 rounded-md overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm" style={{ borderColor: primaryColor }}>
                    {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        <HiOutlineUser className="w-8 h-8 text-slate-300" />
                    )}
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest text-white shadow-xs" style={{ backgroundColor: primaryColor }}>
                    STUDENT
                </span>
            </div>

            {/* Body Info */}
            <div className="px-3 py-1 text-[8px] space-y-0.5 font-semibold text-slate-700">
                <p className="text-center font-black text-[10px] text-slate-900 uppercase truncate">{student.name}</p>
                <div className="border-t border-slate-100 pt-1 space-y-0.5">
                    <p><span className="text-slate-400 font-bold uppercase text-[7px]">Class:</span> {student.grade}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[7px]">Roll No:</span> {student.rollNumber || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[7px]">Father:</span> {student.fatherName || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[7px]">DOB:</span> {student.dob || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[7px]">Contact:</span> {student.contact || 'N/A'}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 text-white text-[6.5px] py-1 text-center font-bold uppercase tracking-wider">
                Emergency Contact: {school.contact}
            </div>
        </div>
    );
}

// Design 2: Modern Minimal Vertical
function DesignModern({ student, school, primaryColor }) {
    return (
        <div className="id-card w-[2.125in] h-[3.375in] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm relative text-slate-800">
            <div className="h-16 w-full absolute top-0 left-0" style={{ backgroundColor: primaryColor, opacity: 0.15 }}></div>
            
            {/* Header */}
            <div className="p-3 relative z-10 flex items-center gap-2">
                <img src={school.logoUrl} alt="Logo" className="w-8 h-8 object-contain bg-white rounded-lg p-1 shadow-sm border border-slate-100" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
                <div className="min-w-0 flex-1">
                    <h3 className="text-[8.5px] font-black text-slate-900 uppercase tracking-tight truncate">{school.name}</h3>
                    <p className="text-[6px] text-slate-500 font-bold uppercase tracking-widest">{school.session || '2026-27'}</p>
                </div>
            </div>

            {/* Avatar & Name */}
            <div className="flex flex-col items-center px-3 relative z-10">
                <div className="w-18 h-22 rounded-xl overflow-hidden bg-white border-2 p-0.5 shadow-md" style={{ borderColor: primaryColor }}>
                    {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <HiOutlineUser className="w-8 h-8 text-slate-300" />
                        </div>
                    )}
                </div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight mt-1 text-center truncate w-full">{student.name}</h4>
                <p className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 mt-0.5">
                    Class {student.grade}
                </p>
            </div>

            {/* Info Grid */}
            <div className="px-4 py-1 text-[7.5px] grid grid-cols-2 gap-1 font-bold text-slate-600">
                <div>
                    <span className="text-[6px] text-slate-400 block uppercase">Roll Number</span>
                    <span>{student.rollNumber || 'N/A'}</span>
                </div>
                <div>
                    <span className="text-[6px] text-slate-400 block uppercase">SR Number</span>
                    <span>{student.srNo || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                    <span className="text-[6px] text-slate-400 block uppercase">Father's Name</span>
                    <span className="truncate block">{student.fatherName || 'N/A'}</span>
                </div>
            </div>

            {/* Accent Footer */}
            <div className="p-2 text-center text-white text-[7px] font-extrabold uppercase tracking-widest" style={{ backgroundColor: primaryColor }}>
                Student Identity Card
            </div>
        </div>
    );
}

// Design 3: Corporate Badge
function DesignCorporate({ student, school, primaryColor }) {
    return (
        <div className="id-card w-[2.125in] h-[3.375in] bg-white border-2 border-slate-900 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm relative text-slate-900">
            {/* Top Bar */}
            <div className="bg-slate-900 text-white p-2 text-center flex items-center justify-between">
                <img src={school.logoUrl} alt="Logo" className="w-6 h-6 object-contain bg-white rounded p-0.5" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
                <div className="text-right">
                    <h3 className="text-[8px] font-black uppercase tracking-tight line-clamp-1">{school.name}</h3>
                    <p className="text-[6px] text-slate-300 font-bold uppercase">Identity Card</p>
                </div>
            </div>

            {/* Main Details */}
            <div className="p-2 flex gap-2 items-center">
                <div className="w-16 h-20 border border-slate-900 rounded overflow-hidden bg-slate-100 shrink-0">
                    {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <HiOutlineUser className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5 text-[7.5px] font-semibold">
                    <p className="text-[9px] font-black uppercase text-slate-900 leading-tight line-clamp-1">{student.name}</p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase">Class: <span className="text-slate-900">{student.grade}</span></p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase">Roll: <span className="text-slate-900">{student.rollNumber || 'N/A'}</span></p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase">DOB: <span className="text-slate-900">{student.dob || 'N/A'}</span></p>
                </div>
            </div>

            {/* Address & Parent Info */}
            <div className="px-2 text-[7px] font-medium border-t border-slate-200 pt-1 space-y-0.5 text-slate-700">
                <p><span className="font-bold text-slate-900">Father:</span> {student.fatherName || 'N/A'}</p>
                <p className="line-clamp-1"><span className="font-bold text-slate-900">Contact:</span> {student.contact || 'N/A'}</p>
                <p className="line-clamp-1"><span className="font-bold text-slate-900">Address:</span> {student.address || 'N/A'}</p>
            </div>

            {/* Bottom Strip */}
            <div className="h-3 w-full flex items-center justify-center text-white text-[6px] font-black tracking-widest uppercase" style={{ backgroundColor: primaryColor }}>
                Authorized Signature
            </div>
        </div>
    );
}

// Design 4: Dark Premium
function DesignDark({ student, school, primaryColor }) {
    return (
        <div className="id-card w-[2.125in] h-[3.375in] bg-slate-900 text-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-md relative border border-slate-800">
            {/* Accent Line */}
            <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }}></div>

            <div className="p-3 text-center space-y-1">
                <img src={school.logoUrl} alt="Logo" className="w-7 h-7 object-contain mx-auto" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
                <h3 className="text-[8.5px] font-black uppercase tracking-wider text-slate-100 line-clamp-1">{school.name}</h3>
            </div>

            {/* Image */}
            <div className="flex flex-col items-center">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-800 border-2 p-0.5 shadow-lg" style={{ borderColor: primaryColor }}>
                    {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <HiOutlineUser className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-tight text-white mt-1.5 px-2 text-center truncate w-full">{student.name}</h4>
                <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Class {student.grade}</p>
            </div>

            {/* Detailed Table */}
            <div className="px-3 text-[7px] font-semibold text-slate-300 space-y-0.5">
                <div className="flex justify-between border-b border-slate-800 pb-0.5">
                    <span className="text-slate-500 uppercase">Roll No</span>
                    <span className="text-slate-100 font-bold">{student.rollNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-0.5">
                    <span className="text-slate-500 uppercase">Father</span>
                    <span className="text-slate-100 font-bold truncate max-w-[90px]">{student.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 uppercase">Contact</span>
                    <span className="text-slate-100 font-bold">{student.contact || 'N/A'}</span>
                </div>
            </div>

            <div className="bg-slate-950 py-1 text-center text-[6px] text-slate-400 font-bold uppercase tracking-widest">
                Pass & Identity Record
            </div>
        </div>
    );
}

// Design 5: Horizontal Compact Badge
function DesignHorizontal({ student, school, primaryColor }) {
    return (
        <div className="id-card w-[3.375in] h-[2.125in] bg-white border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm relative text-slate-800 p-2.5">
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                    <img src={school.logoUrl} alt="Logo" className="w-6 h-6 object-contain" onError={(e) => { e.target.src = DEFAULT_LOGO; }} />
                    <div>
                        <h3 className="text-[8.5px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">{school.name}</h3>
                        <p className="text-[6px] text-slate-400 font-bold uppercase">{school.address}</p>
                    </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[6.5px] font-black text-white uppercase" style={{ backgroundColor: primaryColor }}>
                    Class {student.grade}
                </span>
            </div>

            {/* Middle Grid */}
            <div className="flex items-center gap-3 my-auto">
                <div className="w-14 h-18 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <HiOutlineUser className="w-6 h-6" />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1 text-[7.5px] space-y-0.5 font-semibold text-slate-700">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase truncate">{student.name}</h4>
                    <p><span className="text-slate-400 font-bold uppercase text-[6.5px]">Father:</span> {student.fatherName || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[6.5px]">Roll No:</span> {student.rollNumber || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[6.5px]">DOB:</span> {student.dob || 'N/A'}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[6.5px]">Phone:</span> {student.contact || 'N/A'}</p>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-slate-100 pt-1 flex justify-between items-center text-[6px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Student ID: {student.id.slice(-6).toUpperCase()}</span>
                <span>Principal Sign</span>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function IdCardsGeneratorPage({ schoolId: propSchoolId }) {
    const colors = useColors();
    const primaryColor = colors.primary || '#ffc107';

    const [currentSchoolId, setCurrentSchoolId] = useState(propSchoolId || 'TEST_EDMIRO_ACADEMY');
    const [activeSession, setActiveSession] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('ALL');
    const [students, setStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [selectedDesign, setSelectedTemplate] = useState('classic'); // 'classic', 'modern', 'corporate', 'dark', 'horizontal'
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [schoolDetails, setSchoolDetails] = useState({
        name: 'Edmiro Test Academy',
        address: 'Jaipur, Rajasthan',
        contact: '9876543210',
        logoUrl: DEFAULT_LOGO,
        session: '2026-27'
    });

    // Initialize school context from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedSchoolId = localStorage.getItem('currentSchoolId');
            if (storedSchoolId && !propSchoolId) {
                setCurrentSchoolId(storedSchoolId);
            } else if (propSchoolId) {
                setCurrentSchoolId(propSchoolId);
            }
        }
    }, [propSchoolId]);

    // Fetch School Details & Active Session
    useEffect(() => {
        const fetchSchoolDetailsAndSettings = async () => {
            if (!currentSchoolId) return;
            try {
                // Fetch School Details
                const schoolDetailsRef = doc(db, 'Data', currentSchoolId, 'config', 'schoolDetails');
                const schoolSnap = await getDoc(schoolDetailsRef);
                if (schoolSnap.exists()) {
                    const sData = schoolSnap.data();
                    const contacts = [sData.schoolContact1, sData.schoolContact2].filter(Boolean).join(', ');
                    setSchoolDetails({
                        name: sData.schoolName || sData.name || 'Edmiro Test Academy',
                        address: sData.address || sData.schoolAddress || 'Jaipur, Rajasthan',
                        contact: contacts || '9876543210',
                        logoUrl: sData.schoolLogo || sData.logoUrl || DEFAULT_LOGO,
                        session: activeSession || '2026-27'
                    });
                }

                // Fetch Settings (Session)
                const settingsRef = doc(db, 'Data', currentSchoolId, 'config', 'settings');
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists()) {
                    const session = settingsSnap.data().activeSession || settingsSnap.data().session || '2026-27';
                    setActiveSession(session);
                }
            } catch (err) {
                console.error("Error loading config:", err);
            }
        };
        fetchSchoolDetailsAndSettings();
    }, [currentSchoolId, activeSession]);

    // Load Students
    const loadStudents = useCallback(async () => {
        if (!currentSchoolId || !activeSession) return;
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'Data', currentSchoolId, 'sessions', activeSession, 'students'));
            const list = snap.docs.map(d => ({ id: d.id, ...d.data(), name: d.data().name || d.data().studentName || 'Student' }))
                .filter(s => s.grade !== 'PASSED OUT');

            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setStudents(list);

            const uniqueClasses = Array.from(new Set(list.map(s => String(s.grade || 'Unassigned').trim()))).sort();
            setClasses(uniqueClasses);

            // Default select all student IDs
            setSelectedStudentIds(list.map(s => s.id));
        } catch (err) {
            console.error("Error loading students:", err);
        } finally {
            setLoading(false);
        }
    }, [currentSchoolId, activeSession]);

    useEffect(() => { loadStudents(); }, [loadStudents]);

    // Filter Students
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesClass = selectedClass === 'ALL' || String(s.grade || '').trim() === selectedClass;
            const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (s.srNo || '').toString().includes(searchTerm);
            return matchesClass && matchesSearch;
        });
    }, [students, selectedClass, searchTerm]);

    const toggleSelectStudent = (id) => {
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedStudentIds.length === filteredStudents.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filteredStudents.map(s => s.id));
        }
    };

    // Render Template Switcher
    const renderCard = (student) => {
        switch (selectedDesign) {
            case 'modern':
                return <DesignModern student={student} school={schoolDetails} primaryColor={primaryColor} />;
            case 'corporate':
                return <DesignCorporate student={student} school={schoolDetails} primaryColor={primaryColor} />;
            case 'dark':
                return <DesignDark student={student} school={schoolDetails} primaryColor={primaryColor} />;
            case 'horizontal':
                return <DesignHorizontal student={student} school={schoolDetails} primaryColor={primaryColor} />;
            case 'classic':
            default:
                return <DesignClassic student={student} school={schoolDetails} primaryColor={primaryColor} />;
        }
    };

    const printableStudents = students.filter(s => selectedStudentIds.includes(s.id));

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans print:p-0 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-6 no-print">
                
                {/* Header */}
                <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl text-slate-900 shadow-md" style={{ backgroundColor: primaryColor }}>
                            <HiOutlineIdentification size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Student ID Card Studio</h1>
                            <p className="text-xs text-slate-400 font-medium mt-1">Select layouts, filter classes, and batch-print ID cards</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.print()} 
                        disabled={printableStudents.length === 0}
                        className="w-full md:w-auto px-8 py-3.5 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-full shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <HiOutlinePrinter size={18} /> Print Selected ({printableStudents.length})
                    </button>
                </div>

                {/* Configuration Grid */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 space-y-6">
                    
                    {/* Controls Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Design Selector */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">1. Choose Card Design</label>
                            <select 
                                value={selectedDesign} 
                                onChange={e => setSelectedTemplate(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 outline-none cursor-pointer"
                            >
                                <option value="classic">Design 1: Classic Vertical</option>
                                <option value="modern">Design 2: Modern Minimal</option>
                                <option value="corporate">Design 3: Corporate Badge</option>
                                <option value="dark">Design 4: Dark Premium</option>
                                <option value="horizontal">Design 5: Horizontal Compact</option>
                            </select>
                        </div>

                        {/* 2. Class Scope */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">2. Filter Class</label>
                            <select 
                                value={selectedClass} 
                                onChange={e => setSelectedClass(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 outline-none cursor-pointer"
                            >
                                <option value="ALL">All Classes ({students.length})</option>
                                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>

                        {/* 3. Search */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">3. Search Student</label>
                            <div className="relative">
                                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name or SR No..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-xs text-slate-800 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Selection Toggles */}
                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <HiOutlineUserGroup className="text-slate-600" /> Select Students to Print ({selectedStudentIds.length}/{filteredStudents.length})
                            </span>
                            <button 
                                onClick={toggleSelectAll} 
                                className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                                {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                            {filteredStudents.map(s => {
                                const isSelected = selectedStudentIds.includes(s.id);
                                return (
                                    <div 
                                        key={s.id} 
                                        onClick={() => toggleSelectStudent(s.id)}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                            isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="truncate">{s.name}</span>
                                        {isSelected && <HiOutlineCheckCircle className="text-indigo-600 shrink-0 ml-1" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* PRINT & PREVIEW GRID */}
            <div id="print-area" className="mt-8">
                <div className="id-cards-grid max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {printableStudents.map(student => (
                        <div key={student.id} className="id-card-wrapper">
                            {renderCard(student)}
                        </div>
                    ))}
                </div>

                {printableStudents.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[28px] border border-slate-100 no-print max-w-7xl mx-auto">
                        <HiOutlineIdentification className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No students selected for printing</p>
                    </div>
                )}
            </div>

            {/* PRINT CSS */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #F8FAFC; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }

                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body * { visibility: hidden !important; }
                    #print-area, #print-area * { visibility: visible !important; }
                    #print-area { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important; 
                        width: 100% !important; 
                    }
                    .no-print { display: none !important; }
                    .id-cards-grid { 
                        display: grid !important; 
                        grid-template-columns: repeat(3, 1fr) !important; 
                        gap: 15mm 10mm !important; 
                        justify-items: center !important;
                    }
                    .id-card-wrapper { 
                        page-break-inside: avoid !important; 
                        break-inside: avoid !important; 
                    }
                }
            `}</style>
        </div>
    );
}