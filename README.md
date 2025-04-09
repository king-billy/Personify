> [!NOTE]
> This is a group project for COMPSCI 520.

We aim to develop an application that provides **personalized personality insights** based on users' Spotify listening habits. By integrating the open-source **Spotify API** with a machine learning model we plan to develop, our app will analyze a user's listening history to discover patterns and categorize their musical "vibes."

This repo is structured into two main folders:

-   [`/client`](./client): Next.js frontend that presents your music personality data.
-   [`/middleware`](./middleware): Vite + Express backend for handling Spotify authentication and API proxying.

## Project Structure

```
/
├── client/
└── middleware/
```

## Project Overview

### `/middleware`

The middleware serves as a bridge between the frontend and the Spotify Web API. It handles:

-   OAuth 2.0 login flow (`/auth/login`)
-   Spotify callback handling (`/auth/callback`)
-   Token refresh logic (`/auth/refresh`)
-   Planned routes for deeper analysis:
    -   `/top-items`
    -   `/followed-artists`
    -   `/followed-playlists`

Inside `/middleware`, create a `.env` file:

```
SPOTIFY_CLIENT_ID=<your_spotify_client_id>
SPOTIFY_CLIENT_SECRET<your_spotify_client_secret>
MIDDLEWARE_PORT=6969
```

> [!IMPORTANT]
> You will need an account from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) to generate the `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.

Then install dependencies and run the middleware:

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

-   [x] **Login with Spotify** (`/auth/login`)
-   [x] **Callback handler** to extract `access_token` and store it
-   [x] **Successful auth redirect** to `/success`

#### In Progress

-   [ ] Token refreshing using `/auth/refresh`
-   [ ] Fetching and displaying top artists, tracks, and genres
-   [ ] Dynamic vibes UI based on personality data

To run the frontend:

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
> 1.  Frontend: `/auth/login` →
> 2.  Middleware: `/auth/login` → Spotify → `/auth/callback` →
> 3.  Middleware redirects to frontend: `/auth/callback?access_token=...`
>
> The frontend stores the access token in `localStorage` (for now) and redirects the user to `/success`.
