/* AquaClear page behaviour: avoidance simulator, manual keys, photo viewer, two small text reveals. */
(function () {
  var $ = function (i) { return document.getElementById(i); };

  /* ---- Avoidance simulator (logic simplified from the firmware excerpt) ---- */
  function sim() {
    var L = +$("sL").value, F = +$("sF").value, R = +$("sR").value, k = .66;
    $("vL").textContent = L; $("vF").textContent = F; $("vR").textContent = R;
    function ray(g, l, c, x2, y2, hit) {
      $(l).setAttribute("x2", x2); $(l).setAttribute("y2", y2);
      $(c).setAttribute("cx", x2); $(c).setAttribute("cy", y2);
      $(g).setAttribute("class", hit ? "sim-hit" : "");
    }
    ray("gF", "lF", "cF", 200, 200 - F * k, F < 50);
    ray("gL", "lL", "cL", 168 - L * k, 240, L <= 15);
    ray("gR", "lR", "cR", 232 + R * k, 240, R <= 15);
    $("oT").textContent = F < 50 ? "Slows down, something is within 50 cm ahead" : "Full forward thrust, the way ahead is clear";
    $("oS").textContent = (L > 15 && R > 15) ? "Straight ahead, both sides have room" : (L > R ? "Turns toward the left, the wider side" : "Turns toward the right, the wider side");
  }
  ["sL", "sF", "sR"].forEach(function (i) { $(i).addEventListener("input", sim); });
  sim();

  /* ---- Manual command keys ---- */
  var KN = { F: "Forward", B: "Backward", S: "Stop", L: "Left", R: "Right" }, kt;
  function key(c) {
    document.querySelectorAll("#keys button").forEach(function (b) { b.classList.toggle("on", b.dataset.c === c); });
    $("kn").textContent = "Command " + c + ": " + KN[c];
    clearTimeout(kt);
    kt = setTimeout(function () { document.querySelectorAll("#keys button").forEach(function (b) { b.classList.remove("on"); }); }, 800);
  }
  document.querySelectorAll("#keys button").forEach(function (b) { b.addEventListener("click", function () { key(b.dataset.c); }); });
  addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    var c = e.key.length === 1 ? e.key.toUpperCase() : "", r = $("modes").getBoundingClientRect();
    if (KN[c] && r.top < innerHeight && r.bottom > 0) key(c);
  });

  /* ---- Photo viewer: click any photo to enlarge ---- */
  var lb = $("lb");
  document.querySelectorAll("img[data-zoom]").forEach(function (im) {
    im.tabIndex = 0; im.setAttribute("role", "button");
    function open() { $("lbi").src = im.src; $("lbi").alt = im.alt; if (lb.showModal) lb.showModal(); else lb.setAttribute("open", ""); }
    im.addEventListener("click", open);
    im.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  $("lbx").addEventListener("click", function () { lb.close(); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });

  /* ---- Two text reveals only: the hero headline (on load) and the closing wordmark (when reached) ---- */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  function split(el, chars) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          (chars ? c.textContent.split("") : c.textContent.split(/(\s+)/)).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"), i = document.createElement("span");
            w.className = "tw"; i.className = "ti"; i.style.setProperty("--i", n++); i.textContent = p;
            w.appendChild(i); f.appendChild(w);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
  }
  var h1 = document.querySelector("h1"), word = document.querySelector(".close__word");
  document.documentElement.classList.add("tx-ready");
  if (h1) {
    h1.setAttribute("aria-label", h1.textContent.trim().replace(/\s+/g, " "));
    split(h1, false);
    setTimeout(function () { h1.classList.add("tx-go"); }, 300);
  }
  if (word) {
    split(word, true);
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { word.classList.add("tx-go"); io.disconnect(); }
    }, { threshold: .3 });
    io.observe(word);
    setTimeout(function () { var r = word.getBoundingClientRect(); if (r.top < innerHeight * .9) word.classList.add("tx-go"); }, 2500);
  }
})();
