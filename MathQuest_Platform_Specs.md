# MathQuest Platform: Product & Technical Specification

## 1. Executive Summary
MathQuest is an innovative gaming and educational platform designed to make competitive math preparation engaging for kids. By blending high-octane gaming mechanics with rigorous math problems, students learn and practice without feeling like they are doing homework.

## 2. Core Features & Platform Requirements

### 2.1 User Accounts & Social Features
*   **Player Profiles:** Each kid gets a customizable profile with avatars and stats.
*   **Authentication:** Secure login for kids and parents.
*   **Friends System:** Send and accept friend requests. Play alongside or against friends in real-time.
*   **Leaderboards:** 
    *   *Global Leaderboards:* Top players worldwide.
    *   *Game-Specific Leaderboards:* Highest scores or fastest times for individual games.
    *   *Friends Leaderboard:* Compare progress with peers.

### 2.2 Question Management & Categorization
*   **Backend Question Bank:** A robust system to upload, categorize, and tag math questions.
*   **Competition Tracks:** Questions are grouped by "Competition" (e.g., Math Olympiad, AMC 8, Math Kangaroo).
*   **Topic Selection:** Players can select specific topics (e.g., Multiplication, Division, Fractions, Algebra) before starting a game.
*   **Adaptive Difficulty:** The system tracks player performance and can dynamically adjust question difficulty.

### 2.3 The Games Arcade
The platform will host a variety of games. The flagship launch title is **"Math Racer"**.

#### 2.3.1 Flagship Game: Math Racer (Nitro Type Clone)
*   **Concept:** A side-scrolling or top-down racing game where speed is determined by answering math questions correctly and quickly.
*   **Mechanics:**
    *   Players see an upcoming math equation (e.g., `12 x 8 = ?`).
    *   Typing the correct answer accelerates the car.
    *   Mistakes cause the car to stall or slow down.
    *   *Power-ups:* Consecutive correct answers build a "combo meter" granting a temporary speed boost (Nitro).
*   **Lobby System:** Players can join a random public race or create a private race with friends.

## 3. Technical Architecture

### 3.1 Tech Stack
*   **Frontend:** React (Vite) / Next.js, built with Node.js. Rich, vibrant UI using Vanilla CSS with CSS Modules.
*   **Backend / Database:** Supabase (PostgreSQL) for authentication, storing user profiles, friendships, and the question bank. (Database integration planned for Phase 2).
*   **Real-time Capabilities:** Supabase Realtime or WebSockets (Socket.io) for live multiplayer racing and leaderboards.

### 3.2 Design & Aesthetics
*   **Theme:** Vibrant, futuristic, and colorful. Designed to "wow" users instantly.
*   **UI Elements:** Glassmorphism, dynamic gradients, smooth micro-animations on buttons and game elements.
*   **Typography:** Modern fonts (e.g., 'Outfit' or 'Inter') for high readability and a premium feel.

## 4. Phase 1: MVP (Minimum Viable Product)
*   Deploy a functional frontend-only version of the "Math Racer" game.
*   Hardcode a subset of math questions (Multiplication & Division) for testing.
*   Implement the core racing mechanic: solving math problems moves the car across the finish line.
*   Provide a polished, highly aesthetic UI with a mock leaderboard.
