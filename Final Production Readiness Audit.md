# Final Production Readiness Audit — UCR Student Portal

Please perform a complete production-readiness audit of my existing UCR Student Portal before I push it to GitHub and deploy it to Render.

**Important context:** We previously prepared this project for deployment, but since then I added the Modules timetable system, automatic Home page lecture status, admin timetable editing, TPOPT/TPRPT schedules, PDF downloads, and lecture postponement/unavailable controls. Recheck the entire project because these recent changes may have introduced new deployment, security, storage, or build issues.

## 1. Inspect before changing anything
- Inspect the complete project structure, `package.json`, server entry point, routes, API endpoints, frontend components, admin authentication, database/storage integrations, upload handling, and existing deployment files.
- Identify every place that reads or writes JSON files.
- Check the current Git configuration and `.gitignore`.
- Review existing functionality and identify risks before editing.
- Do not assume Supabase has been connected. Verify the actual implementation and configuration.

## 2. Fix production and Render compatibility
- Ensure the Node.js/Express server listens on `process.env.PORT` and binds correctly for Render.
- Verify that the actual build and start commands work.
- Add or fix a health-check endpoint if appropriate.
- Check frontend/backend routing, API URLs, asset paths, PDF downloads, CORS, cookies, sessions, and production error handling.
- Fix broken imports, missing dependencies, incorrect paths, and build/runtime errors.
- Avoid unnecessary dependency upgrades or unrelated rewrites.

## 3. Verify data persistence
- Determine whether admin changes still write to local JSON files.
- Identify every data type that needs persistence, including students, timetable titles and slots, lecture announcements/overrides, events, gallery metadata, and other admin-managed content.
- If Supabase is not configured, do not pretend it is connected and do not invent credentials.
- Prepare the necessary database schema, migrations, storage configuration, environment-variable documentation, and migration scripts if required.
- Preserve existing JSON data and provide a safe, repeatable import procedure before switching production writes.
- Ensure production data and uploaded PDFs/images do not depend on Render's ephemeral local filesystem.
- If external setup is required, clearly explain what I must do in the Supabase dashboard and Render environment settings.

## 4. Security audit
- Check for hardcoded credentials, API keys, database passwords, session secrets, service-role keys, and private configuration.
- Ensure `.env`, credentials, private student data, local backups, and unnecessary generated files are excluded from Git.
- Verify that admin API endpoints enforce authorization on the server.
- Confirm public users cannot modify admin-managed records.
- Review file-upload validation, file access permissions, input validation, SQL/database access, session configuration, and production error messages.
- Never print secrets into logs, reports, frontend bundles, or generated documentation.
- Do not remove existing authentication or weaken security to make deployment easier.

## 5. Recheck the latest Modules and timetable features
- Keep the navbar label **Modules**.
- Foundation must show separate TPOPT and TPRPT schedules based on the supplied PDFs.
- Academic 1 and Academic 2 must show “No data found” until actual data is added.
- Verify that each course downloads its correct PDF.
- Admin timetable edits must persist.
- The Home page must calculate current/upcoming lectures automatically using `Asia/Colombo` time and the published timetable.
- Ensure status updates as time advances and that breaks, blank slots, and course-specific differences are handled correctly.
- Verify postponement and unavailable overrides.
- Check that admin edits update the Home page without a redeployment.
- Ensure TPOPT and TPRPT lecture states are calculated independently.

## 6. Test the whole website
Test existing and new features, including:
- Home page and automatic lecture status.
- Students, search/filtering, and representatives.
- Modules, Foundation timetable switching, and PDF downloads.
- Admin login, authorization, and CRUD operations.
- Events, gallery, uploads, and any existing Tools features.
- Data persistence after server restart and simulated redeployment where practical.
- Responsive mobile layout and browser console/network errors.

Run the available lint, build, test, and startup commands. Fix issues that can be safely fixed and rerun the relevant checks. Do not claim a test passed unless you actually ran it.

## 7. GitHub and Render preparation
- Verify `.gitignore` and ensure no secrets or private data will be committed.
- Check that `.env.example` contains placeholder values only.
- Ensure the project has correct production scripts and required configuration.
- Document the exact environment variables needed, without exposing their values.
- Prepare the database migration and storage setup instructions if needed.
- Do not automatically push to GitHub, deploy to Render, delete files, or modify production data without my explicit approval.

## 8. Final report
When finished, provide:
1. A summary of what you inspected.
2. Every file changed and why.
3. Build/test commands executed and their actual results.
4. Any remaining errors or unresolved risks.
5. Whether Supabase is connected, partially configured, or not connected.
6. Whether JSON storage remains and which parts must be migrated.
7. Any manual database, storage, or environment-variable setup required.
8. Exact GitHub push and Render deployment steps.
9. A final readiness verdict: READY, READY AFTER MANUAL SETUP, or NOT READY.

**Rules:** Preserve the current design and working features. Do not rebuild the website from scratch, fabricate test results, expose credentials, delete the original JSON backups, or claim the website is production-ready while critical persistence or security issues remain. Inspect first, make justified fixes, test, and report honestly.