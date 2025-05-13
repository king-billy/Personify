# Build & Run Guide

This document outlines the steps required to set up, develop, and deploy the Personify app — a full-stack application analyzing Spotify listening data.

## Prerequisites

Ensure the following tools are installed globally:

-   Node.js (v18+ recommended)
-   npm (v9+ recommended)
-   pnpm (optional, if using it instead of npm)

## Development Setup

1. Install dependencies

    From the root of the repository, run:

    ```bash
    cd client && npm install
    cd middleware && npm install
    ```

2. Set up environment variables

    `middleware` require environment variables for this project to function properly.

    - Create a `.env` file in `middleware` folder. (For grading purposes, see `3.5 Environment` in our project documentation file.)

3. Start development servers

    In **separate terminal windows** from the root of the repository:

    **Client (Frontend)**:

    ```bash
    cd client
    npm run dev
    ```

    This runs the frontend at http://localhost:3000.

    **Middleware**:

    ```bash
    cd middleware
    npm run dev
    ```

    And this runs the middleware at http://localhost:6969.
