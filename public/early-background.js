// Classic script on purpose: it must run before first paint, and MV3 CSP forbids inline scripts.
try {
  var background = localStorage.getItem('new-day:bg');
  if (background) document.documentElement.style.background = background;
} catch (e) {}
