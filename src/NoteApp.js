import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Trash2, Download, Eye, Edit } from 'lucide-react';

const Alert = ({ children, className }) => (
  <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${className}`}>
    {children}
  </div>
);

const NoteApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ id: '', title: '', content: '', tags: [], reminder: null });
  const [notification, setNotification] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);

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

  const saveNote = () => {
    if (currentNote.title.trim() === '' || currentNote.content.trim() === '') {
      showNotification('Judul dan isi catatan tidak boleh kosong', 'error');
      return;
    }

    try {
      if (currentNote.id) {
        setNotes(prevNotes => prevNotes.map(note => note.id === currentNote.id ? currentNote : note));
        showNotification('Catatan berhasil diperbarui');
      } else {
        const newNote = { ...currentNote, id: Date.now().toString() };
        setNotes(prevNotes => [...prevNotes, newNote]);
        showNotification('Catatan baru berhasil disimpan');
      }
      setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null });
      setIsMenuOpen(true); // Show the note list after saving
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
        setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('Terjadi kesalahan saat menghapus catatan', 'error');
    }
  };

  const editNote = (note) => {
    setCurrentNote(note);
    setPreviewNote(null);
    setIsMenuOpen(false); // Hide the menu on mobile when editing
  };

  const downloadNote = (note) => {
    const noteToDownload = note || currentNote;
    if (!noteToDownload.title || !noteToDownload.content) {
      showNotification('Tidak ada catatan untuk diunduh', 'error');
      return;
    }
    const noteContent = `${noteToDownload.title}\n\n${noteToDownload.content}`;
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${noteToDownload.title}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Catatan berhasil diunduh');
  };

  const previewNoteHandler = (note) => {
    setPreviewNote(note);
    setCurrentNote({ id: '', title: '', content: '', tags: [], reminder: null });
    setIsMenuOpen(false); // Hide the menu on mobile when previewing
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Navbar */}
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
        {/* Sidebar */}
        {isMenuOpen && (
          <div className={`w-full md:w-1/3 p-4 border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} overflow-y-auto`}>
            <input
              type="text"
              placeholder="Cari catatan..."
              className={`w-full p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
            />
            <div className="space-y-2">
              {notes.map(note => (
                <div key={note.id} className={`p-2 rounded shadow ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-bold text-sm">{note.title}</h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{note.content.substring(0, 50)}...</p>
                  <div className="flex mt-2 space-x-1 flex-wrap">
                    {note.tags && note.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2 py-1 rounded mb-1 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button onClick={() => previewNoteHandler(note)} className={`${darkMode ? 'text-green-400 hover:text-green-200' : 'text-green-500 hover:text-green-700'}`}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => editNote(note)} className={`${darkMode ? 'text-blue-400 hover:text-blue-200' : 'text-blue-500 hover:text-blue-700'}`}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className={`${darkMode ? 'text-red-400 hover:text-red-200' : 'text-red-500 hover:text-red-700'}`}>
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => downloadNote(note)} className={`${darkMode ? 'text-yellow-400 hover:text-yellow-200' : 'text-yellow-500 hover:text-yellow-700'}`}>
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className={`w-full ${isMenuOpen ? 'hidden md:block md:w-2/3' : ''} p-4 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {previewNote ? (
            <div className={`p-4 rounded shadow ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-bold mb-4">{previewNote.title}</h2>
              <p className="whitespace-pre-wrap mb-4 text-sm">{previewNote.content}</p>
              <div className="flex flex-wrap mb-4">
                {previewNote.tags && previewNote.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2 py-1 rounded mr-2 mb-2 ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>{tag}</span>
                ))}
              </div>
              <button onClick={() => { setPreviewNote(null); setIsMenuOpen(false); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
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
              <textarea
                placeholder="Isi catatan"
                value={currentNote.content}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                className={`w-full h-48 md:h-64 p-2 mb-4 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}
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
              <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                <button onClick={saveNote} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                  {currentNote.id ? 'Perbarui Catatan' : 'Simpan Catatan'}
                </button>
                <button onClick={() => downloadNote()} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                  <Download size={14} className="inline-block mr-2" />
                  Unduh Catatan
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Alert className={`${notification.type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
          {notification.message}
        </Alert>
      )}
    </div>
  );
};

export default NoteApp;