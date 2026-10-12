/* site-search.js — site-wide search for ICTLearn */
(function () {
  "use strict";

  var CONFIG = {
    inputId:   "skillSearch",
    clearId:   "skillSearchClear",
    statusId:  "skillSearchStatus",
    resultsId: "searchResults",
    indexUrl:  "search-index.json",
    maxResults: 20,
    debounceMs: 120
  };

  var FULL_INDEX = null;
  var loading = false;

  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function loadIndex(cb) {
    if (FULL_INDEX) return cb(FULL_INDEX);
    if (loading) {
      setTimeout(function () { loadIndex(cb); }, 50);
      return;
    }
    loading = true;

    fetch(CONFIG.indexUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        FULL_INDEX = data.map(function (item) {
          item._n = normalize(item.text);
          return item;
        });
        loading = false;
        cb(FULL_INDEX);
      })
      .catch(function (err) {
        loading = false;
        console.warn("[site-search] could not load index:", err);
        cb([]);
      });
  }

  function search(query) {
    var q = normalize(query);
    if (!q) return [];
    var terms = q.split(" ");
    var out = [];

    for (var i = 0; i < FULL_INDEX.length; i++) {
      var item = FULL_INDEX[i];
      var ok = true;
      for (var t = 0; t < terms.length; t++) {
        if (item._n.indexOf(terms[t]) === -1) { ok = false; break; }
      }
      if (ok) out.push(item);
      if (out.length >= CONFIG.maxResults) break;
    }
    return out;
  }

  function goToResult(item) {
    var currentPage = location.pathname.split("/").pop() || "index.html";
    var hash = "#search-" + encodeURIComponent(item.slug);

    if (currentPage === item.page) {
      scrollToSlug(item.slug);
      history.replaceState(null, "", hash);
    } else {
      location.href = item.page + hash;
    }
  }

  function scrollToSlug(slug) {
    var targetSlug;
    try { targetSlug = decodeURIComponent(slug); } catch (e) { targetSlug = slug; }

    var candidates = document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,td,th");
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (slugify(el.textContent) === targetSlug) {
        var target = el.closest(".skill-card, .concept-card, .feature-card") || el;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("is-search-hit");
        setTimeout(function () {
          target.classList.remove("is-search-hit");
        }, 2200);
        return true;
      }
    }
    return false;
  }

  function init() {
    if (location.hash.indexOf("#search-") === 0) {
      var slug = location.hash.slice(8);
      setTimeout(function () { scrollToSlug(slug); }, 100);
    }

    var input    = document.getElementById(CONFIG.inputId);
    var clearBtn = document.getElementById(CONFIG.clearId);
    var status   = document.getElementById(CONFIG.statusId);
    var results  = document.getElementById(CONFIG.resultsId);

    if (!input) return;

    function renderResults(items) {
      if (!results) return;
      results.innerHTML = "";
      if (!items.length) { results.hidden = true; return; }

      items.forEach(function (item) {
        var a = document.createElement("a");
        a.className = "search-result";
        a.href = "#";

        var pageEl = document.createElement("span");
        pageEl.className = "search-result__page";
        pageEl.textContent = item.label;

        var textEl = document.createElement("span");
        textEl.className = "search-result__text";
        textEl.textContent = item.text;

        a.appendChild(pageEl);
        a.appendChild(textEl);

        a.addEventListener("click", function (e) {
          e.preventDefault();
          goToResult(item);
          results.hidden = true;
          input.blur();
        });
        results.appendChild(a);
      });
      results.hidden = false;
    }

    function setStatus(query, count) {
      if (!status) return;
      if (!normalize(query)) { status.textContent = ""; return; }
      if (count === 0) {
        status.textContent = "No results for \u201C" + query.trim() + "\u201D.";
      } else {
        status.textContent = count + (count === 1 ? " result" : " results");
      }
    }

    var run = debounce(function () {
      var query = input.value;
      clearBtn.hidden = !normalize(query);

      if (!normalize(query)) {
        if (results) results.hidden = true;
        setStatus("", 0);
        return;
      }

      loadIndex(function () {
        var hits = search(query);
        renderResults(hits);
        setStatus(query, hits.length);
      });
    }, CONFIG.debounceMs);

    input.addEventListener("input", run);

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        reset();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (FULL_INDEX) {
          var hits = search(input.value);
          if (hits.length) goToResult(hits[0]);
        }
      }
    });

    clearBtn.addEventListener("click", function () {
      reset();
      input.focus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      var tag = (t.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" ||
          t.isContentEditable) return;
      e.preventDefault();
      input.focus();
      input.select();
    });

    function reset() {
      input.value = "";
      if (results) { results.hidden = true; results.innerHTML = ""; }
      if (status) status.textContent = "";
      clearBtn.hidden = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
