/* ==========================================================================
   Scope funnel
   1) Role-aware CTAs — clicking a "client" or "recruiter" tagged link
      preselects the right path in the contact form.
   2) Live scope summary — builds a plain-text summary from the form and
      wires it into a pre-filled mailto: link plus a copy-to-clipboard button.
   ========================================================================== */
(function () {
  const intent = document.getElementById('intent');
  if (!intent) return; // funnel not present on this page

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

    const subject = encodeURIComponent(
      intent.value === 'hire' ? 'Full-time role inquiry — via narke.tech' : 'Project scope — via narke.tech'
    );
    const body = encodeURIComponent(summary);
    sendBtn.href = `mailto:hello@narke.tech?subject=${subject}&body=${body}`;
  }

  [intent, stage, budget, roleType, workMode, timeline].forEach((el) => el.addEventListener('change', refresh));
  details.addEventListener('input', refresh);

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

  refresh();
})();
