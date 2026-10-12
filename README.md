# SLIX — Sprinkler & Irrigation website

Static site (HTML, CSS, JavaScript, no build step). Hosted on Vercel; every push to `main` redeploys.

## Files

| File | What it is |
|---|---|
| `index.html` | All page content and section text |
| `js/config.js` | **Business settings: phone, email, form, services list, dropdown options** |
| `css/styles.css` | Colors, type, layout |
| `js/intro.js` | The opening sprinkler / splash / SLIX reveal |
| `js/demo.js` | The interactive "Shape the spray" sprinkler |
| `js/main.js` | Navigation, scroll effects, contact form, hero and background animations |

## What Jimmy still needs to provide

All of these go in `js/config.js`. Blank values are hidden on the site automatically.

1. **Phone number** → `phone: "(989) 555-0123"`
2. **Business email** → `email: "name@example.com"`
3. **Form delivery** → `formEndpoint`. Until this is set, the contact form validates input but tells visitors it isn't connected yet. It never shows a fake "sent" message.
4. **Which services SLIX really offers.** Edit or delete entries in `services` and `formOptions`.

## Connecting the contact form (free, about 5 minutes)

1. Sign up at https://formspree.io with the email that should receive requests.
2. Create a new form and copy its endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `formEndpoint` in `js/config.js` and push.
4. Submit a test request on the live site and confirm the first email in Formspree.

Spam protection: a hidden honeypot field (`_gotcha`, which Formspree recognizes) plus a minimum time-on-page check. Formspree's own spam filtering can be turned on in its dashboard. Submissions go straight to Formspree over HTTPS; nothing is stored in the visitor's browser.

## Intro behaviour

- Plays once per browser session (stored in `sessionStorage`), then the site loads directly.
- "Skip intro" or the Escape key jumps straight in.
- Visitors with "reduce motion" turned on never see it.
- Sound is off by default; the toggle generates a soft water hiss in the browser (no audio files).

To replay it while testing, open the site in a new private window.

## Adding real photos later

Service cards and the hero currently use drawn illustrations and animated scenes, so nothing on the site is stock or fake. To use real job photos, replace a card's illustration in `js/main.js` (`ART`) or add an `<img>` inside `.svc-art`.

## Not included on purpose

No testimonials, statistics, certifications, warranties, street address, or service radius have been written, because none have been provided. Add them once they're real.
