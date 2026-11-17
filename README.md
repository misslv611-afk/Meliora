# LabDesk — AI Lab Slot Booking

## Run the project

1. Extract the ZIP file.
2. Open the folder `AI_Lab_Slot_Booking_React_v3` in VS Code (the folder containing `package.json`).
3. Open **Terminal → New Terminal**.
4. Run these commands one at a time:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

If the page reports that `qrcode.react` cannot be found, run `npm install` again from the same folder. Do not run the commands from the ZIP's parent folder.

## Student flow

- Students do not sign in or sign out.
- Students enter their full name and USN, select a project linked to existing local booking/group records (or enter a project name if none is found), then choose a workstation and session time.
- Confirmed bookings generate a Session QR. Waiting-list requests do not receive a QR until confirmed.
- Students can view their bookings and session QR.

## Admin flow

- Only the administrator has sign-in and sign-out.
- Demo admin credentials: `admin@ailab.edu` / `LabAdmin@123`.

## Important prototype limitations

- This is a browser-only demo using `localStorage`; records are not shared between computers or browsers.
- Project matching uses booking/waiting-list records stored in the same browser. It is not connected to a college project-membership database.
- QR codes are generated for display/download. Server-side QR validation and physical scanner/check-in integration are not implemented.
- Replace demo admin authentication with secure server-side authentication before deployment.
