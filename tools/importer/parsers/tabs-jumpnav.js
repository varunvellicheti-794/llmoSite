/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-jumpnav
 * Base block: tabs
 * Source: .cmp-tabs.cmp-tabs--jump-nav
 * Description: In-page jump navigation with a "Jump to:" label followed by anchor links to page sections.
 * Generated: 2026-05-18
 */
export default function parse(element, { document }) {
  // Extract the nav container with the jump links
  const nav = element.querySelector('.phx-tabs-jump__nav');

  // Extract the label (e.g., "Jump to:")
  const label = element.querySelector('.phx-tabs-jump__nav-label');

  // Extract all navigation links
  const links = Array.from(element.querySelectorAll('.phx-tabs-jump__link'));

  // Build cells array - each row contains one navigation link
  // First row: the label text
  // Subsequent rows: one link per row
  const cells = [];

  if (label) {
    cells.push([label]);
  }

  // Each link becomes its own row in the block table
  links.forEach((link) => {
    cells.push([link]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-jumpnav', cells });
  element.replaceWith(block);
}
