'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_SCHOOL_LOGO = "https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png";

/**
 * MarksheetTemplateSimple - Formal Academic Template
 * Features low-opacity school watermark, right-aligned student photo,
 * borderless single-line student bio records, scholastic/co-scholastic grading splits,
 * and expanded performance KPI summary boxes.
 */
function MarksheetTemplateSimple({ student = {}, examResults = [], activeSession, resultDate, schoolId: propSchoolId }) {
    
    // Dynamic School Details State
    const [schoolDetails, setSchoolDetails] = useState({
        name: 'Edmiro Test Academy',
        address: 'Jaipur, Rajasthan',
        contact: '9876543210, 9123456789',
        logoUrl: DEFAULT_SCHOOL_LOGO
    });

    const currentSchoolId = propSchoolId || (typeof window !== 'undefined' ? localStorage.getItem('currentSchoolId') : null) || 'TEST_EDMIRO_ACADEMY';

    // Fetch dynamic school details from Data -> {schoolId} -> config -> schoolDetails
    useEffect(() => {
        if (!currentSchoolId) return;

        const schoolDetailsRef = doc(db, 'Data', currentSchoolId, 'config', 'schoolDetails');
        
        const unsubscribe = onSnapshot(schoolDetailsRef, (docSnap) => {
            if (docSnap.exists()) {
                const sData = docSnap.data();

                const contacts = [sData.schoolContact1, sData.schoolContact2]
                    .filter(Boolean)
                    .join(', ');

                setSchoolDetails({
                    name: sData.schoolName || sData.name || 'Edmiro Test Academy',
                    address: sData.address || sData.schoolAddress || 'Jaipur, Rajasthan',
                    contact: contacts || sData.contact || sData.phone || '9876543210',
                    logoUrl: sData.schoolLogo || sData.logoUrl || sData.logo || DEFAULT_SCHOOL_LOGO
                });
            }
        }, (err) => {
            console.error("Error loading school details:", err);
        });

        return () => unsubscribe();
    }, [currentSchoolId]);

    const extractClassFromId = (id) => {
        if (!id) return '—';
        const parts = String(id).split('_');
        return parts.length > 1 ? parts[1] : '—';
    };

    const studentClass = student.grade || student.className || extractClassFromId(student.id);
    const isHigherSecondary = ['11', '12'].includes(String(studentClass));

    // Co-scholastic/graded subjects classification matching the kids template
    const gradingSubjectList = ['G.K', 'GK', 'GENERAL KNOWLEDGE', 'COMPUTER', 'DRAWING', 'ART', 'CRAFT', 'YOGA', 'PHYSICAL EDUCATION'];

    // All distinct subjects across exams
    const allSubjects = Array.from(new Set(
        examResults.flatMap(exam => (exam.subjects || []).map(s => s.name || s))
    )).filter(Boolean);

    // Consolidated subject rows with dynamic mark values
    const consolidatedData = allSubjects.map(subjectName => {
        const row = { subjectName };
        examResults.forEach(exam => {
            const studentMarks = exam.marks?.[student.id] || exam.marks?.[student._id] || exam.marks?.[student.rollNumber] || {};
            let markValue = studentMarks[subjectName] ?? studentMarks.subjects?.[subjectName];
            
            if (markValue === undefined) {
                const caseInsensitiveKey = Object.keys(studentMarks).find(
                    key => key.trim().toLowerCase() === subjectName.trim().toLowerCase()
                );
                markValue = caseInsensitiveKey ? (studentMarks[caseInsensitiveKey]?.marks ?? studentMarks[caseInsensitiveKey]) : '-';
            }
            row[exam.examName] = typeof markValue === 'object' ? (markValue.marks ?? '-') : markValue;
        });
        return row;
    });

    const academicSubjects = isHigherSecondary 
        ? consolidatedData 
        : consolidatedData.filter(row => !gradingSubjectList.includes(row.subjectName.trim().toUpperCase()));

    const gradedSubjects = isHigherSecondary 
        ? [] 
        : consolidatedData.filter(row => gradingSubjectList.includes(row.subjectName.trim().toUpperCase()));

    // Academic Calculations
    let totalObtained = 0;
    let totalMax = 0;

    academicSubjects.forEach(row => {
        examResults.forEach(exam => {
            const subjectConfig = (exam.subjects || []).find(s => (s.name || s) === row.subjectName);
            const maxForPaper = subjectConfig && typeof subjectConfig === 'object' ? parseFloat(subjectConfig.maxMarks || 100) : 100;
            const mark = parseFloat(row[exam.examName]);

            totalMax += maxForPaper;
            if (!isNaN(mark)) totalObtained += mark;
        });
    });

    const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;

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

    return (
        <div className="relative w-[210mm] h-[297mm] mx-auto bg-white text-slate-800 p-10 flex flex-col justify-between font-sans box-border border-2 border-slate-800 select-none shadow-xl print:shadow-none print:border-slate-800 overflow-hidden">
            
            {/* Centered School Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <img 
                    src={schoolDetails.logoUrl} 
                    alt="Watermark" 
                    className="w-[130mm] h-[130mm] object-contain opacity-[0.06] grayscale"
                    onError={(e) => { e.target.src = DEFAULT_SCHOOL_LOGO; }}
                />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10">
                
                {/* Formal School Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4 gap-4">
                    <div className="flex items-center gap-4">
                        <img 
                            src={schoolDetails.logoUrl} 
                            alt="School Logo" 
                            className="w-16 h-16 object-contain" 
                            onError={(e) => { e.target.src = DEFAULT_SCHOOL_LOGO; }}
                        />
                        <div className="text-left">
                            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight leading-none">
                                {schoolDetails.name}
                            </h1>
                            <p className="text-[10px] font-semibold uppercase text-slate-600 mt-1">
                                {schoolDetails.address} • Ph: {schoolDetails.contact}
                            </p>
                            <p className="text-xs font-bold tracking-widest uppercase text-blue-950 mt-0.5">
                                Academic Performance Report & Marksheet
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-black uppercase tracking-widest rounded">
                            Session {activeSession || '2026-2027'}
                        </span>
                    </div>
                </div>

                {/* Vertical Student Profile: Details on the Left, Photo on the Right (No Underlines) */}
                <div className="grid grid-cols-[1fr_120px] gap-6 items-center border border-slate-300 bg-white/90 p-4 mb-4 rounded shadow-2xs">
                    
                    {/* Left: Detail Lines without Underlines */}
                    <div className="space-y-1.5 text-[9.5pt]">
                        {[
                            { label: "Student Full Name", value: student.name || student.studentName || '—', bold: true, color: "text-slate-950 font-black" },
                            { label: "Father's Name", value: student.fatherName || '—' },
                            { label: "Mother's Name", value: student.motherName || '—' },
                            { label: "Class & Section", value: `${studentClass} - ${student.section || 'A'}`, bold: true, color: "text-blue-950 font-black" },
                            { label: "Roll Number", value: student.rollNumber || student.rollNo || student.admissionNo || '—', bold: true },
                            { label: "Scholar / SR Number", value: student.srNo || '—', bold: true },
                            { label: "Date of Birth", value: student.dob || '—' },
                            { label: "Result Status", value: percentage >= 33 ? 'PASSED' : 'DETAINED', bold: true, color: percentage >= 33 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-baseline justify-between py-0.5">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider w-40">
                                    {item.label}:
                                </span>
                                <span className={`flex-1 text-left uppercase text-[9pt] ${item.color || 'text-slate-800'} ${item.bold ? 'font-black' : 'font-semibold'}`}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Right: Student Photo */}
                    <div className="w-[115px] h-[155px] border-2 border-slate-300 bg-slate-50 rounded overflow-hidden flex flex-col items-center justify-center shadow-inner self-center">
                        {student.imageUrl || student.avatar ? (
                            <img 
                                src={student.imageUrl || student.avatar} 
                                alt="Student" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="text-center p-2 text-slate-400">
                                <div className="text-2xl mb-1">👤</div>
                                <span className="text-[7.5px] font-black uppercase tracking-wider block">Student Photo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Marks Table: Scholastic Subjects & Co-Scholastic Grades */}
                <table className="w-full border-collapse border border-slate-300 text-center text-[10px] mb-4 bg-white/95">
                    <thead>
                        <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                            <th className="border border-slate-700 p-2 text-left" rowSpan="2">Subject Name</th>
                            {examResults.map((ex, i) => (
                                <th key={i} className="border border-slate-700 p-2" colSpan="2">
                                    {ex.examName}
                                </th>
                            ))}
                            <th className="border border-slate-700 p-2 bg-blue-950" rowSpan="2">Total Marks</th>
                        </tr>
                        <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] border-b border-slate-300">
                            {examResults.map((_, i) => (
                                <React.Fragment key={i}>
                                    <th className="border border-slate-300 p-1 w-12 text-slate-500">Max</th>
                                    <th className="border border-slate-300 p-1 w-12">Obt</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {academicSubjects.map((row, idx) => {
                            let subTotal = 0;
                            return (
                                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50/60">
                                    <td className="border border-slate-300 p-2 text-left font-bold text-slate-800">{row.subjectName}</td>
                                    {examResults.map((ex, exI) => {
                                        const subConfig = (ex.subjects || []).find(s => (s.name || s) === row.subjectName);
                                        const maxVal = subConfig && typeof subConfig === 'object' ? (subConfig.maxMarks || 100) : 100;
                                        const markVal = row[ex.examName];
                                        const num = parseFloat(markVal);
                                        if (!isNaN(num)) subTotal += num;

                                        return (
                                            <React.Fragment key={exI}>
                                                <td className="border border-slate-300 p-2 text-slate-400 font-semibold">{maxVal}</td>
                                                <td className="border border-slate-300 p-2 font-black text-slate-900">{markVal}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <td className="border border-slate-300 p-2 font-black bg-blue-50/60 text-blue-950">
                                        {subTotal}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Co-Scholastic / Practical Activities Category Bar */}
                        {!isHigherSecondary && gradedSubjects.length > 0 && (
                            <tr className="bg-slate-100">
                                <td colSpan={examResults.length * 2 + 2} className="py-1 px-3 text-[8px] font-black text-slate-700 uppercase tracking-widest text-center border-y border-slate-300">
                                    Co-Scholastic & Practical Activities (Grades)
                                </td>
                            </tr>
                        )}

                        {/* Co-Scholastic Rows Displaying Letter Grades */}
                        {gradedSubjects.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-200 last:border-0 bg-slate-50/30 text-[9.5px]">
                                <td className="border border-slate-300 p-2 text-left font-bold text-slate-700">
                                    {row.subjectName}
                                </td>
                                {examResults.map((ex, exI) => (
                                    <td key={exI} colSpan="2" className="border border-slate-300 p-2 text-center font-black text-teal-800">
                                        {row[ex.examName]}
                                    </td>
                                ))}
                                <td className="border border-slate-300 p-2 text-center font-bold text-slate-400 text-[8px] bg-slate-100">
                                    GRADE
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Taller 5-KPI Performance Summary Boxes */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                    {/* Grand Total */}
                    <div className="h-20 p-3 border-2 border-slate-300 bg-white/95 rounded-lg text-center flex flex-col justify-center shadow-xs">
                        <span className="text-[7.5px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Grand Total</span>
                        <div className="text-sm font-black text-slate-900">{totalObtained} / {totalMax}</div>
                    </div>

                    {/* Percentage */}
                    <div className="h-20 p-3 border-2 border-blue-900 bg-blue-50/95 rounded-lg text-center flex flex-col justify-center shadow-xs">
                        <span className="text-[7.5px] font-bold uppercase text-blue-950 tracking-wider block mb-1">Percentage</span>
                        <div className="text-base font-black text-blue-950">{percentage}%</div>
                    </div>

                    {/* Division */}
                    <div className="h-20 p-3 border-2 border-slate-300 bg-white/95 rounded-lg text-center flex flex-col justify-center shadow-xs">
                        <span className="text-[7.5px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Division</span>
                        <div className="text-xs font-black text-slate-900">{calculateDivision(percentage)}</div>
                    </div>

                    {/* Grade */}
                    <div className="h-20 p-3 border-2 border-slate-300 bg-white/95 rounded-lg text-center flex flex-col justify-center shadow-xs">
                        <span className="text-[7.5px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Overall Grade</span>
                        <div className="text-sm font-black text-slate-900">{calculateGrade(percentage)}</div>
                    </div>

                    {/* Attendance Box for Hand Writing */}
                    <div className="h-20 p-3 border-2 border-dashed border-slate-400 bg-white/95 rounded-lg text-center flex flex-col justify-center shadow-xs">
                        <span className="text-[7.5px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Attendance</span>
                        <div className="text-[10px] font-mono font-bold text-slate-700 tracking-widest">
                             / 
                        </div>
                    </div>
                </div>

                {/* Taller Class Teacher Remarks Box */}
                <div className="mb-2">
                    <p className="text-[8.5px] font-bold uppercase text-slate-600 mb-1.5 tracking-wider">
                        Class Teacher's Remarks :
                    </p>
                    <div className="border border-slate-300 h-10 rounded-lg bg-white/80 p-2.5 flex flex-col justify-around"> </div>
                </div>
            </div>

            {/* Footer / Formal Signatures Section */}
            <div className="">
                <div className="grid grid-cols-3 gap-8 text-center text-xs mt-5">
                    <div className="border-t border-slate-800 pt-1.5 font-bold uppercase tracking-wider text-slate-800">Class Teacher</div>
                    <div className="border-t border-slate-800 pt-1.5 font-bold uppercase tracking-wider text-slate-800">Parent / Guardian</div>
                    <div className="border-t border-slate-800 pt-1.5 font-bold uppercase tracking-wider text-slate-800">Principal Signature</div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-semibold mt-5 pt-2 border-t border-slate-200 text-slate-500">
                    <span>Result Date: {resultDate ? new Date(resultDate).toLocaleDateString('en-GB') : '—'}</span>
                    <span>Official Academic Performance Record • {schoolDetails.name}</span>
                </div>
            </div>
        </div>
    );
}

export default MarksheetTemplateSimple;