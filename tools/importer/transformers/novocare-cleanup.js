/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NovoCare site-wide cleanup.
 * Removes non-authorable content (header, footer, cookie consent, breadcrumbs, search).
 * All selectors verified against captured DOM in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent banner and preference center
    // Found in captured HTML: <div id="onetrust-consent-sdk">
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
    ]);

    // OneTrust text-resize iframe
    // Found in captured HTML: <iframe class="ot-text-resize">
    const otIframe = element.querySelector('iframe.ot-text-resize');
    if (otIframe) otIframe.remove();

    // Unwrap tab panels from .cmp-tabs--jump-nav container
    // The jump nav wraps all main content sections as tab panels.
    // Move each tab panel's content out so block selectors can find them.
    const tabsContainer = element.querySelector('.cmp-tabs.cmp-tabs--jump-nav');
    if (tabsContainer) {
      const parent = tabsContainer.parentNode;
      const panels = tabsContainer.querySelectorAll(':scope > .cmp-tabs__tabpanel');
      panels.forEach((panel) => {
        while (panel.firstChild) {
          parent.insertBefore(panel.firstChild, tabsContainer);
        }
      });
      // Keep only the jump nav section inside the container
      const jumpNav = tabsContainer.querySelector('section.phx-tabs-jump');
      if (jumpNav) {
        tabsContainer.innerHTML = '';
        tabsContainer.appendChild(jumpNav);
      }
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Site header (contains nav, breadcrumbs, search, utility nav)
    // Found in captured HTML: <header class="nc-site-header">
    WebImporter.DOMUtils.remove(element, [
      'header.nc-site-header',
    ]);

    // Experience fragment wrapper for header
    // Found in captured HTML: <div class="cmp-experiencefragment cmp-experiencefragment--header">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
    ]);

    // Empty experience fragment (footer placeholder)
    // Found in captured HTML: <div class="phx-experiencefragment ..."> (empty div)
    const expFragments = element.querySelectorAll('.phx-experiencefragment');
    expFragments.forEach((frag) => {
      if (!frag.querySelector('header, section, .cmp-container, [class*="medication"], [class*="tabs"], [class*="testimonial"], [class*="faq"], [class*="newsletter"]')) {
        // Only remove if it has no authorable content (empty footer fragment)
        if (frag.textContent.trim() === '') {
          frag.remove();
        }
      }
    });

    // Stray link elements (CSS references)
    // Found in captured HTML: <link href="/etc.clientlibs/...">
    WebImporter.DOMUtils.remove(element, ['link']);

    // Stray meta elements (breadcrumb schema)
    // Found in captured HTML: <meta> inside .cmp-breadcrumb__item
    WebImporter.DOMUtils.remove(element, ['meta']);

    // Noscript elements if any
    WebImporter.DOMUtils.remove(element, ['noscript']);

    // Tracking pixels and ad tech (Bing, TTD, Contextweb, Thrtle)
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('bat.bing.com') || src.includes('thrtle.com') || src.includes('bh.contextweb.com')) {
        const parent = img.closest('picture') || img;
        const wrapper = parent.closest('p') || parent;
        wrapper.remove();
      }
    });
    element.querySelectorAll('a[href*="adsrvr.org"]').forEach((a) => {
      const wrapper = a.closest('p');
      if (wrapper) {
        wrapper.remove();
      } else {
        a.remove();
      }
    });
  }
}
