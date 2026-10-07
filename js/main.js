(function () {
  var root = document.documentElement;
  var body = document.body;
  var demoStrip = document.querySelector(".demo-strip");
  var header = document.querySelector(".site-header");
  var menuBtn = document.getElementById("menu-toggle");
  var navPanel = document.getElementById("nav-panel");
  var lockedY = 0;
  var lastTouchY = null;
  var desktopMq = window.matchMedia("(min-width: 900px)");

  function setDemoH() {
    var h = demoStrip ? Math.round(demoStrip.getBoundingClientRect().height) : 0;
    root.style.setProperty("--demo-h", h + "px");
  }
  setDemoH();
  if (demoStrip && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(setDemoH).observe(demoStrip);
  }
  window.addEventListener("resize", setDemoH);

  function docTopOf(el) {
    var y = 0;
    var node = el;
    while (node) {
      y += node.offsetTop || 0;
      node = node.offsetParent;
    }
    var sticky = (demoStrip ? demoStrip.offsetHeight : 0) + (header ? header.offsetHeight : 0);
    return Math.max(0, y - sticky);
  }

  function isOpen() {
    return root.classList.contains("nav-open");
  }

  function placePanel() {
    if (!navPanel || !header) return;
    var bottom = header.getBoundingClientRect().bottom;
    navPanel.style.top = Math.max(0, Math.round(bottom)) + "px";
  }

  function lockScroll(y) {
    lockedY = y;
    body.classList.add("is-locked");
    body.style.top = "-" + y + "px";
    root.classList.add("nav-open");
  }

  function unlockScroll() {
    body.classList.remove("is-locked");
    body.style.top = "";
    root.classList.remove("nav-open");
  }

  function instantScrollTo(y) {
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    try {
      window.scrollTo({ top: y, left: 0, behavior: "instant" });
    } catch (e1) {
      try {
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      } catch (e2) {
        window.scrollTo(0, y);
      }
    }
    root.style.scrollBehavior = prev;
  }

  function openMenu() {
    if (isOpen() || !menuBtn || !navPanel) return;
    lockScroll(window.scrollY || window.pageYOffset || 0);
    menuBtn.setAttribute("aria-expanded", "true");
    placePanel();
  }

  function closeMenu(opts) {
    opts = opts || {};
    if (!isOpen() && !body.classList.contains("is-locked")) return;
    var destY = typeof opts.destY === "number" ? opts.destY : lockedY;
    var hash = opts.hash || null;
    if (navPanel) navPanel.style.top = "";
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    // Same sync turn: keep lock top at dest, then unlock + instant jump
    body.style.top = "-" + destY + "px";
    unlockScroll();
    instantScrollTo(destY);
    if (hash) {
      try {
        history.replaceState(null, "", hash);
      } catch (err) {}
    }
    if (opts.focusToggle && menuBtn) menuBtn.focus();
  }

  if (menuBtn && navPanel) {
    menuBtn.addEventListener("click", function () {
      if (isOpen()) closeMenu({ focusToggle: false });
      else openMenu();
    });

    navPanel.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      if (!link || !navPanel.contains(link)) return;
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "#" && href.length > 1) {
        event.preventDefault();
        var id = href.slice(1);
        var target = document.getElementById(id);
        var destY = target ? docTopOf(target) : 0;
        // Measure under lock, retarget body top, unlock + instant jump
        body.style.top = "-" + destY + "px";
        closeMenu({ destY: destY, hash: href });
        return;
      }
      closeMenu({ focusToggle: false });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) closeMenu({ focusToggle: true });
    });

    document.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches && event.touches[0]) lastTouchY = event.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      function (event) {
        if (!isOpen()) return;
        var touch = event.touches && event.touches[0];
        var dy = touch && lastTouchY != null ? lastTouchY - touch.clientY : 0;
        if (touch) lastTouchY = touch.clientY;
        if (navPanel.contains(event.target) && navPanel.scrollHeight > navPanel.clientHeight + 1) {
          var max = navPanel.scrollHeight - navPanel.clientHeight;
          if (dy > 0 && navPanel.scrollTop >= max - 1) event.preventDefault();
          else if (dy < 0 && navPanel.scrollTop <= 0) event.preventDefault();
          return;
        }
        event.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener(
      "wheel",
      function (event) {
        if (!isOpen()) return;
        if (navPanel.contains(event.target) && navPanel.scrollHeight > navPanel.clientHeight + 1) {
          var max = navPanel.scrollHeight - navPanel.clientHeight;
          if (event.deltaY > 0 && navPanel.scrollTop >= max - 1) event.preventDefault();
          else if (event.deltaY < 0 && navPanel.scrollTop <= 0) event.preventDefault();
          return;
        }
        event.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener("resize", function () {
      if (!isOpen()) return;
      if (desktopMq.matches) closeMenu({ focusToggle: false });
      else placePanel();
    });
  }

  // Soft-nav for in-page anchors when menu closed (respect sticky offset)
  document.addEventListener("click", function (event) {
    if (isOpen()) return;
    var link = event.target.closest ? event.target.closest("a") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (href.charAt(0) !== "#" || href.length < 2) return;
    if (link.closest && link.closest(".nav-panel")) return;
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    var destY = docTopOf(target);
    instantScrollTo(destY);
    try {
      history.replaceState(null, "", href);
    } catch (err) {}
  });

  // Click-to-load map
  var mapBtn = document.getElementById("show-map");
  var mapWrap = document.getElementById("map-wrap");
  if (mapBtn && mapWrap) {
    mapBtn.addEventListener("click", function () {
      if (mapWrap.classList.contains("is-loaded")) return;
      var src = mapWrap.getAttribute("data-map-src");
      if (!src) return;
      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = "Карта: Celebrity Code, ул. Горького, 36";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      mapWrap.appendChild(iframe);
      mapWrap.classList.add("is-loaded");
      var ph = mapWrap.querySelector(".map-placeholder");
      if (ph) ph.hidden = true;
    });
  }
})();
