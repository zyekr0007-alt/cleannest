# CleanNest design requirements

Maintain a calm, polished white interface with deep navy and restrained sky blue.
Use the system UI font for clear headings and reading text, preserving the CleanNest wordmark.

- No sharp surface corners. For nested frames, inner radius equals outer radius minus padding and border thickness.
- All action buttons are capsules. Icon-only actions are circles. Image and content surfaces retain concentric rectangular frames.
- Align edges, card heights, action positions and gaps. Use space to separate decisions without leaving accidental gaps.
- Header stays in document flow and scrolls naturally. Do not restore sticky positioning or scroll-triggered hiding.
- Homepage order: hero, services, three booking steps, results with a review excerpt, brief FAQs, final quote action.
- Only Full House Cleaning receives a featured panel. Five other services and a View all services card form an equal grid, with two columns on small screens.
- Footer contains brand, Call, WhatsApp, Instagram, four essential page links and legal links. Additional navigation belongs in the menu.
- Use assets/ui-icons.mjs for interface SVGs; preserve the sourced brand paths in assets/brand-icons.mjs. Do not use text characters as control icons.
- Motion gives immediate feedback and remains interruptible. Respect reduced motion. Do not add decorative animation loops.
- Quote selections and options use pills with visible selection and focus states. Keep native input semantics, existing pricing logic and user details when going back.
- Preserve published articles, metadata, schemas, canonical URLs and redirects. Keep publication through GitHub main.

Before publishing, run the static build/checks and the browser regression script. Review the homepage, menu, footer and quote flow visually on mobile and desktop. Use local test contact details and never send a test enquiry.
