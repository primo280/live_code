"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, ArrowLeft, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import NoteEditor from "@/components/note-editor"
import DashboardHeader from "@/components/dashboard-header"

export default function NewNotePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, {
        method: "POST",
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
        throw new Error("Erreur lors de la création de la note")
      }

      const data = await response.json()

      toast({
        title: "Succès",
        description: "Note créée avec succès",
      })

      router.push(`/notes/${data._id}`)
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la note",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <header className="border-b bg-background sticky top-16 z-10">
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

          <div className="border rounded-lg p-4 min-h-[500px] bg-background">
            <NoteEditor content={content} onChange={handleContentChange} />
          </div>
        </div>
      </div>
    </div>
  )
}
