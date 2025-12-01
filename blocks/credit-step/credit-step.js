export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'identity-container';

  wrapper.innerHTML = `
    <div class="tabs">
      <div class="tab active" data-step="0">Choose Card</div>
      <div class="tab" data-step="1">Confirm Details</div>
      <div class="tab" data-step="2">Employment</div>
      <div class="tab" data-step="3">Submit</div>
    </div>

    <div class="section active" id="step-0">
      <h2>Choose Your Card</h2>
      <div class="card-options">
        <div class="card-box" data-card="MoneyBack">
          <h3>MoneyBack+ Visa</h3>
          <p>Everyday Spends • Recommended</p>
        </div>

        <div class="card-box" data-card="PixelPlay">
          <h3>PIXEL Play</h3>
          <p>Born Digital For The Born Digital</p>
        </div>

        <div class="card-box" data-card="Swiggy">
          <h3>Swiggy Card</h3>
          <p>Savings Never Tasted So Good</p>
        </div>
      </div>
      <button class="btn next-btn">Next</button>
    </div>

    <div class="section" id="step-1">
      <h2>Confirm Your Details</h2>
      <label>Full Name</label>
      <input id="fullName" placeholder="Enter full name" />

      <label>Address</label>
      <input id="address" placeholder="Enter address" />

      <label>PIN Code</label>
      <input id="pincode" placeholder="Enter PIN" />

      <button class="btn-secondary prev-btn">Back</button>
      <button class="btn next-btn">Next</button>
    </div>

    <div class="section" id="step-2">
      <h2>Employment Information</h2>
      <label>Employment Type</label>
      <select id="empType">
        <option>Full Time</option>
        <option>Part Time</option>
        <option>Self Employed</option>
        <option>Student</option>
      </select>

      <label>Company Name</label>
      <input id="company" placeholder="Enter Company Name" />

      <button class="btn-secondary prev-btn">Back</button>
      <button class="btn next-btn">Next</button>
    </div>

    <div class="section" id="step-3">
      <h2>Review & Submit</h2>
      <div class="review-box">
        <p><b>Selected Card:</b> <span id="reviewCard"></span></p>
        <p><b>Name:</b> <span id="reviewName"></span></p>
        <p><b>Address:</b> <span id="reviewAddress"></span></p>
        <p><b>PIN:</b> <span id="reviewPin"></span></p>
        <p><b>Employment:</b> <span id="reviewEmp"></span></p>
        <p><b>Company:</b> <span id="reviewCompany"></span></p>
      </div>
      <button class="btn-secondary prev-btn">Back</button>
      <button class="btn">Submit Application</button>
    </div>
  `;

  block.replaceChildren(wrapper);

  /* -------- JS Logic -------- */
  let currentStep = 0;
  let selectedCard = '';

  const showStep = (step) => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector(`#step-${step}`).classList.add('active');

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-step='${step}']`).classList.add('active');

    currentStep = step;

    if (step === 3) fillReview();
  };

  const fillReview = () => {
    document.getElementById('reviewCard').innerText = selectedCard;
    document.getElementById('reviewName').innerText = document.getElementById('fullName').value;
    document.getElementById('reviewAddress').innerText = document.getElementById('address').value;
    document.getElementById('reviewPin').innerText = document.getElementById('pincode').value;
    document.getElementById('reviewEmp').innerText = document.getElementById('empType').value;
    document.getElementById('reviewCompany').innerText = document.getElementById('company').value;
  };

  /* Card selection */
  document.querySelectorAll('.card-box').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.card-box').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCard = card.dataset.card;
    });
  });

  /* Next Buttons */
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < 3) showStep(currentStep + 1);
    });
  });

  /* Back Buttons */
  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  });
}
