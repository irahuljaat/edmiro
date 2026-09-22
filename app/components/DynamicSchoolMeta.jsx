'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default function DynamicSchoolMeta({ children }) {
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Edmiro',
    address: 'Smart Educational Management Portal'
  });

  useEffect(() => {
    // Retrieve current selected school ID from localStorage
    const currentSchoolId = typeof window !== 'undefined' 
      ? localStorage.getItem('currentSchoolId') || 'TEST_EDMIRO_ACADEMY'
      : 'TEST_EDMIRO_ACADEMY';

    if (!currentSchoolId) return;

    // Listen in real-time to Data -> {schoolId} -> config -> schoolDetails
    const schoolDetailsRef = doc(db, 'Data', currentSchoolId, 'config', 'schoolDetails');

    const unsubscribe = onSnapshot(schoolDetailsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedName = data.schoolName || data.name || 'Edmiro';
        const fetchedAddress = data.address || data.schoolAddress || 'Smart Educational Management Portal';

        setSchoolInfo({
          name: fetchedName,
          address: fetchedAddress
        });

        // Dynamically update document title in browser tab for Ultimate Admin
        document.title = `${fetchedName} | Admin Control Panel`;
      } else {
        setSchoolInfo({
          name: 'Edmiro',
          address: 'Smart Educational Management Portal'
        });
        document.title = 'Edmiro | Ultimate Admin Portal';
      }
    }, (error) => {
      console.error("Error fetching dynamic school metadata:", error);
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}