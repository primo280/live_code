import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">NotesCollab</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button>Se connecter</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Collaborez sur vos notes en temps réel
                </h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Créez, éditez et partagez vos notes avec votre équipe. Travaillez ensemble en temps réel.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/login">
                  <Button size="lg">Commencer maintenant</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 border-t">
          <div className="container px-4 mx-auto">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-primary"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Édition en temps réel</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Collaborez avec votre équipe en temps réel sur vos notes.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-primary"
                  >
                    <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
                    <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"></path>
                    <path d="M3 7v10a2 2 0 0 0 2 2h4"></path>
                    <path d="m8 18 4-4"></path>
                    <path d="m12 18 4-4"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Organisation par tags</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Organisez vos notes avec des tags pour les retrouver facilement.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-primary"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Formatage de texte</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Mettez en forme vos notes avec des options de formatage basiques.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 NotesCollab. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
