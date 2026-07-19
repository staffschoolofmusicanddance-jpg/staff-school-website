# STAFF School of Music & Dance Website

A premium static website for STAFF School of Music & Dance, designed to run locally from `index.html` and publish cleanly on GitHub Pages with no build tools, backend, or framework dependencies.

## Project Overview

- Built with HTML5, CSS3, and vanilla JavaScript only
- Uses a shared design system in `assets/css/styles.css`
- Uses a central editable configuration file in `assets/js/config.js`
- Uses local SVG placeholder artwork instead of hotlinked images
- Works with relative paths for GitHub Pages subdirectory hosting

## Folder Structure

```text
.
├── index.html
├── about.html
├── music-courses.html
├── dance-courses.html
├── gallery.html
├── events.html
├── testimonials.html
├── faq.html
├── contact.html
├── demo-class.html
├── privacy.html
├── terms.html
├── robots.txt
├── sitemap.xml
├── OWNER-CHECKLIST.md
├── IMAGE-SOURCES.md
├── .nojekyll
└── assets
    ├── css
    │   └── styles.css
    ├── images
    │   ├── icons.svg
    │   ├── logo.svg
    │   └── *.svg placeholder artwork
    └── js
        ├── config.js
        └── main.js
```

## How to Run Locally

1. Open `index.html` directly in a browser for a quick static preview.
2. For a more realistic local test, run a simple server from the project folder:
   - `python3 -m http.server 8000`
3. Open `http://localhost:8000/`.

## How to Edit Contact Details

Edit `assets/js/config.js`.

Update these sections first:

- `site.siteUrl`
- `site.ogImageUrl` if your final domain changes
- `contact.phoneDisplay`
- `contact.phoneRaw`
- `contact.whatsappDisplay`
- `contact.whatsappNumber`
- `contact.email`
- `contact.addressLines`
- `contact.businessHours`
- `contact.googleMapsUrl`
- `contact.googleMapsEmbedUrl`
- `social.instagramUrl`
- `social.facebookUrl`
- `social.youtubeUrl`
- `social.googleReviewsUrl`

## How to Replace Images

1. Add approved images to `assets/images/`.
2. Update the matching paths in `assets/js/config.js` for gallery and event imagery.
3. Update page-level hero images directly in the relevant HTML files if you want different artwork per page.
4. Keep alt text accurate to the actual image content.
5. Record every non-original image source in `IMAGE-SOURCES.md`.

## How to Add the Google Form

Edit `assets/js/config.js`.

For the demo class page:

- Set `forms.demoFormUrl` to the published Google Form link
- Set `forms.demoFormEmbedUrl` to the published embed URL

If you also want a separate enquiry form:

- Set `forms.enquiryFormUrl`
- Set `forms.enquiryFormEmbedUrl`

If those values remain empty, the site will show placeholder instructions instead of pretending the form works.

## How to Update Google Maps

Edit `assets/js/config.js`.

- `contact.googleMapsUrl` should point to the live directions link
- `contact.googleMapsEmbedUrl` should contain the published iframe URL

If the embed URL is empty, the site will show a map placeholder panel and a directions button.

## How to Publish with GitHub Pages

1. Create a GitHub repository.
2. Push this folder to the repository root.
3. In GitHub, open `Settings` → `Pages`.
4. Choose the branch you want to publish and the root folder.
5. Wait for the Pages deployment to finish.
6. Update `assets/js/config.js`, `robots.txt`, and `sitemap.xml` with your final GitHub Pages URL.

## How to Connect a Custom Domain

1. Add a `CNAME` file at the repository root with your custom domain.
2. Configure your DNS records with your domain provider.
3. Enable the custom domain in GitHub Pages settings.
4. Replace the placeholder domain in:
   - `assets/js/config.js`
   - every page canonical and OG URL
   - `robots.txt`
   - `sitemap.xml`

## How to Update the Sitemap Domain

1. Open `sitemap.xml`.
2. Replace `https://YOUR-GITHUB-USERNAME.github.io/staff-school-website/` with your final domain.
3. Update the same placeholder in `robots.txt`.

## Important Owner Files

- `OWNER-CHECKLIST.md` lists everything that still needs real business data before publishing.
- `IMAGE-SOURCES.md` records how placeholder and future real images should be tracked.

## Notes

- `music.html` and `dance.html` are compatibility redirect pages that point to `music-courses.html` and `dance-courses.html`.
- `.nojekyll` is included so GitHub Pages serves files and folders exactly as expected.
