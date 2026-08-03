# uncccollegiatedecawebiste
# Collegiate DECA — UNC Charlotte

A responsive multi-page website for the UNC Charlotte Collegiate DECA chapter, the 2026–27 school year and ICDC 2027 in Austin. It includes dedicated conference, travel, chapter and membership pages alongside the existing member portal.

Quick start
- Keep the HTML pages, `styles.css`, `site.js`, `collegiatedeca.png` and `deca_grouppic.png` in the same folder.
- Open `index.html` directly or serve the folder from a simple HTTP server:

```bash
cd /path/to/Downloads
python3 -m http.server 8000
# then open http://localhost:8000/
```

Pages
- `index.html`: chapter overview and 2026–27 roadmap.
- `conference.html`: ICDC 2027 highlights, venue and planning timeline.
- `travel.html`: CLT–AUS flight searches, hotel maps and booking checklist.
- `chapter.html`: chapter story and 2026–27 executive board.
- `recap-2026.html`: Kentucky 2026 results, memories and photo gallery.
- `join.html`: membership benefits, interest form and member portal links.

Notes for maintainers
- To change the contact email, edit the `mailto:` links in the header and form (`index.html`).
- To replace images or PDFs, update the filenames referenced in the HTML or place replacements with the same names in the folder.
- The membership form currently uses `mailto:`; for server-side collection, replace the form action with a server endpoint and appropriate handler.

License
- No license specified. Add a LICENSE file if you want to make this project open-source.

Questions or updates
- Ping `pratiktanikella@gmail.com` for content updates or asset replacements.
