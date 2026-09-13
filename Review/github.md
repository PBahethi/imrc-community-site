repo: PBahethi/imrc-community-site
branch: main

## Last sync
date: 2026-09-13T12:43:47Z

### Updated in this project
- Recreated four current screens (People, Family & connections, Events, Demo sign in) from source
- Copied data.json, headshots, event images, favicon and styles.css verbatim
- Wrote a nine-finding design review for community leadership
- Proposed three screens: email sign-in with demo shortcut, register-on-card events grid, household registration

## Screen map
| Project screen | Built from |
| --- | --- |
| Current Site.dc.html — shell, sidebar, header, footer | index.html, styles.css |
| Current Site.dc.html — People directory | app.js people()/results()/card(), data.json |
| Current Site.dc.html — Family & connections | app.js connections()/edges(), data.json |
| Current Site.dc.html — Events grid | app.js events()/eventCard(), images/ |
| Current Site.dc.html — Demo sign in | engagement.js login() |
| Review.dc.html | app.js, engagement.js, community-core.js, styles.css, index.html |
| Redesign Screens.dc.html | styles.css (site vocabulary), data.json, images/ |
