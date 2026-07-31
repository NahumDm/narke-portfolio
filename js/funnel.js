/* ==========================================================================
   Scope funnel
   1) Role-aware CTAs — clicking a "client" or "recruiter" tagged link
      preselects the right path in the contact form.
   2) Live scope summary — builds a plain-text summary from the form fields.
   3) Real submission — POSTs the form to Formspree in the background via
      fetch(), so the visitor never needs their own email app open.
   ========================================================================== */
(function () {
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgogblyr';

  const intent = document.getElementById('intent');
  if (!intent) return; // funnel not present on this page

  const form = document.getElementById('scopeForm');
  const clientName = document.getElementById('clientName');       // may be null — handled safely below
  const clientEmail = document.getElementById('clientEmail');     // may be null — handled safely below
  const clientFields = document.getElementById('clientFields');
  const recruiterFields = document.getElementById('recruiterFields');
  const stage = document.getElementById('stage');
  const budget = document.getElementById('budget');
  const roleType = document.getElementById('roleType');
  const workMode = document.getElementById('workMode');
  const timeline = document.getElementById('timeline');
  const details = document.getElementById('details');
  const summaryBox = document.getElementById('summaryBox');
  const sendBtn = document.getElementById('sendBtn');
  const copyBtn = document.getElementById('copyBtn');
  const copiedMsg = document.getElementById('copiedMsg');
  const formSubject = document.getElementById('formSubject');           // optional hidden field
  const formattedSummary = document.getElementById('formattedSummary'); // optional hidden field

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
  }

  const intentLabels = {
    mobile: 'A custom mobile app',
    backend: 'A backend / API system',
    both: 'Both — mobile + backend',
    hire: 'A full-time hire',
  };
  const stageLabels = { idea: 'Just an idea', mvp: 'MVP in progress', scaling: 'Scaling an existing product' };
  const budgetLabels = { 'under-1k': 'Under $1k', '3-10k': '$1k–$10k', '10-30k': '$10k–$30k', 'gt-30k': '$30k+', '30k-plus': '$30k+' };
  const roleLabels = { 'backend-role': 'Backend Engineer', 'mobile-role': 'Mobile Engineer', 'fullstack-role': 'Full-stack / Both' };
  const modeLabels = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };
  const timelineLabels = { asap: 'ASAP', '1-3mo': '1–3 months', flexible: 'Flexible' };

  function updateFieldVisibility() {
    const isHire = intent.value === 'hire';
    clientFields.style.display = isHire ? 'none' : 'block';
    recruiterFields.style.display = isHire ? 'block' : 'none';
  }

  function buildSummary() {
    const isHire = intent.value === 'hire';
    const lines = [];

    if (clientName) lines.push('FROM:         ' + (clientName.value.trim() || '(name not entered)'));
    if (clientEmail) lines.push('EMAIL:        ' + (clientEmail.value.trim() || '(email not entered)'));
    lines.push('LOOKING FOR:  ' + intentLabels[intent.value]);

    if (isHire) {
      lines.push('ROLE TYPE:    ' + roleLabels[roleType.value]);
      lines.push('WORK MODE:    ' + modeLabels[workMode.value]);
    } else {
      lines.push('STAGE:        ' + stageLabels[stage.value]);
      lines.push('BUDGET:       ' + budgetLabels[budget.value]);
    }

    lines.push('TIMELINE:     ' + timelineLabels[timeline.value]);
    lines.push('');
    lines.push('DETAILS:');
    lines.push(details.value.trim() ? details.value.trim() : '(add a line or two above)');
    return lines.join('\n');
  }

  function refresh() {
    updateFieldVisibility();
    const summary = buildSummary();
    summaryBox.textContent = summary;

    if (formattedSummary) formattedSummary.value = summary;
    if (formSubject) {
      formSubject.value = intent.value === 'hire' ? 'Full-time role inquiry — via narke.tech' : 'Project scope — via narke.tech';
    }

    // If there's no email field in the HTML, don't gate the button on it.
    const emailOk = clientEmail ? isValidEmail(clientEmail.value) : true;
    sendBtn.disabled = !emailOk;
    sendBtn.style.opacity = emailOk ? '1' : '0.5';
    sendBtn.style.cursor = emailOk ? 'pointer' : 'not-allowed';
  }

  [intent, stage, budget, roleType, workMode, timeline].forEach((el) => el.addEventListener('change', refresh));
  details.addEventListener('input', refresh);
  if (clientName) clientName.addEventListener('input', refresh);
  if (clientEmail) clientEmail.addEventListener('input', refresh);

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(summaryBox.textContent).then(() => {
      copiedMsg.textContent = 'Copied to clipboard.';
      setTimeout(() => (copiedMsg.textContent = ''), 2000);
    });
  });

  // Hero / nav CTAs tagged data-role="client" or data-role="recruiter"
  // preselect the matching path in the form before the page scrolls to it.
  document.querySelectorAll('[data-role]').forEach((el) => {
    el.addEventListener('click', () => {
      const role = el.getAttribute('data-role');
      if (role === 'recruiter') intent.value = 'hire';
      if (role === 'client' && intent.value === 'hire') intent.value = 'both';
      intent.dispatchEvent(new Event('change'));
    });
  });

  // Real submission via Formspree — no visitor email app required.
  sendBtn.addEventListener('click', async () => {
    if (sendBtn.disabled) return;

    const originalLabel = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    copiedMsg.style.color = '';
    copiedMsg.textContent = '';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        sendBtn.textContent = 'Sent ✓';
        copiedMsg.style.color = 'var(--signal-ok)';
        copiedMsg.textContent = "Thanks — I'll get back to you shortly.";
        form.reset();
        setTimeout(() => {
          sendBtn.textContent = originalLabel;
          sendBtn.disabled = false;
          refresh();
        }, 3000);
      } else {
        throw new Error('Formspree returned an error');
      }
    } catch (err) {
      sendBtn.textContent = originalLabel;
      sendBtn.disabled = false;
      copiedMsg.style.color = '#F87171';
      copiedMsg.textContent = 'Something went wrong — try the Copy button and email it directly.';
    }
  });

  refresh();
})();