import { useState } from 'react';

export default function Toolbar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikeThrough, setStrikeThrough] = useState(false);
  
  // Fonction pour appliquer/désappliquer les styles
  const toggleBold = () => setBold(!bold);
  const toggleItalic = () => setItalic(!italic);
  const toggleUnderline = () => setUnderline(!underline);
  const toggleStrikeThrough = () => setStrikeThrough(!strikeThrough);

  return (
    <div className="flex items-center justify-between mb-2 border-b pb-2">
      {/* Texte d'introduction */}
      <div className="text-sm text-gray-700 font-medium">Outils de texte</div>
      
      {/* Liste des outils avec les icônes */}
      <div className="flex space-x-4">
        <button
          onClick={toggleBold}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${bold ? 'bg-gray-300' : ''}`}
        >
          <strong className={`${bold ? 'text-blue-500' : 'text-gray-600'}`}>B</strong>
        </button>
        
        <button
          onClick={toggleItalic}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${italic ? 'bg-gray-300' : ''}`}
        >
          <em className={`${italic ? 'text-blue-500' : 'text-gray-600'}`}>I</em>
        </button>
        
        <button
          onClick={toggleUnderline}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${underline ? 'bg-gray-300' : ''}`}
        >
          <u className={`${underline ? 'text-blue-500' : 'text-gray-600'}`}>U</u>
        </button>
        
        <button
          onClick={toggleStrikeThrough}
          className={`p-2 rounded hover:bg-gray-100 transition-all ${strikeThrough ? 'bg-gray-300' : ''}`}
        >
          <span className={`${strikeThrough ? 'text-blue-500' : 'text-gray-600'}`} style={{ textDecoration: 'line-through' }}>S</span>
        </button>
      </div>
    </div>
  );
}
