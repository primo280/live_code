"use client"

import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface NoteCardProps {
  note: Note
  onClick: () => void
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  // Fonction pour extraire le texte brut du contenu HTML
  const extractTextFromHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Formater la date relative
  const formattedDate = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{note.title || "Sans titre"}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
          {truncateText(extractTextFromHtml(note.content), 150) || "Aucun contenu"}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{note.tags.length - 3}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Modifié {formattedDate}</p>
      </CardFooter>
    </Card>
  )
}
