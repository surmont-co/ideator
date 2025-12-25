import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/ProposalAccordion";
import { ModeToggle } from "@/components/ui/mode-toggle";

const DUMMY_PROPOSALS = [
  {
    id: "1",
    title: "Implementare CI/CD pentru 3 clienți",
    description: "Ar fi ideal să sistematizăm pipeline-ul de livrare, începând în 2026 cu minim 3 clienți mici. Beneficii: deploys mai sigure și rapide.",
    upvotes: 12,
    downvotes: 2,
    author: "CTO",
  },
  {
    id: "2",
    title: "Implementarea Open Fridays company-wide",
    description: "Ne focusăm 4 din 5 zile pe săptămână pe un minim de 7 ore billables, iar vinerea o alocăm complet activităților de creștere personală și de echipă.",
    upvotes: 25,
    downvotes: 0,
    author: "CEO",
  },
  {
    id: "3",
    title: "Utilizarea Fax-ului în departament",
    description: "Să revenim la tehnologii mai sigure și mai puțin dependente de internet pentru documentele critice.",
    upvotes: 1,
    downvotes: 15,
    author: "Old School Manager",
  },
];

export default function MockupPage() {
  const maxVotes = Math.max(...DUMMY_PROPOSALS.map(p => Math.max(p.upvotes, p.downvotes)));

  return (
    <main className="max-w-4xl mx-auto p-8 relative">
      <div className="absolute top-8 right-8">
        <ModeToggle />
      </div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Propuneri de îmbunătățiri 2026</h1>
        <p className="text-slate-600 dark:text-slate-400">Deadline: 2025-12-24</p>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <h2 className="sr-only">Lista Propuneri</h2>
        <Accordion type="single" collapsible className="w-full">
          {DUMMY_PROPOSALS.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).map((proposal) => (
            <AccordionItem key={proposal.id} value={proposal.id} className="border-slate-200 dark:border-slate-800">
              <AccordionTrigger 
                upvotes={proposal.upvotes} 
                downvotes={proposal.downvotes}
                maxPossibleVotes={maxVotes}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {proposal.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold">Autor:</span> {proposal.author}
                  </div>
                  <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                    {proposal.description}
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-medium">
                      <span>▲</span> +1
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium">
                      <span>▼</span> -1
                    </button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}
