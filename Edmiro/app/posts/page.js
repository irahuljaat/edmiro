'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { Download, RefreshCw, Sparkles, LayoutGrid, Copy, CheckCheck, ImageIcon, ChevronRight, Building2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useColors } from '../components/ColorComponent';

export default function PostMakerPage() {
  const colors = useColors();
  const [currentSchoolId, setCurrentSchoolId] = useState('TEST_EDMIRO_ACADEMY');
  const [userRole, setUserRole] = useState('branch');
  const [availableBranches, setAvailableBranches] = useState([]);

  const [templates, setTemplates] = useState({});
  const [schoolData, setSchoolData] = useState(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [caption, setCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const postCanvasRef = useRef(null);

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

  // Fetch available branches for Super Admin
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

  // ─── Dynamic Google Fonts Loader ──────────────────────────────────────────
  useEffect(() => {
    const activeTemplate = selectedTemplateKey ? templates[selectedTemplateKey] : null;
    if (!activeTemplate || !Array.isArray(activeTemplate.elements)) return;
    const fontFamilies = new Set();
    activeTemplate.elements.forEach((el) => {
      if (el.type === 'text' && (el.font || el.fontFamily)) {
        const fontVal = el.font || el.fontFamily;
        const cleanFont = fontVal.split(',')[0].replace(/['"]+/g, '').trim();
        if (cleanFont && !['sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica'].includes(cleanFont)) {
          fontFamilies.add(cleanFont);
        }
      }
    });
    fontFamilies.forEach((font) => {
      const fontId = `gfont-${font.toLowerCase().replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [selectedTemplateKey, templates]);

  // ─── Firestore Fetch Data ──────────────────────────────────────────────────
  const fetchData = useCallback(async (targetSchoolId) => {
    if (!targetSchoolId) return;
    setLoading(true);
    setCaption('');
    try {
      // 1. Fetch School Details from Data -> {schoolId} -> config -> schoolDetails
      const detailsSnap = await getDoc(doc(db, 'Data', targetSchoolId, 'config', 'schoolDetails'));
      if (detailsSnap.exists()) {
        const p = detailsSnap.data();
        setSchoolData({
          schoolName:    p.schoolName    || p.name        || 'MVG PUBLIC SCHOOL',
          schoolLogo:    p.schoolLogo    || p.logoUrl     || '',
          schoolPhone:   p.schoolPhone   || p.phone       || '0141-3152600, 8875646366',
          schoolAddress: p.schoolAddress || p.address     || 'Sheopur, Pratap Nagar, Sanganer, Jaipur',
          schoolEmail:   p.schoolEmail   || p.email       || 'info@mvgschool.com',
          schoolWebsite: p.schoolWebsite || p.website     || 'www.mvgschool.com',
          schoolTagline: p.schoolTagline || p.tagline     || 'Shiksha Bhakti Kartavya',
        });
      } else {
        setSchoolData({
          schoolName: 'MVG PUBLIC SCHOOL',
          schoolLogo: '',
          schoolPhone: '0141-3152600, 8875646366',
          schoolAddress: 'Sheopur, Pratap Nagar, Sanganer, Jaipur',
          schoolEmail: 'info@mvgschool.com',
          schoolWebsite: 'www.mvgschool.com',
          schoolTagline: 'Shiksha Bhakti Kartavya',
        });
      }

      // 2. Fetch Templates directly from schools -> app_assets -> templates
      const templatesSnap = await getDoc(doc(db, 'schools', 'app_assets', 'templates', 'templates'));
      let templatesData = {};

      if (templatesSnap.exists()) {
        templatesData = templatesSnap.data();
      } else {
        // Fallback check if stored directly under doc(db, 'schools', 'app_assets')
        const fallbackSnap = await getDoc(doc(db, 'schools', 'app_assets'));
        if (fallbackSnap.exists()) {
          templatesData = fallbackSnap.data().templates || fallbackSnap.data();
        }
      }

      if (Object.keys(templatesData).length > 0) {
        setTemplates(templatesData);
        setSelectedTemplateKey(Object.keys(templatesData)[0]);
      } else {
        setTemplates({});
        setSelectedTemplateKey(null);
      }

    } catch (err) {
      console.error('Firestore fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentSchoolId);
  }, [currentSchoolId, fetchData]);

  const handleBranchChange = (newSchoolId) => {
    setCurrentSchoolId(newSchoolId);
    localStorage.setItem('currentSchoolId', newSchoolId);
  };

  // ─── Value Resolver ────────────────────────────────────────────────────────
  const resolveValue = (textStr, fieldBinding) => {
    if (!schoolData) return textStr;
    if (fieldBinding && schoolData[fieldBinding] !== undefined) return schoolData[fieldBinding];
    if (typeof textStr !== 'string') return textStr;
    return textStr
      .replace(/\{\{schoolName\}\}/g,    schoolData.schoolName)
      .replace(/\{\{schoolLogo\}\}/g,    schoolData.schoolLogo)
      .replace(/\{\{schoolPhone\}\}/g,   schoolData.schoolPhone)
      .replace(/\{\{schoolAddress\}\}/g, schoolData.schoolAddress)
      .replace(/\{\{schoolEmail\}\}/g,   schoolData.schoolEmail)
      .replace(/\{\{schoolWebsite\}\}/g, schoolData.schoolWebsite)
      .replace(/\{\{schoolTagline\}\}/g, schoolData.schoolTagline)
      .replace(/\{\{logoUrl\}\}/g,       schoolData.schoolLogo);
  };

  // ─── Export ────────────────────────────────────────────────────────────────
  const handleExportPost = async () => {
    if (!activeTemplate) return;
    setIsExporting(true);
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `position:fixed;left:-9999px;top:0;width:${activeTemplate.width||1080}px;height:${activeTemplate.height||1080}px;background:#fff;z-index:99999;`;
      if (postCanvasRef.current) exportContainer.innerHTML = postCanvasRef.current.innerHTML;
      document.body.appendChild(exportContainer);
      const canvas = await html2canvas(exportContainer, {
        scale: 1, useCORS: true, allowTaint: false, backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el.style) {
              Array.from(el.style).forEach((prop) => {
                const val = el.style.getPropertyValue(prop);
                if (val && val.includes('oklch')) el.style.setProperty(prop, 'transparent');
              });
            }
          });
        },
      });
      document.body.removeChild(exportContainer);
      const link = document.createElement('a');
      link.download = `${selectedTemplateKey||'school_post'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error(err);
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // ─── AI Caption ────────────────────────────────────────────────────────────
  const handleGenerateCaption = async () => {
    if (!activeTemplate || !schoolData) return;
    setIsGeneratingCaption(true);
    setCaption('');
    setCopied(false);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Write a warm, engaging social media caption (2–3 sentences) for a school post.\nPoster title: "${activeTemplate.name}"\nCategory: "${activeTemplate.category}"\nSchool name: "${schoolData.schoolName}"\n${schoolData.schoolTagline ? `School tagline: "${schoolData.schoolTagline}"` : ''}\nEnd the caption with 8–10 relevant hashtags on a new line.\nReturn plain text only — no markdown, no asterisks, no bullet points.`;
      const result = await model.generateContent(prompt);
      setCaption(result.response.text().trim());
    } catch (err) {
      console.error('Caption generation failed:', err);
      setCaption('Could not generate caption. Please try again.');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleCopyCaption = () => {
    if (!caption) return;
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const activeTemplate = selectedTemplateKey ? templates[selectedTemplateKey] : null;
  const templateCount = Object.keys(templates).length;

  return (
    <div className="min-h-screen p-6 lg:p-8 font-sans transition-colors duration-300 relative overflow-hidden" style={{ backgroundColor: colors.background, color: colors.text }}>
      
      {/* Background Decorative Accent Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl -mr-20 -mt-20" style={{ backgroundColor: colors.primary }}></div>
      <div className="absolute bottom-10 left-0 w-72 h-72 rounded-full pointer-events-none opacity-5 blur-2xl -ml-20" style={{ backgroundColor: colors.primary }}></div>

      <div className="max-w-[1500px] mx-auto space-y-6 relative z-10">
        
        {/* Header Bar */}
        <div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[28px] shadow-sm border border-slate-100 transition-colors duration-300 relative overflow-hidden"
          style={{ backgroundColor: colors.cardBackground, color: colors.text }}
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl shadow-inner flex items-center justify-center text-white" style={{ backgroundColor: colors.primary }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500">Graphic Studio</span>
                {schoolData?.schoolName && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200 bg-slate-50" style={{ color: colors.primary }}>
                    {schoolData.schoolName}
                  </span>
                )}

                {/* Super Admin Branch Switcher */}
                {userRole === 'super' && availableBranches.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 ml-2">
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
              <h2 className="text-2xl font-black tracking-tight" style={{ color: colors.text }}>Post Maker Workstation</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchData(currentSchoolId)}
              disabled={loading}
              className="px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Assets</span>
            </button>
            <button
              onClick={handleExportPost}
              disabled={isExporting || !activeTemplate}
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              className="px-6 py-3 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Download size={15} />
              <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
            </button>
          </div>
        </div>

        {/* Main Software Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Templates & AI Assistant */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Templates Selector Card */}
            <div 
              className="rounded-[28px] border border-slate-100 shadow-sm p-6 space-y-4"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-400">
                  <LayoutGrid size={16} style={{ color: colors.primary }} />
                  <span>Preset Templates</span>
                </div>
                {!loading && templateCount > 0 && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {templateCount} Available
                  </span>
                )}
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                  ))
                ) : templateCount === 0 ? (
                  <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-2xl border border-slate-100">
                    No templates found in database.
                  </div>
                ) : (
                  Object.entries(templates).map(([key, tpl]) => {
                    const isSelected = selectedTemplateKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { setSelectedTemplateKey(key); setCaption(''); }}
                        className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left group cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                            : 'bg-slate-50/60 text-slate-700 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? 'bg-white/10 text-white' : 'bg-white text-slate-400 border border-slate-200 shadow-xs'
                            }`}
                          >
                            <ImageIcon size={18} style={!isSelected ? { color: colors.primary } : {}} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs truncate">{tpl.name || key}</p>
                            {tpl.category && (
                              <p className={`text-[10px] font-semibold mt-0.5 truncate ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                                {tpl.category}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className={isSelected ? 'text-white' : 'text-slate-300 group-hover:text-slate-500'} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* AI Caption & Hashtags Assistant Card */}
            <div 
              className="rounded-[28px] border border-slate-100 shadow-sm p-6 space-y-4"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100">
                <Sparkles size={16} style={{ color: colors.primary }} />
                <span>AI Social Assistant</span>
              </div>

              <button
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption || !activeTemplate || !schoolData}
                style={{ backgroundColor: colors.primary }}
                className="w-full py-3.5 rounded-2xl text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                {isGeneratingCaption ? (
                  <><RefreshCw size={14} className="animate-spin" /> Drafting Copy...</>
                ) : (
                  <><Sparkles size={14} /> Generate Caption & Hashtags</>
                )}
              </button>

              {caption && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{caption}</p>
                  <button
                    onClick={handleCopyCaption}
                    className={`w-full py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      copied 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {copied ? (
                      <><CheckCheck size={14} /> Copied to Clipboard</>
                    ) : (
                      <><Copy size={14} /> Copy Text</>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Canvas Studio Stage */}
          <div className="lg:col-span-8">
            <div 
              className="rounded-[28px] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6 flex flex-col items-center min-h-[620px] justify-center relative overflow-hidden"
              style={{ backgroundColor: colors.cardBackground }}
            >
              {loading ? (
                <div className="text-center space-y-3 py-20">
                  <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Studio Assets...</p>
                </div>
              ) : !activeTemplate ? (
                <div className="text-center space-y-3 py-20">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Select a template to launch canvas</p>
                </div>
              ) : (
                <>
                  {/* Studio Canvas Status Bar */}
                  <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight" style={{ color: colors.text }}>
                        {activeTemplate.name || selectedTemplateKey}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Dimensions: {activeTemplate.width || 1080} × {activeTemplate.height || 1080} PX {activeTemplate.category ? `• ${activeTemplate.category}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Scaled Stage View
                    </span>
                  </div>

                  {/* Render Stage Container (Scale bounded view) */}
                  <div 
                    className="rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white relative flex-shrink-0 max-w-full my-auto"
                    style={{
                      width: '100%',
                      maxWidth: '540px',
                      aspectRatio: `${activeTemplate.width || 1080} / ${activeTemplate.height || 1080}`,
                    }}
                  >
                    <div
                      style={{
                        width: activeTemplate.width || 1080,
                        height: activeTemplate.height || 1080,
                        transform: `scale(${540 / (activeTemplate.width || 1080)})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      {/* Exportable inner canvas */}
                      <div
                        ref={postCanvasRef}
                        id="school-post-canvas"
                        style={{
                          position: 'relative',
                          width: activeTemplate.width || 1080,
                          height: activeTemplate.height || 1080,
                          overflow: 'hidden',
                          background: activeTemplate.bg && activeTemplate.bg.startsWith('#') ? activeTemplate.bg : '#ffffff',
                        }}
                      >
                        {/* Background image (if bg is a URL) */}
                        {activeTemplate.bg && !activeTemplate.bg.startsWith('#') && (
                          <img
                            crossOrigin="anonymous"
                            src={activeTemplate.bg}
                            alt="background"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://res.cloudinary.com/demo/image/upload/q_auto,f_auto,w_1080,h_1080,c_fill/sample.jpg";
                            }}
                            style={{
                              position: 'absolute', top: 0, left: 0,
                              width: '100%', height: '100%',
                              objectFit: 'cover', zIndex: 0,
                            }}
                          />
                        )}

                        {/* Template elements */}
                        {Array.isArray(activeTemplate.elements) &&
                          activeTemplate.elements.map((el, idx) => {
                            const key = el.id || `el_${idx}`;

                            if (el.type === 'shape') {
                              return (
                                <div
                                  key={key}
                                  style={{
                                    position: 'absolute',
                                    left: `${el.x}px`, top: `${el.y}px`,
                                    width: `${el.width}px`, height: `${el.height}px`,
                                    backgroundColor: el.bgColor || el.backgroundColor || 'transparent',
                                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : 0,
                                    opacity: el.opacity != null ? el.opacity / 100 : 1,
                                    zIndex: 10,
                                  }}
                                />
                              );
                            }

                            if (el.type === 'image') {
                              const resolvedSrc = resolveValue(el.src || '', el.fieldBinding);
                              
                              return (
                                <div
                                  key={key}
                                  style={{
                                    position: 'absolute',
                                    left: `${el.x}px`, top: `${el.y}px`,
                                    width: `${el.width}px`, height: `${el.height}px`,
                                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : 0,
                                    overflow: 'hidden',
                                    zIndex: 20,
                                  }}
                                >
                                  {resolvedSrc ? (
                                    <img
                                      crossOrigin="anonymous"
                                      src={resolvedSrc}
                                      alt={el.id || 'element'}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) {
                                          e.target.nextSibling.style.display = 'flex';
                                        }
                                      }}
                                      style={{
                                        width: '100%', height: '100%',
                                        objectFit: 'cover',
                                        opacity: el.opacity != null ? el.opacity / 100 : 1,
                                      }}
                                    />
                                  ) : null}
                                  
                                  {/* Safe Logo/Image Fallback placeholder */}
                                  <div
                                    style={{
                                      display: resolvedSrc ? 'none' : 'flex',
                                      width: '100%', height: '100%',
                                      backgroundColor: colors.primary,
                                      color: '#FFFFFF',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: '800',
                                      fontSize: '28px',
                                      borderRadius: el.borderRadius ? `${el.borderRadius}px` : 0,
                                    }}
                                  >
                                    {(schoolData?.schoolName || 'M').charAt(0)}
                                  </div>
                                </div>
                              );
                            }

                            if (el.type === 'text') {
                              const displayText = resolveValue(el.text || '', el.fieldBinding);
                              const fontStyle = el.font || el.fontFamily || 'sans-serif';
                              return (
                                <div
                                  key={key}
                                  style={{
                                    position: 'absolute',
                                    left: `${el.x}px`, top: `${el.y}px`,
                                    width: el.width ? `${el.width}px` : 'auto',
                                    color: el.color || '#000000',
                                    fontSize: `${el.fontSize || 16}px`,
                                    fontWeight: el.fontWeight || '400',
                                    fontFamily: fontStyle.includes(',') ? fontStyle : `${fontStyle}, sans-serif`,
                                    textAlign: el.textAlign || 'left',
                                    letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                                    lineHeight: el.lineHeight ? `${el.lineHeight}` : 'normal',
                                    opacity: el.opacity != null ? el.opacity / 100 : 1,
                                    zIndex: 30,
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {displayText}
                                </div>
                              );
                            }

                            return null;
                          })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}