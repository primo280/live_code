'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function Notification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Fonction de chargement
    const fetchNotification = () => {
      api.get('/notifications')
        .then((res) => setNotification(res.data))
        .catch(console.error);
    };

    // Chargement initial
    fetchNotification();

    
  }, []);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-105">
        <CheckCircle className="h-6 w-6 text-green-700" />
        <div>
          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
          <p className="text-xs text-white-900">par {notification.author}</p>
        </div>
        <button
          className="ml-auto text-white hover:text-red-200"
          onClick={() => setNotification(null)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
