"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import DashboardHeader from "@/components/dashboard-header"
import { useToast } from "@/hooks/use-toast"

interface HistoryEntry {
  _id: string
  noteId: string
  userId: string
  username: string
  title: string
  content: string
  tags: string[]
  action: string
  createdAt: string
}

export default function NoteHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Charger l'historique de la note
    fetchHistory()
  }, [router, params.id])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${params.id}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'historique")
      }

      const data = await response.json()
      setHistory(data)

      // Sélectionner la première entrée par défaut
      if (data.length > 0) {
        setSelectedEntry(data[0])
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique de la note",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const restoreVersion = async (historyId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${params.id}/restore/${historyId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la restauration de la version")
      }

      toast({
        title: "Succès",
        description: "Version restaurée avec succès",
      })

      // Rediriger vers la page de la note
      router.push(`/notes/${params.id}`)
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de restaurer cette version",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatRelativeDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    })
  }

  // Fonction pour extraire le texte brut du contenu HTML
  const extractTextFromHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/notes/${params.id}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">Historique des modifications</h1>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                <Clock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Aucun historique disponible</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
                L'historique des modifications sera disponible après les premières modifications.
              </p>
              <Button onClick={() => router.push(`/notes/${params.id}`)}>Retour à la note</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <h2 className="text-lg font-medium">Versions</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {history.map((entry) => (
                    <div
                      key={entry._id}
                      className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedEntry?._id === entry._id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{entry.action}</span>
                        <span className="text-xs text-gray-500">{formatRelativeDate(entry.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{entry.title || "Sans titre"}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>par {entry.username}</span>
                        <span className="ml-auto">{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                {selectedEntry ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{selectedEntry.title || "Sans titre"}</h2>
                        <Button onClick={() => restoreVersion(selectedEntry._id)}>Restaurer cette version</Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedEntry.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="prose dark:prose-invert max-w-none border p-4 rounded-md min-h-[300px] bg-white dark:bg-gray-900">
                        <div dangerouslySetInnerHTML={{ __html: selectedEntry.content }} />
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        <p>
                          Version créée le {formatDate(selectedEntry.createdAt)} par {selectedEntry.username}
                        </p>
                        <p>Action: {selectedEntry.action}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Sélectionnez une version pour voir les détails</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
