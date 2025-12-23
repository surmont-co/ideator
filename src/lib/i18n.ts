export type Locale = "en" | "ro";

const defaultLocaleEnv =
    (process.env.LOCALE || "en").toLowerCase().startsWith("ro") ? "ro" : "en";

const translations: Record<Locale, Record<string, string>> = {
    en: {
        "nav.dashboard": "Dashboard",
        "nav.newProject": "New Project",
        "nav.myProjects": "My Projects",
        "nav.myContributions": "My Contributions",
        "nav.logout": "Logout",
        "nav.addProposal": "Add Proposal",

        "dashboard.title": "Dashboard",
        "dashboard.welcome": "Welcome back, {name}. Here are the latest initiatives.",
        "dashboard.noProjectsTitle": "No projects found.",
        "dashboard.noProjectsBody": "Start by creating a project to gather proposals, votes, and discussions from your team.",
        "dashboard.createFirst": "Create your first project",
        "dashboard.viewResults": "View Results",
        "dashboard.contribute": "Contribute...",
        "dashboard.details": "Details...",
        "dashboard.deadline": "Deadline:",
        "dashboard.stats.proposals": "Proposals",
        "dashboard.stats.votes": "Votes",
        "dashboard.stats.comments": "Comments",
        "dashboard.stats.votesUp": "Upvotes",
        "dashboard.stats.votesDown": "Downvotes",
        "dashboard.stats.noVotes": "No votes yet",
        "dashboard.status.active": "Active",
        "dashboard.status.closed": "Closed",

        "project.back": "Back to Projects",
        "project.addProposal": "Add Proposal",
        "project.proposalsTitle": "Proposals",
        "project.proposalsSub": "Open a card to vote, then jump into the discussion.",
        "project.noProposals": "No proposals yet. Be the first to add one!",
        "project.due": "Due {label}",
        "project.showDetails": "View details",
        "project.hideDetails": "Hide details",
        "project.regenerateSummary": "Regenerate summary",
        "project.deadlineLabel": "Deadline",

        "proposalForm.title": "Title (one-line definition) *",
        "proposalForm.description": "Description (supports Markdown)",
        "proposalForm.upvote": "Upvote",
        "proposalForm.downvote": "Downvote",
        "proposalForm.submit": "Add Proposal",
        "proposalForm.submitting": "Adding Proposal...",
        "proposalForm.similarTitle": "Your proposal looks similar to existing ones",
        "proposalForm.similarSubtitle": "We found proposals on this project that are very close to what you wrote. Review them before adding a new one.",
        "proposalForm.submitAnyway": "Submit my proposal anyway",
        "proposalForm.cancel": "Cancel",
        "proposalForm.summaryPreview": "Preview of your proposal summary",
        "proposalForm.checkingSimilarity": "Checking for similar proposals...",
        "proposalForm.analyzing": "Analyzing...",
        "suggestions.cta": "Suggest proposals",
        "suggestions.title": "AI suggestions",
        "suggestions.subtitle": "Quick ideas based on this project",
        "suggestions.generating": "Generating...",
        "suggestions.none": "No suggestions returned.",
        "suggestions.error": "Could not generate suggestions right now.",
        "suggestions.viewDetails": "View details",
        "suggestions.noSummary": "No summary provided",
        "suggestions.cancel": "Close",
        "suggestions.addSelected": "Add selected",
        "suggestions.submitting": "Adding...",
        "suggestions.close": "Done",
        "proposal.comments": "Comments",
        "proposal.upDown": "Up {up} / Down {down}",

        "proposalList.noDescription": "No description.",
        "proposalList.comments": "Comments",
        "proposalList.showDetails": "View details",
        "proposalList.hideDetails": "Hide details",
    },
    ro: {
        "nav.dashboard": "Dashboard",
        "nav.newProject": "Proiect nou",
        "nav.myProjects": "Proiectele mele",
        "nav.myContributions": "Contribuțiile mele",
        "nav.logout": "Delogare",
        "nav.addProposal": "Adaugă propunere",

        "dashboard.title": "Dashboard",
        "dashboard.welcome": "Bun venit, {name}. Iată cele mai noi inițiative.",
        "dashboard.noProjectsTitle": "Nu există proiecte.",
        "dashboard.noProjectsBody": "Începe prin a crea un proiect pentru a strânge propuneri, voturi și discuții.",
        "dashboard.createFirst": "Creează primul proiect",
        "dashboard.viewResults": "Vezi rezultate",
        "dashboard.contribute": "Contribuie...",
        "dashboard.details": "Detalii...",
        "dashboard.deadline": "Termen:",
        "dashboard.stats.proposals": "Propuneri",
        "dashboard.stats.votes": "Voturi",
        "dashboard.stats.comments": "Comentarii",
        "dashboard.stats.votesUp": "Voturi pro",
        "dashboard.stats.votesDown": "Voturi contra",
        "dashboard.stats.noVotes": "Fără voturi încă",
        "dashboard.status.active": "Activ",
        "dashboard.status.closed": "Închis",

        "project.back": "Înapoi la proiecte",
        "project.addProposal": "Adaugă propunere",
        "project.proposalsTitle": "Propuneri",
        "project.proposalsSub": "Deschide un card pentru a vota, apoi intră în discuție.",
        "project.noProposals": "Nu există propuneri. Fii primul care adaugă una!",
        "project.due": "Expiră {label}",
        "project.showDetails": "Vezi detalii",
        "project.hideDetails": "Ascunde detalii",
        "project.regenerateSummary": "Regenerează sumarul",
        "project.deadlineLabel": "Termen limită",

        "proposalForm.title": "Titlu (definiție pe scurt) *",
        "proposalForm.description": "Descriere (suport Markdown)",
        "proposalForm.upvote": "Votează Pro",
        "proposalForm.downvote": "Votează Contra",
        "proposalForm.submit": "Adaugă propunere",
        "proposalForm.submitting": "Se adaugă propunerea...",
        "proposalForm.similarTitle": "Propunerea ta seamănă cu altele existente",
        "proposalForm.similarSubtitle": "Am găsit propuneri pe acest proiect foarte apropiate de ce ai scris. Verifică-le înainte să adaugi una nouă.",
        "proposalForm.submitAnyway": "Adaugă totuși propunerea mea",
        "proposalForm.cancel": "Renunță",
        "proposalForm.summaryPreview": "Rezumatul propunerii tale",
        "proposalForm.checkingSimilarity": "Verificăm propunerile similare...",
        "proposalForm.analyzing": "Analizăm...",
        "suggestions.cta": "Sugerează propuneri",
        "suggestions.title": "Sugestii AI",
        "suggestions.subtitle": "Idei rapide pe baza acestui proiect",
        "suggestions.generating": "Generăm...",
        "suggestions.none": "Nu am găsit sugestii.",
        "suggestions.error": "Nu putem genera sugestii acum.",
        "suggestions.viewDetails": "Vezi detalii",
        "suggestions.noSummary": "Fără rezumat",
        "suggestions.cancel": "Închide",
        "suggestions.addSelected": "Adaugă selecția",
        "suggestions.submitting": "Se adaugă...",
        "suggestions.close": "Gata",
        "proposal.comments": "Comentarii",
        "proposal.upDown": "Pro {up} / Contra {down}",

        "proposalList.noDescription": "Fără descriere.",
        "proposalList.comments": "Comentarii",
        "proposalList.showDetails": "Vezi detalii",
        "proposalList.hideDetails": "Ascunde detalii",
    },
};

export const supportedLocales: Locale[] = ["en", "ro"];

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
    const table = translations[locale] || translations.en;
    const fallback = translations.en[key] || key;
    let phrase = table[key] || fallback || key;
    if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
            phrase = phrase.replace(`{${k}}`, String(v));
        });
    }
    return phrase;
}

export function getTranslations(locale?: Locale) {
    const loc = locale || (defaultLocaleEnv as Locale);
    return {
        locale: loc,
        t: (key: string, vars?: Record<string, string | number>) => t(loc, key, vars),
    };
}

export function getDefaultLocale(): Locale {
    return defaultLocaleEnv as Locale;
}
