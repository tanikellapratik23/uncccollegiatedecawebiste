# uncccollegiatedecawebiste
# Collegiate DECA — UNC Charlotte

A static website presenting the UNC Charlotte Collegiate DECA chapter, 2026–27 school-year updates, ICDC 2027 details and a membership portal. It includes an official conference-guide link, an email-submission membership form, an ICS calendar export for key dates and an embedded recap presentation.

Quick start
- Keep `index.html`, `collegiatedeca.png`, `deca_grouppic.png` and the JavaScript files in the same folder.
- Open `index.html` directly or serve the folder from a simple HTTP server:

```bash
cd /path/to/Downloads
python3 -m http.server 8000
# then open http://localhost:8000/
```

Features
- Registration guide: clicking "View Registration Guide" opens DECA's official conference page so the link stays current when 2027 materials are released.
- Membership form: submits via the user's email client to `pratiktanikella@gmail.com` (uses `mailto:`).
- Add to Calendar: downloads `UNC_Charlotte_DECA_2026-27.ics` for import into Google Calendar or other calendar apps.
- Recap section: embedded Google Slides presentation and a recap photo.

Notes for maintainers
- To change the contact email, edit the `mailto:` links in the header and form (`index.html`).
- To replace images or PDFs, update the filenames referenced in the HTML or place replacements with the same names in the folder.
- The membership form currently uses `mailto:`; for server-side collection, replace the form action with a server endpoint and appropriate handler.

License
- No license specified. Add a LICENSE file if you want to make this project open-source.

Questions or updates
- Ping `pratiktanikella@gmail.com` for content updates or asset replacements.
