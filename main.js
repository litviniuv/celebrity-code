(function () {
  /* Opt into gallery circle reveal only after JS runs (progressive enhancement). */
  document.documentElement.classList.add("js-reveal");

  var figs = document.querySelectorAll(".gallery__grid figure");
  if (!figs.length) return;

  function reveal(el) {
    el.classList.add("is-in");
  }

  function nearViewport(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh + 80 && r.bottom > -80;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    figs.forEach(reveal);
    return;
  }

  if (!("IntersectionObserver" in window)) {
    figs.forEach(reveal);
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "80px 0px 80px 0px" }
  );

  figs.forEach(function (f) {
    io.observe(f);
    if (nearViewport(f)) reveal(f);
  });

  function safetyNet() {
    figs.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      if (nearViewport(el)) reveal(el);
    });
  }

  if (document.readyState === "complete") {
    requestAnimationFrame(safetyNet);
  } else {
    window.addEventListener("load", function () {
      requestAnimationFrame(safetyNet);
    });
  }
  window.addEventListener("scroll", safetyNet, { passive: true });
  window.addEventListener("resize", safetyNet);
})();
