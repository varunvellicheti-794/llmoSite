/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NovoCare section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Runs only in afterTransform. Uses payload.template.sections from page-templates.json.
 * All selectors verified against captured DOM in migration-work/cleaned.html.
 *
 * Sections (from page-templates.json):
 *   1. Product Hero - selector: "section.medication-enrollment-card"
 *   2. Jump Navigation - selector: ".cmp-tabs.cmp-tabs--jump-nav"
 *   3. Product Information - selector: "section.product-information"
 *   4. How to Get Medication - selector: ".cmp-howtogetmedication"
 *   5. Patient Testimonials - selector: ".cmp-testimonial-carousel" (style: "dark")
 *   6. FAQ - selector: ".cmp-faq"
 *   7. Newsletter Signup - selector: "section.phx-newsletter-form"
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid index shifting
    const reversedSections = [...sections].reverse();

    reversedSections.forEach((section, reverseIndex) => {
      const originalIndex = sections.length - 1 - reverseIndex;
      const sectionEl = element.querySelector(section.selector);

      if (!sectionEl) return;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before section (except the first section)
      if (originalIndex > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
