/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-weight-loss-product.js
  var import_weight_loss_product_exports = {};
  __export(import_weight_loss_product_exports, {
    default: () => import_weight_loss_product_default
  });

  // tools/importer/parsers/accordion-faq.js
  function parse(element, { document }) {
    const faqItems = element.querySelectorAll(".cmp-faq__item");
    const cells = [];
    faqItems.forEach((item) => {
      const questionEl = item.querySelector(".cmp-faq__question");
      const answerEl = item.querySelector(".cmp-faq__answer");
      if (questionEl && answerEl) {
        const questionText = questionEl.textContent.trim();
        const questionNode = document.createElement("p");
        questionNode.textContent = questionText;
        const answerContent = [];
        const answerChildren = answerEl.querySelectorAll(":scope > *");
        if (answerChildren.length > 0) {
          answerChildren.forEach((child) => answerContent.push(child));
        } else {
          answerContent.push(answerEl);
        }
        cells.push([questionNode, answerContent]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-testimonial.js
  function parse2(element, { document }) {
    const cells = [];
    const slides = element.querySelectorAll("article.cmp-testimonial-carousel__slide");
    slides.forEach((slide) => {
      const blockquote = slide.querySelector("blockquote.cmp-testimonial-carousel__quote");
      const avatarImg = slide.querySelector("img.cmp-testimonial-carousel__avatar-img");
      const authorName = slide.querySelector("p.cmp-testimonial-carousel__author-name");
      const authorMeta = slide.querySelector("p.cmp-testimonial-carousel__author-meta");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-product.js
  function parse3(element, { document }) {
    const cells = [];
    const galleryColumn = element.querySelector(".medication-enrollment-card__gallery-column");
    const contentColumn = element.querySelector(".medication-enrollment-card__content-column");
    if (galleryColumn && contentColumn) {
      const leftCell = [];
      const heroImages = galleryColumn.querySelectorAll(".medication-enrollment-card__gallery-hero-media");
      heroImages.forEach((img) => {
        if (img.src && !img.src.startsWith("data:")) {
          leftCell.push(img);
        }
      });
      const rightCell = [];
      const title = contentColumn.querySelector(".medication-enrollment-card__title");
      if (title) rightCell.push(title);
      const intro = contentColumn.querySelector(".medication-enrollment-card__intro");
      if (intro) rightCell.push(intro);
      const helper = contentColumn.querySelector(".medication-enrollment-card__helper");
      if (helper) rightCell.push(helper);
      const fieldsets = contentColumn.querySelectorAll(".medication-enrollment-card__fieldset");
      fieldsets.forEach((fieldset) => {
        const legend = fieldset.querySelector(".medication-enrollment-card__legend");
        if (legend && legend.textContent.trim()) {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = legend.textContent.trim();
          p.appendChild(strong);
          rightCell.push(p);
        }
        fieldset.querySelectorAll(".medication-enrollment-card__segmented-text").forEach((txt) => {
          if (txt.textContent.trim()) {
            const p = document.createElement("p");
            p.textContent = txt.textContent.trim();
            rightCell.push(p);
          }
        });
        fieldset.querySelectorAll(".medication-enrollment-card__chip-label").forEach((chip) => {
          if (chip.textContent.trim()) {
            const p = document.createElement("p");
            p.textContent = chip.textContent.trim();
            rightCell.push(p);
          }
        });
        fieldset.querySelectorAll(".medication-enrollment-card__option").forEach((opt) => {
          const optTitle = opt.querySelector(".medication-enrollment-card__option-title");
          const optDesc = opt.querySelector(".medication-enrollment-card__option-desc");
          if (optTitle) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = optTitle.textContent.trim();
            p.appendChild(strong);
            if (optDesc) {
              p.appendChild(document.createTextNode(" \u2014 " + optDesc.textContent.trim()));
            }
            rightCell.push(p);
          }
        });
      });
      const pricingBox = contentColumn.querySelector(".medication-enrollment-card__pricing-box");
      if (pricingBox) {
        const pricingTitle = pricingBox.querySelector(".medication-enrollment-card__pricing-box-title");
        if (pricingTitle) rightCell.push(pricingTitle);
        const priceCaption = pricingBox.querySelector(".medication-enrollment-card__price-amount-caption");
        if (priceCaption) rightCell.push(priceCaption);
        const price = pricingBox.querySelector(".medication-enrollment-card__price");
        if (price) rightCell.push(price);
        const pricePeriod = pricingBox.querySelector(".medication-enrollment-card__price-period");
        if (pricePeriod) rightCell.push(pricePeriod);
        const disclaimer = pricingBox.querySelector(".medication-enrollment-card__disclaimer");
        if (disclaimer) rightCell.push(disclaimer);
      }
      const ctaLinks = contentColumn.querySelectorAll(".medication-enrollment-card__btn, a[href]");
      ctaLinks.forEach((link) => {
        if (link.href && !link.closest(".medication-enrollment-card__intro")) rightCell.push(link);
      });
      if (leftCell.length > 0 || rightCell.length > 0) {
        cells.push([leftCell.length > 0 ? leftCell : [""], rightCell.length > 0 ? rightCell : [""]]);
      }
      const block2 = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
      element.replaceWith(block2);
      return;
    }
    const infoColumns = element.querySelectorAll('[class*="product-information__column"], [class*="product-information__col"]');
    if (infoColumns.length >= 2) {
      const leftCell = [];
      const rightCell = [];
      infoColumns[0].querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]").forEach((el) => {
        if (el.tagName === "IMG" && el.src && el.src.startsWith("data:")) return;
        leftCell.push(el);
      });
      infoColumns[1].querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]").forEach((el) => {
        if (el.tagName === "IMG" && el.src && el.src.startsWith("data:")) return;
        rightCell.push(el);
      });
      cells.push([leftCell.length > 0 ? leftCell : [""], rightCell.length > 0 ? rightCell : [""]]);
      const block2 = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
      element.replaceWith(block2);
      return;
    }
    const stepsContent = element.querySelector('[class*="howtogetmedication__steps"], [class*="howtogetmedication__content"], [class*="howtogetmedication__left"]');
    const stepsImage = element.querySelector('[class*="howtogetmedication__image"], [class*="howtogetmedication__right"], [class*="howtogetmedication__media"]');
    if (stepsContent || stepsImage) {
      const leftCell = [];
      const rightCell = [];
      if (stepsContent) {
        stepsContent.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, a[href]").forEach((el) => {
          leftCell.push(el);
        });
      }
      if (stepsImage) {
        stepsImage.querySelectorAll("img").forEach((img) => {
          if (img.src && !img.src.startsWith("data:")) rightCell.push(img);
        });
        stepsImage.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((el) => {
          rightCell.push(el);
        });
      }
      if (leftCell.length > 0 || rightCell.length > 0) {
        cells.push([leftCell.length > 0 ? leftCell : [""], rightCell.length > 0 ? rightCell : [""]]);
      }
      const block2 = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
      element.replaceWith(block2);
      return;
    }
    const directChildren = element.querySelectorAll(":scope > div");
    if (directChildren.length >= 2) {
      const leftCell = [];
      const rightCell = [];
      directChildren[0].querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]").forEach((el) => {
        if (el.tagName === "IMG" && el.src && el.src.startsWith("data:")) return;
        leftCell.push(el);
      });
      directChildren[1].querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]").forEach((el) => {
        if (el.tagName === "IMG" && el.src && el.src.startsWith("data:")) return;
        rightCell.push(el);
      });
      cells.push([leftCell.length > 0 ? leftCell : [""], rightCell.length > 0 ? rightCell : [""]]);
    } else {
      const allContent = [];
      element.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, img, a[href]").forEach((el) => {
        if (el.tagName === "IMG" && el.src && el.src.startsWith("data:")) return;
        allContent.push(el);
      });
      if (allContent.length > 0) {
        cells.push([allContent]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/form.js
  function parse4(element, { document }) {
    const heading = element.querySelector("h2.phx-newsletter-form__heading, .phx-newsletter-form__heading");
    const subtext = element.querySelector("p.phx-newsletter-form__subtext, .phx-newsletter-form__subtext");
    const fields = Array.from(element.querySelectorAll(".phx-newsletter-form__field"));
    const consentCheckbox = element.querySelector(".phx-newsletter-form__consent");
    const submitButton = element.querySelector("button.phx-newsletter-form__submit, .phx-newsletter-form__submit");
    const cells = [];
    const introCell = [];
    if (heading) introCell.push(heading);
    if (subtext) introCell.push(subtext);
    if (introCell.length > 0) {
      cells.push(introCell);
    }
    fields.forEach((field) => {
      const label = field.querySelector("label.phx-newsletter-form__label, .phx-newsletter-form__label");
      const input = field.querySelector("input.phx-newsletter-form__input, .phx-newsletter-form__input");
      if (label && input) {
        const labelText = label.textContent.trim();
        const inputId = input.getAttribute("id") || "";
        let fieldType = "text";
        if (inputId.toLowerCase().includes("email")) {
          fieldType = "email";
        }
        const typeNode = document.createTextNode(fieldType);
        const labelNode = document.createTextNode(labelText);
        cells.push([labelNode, typeNode]);
      }
    });
    if (consentCheckbox) {
      const consentLabel = consentCheckbox.querySelector(".phx-newsletter-form__consent-label, .phx-newsletter-form__consent-text");
      const consentText = consentLabel ? consentLabel.textContent.trim() : "I consent";
      const consentNode = document.createTextNode(consentText);
      const checkboxType = document.createTextNode("checkbox");
      cells.push([consentNode, checkboxType]);
    }
    if (submitButton) {
      const submitText = submitButton.textContent.trim();
      const submitNode = document.createTextNode(submitText);
      const submitType = document.createTextNode("submit");
      cells.push([submitNode, submitType]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "form", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-jumpnav.js
  function parse5(element, { document }) {
    const nav = element.querySelector(".phx-tabs-jump__nav");
    const label = element.querySelector(".phx-tabs-jump__nav-label");
    const links = Array.from(element.querySelectorAll(".phx-tabs-jump__link"));
    const cells = [];
    if (label) {
      cells.push([label]);
    }
    links.forEach((link) => {
      cells.push([link]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-jumpnav", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/novocare-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk"
      ]);
      const otIframe = element.querySelector("iframe.ot-text-resize");
      if (otIframe) otIframe.remove();
      const tabsContainer = element.querySelector(".cmp-tabs.cmp-tabs--jump-nav");
      if (tabsContainer) {
        const parent = tabsContainer.parentNode;
        const panels = tabsContainer.querySelectorAll(":scope > .cmp-tabs__tabpanel");
        panels.forEach((panel) => {
          while (panel.firstChild) {
            parent.insertBefore(panel.firstChild, tabsContainer);
          }
        });
        const jumpNav = tabsContainer.querySelector("section.phx-tabs-jump");
        if (jumpNav) {
          tabsContainer.innerHTML = "";
          tabsContainer.appendChild(jumpNav);
        }
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.nc-site-header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header"
      ]);
      const expFragments = element.querySelectorAll(".phx-experiencefragment");
      expFragments.forEach((frag) => {
        if (!frag.querySelector('header, section, .cmp-container, [class*="medication"], [class*="tabs"], [class*="testimonial"], [class*="faq"], [class*="newsletter"]')) {
          if (frag.textContent.trim() === "") {
            frag.remove();
          }
        }
      });
      WebImporter.DOMUtils.remove(element, ["link"]);
      WebImporter.DOMUtils.remove(element, ["meta"]);
      WebImporter.DOMUtils.remove(element, ["noscript"]);
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.includes("bat.bing.com") || src.includes("thrtle.com") || src.includes("bh.contextweb.com")) {
          const parent = img.closest("picture") || img;
          const wrapper = parent.closest("p") || parent;
          wrapper.remove();
        }
      });
      element.querySelectorAll('a[href*="adsrvr.org"]').forEach((a) => {
        const wrapper = a.closest("p");
        if (wrapper) {
          wrapper.remove();
        } else {
          a.remove();
        }
      });
    }
  }

  // tools/importer/transformers/novocare-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      reversedSections.forEach((section, reverseIndex) => {
        const originalIndex = sections.length - 1 - reverseIndex;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (originalIndex > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-weight-loss-product.js
  var parsers = {
    "accordion-faq": parse,
    "carousel-testimonial": parse2,
    "columns-product": parse3,
    "form": parse4,
    "tabs-jumpnav": parse5
  };
  var PAGE_TEMPLATE = {
    name: "weight-loss-product",
    description: "Weight loss product page with medication information and resources",
    urls: [
      "https://publish-p99508-e1532789.adobeaemcloud.com/content/novocare-poc/home/weight-loss/wegovy.html"
    ],
    blocks: [
      {
        name: "columns-product",
        instances: [
          "section.medication-enrollment-card",
          ".product-information__columns",
          ".cmp-howtogetmedication"
        ]
      },
      {
        name: "tabs-jumpnav",
        instances: [".cmp-tabs.cmp-tabs--jump-nav"]
      },
      {
        name: "carousel-testimonial",
        instances: [".cmp-testimonial-carousel"]
      },
      {
        name: "accordion-faq",
        instances: [".cmp-faq"]
      },
      {
        name: "form",
        instances: [".phx-newsletter-form"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Product Hero",
        selector: "section.medication-enrollment-card",
        style: null,
        blocks: ["columns-product"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Jump Navigation",
        selector: ".cmp-tabs.cmp-tabs--jump-nav",
        style: null,
        blocks: ["tabs-jumpnav"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Product Information",
        selector: "section.product-information",
        style: null,
        blocks: ["columns-product"],
        defaultContent: [
          ".product-information__title",
          ".product-information__intro",
          ".product-information__side-effects",
          ".product-information__disclaimer"
        ]
      },
      {
        id: "section-4",
        name: "How to Get Medication",
        selector: ".cmp-howtogetmedication",
        style: null,
        blocks: ["columns-product"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Patient Testimonials",
        selector: ".cmp-testimonial-carousel",
        style: "dark",
        blocks: ["carousel-testimonial"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "FAQ",
        selector: ".cmp-faq",
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "Newsletter Signup",
        selector: "section.phx-newsletter-form",
        style: null,
        blocks: ["form"],
        defaultContent: [
          ".phx-newsletter-form__heading",
          ".phx-newsletter-form__subtext"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_weight_loss_product_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_weight_loss_product_exports);
})();
