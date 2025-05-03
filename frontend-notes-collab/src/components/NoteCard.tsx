import { Note } from '../types';
import { useRouter } from 'next/navigation';
import { Edit, Trash, Share, User } from 'lucide-react'; // Importation des icônes

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
      onClick={() => router.push(`/notes/${note._id}`)}
    >
      <h2 className="font-semibold text-xl text-gray-900 truncate">{note.title}</h2>
      <p className="text-sm text-gray-500 mt-2">{note.content.slice(0, 150)}...</p> {/* Affiche un extrait de contenu */}
      
      <div className="mt-3 flex flex-wrap gap-2">
        {note.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-400 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" /> {/* Icône utilisateur */}
          <span>{note.author}</span> | <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        </div>
        
        {/* Icônes d'action */}
        <div className="flex gap-3">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Modifier la note');
            }}
          >
            <Edit className="h-5 w-5 bg-blue-800 text-gray-500 hover:text-blue-500" />
          </button>

          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Supprimer la note');
            }}
          >
            <Trash className="h-5 w-5 text-gray-500 hover:text-red-500" />
          </button>

          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Partager la note');
            }}
          >
            <Share className="h-5 w-5 text-gray-500 hover:text-green-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
