const header = document.querySelector(".site-header");
const nav = document.querySelector("#main-menu");
const button = header.querySelector(".site-header__menu-button");
const icon = button.querySelector("path");

// 8px so a light trackpad touch doesn't flicker the bar
function updateHeader() {
  header.dataset.transparent = scrollY < 8 && nav.dataset.open !== "true";
}

function setOpen(open) {
  nav.dataset.open = open;
  button.setAttribute("aria-expanded", open);
  // Lucide "x" and "menu" icons (ISC license)
  icon.setAttribute("d", open ? "M18 6 6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16");
  updateHeader();
}

button.addEventListener("click", () => {
  const open = nav.dataset.open !== "true";
  setOpen(open);
  // The links come before the button in the page, so Tab alone would skip them
  if (open) nav.querySelector("a").focus();
});

nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || nav.dataset.open !== "true") return;
  setOpen(false);
  button.focus();
});

// The desktop bar has no close button, so a menu left open would keep the bar frosted at the top
matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
  if (event.matches) setOpen(false);
});

addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
