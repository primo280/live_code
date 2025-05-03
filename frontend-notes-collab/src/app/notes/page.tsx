"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { useNoteStore } from '../../store/noteStore';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import Notification from '../../components/Notification';

export default function NotesPage() {
  const [username, setUsername] = useState<string | null>(null);
  const { notes, setNotes } = useNoteStore();
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // State to manage loading
  const router = useRouter();
 


  useEffect(() => {
    const userJson = localStorage.getItem('user');
    const username = userJson ? JSON.parse(userJson) : null;
    if (!username) return router.push('/');
    setIsLoading(true);
    api.get('/notes')
      .then((res) => {
        setNotes(res.data);
        setIsLoading(false); // Stop loading after the data is fetched
      })
      .catch(() => setIsLoading(false));
  }, [username]);

  const handleCreateNote = async () => {
    if (!title || !tags) {
      alert("Le titre et les tags sont requis");
      return;
    }

    try {
      setIsLoading(true);
      const userJson = localStorage.getItem('user');
      const user = JSON.parse(userJson);
      author = user.username || '';
      const res = await api.post('/notes', {
        title,
        content: '',
        author: author,
        tags: tags.split(',').map((tag) => tag.trim()),
        
      });

      setShowModal(false);
      setTitle('');
      setTags('');
      router.push(`/notes/${res.data._id}`);
    } catch (error) {
      console.error('Erreur création note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsLoading(true);
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
      setNoteToDelete(null); // Close the modal
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la note:', error.response?.data || error);
      alert("Échec de la suppression. Voir console.");
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = notes.filter((n) =>
    n.tags.join(',').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">📝 Mes Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
        >
          + Nouvelle note
        </button>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="🔍 Rechercher une note..."
          className="p-2 w-full md:w-1/2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          onChange={(e) => {
            const q = e.target.value;
            api.get(`/notes/search?q=${q}`).then((res) => {
              setNotes(res.data);
            });
          }}
        />
        <select
          onChange={(e) => {
            const sort = e.target.value;
            api.get(`/notes?sort=${sort}`).then((res) => {
              setNotes(res.data);
            });
          }}
          className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg focus:outline-none transition duration-300"
        >
          <option value="createdAt">📅 Trier par création</option>
          <option value="updatedAt">✏️ Trier par modification</option>
        </select>
        <input
          type="text"
          placeholder="🏷️ Filtrer par tag..."
          className="p-2 w-full md:w-1/4 border border-gray-300 rounded-lg transition duration-300"
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <Notification />

      {/* Notes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : filtered && filtered.length > 0 ? (
          filtered.map((note) => (
            <div
              key={note._id}
              className="relative bg-white p-4 rounded-xl shadow-md transition transform hover:scale-[1.02] hover:shadow-lg cursor-pointer border border-gray-100"
              onClick={() => router.push(`/notes/${note._id}`)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNoteToDelete(note._id);
                }}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                title="Supprimer"
              >
                🗑️
              </button>
              <h2 className="text-lg font-bold text-gray-800">{note.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{note.content.slice(0, 100)}...</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full transition duration-300 ease-in-out hover:bg-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-between items-center text-gray-400 text-xs">
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">Aucune note trouvée.</div>
        )}
      </div>

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md transition duration-300 ease-in-out">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">✨ Nouvelle note</h2>
            <input
              type="text"
              placeholder="Titre de la note"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 p-2 mb-3 rounded-lg focus:outline-none"
            />
            <input
              type="text"
              placeholder="Tags (séparés par des virgules)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 p-2 mb-4 rounded-lg focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation suppression */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Supprimer la note ?</h2>
            <p className="text-gray-600 mb-6">Cette action est irréversible. Confirmez-vous la suppression ?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setNoteToDelete(null)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                onClick={() => handleDeleteNote(noteToDelete)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
