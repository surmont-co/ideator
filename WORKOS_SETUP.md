# Configurare WorkOS pentru Proiectul Ideator

Pentru a activa autentificarea (SSO/Magic Link) în aplicația Ideator, trebuie să configurezi un proiect în WorkOS și să obții credențialele necesare.

## Pasul 1: Creare Cont și Organizație

1.  Mergi pe [WorkOS Dashboard](https://dashboard.workos.com/) și creează-ți un cont.
2.  Creează o nouă organizație (ex: "My Company Ideator").

## Pasul 2: Configurare Redirect URI

În dashboard-ul WorkOS, mergi la secțiunea **Configuration** -> **Redirect URIs**.
Trebuie să adaugi URI-ul unde WorkOS va trimite utilizatorul înapoi după logare. Pentru mediul local, acesta este de obicei:

*   `http://localhost:3000/api/auth/callback`

(Dacă portul tău e diferit, ajustează corespunzător).

## Pasul 3: Obținere Credențiale

Ai nevoie de următoarele chei pe care să le pui în fișierul `.env.local` din rădăcina proiectului:

1.  **WorkOS Client ID:** Se găsește în **Configuration** -> **General**.
    *   Ex: `client_...`
2.  **WorkOS API Key:** Se găsește în **Configuration** -> **API Keys**.
    *   Generează o nouă cheie secretă.
    *   Ex: `sk_...`
3.  **WorkOS Redirect URI:** URL-ul setat la pasul 2.

## Pasul 4: Setare Variabile de Mediu

Creează un fișier numit `.env.local` în rădăcina proiectului (lângă `package.json`) și adaugă următorul conținut:

```env
# WorkOS Configuration
WORKOS_CLIENT_ID="insereaza_aici_client_id"
WORKOS_API_KEY="insereaza_aici_api_key"
WORKOS_REDIRECT_URI="http://localhost:3000/api/auth/callback"
WORKOS_COOKIE_PASSWORD="o_parola_lunga_si_sigura_de_minim_32_caractere"

# Database (Optional, default e database.sqlite)
DATABASE_URL="database.sqlite"
```

**Notă:** `WORKOS_COOKIE_PASSWORD` este folosită pentru a cripta sesiunea utilizatorului. Poți genera una random (ex: folosind `openssl rand -base64 32` în terminal).

## Pasul 5: Activare Metode de Logare

În dashboard, mergi la **Authentication** și activează metodele dorite (ex: Google OAuth, Microsoft, Magic Link).

---

După ce ai completat aceste date, repornește serverul de dezvoltare (`npm run dev`), iar autentificarea ar trebui să funcționeze.
