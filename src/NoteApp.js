import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Moon, Sun, Menu, X, Trash2, Download, Edit, Search, RotateCcw, Plus, Lock } from 'lucide-react';
import CryptoJS from 'crypto-js';

const Alert = ({ children, className }) => (
  <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${className}`}>
    {children}
  </div>
);

// Komponen PasswordModal akan berada di sini
const PasswordModal = ({ isOpen, onClose, onSubmit, darkMode }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-lg shadow-xl max-w-md w-full`}>
        <div className="flex items-center justify-center mb-4">
          <Lock size={40} className={`${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Catatan Terkunci</h2>
        <p className="text-center mb-6">Masukkan password untuk membuka catatan ini.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
          placeholder="Masukkan password"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Batal
          </button>
          <button
            onClick={() => onSubmit(password)}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Buka
          </button>
        </div>
      </div>
    </div>
  );
};

// Komponen NoteApp utama akan dimulai di Part 2
const NoteApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ 
    id: '', 
    title: '', 
    content: '', 
    tags: [], 
    reminder: null,
    isLocked: false,
    encryptedContent: ''
  });
  const [notification, setNotification] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notePassword, setNotePassword] = useState('');
  const [isNoteLocked, setIsNoteLocked] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentLockedNote, setCurrentLockedNote] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
      setNotes(savedNotes);
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
    }
  }, [notes]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const encryptContent = (content, password) => {
    return CryptoJS.AES.encrypt(content, password).toString();
  };

  const decryptContent = (encryptedContent, password) => {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Lanjutan fungsi-fungsi lainnya akan ada di Part 3
  // Lanjutan dari Part 2

  const saveNote = () => {
    if (currentNote.title.trim() === '' || (editorRef.current && editorRef.current.innerText.trim() === '')) {
      showNotification('Judul dan isi catatan tidak boleh kosong', 'error');
      return;
    }

    try {
      let updatedNote = {
        ...currentNote,
        content: editorRef.current ? editorRef.current.innerHTML : ''
      };

      if (isNoteLocked && notePassword) {
        updatedNote.isLocked = true;
        updatedNote.encryptedContent = encryptContent(updatedNote.content, notePassword);
        updatedNote.content = '';
      } else {
        updatedNote.isLocked = false;
        updatedNote.encryptedContent = '';
      }

      if (currentNote.id) {
        setNotes(prevNotes => prevNotes.map(note => note.id === currentNote.id ? updatedNote : note));
        showNotification('Catatan berhasil diperbarui');
      } else {
        const newNote = { ...updatedNote, id: Date.now().toString() };
        setNotes(prevNotes => [...prevNotes, newNote]);
        showNotification('Catatan baru berhasil disimpan');
      }
      setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null, isLocked: false, encryptedContent: '' });
      setIsNoteLocked(false);
      setNotePassword('');
      setIsMenuOpen(true);
    } catch (error) {
      console.error('Error saving note:', error);
      showNotification('Terjadi kesalahan saat menyimpan catatan', 'error');
    }
  };

  const deleteNote = (id) => {
    try {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      showNotification('Catatan berhasil dihapus');
      if (currentNote.id === id) {
        setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null, isLocked: false, encryptedContent: '' });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('Terjadi kesalahan saat menghapus catatan', 'error');
    }
  };

  const editNote = (note) => {
    if (note.isLocked) {
      setCurrentLockedNote(note);
      setIsPasswordModalOpen(true);
    } else {
      setCurrentNote(note);
      setPreviewNote(null);
      setIsMenuOpen(false);
    }
  };

  const downloadNote = (note) => {
    const noteToDownload = note || currentNote;
    if (!noteToDownload.title || (!noteToDownload.content && !noteToDownload.encryptedContent)) {
      showNotification('Tidak ada catatan untuk diunduh', 'error');
      return;
    }
    let content = noteToDownload.content;
    if (noteToDownload.isLocked) {
      const password = prompt('Masukkan password untuk mengunduh catatan:');
      if (!password) return;
      try {
        content = decryptContent(noteToDownload.encryptedContent, password);
      } catch (error) {
        showNotification('Password salah', 'error');
        return;
      }
    }
    const noteContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${noteToDownload.title}</title>
      </head>
      <body>
        <h1>${noteToDownload.title}</h1>
        ${content}
        <p>Tags: ${noteToDownload.tags.join(', ')}</p>
      </body>
      </html>
    `;
    const blob = new Blob([noteContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${noteToDownload.title}.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Catatan berhasil diunduh');
  };

  const previewNoteHandler = (note) => {
    if (note.isLocked) {
      setCurrentLockedNote(note);
      setIsPasswordModalOpen(true);
    } else {
      setPreviewNote(note);
      setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null, isLocked: false, encryptedContent: '' });
      setIsMenuOpen(false);
    }
  };

  const resetNote = () => {
    setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null, isLocked: false, encryptedContent: '' });
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    showNotification('Form catatan telah direset');
  };

  const addNewNote = () => {
    setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null, isLocked: false, encryptedContent: '' });
    setPreviewNote(null);
    setIsMenuOpen(false);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const lowercaseQuery = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(lowercaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        (note.content && note.content.toLowerCase().includes(lowercaseQuery))
      );
    });
  }, [notes, searchQuery]);

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handlePasswordSubmit = (password) => {
    try {
      const decryptedContent = decryptContent(currentLockedNote.encryptedContent, password);
      if (previewNote) {
        setPreviewNote({...currentLockedNote, content: decryptedContent});
      } else {
        setCurrentNote({...currentLockedNote, content: decryptedContent});
      }
      setIsPasswordModalOpen(false);
      setCurrentLockedNote(null);
      setIsMenuOpen(false);
    } catch (error) {
      showNotification('Password salah', 'error');
    }
  };

  // Render function akan dilanjutkan di Part 4
  // Lanjutan dari Part 3

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <nav className={`fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h1 className="text-xl font-bold">Catatan</h1>
        <div className="flex items-center space-x-2">
          <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleMenu} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row flex-grow overflow-hidden mt-16">
        {isMenuOpen && (
          <div className={`w-full md:w-1/3 p-4 border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} overflow-y-auto`}>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Cari catatan berdasarkan judul atau tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 pl-10 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="space-y-2">
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  className={`p-2 rounded shadow ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} cursor-pointer`}
                  onClick={() => previewNoteHandler(note)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">{note.title}</h3>
                    {note.isLocked && <Lock size={14} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} dangerouslySetInnerHTML={{ __html: note.content ? note.content.substring(0, 100) + '...' : 'Catatan terkunci' }} />
                  <div className="flex mt-2 space-x-1 flex-wrap">
                    {note.tags && note.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2 py-1 rounded mb-1 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); editNote(note); }} className={`${darkMode ? 'text-blue-400 hover:text-blue-200' : 'text-blue-500 hover:text-blue-700'}`}>
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className={`${darkMode ? 'text-red-400 hover:text-red-200' : 'text-red-500 hover:text-red-700'}`}>
                      <Trash2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); downloadNote(note); }} className={`${darkMode ? 'text-yellow-400 hover:text-yellow-200' : 'text-yellow-500 hover:text-yellow-700'}`}>
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={addNewNote}
              className={`fixed bottom-4 right-4 p-4 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg`}
            >
              <Plus size={24} />
            </button>
          </div>
        )}

        <div className={`w-full ${isMenuOpen ? 'hidden md:block md:w-2/3' : ''} p-4 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {previewNote ? (
            <div className={`p-4 rounded shadow ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-bold mb-4">{previewNote.title}</h2>
              <div className="mb-4 text-sm" dangerouslySetInnerHTML={{ __html: previewNote.content }} />
              <div className="flex flex-wrap mb-4">
                {previewNote.tags && previewNote.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2 py-1 rounded mr-2 mb-2 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>{tag}</span>
                ))}
              </div>
              <button onClick={() => editNote(previewNote)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                Edit Catatan
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Judul"
                value={currentNote.title}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
              />
              <div className="mb-2">
                <button onClick={() => handleFormat('bold')} className="px-2 py-1 bg-gray-200 text-black rounded mr-1">B</button>
                <button onClick={() => handleFormat('italic')} className="px-2 py-1 bg-gray-200 text-black rounded mr-1">I</button>
                <button onClick={() => handleFormat('underline')} className="px-2 py-1 bg-gray-200 text-black rounded mr-1">U</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                className={`w-full h-48 md:h-64 p-2 mb-4 border rounded overflow-auto ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                dangerouslySetInnerHTML={{ __html: currentNote.content }}
              />
              <div className="flex flex-col space-y-2 mb-4">
                <input
                  type="text"
                  placeholder="Tambah tag (pisahkan dengan koma)"
                  value={currentNote.tags ? currentNote.tags.join(', ') : ''}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
                <input
                  type="datetime-local"
                  value={currentNote.reminder || ''}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, reminder: e.target.value }))}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={isNoteLocked}
                  onChange={(e) => setIsNoteLocked(e.target.checked)}
                  className="mr-2"
                />
                <label>Kunci Catatan</label>
              </div>
              {isNoteLocked && (
                <input
                  type="password"
                  placeholder="Password untuk mengunci catatan"
                  value={notePassword}
                  onChange={(e) => setNotePassword(e.target.value)}
                  className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
                />
              )}
              <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                <button onClick={saveNote} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                  {currentNote.id ? 'Perbarui Catatan' : 'Simpan Catatan'}
                </button>
                <button onClick={resetNote} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                  <RotateCcw size={14} className="inline-block mr-2" />
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        darkMode={darkMode}
      />

      {notification && (
        <Alert className={`${notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
          {notification.message}
        </Alert>
      )}
    </div>
  );
};

export default NoteApp;