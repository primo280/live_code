"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter } from "lucide-react"
import NoteCard from "@/components/note-card"
import DashboardHeader from "@/components/dashboard-header"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Charger les notes
    fetchNotes()
  }, [router])

  useEffect(() => {
    // Filtrer les notes en fonction de la recherche et des tags sélectionnés
    let filtered = notes

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => selectedTags.some((tag) => note.tags.includes(tag)))
    }

    setFilteredNotes(filtered)
  }, [notes, searchQuery, selectedTags])

  const fetchNotes = async () => {
  setIsLoading(true)
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des notes")
    }

    const data = await response.json()
    setNotes(data)
    setFilteredNotes(data)

    // Extraire tous les tags uniques et s'assurer que chaque tag est une chaîne de caractères
    const tags: string[] = Array.from(new Set(data.flatMap((note: Note) => note.tags)))
    setAllTags(tags)
  } catch (error) {
    console.error("Erreur:", error)
    toast({
      title: "Erreur",
      description: "Impossible de charger les notes",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}


  const handleCreateNote = () => {
    router.push("/notes/new")
  }

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Mes Notes</h1>
            <Button onClick={handleCreateNote}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Note
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher des notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer par tag
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {allTags.length > 0 ? (
                  allTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className="flex items-center justify-between"
                    >
                      {tag}
                      {selectedTags.includes(tag) && <span className="flex h-2 w-2 rounded-full bg-primary"></span>}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Aucun tag disponible</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagSelect(tag)}>
                  {tag} ×
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setSelectedTags([])}>
                Effacer tout
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-4 h-40 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard key={note._id} note={note} onClick={() => handleNoteClick(note._id)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Aucune note trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
                {notes.length > 0
                  ? "Essayez de modifier vos filtres ou votre recherche."
                  : "Commencez par créer votre première note."}
              </p>
              {notes.length === 0 && (
                <Button onClick={handleCreateNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une note
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
