 Antigravity Build Brief — Modules Timetables + Automatic Home Lecture Status

## Project context
Modify the existing UCR Student Portal for the Division of Television Studies, University College of Rathmalana, powered by UoVT. **Do not rebuild the website from scratch.** Inspect the repository, routes, components, styling, current admin login, data persistence, upload handling, package scripts, and deployment configuration first. Preserve all existing features.

Use the supplied website screenshot as the design reference: premium dark navy interface, orange primary accents, electric-blue secondary accents, white text, fine borders, rounded cards, restrained glow, and smooth responsive interactions. Reuse existing logos and assets.

## Important navigation requirement
**Keep the navigation label “Modules”. Do not rename it to “Timetables”.** The existing Modules navigation item and route must remain. Update the content of that page so it becomes the timetable experience described below. Do not break existing links or change unrelated navigation.

## 1. Modules page: three timetable categories
The Modules page should present three prominent category cards:
1. **Foundation** — available now, with separate Foundation Programme timetables for TPOPT and TPRPT.
2. **Academic 1** — display a polished empty state reading **“No data found”**.
3. **Academic 2** — display a polished empty state reading **“No data found”**.

Do not invent Academic 1 or Academic 2 schedules. Keep those categories ready for future admin-managed content. Category cards must be keyboard accessible, responsive, and visually consistent.

## 2. Foundation timetable viewer
Use the two supplied PDFs as the authoritative source for initial schedule content:
- `TPOPT.pdf` — “Academic Time Table – Foundation Programme – 11th Batch”, Television & Digital Media Post Production Technology.
- `TPRPT.pdf` — “Academic Time Table – Foundation Programme – 11th Batch”, Television & Digital Media Production Technology.

Review/extract the PDFs independently. Preserve their separate course-specific differences and original subject/group wording. Do not fill blank cells by guessing. If a cell cannot be confidently read, flag it for admin review and retain the original PDF.

Provide two course tabs/selectors:
- **TPOPT** — Television & Digital Media Post Production Technology
- **TPRPT** — Television & Digital Media Production Technology

Show an editable headline initially set to **Academic Time Table – Foundation Programme – 11th Batch**, plus the selected course's correct subtitle and batch label. Include a **Download PDF** button that downloads the correct source PDF for the selected course. Never accidentally make both course buttons download the same PDF.

Render a data-driven weekly timetable with time rows and Monday–Sunday columns. Source time bands:
- 8:30 a.m.–9:30 a.m.
- 9:30 a.m.–10:30 a.m.
- 10:30 a.m.–10:40 a.m. — Break
- 10:40 a.m.–11:40 a.m.
- 11:40 a.m.–12:40 p.m.
- 12:40 p.m.–1:20 p.m. — Lunch Break
- 1:20 p.m.–2:20 p.m.
- 2:20 p.m.–3:20 p.m.
- 3:20 p.m.–3:30 p.m. — Break
- 3:30 p.m.–4:30 p.m.

Subject labels visible in the PDFs include English (A/L & NVQ Students), Gaffer (A/L Students), DM7 (A/L Students), NVQ Physics I,II, ICT (A/L & NVQ Students), Maths for NVQ Students, OSH (A/L & NVQ Students), DM10 (A/L Students), Computer Graphic Designer (A/L Students), Engineering Drawings/Drawing (NVQ Students), Break, and Lunch Break. Use the exact spelling from each relevant PDF.

The two PDFs differ. For example, TPRPT shows Computer Graphic Designer (A/L Students) in Friday morning slots, while those TPOPT Friday morning cells are blank and that subject appears Thursday afternoon. Preserve these differences. Break and lunch rows must be visually distinct; do not merge lessons through breaks.

The table must be readable on desktop and mobile. On small screens, use horizontal scrolling or a carefully designed day/slot view rather than shrinking text too much. Preserve blank cells as blank. The timetable title, subjects, times, and PDFs must come from persisted data, not UI hardcoding.

## 3. Critical requirement: Home page automatically shows what is happening according to the timetable
Add a section on the **Home page only** named **“Live Lecture Status”** or **“Today’s Lectures”**. This section must be **calculated automatically from the published Foundation timetable and the current date/time**, not rely on an admin manually creating a separate announcement for every scheduled class.

Show exactly two course cards, one for TPOPT and one for TPRPT. For each course, determine the current day in `Asia/Colombo`, find the matching timetable slot, and compare the current local time with the slot's start/end time.

Each course card should show:
- Course badge and full/short course name.
- Current subject/lecture name, when a class is active.
- Scheduled time range.
- Student group label where relevant (e.g. A/L Students, NVQ Students, or A/L & NVQ Students).
- Status such as **Lecture Ongoing**, **Upcoming Lecture**, **Break**, **No lecture scheduled today**, or **Schedule unavailable**.
- Optional room/location only if that information exists in the data; never invent a room.
- A clear message if there is no applicable class for that course at that time.

### Automatic time/date rules
Use the current date and time in the **`Asia/Colombo` timezone** on the server or a reliably timezone-aware implementation. Do not depend on the visitor’s device timezone.

For each course independently:
1. Determine today's weekday in Asia/Colombo.
2. Read that course's currently published timetable and find the slot that covers the current time.
3. If the slot is a class and current time is within its start/end interval, show that subject as **Lecture Ongoing**.
4. If the current time is in a break/lunch slot, show **Break** or **Lunch Break**, not a lecture.
5. If no class is active, find the next class slot later today and show it as **Upcoming Lecture**, including its subject and time range.
6. If there are no later classes today, show **No lecture scheduled today**.
7. If a timetable is unpublished or unavailable, show **Schedule unavailable** and do not fabricate a lecture.
8. Blank timetable cells must not be interpreted as lessons.
9. Respect course-specific group labels. Where a class is only for A/L or NVQ students, show that label so students understand who the class applies to. If the schedule does not identify a class for a specific group/course, do not falsely claim it applies to everyone.
10. Recalculate automatically as time moves forward and as the day changes. The Home page must not require a manual refresh to remain accurate while open. Use a reasonable low-frequency refresh (e.g. every 30–60 seconds) and refresh on tab/window visibility return. Avoid excessive polling.
11. When the timetable changes in admin and is published, the Home status cards must reflect the new timetable automatically after the data refresh/cache invalidation, without a code change or redeploy.

### Course-specific and shared classes
TPOPT and TPRPT Foundation schedules overlap for some subjects but differ in others. Build the Home cards by independently evaluating each course's timetable, not by copying one card's result into the other. A subject shown in both PDFs may appear on both cards if each timetable actually schedules it at that time. If one course has a class and the other has a blank slot, the blank course must show its own next class or “No lecture scheduled today”. Do not invent a shared lecture just because the schedules look similar.

The home cards are a live summary of the timetable, so changes to timetable subject, day, time, course, student group, or published status must affect them.

## 4. Optional admin overrides for unexpected changes
Normal lecture status must come from the timetable automatically. Add a way for admins to handle exceptions without changing source code:
- Mark a scheduled class **Postponed**.
- Mark it **Unavailable/Cancelled**.
- Optionally add an admin-provided reason and rescheduled date/time.
- Clear or reset the override to return to automatic timetable-based status.

Overrides should be attached to the relevant course/date/slot or class record so they do not unintentionally affect unrelated classes. If a class is postponed or unavailable, the Home card must not continue saying “Lecture Ongoing”. Display only the reason/rescheduled details entered by an admin. Do not require admins to manually enter every ordinary lecture in a separate list.

## 5. Admin timetable management
Extend the existing admin area and reuse the current authentication and authorization. Admins must be able to:
- Edit the timetable headline/title, course subtitle, and batch label.
- Edit subject, student group, day, start/end time, slot type, and optional notes for each course independently.
- Add/edit/remove time rows and slots with validation.
- Upload/replace TPOPT and TPRPT PDFs independently.
- Preview the timetable before publishing.
- Save and publish changes.
- Mark a particular date/slot postponed or unavailable, optionally adding a reason/rescheduled time.
- Restore automatic status after an override is cleared.
- See clear success/error feedback and confirmation before destructive actions.

Timetable edits must persist after reload and redeployment. Do not keep changes only in browser state.

## 6. Data, backend, and security
Inspect the current app and extend the existing data layer instead of adding a competing one. If the app currently stores records in local JSON files, do not assume that file writes persist on Render's ephemeral filesystem. Use the project's configured persistent database and durable file storage (for example, Supabase Postgres/Storage if that is the chosen deployment setup).

Persist timetable metadata, time slots, course/group applicability, publication state, PDF references, and date-specific overrides. Store PDFs in durable storage in production.

Security requirements:
- Reuse existing admin authentication.
- Validate and authorize every admin API endpoint server-side.
- Never rely only on hiding admin buttons.
- Keep database service-role/secret keys, session secrets, and credentials server-side.
- Use environment variables and a safe `.env.example` containing placeholders only.
- Use safe file upload validation, parameterized queries/ORM-safe database access, error handling, and secure production cookie settings where applicable.
- Do not log credentials or sensitive student information.

## 7. Render readiness
Make the feature production-ready for Render:
- Inspect the actual `package.json`; use existing scripts or add scripts correctly if required.
- Ensure the server listens on `process.env.PORT`.
- Add/verify a simple `/health` endpoint if suitable for the current architecture.
- Verify public routes, API calls, PDF downloads, and assets work after deployment, not just on localhost.
- Keep persistent records and uploaded PDFs out of the ephemeral application filesystem.
- Document required environment variables, database migrations, storage setup, and deployment steps.
- Keep `.env`, credentials, private uploads, and backups out of Git.
- Preserve existing Home, Students, Events, Tools, Modules route, and admin login.

## 8. UI and accessibility
Use the current portal style: navy background, orange primary accents, electric blue secondary accents, white text, muted blue-gray descriptions, subtle borders and glow, consistent spacing and typography. Foundation should look available; Academic 1/2 should look intentionally empty. Use smooth but restrained transitions, visible keyboard focus, semantic headings, accessible labels, strong contrast, and `prefers-reduced-motion`. Add loading, empty, success, and error states.

## Suggested data structures (adapt to the current schema)
**Timetable:** id, category (`foundation`, `academic_1`, `academic_2`), course (`TPOPT`, `TPRPT`), title, subtitle, batch_label, slots, pdf_url/file reference, is_published, updated_at, updated_by.

**Timetable slot:** id, timetable_id, day_of_week, start_time, end_time, subject, student_group, slot_type (`class`, `break`, `lunch`, `empty`), notes, sort_order.

**Class exception/override:** id, timetable_id, timetable_slot_id, exception_date, status (`POSTPONED`, `UNAVAILABLE`), reason, rescheduled_date, rescheduled_start_time, rescheduled_end_time, is_active, updated_at, updated_by. Adapt this if a safer or simpler existing model already exists.

## Acceptance checklist
1. The navbar still says **Modules**; do not rename it.
2. Existing Home, Students, Events, Tools, Modules route, and admin login still work.
3. Foundation shows the correct separate TPOPT/TPRPT timetables.
4. The timetable data matches each respective PDF, including course-specific differences.
5. Each course's Download PDF button returns the correct PDF.
6. Academic 1/2 show “No data found” without invented schedules.
7. Admin timetable edits and PDF replacements persist.
8. Home automatically identifies the correct day and current/upcoming subject for each course using `Asia/Colombo`.
9. The Home cards update as time advances without requiring manual page refresh.
10. A blank slot or break is never shown as an ongoing lecture.
11. TPOPT and TPRPT are evaluated independently.
12. Admin postponement/unavailable overrides work for the intended date/course/slot only.
13. Published admin changes update Home status without redeployment.
14. Mobile timetable and Home cards are readable and accessible.
15. Data and uploaded PDFs persist after Render restart/redeploy.
16. No secret keys or credentials are exposed to the browser or committed to Git.
17. Render build/start/health checks work.

## Implementation workflow
1. Inspect the repository and summarize its architecture before editing.
2. Identify current routing, admin auth, data persistence, uploads, styling, and deployment scripts.
3. Read both supplied PDFs and extract schedules independently; flag ambiguous cells rather than guessing.
4. Implement the Modules page timetable experience while keeping the navbar label “Modules”.
5. Implement automatic Home Live Lecture Status based on the published timetable and Asia/Colombo time.
6. Add admin editing and date-specific postponement/unavailable overrides.
7. Run existing lint/build/tests and fix issues.
8. Test every acceptance criterion.
9. Report changed files, any database/storage setup needed, environment variables, and exact Render deployment steps.

**Do not merely produce a mockup. Implement working features in the existing project. Keep the navigation label “Modules”. The Home page's live subject/status must be calculated automatically from the timetable's date and time, while timetable edits and exceptional postponements remain manageable by admin. Never fabricate timetable cells or lecture data.**
