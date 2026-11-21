# ETRION Website

A responsive, single-page company website (HTML + CSS + vanilla JS, no build step).

## Files
```
etrion-website/
├── index.html                 # All page sections
├── css/style.css              # Styles & brand colours (edit :root variables)
├── js/main.js                 # Menu, scroll animations, contact form
└── assets/images/
    ├── etrion-logo.png        # Navy logo (light backgrounds)
    ├── etrion-logo-white.png  # White logo (dark backgrounds)
    └── favicon.png            # Gear icon for the browser tab
```

## Run locally
Open `index.html` in a browser, or run `npx serve .` / `python -m http.server` in this folder.

## Replace before going live
Search `index.html` for these placeholders:
- `hello@etrion.in` — your real email (also `CONTACT_EMAIL` in `js/main.js`)
- `+91 00000 00000` — your phone number
- `Chennai, Tamil Nadu, India` — your address
- **Products section** — "Product One" / "Product Two" names, descriptions and features
- Footer social links (`href="#"`) — LinkedIn, X, Instagram, GitHub URLs
- Privacy Policy / Terms links

## Contact form
By default it opens the visitor's email app with the message pre-filled.
To receive submissions directly, create a free form at formspree.io, then in `index.html` change
`<form class="contact-form" id="contactForm" novalidate>` to
`<form class="contact-form" id="contactForm" action="https://formspree.io/f/YOUR_ID" method="POST">`
and remove the `form.addEventListener("submit", ...)` block in `js/main.js`.

## Deploy
Upload the folder to Netlify, Vercel, GitHub Pages or any static host.
