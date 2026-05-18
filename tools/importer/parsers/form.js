/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form variant.
 * Base block: form
 * Source selector: .phx-newsletter-form
 * Newsletter signup form with heading, subtext, fields (first name, last name, email, ZIP code),
 * consent checkbox, and submit button.
 * Generated: 2026-05-18
 */
export default function parse(element, { document }) {
  // Extract heading from left column
  const heading = element.querySelector('h2.phx-newsletter-form__heading, .phx-newsletter-form__heading');

  // Extract subtext/description from left column
  const subtext = element.querySelector('p.phx-newsletter-form__subtext, .phx-newsletter-form__subtext');

  // Extract form fields
  const fields = Array.from(element.querySelectorAll('.phx-newsletter-form__field'));

  // Extract consent section
  const consentCheckbox = element.querySelector('.phx-newsletter-form__consent');

  // Extract submit button
  const submitButton = element.querySelector('button.phx-newsletter-form__submit, .phx-newsletter-form__submit');

  // Build cells array - form block structure:
  // Row 1: Heading and description (intro content)
  // Row 2+: Each form field as label | input type
  // Then consent row
  // Then submit row
  const cells = [];

  // Row 1: Intro content (heading + subtext combined)
  const introCell = [];
  if (heading) introCell.push(heading);
  if (subtext) introCell.push(subtext);
  if (introCell.length > 0) {
    cells.push(introCell);
  }

  // Rows for each form field: [label text, field type]
  fields.forEach((field) => {
    const label = field.querySelector('label.phx-newsletter-form__label, .phx-newsletter-form__label');
    const input = field.querySelector('input.phx-newsletter-form__input, .phx-newsletter-form__input');
    if (label && input) {
      const labelText = label.textContent.trim();
      const inputId = input.getAttribute('id') || '';
      // Determine field type from id or default to text
      let fieldType = 'text';
      if (inputId.toLowerCase().includes('email')) {
        fieldType = 'email';
      }
      const typeNode = document.createTextNode(fieldType);
      const labelNode = document.createTextNode(labelText);
      cells.push([labelNode, typeNode]);
    }
  });

  // Consent checkbox row
  if (consentCheckbox) {
    const consentLabel = consentCheckbox.querySelector('.phx-newsletter-form__consent-label, .phx-newsletter-form__consent-text');
    const consentText = consentLabel ? consentLabel.textContent.trim() : 'I consent';
    const consentNode = document.createTextNode(consentText);
    const checkboxType = document.createTextNode('checkbox');
    cells.push([consentNode, checkboxType]);
  }

  // Submit button row
  if (submitButton) {
    const submitText = submitButton.textContent.trim();
    const submitNode = document.createTextNode(submitText);
    const submitType = document.createTextNode('submit');
    cells.push([submitNode, submitType]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
