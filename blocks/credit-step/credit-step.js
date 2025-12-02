/**
 * blocks/identity-step/identity-step.js
 *
 * Decorate function for the identity-step block.
 * All DOM queries are scoped to the block to avoid global collisions.
 */
import { trackIdentityStep, trackCardSelected, trackIdentitySubmit } from '../../scripts/aem.js';

export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'identity-block identity-block--root';

  wrapper.innerHTML = `
    <div class="identity-block__tabs" role="tablist" aria-label="Steps">
      <button class="identity-block__tab identity-block__tab--active" data-step="0">Choose Card</button>
      <button class="identity-block__tab" data-step="1">Confirm Details</button>
      <button class="identity-block__tab" data-step="2">Employment</button>
      <button class="identity-block__tab" data-step="3">Submit</button>
    </div>

    <div class="identity-block__panels">
      <section class="identity-block__panel identity-block__panel--active" id="step-0">
        <h2 class="identity-block__title">Choose Your Card</h2>
        <div class="identity-block__cards">
          <div class="identity-block__card" data-card="MoneyBack">
            <div class="identity-block__card-title">MoneyBack+ Visa</div>
            <div class="identity-block__card-sub">Everyday Spends • Recommended</div>
          </div>
          <div class="identity-block__card" data-card="PixelPlay">
            <div class="identity-block__card-title">PIXEL Play</div>
            <div class="identity-block__card-sub">Born Digital For The Born Digital</div>
          </div>
          <div class="identity-block__card" data-card="Swiggy">
            <div class="identity-block__card-title">Swiggy Card</div>
            <div class="identity-block__card-sub">Savings Never Tasted So Good</div>
          </div>
        </div>
        <div class="identity-block__actions">
          <button class="identity-block__btn identity-block__btn--primary js-next">Next</button>
        </div>
      </section>

      <section class="identity-block__panel" id="step-1">
        <h2 class="identity-block__title">Confirm Your Details</h2>
        <label class="identity-block__label">Full Name
          <input class="identity-block__input" id="fullName" placeholder="Enter full name" />
        </label>
        <label class="identity-block__label">Address
          <input class="identity-block__input" id="address" placeholder="Enter address" />
        </label>
        <label class="identity-block__label">PIN Code
          <input class="identity-block__input" id="pincode" placeholder="Enter PIN" />
        </label>
        <div class="identity-block__actions">
          <button class="identity-block__btn identity-block__btn--secondary js-prev">Back</button>
          <button class="identity-block__btn identity-block__btn--primary js-next">Next</button>
        </div>
      </section>

      <section class="identity-block__panel" id="step-2">
        <h2 class="identity-block__title">Employment Information</h2>
        <label class="identity-block__label">Employment Type
          <select class="identity-block__select" id="empType">
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Self Employed</option>
            <option>Student</option>
          </select>
        </label>
        <label class="identity-block__label">Company Name
          <input class="identity-block__input" id="company" placeholder="Enter Company Name" />
        </label>
        <div class="identity-block__actions">
          <button class="identity-block__btn identity-block__btn--secondary js-prev">Back</button>
          <button class="identity-block__btn identity-block__btn--primary js-next">Next</button>
        </div>
      </section>

      <section class="identity-block__panel" id="step-3">
        <h2 class="identity-block__title">Review & Submit</h2>
        <div class="identity-block__review">
          <div class="identity-block__review-row"><strong>Selected Card:</strong> <span id="reviewCard"></span></div>
          <div class="identity-block__review-row"><strong>Name:</strong> <span id="reviewName"></span></div>
          <div class="identity-block__review-row"><strong>Address:</strong> <span id="reviewAddress"></span></div>
          <div class="identity-block__review-row"><strong>PIN:</strong> <span id="reviewPin"></span></div>
          <div class="identity-block__review-row"><strong>Employment:</strong> <span id="reviewEmp"></span></div>
          <div class="identity-block__review-row"><strong>Company:</strong> <span id="reviewCompany"></span></div>
        </div>
        <div class="identity-block__actions">
          <button class="identity-block__btn identity-block__btn--secondary js-prev">Back</button>
          <button class="identity-block__btn identity-block__btn--primary">Submit Application</button>
        </div>
      </section>
    </div>
  `;

  // Replace block content with the scoped wrapper
  block.replaceChildren(wrapper);

  // ====== Scoped DOM helpers ======
  const root = wrapper;
  const tabs = Array.from(root.querySelectorAll('.identity-block__tab'));
  const panels = Array.from(root.querySelectorAll('.identity-block__panel'));
  const nextBtns = Array.from(root.querySelectorAll('.js-next'));
  const prevBtns = Array.from(root.querySelectorAll('.js-prev'));
  const cardBoxes = Array.from(root.querySelectorAll('.identity-block__card'));

  let currentStep = 0;
  let selectedCard = '';

  const stepNames = ['Choose Card', 'Confirm Details', 'Employment', 'Submit'];

  // use shared analytics helper to track steps

  function showStep(step) {
    panels.forEach((p, i) => p.classList.toggle('identity-block__panel--active', i === step));
    tabs.forEach((t, i) => t.classList.toggle('identity-block__tab--active', i === step));
    currentStep = step;
    // push tracking event for this step (shared helper)
    trackIdentityStep(step, stepNames[step] || `step_${step}`);

    // Also fire a data-layer event for Adobe Launch rules to intercept
    const eventMap = {
      0: 'choose_card',
      1: 'confirm_details',
      2: 'employment_step',
      3: 'submit_application',
    };
    const eventName = eventMap[step] || `step_${step}`;
    if (window.pushEvent) {
      window.pushEvent(eventName, { stepIndex: step, stepName: stepNames[step] });
    }

    if (step === 3) fillReview();
  }

  function fillReview() {
    root.querySelector('#reviewCard').textContent = selectedCard || '—';
    root.querySelector('#reviewName').textContent = root.querySelector('#fullName').value || '—';
    root.querySelector('#reviewAddress').textContent = root.querySelector('#address').value || '—';
    root.querySelector('#reviewPin').textContent = root.querySelector('#pincode').value || '—';
    root.querySelector('#reviewEmp').textContent = root.querySelector('#empType').value || '—';
    root.querySelector('#reviewCompany').textContent = root.querySelector('#company').value || '—';
  }

  // Tab clicks (optional): allow jumping
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showStep(i));
  });

  // Card selection (scoped)
  cardBoxes.forEach((card) => {
    card.addEventListener('click', () => {
      cardBoxes.forEach((c) => c.classList.remove('identity-block__card--selected'));
      card.classList.add('identity-block__card--selected');
      selectedCard = card.dataset.card || '';

      // push card selection event (shared helper)
      trackCardSelected(selectedCard);

      // Fire data-layer event for Adobe Launch rules
      if (window.pushEvent) {
        window.pushEvent('choose_card', { cardName: selectedCard });
      }
    });
  });

  // Next / Prev buttons
  nextBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentStep < panels.length - 1) showStep(currentStep + 1);
    });
  });
  prevBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  });

  // Detect initial step from URL query param or hash
  // Supports: ?step=confirm_details or ?step=1 or #confirm_details or #1
  function getInitialStep() {
    const stepMap = {
      'choose_card': 0,
      '0': 0,
      'confirm_details': 1,
      '1': 1,
      'employment_step': 2,
      '2': 2,
      'submit_application': 3,
      '3': 3,
    };

    // Try query param first
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam && stepParam in stepMap) {
      return stepMap[stepParam];
    }

    // Try hash (without # prefix)
    const hash = window.location.hash.substring(1);
    if (hash && hash in stepMap) {
      return stepMap[hash];
    }

    // Default to step 0
    return 0;
  }

  const initialStep = getInitialStep();

  // initial state
  showStep(initialStep);

  // Submit button tracking (scoped)
  const submitBtn = root.querySelector('button.identity-block__btn.identity-block__btn--primary:not(.js-next)');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      // gather a small payload for submission
      const payload = {
        selectedCard: selectedCard || null,
        name: root.querySelector('#fullName')?.value || null,
      };
      // use shared helper to track submit; payload should be sanitized for PII
      trackIdentitySubmit(payload);

      // Fire data-layer event for Adobe Launch rules
      if (window.pushEvent) {
        window.pushEvent('application_submit', {
          selectedCard: selectedCard || null,
          formCompleted: true,
        });
      }
      // allow normal form behavior (no preventDefault)
    });
  }
}
