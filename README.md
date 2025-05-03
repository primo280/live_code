# live_code

# 📝 Applications web de notes collaboratif

Une application web de prise de notes collaborative avec notifications en temps réel.

---

## 🌐 Structure du projet

### 📁 Backend (Node.js + Express + MongoDB)

```
backend-notes-collab/
│
├── controllers/
│   └── noteController.js
│   └── notificationController.js
│
├── models/
│   └── Note.js
│   └── Notification.js
│
├── routes/
│   └── noteRoutes.js
│   └── notificationRoutes.js
│
├── app.js
└── server.js
└── swagger.js
```

### 📁 Frontend (Next.js 15 + TailwindCSS + Zustand)

```
frontend-notes-collab/
src
│
├── app/
│   └── page.tsx
│   └── notes/[id]/page.tsx
│       └── page.tsx
├── components/
│   └── Notification.tsx
│   └── CusorOverlay.tsx
│   └── NoteCard.tsx
│   └── ToolBar.tsx
├── lib/
│   └── api.ts
├── store/
│   └── noteStore.ts
│   └── notificationStore.ts
│   └── userStore.ts
│
├── types/
│   └──index.ts
│
└── tailwind.config.js
```

---

## ⚙️ Fonctionnalités

- ✍️ Création, édition et suppression de notes
- 🧠 Recherche de notes par titre ou contenu
- 🔔 Notification en temps réel de la dernière modification
- 👥 Support multiauteurs
- ⏱️ Affichage des notifications toutes les 5 secondes

---

## 🚀 Lancer le projet

### 1. Backend

```bash
cd backend-notes-collab
npm install
npm start
```

Crée un fichier `.env` :

```
MONGODB_URI=mongodb://localhost:27017/notes
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend

```bash
cd frontend-notes-collab
npm install
npm run dev
```

Configure `/lib/api.ts` pour pointer vers ton backend local :

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/',
});

export default api;
```

---

## 📑 Documentation de l’API

### 🔹 GET /api/notes

- Description : Récupère toutes les notes.
- Réponse : `200 OK`
```json
[{ "_id": "...", "title": "...", "content": "...", "author": "...", "tags": [...] }]
```

### 🔹 GET /api/notes/:id

- Description : Récupère une note spécifique.

### 🔹 POST /api/notes

- Body :
```json
{
  "title": "Titre",
  "content": "Contenu",
  "tags": ["tag1", "tag2"],
  "author": "Auteur"
}
```

### 🔹 PUT /api/notes/:id

- Met à jour une note et génère une notification.

### 🔹 GET /api/notifications

- Description : Récupère les notifications.
- Réponse : Liste des notifications les plus récentes.

---

## 📌 Auteur

Développé par DOHA PRIMAEL – Génie logiciel.

---

## 🛠️ Outils utilisés

- **Backend** : Express, Mongoose
- **Frontend** : Next.js 15, TailwindCSS, Zustand
- **Base de données** : MongoDB
- **SOCKECT
