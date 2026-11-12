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

  // Request state is independent of field validity; edits cannot unlock a pending send.
  let isSubmitting = false;

  function isValidEmail() {
    return clientEmail.value.trim() !== '' && clientEmail.validity.valid;
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
    clientFields.hidden = isHire;
    clientFields.disabled = isHire;
    recruiterFields.hidden = !isHire;
    recruiterFields.disabled = !isHire;
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

    // Native email validation and request state both control availability.
    const emailOk = isValidEmail();
    sendBtn.disabled = isSubmitting || !emailOk;
  }

  [intent, stage, budget, roleType, workMode, timeline].forEach((el) => el.addEventListener('change', refresh));
  details.addEventListener('input', refresh);
  if (clientName) clientName.addEventListener('input', refresh);
  if (clientEmail) clientEmail.addEventListener('input', refresh);

  copyBtn.addEventListener('click', async () => {
    copiedMsg.dataset.state = '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(summaryBox.textContent);
      copiedMsg.textContent = 'Copied to clipboard.';
    } catch {
      // A selectable summary also works when browser clipboard permission is denied.
      summaryBox.focus();
      const range = document.createRange();
      range.selectNodeContents(summaryBox);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copiedMsg.textContent = 'Select and copy the summary, then email it using the link below.';
    }
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

  // Use one submit path for both the button and keyboard submission.
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || !form.reportValidity()) return;
    refresh();
    const payload = new FormData(form);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    isSubmitting = true;
    form.setAttribute('aria-busy', 'true');
    sendBtn.textContent = 'Sending...';
    copiedMsg.dataset.state = '';
    copiedMsg.textContent = 'Sending your scope...';
    refresh();

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Submission failed');
      // Keep the draft: a response must never erase edits made during the request.
      copiedMsg.dataset.state = 'success';
      copiedMsg.textContent = 'Scope sent. Your draft is kept here for reference.';
    } catch (error) {
      copiedMsg.dataset.state = 'error';
      copiedMsg.textContent = error.name === 'AbortError'
        ? 'No confirmation received. Email your scope directly or check before retrying.'
        : 'Could not confirm delivery. Copy your scope and email it directly.';
    } finally {
      clearTimeout(timeout);
      isSubmitting = false;
      form.setAttribute('aria-busy', 'false');
      sendBtn.textContent = 'Send this scope';
      refresh();
    }
  });

  refresh();
})();
