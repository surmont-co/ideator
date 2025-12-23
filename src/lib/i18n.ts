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
        "dashboard.voteDiscuss": "Vote & Discuss",
        "dashboard.deadline": "Deadline:",

        "project.back": "Back to Projects",
        "project.addProposal": "Add Proposal",
        "project.proposalsTitle": "Proposals",
        "project.proposalsSub": "Open a card to vote, then jump into the discussion.",
        "project.noProposals": "No proposals yet. Be the first to add one!",
        "project.due": "Due {label}",

        "proposalForm.title": "Title (one-line definition) *",
        "proposalForm.description": "Description (supports Markdown)",
        "proposalForm.upvote": "Upvote",
        "proposalForm.downvote": "Downvote",
        "proposalForm.submit": "Add Proposal",
        "proposalForm.submitting": "Adding Proposal...",

        "proposalList.noDescription": "No description.",
        "proposalList.comments": "Comments",
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
        "dashboard.voteDiscuss": "Votează & discută",
        "dashboard.deadline": "Termen:",

        "project.back": "Înapoi la proiecte",
        "project.addProposal": "Adaugă propunere",
        "project.proposalsTitle": "Propuneri",
        "project.proposalsSub": "Deschide un card pentru a vota, apoi intră în discuție.",
        "project.noProposals": "Nu există propuneri. Fii primul care adaugă una!",
        "project.due": "Expiră {label}",

        "proposalForm.title": "Titlu (definiție pe scurt) *",
        "proposalForm.description": "Descriere (suport Markdown)",
        "proposalForm.upvote": "Votează Pro",
        "proposalForm.downvote": "Votează Contra",
        "proposalForm.submit": "Adaugă propunere",
        "proposalForm.submitting": "Se adaugă propunerea...",

        "proposalList.noDescription": "Fără descriere.",
        "proposalList.comments": "Comentarii",
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
