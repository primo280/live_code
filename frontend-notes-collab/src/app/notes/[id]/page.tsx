"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Note } from '../../../types';
import { useSocket } from '../../../hooks/useSocket';
import Toolbar from '../../../components/Toolbar';

export default function EditNotePage() {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [cursorPositions, setCursorPositions] = useState<{ [key: string]: { x: number, y: number } }>({}); // Gestion des positions du curseur

  const handleSocketReceive = (data: Partial<Note>) => {
    if (note) setNote({ ...note, ...data });
  };

  const { send } = useSocket(id as string, handleSocketReceive);

  useEffect(() => {
    api.get(`/notes/${id}`).then((res) => setNote(res.data));
  }, [id]);

  const handleUpdate = (field: keyof Note, value: any) => {
    if (!note) return;
    const updated = { ...note, [field]: value };
    setNote(updated);
    send({ [field]: value });
  };

  const handleSave = () => {
  if (note && note._id) {
    let author = '';
      if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          author = user.username || '';
        }
      }
    const payload = {
      ...note,
      author, // valeur de secours
    };

    api.put(`/notes/${note._id}`, payload)
      .then(() => {
        console.log("Note mise à jour !");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour :", error);
      });
  }
};


  const handleCursorMove = (e: React.MouseEvent) => {
    const cursorData = { x: e.clientX, y: e.clientY };
    send({ cursorMove: cursorData }); // Envoi de la position du curseur à travers WebSocket
  };

  useEffect(() => {
    // Recevoir les positions de curseurs des autres utilisateurs
    const handleCursorUpdate = (data: any) => {
      setCursorPositions(data); // Mettre à jour l'état des positions des autres utilisateurs
    };

    return () => {
      // Clean up when component unmounts or socket disconnects
    };
  }, [send]);

  if (!note) return <div className="text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <Toolbar />

      {/* Title Input */}
      <input
        className="w-full text-3xl font-semibold p-4 rounded-lg shadow-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition duration-200"
        value={note.title}
        onChange={(e) => handleUpdate('title', e.target.value)}
        placeholder="Titre de la note"
        onMouseMove={handleCursorMove} // Détecte le mouvement du curseur pendant la saisie
      />

      {/* Content Textarea */}
      <textarea
        className="w-full h-72 p-4 rounded-lg shadow-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition duration-200"
        value={note.content}
        onChange={(e) => handleUpdate('content', e.target.value)}
        placeholder="Écrivez le contenu de votre note ici..."
        onMouseMove={handleCursorMove} // Détecte le mouvement du curseur pendant la saisie
      />

      {/* Tags Input */}
      <input
        className="w-full p-4 rounded-lg shadow-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 transition duration-200"
        value={note.tags.join(',')}
        onChange={(e) => handleUpdate('tags', e.target.value.split(','))}
        placeholder="Tags (séparés par des virgules)"
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-300"
          onClick={handleSave}
        >
          Sauvegarder
        </button>
      </div>

      
    </div>
  );
}
