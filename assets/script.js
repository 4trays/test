/* ==========================================================================
   Optik Umam Jaya — shared interactivity
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- burger navigation panel ---------- */
  var burger = document.querySelector("[data-burger]");
  var overlay = document.querySelector("[data-nav-overlay]");
  var panel = document.querySelector("[data-nav-panel]");
  var closeBtn = document.querySelector("[data-nav-close]");

  function openNav() {
    if (!panel) return;
    panel.classList.add("is-open");
    overlay.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }
  function closeNav() {
    if (!panel) return;
    panel.classList.remove("is-open");
    overlay.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      var isOpen = panel.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });
    overlay.addEventListener("click", closeNav);
    closeBtn.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- reveal on scroll (reusable: re-run after each SPA page switch) ---------- */
  var io = null;
  function ensureRevealObserver() {
    if (io || !("IntersectionObserver" in window)) return;
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
  }
  function observeReveals(root) {
    var scope = root || document;
    var targets = scope.querySelectorAll(".reveal, .reveal-group");
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("in-view"); });
      return;
    }
    ensureRevealObserver();
    targets.forEach(function (t) { io.observe(t); });
  }
  observeReveals(document);
  window.OUJ_observeReveals = observeReveals;

  /* expose nav close so the router can collapse the menu after navigating */
  window.OUJ_closeNav = closeNav;

  /* ---------- generic ripple-free press feedback for icon buttons ---------- */
  document.querySelectorAll(".icon-btn[data-toast]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var msg = btn.getAttribute("data-toast");
      if (msg) showToast(msg);
    });
  });

  var toastEl = null;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }
  window.OUJ_toast = showToast;
})();

/* ==========================================================================
   Produk page — sub navigation + scroll spy
   ========================================================================== */
(function () {
  var buttons = document.querySelectorAll("[data-subnav]");
  if (!buttons.length) return;
  var sections = Array.prototype.map.call(buttons, function (btn) {
    return document.getElementById(btn.getAttribute("data-subnav"));
  });

  buttons.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      var target = sections[i];
      if (target) {
        var top = target.getBoundingClientRect().top + window.pageYOffset - (document.querySelector(".site-header").offsetHeight + document.querySelector(".subnav").offsetHeight + 6);
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            buttons.forEach(function (b) {
              b.classList.toggle("is-active", b.getAttribute("data-subnav") === entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      if (s) spy.observe(s);
    });
  }
})();

/* ==========================================================================
   Produk page — lightbox / modal preview
   ========================================================================== */
(function () {
  var lightbox = document.querySelector("[data-lightbox]");
  if (!lightbox) return;
  var visual = lightbox.querySelector("[data-lightbox-visual]");
  var tag = lightbox.querySelector("[data-lightbox-tag]");
  var title = lightbox.querySelector("[data-lightbox-title]");
  var desc = lightbox.querySelector("[data-lightbox-desc]");
  var price = lightbox.querySelector("[data-lightbox-price]");
  var closeEls = lightbox.querySelectorAll("[data-lightbox-close]");
  var lastFocused = null;

  function open(card) {
    var svgSrc = card.querySelector("svg");
    visual.innerHTML = svgSrc ? svgSrc.outerHTML : "";
    tag.textContent = card.getAttribute("data-tag") || "";
    title.textContent = card.getAttribute("data-title") || "";
    desc.textContent = card.getAttribute("data-desc") || "";
    price.textContent = card.getAttribute("data-price") || "";
    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    document.body.classList.add("nav-open");
    closeEls[0].focus();
  }
  function close() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll("[data-product-card]").forEach(function (card) {
    card.addEventListener("click", function () {
      open(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card);
      }
    });
  });
  closeEls.forEach(function (el) {
    el.addEventListener("click", close);
  });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
  });
})();

/* ==========================================================================
   QnA page — accordion
   ========================================================================== */
(function () {
  var items = document.querySelectorAll("[data-faq-item]");
  if (!items.length) return;
  items.forEach(function (item) {
    var q = item.querySelector("[data-faq-q]");
    var a = item.querySelector("[data-faq-a]");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      items.forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector("[data-faq-a]").style.maxHeight = null;
        other.querySelector("[data-faq-q]").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });
})();

/* ==========================================================================
   Lokasi page — live open/closed status
   ========================================================================== */
(function () {
  var pill = document.querySelector("[data-store-status]");
  if (!pill) return;

  var schedule = {
    0: null, // Sunday
    1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], // Mon-Fri
    6: [9, 21] // Saturday
  };
  var sundayHours = [10, 17];

  var now = new Date();
  var day = now.getDay();
  var hours = day === 0 ? sundayHours : schedule[day];
  var currentHour = now.getHours() + now.getMinutes() / 60;
  var isOpen = hours && currentHour >= hours[0] && currentHour < hours[1];

  pill.classList.toggle("is-closed", !isOpen);
  var label = pill.querySelector("[data-store-status-label]");
  if (label) {
    label.textContent = isOpen ? "Buka sekarang" : "Tutup sekarang";
  }

  var dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  document.querySelectorAll(".hours-table tr").forEach(function (row) {
    if (row.getAttribute("data-day") === String(day)) {
      row.classList.add("is-today");
    }
  });
})();

/* toast styles injected once needed */
(function () {
  var style = document.createElement("style");
  style.textContent =
    ".toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#14213b;color:#fff;padding:13px 22px;border-radius:999px;font-size:.88rem;font-weight:600;opacity:0;pointer-events:none;transition:opacity .3s ease, transform .3s ease;z-index:400;box-shadow:0 14px 30px rgba(0,0,0,.25);} .toast.is-visible{opacity:1;transform:translate(-50%,0);}";
  document.head.appendChild(style);
})();

/* ==========================================================================
   SPA router — clean URLs (/beranda, /produk, /lokasi, /customer-service, /qna)
   No page reload, no #hash routing.
   ========================================================================== */
(function () {
  "use strict";

  var ROUTES = {
    "/": "beranda",
    "/beranda": "beranda",
    "/produk": "produk",
    "/lokasi": "lokasi",
    "/customer-service": "cs",
    "/qna": "qna"
  };

  var pages = {};
  var titles = {};
  document.querySelectorAll(".page[data-page-key]").forEach(function (el) {
    var key = el.getAttribute("data-page-key");
    pages[key] = el;
    titles[key] = el.getAttribute("data-title") || document.title;
  });

  var header = document.querySelector(".site-header");
  var subnav = document.querySelector(".subnav");

  function resolveKey(pathname) {
    var clean = pathname.replace(/\/+$/, "");
    if (clean === "") clean = "/";
    return ROUTES.hasOwnProperty(clean) ? ROUTES[clean] : null;
  }

  function closeOverlaysOnNavigate() {
    if (window.OUJ_closeNav) window.OUJ_closeNav();
    var lightbox = document.querySelector("[data-lightbox]");
    if (lightbox) lightbox.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  function scrollToTarget(id) {
    var target = id ? document.getElementById(id) : null;
    if (!target) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    var offset = (header ? header.offsetHeight : 0) + (subnav && !subnav.closest(".page[hidden]") ? subnav.offsetHeight : 0) + 10;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: "auto" });
  }

  function showPage(key, hashId) {
    if (!pages[key]) key = "beranda";
    Object.keys(pages).forEach(function (k) {
      pages[k].hidden = k !== key;
    });
    document.body.setAttribute("data-page", key);
    if (titles[key]) document.title = titles[key];
    document.querySelectorAll(".nav-list a[data-page]").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-page") === key);
    });
    closeOverlaysOnNavigate();
    if (window.OUJ_observeReveals) window.OUJ_observeReveals(pages[key]);
    requestAnimationFrame(function () {
      scrollToTarget(hashId);
    });
  }

  function currentPathAndHash() {
    return { pathname: location.pathname, hash: location.hash ? location.hash.slice(1) : null };
  }

  function goTo(pathname, hashId, push) {
    var key = resolveKey(pathname) || "beranda";
    var canonicalPath = key === "beranda" && pathname !== "/beranda" ? "/beranda" : pathname.replace(/\/+$/, "") || "/beranda";
    var url = canonicalPath + (hashId ? "#" + hashId : "");
    if (push) {
      if (location.pathname + location.hash !== url) {
        history.pushState({ key: key }, "", url);
      }
    }
    showPage(key, hashId);
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    var url;
    try {
      url = new URL(href, location.href);
    } catch (err) {
      return;
    }
    if (url.origin !== location.origin) return;
    var key = resolveKey(url.pathname);
    if (!key) return;
    e.preventDefault();
    goTo(url.pathname, url.hash ? url.hash.slice(1) : null, true);
  });

  window.addEventListener("popstate", function () {
    var cur = currentPathAndHash();
    var key = resolveKey(cur.pathname) || "beranda";
    showPage(key, cur.hash);
  });

  /* initial render */
  var start = currentPathAndHash();
  if (start.pathname === "/" || start.pathname === "") {
    history.replaceState({ key: "beranda" }, "", "/beranda" + (start.hash ? "#" + start.hash : ""));
  }
  var startKey = resolveKey(location.pathname) || "beranda";
  showPage(startKey, start.hash);
})();
