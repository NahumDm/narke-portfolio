/* Keep mobile menu visibility, labels, and focus in sync. */
(function () {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  const mobile = window.matchMedia('(max-width: 720px)');
  let isOpen = false;
  function setOpen(open, restoreFocus = false) {
    isOpen = open && mobile.matches;
    menu.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    if (restoreFocus) toggle.focus();
  }
  setOpen(false);
  toggle.closest('header').classList.add('nav-ready');
  toggle.addEventListener('click', () => setOpen(!isOpen));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen) setOpen(false, true);
  });
  mobile.addEventListener('change', () => setOpen(false));
})();
