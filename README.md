# SLIX — Sprinkler & Irrigation website

Static site (HTML, CSS, JavaScript, no build step). Hosted on Vercel; every push to `main` redeploys.

## Files

| File | What it is |
|---|---|
| `index.html` | All page content and section text |
| `js/config.js` | **Business settings: phone, email, form, services list, dropdown options** |
| `css/styles.css` | Colors, type, layout |
| `js/demo.js` | The interactive "Shape the spray" sprinkler |
| `js/main.js` | Opening sweep, scroll mark, services list, year dial, contact form |

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

## Opening and motion

The site opens on a dry, straw-coloured version of the headline. About half a second in, one rotor arm sweeps from the bottom-left corner and "waters" it into the finished page (1.5 seconds, once per page load). Two more sweeps carry the same idea: the year dial in the Michigan section draws itself the first time it's scrolled into view, and the closing circle completes. Everything else appears without animation. Visitors with reduced motion turned on see the finished page straight away.

The logo mark in the top bar fills like a sprinkler head as you scroll, and the label beside it names the current section.

The dial's "Now" marker uses the visitor's own date.

## Adding real photos later

The site uses drawings rather than photos, so nothing on it is stock or fake. Real job photos would work well as a full-width band between sections.

## Not included on purpose

No testimonials, statistics, certifications, warranties, street address, or service radius have been written, because none have been provided. Add them once they're real.
