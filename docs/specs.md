Iată specificația tehnică completă (Product Requirements Document) pregătită pentru a fi înmânată unui dezvoltator. Este structurată pentru un stack modern (ex: Next.js, Remix sau Go+Templ) care să utilizeze SQLite și WorkOS.

---

# Specificații Tehnice: Platformă de Prioritizare Democratică ("Voter/Ideator")

## 1. Obiectivul Proiectului

Crearea unei aplicații web interne pentru colectarea, dezbaterea și prioritizarea democratică a propunerilor de îmbunătățire în cadrul companiei. Sistemul trebuie să ofere o vizualizare matematică rapidă a consensului (Pro vs. Contra).

## 2. Stack Tehnologic Impus

* **Bază de date:** SQLite (pentru simplitate și portabilitate).
* **Autentificare:** [WorkOS](https://workos.com/) (Integrare SSO/Google/Magic Link).
* **Format conținut:** Suport complet Markdown (propuneri și comentarii).

---

## 3. Arhitectura Bazei de Date (Schema SQLite)

```sql
-- Proiecte (Ex: "Îmbunătățiri 2026")
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT, -- Markdown
    deadline DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Propuneri
CREATE TABLE proposals (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    author_id TEXT NOT NULL, -- Din WorkOS
    title TEXT NOT NULL,
    description TEXT, -- Markdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_negative_initiative BOOLEAN DEFAULT FALSE -- Dacă ideea e "Ce să eliminăm"
);

-- Voturi (Unic per user/propunere)
CREATE TABLE votes (
    proposal_id TEXT REFERENCES proposals(id),
    user_id TEXT NOT NULL,
    value INTEGER CHECK (value IN (1, -1)),
    PRIMARY KEY (proposal_id, user_id)
);

-- Comentarii (Cu suport pentru nesting/ierarhie)
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    proposal_id TEXT REFERENCES proposals(id),
    parent_id TEXT REFERENCES comments(id), -- Pentru thread-uri
    author_id TEXT NOT NULL,
    content TEXT NOT NULL, -- Markdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

---

## 4. Funcționalități Detaliate

### A. Adăugarea Propunerilor & Deduplicarea

* **Input:** Titlu (One-line) + Descriere (Markdown).
* **Logica de prevenire duplicate:** În momentul tastării titlului, sistemul va efectua o căutare `LIKE %text%` în tabela `proposals`.
* **Acțiune:** Dacă se găsește un match > 80%, UI-ul va afișa: *"O propunere similară există deja: [Titlu]. Dorești să votezi propunerea existentă în loc să creezi una nouă?"*.

### B. Logica de Votare

* Fiecare utilizator are un singur vot per propunere (+1 sau -1).
* Dacă un utilizator apasă pe un vot deja acordat, votul se anulează (toggle).
* Dacă apasă pe votul opus, votul se schimbă.

### C. Vizualizarea Acordeon (Core Feature)

* **Ordonare:** Automată după scorul total (Voturi Pozitive - Voturi Negative).
* **Fundal (Bar Chart):** Titlul fiecărui acordeon va avea un background stratificat:
* Un punct central (0).
* Spre dreapta: Bară verde proporțională cu numărul de voturi pozitive raportat la totalul de useri activi sau totalul de voturi.
* Spre stânga: Bară roșie proporțională cu numărul de voturi negative.


* **Comportament:** La click, acordeonul se extinde pentru a arăta descrierea completă (randată din Markdown) și secțiunea de comentarii.

---

## 5. Mock-up UI (Reprezentare în Markdown)

### Pagina Proiectului: "Îmbunătățiri 2026"

**Deadline:** 24 Decembrie 2025 | **Status:** Activ

`[+ Adaugă Propunere]`

---

#### Listă Propuneri (Ordonate după scor)

| Propunere (Expandabilă) | Scor Total |
| --- | --- |
| **[======= | ---]** 1. Implementare CI/CD (3 clienți) |
| **[========== | ]** 2. Open Fridays Company-Wide |
| **[-- | -------]** 3. Utilizarea Fax-ului în departament |

---

### Detaliu Propunere (Acordeon Deschis):

> **Titlu:** Implementare CI/CD pentru 3 clienți.
> **Autor:** CTO (WorkOS User)
> **Descriere:** > Ar fi ideal să sistematizăm pipeline-ul de livrare. Beneficii:
> * Timp redus de deploy
> * Siguranță crescută
> 
> 
> **Votul tău:** `[ ▲ +1 ]` `[ ▼ -1 ]`
> ---
> 
> 
> **Comentarii:**
> * **User 1:** Sunt de acord, putem începe cu Clientul X.
> * **User 2:** Putem folosi GitHub Actions? (Reply)
> 
> 
> * **User 3:** Cred că e prea devreme pentru asta.
> 
> 

---

## 6. Reguli de Business & Validări

1. **Ownership:** Un manager trebuie să bifeze o căsuță "Îmi asum implementarea" la cel puțin una din propunerile sale. Aceasta va afișa un badge `[Owner Assumed]` lângă titlu.
2. **Deadline:** După data de `2025-12-24 23:59`, butoanele de vot și de adăugare propuneri devin inactive (Read-only).
3. **Anonymity:** Numele autorului este vizibil (nu este vot anonim), pentru a încuraja asumarea responsabilității.

## 7. Criterii de Acceptanță

1. Utilizatorul se poate loga doar via WorkOS (domeniu companie).
2. Propunerile cu scor egal sunt ordonate cronologic (cea mai nouă prima).
3. Interfața este complet responsive (trebuie să poată fi votat și de pe mobil).
4. Bar-chart-ul din background se updatează în timp real (via WebSockets sau re-fetch) la fiecare vot.

---

**Vrei să începem prin a genera codul pentru componenta de interfață (React/Tailwind) care randează acel acordeon cu bar-chart pe fundal?**