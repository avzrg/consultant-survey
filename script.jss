(function () {
  const form = document.getElementById('surveyForm');
  const sections = Array.from(document.querySelectorAll('section.card'));
  const progressBar = document.getElementById('progress-bar');
  const anonToggle = document.getElementById('anonymousToggle');
  const identityFields = document.getElementById('identityFields');
  const year = document.getElementById('year');
  year.textContent = new Date().getFullYear();

  // Step navigation
  function showStep(step) {
    sections.forEach(s => s.hidden = s.dataset.step !== String(step));
    form.dataset.step = String(step);
    const pct = ((step - 1) / (sections.length - 1)) * 100;
    progressBar.style.width = `${Math.min(pct, 100)}%`;
  }

  // Toggle anonymity
  function updateIdentity() {
    const anon = anonToggle.checked;
    identityFields.hidden = anon;
    if (anon) {
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
    }
  }
  anonToggle.addEventListener('change', updateIdentity);
  updateIdentity();

  // Buttons
  document.getElementById('next1').addEventListener('click', () => showStep(2));
  document.getElementById('back2').addEventListener('click', () => showStep(1));
  document.getElementById('next2').addEventListener('click', () => {
    // Require at least the first two scales to be answered
    const required = ['clarity_role','handover_quality','access_tools','communication'];
    const ok = required.every(name => !!form.querySelector(`input[name="${name}"]:checked`));
    if (!ok) { alert('Please answer the Experience questions.'); return; }
    showStep(3);
  });
  document.getElementById('back3').addEventListener('click', () => showStep(2));

  // Submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Build payload
    const fd = new FormData(form);
    // Include anonymity flag
    fd.append('anonymous', anonToggle.checked ? 'Yes' : 'No');

    // POST to Formspree
    const endpoint = window.FORMSPREE_ENDPOINT;
    try {
      const res = await fetch(endpoint, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        showStep(4);
        // Reset form for fresh entry
        form.reset();
        anonToggle.checked = true;
        updateIdentity();
      } else {
        alert('There was a problem submitting your feedback. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  });

  // Start on step 1
  showStep(1);
})();