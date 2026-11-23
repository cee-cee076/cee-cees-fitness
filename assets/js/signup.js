/* Sign-up form: live validation, progress meter, plan summary, URL prefill and a
   front-end-only success state (no data is sent anywhere). */
(function () {
  "use strict";

  var PLANS = {
    starter: { name: "Starter", price: 29, items: ["Gym floor access (off-peak)", "2 group classes / week", "Locker room included"] },
    unlimited: { name: "Unlimited", price: 59, items: ["24/7 access · all equipment", "Unlimited classes", "Sauna & recovery", "1 PT session / month"] },
    duo: { name: "Duo / Couple", price: 89, items: ["Two memberships", "All group classes", "24/7 for both", "2 PT / month combined"] }
  };
  var CLASS_NAMES = {
    hiit: ["HIIT Blaze", "hiit"], metcon: ["Metcon", "hiit"], bootcamp: ["Saturday Bootcamp", "hiit"],
    pump: ["Pump & Iron", "strength"], strength101: ["Strength 101", "strength"], core: ["Core & More", "strength"],
    cardio: ["Cardio Dance", "cardio"], boxfit: ["Box Fit", "cardio"],
    yoga: ["Yoga Flow", "mind"], mobility: ["Mobility & Recovery", "mind"], stretch: ["Sunday Stretch", "mind"]
  };
  var DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
  var TIME_LABELS = { morning: "Morning", midday: "Midday", evening: "Evening", late: "Late", weekend: "Weekends" };

  var form = document.getElementById("signupForm");
  if (!form) return;
  var touched = {};

  function $(id) { return document.getElementById(id); }
  function fieldEl(name) { return form.querySelector('[data-field="' + name + '"]'); }
  function checked(name) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return i.value; });
  }

  var rules = {
    fullName: function () { var v = $("fullName").value.trim(); return v.length >= 2 && /[a-zA-Z]/.test(v); },
    email: function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("email").value.trim()); },
    phone: function () { var d = $("phone").value.replace(/\D/g, ""); return d.length >= 10 && d.length <= 15; },
    plan: function () { return checked("plan").length === 1; },
    times: function () { return checked("times").length > 0; },
    consent: function () { return $("consent").checked; }
  };
  var ORDER = ["fullName", "email", "phone", "plan", "times", "consent"];

  function validate(name, show) {
    var ok = rules[name]();
    var f = fieldEl(name);
    var input = f.querySelector("input, textarea");
    if (show) {
      f.classList.toggle("is-invalid", !ok);
      f.classList.toggle("is-valid", ok && ["fullName", "email", "phone"].indexOf(name) > -1);
      if (input) input.setAttribute("aria-invalid", ok ? "false" : "true");
    }
    return ok;
  }

  function updateProgress() {
    var done = ORDER.filter(function (n) { return rules[n](); }).length;
    var pct = Math.round(done / ORDER.length * 100);
    $("progressBar").style.width = pct + "%";
    $("progressText").textContent = pct + "% complete";
    var steps = {
      1: rules.fullName() && rules.email() && rules.phone(),
      2: rules.plan(),
      3: rules.times(),
      4: rules.consent()
    };
    Object.keys(steps).forEach(function (k) {
      form.querySelector('[data-step="' + k + '"]').classList.toggle("is-complete", steps[k]);
    });
  }

  /* phone: light US-style formatting while typing */
  $("phone").addEventListener("input", function (e) {
    if (e.inputType && e.inputType.indexOf("delete") === 0) return;
    var d = this.value.replace(/\D/g, "");
    if (d.length === 10 && this.value.charAt(0) !== "+") {
      this.value = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    }
  });

  /* live validation once a field has been touched */
  ["fullName", "email", "phone"].forEach(function (n) {
    var el = $(n);
    el.addEventListener("blur", function () { if (el.value.trim()) { touched[n] = true; validate(n, true); } });
    el.addEventListener("input", function () { if (touched[n]) validate(n, true); updateProgress(); });
  });

  /* summary card */
  var lastPlan = null;
  function renderSummary() {
    var p = checked("plan")[0];
    if (!p || p === lastPlan) return;
    lastPlan = p;
    var plan = PLANS[p];
    var body = $("summaryBody");
    $("sumName").textContent = plan.name;
    $("sumPrice").innerHTML = "$" + plan.price + "<small>/month</small>";
    $("sumList").innerHTML = plan.items.map(function (t) { return '<li><i class="fas fa-check"></i>' + t + "</li>"; }).join("");
    body.classList.remove("swap-anim"); void body.offsetWidth; body.classList.add("swap-anim");
    var wrap = $("partnerWrap");
    wrap.classList.toggle("show", p === "duo");
    $("partnerName").tabIndex = p === "duo" ? 0 : -1;
  }

  form.addEventListener("change", function (e) {
    var n = e.target.name;
    if (n === "plan") { touched.plan = true; validate("plan", true); renderSummary(); }
    if (n === "times") { touched.times = true; validate("times", true); }
    if (n === "consent") { touched.consent = true; validate("consent", true); }
    updateProgress();
  });

  /* notes counter */
  var notes = $("notes");
  notes.addEventListener("input", function () { $("notes-count").textContent = notes.value.length + " / 500"; });

  /* ---------- prefill from URL (plans page / timetable "Book") ---------- */
  var qs = new URLSearchParams(window.location.search);
  var planQ = qs.get("plan");
  if (PLANS[planQ]) { $("plan-" + planQ).checked = true; renderSummary(); }

  var cls = CLASS_NAMES[qs.get("class")];
  var day = DAY_NAMES[qs.get("day")];
  var time = qs.get("time");
  if (cls && day && /^\d{2}:\d{2}$/.test(time)) {
    var hm = time.split(":");
    var m = +hm[0] * 60 + +hm[1];
    var h12 = (+hm[0] % 12 || 12) + ":" + hm[1] + (+hm[0] >= 12 ? " PM" : " AM");
    var slot = m < 660 ? "morning" : m < 960 ? "midday" : m < 1140 ? "evening" : "late";
    $("t-" + slot).checked = true;
    if (qs.get("day") === "sat" || qs.get("day") === "sun") $("t-weekend").checked = true;
    var interest = $("i-" + cls[1]);
    if (interest) interest.checked = true;
    notes.value = "I'd like to book " + cls[0] + " on " + day + " at " + h12 + ".";
    notes.dispatchEvent(new Event("input"));
    var note = $("bookingNote");
    note.hidden = false;
    note.querySelector("span").innerHTML = "Booking request: <b>" + cls[0] + "</b> &middot; " + day + " " + h12 + ". Finish signing up and we'll hold your spot.";
  }
  updateProgress();

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    ORDER.forEach(function (n) {
      touched[n] = true;
      if (!validate(n, true) && !firstBad) firstBad = n;
    });
    updateProgress();

    if (firstBad) {
      var f = fieldEl(firstBad);
      f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
      var target = f.querySelector("input:not([type=hidden])");
      f.scrollIntoView({ behavior: window.CC && CC.reduce ? "auto" : "smooth", block: "center" });
      if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 350);
      return;
    }

    var btn = $("submitBtn");
    btn.classList.add("is-loading");
    btn.disabled = true;

    // Simulated request — swap this for a real endpoint when a backend exists.
    setTimeout(function () {
      var name = $("fullName").value.trim().split(/\s+/)[0];
      var plan = PLANS[checked("plan")[0]];
      var times = checked("times").map(function (t) { return TIME_LABELS[t]; }).join(", ");
      $("successName").textContent = name;
      $("successRecap").innerHTML =
        "<div><i class='fas fa-id-card text-red me-2'></i>Plan: <b>" + plan.name + "</b> &middot; $" + plan.price + "/mo</div>" +
        "<div><i class='fas fa-clock text-red me-2'></i>Times: <b>" + times + "</b></div>" +
        "<div><i class='fas fa-envelope text-red me-2'></i>Confirmation to: <b></b></div>";
      $("successRecap").lastElementChild.querySelector("b").textContent = $("email").value.trim();

      var panel = $("successPanel");
      var shell = form.parentElement;
      var swap = function () {
        form.style.display = "none";
        panel.classList.add("show");
        shell.scrollIntoView({ behavior: "smooth", block: "start" });
        panel.focus({ preventScroll: true });
        if (window.CC && CC.motion) {
          gsap.from(panel.children, { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" });
          confetti();
        }
      };
      if (window.CC && CC.motion) gsap.to(form, { opacity: 0, y: -20, duration: 0.35, ease: "power2.in", onComplete: swap });
      else swap();
    }, 1200);
  });

  function confetti() {
    var colors = ["#c41e3a", "#ffb800", "#ffffff", "#e0324f"];
    for (var i = 0; i < 70; i++) {
      var c = document.createElement("span");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      document.body.appendChild(c);
      gsap.to(c, {
        y: window.innerHeight + 60,
        x: (Math.random() - 0.5) * 240,
        rotation: Math.random() * 720,
        duration: 2 + Math.random() * 1.5,
        delay: Math.random() * 0.4,
        ease: "power1.in",
        onComplete: (function (el) { return function () { el.remove(); }; })(c)
      });
    }
  }
})();
