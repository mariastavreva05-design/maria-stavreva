# Maria Stavreva – personal website

A complete, bilingual (English / Bulgarian) website. No photos, no paid services, no programming needed to edit it.

## What is in the folder
- `index.html, about.html, coaching.html, online-coaching.html, international.html, camps.html, business.html, projects.html, contact.html` – the nine pages (you never need to open these)
- `content/content.js` – **all the text of the website, in English and Bulgarian**
- `admin/index.html` – the **content editor** (forms – this is how you edit)
- `assets/` – design (colours, fonts, layout) and the code that draws the pages

## How to edit your text (the easy way)
1. Open `admin/index.html` in your browser (double-click it, or visit `yourwebsite/admin/`).
2. Choose a section on the left. English is on the left box, Bulgarian on the right box. A **yellow** box means one language is still empty.
3. Type your change. It is saved automatically as a **draft** in your browser.
4. Click **Preview draft** to see it on the real site (works once the site is online or opened through a web server).
5. Click **Download content.js**, then replace `content/content.js` in your website with that file (see "Publish changes" below). Only now does it go live.

Tip: *Show: English / Български* above the form lets you work on one language at a time.

### Add a new training camp
Editor → **Training camps** → **+ Add a camp** → fill in name, dates, location, coach, description in both languages → Download → upload. Use the arrows to reorder, **Delete** to remove.

### Add a new country
Editor → **International experience** → **+ Add a country** → type the name in English and Bulgarian.
Athlete profiles: same page, **+ Add an athlete profile** (the section stays hidden on the website until you add one). Only publish athletes' names/details with their permission (for minors: their parents').

### Add a new project
Editor → **Projects & events** → **+ Add a project** → choose the category (Competitions / Ice Shows & Productions / Sports Projects) and fill in title, date, location, your role and description. The "projects will be added here" message disappears automatically for any category that has a project.

### Update your biography
Editor → **About & biography**. Each box is one paragraph. Education, qualifications, background and the club name are on the same page / in **Name, tagline & club**.

### Other things you can change in the editor
Services (Coaching page), club/affiliation, contact email/phone/social links (Contact), the online-coaching notice wording, menu and button labels, the titles Google shows (Search engine titles).

## Contact details and the contact form
No contact details were invented. Until you add them, the site shows "To be added".
Add your email, phone and social links in the editor → **Contact details & form**.

The form works in one of two ways:
- **Easiest (free, 2 minutes):** create a free form at formspree.io (or web3forms.com), paste the address it gives you into **Contact form address** in the editor. Messages arrive in your email.
- **Without any account:** leave that field empty and enter your email. The form then opens the visitor's own email app with the message ready to send.

## Publish the website for free
### Option A – GitHub Pages
1. Create a free account at github.com and a new repository (e.g. `maria-stavreva`), public.
2. Click **Add file → Upload files** and drag in the *contents* of this folder (all pages, `assets`, `content`, `admin`, `.nojekyll`). Commit.
3. **Settings → Pages → Deploy from a branch → main / (root) → Save.** After a minute your site is live at `https://YOURNAME.github.io/maria-stavreva/`.
4. **To publish changes later:** open the repository → `content` → `content.js` → **Add file → Upload files** → drop the downloaded `content.js` (same name) → Commit. The site updates in about a minute.

### Option B – Cloudflare Pages
Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets**, drop this folder, deploy. To update later: open the project → **Create deployment** and upload the folder again with the new `content.js`.

A custom domain (e.g. mariastavreva.com) is optional and is the only thing that costs money (a domain, about 10–15 €/year).

## Honest notes about security and limits
- **The editor has no password, and that is deliberate.** A password check inside a free static website cannot be truly secure, so I did not fake one. The editor cannot change your live site – it only produces a file. Publishing is protected by your own login at GitHub or Cloudflare. If you prefer, delete the `admin` folder before publishing and keep it only on your computer.
- Both languages share the same web addresses (the language is chosen with the EN | BG switch, and remembered). Google handles this well, but separate per-language addresses would be slightly stronger for search. The site can be extended that way later.
- Fonts (Cormorant Garamond, Inter) load free from Google Fonts; if blocked, elegant fallback fonts are used.
- Adding a third language: add it to `languages` in `content.js` (a developer can do this in minutes); the editor then shows a third column automatically.

## Content notes
All text comes from the information you provided. Nothing about achievements, clients, certificates or consulting experience was invented. The Business page is labelled an academic and developing professional direction. The "Coaching approach" paragraph and the services only restate what you told me – please replace it with your own words about your philosophy, and add short service descriptions if you wish.
