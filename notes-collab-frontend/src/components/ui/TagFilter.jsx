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
    <div className="tag-filter">
      <span>Filtrer :</span>
      <div className="tags-container">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => handleFilter(tag)}
            className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
          >
            {tag}
          </button>
        ))}
        {selectedTag && (
          <button 
            onClick={() => handleFilter('')}
            className="clear-btn"
          >
            Tout effacer
          </button>
        )}
      </div>
    </div>
  )
}