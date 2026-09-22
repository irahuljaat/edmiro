'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_SCHOOL_LOGO = "https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png";

/**
 * MarksheetTemplateSimple - A strictly black and white formal template.
 * Dynamically fetches school name, logo, address, and contacts.
 */
function MarksheetTemplateSimple({ student, examResults = [], activeSession, resultDate, schoolId: propSchoolId }) {
    
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

    const allSubjectsMap = new Map();
    examResults.forEach(ex => {
        (ex.subjects || []).forEach(sub => {
            const subName = sub.name || sub;
            if (!allSubjectsMap.has(subName)) {
                allSubjectsMap.set(subName, { name: subName, maxMarks: sub.maxMarks || 100 });
            }
        });
    });
    const subjects = Array.from(allSubjectsMap.values());

    const getMark = (examId, subName, field) => {
        const examObj = examResults.find(e => e.examId === examId);
        if (!examObj || !examObj.marks) return '-';
        
        for (const sKey in examObj.marks) {
            const sMarks = examObj.marks[sKey];
            if (sKey === student.id || sMarks.studentId === student.id) {
                const subMarks = sMarks.subjects?.[subName] || sMarks[subName];
                if (subMarks) {
                    return subMarks[field] !== undefined ? subMarks[field] : (subMarks.marks || '-');
                }
            }
        }
        return '-';
    };

    return (
        <div className="w-[210mm] h-[297mm] mx-auto bg-white text-black p-10 flex flex-col justify-between font-sans box-border border border-black select-none">
            {/* Header Section */}
            <div>
                <div className="flex items-center border-b-2 border-black pb-4 mb-4 gap-4">
                    <img 
                        src={schoolDetails.logoUrl} 
                        alt="School Logo" 
                        className="w-16 h-16 object-contain grayscale" 
                        onError={(e) => { e.target.src = DEFAULT_SCHOOL_LOGO; }}
                    />
                    <div className="text-left">
                        <h1 className="text-2xl font-black uppercase">{schoolDetails.name}</h1>
                        <p className="text-[10px] font-semibold uppercase">{schoolDetails.address} • Ph: {schoolDetails.contact}</p>
                        <p className="text-xs font-bold tracking-widest uppercase mt-0.5">Academic Performance Report & Marksheet</p>
                        <p className="text-[10px] font-semibold">Session: {activeSession || '2026-2027'}</p>
                    </div>
                </div>

                {/* Student Bio Details */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 border border-black p-3 text-xs mb-4">
                    <div><span className="font-bold">Student Name:</span> {student.name || student.studentName || '—'}</div>
                    <div><span className="font-bold">Father's Name:</span> {student.fatherName || '—'}</div>
                    <div><span className="font-bold">Mother's Name:</span> {student.motherName || '—'}</div>
                    <div><span className="font-bold">Class / Grade:</span> {student.grade || student.className || '—'}</div>
                    <div><span className="font-bold">Roll Number:</span> {student.rollNumber || student.rollNo || student.admissionNo || '—'}</div>
                    <div><span className="font-bold">Date of Birth:</span> {student.dob || '—'}</div>
                </div>

                {/* Marks Table */}
                <table className="w-full border-collapse border border-black text-center text-[10px]">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="border-r border-black p-2 text-left font-bold uppercase">Subject</th>
                            {examResults.map(ex => (
                                <th key={ex.examId} className="border-r border-black p-2 font-bold uppercase">
                                    {ex.examName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((sub, idx) => (
                            <tr key={idx} className="border-b border-black">
                                <td className="border-r border-black p-2 text-left font-semibold">{sub.name}</td>
                                {examResults.map(ex => (
                                    <td key={ex.examId} className="border-r border-black p-2">
                                        {getMark(ex.examId, sub.name, 'marks')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Signatures */}
            <div className="pt-8">
                <div className="grid grid-cols-3 gap-8 text-center text-xs mt-12 pt-8">
                    <div className="border-t border-black pt-2 font-bold uppercase">Class Teacher</div>
                    <div className="border-t border-black pt-2 font-bold uppercase">Checked By</div>
                    <div className="border-t border-black pt-2 font-bold uppercase">Principal</div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-semibold mt-8 border-t border-black pt-2">
                    <span>Result Date: {resultDate || '—'}</span>
                    <span>System Generated Marksheet — {schoolDetails.name}</span>
                </div>
            </div>
        </div>
    );
}

export default MarksheetTemplateSimple;