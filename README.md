> [!NOTE]
> This is a group project for COMPSCI 520.

We aim to develop an application that provides **personalized personality insights** based on users' Spotify listening habits. By integrating the open-source **Spotify API** with a machine learning model we plan to develop, our app will analyze a user's listening history to discover patterns and categorize their musical "vibes."

This repo is structured into two main folders:

-   [`/client`](./client): Next.js frontend that presents your music personality data.
-   [`/middleware`](./middleware): Express backend for Spotify OAuth, data processing, and Supabase (database) interactions.

This repo is structured into two main folders:

```
/
├── client/
└── middleware/
```

## Project Structure

```
/
├── client/
└── middleware/
    └── src/
    ├── routes/
    │   ├── auth.ts
    │   ├── me.ts
    │   ├── feedback.ts
    │   └── spotifyAuth.ts
    ├── constants.ts
    ├── server.ts
    └── supabase.ts
```

## Project Overview

The middleware serves as a bridge between the client (frontend), and Supabase and Spotify's Web API. Middleware routes includes:

OAuth (`auth.ts`):

-   OAuth 2.0 login, registration flow (`/auth/login`, `/auth/register`)
-   User's data (`/auth/me`)

Spotify Web API access (`spotifyAuth.ts`):

-   Logging in (`/spotify-auth/login`)
-   Spotify account's authorization (`/spotify-auth/callback`)
-   Refresh access token (`/spotify-auth/refresh`)

Spotify's User Metadata (`me.ts`)

-   Spotify token validation and profile fetching
-   Fetch and return user profile data from Supabase (e.g. personality traits, vibes summary)

Feedback System (`feedback.ts`)

-   Submit feedback: `POST /feedback`
-   Fetch all feedback: `GET /feedbacks`
-   Fetch specific feedback by ID: `GET /feedbacks/:id` where `id` is the feedback's id
-   Comment on a given feedback: `POST /feedback/:id/comment` where `id` is the feedback's id
-   Vote on a given feedback: `POST /feedback/:id/:voteType` where `id` is the feedback's id and `voteType` is either `upvote` or `downvote`

> [!IMPORTANT]
> To use the middleware, create a `.env` file inside `/middleware`:
>
> ```
> SPOTIFY_CLIENT_ID=<your_spotify_client_id>
> SPOTIFY_CLIENT_SECRET=<your_spotify_client_secret>
> SPOTIFY_REDIRECT_URI=http://localhost:6969/spotify-auth/callback
> MIDDLEWARE_PORT=6969
> GEMINI_API_KEY=<your_gemini_api_key>
> SUPABASE_URL=<your_supabase_project_url>
> SUPABASE_ANON_KEY=<your_supabase_anon_key>
> ```

> [!TIP]
> You will need an account from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) to generate the `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
>
> To do so,
>
> 1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
> 2. Log in with your Spotify account.
> 3. Click **"Create App"**.
> 4. Name your app and add a short description.
> 5. After creating the app, you’ll be provided with:
>
> -   **Client ID**
> -   **Client Secret**
>
> 6. Add a **Redirect URI**:
>
> ```
> http://localhost:6969/spotify-auth/callback
> ```

When all of the aforementioned steps are complete, install dependencies and run the middleware like so:

```zsh
cd middleware
npm install
npm run dev
```

The middleware will be served at: [http://localhost:6969](http://localhost:6969).

---

### `/client` (Frontend)

The frontend is a Next.js application designed to visually represent a user's musical personality.

#### Current Features

-   [x] **Login and register with Supabase** (`/login`)
-   [x] Auth callback handler and token storage
-   [x] Redirect to `/dashboard` — if and only if, after a successful login
-   [x] Feedback posting
    -   [x] UI for viewing all feedbacks
    -   [x] UI for viewing specific feedback and with comment system

#### In Progress

-   [ ] Spotify data fetching and vibes personality computation
-   [ ] UI: dynamic visualization of musical vibes

To run the frontend, install all dependencies and start it like so:

```zsh
cd client
npm install
npm run dev
```

Then navigate to [http://localhost:3000](http://localhost:3000)

---

> [!TIP]
>
> The OAuth redirect flow goes:
>
> 1.  Frontend: `/login` →
> 2.  Middleware: `/auth/login` → Supabase →
> 3.  If successful, frontend will redirect to → `/dashboard`
>
> Spotify Web API flow goes:
>
> 1. `/dashboard` page (only accessible through successful connection with Supabase)
> 2. User initiates connection with Spotify using "Login with Spotify" button.
> 3. Middleware: `/spotify-auth/login` → Spotify → `/spotify-auth/callback` →
> 4. Middleware redirects to frontend: `/spotify-auth/callback?access_token=...` → `/dashboard`
>
> Successful connection with spotify will render `/dashboard` to showcase more content than before. This includes graphs, insights, etc.

> [!NOTE]
> Frontend stores `site_access` (Supabase) and `access_token` (Spotify) in `localStorage` (for now). If time permits, this **WILL** be handled more securely.
