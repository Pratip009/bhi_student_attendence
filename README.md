# BHI Attendance Sheet

A one-page Next.js form for Bright Horizon Institute's individual student attendance sheet, with lunch timings.

## How it works

1. The student uploads a photo or scan of their handwritten signature (top of the page). The white paper
   background is removed automatically so it sits cleanly on the sheet.
2. On each day, the student taps the circle in the "Student signature" column. Their signature is placed
   on that row, and the times fill in automatically: 9:00 AM, 12:00 PM, 12:30 PM, 4:00 PM.
3. Faculty fill in everything else: the student and course details, any time corrections (just type in the
   cell), holidays, the staff signature column (upload the staff signature once, then tap the circles),
   and the approval section.
4. "Print or save as PDF" produces a Letter-size sheet matching the paper form.

Tap a placed signature to remove it. "New sheet" clears the form for the next month but keeps the
uploaded signatures. The autofill times can be changed at the bottom of the page.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

For production: `npm run build && npm start`, or deploy to Vercel.

## Data storage

The form is saved automatically in the browser (localStorage), so it stays on the device where it was
filled in. To share sheets across devices, replace the localStorage calls in
`components/AttendanceForm.tsx` with an API route and a database.

## Files

- `components/AttendanceForm.tsx`: the form, signature upload, print layout
- `lib/attendance.ts`: default times and date helpers
- `public/bhi-logo.jpeg`: logo from the original Word template
