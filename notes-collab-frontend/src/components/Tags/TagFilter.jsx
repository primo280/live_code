import { useState } from 'react'

export default function TagFilter({ notes, onFilter }) {
  const allTags = [...new Set(notes.flatMap(note => note.tags))]
  const [selectedTag, setSelectedTag] = useState('')

  const handleFilter = (tag) => {
    const newTag = selectedTag === tag ? '' : tag
    setSelectedTag(newTag)
    onFilter(newTag)
  }

  if (allTags.length === 0) return null

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Filtrer :</span>
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleFilter(tag)}
            className={`px-2 py-1 text-xs rounded-full ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tag}
          </button>
        ))}
        {selectedTag && (
          <button
            onClick={() => handleFilter('')}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
          >
            × Effacer
          </button>
        )}
      </div>
    </div>
  )
}