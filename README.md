# Baiku Admin Panel

This admin app connects to the same Firebase project as the mobile app and displays records such as drivers, rides, users, and helmet applications.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the Firebase values from your project settings.
3. Create an `admins` collection in Firestore and add your admin UID as a document.
4. Run:

```bash
npm install
npm run dev
```

## Security

- Keep this dashboard in a private GitHub repo or a private GitHub organization repo.
- Do not commit `.env.local` or any service account keys.
- Use Firebase Auth + Firestore rules to restrict admin access.
- Deploy only through a secure host such as Vercel or Firebase Hosting.

## Recommended hosting

Recommended approach:

- GitHub repo: private repo for the admin app
- Hosting: Vercel or Firebase Hosting
- Firebase: same project as the mobile app
- Access: only admin accounts in the `admins` collection are allowed

This keeps the admin panel separate from the mobile app codebase while still reading the same Firestore database.
