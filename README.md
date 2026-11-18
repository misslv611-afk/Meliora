# Meliora — AI Lab PC Slot Booking System

## Run the project

1. Extract the ZIP file.
2. Open the folder `AI_Lab_Slot_Booking_React_v3` in VS Code (the folder containing `package.json`).
3. Open **Terminal → New Terminal**.
4. Run these commands:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Website flow

- The first page is the Meliora homepage, where users choose Student Portal or Admin Portal.
- Students enter the Student Portal without a separate sign-in/sign-out flow.
- Admins must sign in to access the admin dashboard.
- Students can book available PCs, view their bookings and session QR, submit session reports, and report PC issues.
- Admins can manage bookings and waiting lists, add workstations, update PC status, and review student maintenance reports.
- A PC is offered for booking only when its status is **Available**.

## Demo admin credentials

- Email: `admin@ailab.edu`
- Password: `LabAdmin@123`

## Important prototype limitations

- This is a browser-only demo using `localStorage`; records are stored in the current browser and are not shared between computers or different users.
- Student issue reports and added PCs are saved locally in the browser. A shared database such as Supabase is needed for team-wide/live synchronization.
- Project matching uses booking/waiting-list records stored in the same browser. It is not connected to a college project-membership database.
- QR codes are generated for display/download. Server-side QR validation and physical scanner/check-in integration are not implemented.
- Replace demo admin authentication with secure server-side authentication before deployment.
