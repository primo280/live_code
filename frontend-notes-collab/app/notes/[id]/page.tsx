"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, ArrowLeft, Users, Tag, Trash, History, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import NoteEditor from "@/components/note-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { io, type Socket } from "socket.io-client"
import { useTheme } from "next-themes"
import ShareDialog from "@/components/share-dialog"

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface User {
  id: string
  username: string
  color: string
  cursor?: { x: number; y: number }
}

export default function NotePage() {
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { theme } = useTheme()
  const editorRef = useRef<HTMLDivElement>(null)
  const isNewNote = params.id === "new"

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
    }

    // Initialiser la connexion WebSocket
    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server")
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
    })

    setSocket(socketInstance)

    // Charger la note si ce n'est pas une nouvelle note
    if (!isNewNote) {
      fetchNote(params.id as string)
    } else {
      setIsLoading(false)
    }

    return () => {
      socketInstance.disconnect()
    }
  }, [router, params.id, isNewNote])

  useEffect(() => {
    if (!socket || !note || isNewNote) return

    // Rejoindre la salle de la note
    socket.emit("join-note", note._id)

    // Écouter les mises à jour de contenu
    socket.on("content-update", (updatedContent: string) => {
      setContent(updatedContent)
    })

    // Écouter les mises à jour de titre
    socket.on("title-update", (updatedTitle: string) => {
      setTitle(updatedTitle)
    })

    // Écouter les utilisateurs actifs
    socket.on("active-users", (users: User[]) => {
      setActiveUsers(users)
    })

    // Écouter les mouvements de curseur
    socket.on("cursor-move", (user: User) => {
      setActiveUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, cursor: user.cursor } : u)))
    })

    return () => {
      socket.emit("leave-note", note._id)
      socket.off("content-update")
      socket.off("title-update")
      socket.off("active-users")
      socket.off("cursor-move")
    }
  }, [socket, note, isNewNote])

  const fetchNote = async (noteId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de la note")
      }

      const data = await response.json()
      setNote(data)
      setTitle(data.title)
      setContent(data.content)
      setTags(data.tags)
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la note",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    if (socket && note) {
      socket.emit("update-content", { noteId: note._id, content: newContent })
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (socket && note) {
      socket.emit("update-title", { noteId: note._id, title: newTitle })
    }
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()])
      }
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre ne peut pas être vide",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const url = isNewNote
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/notes`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${params.id}`
      const method = isNewNote ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de la note")
      }

      const data = await response.json()

      toast({
        title: "Succès",
        description: isNewNote ? "Note créée avec succès" : "Note mise à jour avec succès",
      })

      if (isNewNote) {
        router.push(`/notes/${data._id}`)
      } else {
        setNote(data)
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la note",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${note._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la note")
      }

      toast({
        title: "Succès",
        description: "Note supprimée avec succès",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!socket || !note || !editorRef.current) return

    const rect = editorRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    socket.emit("cursor-move", {
      noteId: note._id,
      cursor: { x, y },
    })
  }

  const viewHistory = () => {
    if (!note) return
    router.push(`/notes/${note._id}/history`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" onMouseMove={handleMouseMove}>
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Titre de la note"
                className="text-lg font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              {activeUsers.length > 0 && (
                <div className="flex items-center mr-2">
                  <Users className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-500">{activeUsers.length}</span>
                </div>
              )}
              {!isNewNote && (
                <>
                  <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={viewHistory}>
                    <History className="w-4 h-4" />
                  </Button>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer la note</DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Supprimer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag} ×
              </Badge>
            ))}
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Ajouter un tag..."
              className="w-32 h-6 text-xs"
            />
          </div>

          <div ref={editorRef} className="relative border rounded-lg p-4 min-h-[500px] bg-background">
            <NoteEditor content={content} onChange={handleContentChange} />

            {/* Curseurs des autres utilisateurs */}
            {activeUsers
              .filter((user) => user.id !== currentUser?.id && user.cursor)
              .map((user) => (
                <div
                  key={user.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: user.cursor?.x,
                    top: user.cursor?.y,
                    zIndex: 50,
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: user.color }}></div>
                  <div
                    className="absolute top-4 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.username}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Dialogue de partage */}
      {!isNewNote && note && (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          noteId={note._id}
          noteTitle={note.title}
        />
      )}
    </div>
  )
}
