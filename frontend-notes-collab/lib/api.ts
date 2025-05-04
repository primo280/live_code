// Fonction pour obtenir le token d'authentification
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Fonction pour effectuer des requêtes API avec authentification
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Fonction pour gérer les erreurs de requête
export const handleApiError = (error: any): string => {
  console.error("API Error:", error)

  if (error.response) {
    // La requête a été faite et le serveur a répondu avec un code d'état
    // qui n'est pas dans la plage 2xx
    return error.response.data.message || "Une erreur est survenue"
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    return "Aucune réponse du serveur"
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    return error.message || "Une erreur est survenue"
  }
}
