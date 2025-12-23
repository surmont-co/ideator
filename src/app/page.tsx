import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getUser } from "@/lib/auth";

export default async function Home() {
  const user = await getUser();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-transparent relative">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {user && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {user.firstName || user.email}
          </span>
        )}
        <ModeToggle />
      </div>

      <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Ideator CLI Agent</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
        Aplicația a fost inițializată cu succes. Proiectul folosește Next.js, SQLite și Drizzle.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full">
        <Link 
          href="/mockup"
          className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left bg-white dark:bg-slate-900"
        >
          <span className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">👁️ Vezi Mockup UI</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Vizualizează componenta de acordeon cu graficul de voturi integrat.
          </span>
        </Link>
        
        {user ? (
           <Link 
             href="/api/auth/logout"
             className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all bg-white dark:bg-slate-900"
           >
             <span className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">👋 Logout</span>
             <span className="text-sm text-slate-500 dark:text-slate-400">
               Deloghează-te din contul curent ({user.email}).
             </span>
           </Link>
        ) : (
          <Link 
            href="/api/auth/login"
            className="flex flex-col p-6 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all bg-white dark:bg-slate-900"
          >
            <span className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">🔑 Login cu WorkOS</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Autentifică-te prin SSO sau Email pentru a vota.
            </span>
          </Link>
        )}
      </div>

      <footer className="mt-16 text-slate-400 dark:text-slate-500 text-sm">
        Porniți serverul cu <code>npm run dev</code> pentru a începe.
      </footer>
    </main>
  );
}