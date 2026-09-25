# Padel App

Expo (React Native) app for recreational padel players to find matches and teammates.

Current capability: **signed-in users can create a match** (date, time, location, max. players), which is stored in the Firestore collection `matches`.

## Setup

1. Create a Firebase project and register a **Web app** in it.
2. In the Firebase console enable **Authentication → Email/Password** and create a **Firestore** database.
3. Copy `.env.example` to `.env.local` and fill in the web app config values.
4. Deploy the security rules: `npx firebase-tools login`, then
   `npx firebase-tools deploy --only firestore:rules --project <your-project-id>`.
5. `npm install` and `npm start` (then press `i` / `a`, or scan the QR code with Expo Go).

## Match document (`matches/{id}`)

| Field        | Type      | Notes                                   |
| ------------ | --------- | --------------------------------------- |
| `creatorId`  | string    | uid of the signed-in creator            |
| `startsAt`   | timestamp | date + time of the match, in the future |
| `location`   | string    | 1–100 characters                        |
| `maxPlayers` | int       | 2–4                                     |
| `createdAt`  | timestamp | server timestamp                        |

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run test:rules   # Firestore emulator, requires Java 21+
```
