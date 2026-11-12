/* ==========================================================================
   Case study accordion
   Each .case-head toggles the max-height of its linked .case-body,
   keeping aria-expanded in sync for screen readers.
   ========================================================================== */
(function () {
  document.querySelectorAll('.case-head').forEach((btn) => {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    if (!body) return;

    const setState = (expanded) => {
      btn.setAttribute('aria-expanded', String(expanded));
      body.inert = !expanded;
      body.setAttribute('aria-hidden', String(!expanded));
      body.style.maxHeight = expanded ? body.scrollHeight + 'px' : '0px';
    };

    // Initialize from the markup's starting aria-expanded value
    setState(btn.getAttribute('aria-expanded') === 'true');

    btn.addEventListener('click', () => {
      setState(btn.getAttribute('aria-expanded') !== 'true');
    });

    // Keep expanded panels correctly sized on viewport resize
    window.addEventListener('resize', () => {
      if (btn.getAttribute('aria-expanded') === 'true') {
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();
