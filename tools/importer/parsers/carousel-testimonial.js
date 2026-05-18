/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-testimonial
 * Base block: carousel
 * Source selector: .cmp-testimonial-carousel
 * Description: Testimonial carousel with quote text, author avatar, name, and meta per slide.
 * Generated: 2026-05-18
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract slides from the carousel
  const slides = element.querySelectorAll('article.cmp-testimonial-carousel__slide');

  slides.forEach((slide) => {
    // Extract quote text from blockquote
    const blockquote = slide.querySelector('blockquote.cmp-testimonial-carousel__quote');

    // Extract author avatar image
    const avatarImg = slide.querySelector('img.cmp-testimonial-carousel__avatar-img');

    // Extract author name
    const authorName = slide.querySelector('p.cmp-testimonial-carousel__author-name');

    // Extract author meta text
    const authorMeta = slide.querySelector('p.cmp-testimonial-carousel__author-meta');

    // Build the cell content for this slide
    const cellContent = [];

    if (blockquote) {
      cellContent.push(blockquote);
    }

    if (avatarImg) {
      cellContent.push(avatarImg);
    }

    if (authorName) {
      cellContent.push(authorName);
    }

    if (authorMeta) {
      cellContent.push(authorMeta);
    }

    if (cellContent.length > 0) {
      cells.push(cellContent);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-testimonial', cells });
  element.replaceWith(block);
}
