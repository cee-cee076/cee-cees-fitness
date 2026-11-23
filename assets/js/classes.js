/* Classes timetable: day tabs, week grid, category + time-of-day filters, class guide. */
(function () {
  "use strict";

  var CATS = {
    strength: { label: "Strength", color: "var(--cat-strength)" },
    hiit: { label: "HIIT", color: "var(--cat-hiit)" },
    cardio: { label: "Cardio", color: "var(--cat-cardio)" },
    mind: { label: "Mind & Body", color: "var(--cat-mind)" },
    recovery: { label: "Recovery", color: "var(--cat-recovery)" }
  };

  var COACHES = {
    "Cee Cee": "1571019613454-1cb2f99b2d8b",
    "Alex": "1583454110551-21f2fa2afe61",
    "Jordan": "1581009137042-c552e485697a",
    "Maya": "1548690312-e3b507d8c110",
    "Rob": "1611672585731-fa10603fb9e0"
  };

  var CLASSES = {
    hiit: { name: "HIIT Blaze", cat: "hiit", icon: "fa-fire", coach: "Alex", dur: 45, level: 3, desc: "Short, sharp intervals that torch calories and build engine. Scalable for every level." },
    metcon: { name: "Metcon", cat: "hiit", icon: "fa-bolt", coach: "Rob", dur: 45, level: 3, desc: "Metabolic conditioning circuits mixing barbells, kettlebells and bodyweight." },
    bootcamp: { name: "Saturday Bootcamp", cat: "hiit", icon: "fa-person-running", coach: "Alex", dur: 60, level: 3, desc: "Our weekend team workout: sleds, sprints, partner drills and big energy." },
    pump: { name: "Pump & Iron", cat: "strength", icon: "fa-dumbbell", coach: "Cee Cee", dur: 60, level: 3, desc: "Classic strength training with barbells and dumbbells. Build muscle, nail technique." },
    strength101: { name: "Strength 101", cat: "strength", icon: "fa-weight-hanging", coach: "Cee Cee", dur: 60, level: 2, desc: "Learn the big lifts step by step — squat, hinge, press and pull — with coached form." },
    core: { name: "Core & More", cat: "strength", icon: "fa-child-reaching", coach: "Rob", dur: 30, level: 2, desc: "A focused 30 minutes of trunk strength, stability and posture work." },
    cardio: { name: "Cardio Dance", cat: "cardio", icon: "fa-heart-pulse", coach: "Jordan", dur: 50, level: 2, desc: "Zumba-inspired, step-heavy fun cardio. Big playlists, zero judgement." },
    boxfit: { name: "Box Fit", cat: "cardio", icon: "fa-hand-fist", coach: "Alex", dur: 45, level: 2, desc: "Pad work, footwork and conditioning rounds inspired by the boxing gym." },
    yoga: { name: "Yoga Flow", cat: "mind", icon: "fa-spa", coach: "Maya", dur: 60, level: 1, desc: "Vinyasa flow linking breath and movement to build strength, balance and calm." },
    mobility: { name: "Mobility & Recovery", cat: "recovery", icon: "fa-leaf", coach: "Maya", dur: 45, level: 1, desc: "Guided mobility, foam rolling and stretching to help you recover between sessions." },
    stretch: { name: "Sunday Stretch", cat: "recovery", icon: "fa-feather", coach: "Maya", dur: 45, level: 1, desc: "A slow, restorative reset to end the week — perfect for sore legs." }
  };

  var DAYS = [
    { key: "mon", short: "Mon", name: "Monday" },
    { key: "tue", short: "Tue", name: "Tuesday" },
    { key: "wed", short: "Wed", name: "Wednesday" },
    { key: "thu", short: "Thu", name: "Thursday" },
    { key: "fri", short: "Fri", name: "Friday" },
    { key: "sat", short: "Sat", name: "Saturday" },
    { key: "sun", short: "Sun", name: "Sunday" }
  ];

  var SCHEDULE = {
    mon: [["06:30", "core"], ["09:30", "hiit"], ["12:00", "strength101"], ["17:30", "hiit"], ["19:00", "mobility"]],
    tue: [["07:00", "boxfit"], ["10:00", "cardio"], ["12:30", "core"], ["18:15", "cardio"], ["19:30", "yoga"]],
    wed: [["07:00", "pump"], ["09:30", "mobility"], ["12:00", "pump"], ["17:30", "boxfit"], ["19:00", "yoga"]],
    thu: [["06:30", "metcon"], ["11:00", "yoga"], ["12:30", "strength101"], ["17:30", "hiit"], ["19:00", "yoga"]],
    fri: [["06:30", "metcon"], ["09:30", "cardio"], ["12:00", "core"], ["16:30", "metcon"], ["18:00", "mobility"]],
    sat: [["08:00", "bootcamp"], ["10:00", "pump"], ["11:30", "cardio"]],
    sun: [["09:00", "yoga"], ["10:30", "stretch"]]
  };

  var TOD = {
    all: { label: "Any time" },
    morning: { label: "Morning", icon: "fa-sun", test: function (m) { return m < 11 * 60; } },
    midday: { label: "Midday", icon: "fa-cloud-sun", test: function (m) { return m >= 11 * 60 && m < 16 * 60; } },
    evening: { label: "Evening", icon: "fa-moon", test: function (m) { return m >= 16 * 60; } }
  };

  /* ---------- helpers ---------- */
  function mins(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(m) {
    var h = Math.floor(m / 60) % 24, mm = m % 60;
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 || 12;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
  }
  function avatar(name) {
    return "https://images.unsplash.com/photo-" + COACHES[name] + "?w=80&h=80&fit=crop&crop=faces&auto=format";
  }
  function bars(level) {
    var s = '<span class="intensity" title="Intensity ' + level + '/3" aria-label="Intensity ' + level + ' of 3">';
    for (var i = 1; i <= 3; i++) s += '<i class="' + (i <= level ? "on" : "") + '"></i>';
    return s + "</span>";
  }

  var now = new Date();
  var todayIdx = (now.getDay() + 6) % 7;
  var nowMins = now.getHours() * 60 + now.getMinutes();

  var params = new URLSearchParams(window.location.search);
  var startDay = DAYS.findIndex(function (d) { return d.key === params.get("day"); });

  var state = {
    view: "day",
    day: startDay > -1 ? startDay : todayIdx,
    cat: "all",
    tod: "all"
  };

  function sessions(dayIdx) {
    return SCHEDULE[DAYS[dayIdx].key].map(function (s) {
      var c = CLASSES[s[1]];
      var start = mins(s[0]);
      return { id: s[1], c: c, start: start, end: start + c.dur, time: s[0] };
    }).filter(function (s) {
      return (state.cat === "all" || s.c.cat === state.cat) && (state.tod === "all" || TOD[state.tod].test(s.start));
    });
  }

  function bookHref(s, dayIdx) {
    return "signup.html?class=" + s.id + "&day=" + DAYS[dayIdx].key + "&time=" + s.time;
  }

  /* ---------- DOM ---------- */
  var $tabs = document.getElementById("dayTabs");
  var $list = document.getElementById("ttList");
  var $week = document.getElementById("weekGrid");
  var $dayView = document.getElementById("dayView");
  var $weekView = document.getElementById("weekView");
  var $catChips = document.getElementById("catChips");
  var $todChips = document.getElementById("todChips");
  var $heading = document.getElementById("dayHeading");
  var $guide = document.getElementById("classGuide");
  var $legend = document.getElementById("legend");

  /* filter chips */
  var catHtml = '<button type="button" class="chip" data-cat="all" aria-pressed="true">All classes</button>';
  Object.keys(CATS).forEach(function (k) {
    catHtml += '<button type="button" class="chip" data-cat="' + k + '" aria-pressed="false"><span class="dot" style="background:' + CATS[k].color + '"></span>' + CATS[k].label + "</button>";
  });
  $catChips.innerHTML = catHtml;

  var todHtml = "";
  Object.keys(TOD).forEach(function (k) {
    todHtml += '<button type="button" class="chip" data-tod="' + k + '" aria-pressed="' + (k === "all") + '">' + (TOD[k].icon ? '<i class="fas ' + TOD[k].icon + '"></i>' : "") + TOD[k].label + "</button>";
  });
  $todChips.innerHTML = todHtml;

  $legend.innerHTML = Object.keys(CATS).map(function (k) {
    return '<span><span class="dot" style="background:' + CATS[k].color + '"></span>' + CATS[k].label + "</span>";
  }).join("") + '<span><span class="intensity" style="--c:#fff"><i class="on"></i><i class="on"></i><i></i></span> Intensity</span>';

  function renderTabs() {
    $tabs.innerHTML = DAYS.map(function (d, i) {
      var n = sessions(i).length;
      return '<button type="button" class="day-tab" role="tab" id="tab-' + d.key + '" aria-controls="ttList" aria-selected="' + (i === state.day) + '" tabindex="' + (i === state.day ? 0 : -1) + '" data-day="' + i + '">' +
        (i === todayIdx ? '<span class="dt-today" title="Today"></span>' : "") +
        '<span class="dt-short">' + d.short + '</span><span class="dt-count">' + n + " class" + (n === 1 ? "" : "es") + "</span></button>";
    }).join("");
  }

  function renderList(animate) {
    var list = sessions(state.day);
    var isToday = state.day === todayIdx;
    var nextIdx = -1;
    if (isToday) list.some(function (s, i) { if (s.end > nowMins) { nextIdx = i; return true; } return false; });

    $heading.innerHTML = DAYS[state.day].name + (isToday ? ' <span class="live-badge">TODAY</span>' : "");
    $list.setAttribute("aria-labelledby", "tab-" + DAYS[state.day].key);

    if (!list.length) {
      $list.innerHTML = '<div class="tt-empty"><i class="fas fa-calendar-xmark d-block"></i><p class="mb-3">No classes match these filters on ' + DAYS[state.day].name + '.</p><button type="button" class="btn-ghost" id="resetFilters">Reset filters</button></div>';
      return;
    }

    $list.innerHTML = list.map(function (s, i) {
      var past = isToday && s.end <= nowMins;
      var live = isToday && s.start <= nowMins && s.end > nowMins;
      var badge = live ? '<span class="live-badge">LIVE NOW</span>' : (i === nextIdx ? '<span class="live-badge">NEXT UP</span>' : "");
      return '<article class="tt-row' + (past ? " is-past" : "") + '" style="--c:' + CATS[s.c.cat].color + '">' +
        '<div class="tt-time">' + fmt(s.start) + "<small>" + s.c.dur + " min · until " + fmt(s.end) + "</small></div>" +
        '<div class="tt-class"><span class="tt-icon"><i class="fas ' + s.c.icon + '"></i></span><div class="min-w-0">' +
          '<div class="tt-name">' + s.c.name + badge + "</div>" +
          '<div class="tt-tags"><span class="cat">' + CATS[s.c.cat].label + "</span>" + bars(s.c.level) + '<span><i class="fas fa-user-group me-1"></i>Max 12</span></div>' +
        "</div></div>" +
        '<div class="tt-coach"><img src="' + avatar(s.c.coach) + '" alt="" loading="lazy" width="38" height="38"><span>' + s.c.coach + "</span></div>" +
        '<div class="tt-action">' + (past
          ? '<span class="btn-ghost btn-sm" style="padding:.65rem 1.2rem;font-size:.78rem;opacity:.6;cursor:default">Finished</span>'
          : '<a class="btn-cc btn-sm" href="' + bookHref(s, state.day) + '">Book <i class="fas fa-arrow-right"></i></a>') + "</div>" +
        "</article>";
    }).join("");

    if (animate && window.CC) CC.animateIn($list.children, { x: 30, y: 0 });
  }

  function renderWeek(animate) {
    $week.innerHTML = DAYS.map(function (d, i) {
      var list = sessions(i);
      return '<div class="wg-col' + (i === todayIdx ? " is-today" : "") + '">' +
        '<div class="wg-head">' + d.short + (i === todayIdx ? "<small>TODAY</small>" : "") + "</div>" +
        (list.length ? list.map(function (s) {
          return '<a class="wg-slot" style="--c:' + CATS[s.c.cat].color + '" href="' + bookHref(s, i) + '" aria-label="Book ' + s.c.name + " on " + d.name + " at " + fmt(s.start) + '">' +
            '<div class="t">' + fmt(s.start) + '</div><div class="n">' + s.c.name + '</div><div class="c">' + s.c.coach + " · " + s.c.dur + "m</div></a>";
        }).join("") : '<div class="wg-empty">No classes</div>') +
        "</div>";
    }).join("");
    if (animate && window.CC) CC.animateIn($week.children, { y: 30 });
  }

  function render(animate) {
    renderTabs();
    if (state.view === "day") renderList(animate);
    else renderWeek(animate);
    if (window.CC) CC.refresh();
  }

  function setPressed(container, attr, value) {
    Array.prototype.forEach.call(container.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", c.getAttribute(attr) === value ? "true" : "false");
    });
  }

  /* ---------- events ---------- */
  $tabs.addEventListener("click", function (e) {
    var t = e.target.closest(".day-tab");
    if (!t) return;
    state.day = +t.getAttribute("data-day");
    render(true);
    var sel = $tabs.querySelector('[aria-selected="true"]');
    if (sel) sel.focus({ preventScroll: true });
    centerTab(true);
  });

  // keep the active day visible inside the horizontal scroller (phones)
  function centerTab(smooth) {
    var sel = $tabs.querySelector('[aria-selected="true"]');
    var sx = $tabs.parentElement;
    if (!sel || sx.scrollWidth <= sx.clientWidth) return;
    var delta = sel.getBoundingClientRect().left - sx.getBoundingClientRect().left - (sx.clientWidth - sel.offsetWidth) / 2;
    sx.scrollTo({ left: sx.scrollLeft + delta, behavior: smooth ? "smooth" : "auto" });
  }
  $tabs.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    state.day = (state.day + (e.key === "ArrowRight" ? 1 : 6)) % 7;
    render(true);
    $tabs.querySelector('[aria-selected="true"]').focus();
  });
  $catChips.addEventListener("click", function (e) {
    var c = e.target.closest(".chip");
    if (!c) return;
    state.cat = c.getAttribute("data-cat");
    setPressed($catChips, "data-cat", state.cat);
    render(true);
  });
  $todChips.addEventListener("click", function (e) {
    var c = e.target.closest(".chip");
    if (!c) return;
    state.tod = c.getAttribute("data-tod");
    setPressed($todChips, "data-tod", state.tod);
    render(true);
  });
  $list.addEventListener("click", function (e) {
    if (e.target.closest("#resetFilters")) {
      state.cat = "all"; state.tod = "all";
      setPressed($catChips, "data-cat", "all");
      setPressed($todChips, "data-tod", "all");
      render(true);
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-view]"), function (b) {
    b.addEventListener("click", function () {
      state.view = b.getAttribute("data-view");
      Array.prototype.forEach.call(document.querySelectorAll("[data-view]"), function (x) {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      $dayView.hidden = state.view !== "day";
      $weekView.hidden = state.view !== "week";
      render(true);
    });
  });

  /* ---------- class guide ---------- */
  $guide.innerHTML = Object.keys(CLASSES).map(function (k) {
    var c = CLASSES[k];
    var count = 0;
    Object.keys(SCHEDULE).forEach(function (d) { SCHEDULE[d].forEach(function (s) { if (s[1] === k) count++; }); });
    return '<div class="col-sm-6 col-lg-4"><div class="class-guide-card" data-tilt="6" style="--c:' + CATS[c.cat].color + '">' +
      '<span class="tt-icon"><i class="fas ' + c.icon + '"></i></span>' +
      "<h3>" + c.name + "</h3>" +
      '<div class="tt-tags mb-3"><span class="cat">' + CATS[c.cat].label + "</span>" + bars(c.level) + "<span>" + c.dur + " min</span><span>" + count + "× / week</span></div>" +
      '<p class="mb-3">' + c.desc + "</p>" +
      '<div class="tt-coach"><img src="' + avatar(c.coach) + '" alt="" loading="lazy" width="38" height="38"> with ' + c.coach + "</div>" +
      "</div></div>";
  }).join("");
  if (window.CC) CC.initTilt($guide);

  render(false);
  centerTab(false);
})();
