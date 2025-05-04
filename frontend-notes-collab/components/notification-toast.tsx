"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { io, type Socket } from "socket.io-client"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Notification {
  _id: string
  userId: string
  noteId: string
  noteTitle: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState<Socket | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("token")
    if (!token) return

    // Initialiser la connexion WebSocket
    const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: { token },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server for notifications")
    })

    socketInstance.on("notification", (notification: Notification) => {
      // Ajouter la notification à l'état
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Afficher un toast pour la notification
      toast({
        title: "Nouvelle notification",
        description: notification.message,
        action: (
          <button
            onClick={() => router.push(`/notes/${notification.noteId}`)}
            className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90"
          >
            Voir
          </button>
        ),
      })
    })

    setSocket(socketInstance)

    // Charger les notifications existantes
    fetchNotifications()

    return () => {
      socketInstance.disconnect()
    }
  }, [toast, router])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des notifications")
      }

      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((notif: Notification) => !notif.read).length)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la notification")
      }

      // Mettre à jour l'état local
      setNotifications((prev) => prev.map((notif) => (notif._id === notificationId ? { ...notif, read: true } : notif)))
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des notifications")
      }

      // Mettre à jour l'état local
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    router.push(`/notes/${notification.noteId}`)
    setShowNotifications(false)
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: fr,
    })
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 z-50 w-80 mt-2 overflow-hidden bg-white rounded-md shadow-lg dark:bg-gray-800 border dark:border-gray-700">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline" onClick={markAllAsRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{notification.noteTitle}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">Aucune notification pour le moment</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
