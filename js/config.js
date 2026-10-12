/* ==========================================================================
   SLIX SITE SETTINGS — edit this file to update business details.
   Nothing else in the site needs to change for these edits.
   ========================================================================== */

window.SLIX_CONFIG = {
  /* Business contact details. Leave as "" until Jimmy confirms them.
     Empty values are hidden on the site automatically. */
  phone: "",            // e.g. "(989) 555-0123"
  email: "",            // e.g. "jimmy@slixirrigation.com"

  /* Contact form delivery.
     Paste a Formspree endpoint here (https://formspree.io → New form),
     e.g. "https://formspree.io/f/abcdwxyz". Until this is filled in,
     the form will NOT pretend to send — it tells the visitor to reach
     out another way. */
  formEndpoint: "",

  /* Services shown on the homepage cards.
     Delete a block to remove a service, or edit the text.
     "art" picks the illustration: install, repair, startup, winter, upgrade, maintain */
  services: [
    {
      title: "Sprinkler Installation",
      text: "Thoughtfully designed irrigation systems for beautiful, consistently watered lawns.",
      art: "install"
    },
    {
      title: "System Repair",
      text: "Troubleshooting and repairs to help irrigation systems perform as intended.",
      art: "repair"
    },
    {
      title: "Seasonal Startups",
      text: "Getting systems ready for the watering season.",
      art: "startup"
    },
    {
      title: "Winterization",
      text: "Preparing eligible systems for Michigan's freezing winter conditions.",
      art: "winter"
    },
    {
      title: "Irrigation Upgrades",
      text: "Modernizing existing systems for better performance and convenience.",
      art: "upgrade"
    },
    {
      title: "System Maintenance",
      text: "Helping keep irrigation equipment operating reliably.",
      art: "maintain"
    }
  ],

  /* Options in the contact form's "What do you need help with?" dropdown. */
  formOptions: [
    "New sprinkler installation",
    "Repair",
    "Spring startup",
    "Winterization",
    "Upgrade an existing system",
    "Maintenance",
    "Something else"
  ]
};
