"use client";

import React, { useState, useEffect } from "react";
import {
  HiOutlineOfficeBuilding,
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp,
  HiOutlinePlus,
  HiOutlineChartBar,
  HiX,
  HiOutlineSearch,
  HiOutlineCheckCircle
} from "react-icons/hi";
import { db } from "../firebase/config";
import { collection, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";

export default function CompanyExecutiveDashboard() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);

  // New School Form State
  const [newSchool, setNewSchool] = useState({
    schoolId: "",
    schoolName: "",
    address: "",
    plan: "Growth Campus",
    yearlyPrice: "50000",
    schoolContact1: "",
    schoolMail: ""
  });

  // Calculate SaaS Company Metrics
  const totalSchools = schools.length;
  
  const estimatedYearlyRevenue = schools.reduce((acc, curr) => {
    return acc + Number(curr.yearlyPrice || curr.planPrice || 50000);
  }, 0);

  const actualCollectedRevenue = schools.reduce((acc, curr) => {
    return acc + Number(curr.collectedAmount || curr.yearlyPrice || 50000);
  }, 0);

  // Fetch all schools under Data collection
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const dataColRef = collection(db, "Data");
        const dataDocsSnap = await getDocs(dataColRef);
        
        const schoolList = [];

        for (const schoolDoc of dataDocsSnap.docs) {
          const schoolId = schoolDoc.id;
          let details = { schoolId, schoolName: schoolId.replace(/_/g, " "), yearlyPrice: 50000, plan: "Growth Campus" };

          try {
            const detailsSnap = await getDocs(collection(db, "Data", schoolId, "config"));
            detailsSnap.docs.forEach((cDoc) => {
              if (cDoc.id === "schoolDetails") {
                const dData = cDoc.data();
                details = {
                  ...details,
                  ...dData,
                  schoolName: dData.schoolName || details.schoolName,
                  yearlyPrice: Number(dData.yearlyPrice || dData.planPrice || 50000)
                };
              }
            });
          } catch (e) {
            console.error("Error fetching config for", schoolId, e);
          }

          schoolList.push(details);
        }

        setSchools(schoolList);
      } catch (err) {
        console.error("Error fetching company dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  // Handler to register a new client school branch
  const handleAddSchoolSubmit = async (e) => {
    e.preventDefault();
    if (!newSchool.schoolId || !newSchool.schoolName) {
      alert("Please enter a valid School ID and School Name.");
      return;
    }

    const cleanSchoolId = newSchool.schoolId.trim().toUpperCase().replace(/\s+/g, "_");

    try {
      const schoolDetailsRef = doc(db, "Data", cleanSchoolId, "config", "schoolDetails");
      await setDoc(schoolDetailsRef, {
        schoolName: newSchool.schoolName,
        address: newSchool.address || "Jaipur, Rajasthan",
        plan: newSchool.plan,
        yearlyPrice: Number(newSchool.yearlyPrice || 50000),
        schoolContact1: newSchool.schoolContact1,
        schoolMail: newSchool.schoolMail,
        assignedFeatures: [
          "Students Hub", "Faculty Hub", "Attendance", "Accounts Hub", 
          "Syllabus Hub", "Schedule Hub", "Leave Center", "Reports Hub", 
          "Id Hub", "Class Tests", "Feedbacks", "Website", "Behavior", 
          "Events", "Income & Expense", "Notice", "Gallery", "Home Work"
        ]
      }, { merge: true });

      alert(`School branch '${newSchool.schoolName}' created successfully!`);
      setIsAddSchoolOpen(false);
      
      // Update local state
      setSchools(prev => [...prev, {
        schoolId: cleanSchoolId,
        schoolName: newSchool.schoolName,
        address: newSchool.address,
        plan: newSchool.plan,
        yearlyPrice: Number(newSchool.yearlyPrice || 50000)
      }]);

      setNewSchool({
        schoolId: "",
        schoolName: "",
        address: "",
        plan: "Growth Campus",
        yearlyPrice: "50000",
        schoolContact1: "",
        schoolMail: ""
      });
    } catch (err) {
      console.error("Error adding school:", err);
      alert("Failed to create school branch.");
    }
  };

  const filteredSchools = schools.filter(s => 
    s.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.schoolId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 bg-[#F4F6F8]">
        Loading SaaS Executive Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[28px] shadow-sm border border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Company Management Center</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">SaaS Executive Dashboard</h1>
          </div>

          <button
            onClick={() => setIsAddSchoolOpen(true)}
            className="bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <HiOutlinePlus size={20} />
            <span>Add School Branch</span>
          </button>
        </div>

        {/* Financial & Subscription KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Subscriptions */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active School Subscriptions</p>
              <h2 className="text-3xl font-black text-slate-900">{totalSchools} <span className="text-xs font-semibold text-slate-400">Schools</span></h2>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <HiOutlineOfficeBuilding size={28} />
            </div>
          </div>

          {/* Estimated Yearly Revenue */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Estimated Yearly Revenue (ARR)</p>
              <h2 className="text-3xl font-black text-slate-900">₹ {estimatedYearlyRevenue.toLocaleString("en-IN")}</h2>
            </div>
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <HiOutlineTrendingUp size={28} />
            </div>
          </div>

          {/* Actual Revenue Collected */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Actual Collected Revenue</p>
              <h2 className="text-3xl font-black text-emerald-700">₹ {actualCollectedRevenue.toLocaleString("en-IN")}</h2>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <HiOutlineCurrencyRupee size={28} />
            </div>
          </div>

        </div>

        {/* Client Schools Table */}
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Client School Accounts</h2>
              <p className="text-xs text-slate-400 font-medium">Manage all client schools and subscription plans</p>
            </div>

            <div className="relative w-full sm:w-72">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-10 pr-4 py-3 outline-none focus:border-slate-400 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">School ID</th>
                  <th className="py-3 px-4">School Name</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Yearly Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredSchools.map((s) => (
                  <tr key={s.schoolId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-indigo-600">{s.schoolId}</td>
                    <td className="py-3.5 px-4 text-slate-900 font-extrabold">{s.schoolName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase">
                        {s.plan || "Growth Campus"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900">₹ {Number(s.yearlyPrice || 50000).toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                        <HiOutlineCheckCircle /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ADD SCHOOL MODAL */}
      {isAddSchoolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 relative border border-slate-100">
            <button
              onClick={() => setIsAddSchoolOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <HiX size={20} />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900">Add New School Account</h3>
              <p className="text-xs text-slate-500 font-medium">Create a new client school branch in Firestore</p>
            </div>

            <form onSubmit={handleAddSchoolSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">School ID (Unique Key)</label>
                <input
                  type="text"
                  placeholder="e.g. JAIPUR_BRANCH_02"
                  value={newSchool.schoolId}
                  onChange={(e) => setNewSchool({ ...newSchool, schoolId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">School Name</label>
                <input
                  type="text"
                  placeholder="e.g. St. Xavier Public School"
                  value={newSchool.schoolName}
                  onChange={(e) => setNewSchool({ ...newSchool, schoolName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Subscription Plan</label>
                  <select
                    value={newSchool.plan}
                    onChange={(e) => setNewSchool({ ...newSchool, plan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="Starter Campus">Starter Campus</option>
                    <option value="Growth Campus">Growth Campus</option>
                    <option value="Enterprise SaaS">Enterprise SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Yearly Price (₹)</label>
                  <input
                    type="number"
                    value={newSchool.yearlyPrice}
                    onChange={(e) => setNewSchool({ ...newSchool, yearlyPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer mt-2"
              >
                Register School
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}