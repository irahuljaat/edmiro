'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, mvgDb } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  HiOutlineSparkles, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineSave,
  HiOutlineTemplate,
  HiChevronUp,
  HiChevronDown,
  HiOutlineTag,
  HiOutlineSearch
} from 'react-icons/hi';

const CANVAS_SIZE = 1080;
const PREVIEW_SCALE = 0.45;

const GOOGLE_FONTS = [
  'Inter', 'Poppins', 'Montserrat', 'Raleway', 'Outfit', 
  'Plus Jakarta Sans', 'Playfair Display', 'Cinzel', 'Bebas Neue', 
  'Oswald', 'Space Grotesk', 'Syne', 'DM Sans', 'Manrope', 
  'Lora', 'Merriweather', 'Cabinet Grotesk', 'Clash Display', 'Archivo'
];

// Dynamic Field Tag Options
const FIELD_TAGS = [
  { label: 'School Name', tag: '{{schoolName}}', binding: 'schoolName', demo: 'Edmiro International Academy' },
  { label: 'Contact Phone 1', tag: '{{schoolContact1}}', binding: 'schoolContact1', demo: '+91 98765 43210' },
  { label: 'Contact Phone 2', tag: '{{schoolContact2}}', binding: 'schoolContact2', demo: '+91 91234 56789' },
  { label: 'Address', tag: '{{address}}', binding: 'address', demo: 'Sheopur, Pratap Nagar, Jaipur' },
  { label: 'Website', tag: '{{website}}', binding: 'website', demo: 'www.edmiroschool.com' },
  { label: 'Email', tag: '{{schoolMail}}', binding: 'schoolMail', demo: 'admissions@edmiroschool.com' },
  { label: 'Affiliation Code', tag: '{{affiliation}}', binding: 'affiliation', demo: 'CBSE Affiliation No. 1730999' },
  { label: 'Registration No', tag: '{{schoolRegNo}}', binding: 'schoolRegNo', demo: 'REG/EDM/2026/08' },
  { label: 'Principal Name', tag: '{{principalName}}', binding: 'principalName', demo: 'Dr. Sharma, M.Sc., B.Ed.' },
  { label: 'Director Name', tag: '{{directorName}}', binding: 'directorName', demo: 'Mr. Rajesh Jain' }
];

// Expanded 60+ Categorized Vector SVG Icons
const ICON_CATEGORIES = {
  'Web & Domain': [
    { name: 'Browser Window', path: 'M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 3h16v11H4V7zm2-2a1 1 0 100 2 1 1 0 000-2zm3 0a1 1 0 100 2 1 1 0 000-2zm3 0a1 1 0 100 2 1 1 0 000-2z' },
    { name: 'Globe Network', path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.18a15.7 15.7 0 00-1.28-5.06A8.02 8.02 0 0119.93 11zM12 4.07c1.02 1.83 1.77 4.12 2.05 6.93H9.95c.28-2.81 1.03-5.1 2.05-6.93zM4.07 13h3.18c.24 2.05.78 3.86 1.57 5.06A8.02 8.02 0 014.07 13zm3.18-2H4.07a8.02 8.02 0 014.46-5.06C7.74 7.14 7.2 8.95 7.25 11zm2.7 2h4.1c-.28 2.81-1.03 5.1-2.05 6.93-1.02-1.83-1.77-4.12-2.05-6.93zm5.42 5.06c.79-1.2 1.33-3.01 1.57-5.06h3.18a8.02 8.02 0 01-4.75 5.06z' },
    { name: 'URL Hyperlink', path: 'M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z' },
    { name: 'Search Web', path: 'M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z' },
    { name: 'Cloud Domain', path: 'M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1118 16H5.5z' },
    { name: 'Cursor Pointer', path: 'M15 15l-3 5-2-4-4 2 5-14 8 11h-4z' },
    { name: 'Download Web', path: 'M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z' },
    { name: 'Server Database', path: 'M3 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 6a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm0 6a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z' }
  ],
  'Contact & Location': [
    { name: 'Phone Round', path: 'M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z' },
    { name: 'Location Pin', path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z' },
    { name: 'Envelope Mail', path: 'M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' },
    { name: 'WhatsApp Outline', path: 'M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.4 14.2c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.1-3.6-1-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5.2.5.8 2 .9 2.1.1.2.1.3 0 .5-.1.2-.2.4-.3.5l-.5.6c-.2.2-.3.4-.1.7.4.7 1 1.7 2 2.6 1.3 1.1 2.3 1.5 2.7 1.7.3.1.5.1.7-.1.2-.3.9-1 1.1-1.4.2-.3.5-.3.8-.2.3.1 2 1 2.4 1.2.3.2.6.3.7.4.1.2.1.8-.1 1.4z' },
    { name: 'Chat Bubble', path: 'M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z' },
    { name: 'Building / School', path: 'M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm0 4h2v2H7V9zm0 4h2v2H7v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z' },
    { name: 'Clock Hours', path: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' },
    { name: 'Calendar Date', path: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' }
  ],
  'Academic & Badges': [
    { name: 'Graduation Cap', path: 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z' },
    { name: 'Open Book', path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Trophy Cup', path: 'M5 3h14v2H5V3zm2 4h10v2a5 5 0 01-10 0V7zm-4 0h3v4a7 7 0 006 6.92V20H7v2h10v-2h-5v-2.08A7 7 0 0018 11V7h3v2a2 2 0 01-2 2h-1a7 7 0 01-12 0H5a2 2 0 01-2-2V7z' },
    { name: 'Medal Ribbon', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { name: 'Shield Star', path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { name: 'Pencil Write', path: 'M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' },
    { name: 'Sparkles', path: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z' }
  ],
  'Social & Media': [
    { name: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { name: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { name: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
    { name: 'X / Twitter', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { name: 'Telegram', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z' }
  ]
};

export default function TemplateDesignerPage() {
  const [allTemplates, setAllTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTemplateKey, setActiveTemplateKey] = useState(null);

  const [currentTemplate, setCurrentTemplate] = useState({
    templateKey: 'admissions_open_2612',
    name: 'Admissions Open 2026-27',
    category: 'Academic',
    bg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop',
    width: 1080,
    height: 1080,
    elements: []
  });

  const [selectedElementIndex, setSelectedElementIndex] = useState(0);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialElementPos, setInitialElementPos] = useState({ x: 0, y: 0 });

  // Icon Search & Category State
  const [selectedCategory, setSelectedCategory] = useState('Web & Domain');
  const [iconSearchTerm, setIconSearchTerm] = useState('');

  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/\s+/g, '+')).join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Fetch Firestore templates
  useEffect(() => {
    async function loadTemplates() {
      try {
        const docRef = doc(db, 'app_assets', 'templates');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setAllTemplates(data);
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            setActiveTemplateKey(firstKey);
            setCurrentTemplate({ templateKey: firstKey, ...data[firstKey] });
          }
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const selectTemplate = (key) => {
    setActiveTemplateKey(key);
    setCurrentTemplate({ templateKey: key, ...allTemplates[key] });
    setSelectedElementIndex(0);
  };

  const handleCreateNew = () => {
    const newKey = 'banner_' + Date.now().toString().slice(-5);
    const blank = {
      templateKey: newKey,
      name: 'Custom Template ' + (Object.keys(allTemplates).length + 1),
      category: 'Academic',
      bg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1080&auto=format&fit=crop',
      width: 1080,
      height: 1080,
      elements: []
    };
    setActiveTemplateKey(newKey);
    setCurrentTemplate(blank);
    setSelectedElementIndex(0);
  };

  const handleMetaChange = (field, value) => {
    setCurrentTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleElementChange = (field, value) => {
    setCurrentTemplate(prev => {
      const updated = [...prev.elements];
      updated[selectedElementIndex] = {
        ...updated[selectedElementIndex],
        [field]: value
      };
      return { ...prev, elements: updated };
    });
  };

  // Add Dynamic Bound Text Element
  const handleAddDynamicText = (item) => {
    const timestamp = Date.now().toString().slice(-4);
    const newEl = {
      id: `el_${item.binding}_` + timestamp,
      type: 'text',
      text: item.tag,
      fieldBinding: item.binding,
      x: 120,
      y: 350 + (currentTemplate.elements.length * 35),
      fontSize: item.binding === 'schoolName' ? 44 : 26,
      fontWeight: item.binding === 'schoolName' ? '800' : '600',
      lineHeight: 1.2,
      color: item.binding.toLowerCase().includes('phone') ? '#38BDF8' : '#FFFFFF',
      font: 'Outfit',
      fontFamily: 'Outfit',
      opacity: 100
    };

    setCurrentTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newEl]
    }));
    setSelectedElementIndex(currentTemplate.elements.length);
  };

  // Add Vector Icon Element
  const handleAddIcon = (icon) => {
    const timestamp = Date.now().toString().slice(-4);
    const newEl = {
      id: 'el_icon_' + timestamp,
      type: 'icon',
      iconName: icon.name,
      svgPath: icon.path,
      x: 80,
      y: 350 + (currentTemplate.elements.length * 35),
      width: 44,
      height: 44,
      color: '#38BDF8',
      opacity: 100
    };

    setCurrentTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newEl]
    }));
    setSelectedElementIndex(currentTemplate.elements.length);
  };

  // Add Generic Shape or Logo
  const handleAddGenericElement = (type) => {
    const timestamp = Date.now().toString().slice(-4);
    let newEl = {};

    if (type === 'shape') {
      newEl = {
        id: 'el_shape_' + timestamp,
        type: 'shape',
        bgColor: '#0F172A',
        opacity: 85,
        x: 80,
        y: 880,
        width: 920,
        height: 140,
        borderRadius: 24
      };
    } else if (type === 'image') {
      newEl = {
        id: 'el_logo_' + timestamp,
        type: 'image',
        src: '{{schoolLogo}}',
        fieldBinding: 'schoolLogo',
        x: 80,
        y: 80,
        width: 140,
        height: 140,
        borderRadius: 70,
        opacity: 100
      };
    }

    setCurrentTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newEl]
    }));
    setSelectedElementIndex(currentTemplate.elements.length);
  };

  const moveElementOrder = (direction) => {
    if (direction === 'up' && selectedElementIndex < currentTemplate.elements.length - 1) {
      setCurrentTemplate(prev => {
        const copy = [...prev.elements];
        const temp = copy[selectedElementIndex];
        copy[selectedElementIndex] = copy[selectedElementIndex + 1];
        copy[selectedElementIndex + 1] = temp;
        return { ...prev, elements: copy };
      });
      setSelectedElementIndex(selectedElementIndex + 1);
    } else if (direction === 'down' && selectedElementIndex > 0) {
      setCurrentTemplate(prev => {
        const copy = [...prev.elements];
        const temp = copy[selectedElementIndex];
        copy[selectedElementIndex] = copy[selectedElementIndex - 1];
        copy[selectedElementIndex - 1] = temp;
        return { ...prev, elements: copy };
      });
      setSelectedElementIndex(selectedElementIndex - 1);
    }
  };

  const handleDeleteElement = (index) => {
    setCurrentTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter((_, i) => i !== index)
    }));
    setSelectedElementIndex(Math.max(0, index - 1));
  };

  // Drag Handlers
  const handleMouseDown = (e, index) => {
    e.stopPropagation();
    setSelectedElementIndex(index);
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialElementPos({
      x: currentTemplate.elements[index].x || 0,
      y: currentTemplate.elements[index].y || 0
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = (e.clientX - dragStartPos.x) / PREVIEW_SCALE;
    const deltaY = (e.clientY - dragStartPos.y) / PREVIEW_SCALE;

    const newX = Math.round(initialElementPos.x + deltaX);
    const newY = Math.round(initialElementPos.y + deltaY);

    setCurrentTemplate(prev => {
      const updated = [...prev.elements];
      updated[selectedElementIndex] = {
        ...updated[selectedElementIndex],
        x: newX,
        y: newY
      };
      return { ...prev, elements: updated };
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Save to Both Firestores (Central db & MVG mvgDb)
  const handleSaveToFirestore = async () => {
    if (!currentTemplate.templateKey) return;
    setSaving(true);
    try {
      const { templateKey, ...payload } = currentTemplate;
      
      const centralDocRef = doc(db, 'app_assets', 'templates');
      const mvgDocRef = doc(mvgDb, 'app_assets', 'templates');

      const dataToSave = {
        [templateKey]: payload
      };

      // Save to both projects simultaneously
      await Promise.all([
        setDoc(centralDocRef, dataToSave, { merge: true }),
        setDoc(mvgDocRef, dataToSave, { merge: true })
      ]);

      setAllTemplates(prev => ({
        ...prev,
        [templateKey]: payload
      }));
      alert(`Template "${payload.name}" updated in both databases successfully!`);
    } catch (err) {
      console.error('Error saving template across databases:', err);
      alert('Save Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Resolve Binding in Canvas Preview
  const resolveBinding = (text) => {
    if (!text || typeof text !== 'string') return text;
    let res = text;
    FIELD_TAGS.forEach(f => {
      res = res.replace(f.tag, f.demo);
    });
    return res;
  };

  const activeElement = currentTemplate.elements[selectedElementIndex] || {};

  // Filtered Icons for currently active category & search
  const visibleIcons = (ICON_CATEGORIES[selectedCategory] || []).filter(icon =>
    icon.name.toLowerCase().includes(iconSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">
        Loading Post Template Studio...
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F4F6F8] p-4 lg:p-8 font-sans text-slate-800 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-[1750px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              <HiOutlineTemplate size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Template Studio</h1>
              <p className="text-xs text-slate-400 font-medium">Add auto-bound dynamic school fields, vector icons, and typography layers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCreateNew}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            >
              <HiOutlinePlus size={16} /> New Template
            </button>
            <button
              onClick={handleSaveToFirestore}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
            >
              <HiOutlineSave size={16} /> {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>

        {/* Dynamic School Field Tags Ribbon */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineTag className="text-indigo-600" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Insert Dynamic School Field (Click to place on Canvas):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {FIELD_TAGS.map((item) => (
              <button
                key={item.binding}
                onClick={() => handleAddDynamicText(item)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
              >
                <HiOutlinePlus size={14} className="text-indigo-600" />
                <span>{item.label}</span>
                <span className="text-[9.5px] font-mono text-indigo-500 bg-white/70 px-1.5 py-0.5 rounded ml-1">
                  {item.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Saved Templates & Add Shapes (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Template Library */}
            <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100">
                Templates ({Object.keys(allTemplates).length})
              </span>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {Object.entries(allTemplates).map(([key, t]) => (
                  <div
                    key={key}
                    onClick={() => selectTemplate(key)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center gap-3 ${
                      activeTemplateKey === key 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm' 
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <img 
                      src={t.bg} 
                      alt={t.name} 
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black truncate">{t.name || key}</h4>
                      <p className="text-[9.5px] font-mono text-slate-400 truncate">{key}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Elements Quick Add */}
            <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Additional Elements
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddGenericElement('shape')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
                >
                  + Backdrop Shape
                </button>
                <button
                  onClick={() => handleAddGenericElement('image')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
                >
                  + School Logo
                </button>
              </div>
            </div>

          </div>

          {/* Column 2: Drag & Drop Canvas (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <div className="w-full flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                1080 × 1080 Interactive Canvas
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-500">
                Scale: {(PREVIEW_SCALE * 100).toFixed(0)}%
              </span>
            </div>

            {/* Canvas Box */}
            <div 
              className="relative overflow-hidden rounded-2xl shadow-2xl border border-slate-300"
              style={{
                width: CANVAS_SIZE * PREVIEW_SCALE,
                height: CANVAS_SIZE * PREVIEW_SCALE,
                backgroundImage: `url(${currentTemplate.bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {currentTemplate.elements.map((el, idx) => {
                const isSelected = selectedElementIndex === idx;

                // 1. Shapes
                if (el.type === 'shape') {
                  return (
                    <div
                      key={el.id || idx}
                      onMouseDown={(e) => handleMouseDown(e, idx)}
                      style={{
                        position: 'absolute',
                        left: (el.x || 0) * PREVIEW_SCALE,
                        top: (el.y || 0) * PREVIEW_SCALE,
                        width: (el.width || 100) * PREVIEW_SCALE,
                        height: (el.height || 50) * PREVIEW_SCALE,
                        backgroundColor: el.bgColor || '#000000',
                        opacity: (el.opacity ?? 100) / 100,
                        borderRadius: (el.borderRadius || 0) * PREVIEW_SCALE
                      }}
                      className={`cursor-grab active:cursor-grabbing transition-shadow ${
                        isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                      }`}
                    />
                  );
                }

                // 2. Logos / Images
                if (el.type === 'image') {
                  const resolvedSrc = el.fieldBinding === 'schoolLogo' 
                    ? 'https://res.cloudinary.com/db6ssceun/image/upload/v1771071585/SCHOOL_SENIOR_SECONDARY_LOGO_t88t8l.png'
                    : el.src;

                  return (
                    <div
                      key={el.id || idx}
                      onMouseDown={(e) => handleMouseDown(e, idx)}
                      style={{
                        position: 'absolute',
                        left: (el.x || 0) * PREVIEW_SCALE,
                        top: (el.y || 0) * PREVIEW_SCALE,
                        width: (el.width || 120) * PREVIEW_SCALE,
                        height: (el.height || 120) * PREVIEW_SCALE,
                        borderRadius: (el.borderRadius || 0) * PREVIEW_SCALE,
                        opacity: (el.opacity ?? 100) / 100
                      }}
                      className={`cursor-grab active:cursor-grabbing overflow-hidden ${
                        isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                      }`}
                    >
                      <img src={resolvedSrc} alt="Asset" className="w-full h-full object-cover pointer-events-none" />
                    </div>
                  );
                }

                // 3. Vector Icons
                if (el.type === 'icon') {
                  return (
                    <div
                      key={el.id || idx}
                      onMouseDown={(e) => handleMouseDown(e, idx)}
                      style={{
                        position: 'absolute',
                        left: (el.x || 0) * PREVIEW_SCALE,
                        top: (el.y || 0) * PREVIEW_SCALE,
                        width: (el.width || 44) * PREVIEW_SCALE,
                        height: (el.height || 44) * PREVIEW_SCALE,
                        color: el.color || '#38BDF8',
                        opacity: (el.opacity ?? 100) / 100
                      }}
                      className={`cursor-grab active:cursor-grabbing flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-indigo-500 rounded p-0.5' : ''
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full pointer-events-none">
                        <path d={el.svgPath || ICON_CATEGORIES['Web & Domain'][0].path} />
                      </svg>
                    </div>
                  );
                }

                // 4. Texts
                if (el.type === 'text') {
                  return (
                    <div
                      key={el.id || idx}
                      onMouseDown={(e) => handleMouseDown(e, idx)}
                      style={{
                        position: 'absolute',
                        left: (el.x || 0) * PREVIEW_SCALE,
                        top: (el.y || 0) * PREVIEW_SCALE,
                        fontSize: (el.fontSize || 28) * PREVIEW_SCALE,
                        fontWeight: el.fontWeight || '700',
                        lineHeight: el.lineHeight || 1.2,
                        color: el.color || '#FFFFFF',
                        fontFamily: el.fontFamily || el.font || 'Outfit',
                        opacity: (el.opacity ?? 100) / 100
                      }}
                      className={`cursor-grab active:cursor-grabbing leading-none max-w-[90%] whitespace-pre-wrap ${
                        isSelected ? 'ring-2 ring-indigo-500 bg-indigo-500/10 rounded px-1' : ''
                      }`}
                    >
                      {resolveBinding(el.text)}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Column 3: Properties & 60+ Icons Library (4 Cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-6">
            
            {/* Background & Title */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Key (Firestore ID)</label>
                  <input 
                    type="text"
                    value={currentTemplate.templateKey}
                    onChange={e => handleMetaChange('templateKey', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Name</label>
                  <input 
                    type="text"
                    value={currentTemplate.name}
                    onChange={e => handleMetaChange('name', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Background Image URL (1080x1080)</label>
                <input 
                  type="text"
                  value={currentTemplate.bg}
                  onChange={e => handleMetaChange('bg', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Selected Element Properties */}
            {activeElement && Object.keys(activeElement).length > 0 ? (
              <div className="space-y-4 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Element #{selectedElementIndex + 1} ({activeElement.type?.toUpperCase()})
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveElementOrder('up')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Bring Forward"
                    >
                      <HiChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveElementOrder('down')}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Send Backward"
                    >
                      <HiChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteElement(selectedElementIndex)}
                      className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 ml-2"
                      title="Delete Element"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>

                {/* Positions */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">X Position</label>
                    <input 
                      type="number"
                      value={activeElement.x ?? 0}
                      onChange={e => handleElementChange('x', Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Y Position</label>
                    <input 
                      type="number"
                      value={activeElement.y ?? 0}
                      onChange={e => handleElementChange('y', Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Opacity / Transparency</label>
                    <span className="text-[10px] font-mono font-bold">{activeElement.opacity ?? 100}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={activeElement.opacity ?? 100}
                    onChange={e => handleElementChange('opacity', Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Text Settings */}
                {activeElement.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Google Font</label>
                      <select 
                        value={activeElement.fontFamily || activeElement.font || 'Outfit'}
                        onChange={e => {
                          handleElementChange('fontFamily', e.target.value);
                          handleElementChange('font', e.target.value);
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {GOOGLE_FONTS.map(f => (
                          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Text String</label>
                      <textarea 
                        rows={2}
                        value={activeElement.text || ''}
                        onChange={e => handleElementChange('text', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Font Size</label>
                        <input 
                          type="number"
                          value={activeElement.fontSize || 28}
                          onChange={e => handleElementChange('fontSize', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Color</label>
                        <input 
                          type="color"
                          value={activeElement.color?.startsWith('#') ? activeElement.color : '#FFFFFF'}
                          onChange={e => handleElementChange('color', e.target.value)}
                          className="w-full h-8 rounded border border-slate-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shape Settings */}
                {activeElement.type === 'shape' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Width</label>
                        <input 
                          type="number"
                          value={activeElement.width || 100}
                          onChange={e => handleElementChange('width', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Height</label>
                        <input 
                          type="number"
                          value={activeElement.height || 50}
                          onChange={e => handleElementChange('height', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Radius</label>
                        <input 
                          type="number"
                          value={activeElement.borderRadius || 0}
                          onChange={e => handleElementChange('borderRadius', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Color</label>
                      <input 
                        type="color"
                        value={activeElement.bgColor?.startsWith('#') ? activeElement.bgColor : '#0F172A'}
                        onChange={e => handleElementChange('bgColor', e.target.value)}
                        className="w-full h-8 rounded border border-slate-200 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Icon Settings */}
                {activeElement.type === 'icon' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Size (px)</label>
                      <input 
                        type="number"
                        value={activeElement.width || 44}
                        onChange={e => {
                          handleElementChange('width', Number(e.target.value));
                          handleElementChange('height', Number(e.target.value));
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Color</label>
                      <input 
                        type="color"
                        value={activeElement.color?.startsWith('#') ? activeElement.color : '#38BDF8'}
                        onChange={e => handleElementChange('color', e.target.value)}
                        className="w-full h-8 rounded border border-slate-200 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

              </div>
            ) : null}

            {/* Categorized Vector Icons Library */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Insert Vector Icon
                </span>
                <div className="relative w-36">
                  <input
                    type="text"
                    placeholder="Search icons..."
                    value={iconSearchTerm}
                    onChange={(e) => setIconSearchTerm(e.target.value)}
                    className="w-full pl-2 pr-2 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1">
                {Object.keys(ICON_CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Icons */}
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                {visibleIcons.map((icon, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddIcon(icon)}
                    className="p-3 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/80 flex flex-col items-center justify-center gap-1 text-slate-700 transition cursor-pointer"
                    title={icon.name}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 pointer-events-none">
                      <path d={icon.path} />
                    </svg>
                    <span className="text-[8px] font-bold truncate max-w-full">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}