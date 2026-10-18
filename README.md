# Youssef Badran — Portfolio Demo

نسخة تجريبية من موقع يوسف بدران، مصمم جرافيك. واجهة عربية وإنجليزية مع تصميم متجاوب وحركات انتقال ومعرض أعمال قابل للتصفية.

## Features
- Arabic / English with RTL support and saved language preference.
- Responsive portfolio, category filters and project dialogs.
- Scroll reveals, hover effects and reduced-motion support.
- WhatsApp and email inquiry links; messages are reviewed and sent by the visitor.
- Client reviews interface with 1–5 stars, name and comment.

## Demo limitations
Review submission is intentionally disabled until a database is connected. No reviews are fabricated or shared between visitors in this demo. The review configuration contains no credentials.

The six gallery campaigns use new Canva-generated photography with editable typography and graphic layout. Website files use static WebP renders; all projects are design concepts. The portrait sections retain the supplied reference image.

## Hosting
Publish this folder with GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root). No build step is required. Keep .nojekyll in the root.

## Editing
- index.html: content and contact details
- styles.css: layout and animation styles
- content.mjs: projects and categories
- project-*.webp: the six current gallery campaign images; replace the matching file after exporting an edited Canva page
- app.mjs: navigation, language, gallery and motion
- reviews.mjs, review-api.mjs, reviews-config.mjs: review interface and optional backend adapter

Business contact: WhatsApp +201147555067 · yousefbadran6999@gmail.com

Portfolio artwork and photographs belong to their respective owners. No open-source license is granted for artwork by this demo.

Canva changes do not sync automatically. Export the edited page as an image and replace its matching project image. The website does not expose private Canva editing links.
