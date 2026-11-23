/* Cee Cee's Fitness — shared interactions & motion
   - page transitions (curtain)        - sticky nav / mobile menu
   - scroll reveals + stagger (GSAP)   - parallax + hero 3D scene
   - 3D tilt cards                     - counters, progress bar, newsletter */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var curtain = $(".page-curtain");
  var motion = hasGsap && !reduce;

  /* ---------- helpers ---------- */
  // CSS transitions on transform fight GSAP tweens; switch them off while animating.
  function noTr(targets) { targets.forEach(function (t) { t.classList.add("no-tr"); }); }
  function restoreTr(targets) { targets.forEach(function (t) { t.classList.remove("no-tr"); }); }

  function tweenIn(targets, fromVars, extra) {
    targets = Array.isArray(targets) ? targets : [targets];
    if (!targets.length) return;
    if (!motion) return;
    noTr(targets);
    var vars = Object.assign({
      duration: 0.9, ease: "power3.out",
      onComplete: function () { restoreTr(targets); gsap.set(targets, { clearProps: "transform,opacity" }); }
    }, fromVars, extra || {});
    return gsap.from(targets, vars);
  }

  /* ---------- page transitions ---------- */
  function hideCurtain() {
    if (!curtain) return;
    curtain.style.visibility = "hidden";
  }

  function enterPage() {
    if (!curtain || !motion) { hideCurtain(); start(); return; }
    var logo = $(".curtain-logo", curtain);
    var tl = gsap.timeline({ onComplete: hideCurtain });
    tl.to(logo, { opacity: 0, y: -16, duration: 0.35, ease: "power2.in" }, 0.1)
      .to(curtain, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 0.2)
      .add(start, 0.5);
  }

  function leavePage(href) {
    if (!curtain || !motion) { window.location.href = href; return; }
    var logo = $(".curtain-logo", curtain);
    curtain.style.visibility = "visible";
    gsap.timeline({ onComplete: function () { window.location.href = href; } })
      .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.inOut" })
      .fromTo(logo, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.2");
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    var raw = a.getAttribute("href");
    if (!raw || raw.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(raw)) return;
    var url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    e.preventDefault();
    closeMenu();
    leavePage(url.href);
  });

  // back/forward cache: never show a stuck curtain
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && curtain) {
      if (hasGsap) gsap.set(curtain, { yPercent: -100 });
      hideCurtain();
    }
  });

  /* ---------- nav, progress, back-to-top ---------- */
  var nav = $("#siteNav");
  var progress = $(".scroll-progress");
  var toTop = $(".to-top");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("is-scrolled", y > 30);
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    if (toTop) toTop.classList.toggle("show", y > 700);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- mobile menu ---------- */
  var toggle = $(".nav-toggle");
  var menu = $("#mobileMenu");

  function openMenu() {
    document.body.classList.add("menu-open", "no-scroll");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    menu.setAttribute("aria-hidden", "false");
    if (motion) {
      gsap.fromTo($$(".m-link", menu), { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "expo.out", delay: 0.05 });
      gsap.fromTo($(".m-foot", menu), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.35 });
    }
  }
  function closeMenu() {
    if (!toggle || !document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open", "no-scroll");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.setAttribute("aria-hidden", "true");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { if (a.getAttribute("href").charAt(0) === "#") closeMenu(); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 992) closeMenu(); });
  }

  /* ---------- 3D tilt ---------- */
  function initTilt(root) {
    if (!canHover || reduce) return;
    $$("[data-tilt]:not(.tilt-on)", root).forEach(function (el) {
      el.classList.add("tilt-on");
      var max = parseFloat(el.getAttribute("data-tilt")) || 8;
      if (!el.querySelector(".tilt-glare")) {
        var g = document.createElement("span");
        g.className = "tilt-glare";
        el.appendChild(g);
      }
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * max * 2;
        var ry = (px - 0.5) * max * 2;
        el.classList.add("is-tilting");
        el.style.transform = "perspective(1000px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale3d(1.02,1.02,1.02)";
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        el.style.setProperty("--ga", (Math.atan2(py - 0.5, px - 0.5) * 180 / Math.PI + 90).toFixed(0) + "deg");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-tilting");
        el.style.transform = "";
      });
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealFrom = {
    up: { y: 60, opacity: 0 },
    down: { y: -40, opacity: 0 },
    left: { x: -70, opacity: 0 },
    right: { x: 70, opacity: 0 },
    scale: { scale: 0.88, opacity: 0 },
    fade: { opacity: 0 },
    tilt: { y: 80, rotateX: -18, opacity: 0, transformPerspective: 900, transformOrigin: "50% 100%" }
  };

  function initReveals(root) {
    if (!motion || !hasST) return;
    $$("[data-reveal]:not(.rv-on)", root).forEach(function (el) {
      el.classList.add("rv-on");
      var from = revealFrom[el.getAttribute("data-reveal")] || revealFrom.up;
      tweenIn(el, from, {
        duration: 1.1, ease: "expo.out",
        delay: parseFloat(el.getAttribute("data-delay")) || 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    $$("[data-stagger]:not(.rv-on)", root).forEach(function (el) {
      el.classList.add("rv-on");
      var kids = Array.prototype.slice.call(el.children);
      var from = revealFrom[el.getAttribute("data-stagger")] || revealFrom.up;
      tweenIn(kids, from, {
        duration: 1, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 86%", once: true }
      });
    });
    // section titles: words rise up
    $$("[data-split]:not(.rv-on)", root).forEach(function (el) {
      el.classList.add("rv-on");
      splitWords(el);
      gsap.from($$(".w > span", el), {
        yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
  }

  // wrap each word (keeping inner spans/br) for masked word reveals
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.innerHTML = "";
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
          el.appendChild(wordBox(document.createTextNode(part)));
        });
      } else if (n.nodeName === "BR") {
        el.appendChild(n);
      } else {
        el.appendChild(wordBox(n));
      }
    });
  }
  function wordBox(node) {
    var w = document.createElement("span");
    w.className = "w";
    w.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.06em;margin-bottom:-.06em";
    var inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.appendChild(node);
    w.appendChild(inner);
    return w;
  }

  /* ---------- counters ---------- */
  function initCounters(root) {
    $$("[data-count]:not(.ct-on)", root).forEach(function (el) {
      el.classList.add("ct-on");
      var end = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (!motion) { el.innerHTML = end + (suffix ? "<em>" + suffix + "</em>" : ""); return; }
      var obj = { v: 0 };
      var render = function () { el.innerHTML = Math.round(obj.v) + (suffix ? "<em>" + suffix + "</em>" : ""); };
      render();
      gsap.to(obj, {
        v: end, duration: 2, ease: "power2.out", onUpdate: render,
        scrollTrigger: hasST ? { trigger: el, start: "top bottom", once: true } : undefined
      });
    });
  }

  /* ---------- parallax ---------- */
  function initParallax() {
    if (!motion || !hasST) return;
    $$("[data-speed]").forEach(function (el) {
      var s = parseFloat(el.getAttribute("data-speed")) || 0;
      gsap.to(el, {
        yPercent: s * -10, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
    var pageBg = $(".page-hero-bg");
    if (pageBg) {
      gsap.to(pageBg, { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".page-hero", start: "top top", end: "bottom top", scrub: true } });
    }
  }

  /* ---------- home hero ---------- */
  function initHero() {
    var hero = $(".hero");
    if (!hero) return;

    if (motion) {
      var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      var actions = $$(".hero-actions > *");
      noTr(actions);
      tl.from(".hero-bg", { scale: 1.3, duration: 2.2, ease: "power3.out" }, 0)
        .from(".hero-pill", { y: 24, opacity: 0, duration: 0.9 }, 0.1)
        .from(".hero-title .line-inner", { yPercent: 115, rotateX: -50, duration: 1.3, stagger: 0.12 }, 0.2)
        .from(".hero-text", { y: 30, opacity: 0, duration: 1 }, 0.6)
        .from(actions, { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, onComplete: function () { restoreTr(actions); gsap.set(actions, { clearProps: "transform,opacity" }); } }, 0.7)
        .from(".hero-stat", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.85)
        .from(".hero-scene .scene-layer", { opacity: 0, scale: 0.4, z: -300, duration: 1.4, stagger: 0.1, ease: "back.out(1.4)" }, 0.4)
        .from(".scroll-cue", { opacity: 0, y: 10, duration: 0.8 }, 1.2);

      if (hasST) {
        gsap.to(".hero-bg", { yPercent: 10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-content", { y: -90, opacity: 0.15, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-scene", { y: -160, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      }
    }

    // mouse-driven depth: each layer moves by its data-depth
    var scene = $(".hero-scene");
    if (scene && motion && canHover) {
      var inner = $(".scene-inner", scene);
      var rotX = gsap.quickTo(inner, "rotationX", { duration: 0.8, ease: "power3" });
      var rotY = gsap.quickTo(inner, "rotationY", { duration: 0.8, ease: "power3" });
      var layers = $$("[data-depth]", scene).map(function (l) {
        return {
          d: parseFloat(l.getAttribute("data-depth")),
          x: gsap.quickTo(l, "x", { duration: 1, ease: "power3" }),
          y: gsap.quickTo(l, "y", { duration: 1, ease: "power3" })
        };
      });
      hero.addEventListener("pointermove", function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        rotY(nx * 14);
        rotX(-ny * 10);
        layers.forEach(function (l) { l.x(nx * l.d * 60); l.y(ny * l.d * 60); });
      });
      hero.addEventListener("pointerleave", function () {
        rotX(0); rotY(0);
        layers.forEach(function (l) { l.x(0); l.y(0); });
      });
    }
  }

  /* ---------- inner page hero intro ---------- */
  function initPageHero() {
    var ph = $(".page-hero");
    if (!ph || !motion) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from($$(".crumbs, .eyebrow", ph), { y: 20, opacity: 0, duration: 0.8 }, 0)
      .from($$("h1 .w > span", ph), { yPercent: 115, duration: 1.2, stagger: 0.08 }, 0.05)
      .from($$("p, .ph-extra", ph), { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.35);
  }

  /* ---------- newsletter ---------- */
  function initNewsletter() {
    var form = $("#newsletterForm");
    if (!form) return;
    var input = $("#nlEmail");
    var msg = $("#nlMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      msg.className = "nl-msg " + (ok ? "ok" : "bad");
      msg.textContent = ok ? "You're in! Watch your inbox for class drops." : "Please enter a valid email address.";
      if (ok) input.value = "";
      else { form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake"); }
    });
  }

  /* ---------- boot ---------- */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    $$(".page-hero h1").forEach(function (h) { if (motion) splitWords(h); });
    initHero();
    initPageHero();
    initReveals();
    initCounters();
    initParallax();
    if (hasST) window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  initTilt();
  initNewsletter();
  enterPage();

  // Public helpers for page scripts that render content dynamically
  window.CC = {
    motion: motion,
    reduce: reduce,
    canHover: canHover,
    initTilt: initTilt,
    initReveals: initReveals,
    animateIn: function (nodes, opts) {
      return tweenIn(Array.prototype.slice.call(nodes), Object.assign({ y: 24, opacity: 0 }, opts || {}), { duration: 0.6, stagger: 0.05, ease: "power3.out" });
    },
    refresh: function () { if (hasST) ScrollTrigger.refresh(); }
  };
})();
