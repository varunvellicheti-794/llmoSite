/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion.
 * Source selector: .cmp-faq
 * Generated: 2026-05-18
 *
 * Extracts FAQ items from .cmp-faq component.
 * Each item has a question (.cmp-faq__question) and answer (.cmp-faq__answer).
 * Produces one row per FAQ item with [question, answer] cells.
 */
export default function parse(element, { document }) {
  // Extract FAQ items
  const faqItems = element.querySelectorAll('.cmp-faq__item');

  const cells = [];

  faqItems.forEach((item) => {
    // Extract question text from the span inside the trigger button
    const questionEl = item.querySelector('.cmp-faq__question');
    // Extract answer content (may contain multiple paragraphs, links, etc.)
    const answerEl = item.querySelector('.cmp-faq__answer');

    if (questionEl && answerEl) {
      // Create a clean question element (plain text without the button/icon wrapper)
      const questionText = questionEl.textContent.trim();
      const questionNode = document.createElement('p');
      questionNode.textContent = questionText;

      // Clone answer content to preserve rich text (paragraphs, links, lists)
      const answerContent = [];
      const answerChildren = answerEl.querySelectorAll(':scope > *');
      if (answerChildren.length > 0) {
        answerChildren.forEach((child) => answerContent.push(child));
      } else {
        // Fallback: use the answer element itself
        answerContent.push(answerEl);
      }

      cells.push([questionNode, answerContent]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
