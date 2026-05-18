/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-product
 * Base block: columns
 * Source: https://publish-p99508-e1532789.adobeaemcloud.com/content/novocare-poc/home/weight-loss/wegovy.html
 * Generated: 2026-05-18
 *
 * Handles a two-column product layout across three instances:
 *   1. section.medication-enrollment-card — Product hero with image gallery left, product config right
 *   2. .product-information__columns — Pill vs Pen comparison columns
 *   3. .cmp-howtogetmedication — Steps content left, image right
 */
export default function parse(element, { document }) {
  const cells = [];

  // Instance 1: medication-enrollment-card (gallery left, content right)
  const galleryColumn = element.querySelector('.medication-enrollment-card__gallery-column');
  const contentColumn = element.querySelector('.medication-enrollment-card__content-column');

  if (galleryColumn && contentColumn) {
    // LEFT CELL: product images from gallery
    const leftCell = [];
    const heroImages = galleryColumn.querySelectorAll('.medication-enrollment-card__gallery-hero-media');
    heroImages.forEach((img) => {
      if (img.src && !img.src.startsWith('data:')) {
        leftCell.push(img);
      }
    });

    // RIGHT CELL: title, description, helper, pricing, CTA
    const rightCell = [];

    const title = contentColumn.querySelector('.medication-enrollment-card__title');
    if (title) rightCell.push(title);

    const intro = contentColumn.querySelector('.medication-enrollment-card__intro');
    if (intro) rightCell.push(intro);

    const helper = contentColumn.querySelector('.medication-enrollment-card__helper');
    if (helper) rightCell.push(helper);

    // Form fields: dosage form, strengths, payment method, delivery
    const fieldsets = contentColumn.querySelectorAll('.medication-enrollment-card__fieldset');
    fieldsets.forEach((fieldset) => {
      const legend = fieldset.querySelector('.medication-enrollment-card__legend');
      if (legend && legend.textContent.trim()) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = legend.textContent.trim();
        p.appendChild(strong);
        rightCell.push(p);
      }
      // Segmented controls (Pill/Pen)
      fieldset.querySelectorAll('.medication-enrollment-card__segmented-text').forEach((txt) => {
        if (txt.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = txt.textContent.trim();
          rightCell.push(p);
        }
      });
      // Chip labels (strengths)
      fieldset.querySelectorAll('.medication-enrollment-card__chip-label').forEach((chip) => {
        if (chip.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = chip.textContent.trim();
          rightCell.push(p);
        }
      });
      // Option cards (Insurance/Self Pay, Delivery)
      fieldset.querySelectorAll('.medication-enrollment-card__option').forEach((opt) => {
        const optTitle = opt.querySelector('.medication-enrollment-card__option-title');
        const optDesc = opt.querySelector('.medication-enrollment-card__option-desc');
        if (optTitle) {
          const p = document.createElement('p');
          const strong = document.createElement('strong');
          strong.textContent = optTitle.textContent.trim();
          p.appendChild(strong);
          if (optDesc) {
            p.appendChild(document.createTextNode(' — ' + optDesc.textContent.trim()));
          }
          rightCell.push(p);
        }
      });
    });

    // Pricing section
    const pricingBox = contentColumn.querySelector('.medication-enrollment-card__pricing-box');
    if (pricingBox) {
      const pricingTitle = pricingBox.querySelector('.medication-enrollment-card__pricing-box-title');
      if (pricingTitle) rightCell.push(pricingTitle);

      const priceCaption = pricingBox.querySelector('.medication-enrollment-card__price-amount-caption');
      if (priceCaption) rightCell.push(priceCaption);

      const price = pricingBox.querySelector('.medication-enrollment-card__price');
      if (price) rightCell.push(price);

      const pricePeriod = pricingBox.querySelector('.medication-enrollment-card__price-period');
      if (pricePeriod) rightCell.push(pricePeriod);

      const disclaimer = pricingBox.querySelector('.medication-enrollment-card__disclaimer');
      if (disclaimer) rightCell.push(disclaimer);
    }

    // CTA links
    const ctaLinks = contentColumn.querySelectorAll('.medication-enrollment-card__btn, a[href]');
    ctaLinks.forEach((link) => {
      if (link.href && !link.closest('.medication-enrollment-card__intro')) rightCell.push(link);
    });

    if (leftCell.length > 0 || rightCell.length > 0) {
      cells.push([leftCell.length > 0 ? leftCell : [''], rightCell.length > 0 ? rightCell : ['']]);
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
    element.replaceWith(block);
    return;
  }

  // Instance 2: .product-information__columns — comparison columns
  const infoColumns = element.querySelectorAll('[class*="product-information__column"], [class*="product-information__col"]');
  if (infoColumns.length >= 2) {
    const leftCell = [];
    const rightCell = [];

    // Extract content from each column
    infoColumns[0].querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]').forEach((el) => {
      if (el.tagName === 'IMG' && el.src && el.src.startsWith('data:')) return;
      leftCell.push(el);
    });
    infoColumns[1].querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]').forEach((el) => {
      if (el.tagName === 'IMG' && el.src && el.src.startsWith('data:')) return;
      rightCell.push(el);
    });

    cells.push([leftCell.length > 0 ? leftCell : [''], rightCell.length > 0 ? rightCell : ['']]);
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
    element.replaceWith(block);
    return;
  }

  // Instance 3: .cmp-howtogetmedication — steps content left, image right
  const stepsContent = element.querySelector('[class*="howtogetmedication__steps"], [class*="howtogetmedication__content"], [class*="howtogetmedication__left"]');
  const stepsImage = element.querySelector('[class*="howtogetmedication__image"], [class*="howtogetmedication__right"], [class*="howtogetmedication__media"]');

  if (stepsContent || stepsImage) {
    const leftCell = [];
    const rightCell = [];

    if (stepsContent) {
      stepsContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, a[href]').forEach((el) => {
        leftCell.push(el);
      });
    }
    if (stepsImage) {
      stepsImage.querySelectorAll('img').forEach((img) => {
        if (img.src && !img.src.startsWith('data:')) rightCell.push(img);
      });
      // Also grab any text in the image column
      stepsImage.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
        rightCell.push(el);
      });
    }

    if (leftCell.length > 0 || rightCell.length > 0) {
      cells.push([leftCell.length > 0 ? leftCell : [''], rightCell.length > 0 ? rightCell : ['']]);
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
    element.replaceWith(block);
    return;
  }

  // Generic fallback: find two direct child containers and treat as columns
  const directChildren = element.querySelectorAll(':scope > div');
  if (directChildren.length >= 2) {
    const leftCell = [];
    const rightCell = [];

    // First child as left column
    directChildren[0].querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]').forEach((el) => {
      if (el.tagName === 'IMG' && el.src && el.src.startsWith('data:')) return;
      leftCell.push(el);
    });

    // Second child as right column
    directChildren[1].querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]').forEach((el) => {
      if (el.tagName === 'IMG' && el.src && el.src.startsWith('data:')) return;
      rightCell.push(el);
    });

    cells.push([leftCell.length > 0 ? leftCell : [''], rightCell.length > 0 ? rightCell : ['']]);
  } else {
    // Last resort: all content in a single cell
    const allContent = [];
    element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]').forEach((el) => {
      if (el.tagName === 'IMG' && el.src && el.src.startsWith('data:')) return;
      allContent.push(el);
    });
    if (allContent.length > 0) {
      cells.push([allContent]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
  element.replaceWith(block);
}
