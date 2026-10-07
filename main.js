(function () {
  // Load shared menu/map logic from parent by inlining a relative script tag in HTML;
  // this file only adds gallery circle reveals.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".gallery__grid figure").forEach(function (fig) {
      fig.classList.add("is-in");
    });
    return;
  }
  var figs = document.querySelectorAll(".gallery__grid figure");
  if (!("IntersectionObserver" in window)) {
    figs.forEach(function (f) { f.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  figs.forEach(function (f) { io.observe(f); });
})();
