export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'identity-wrapper';

  wrapper.innerHTML = `
    <div class="progress-bar">
      <div class="step active">Identify Yourself</div>
      <div class="step">Confirm Your Details</div>
      <div class="step">Choose Card</div>
      <div class="step">Submit & Receive</div>
    </div>

    <h3 class="title">Hi, Now in just 3 easy steps , get the best offers for you</h3>

    <div class="forms-container">
      <div class="mobile-box">
        <label>Enter your Mobile Number</label>
        <div class="mobile-input">
          <span>+91</span>
          <input type="text" maxlength="10" placeholder="Enter mobile number">
        </div>
        <small>We will be sending you an OTP to this number have it handy</small>
      </div>

      <div class="validate-box">
        <label>Validate using</label>
        <div class="dob-row">
          <label>Date of Birth</label>
          <div class="dob-inputs">
            <input type="text" maxlength="2" placeholder="DD">
            <input type="text" maxlength="2" placeholder="MM">
            <input type="text" maxlength="4" placeholder="YYYY">
          </div>
        </div>

        <div class="divider">OR</div>

        <div class="pan-row">
          <label>PAN Number</label>
          <div class="pan-inputs">
            ${'<input type="text" maxlength="1">'.repeat(10)}
          </div>
        </div>
      </div>
    </div>

    <div class="consent-box">
      <label>
        <input type="checkbox">
        I hereby consent to collection and processing of my data for availing this credit card and relevant services in the manner described in the notice <a href="#">here</a>.
      </label>
    </div>
  `;

  block.replaceChildren(wrapper);

  // --- Basic functionality: Auto move PAN inputs ---
  const panInputs = wrapper.querySelectorAll('.pan-inputs input');
  panInputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      if (inp.value && i < panInputs.length - 1) {
        panInputs[i + 1].focus();
      }
    });
  });
}
