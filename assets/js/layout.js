/* Shared header + footer, injected on every page so all pages stay in sync.
   Each page provides <div id="site-header"></div> and <div id="site-footer"></div>
   and sets <body data-page="home|gallery|classes|plans|signup">. */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";

  var links = [
    { id: "home", href: "index.html", label: "Home" },
    { id: "gallery", href: "gallery.html", label: "Gallery" },
    { id: "classes", href: "classes.html", label: "Classes" },
    { id: "plans", href: "plans.html", label: "Plans" },
    { id: "contact", href: "#contact", label: "Contact" }
  ];

  function navItem(l) {
    var active = l.id === page ? ' class="active" aria-current="page"' : "";
    return '<li><a href="' + l.href + '"' + active + ">" + l.label + "</a></li>";
  }

  function mobileItem(l, i) {
    var active = l.id === page ? " active" : "";
    return '<li><a class="m-link' + active + '" href="' + l.href + '"><small>0' + (i + 1) + "</small>" + l.label + "</a></li>";
  }

  var allMobile = links.concat([{ id: "signup", href: "signup.html", label: "Sign Up" }]);

  var header =
    '<a class="skip-link" href="#main">Skip to content</a>' +
    '<div class="scroll-progress" aria-hidden="true"></div>' +
    '<header class="site-nav' + (page === "home" ? "" : " is-solid") + '" id="siteNav">' +
      '<div class="container">' +
        '<a class="brand" href="index.html" aria-label="Cee Cee\'s Fitness home">' +
          '<span class="brand-mark"><i class="fas fa-dumbbell"></i></span>' +
          '<span><span class="brand-red">CEE CEE\'S</span> FITNESS</span>' +
        "</a>" +
        '<nav aria-label="Primary"><ul class="nav-links">' + links.map(navItem).join("") + "</ul></nav>" +
        '<a class="btn-cc btn-sm nav-cta" href="signup.html"' + (page === "signup" ? ' aria-current="page"' : "") + '><i class="fas fa-bolt"></i> Sign Up</a>' +
        '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>' +
      "</div>" +
    "</header>" +
    '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">' +
      '<nav aria-label="Mobile"><ul>' + allMobile.map(mobileItem).join("") + "</ul></nav>" +
      '<div class="m-foot"><i class="fas fa-location-dot text-red me-2"></i>1520 Muscle Ave, Los Angeles<br><i class="fas fa-phone text-red me-2"></i>(310) 555-8787</div>' +
    "</div>";

  var year = new Date().getFullYear();

  var footer =
    '<footer class="site-footer" id="contact">' +
      '<div class="container">' +
        '<div class="row gy-5">' +
          '<div class="col-lg-4 col-md-6">' +
            '<a class="brand mb-3" href="index.html"><span class="brand-mark"><i class="fas fa-dumbbell"></i></span><span><span class="brand-red">CEE CEE\'S</span> FITNESS</span></a>' +
            '<p class="mt-3" style="max-width:340px">Where strength meets community. Heavy iron, high energy classes and coaches who actually know your name.</p>' +
            '<div class="social">' +
              '<a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
              '<a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
              '<a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>' +
              '<a href="#" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>' +
            "</div>" +
          "</div>" +
          '<div class="col-lg-3 col-md-6">' +
            "<h5>VISIT US</h5>" +
            '<ul class="footer-contact">' +
              '<li><i class="fas fa-location-dot"></i><span>1520 Muscle Ave<br>Los Angeles, CA 90024</span></li>' +
              '<li><i class="fas fa-phone"></i><a href="tel:+13105558787">(310) 555-8787</a></li>' +
              '<li><i class="fas fa-envelope"></i><a href="mailto:hello@ceecees.fit">hello@ceecees.fit</a></li>' +
              '<li><i class="fas fa-clock"></i><span>24/7 member access</span></li>' +
            "</ul>" +
          "</div>" +
          '<div class="col-lg-2 col-6">' +
            "<h5>EXPLORE</h5>" +
            "<ul>" +
              '<li><a href="index.html">Home</a></li>' +
              '<li><a href="gallery.html">Gallery</a></li>' +
              '<li><a href="classes.html">Classes</a></li>' +
              '<li><a href="plans.html">Plans</a></li>' +
              '<li><a href="signup.html">Sign Up</a></li>' +
            "</ul>" +
          "</div>" +
          '<div class="col-lg-3 col-md-12">' +
            "<h5>#CEECEESFAM</h5>" +
            '<p class="small">Tag us for a chance to be featured. Get class drops and member news in your inbox.</p>' +
            '<form class="newsletter" id="newsletterForm" novalidate>' +
              '<label for="nlEmail" class="visually-hidden">Email for newsletter</label>' +
              '<input type="email" id="nlEmail" placeholder="Your email" autocomplete="email">' +
              '<button type="submit" aria-label="Subscribe"><i class="fas fa-arrow-right"></i></button>' +
            "</form>" +
            '<div class="nl-msg" id="nlMsg" role="status" aria-live="polite"></div>' +
          "</div>" +
        "</div>" +
        '<div class="footer-giant" aria-hidden="true">SWEAT TOGETHER</div>' +
        '<div class="footer-bottom">' +
          "<span>&copy; " + year + " Cee Cee's Fitness &mdash; sweat together.</span>" +
          '<span>Built with <i class="fas fa-heart text-red"></i> for the gym family</span>' +
        "</div>" +
      "</div>" +
    "</footer>" +
    '<button class="to-top" type="button" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>';

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;
})();
