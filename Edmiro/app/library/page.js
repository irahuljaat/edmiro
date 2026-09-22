'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Library, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Building2
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { useColors } from '../components/ColorComponent';

export default function LibraryCatalogPage() {
  const colors = useColors();
  const [hasMounted, setHasMounted] = useState(false);

  // Branch & Multi-School Context State
  const [currentSchoolId, setCurrentSchoolId] = useState('TEST_EDMIRO_ACADEMY');
  const [userRole, setUserRole] = useState('branch');
  const [availableBranches, setAvailableBranches] = useState([]);

  // Library & Session States
  const [activeSession, setActiveSession] = useState('2026-27');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    description: '',
    bookNumber: '',
    isbnNumber: '',
    publisher: '',
    author: '',
    subject: '',
    rackNumber: '',
    qty: 10,
    available: 10,
    bookPrice: '₹100.00'
  });

  // Initial Setup: Mount check and user credential retrieval
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

  // Real-time Settings Listener for Active Session: Data -> {schoolId} -> config -> settings
  useEffect(() => {
    if (!currentSchoolId) return;

    const configRef = doc(db, 'Data', currentSchoolId, 'config', 'settings');
    const unsub = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveSession(data.activeSession || data.session || '2026-27');
      } else {
        setActiveSession('2026-27');
      }
    });
    return () => unsub();
  }, [currentSchoolId]);

  // Real-time Listener for Books: Data -> {schoolId} -> libraryCatalog
  useEffect(() => {
    if (!currentSchoolId) return;

    setLoading(true);
    const booksColRef = collection(db, 'Data', currentSchoolId, 'libraryCatalog');
    const q = query(booksColRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBooks = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setBooks(fetchedBooks);
      setLoading(false);
    }, (error) => {
      console.error("Library Catalog Fetch Error:", error);
      setBooks([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentSchoolId]);

  const handleBranchChange = (newSchoolId) => {
    setCurrentSchoolId(newSchoolId);
    localStorage.setItem('currentSchoolId', newSchoolId);
  };

  // Filter books based on search query
  const filteredBooks = books.filter((b) => 
    String(b.bookTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(b.isbnNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(b.bookNumber || '').includes(searchQuery)
  );

  const handleOpenAddModal = () => {
    setEditingBookId(null);
    setFormData({
      bookTitle: '',
      description: 'No Description',
      bookNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      isbnNumber: '',
      publisher: '',
      author: '',
      subject: '',
      rackNumber: '',
      qty: 10,
      available: 10,
      bookPrice: '₹100.00'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBookId(book.id);
    setFormData({ ...book });
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (id) => {
    if (!currentSchoolId || !id) return;
    if (confirm('Are you sure you want to delete this book from the catalog?')) {
      try {
        await deleteDoc(doc(db, 'Data', currentSchoolId, 'libraryCatalog', id));
      } catch (err) {
        console.error("Error deleting book:", err);
        alert('Failed to delete book record.');
      }
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!formData.bookTitle.trim()) {
      alert('Please enter a Book Title');
      return;
    }
    if (!currentSchoolId) {
      alert('School context missing.');
      return;
    }

    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    try {
      const bookDocId = editingBookId || `book_${Date.now()}`;
      const docRef = doc(db, 'Data', currentSchoolId, 'libraryCatalog', bookDocId);

      const payload = {
        ...formData,
        postDate: editingBookId ? (formData.postDate || today) : today,
        updatedAt: new Date().toISOString(),
        ...(!editingBookId && { createdAt: new Date().toISOString() })
      };

      await setDoc(docRef, payload, { merge: true });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save book record.");
    }
  };

  // ─── EXPORT & UTILITY HANDLERS ───

  const handleCopyTable = () => {
    const headers = ['Book Title', 'Description', 'Book Number', 'ISBN Number', 'Publisher', 'Author', 'Subject', 'Rack Number', 'Qty', 'Available', 'Book Price', 'Post Date'];
    const rows = filteredBooks.map(b => [
      b.bookTitle, b.description, b.bookNumber, b.isbnNumber, b.publisher, b.author, b.subject, b.rackNumber, b.qty, b.available, b.bookPrice, b.postDate
    ]);
    const textContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    
    navigator.clipboard.writeText(textContent).then(() => {
      alert('Table data copied to clipboard successfully!');
    }).catch(err => {
      alert('Failed to copy table data.');
    });
  };

  const handleExportCSV = () => {
    const headers = ['Book Title', 'Description', 'Book Number', 'ISBN Number', 'Publisher', 'Author', 'Subject', 'Rack Number', 'Qty', 'Available', 'Book Price', 'Post Date'];
    const rows = filteredBooks.map(b => [
      `"${b.bookTitle}"`,
      `"${b.description}"`,
      `"${b.bookNumber}"`,
      `"${b.isbnNumber}"`,
      `"${b.publisher}"`,
      `"${b.author}"`,
      `"${b.subject}"`,
      `"${b.rackNumber}"`,
      b.qty,
      b.available,
      `"${b.bookPrice}"`,
      `"${b.postDate}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `library_book_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Library Book List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>Library Book Catalog & Inventory (${activeSession})</h2>
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Description</th>
                <th>Book No</th>
                <th>ISBN</th>
                <th>Publisher</th>
                <th>Author</th>
                <th>Subject</th>
                <th>Rack</th>
                <th>Qty</th>
                <th>Avail</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBooks.map(b => `
                <tr>
                  <td><b>${b.bookTitle}</b></td>
                  <td>${b.description || ''}</td>
                  <td>${b.bookNumber}</td>
                  <td>${b.isbnNumber || ''}</td>
                  <td>${b.publisher || ''}</td>
                  <td>${b.author || ''}</td>
                  <td>${b.subject || ''}</td>
                  <td>${b.rackNumber || ''}</td>
                  <td>${b.qty}</td>
                  <td>${b.available}</td>
                  <td>${b.bookPrice}</td>
                  <td>${b.postDate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintTable = () => {
    window.print();
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen p-6 lg:p-8 font-sans transition-colors duration-300 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Background Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl -mr-20 -mt-20" style={{ backgroundColor: colors.primary }}></div>
      <div className="absolute bottom-10 left-0 w-72 h-72 rounded-full pointer-events-none opacity-5 blur-2xl -ml-20" style={{ backgroundColor: colors.primary }}></div>

      <div className="max-w-[1440px] mx-auto space-y-8 relative z-10">
        
        {/* ── Header Card ── */}
        <div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[28px] border border-slate-100 shadow-sm p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
          style={{ backgroundColor: colors.cardBackground, color: colors.text }}
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl border border-slate-100 shadow-inner" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
              <Library className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                  Active Session: <span style={{ color: colors.primary }}>{activeSession}</span>
                </span>

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
              <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.text }}>Book List &amp; Inventory</h1>
              <p className="text-xs font-bold text-slate-400 mt-0.5">Manage cataloging records, ISBNs, quantities, and rack numbers</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleOpenAddModal}
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
              className="flex items-center space-x-2 font-black uppercase tracking-wider px-6 py-3 rounded-full text-xs shadow-lg hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>
        </div>

        {/* ── Search & Fully Functional Export Toolbar Card ── */}
        <div 
          className="rounded-[28px] border border-slate-100 shadow-sm p-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ backgroundColor: colors.cardBackground, color: colors.text }}
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search By Book Title, Author, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <button 
              onClick={handleCopyTable}
              title="Copy Table" 
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={handleExportCSV}
              title="Export Excel / CSV" 
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </button>
            <button 
              onClick={handleExportPDF}
              title="Export / View PDF Document" 
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-600" />
            </button>
            <button 
              onClick={handlePrintTable}
              title="Print Table" 
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" style={{ color: colors.primary }} />
            </button>
          </div>
        </div>

        {/* ── Book List Table Card ── */}
        <div 
          className="rounded-[28px] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-colors duration-300"
          style={{ backgroundColor: colors.cardBackground, color: colors.text }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
                  <th className="py-4 px-6">Book Title</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Book Number</th>
                  <th className="py-4 px-6">ISBN Number</th>
                  <th className="py-4 px-6">Publisher</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Rack Number</th>
                  <th className="py-4 px-6">Qty</th>
                  <th className="py-4 px-6">Available</th>
                  <th className="py-4 px-6">Book Price</th>
                  <th className="py-4 px-6">Post Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={13} className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Syncing Catalog Records...
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      No matching books found in database.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900">{book.bookTitle}</td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{book.description || 'No Description'}</td>
                      <td className="py-4 px-6 font-mono text-slate-600 font-bold">{book.bookNumber}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{book.isbnNumber || '—'}</td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{book.publisher || '—'}</td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{book.author || '—'}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{book.subject || '—'}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{book.rackNumber || '—'}</td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">{book.qty}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          book.available > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {book.available}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">{book.bookPrice}</td>
                      <td className="py-4 px-6 text-slate-400 font-bold">{book.postDate}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            title="Edit Book"
                            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            title="Delete Book"
                            className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-full transition-colors cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Catalog Entry</span>
                <h2 className="font-black text-lg text-slate-900">
                  {editingBookId ? 'Edit Book Record' : 'Add New Book to Catalog'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shadow-xs transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Book Title *</label>
                <input
                  type="text"
                  required
                  value={formData.bookTitle}
                  onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                  placeholder="e.g. Advanced Mathematics"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Book Number</label>
                <input
                  type="text"
                  value={formData.bookNumber}
                  onChange={(e) => setFormData({ ...formData, bookNumber: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">ISBN Number</label>
                <input
                  type="text"
                  value={formData.isbnNumber}
                  onChange={(e) => setFormData({ ...formData, isbnNumber: e.target.value })}
                  placeholder="e.g. 978-81-..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Publisher</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Rack Number</label>
                <input
                  type="text"
                  value={formData.rackNumber}
                  onChange={(e) => setFormData({ ...formData, rackNumber: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Quantity</label>
                <input
                  type="number"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0, available: parseInt(e.target.value) || 0 })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Book Price</label>
                <input
                  type="text"
                  value={formData.bookPrice}
                  onChange={(e) => setFormData({ ...formData, bookPrice: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end space-x-3 mt-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-wider rounded-full text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: colors.primary, color: '#ffffff' }}
                  className="flex items-center space-x-2 px-6 py-3 font-black uppercase tracking-wider rounded-full text-xs transition-all shadow-lg hover:shadow-xl active:scale-[0.99] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Book</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}