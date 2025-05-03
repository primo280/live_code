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
    <main className="h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-2xl mb-4 text-gray-900">Connexion</h1>
        <input name="username" className="border p-2 w-full mb-4 text-gray-600" placeholder="Nom d'utilisateur" required />
        <button className="bg-blue-600 text-white w-full py-2 rounded">Se connecter</button>
      </form>
    </main>
  );
}
