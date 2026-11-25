// menu-builder.js
(function () {
  const container = document.getElementById("main-menu");
  if (!container || typeof MENU_ITEMS === "undefined") return;

  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  // Detect absolute URLs and non-http schemes (works even under file://).
  function looksExternal(href) {
    return /^(https?:)?\/\//i.test(href) || /^[a-z][a-z0-9+.-]*:/i.test(href);
  }

  MENU_ITEMS.forEach(function (item) {
    const isExternal = item.external === true || looksExternal(item.href);

    const li = document.createElement("li");
    const a  = document.createElement("a");

    a.href        = item.href;
    a.textContent = item.label;

    if (isExternal) {
      a.target = "_blank";
      a.rel    = "noopener noreferrer";
      a.classList.add("external");
      a.setAttribute("aria-label", item.label + " (opens in a new tab)");
    } else if (item.href === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }

    li.appendChild(a);
    container.appendChild(li);
  });
})();