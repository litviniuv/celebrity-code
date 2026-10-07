(function () {
  var body = document.body;
  var photo = document.querySelector(".hero-v3__photo");
  var fine = window.matchMedia("(pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (fine && !reduce) {
    window.addEventListener(
      "pointermove",
      function (event) {
        var x = (event.clientX / window.innerWidth) * 100;
        var y = (event.clientY / window.innerHeight) * 100;
        body.style.setProperty("--spot-x", x + "%");
        body.style.setProperty("--spot-y", y + "%");
        if (photo) {
          var dx = (event.clientX / window.innerWidth - 0.5) * 6;
          var dy = (event.clientY / window.innerHeight - 0.5) * 4;
          var hard = event.buttons === 1 ? 2 : 1;
          photo.style.transform = "rotate(" + (-4 + dx * hard) + "deg) translateY(" + dy + "px)";
        }
      },
      { passive: true }
    );
  }
})();
