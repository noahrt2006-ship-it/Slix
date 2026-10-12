# SLIX — Sprinkler & Irrigation website

Static site (HTML, CSS, JavaScript, no build step). Hosted on Vercel; every push to `main` redeploys.

## Files

| File | What it is |
|---|---|
| `index.html` | All page content and section text |
| `js/config.js` | **Business settings: phone, email, form, services list, dropdown options** |
| `css/styles.css` | Colors, type, layout |
| `js/demo.js` | The interactive "Shape the spray" sprinkler |
| `js/main.js` | Hero plan drawing, navigation, services list, contact form |

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

## Opening

No intro screen. The page opens on the hero, and the headline rises into place once (skipped for visitors with reduced motion turned on). The drawing beside it is an illustrative irrigation plan generated in `js/main.js`, not a real customer's property.

## Adding real photos later

The site uses drawings rather than photos, so nothing on it is stock or fake. Real job photos would work well as a full-width band between sections.

## Not included on purpose

No testimonials, statistics, certifications, warranties, street address, or service radius have been written, because none have been provided. Add them once they're real.
