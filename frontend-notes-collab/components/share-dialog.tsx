"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, UserPlus, X, Edit2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteId: string
  noteTitle: string
}

interface SharedUser {
  _id: string
  username: string
  permission: "read" | "edit"
}

export default function ShareDialog({ open, onOpenChange, noteId, noteTitle }: ShareDialogProps) {
  const [username, setUsername] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ _id: string; username: string }[]>([])
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const { toast } = useToast()

  // Utiliser useEffect pour charger les utilisateurs partagés lorsque le dialogue s'ouvre
  useEffect(() => {
    // Charger les utilisateurs avec qui la note est déjà partagée
    const loadSharedUsers = async () => {
      if (!open || initialLoadDone) return

      setIsLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}/shared`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs partagés")
        }

        const data = await response.json()
        setSharedUsers(data)
        setInitialLoadDone(true)
      } catch (error) {
        console.error("Erreur:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs partagés",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (open && !initialLoadDone) {
      loadSharedUsers()
    }
  }, [open, initialLoadDone, noteId, toast])

  // Réinitialiser l'état lorsque le dialogue se ferme
  useEffect(() => {
    if (!open) {
      setInitialLoadDone(false)
      setSearchResults([])
      setUsername("")
    }
  }, [open])

  // Rechercher des utilisateurs
  const searchUsers = async () => {
    if (!username.trim()) return

    setIsSearching(true)
    try {
      const token = localStorage.getItem("token")

      // Afficher l'URL complète pour le débogage
      const searchUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/search?username=${encodeURIComponent(username)}`
      console.log("Recherche d'utilisateurs à l'URL:", searchUrl)

      const response = await fetch(searchUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Statut de la réponse:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur de réponse:", errorText)
        throw new Error(`Erreur lors de la recherche d'utilisateurs: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("Données reçues:", data)

      // Filtrer les utilisateurs déjà partagés
      const filteredResults = data.filter(
        (user: { _id: string }) => !sharedUsers.some((sharedUser) => sharedUser._id === user._id),
      )

      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Erreur complète:", error)
      toast({
        title: "Erreur",
        description: "Impossible de rechercher des utilisateurs",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Ajouter un utilisateur au partage
  const addUserToShare = async (userId: string, username: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          permission: "edit", // Par défaut, donner l'accès en édition
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du partage de la note")
      }

      // Ajouter l'utilisateur à la liste des utilisateurs partagés
      setSharedUsers([...sharedUsers, { _id: userId, username, permission: "edit" }])

      // Supprimer l'utilisateur des résultats de recherche
      setSearchResults(searchResults.filter((user) => user._id !== userId))

      toast({
        title: "Succès",
        description: `Note partagée avec ${username}`,
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de partager la note",
        variant: "destructive",
      })
    }
  }

  // Supprimer un utilisateur du partage
  const removeUserFromShare = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}/share/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du partage")
      }

      // Supprimer l'utilisateur de la liste des utilisateurs partagés
      setSharedUsers(sharedUsers.filter((user) => user._id !== userId))

      toast({
        title: "Succès",
        description: "Partage supprimé",
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le partage",
        variant: "destructive",
      })
    }
  }

  // Modifier les permissions d'un utilisateur
  const updateUserPermission = async (userId: string, permission: "read" | "edit") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}/share/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permission,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des permissions")
      }

      // Mettre à jour les permissions de l'utilisateur
      setSharedUsers(sharedUsers.map((user) => (user._id === userId ? { ...user, permission } : user)))

      toast({
        title: "Succès",
        description: "Permissions mises à jour",
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager la note</DialogTitle>
          <DialogDescription>
            Partagez "{noteTitle}" avec d'autres utilisateurs pour collaborer en temps réel.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Input
              placeholder="Rechercher un utilisateur par nom"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            />
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span>{user.username}</span>
                    <Button size="sm" variant="ghost" onClick={() => addUserToShare(user._id, user.username)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="button" onClick={searchUsers} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Utilisateurs avec accès</h4>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : sharedUsers.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              {sharedUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      defaultValue={user.permission}
                      onValueChange={(value) => updateUserPermission(user._id, value as "read" | "edit")}
                    >
                      <SelectTrigger className="w-[110px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">
                          <div className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Lecture</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center">
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Édition</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => removeUserFromShare(user._id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
              Cette note n'est pas encore partagée avec d'autres utilisateurs.
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


//