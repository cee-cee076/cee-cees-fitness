/* Gallery: data-driven masonry grid, category filters and a keyboard/swipe lightbox.
   Images are free-to-use Unsplash photos served from images.unsplash.com. */
(function () {
  "use strict";

  var CATS = {
    weights: "Weight training",
    cardio: "Cardio",
    classes: "Group classes",
    yoga: "Yoga",
    recovery: "Recovery",
    equipment: "Equipment",
    people: "People"
  };

  // [unsplash id, category, caption, shape]  shape: t = tall, s = square, w = wide
  var PHOTOS = [
    ["1517836357463-d25dfeac3438", "weights", "Heavy barbell work", "t"],
    ["1534438327276-14e5300c3a48", "equipment", "The dumbbell wall", "w"],
    ["1518611012118-696072aa579a", "classes", "Group burn", "s"],
    ["1544367567-0f2fcb009e0b", "yoga", "Sunset flow", "t"],
    ["1599058917212-d750089bc07e", "cardio", "Battle ropes", "w"],
    ["1544161515-4ab6ce6db874", "recovery", "Sports massage", "s"],
    ["1594737625785-a6cbdabd333c", "people", "Push-up grind", "w"],
    ["1574680096145-d05b474e2155", "weights", "Back squat", "t"],
    ["1540497077202-7c8a3999166f", "equipment", "Training floor", "s"],
    ["1538805060514-97d9cc17730c", "cardio", "Stride work", "t"],
    ["1518310383802-640c2de311b2", "classes", "Class in session", "w"],
    ["1506126613408-eca07ce68773", "yoga", "Breathe", "s"],
    ["1583454110551-21f2fa2afe61", "weights", "Dumbbell curls", "s"],
    ["1599901860904-17e6ed7083a0", "recovery", "Cool-down stretch", "w"],
    ["1546483875-ad9014c88eba", "people", "Single-arm row", "t"],
    ["1576678927484-cc907957088c", "equipment", "Fresh iron", "w"],
    ["1541534741688-6078c6bfb5c5", "weights", "Rack session", "t"],
    ["1534258936925-c58bed479fcb", "cardio", "Turf sprints", "s"],
    ["1518459031867-a89b944bffe4", "classes", "Partner core", "t"],
    ["1575052814086-f385e2e2ad1b", "yoga", "Deep stretch", "w"],
    ["1599058945522-28d584b6f0ff", "recovery", "Rest & reset", "t"],
    ["1603287681836-b174ce5074c2", "people", "Built here", "s"],
    ["1549060279-7e168fcee0c2", "equipment", "Plates & laces", "t"],
    ["1517963879433-6ad2b056d712", "weights", "Grip & rip", "w"],
    ["1552674605-db6ffd4facb5", "cardio", "Run club", "w"],
    ["1588286840104-8957b019727f", "classes", "Group yoga", "s"],
    ["1600881333168-2ef49b341f30", "yoga", "Downward dog", "s"],
    ["1515377905703-c4788e51af15", "recovery", "Tape up", "w"],
    ["1594381898411-846e7d193883", "people", "Core focus", "t"],
    ["1584735935682-2f2b69dff9d2", "equipment", "Bands & bells", "s"],
    ["1526506118085-60ce8714f8c5", "weights", "Deadlift day", "t"],
    ["1599058917765-a780eda07a3e", "cardio", "Rope intervals", "t"],
    ["1517130038641-a774d04afb3c", "classes", "Full-house class", "w"],
    ["1599447421416-3414500d18a5", "yoga", "Lunge flow", "t"],
    ["1550345332-09e3ac987658", "recovery", "Between sets", "s"],
    ["1532384748853-8f54a8f476e2", "people", "Fly finish", "w"],
    ["1549719386-74dfcbf7dbed", "equipment", "Gloves on", "w"],
    ["1517838277536-f5f99be501cd", "weights", "Clean pull", "s"],
    ["1594882645126-14020914d58d", "cardio", "Sunset miles", "w"],
    ["1607962837359-5e7e89f86776", "classes", "Outdoor bootcamp", "s"],
    ["1593164842264-854604db2260", "yoga", "Balance", "t"],
    ["1598971639058-fab3c3109a00", "people", "Floor work", "s"],
    ["1544033527-b192daee1f5b", "equipment", "Rack row", "t"],
    ["1556817411-31ae72fa3ea0", "weights", "Pulling heavy", "w"],
    ["1599552683573-9dc48255fe85", "cardio", "High knees", "s"],
    ["1510894347713-fc3ed6fdf539", "yoga", "Stillness", "w"],
    ["1591258370814-01609b341790", "people", "Renegade plank", "t"],
    ["1521805103424-d8f8430e8933", "equipment", "Olympic plate", "s"],
    ["1584466977773-e625c37cdd50", "weights", "Bench press", "s"],
    ["1535743686920-55e4145369b9", "cardio", "Waves", "t"],
    ["1611672585731-fa10603fb9e0", "people", "Locked in", "w"],
    ["1597452485669-2c7bb5fef90d", "weights", "Cable row", "w"],
    ["1590239926044-4131f5d0654d", "equipment", "Hex dumbbells", "w"],
    ["1574680178050-55c6a6a96e0a", "weights", "Lat pulldown", "t"],
    ["1593079831268-3381b0db4a77", "equipment", "After hours", "s"]
  ];

  var SHAPE = { t: [600, 800], s: [600, 600], w: [600, 420] };
  function src(id, w, h) {
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&q=70&w=" + w + (h ? "&h=" + h : "");
  }

  var grid = document.getElementById("galleryGrid");
  var filters = document.getElementById("galleryFilters");
  var countEl = document.getElementById("galleryCount");
  if (!grid) return;

  /* ---------- build filter chips ---------- */
  var counts = { all: PHOTOS.length };
  PHOTOS.forEach(function (p) { counts[p[1]] = (counts[p[1]] || 0) + 1; });
  var chipHtml = '<button type="button" class="chip" aria-pressed="true" data-filter="all">All <span class="count">' + counts.all + "</span></button>";
  Object.keys(CATS).forEach(function (k) {
    chipHtml += '<button type="button" class="chip" aria-pressed="false" data-filter="' + k + '">' + CATS[k] + ' <span class="count">' + (counts[k] || 0) + "</span></button>";
  });
  filters.innerHTML = chipHtml;

  /* ---------- build grid ---------- */
  var frag = document.createDocumentFragment();
  PHOTOS.forEach(function (p, i) {
    var dims = SHAPE[p[3]];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "g-item";
    btn.setAttribute("data-cat", p[1]);
    btn.setAttribute("data-index", i);
    btn.setAttribute("aria-label", "Open photo: " + p[2]);
    btn.innerHTML =
      '<img loading="lazy" decoding="async" width="' + dims[0] + '" height="' + dims[1] + '"' +
      ' src="' + src(p[0], dims[0], dims[1]) + '"' +
      ' srcset="' + src(p[0], 400, Math.round(dims[1] * 400 / 600)) + " 400w, " + src(p[0], dims[0], dims[1]) + " 600w, " + src(p[0], 900, Math.round(dims[1] * 1.5)) + ' 900w"' +
      ' sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw"' +
      ' alt="' + p[2] + " — " + CATS[p[1]] + '">' +
      '<span class="g-overlay"><span class="g-cat">' + CATS[p[1]] + '</span><span class="g-cap">' + p[2] + "</span></span>" +
      '<span class="g-zoom" aria-hidden="true"><i class="fas fa-expand"></i></span>';
    var img = btn.querySelector("img");
    var done = function () { img.classList.add("loaded"); btn.classList.add("is-loaded"); };
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener("load", done); img.addEventListener("error", done); }
    frag.appendChild(btn);
  });
  grid.appendChild(frag);
  var items = Array.prototype.slice.call(grid.querySelectorAll(".g-item"));

  // entrance animation as items scroll into view
  if (window.CC && CC.motion && window.ScrollTrigger) {
    ScrollTrigger.batch(items, {
      start: "top 92%",
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch, { y: 60, opacity: 0, rotateX: -12, transformPerspective: 800 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, clearProps: "transform" });
      }
    });
    gsap.set(items, { opacity: 0 });
  }

  /* ---------- filtering ---------- */
  var current = "all";
  function visibleItems() { return items.filter(function (it) { return !it.classList.contains("is-hidden"); }); }
  function updateCount() {
    var n = visibleItems().length;
    countEl.innerHTML = "Showing <b>" + n + "</b> photo" + (n === 1 ? "" : "s") + (current === "all" ? "" : " in <b>" + CATS[current] + "</b>");
  }

  function applyFilter(cat) {
    if (cat === current) return;
    current = cat;
    Array.prototype.forEach.call(filters.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-filter") === cat ? "true" : "false");
    });
    var show = function () {
      items.forEach(function (it) { it.classList.toggle("is-hidden", cat !== "all" && it.getAttribute("data-cat") !== cat); });
      updateCount();
      var vis = visibleItems();
      if (window.CC && CC.motion) {
        gsap.fromTo(vis, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out", stagger: 0.03, clearProps: "transform" });
      } else {
        vis.forEach(function (v) { v.style.opacity = 1; });
      }
      if (window.CC) CC.refresh();
    };
    if (window.CC && CC.motion) {
      gsap.to(visibleItems(), { opacity: 0, y: -10, duration: 0.25, ease: "power2.in", stagger: 0.008, onComplete: show });
    } else show();
  }

  filters.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (chip) applyFilter(chip.getAttribute("data-filter"));
  });
  updateCount();

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector(".lb-img");
  var lbCat = lb.querySelector(".lb-cat");
  var lbCap = lb.querySelector(".lb-cap");
  var lbCount = lb.querySelector(".lb-counter");
  var list = [];
  var pos = 0;
  var lastFocus = null;

  function show(i) {
    pos = (i + list.length) % list.length;
    var p = PHOTOS[+list[pos].getAttribute("data-index")];
    var full = src(p[0], Math.min(1800, Math.round(window.innerWidth * (window.devicePixelRatio || 1))));
    lb.classList.add("loading");
    lbImg.classList.add("is-swapping");
    var pre = new Image();
    pre.onload = pre.onerror = function () {
      lbImg.src = full;
      lbImg.alt = p[2] + " — " + CATS[p[1]];
      lb.classList.remove("loading");
      requestAnimationFrame(function () { lbImg.classList.remove("is-swapping"); });
    };
    pre.src = full;
    lbCat.textContent = CATS[p[1]];
    lbCap.textContent = p[2];
    lbCount.innerHTML = "<b>" + String(pos + 1).padStart(2, "0") + "</b> / " + String(list.length).padStart(2, "0");
    // warm the cache for neighbours
    [pos + 1, pos - 1].forEach(function (n) {
      var q = PHOTOS[+list[(n + list.length) % list.length].getAttribute("data-index")];
      new Image().src = src(q[0], Math.min(1800, Math.round(window.innerWidth * (window.devicePixelRatio || 1))));
    });
  }

  function open(item) {
    list = visibleItems();
    lastFocus = item;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    show(list.indexOf(item));
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener("click", function (e) {
    var it = e.target.closest(".g-item");
    if (it) open(it);
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { show(pos - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { show(pos + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(pos + 1);
    else if (e.key === "ArrowLeft") show(pos - 1);
    else if (e.key === "Tab") { // keep focus inside the dialog
      var f = Array.prototype.slice.call(lb.querySelectorAll("button"));
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // swipe on touch devices
  var sx = 0, sy = 0;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(pos + (dx < 0 ? 1 : -1));
    else if (dy > 90) close();
  }, { passive: true });
})();
