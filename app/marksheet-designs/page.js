'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { 
    HiOutlineDocumentReport, 
    HiOutlinePlus, 
    HiOutlineSave, 
    HiOutlineTrash, 
    HiOutlineTemplate,
    HiOutlineColorSwatch,
    HiOutlineAdjustments,
    HiOutlineViewGrid,
    HiOutlineSparkles
} from 'react-icons/hi';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const CANVAS_SCALE = 0.62;

const GOOGLE_FONTS = [
    'Inter', 'Poppins', 'Montserrat', 'Raleway', 'Outfit', 
    'Plus Jakarta Sans', 'Playfair Display', 'Cinzel', 'Bebas Neue', 
    'Oswald', 'Space Grotesk', 'DM Sans', 'Manrope'
];

const TABLE_PRESETS = [
    { id: 'smooth-rounded', name: 'Rounded Smooth' },
    { id: 'clean-rectangle', name: 'Clean Sharp Rectangle' },
    { id: 'modern-minimal', name: 'Modern Minimal' },
    { id: 'classic-academic', name: 'Classic Academic Formal' },
    { id: 'bordered-grid', name: 'All-Borders Grid' },
    { id: 'striped-corporate', name: 'Zebra Striped Rows' }
];

const STUDENT_CARD_PRESETS = [
    { id: 'split-rounded', name: 'Smooth Rounded Card' },
    { id: 'card-rectangle', name: 'Sharp Clean Rectangle' },
    { id: 'minimal-underline', name: 'Minimal Underline List' },
    { id: 'badge-outline', name: 'Outlined Thick Accent' },
    { id: 'compact-table', name: 'Two-Column Grid Box' }
];

const DEFAULT_TEMPLATES = {
    modern_standard: {
        name: 'Modern Standard Campus',
        category: 'Modern',
        fontFamily: 'Inter',
        primaryColor: '#059669',
        headerBg: '#0F172A',
        headerTextColor: '#FFFFFF',
        accentBar: true,
        showWatermark: true,
        watermarkOpacity: 6,
        borderStyle: 'border-slate-300',
        tablePreset: 'smooth-rounded',
        studentCardPreset: 'split-rounded',
        tableHeaderBg: '#0F172A',
        tableHeaderTextColor: '#FFFFFF',
        summaryCardBg: '#F8FAFC',
        sig1: 'Class Teacher',
        sig2: 'Parent / Guardian',
        sig3: 'Principal Signature',
        schoolLogoUrl: 'https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png'
    },
    classic_formal: {
        name: 'Classic Board Edition',
        category: 'Formal',
        fontFamily: 'Playfair Display',
        primaryColor: '#1E3A8A',
        headerBg: '#172554',
        headerTextColor: '#FFFFFF',
        accentBar: false,
        showWatermark: true,
        watermarkOpacity: 8,
        borderStyle: 'border-2 border-slate-900',
        tablePreset: 'classic-academic',
        studentCardPreset: 'card-rectangle',
        tableHeaderBg: '#172554',
        tableHeaderTextColor: '#FFFFFF',
        summaryCardBg: '#EFF6FF',
        sig1: 'Class Teacher',
        sig2: 'Parent / Guardian',
        sig3: 'Headmaster / Principal',
        schoolLogoUrl: 'https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png'
    }
};

const DEMO_STUDENT = {
    name: 'Rahul Sharma',
    srNo: 'SR-2026-08',
    grade: '10',
    section: 'A',
    rollNumber: '14',
    fatherName: 'Mr. Manoj Sharma',
    motherName: 'Mrs. Sunita Sharma',
    dob: '12-05-2010'
};

const DEMO_SUBJECTS = [
    { name: 'English', half: 88, annual: 92, max: 100 },
    { name: 'Mathematics', half: 94, annual: 98, max: 100 },
    { name: 'Science', half: 91, annual: 95, max: 100 },
    { name: 'Social Studies', half: 85, annual: 90, max: 100 },
    { name: 'Hindi', half: 89, annual: 93, max: 100 }
];

export default function MarksheetDesignsStudio() {
    const [templates, setTemplates] = useState({});
    const [activeKey, setActiveKey] = useState('modern_standard');
    const [currentConfig, setCurrentConfig] = useState(DEFAULT_TEMPLATES.modern_standard);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Inject Google Fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/\s+/g, '+')).join('&family=')}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => {
            if (document.head.contains(link)) document.head.removeChild(link);
        };
    }, []);

    // Load templates from Firestore app_assets/marksheets
    useEffect(() => {
        async function fetchTemplates() {
            try {
                const snap = await getDoc(doc(db, 'app_assets', 'marksheets'));
                if (snap.exists() && Object.keys(snap.data()).length > 0) {
                    const data = snap.data();
                    setTemplates(data);
                    const first = Object.keys(data)[0];
                    setActiveKey(first);
                    setCurrentConfig({ templateKey: first, ...data[first] });
                } else {
                    await setDoc(doc(db, 'app_assets', 'marksheets'), DEFAULT_TEMPLATES, { merge: true });
                    setTemplates(DEFAULT_TEMPLATES);
                    setActiveKey('modern_standard');
                    setCurrentConfig({ templateKey: 'modern_standard', ...DEFAULT_TEMPLATES.modern_standard });
                }
            } catch (err) {
                console.error('Error reading marksheets:', err);
                setTemplates(DEFAULT_TEMPLATES);
                setCurrentConfig({ templateKey: 'modern_standard', ...DEFAULT_TEMPLATES.modern_standard });
            } finally {
                setLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    const selectTemplate = (key) => {
        setActiveKey(key);
        setCurrentConfig({ templateKey: key, ...templates[key] });
    };

    const handleCreateNew = () => {
        const newKey = 'marksheet_' + Date.now().toString().slice(-4);
        const blank = {
            templateKey: newKey,
            name: 'New Custom Template ' + (Object.keys(templates).length + 1),
            category: 'Modern',
            fontFamily: 'Inter',
            primaryColor: '#2563EB',
            headerBg: '#0F172A',
            headerTextColor: '#FFFFFF',
            accentBar: true,
            showWatermark: true,
            watermarkOpacity: 6,
            borderStyle: 'border-slate-300',
            tablePreset: 'smooth-rounded',
            studentCardPreset: 'split-rounded',
            tableHeaderBg: '#0F172A',
            tableHeaderTextColor: '#FFFFFF',
            summaryCardBg: '#F8FAFC',
            sig1: 'Class Teacher',
            sig2: 'Parent / Guardian',
            sig3: 'Principal Signature',
            schoolLogoUrl: 'https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png'
        };
        setActiveKey(newKey);
        setCurrentConfig(blank);
    };

    const handleSaveToFirestore = async () => {
        if (!currentConfig.templateKey) return;
        setSaving(true);
        try {
            const { templateKey, ...payload } = currentConfig;
            const ref = doc(db, 'app_assets', 'marksheets');

            await setDoc(ref, {
                [templateKey]: payload
            }, { merge: true });

            setTemplates(prev => ({
                ...prev,
                [templateKey]: payload
            }));
            alert(`Template "${payload.name}" updated successfully in Firestore!`);
        } catch (err) {
            console.error('Save error:', err);
            alert('Error saving marksheet template: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTemplate = async (key) => {
        if (!confirm(`Are you sure you want to delete "${templates[key]?.name || key}"?`)) return;
        try {
            const ref = doc(db, 'app_assets', 'marksheets');
            await setDoc(ref, { [key]: deleteField() }, { merge: true });

            const copy = { ...templates };
            delete copy[key];
            setTemplates(copy);

            const remaining = Object.keys(copy);
            if (remaining.length > 0) {
                selectTemplate(remaining[0]);
            }
        } catch (e) {
            console.error('Delete error:', e);
            alert('Failed to delete template.');
        }
    };

    const updateConfig = (field, val) => {
        setCurrentConfig(prev => ({ ...prev, [field]: val }));
    };

    // Calculate dynamic division from total percentage
    const totalMax = DEMO_SUBJECTS.reduce((acc, curr) => acc + (curr.max * 2), 0);
    const totalObt = DEMO_SUBJECTS.reduce((acc, curr) => acc + curr.half + curr.annual, 0);
    const percentage = ((totalObt / totalMax) * 100).toFixed(1);

    const calculateDivision = (pct) => {
        if (pct >= 60) return '1st Division';
        if (pct >= 45) return '2nd Division';
        if (pct >= 33) return '3rd Division';
        return 'Needs Improvement';
    };

    const calculateGrade = (pct) => {
        if (pct >= 91) return 'A1';
        if (pct >= 81) return 'A2';
        if (pct >= 71) return 'B1';
        if (pct >= 61) return 'B2';
        if (pct >= 51) return 'C1';
        if (pct >= 41) return 'C2';
        if (pct >= 33) return 'D';
        return 'E';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">
                Loading Marksheet Studio...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F6F8] p-4 lg:p-8 font-sans text-slate-800">
            <div className="max-w-[1750px] mx-auto space-y-6">
                
                {/* Header Navbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                            <HiOutlineDocumentReport size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marksheet Design Architect</h1>
                            <p className="text-xs text-slate-400 font-medium">Configure table formats, student card presets, watermark crests, and automated grading</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCreateNew}
                            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <HiOutlinePlus size={16} /> New Preset
                        </button>
                        <button
                            onClick={handleSaveToFirestore}
                            disabled={saving}
                            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
                        >
                            <HiOutlineSave size={16} /> {saving ? 'Saving...' : 'Save Design'}
                        </button>
                    </div>
                </div>

                {/* Studio Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Panel: Available Layouts (3 Cols) */}
                    <div className="lg:col-span-3 bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100">
                            Saved Layouts ({Object.keys(templates).length})
                        </span>

                        <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
                            {Object.entries(templates).map(([key, t]) => (
                                <div
                                    key={key}
                                    onClick={() => selectTemplate(key)}
                                    className={`p-4 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between ${
                                        activeKey === key 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' 
                                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <div>
                                        <h4 className="text-xs font-black truncate">{t.name || key}</h4>
                                        <p className="text-[10px] font-mono text-slate-400 truncate">{key}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span 
                                                className="w-3.5 h-3.5 rounded-full border border-black/10" 
                                                style={{ backgroundColor: t.primaryColor || '#059669' }} 
                                            />
                                            <span className="text-[9px] font-bold uppercase text-slate-500">{t.fontFamily || 'Inter'}</span>
                                        </div>
                                    </div>
                                    {Object.keys(templates).length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(key); }}
                                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                        >
                                            <HiOutlineTrash size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center Panel: Real A4 Canvas Preview (6 Cols) */}
                    <div className="lg:col-span-6 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4 overflow-hidden">
                        <div className="w-full flex items-center justify-between px-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Scaled A4 Preview (210mm × 297mm)
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-500">
                                Scale: {(CANVAS_SCALE * 100).toFixed(0)}%
                            </span>
                        </div>

                        {/* Interactive A4 Sheet */}
                        <div className="w-full overflow-hidden flex justify-center bg-slate-100/70 rounded-2xl p-4 border border-slate-200">
                            <div 
                                className={`relative bg-white p-[8mm] flex flex-col h-full border ${currentConfig.borderStyle || 'border-slate-300'} shadow-2xl rounded-xs overflow-hidden`}
                                style={{ 
                                    width: A4_WIDTH * CANVAS_SCALE, 
                                    minHeight: A4_HEIGHT * CANVAS_SCALE, 
                                    boxSizing: 'border-box',
                                    fontFamily: currentConfig.fontFamily || 'Inter'
                                }}
                            >
                                {/* Accent Bar */}
                                {currentConfig.accentBar && (
                                    <div 
                                        className="absolute top-0 left-0 right-0 h-1.5"
                                        style={{ backgroundColor: currentConfig.primaryColor || '#059669' }} 
                                    />
                                )}

                                {/* Background School Watermark */}
                                {currentConfig.showWatermark && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                        <img 
                                            src={currentConfig.schoolLogoUrl}
                                            alt="School Crest Watermark"
                                            className="w-80 h-80 object-contain grayscale select-none"
                                            style={{ opacity: (currentConfig.watermarkOpacity || 6) / 100 }}
                                        />
                                    </div>
                                )}

                                {/* 1. Header Section */}
                                <div className="relative z-10 flex items-center justify-between border-b border-slate-200 pb-3 pt-1 mb-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={currentConfig.schoolLogoUrl} 
                                            alt="Logo" 
                                            className="w-12 h-12 object-contain" 
                                        />
                                        <div>
                                            <h2 className="text-[16pt] font-black text-slate-900 tracking-tight leading-none uppercase">
                                                Edmiro International Academy
                                            </h2>
                                            <p className="text-[7.5px] font-semibold text-slate-500 uppercase mt-1 tracking-wider">
                                                Pratap Nagar, Jaipur • Contact: +91 98765 43210
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span 
                                            className="inline-block px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full border"
                                            style={{ 
                                                color: currentConfig.primaryColor || '#059669', 
                                                borderColor: `${currentConfig.primaryColor || '#059669'}40`,
                                                backgroundColor: `${currentConfig.primaryColor || '#059669'}10`
                                            }}
                                        >
                                            Session 2026-27
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Student Details Section (Configurable Presets) */}
                                <div className={`relative z-10 mb-4 p-3.5 ${
                                    currentConfig.studentCardPreset === 'split-rounded' ? 'rounded-2xl border border-slate-200 bg-slate-50/70 shadow-xs' :
                                    currentConfig.studentCardPreset === 'card-rectangle' ? 'border-2 border-slate-800 bg-white' :
                                    currentConfig.studentCardPreset === 'minimal-underline' ? 'border-b-2 border-slate-300 pb-3 bg-transparent' :
                                    currentConfig.studentCardPreset === 'badge-outline' ? 'rounded-xl border-2 border-indigo-200 bg-indigo-50/20' :
                                    'border border-slate-300 bg-slate-50/30'
                                }`}>
                                    <div className="grid grid-cols-[75px_1fr] gap-3">
                                        <div className="w-[70px] h-[85px] bg-white border border-slate-200 flex items-center justify-center rounded-lg text-[7.5px] font-bold text-slate-400 uppercase">
                                            Photo
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 self-center">
                                            {[
                                                { label: "Student Name", value: DEMO_STUDENT.name, bold: true },
                                                { label: "SR. Number", value: DEMO_STUDENT.srNo },
                                                { label: "Father's Name", value: DEMO_STUDENT.fatherName },
                                                { label: "Mother's Name", value: DEMO_STUDENT.motherName },
                                                { label: "Class & Section", value: `${DEMO_STUDENT.grade} - ${DEMO_STUDENT.section}` },
                                                { label: "Roll Number", value: DEMO_STUDENT.rollNumber },
                                                { label: "Date of Birth", value: DEMO_STUDENT.dob },
                                                { label: "Result Status", value: 'PASSED', bold: true, color: 'text-emerald-700' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between items-center border-b border-slate-200/50 pb-0.5">
                                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                                                    <span className={`text-[8px] uppercase ${item.bold ? 'font-black' : 'font-semibold'} ${item.color || 'text-slate-800'}`}>
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Marks Table Section (Configurable Presets) */}
                                <div className={`relative z-10 mb-4 overflow-hidden ${
                                    currentConfig.tablePreset === 'smooth-rounded' ? 'rounded-xl border border-slate-300 bg-white' :
                                    currentConfig.tablePreset === 'clean-rectangle' ? 'border border-slate-900 bg-white' :
                                    currentConfig.tablePreset === 'modern-minimal' ? 'border-b border-slate-200 bg-white' :
                                    currentConfig.tablePreset === 'bordered-grid' ? 'border-2 border-slate-400 bg-white' :
                                    'border border-slate-300 bg-white'
                                }`}>
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr style={{ backgroundColor: currentConfig.tableHeaderBg || '#0F172A', color: currentConfig.tableHeaderTextColor || '#FFFFFF' }} className="text-[7.5px] font-bold uppercase tracking-wider">
                                                <th className="p-2 text-left border-r border-slate-700" rowSpan="2">Subject Name</th>
                                                <th className="p-2 text-center border-r border-slate-700" colSpan="2">Half Yearly</th>
                                                <th className="p-2 text-center border-r border-slate-700" colSpan="2">Annual Exam</th>
                                                <th className="p-2 text-center text-white" style={{ backgroundColor: currentConfig.primaryColor || '#059669' }} rowSpan="2">Total Marks</th>
                                            </tr>
                                            <tr className="bg-slate-100 text-[6.5px] font-bold uppercase text-slate-600 border-b border-slate-300">
                                                <th className="p-1 border-r border-slate-200">Max</th>
                                                <th className="p-1 border-r border-slate-300">Obt</th>
                                                <th className="p-1 border-r border-slate-200">Max</th>
                                                <th className="p-1 border-r border-slate-300">Obt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {DEMO_SUBJECTS.map((sub, i) => {
                                                const total = sub.half + sub.annual;
                                                const isStriped = currentConfig.tablePreset === 'striped-corporate' && i % 2 === 1;

                                                return (
                                                    <tr key={i} className={`border-b border-slate-100 text-[8px] ${isStriped ? 'bg-slate-50/70' : ''}`}>
                                                        <td className="p-1.5 px-3 text-left border-r border-slate-200 font-bold text-slate-800">{sub.name}</td>
                                                        <td className="p-1.5 text-center border-r border-slate-200 text-slate-400">{sub.max}</td>
                                                        <td className="p-1.5 text-center border-r border-slate-200 font-semibold text-slate-800">{sub.half}</td>
                                                        <td className="p-1.5 text-center border-r border-slate-200 text-slate-400">{sub.max}</td>
                                                        <td className="p-1.5 text-center border-r border-slate-200 font-semibold text-slate-800">{sub.annual}</td>
                                                        <td className="p-1.5 text-center font-bold" style={{ backgroundColor: `${currentConfig.primaryColor || '#059669'}10`, color: currentConfig.primaryColor || '#059669' }}>
                                                            {total}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 4. Five Score & KPI Blocks (Including Real Division & Blank Manual Attendance) */}
                                <div className="relative z-10 grid grid-cols-5 gap-2 mb-4">
                                    {/* Grand Total */}
                                    <div className="p-2 rounded-xl border border-slate-200 text-center" style={{ backgroundColor: currentConfig.summaryCardBg || '#F8FAFC' }}>
                                        <span className="text-[6.5px] font-bold uppercase text-slate-400 tracking-wider block mb-0.5">Grand Total</span>
                                        <div className="text-xs font-black text-slate-800">{totalObt} / {totalMax}</div>
                                    </div>

                                    {/* Percentage */}
                                    <div 
                                        className="p-2 rounded-xl border text-center"
                                        style={{ 
                                            borderColor: currentConfig.primaryColor || '#059669', 
                                            backgroundColor: `${currentConfig.primaryColor || '#059669'}12` 
                                        }}
                                    >
                                        <span className="text-[6.5px] font-bold uppercase text-slate-500 tracking-wider block mb-0.5">Percentage</span>
                                        <div className="text-xs font-black" style={{ color: currentConfig.primaryColor || '#059669' }}>
                                            {percentage}%
                                        </div>
                                    </div>

                                    {/* Real Division */}
                                    <div className="p-2 rounded-xl border border-slate-200 text-center" style={{ backgroundColor: currentConfig.summaryCardBg || '#F8FAFC' }}>
                                        <span className="text-[6.5px] font-bold uppercase text-slate-400 tracking-wider block mb-0.5">Division</span>
                                        <div className="text-xs font-black text-slate-800">{calculateDivision(percentage)}</div>
                                    </div>

                                    {/* Grade */}
                                    <div className="p-2 rounded-xl border border-slate-200 text-center" style={{ backgroundColor: currentConfig.summaryCardBg || '#F8FAFC' }}>
                                        <span className="text-[6.5px] font-bold uppercase text-slate-400 tracking-wider block mb-0.5">Overall Grade</span>
                                        <div className="text-xs font-black text-slate-800">{calculateGrade(percentage)}</div>
                                    </div>

                                    {/* Attendance (Blank for Pen Filling) */}
                                    <div className="p-2 rounded-xl border border-dashed border-slate-300 text-center bg-slate-50/50">
                                        <span className="text-[6.5px] font-bold uppercase text-slate-400 tracking-wider block mb-0.5">Attendance</span>
                                        <div className="text-[8.5px] font-mono font-bold text-slate-600 mt-1">
                                            _____ / _____
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Blank Teacher Remarks Box */}
                                <div className="relative z-10 mb-5">
                                    <p className="text-[7.5px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                                        Class Teacher's Remarks (Fill by Hand):
                                    </p>
                                    <div className="border border-slate-200 h-[38px] rounded-xl bg-slate-50/40" />
                                </div>

                                {/* 6. Bottom Three Signatures */}
                                <div className="relative z-10 mt-auto grid grid-cols-3 gap-6 text-center pt-2">
                                    <div className="pt-2 border-t border-slate-300">
                                        <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wider">{currentConfig.sig1 || 'Class Teacher'}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-300">
                                        <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wider">{currentConfig.sig2 || 'Parent / Guardian'}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-300">
                                        <p className="text-[7.5px] font-bold text-slate-600 uppercase tracking-wider">{currentConfig.sig3 || 'Principal Signature'}</p>
                                    </div>
                                </div>

                                {/* Document Footer */}
                                <div className="relative z-10 flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[7px] text-slate-400 font-medium">
                                    <span>Official Academic Record • Edmiro Platform</span>
                                    <span>Date of Issue: ____________________</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Customization Controls (3 Cols) */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-5">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100">
                            Customization Attributes
                        </span>

                        <div className="space-y-4 text-xs font-bold">
                            {/* Template Identifier Key */}
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Template Key (Firestore ID)</label>
                                <input 
                                    type="text"
                                    value={currentConfig.templateKey || ''}
                                    onChange={e => updateConfig('templateKey', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                                />
                            </div>

                            {/* Template Name */}
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Display Title</label>
                                <input 
                                    type="text"
                                    value={currentConfig.name || ''}
                                    onChange={e => updateConfig('name', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                />
                            </div>

                            {/* Marks Table Layout Presets */}
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Marks Table Preset (6 Styles)</label>
                                <select 
                                    value={currentConfig.tablePreset || 'smooth-rounded'}
                                    onChange={e => updateConfig('tablePreset', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                                >
                                    {TABLE_PRESETS.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Student Card Layout Presets */}
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Student Card Preset (5 Styles)</label>
                                <select 
                                    value={currentConfig.studentCardPreset || 'split-rounded'}
                                    onChange={e => updateConfig('studentCardPreset', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                                >
                                    {STUDENT_CARD_PRESETS.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Google Fonts */}
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Google Font</label>
                                <select 
                                    value={currentConfig.fontFamily || 'Inter'}
                                    onChange={e => updateConfig('fontFamily', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs cursor-pointer"
                                >
                                    {GOOGLE_FONTS.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Accent Highlight</label>
                                    <div className="flex items-center gap-1.5">
                                        <input 
                                            type="color"
                                            value={currentConfig.primaryColor || '#059669'}
                                            onChange={e => updateConfig('primaryColor', e.target.value)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            value={currentConfig.primaryColor || '#059669'}
                                            onChange={e => updateConfig('primaryColor', e.target.value)}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Table Header Bg</label>
                                    <div className="flex items-center gap-1.5">
                                        <input 
                                            type="color"
                                            value={currentConfig.tableHeaderBg || '#0F172A'}
                                            onChange={e => updateConfig('tableHeaderBg', e.target.value)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            value={currentConfig.tableHeaderBg || '#0F172A'}
                                            onChange={e => updateConfig('tableHeaderBg', e.target.value)}
                                            className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Watermark Controls */}
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-slate-500">School Crest Watermark</label>
                                    <input 
                                        type="checkbox"
                                        checked={currentConfig.showWatermark ?? true}
                                        onChange={e => updateConfig('showWatermark', e.target.checked)}
                                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                                    />
                                </div>
                                {currentConfig.showWatermark && (
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Watermark Opacity ({currentConfig.watermarkOpacity || 6}%)</label>
                                        <input 
                                            type="range"
                                            min="2"
                                            max="20"
                                            value={currentConfig.watermarkOpacity || 6}
                                            onChange={e => updateConfig('watermarkOpacity', Number(e.target.value))}
                                            className="w-full accent-indigo-600 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Signatures Titles */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="text-[9px] font-bold uppercase text-slate-400 block">Bottom Signatures Labels</label>
                                <input 
                                    type="text"
                                    placeholder="Left Sign"
                                    value={currentConfig.sig1 || ''}
                                    onChange={e => updateConfig('sig1', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                                <input 
                                    type="text"
                                    placeholder="Center Sign"
                                    value={currentConfig.sig2 || ''}
                                    onChange={e => updateConfig('sig2', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                                <input 
                                    type="text"
                                    placeholder="Right Sign"
                                    value={currentConfig.sig3 || ''}
                                    onChange={e => updateConfig('sig3', e.target.value)}
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                />
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}