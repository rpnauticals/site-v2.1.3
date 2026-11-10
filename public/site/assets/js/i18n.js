/**
 * RP Nauticals — English / Hindi language popup + page translator
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "rp_lang";
  var ATTRS = ["placeholder", "aria-label", "title", "alt"];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, CODE: 1, PRE: 1, TEXTAREA: 1 };
  var textOriginals = new WeakMap();
  var attrOriginals = new WeakMap();
  var currentLang = "en";
  var observer = null;
  var applying = false;

  function dict() {
    return global.RP_I18N_DICT || {};
  }

  function normalize(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  function translateString(value, lang) {
    if (lang !== "hi") return value;
    var key = normalize(value);
    if (!key) return value;
    var hi = dict()[key];
    if (!hi) return value;
    // Preserve leading/trailing whitespace from original
    var lead = value.match(/^\s*/)?.[0] || "";
    var trail = value.match(/\s*$/)?.[0] || "";
    return lead + hi + trail;
  }

  function ensureFonts() {
    if (document.getElementById("rp-i18n-fonts")) return;
    var link = document.createElement("link");
    link.id = "rp-i18n-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }

  function ensureCss(base) {
    if (document.getElementById("rp-i18n-css")) return;
    var link = document.createElement("link");
    link.id = "rp-i18n-css";
    link.rel = "stylesheet";
    link.href = base + "i18n.css";
    document.head.appendChild(link);
  }

  function scriptBase() {
    var nodes = document.querySelectorAll('script[src*="i18n.js"], script[src*="main.js"]');
    for (var i = nodes.length - 1; i >= 0; i--) {
      var src = nodes[i].getAttribute("src") || "";
      if (src.indexOf("i18n.js") !== -1 || src.indexOf("main.js") !== -1) {
        return src.replace(/[^/]+$/, "");
      }
    }
    return "assets/js/";
  }

  function cssBaseFromJs(jsBase) {
    return jsBase.replace(/\/js\/?$/, "/css/");
  }

  function getSavedLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function translateAttributes(root, lang) {
    ATTRS.forEach(function (attr) {
      root.querySelectorAll("[" + attr + "]").forEach(function (el) {
        if (el.closest("[data-no-i18n]")) return;
        var map = attrOriginals.get(el);
        if (!map) {
          map = {};
          attrOriginals.set(el, map);
        }
        if (!(attr in map)) map[attr] = el.getAttribute(attr);
        var base = map[attr];
        if (base == null) return;
        el.setAttribute(attr, translateString(base, lang));
      });
    });
  }

  function translateTextNodes(root, lang) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS[p.tagName]) return NodeFilter.FILTER_REJECT;
        if (p.closest("[data-no-i18n]")) return NodeFilter.FILTER_REJECT;
        if (p.isContentEditable) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        // Skip pure counters / numbers / emails / urls-ish
        var t = normalize(node.nodeValue);
        if (/^[\d+./%₹,\-\s]+$/.test(t)) return NodeFilter.FILTER_REJECT;
        if (/^[\w.+-]+@[\w.-]+$/.test(t)) return NodeFilter.FILTER_REJECT;
        if (/^https?:\/\//i.test(t)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    var node;
    while ((node = walker.nextNode())) {
      if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
      var base = textOriginals.get(node);
      node.nodeValue = translateString(base, lang);
    }
  }

  function applyLanguage(lang, opts) {
    opts = opts || {};
    if (lang !== "hi" && lang !== "en") lang = "en";
    currentLang = lang;
    applying = true;

    document.documentElement.lang = lang === "hi" ? "hi" : "en";
    document.documentElement.setAttribute("data-lang", lang);
    if (lang === "hi") ensureFonts();

    var root = document.body;
    if (root) {
      translateAttributes(root, lang);
      translateTextNodes(root, lang);
    }

    // document title
    if (!document.documentElement.dataset.i18nTitleBase) {
      document.documentElement.dataset.i18nTitleBase = document.title;
    }
    document.title = translateString(document.documentElement.dataset.i18nTitleBase, lang);

    updateSwitcherLabel();
    applying = false;

    if (!opts.silent) {
      try {
        document.dispatchEvent(new CustomEvent("rp:langchange", { detail: { lang: lang } }));
      } catch (e) {}
    }
  }

  function openPopup() {
    var overlay = document.getElementById("rp-i18n-overlay");
    if (!overlay) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    var first = overlay.querySelector(".i18n-lang-btn");
    if (first) first.focus();
  }

  function closePopup() {
    var overlay = document.getElementById("rp-i18n-overlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function chooseLang(lang) {
    saveLang(lang);
    applyLanguage(lang);
    closePopup();
  }

  function updateSwitcherLabel() {
    var btn = document.getElementById("rp-i18n-switcher");
    if (!btn) return;
    var label = btn.querySelector("[data-i18n-switcher-label]");
    if (label) label.textContent = currentLang === "hi" ? "हिंदी / EN" : "EN / हिंदी";
  }

  function buildUI() {
    if (document.getElementById("rp-i18n-overlay")) return;

    var overlay = document.createElement("div");
    overlay.id = "rp-i18n-overlay";
    overlay.className = "i18n-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-labelledby", "rp-i18n-title");
    overlay.innerHTML =
      '<div class="i18n-modal" data-no-i18n>' +
      '<div class="i18n-modal-kicker">RP Nauticals</div>' +
      '<h2 id="rp-i18n-title">Choose your language / भाषा चुनें</h2>' +
      "<p>Select English or Hindi to continue. You can change this anytime.</p>" +
      '<div class="i18n-lang-grid">' +
      '<button type="button" class="i18n-lang-btn" data-lang="en" aria-label="Continue in English">' +
      "<strong>English</strong><span>Continue in English</span></button>" +
      '<button type="button" class="i18n-lang-btn is-hi" data-lang="hi" aria-label="हिंदी में जारी रखें">' +
      "<strong>हिंदी</strong><span>हिंदी में जारी रखें</span></button>" +
      "</div></div>";

    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (!btn) return;
      chooseLang(btn.getAttribute("data-lang"));
    });

    document.body.appendChild(overlay);

    var switcher = document.createElement("button");
    switcher.type = "button";
    switcher.id = "rp-i18n-switcher";
    switcher.className = "i18n-switcher";
    switcher.setAttribute("aria-label", "Change language");
    switcher.innerHTML =
      '<span class="i18n-switcher-flag" aria-hidden="true">अA</span>' +
      '<span data-i18n-switcher-label>EN / हिंदी</span>';
    switcher.addEventListener("click", openPopup);
    document.body.appendChild(switcher);
  }

  function observeDynamic() {
    if (observer || !document.body) return;
    observer = new MutationObserver(function (mutations) {
      if (applying || currentLang !== "hi") return;
      var needs = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
          needs = true;
          break;
        }
      }
      if (!needs) return;
      // Debounce lightly
      clearTimeout(observeDynamic._t);
      observeDynamic._t = setTimeout(function () {
        applyLanguage("hi", { silent: true });
      }, 40);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    var jsBase = scriptBase();
    ensureCss(cssBaseFromJs(jsBase));
    buildUI();

    var saved = getSavedLang();
    if (saved === "hi" || saved === "en") {
      applyLanguage(saved, { silent: true });
      closePopup();
    } else {
      // First visit — show popup; keep page in English until chosen
      applyLanguage("en", { silent: true });
      openPopup();
    }
    observeDynamic();
  }

  global.RP_I18N = {
    apply: applyLanguage,
    refresh: function () {
      applyLanguage(currentLang, { silent: true });
    },
    open: openPopup,
    getLang: function () {
      return currentLang;
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
