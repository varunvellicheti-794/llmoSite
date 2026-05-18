/* eslint-disable */
/* global WebImporter */

import accordionFaqParser from './parsers/accordion-faq.js';
import carouselTestimonialParser from './parsers/carousel-testimonial.js';
import columnsProductParser from './parsers/columns-product.js';
import formParser from './parsers/form.js';
import tabsJumpnavParser from './parsers/tabs-jumpnav.js';

import novocareCleanupTransformer from './transformers/novocare-cleanup.js';
import novocareSectionsTransformer from './transformers/novocare-sections.js';

const parsers = {
  'accordion-faq': accordionFaqParser,
  'carousel-testimonial': carouselTestimonialParser,
  'columns-product': columnsProductParser,
  'form': formParser,
  'tabs-jumpnav': tabsJumpnavParser,
};

const PAGE_TEMPLATE = {
  name: 'weight-loss-product',
  description: 'Weight loss product page with medication information and resources',
  urls: [
    'https://publish-p99508-e1532789.adobeaemcloud.com/content/novocare-poc/home/weight-loss/wegovy.html',
  ],
  blocks: [
    {
      name: 'columns-product',
      instances: [
        'section.medication-enrollment-card',
        '.product-information__columns',
        '.cmp-howtogetmedication',
      ],
    },
    {
      name: 'tabs-jumpnav',
      instances: ['.cmp-tabs.cmp-tabs--jump-nav'],
    },
    {
      name: 'carousel-testimonial',
      instances: ['.cmp-testimonial-carousel'],
    },
    {
      name: 'accordion-faq',
      instances: ['.cmp-faq'],
    },
    {
      name: 'form',
      instances: ['.phx-newsletter-form'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Product Hero',
      selector: 'section.medication-enrollment-card',
      style: null,
      blocks: ['columns-product'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Jump Navigation',
      selector: '.cmp-tabs.cmp-tabs--jump-nav',
      style: null,
      blocks: ['tabs-jumpnav'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Product Information',
      selector: 'section.product-information',
      style: null,
      blocks: ['columns-product'],
      defaultContent: [
        '.product-information__title',
        '.product-information__intro',
        '.product-information__side-effects',
        '.product-information__disclaimer',
      ],
    },
    {
      id: 'section-4',
      name: 'How to Get Medication',
      selector: '.cmp-howtogetmedication',
      style: null,
      blocks: ['columns-product'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Patient Testimonials',
      selector: '.cmp-testimonial-carousel',
      style: 'dark',
      blocks: ['carousel-testimonial'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'FAQ',
      selector: '.cmp-faq',
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'Newsletter Signup',
      selector: 'section.phx-newsletter-form',
      style: null,
      blocks: ['form'],
      defaultContent: [
        '.phx-newsletter-form__heading',
        '.phx-newsletter-form__subtext',
      ],
    },
  ],
};

const transformers = [
  novocareCleanupTransformer,
  novocareSectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
