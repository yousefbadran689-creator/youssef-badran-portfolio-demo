# Youssef Badran — Portfolio

Bilingual multi-page graphic design portfolio with 51 concept campaigns, a full image viewer and authenticated administration.

## Pages
Home: index.html · Work: portfolio.html · Details: project.html?id=mesa · About: about.html · Services: services.html · Reviews: reviews.html · Contact: contact.html · Administration: admin.html.

## Content and administration
The public site loads a validated Supabase catalog; portfolio-data.json and content.mjs provide the static fallback. The owner signs in, edits a local draft and clicks Publish. The editor supports raster uploads or HTTPS image URLs, project ordering, featured work, bilingual copy, profile details, undo and catalog backup/import. Images upload before atomic publication. A stale revision cannot overwrite a newer catalog.

Owner authorization is enforced by database row-level security and membership, not by the visible page. Public configuration contains only a publishable key and project URL. Never add private login links, secret/service-role keys, Canva editing links or operational bootstrap scripts. SDK version and integrity are recorded in vendor-manifest.json; license in SDK-LICENSE.txt.

Reviews require consent and await owner approval. Unapproved reviews are not public. Local/offline pages disable cloud submission/login/publication and retain a local draft editor. An exported backup is not automatically published.

The editable Canva collection is separate. Export finished artwork, upload it in the admin panel, save the draft and click Publish. There is no automatic Canva sync.

All gallery work is clearly marked as concepts, not claims of client commissions. Campaign photos include AI-generated content. Fashion campaigns use product-only still lifes. No open-source license is granted for the artwork.

GitHub Pages: main branch / root; no build step. Keep .nojekyll.

Business: WhatsApp +201147555067 · yousefbadran6999@gmail.com.
