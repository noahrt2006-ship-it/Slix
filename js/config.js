/* ==========================================================================
   SLIX SITE SETTINGS — edit this file to update business details.
   Nothing else in the site needs to change for these edits.
   ========================================================================== */

window.SLIX_CONFIG = {
  /* Business contact details. Leave as "" until Jimmy confirms them.
     Empty values are hidden on the site automatically. */
  phone: "",            // e.g. "(989) 555-0123"
  email: "",            // e.g. "jimmy@example.com"

  /* Contact form delivery (https://formspree.io → New form → copy the endpoint).
     Until this is filled in, the form will NOT pretend to send. */
  formEndpoint: "",

  /* Optional seasonal line, shown in the hero and the blowout section.
     Only fill this in when it's true, e.g. "Now booking fall blowouts."
     Leave "" to hide it. */
  seasonNote: "",

  /* The four services. Edit the wording, or delete a block to remove a service.
     "id" picks the diagram (install, repair, maintain, blowout) — don't change it.
     "form" must match one of the formOptions below. */
  services: [
    {
      id: "install",
      title: "Installation",
      text: "A new sprinkler system planned around your property, from the main line and valves to the last head.",
      points: [
        "Zones planned around sun, shade and slope",
        "Heads spaced for even, overlapping coverage",
        "Valves grouped where they can be reached",
        "Controller set up and walked through with you"
      ],
      form: "New system installation"
    },
    {
      id: "repair",
      title: "Repair & troubleshooting",
      text: "When something stops working, we find the cause and fix it.",
      points: [
        "Broken, stuck or misaimed heads",
        "Zones that won't turn on, or won't shut off",
        "Leaks in lines, fittings and valves",
        "Controller and wiring problems"
      ],
      form: "Repair or troubleshooting"
    },
    {
      id: "maintain",
      title: "Maintenance",
      text: "A walk-through of the whole system so it keeps working the way it should.",
      points: [
        "Run and inspect every zone",
        "Look for leaks and pressure problems",
        "Clear, straighten and adjust heads",
        "Set the controller for the season"
      ],
      form: "Maintenance or system check"
    },
    {
      id: "blowout",
      title: "Fall blowouts",
      text: "Compressed air clears water out of the lines before the ground freezes.",
      points: [
        "Water supply to the system shut off",
        "Each zone cleared with compressed air",
        "Above-ground parts drained",
        "Controller set for winter"
      ],
      form: "Fall blowout / winterization"
    }
  ],

  /* Options in the contact form's "What do you need help with?" dropdown. */
  formOptions: [
    "New system installation",
    "Repair or troubleshooting",
    "Maintenance or system check",
    "Fall blowout / winterization",
    "Something else"
  ]
};
