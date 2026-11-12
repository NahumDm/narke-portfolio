/* Enhance readable project sections into an accessible accordion. */
(function () {
  document.querySelectorAll('.case-head').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    const content = panel.querySelector('.case-body-inner');
    function resize() {
      if (button.getAttribute('aria-expanded') === 'true') {
        panel.style.maxHeight = Math.ceil(content.getBoundingClientRect().height) + 'px';
      }
    }
    function setExpanded(expanded) {
      button.setAttribute('aria-expanded', String(expanded));
      panel.inert = !expanded;
      panel.setAttribute('aria-hidden', String(!expanded));
      panel.style.maxHeight = expanded ? Math.ceil(content.getBoundingClientRect().height) + 'px' : '0px';
    }
    if (!content) return;
    panel.closest('.case').classList.add('is-enhanced');
    setExpanded(button.dataset.defaultExpanded === 'true');
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
    // Observe the content, not the animated panel, to avoid resize feedback loops.
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(content);
    else window.addEventListener('resize', resize);
    if (document.fonts) document.fonts.ready.then(resize);
  });
})();
