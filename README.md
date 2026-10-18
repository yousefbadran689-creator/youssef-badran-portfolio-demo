# Youssef Badran — Portfolio Demo

Bilingual multi-page graphic design portfolio with 21 concept campaigns and a local demo editor.

## Pages
- Home: index.html
- All work: portfolio.html
- Project details: project.html?id=aura
- About: about.html
- Services: services.html
- Reviews: reviews.html
- Contact: contact.html
- Demo editor: admin.html

## Editing and publishing
The demo editor can add, edit, remove, undo, reorder and feature work, import/export a catalog, upload raster images, and edit public contact details. It stores a browser-local draft. It has no authentication, server write API or automatic publishing. Export portfolio-data.json and upload it to main at the repository root to publish changes. Public pages never read the admin draft. Uploads are embedded as bounded raster data URLs.

The public catalog is validated before use; content.mjs supplies a bundled fallback. Do not add credentials, private Canva edit links, or private notes to public files. Canva updates require exporting an image and replacing its project asset or using the demo editor upload.

Review submission is disabled until a real backend is connected. The form does not fabricate saved reviews. All gallery entries are design concepts, not claims of client commissions. Artwork photos include AI-generated content. The supplied reference remains in the portrait sections.

GitHub Pages: main branch / root; no build step. Keep .nojekyll.

Business contact: WhatsApp +201147555067 · yousefbadran6999@gmail.com. No open-source license is granted for the artwork.
