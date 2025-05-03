"use client";
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/userStore';

export default function LoginPage() {
  const router = useRouter();
  const setUsername = useUserStore((s) => s.setUsername);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget as any).elements.username.value;
    if (name) {
      setUsername(name);
      router.push('/notes');
    }
  };

  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">NOTES COLLAB</h1>
        <p className="text-lg sm:text-xl text-white mt-2">Gérez vos notes en toute simplicité</p>
      </div>
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full sm:w-96 max-w-sm">
        <h2 className="text-2xl mb-4 text-gray-900 font-semibold">Connexion</h2>
        <input
          name="username"
          className="border p-3 w-full mb-4 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nom d'utilisateur"
          required
        />
        <button className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition duration-300">
          Se connecter
        </button>
      </form>
    </main>
  );
}
