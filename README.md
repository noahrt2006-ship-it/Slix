# SLIX — Sprinkler & Irrigation website

Static site (HTML, CSS, JavaScript, no build step). Hosted on Vercel; every push to `main` redeploys.

## Concept

The whole site is built around one irrigation system, drawn as a cross-section (`js/system.js`). It appears three times:

- **Hero:** the system pressurizes and runs zone by zone. The readout beside it says what the drawing is doing. Has a pause button; pauses itself when scrolled off screen.
- **"Every drop has a purpose" explorer:** nine numbered parts to tap (controller, shut-off, backflow, blowout point, main line, valves, laterals, spray heads, rotors) plus a controller to run zones.
- **"Before the freeze":** switch between Summer, Blowout (a step-by-step compressed-air sequence) and Winterized.

Also: service diagrams that change as you scroll the services, a "What's your system doing?" finder that fills in the request form, and (on wide screens) a main line in the left margin that fills as you scroll, turning orange through the blowout section.

Colours: graphite and off-white, blue for water, safety orange for air and for the main action.

## Files

| File | What it is |
|---|---|
| `index.html` | **All page text: services, finder options, form options.** The drawings are written into it too. |
| `js/config.js` | **Business settings: phone, email, form endpoint, seasonal note** |
| `css/styles.css` | All styling |
| `js/system.js` | The cross-section drawing, its controls, and the phone "camera" views |
| `js/figures.js` | The four service diagrams and the year dial (used by the pre-render step) |
| `tools/prerender.js` | Writes the drawings into `index.html` |
| `js/main.js` | Interaction only: hero sequence, explorer, services, blowout switch, finder, form |

All content is in the HTML, so the page still reads properly if scripts are slow or blocked. If you change `js/system.js` or `js/figures.js`, run `node tools/prerender.js` to update the drawings in `index.html`.

On phones the drawings fit the screen and zoom to whatever matters: the part you tapped, the zone that's running, or each step of the blowout.

## What Jimmy still needs to provide (all in `js/config.js`)

1. **Phone number** and **business email.** Blank values are hidden. A phone number also shows in the top bar and hero.
2. **Form delivery** (`formEndpoint`). Until set, the form validates but tells visitors it isn't connected. It never fakes a "sent" message.
3. **Seasonal note** (`seasonNote`), e.g. "Now booking fall blowouts." Only fill it in when it's true.

And in `index.html`: **confirm the four services and their bullet points** match what SLIX actually does. "Seasonal startups" and "Irrigation upgrades" were removed because they weren't confirmed.

## Connecting the contact form (free, about 5 minutes)

1. Sign up at https://formspree.io with the email that should receive requests.
2. Create a new form and copy its endpoint (`https://formspree.io/f/...`).
3. Paste it into `formEndpoint` and push.
4. Send a test request from the live site.

Spam protection: hidden honeypot field (`_gotcha`) plus a minimum time-on-page check.

## Accuracy notes

- The drawings are illustrative and say so on the page. Zones are stacked at different depths in the cross-section only so each line is visible.
- Blowout copy describes what the service "generally involves" and notes that it lowers the risk of freeze damage rather than ruling it out.
- No testimonials, prices, guarantees, availability, service radius or street address have been written. Tawas City is the only location used.

## Motion and accessibility

Visitors with reduced motion turned on see every drawing in a finished state with no animation. Every interactive part works by keyboard and touch.
