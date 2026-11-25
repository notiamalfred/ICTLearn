// menu.js
const menuToggle = document.querySelector(".menu-toggle");
const nav        = document.querySelector(".nav");
const header     = document.querySelector(".site-header");

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("nav-open");
  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
});

// Optional: add a shadow to the header after scrolling 10px
if (header) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      header.classList.add("site-header--scrolled");
    } else {
      header.classList.remove("site-header--scrolled");
    }
  }, { passive: true });
}