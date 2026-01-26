# uncccollegiatedecawebiste
# Collegiate DECA — UNC Charlotte

A static website presenting the UNC Charlotte Collegiate DECA chapter, ICDC event details, and a membership portal. Includes a downloadable ICDC registration guide, an email-submission membership form, an ICS calendar export for key dates, and an embedded recap presentation.

Quick start
- Place `decawebsite(new).html`, `collegiatedeca.png`, `deca_grouppicture.png`, and `icdcreg.pdf` in the same folder.
- Open the site locally by double-clicking `decawebsite(new).html` or serve it from a simple HTTP server:

```bash
cd /path/to/Downloads
python3 -m http.server 8000
# then open http://localhost:8000/decawebsite(new).html
```

Features
- Downloadable registration guide: clicking "View Registration Guide" downloads `icdcreg.pdf`.
- Membership form: submits via the user's email client to `pratiktanikella@gmail.com` (uses `mailto:`).
- Add to Calendar: downloads `ICDC_Events_2026.ics` for import into Google Calendar or other calendar apps.
- Recap section: embedded Google Slides presentation and a recap photo.

Notes for maintainers
- To change the contact email, edit the `mailto:` links in the header and form (`decawebsite(new).html`).
- To replace images or PDFs, update the filenames referenced in the HTML or place replacements with the same names in the folder.
- The membership form currently uses `mailto:`; for server-side collection, replace the form action with a server endpoint and appropriate handler.

License
- No license specified. Add a LICENSE file if you want to make this project open-source.

Questions or updates
- Ping `pratiktanikella@gmail.com` for content updates or asset replacements.
