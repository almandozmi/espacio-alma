// Black Friday, Friday 27 November 2026 from 00:00 to 23:59 in Chile (UTC-3 in summer)
const start = Date.parse("2026-11-27T03:00:00Z");
const end = Date.parse("2026-11-28T03:00:00Z");
const promoPrices = {
  "4 clases al mes ($54.000)": "$45.000",
  "8 clases al mes ($94.500)": "$78.000",
  "12 clases al mes ($135.000)": "$108.750",
};

// The server's clock, not the visitor's: Cloudflare stamps every response with the current time; the visitor's is the fallback
const response = await fetch(location.pathname, { method: "HEAD", cache: "no-store" }).catch(() => null);
const now = Date.parse(response?.headers.get("Date")) || Date.now();

// A page left open reloads when the promotion starts or ends, so it never shows the wrong prices
if (now < end) setTimeout(() => location.reload(), (now < start ? start : end) - now);

if (now >= start && now < end) {
  const banner = document.querySelector(".promo");
  const track = banner.querySelector(".promo__track");
  for (let i = 0; i < 24; i++) {
    const item = document.createElement("span");
    item.textContent = "¡Black Friday solo por hoy!";
    track.append(item);
  }
  banner.hidden = false;

  const pricingLink = document.querySelector('.site-header__nav a[href$="#valores"]');
  const navTag = document.createElement("span");
  navTag.className = "nav-promo";
  navTag.textContent = "¡Black Friday!";
  pricingLink?.append(navTag);

  // "Prices valid until the opening" doesn't fit the Black Friday prices
  document.querySelector("#valores .subtitle--strong").hidden = true;

  for (const button of document.querySelectorAll('[command="show-modal"]')) {
    const promoPrice = promoPrices[button.value];
    if (!promoPrice) continue;
    const plan = button.closest(".plan");
    const price = plan.querySelector(".plan__price");
    const regularPrice = price.lastChild.textContent;
    price.lastChild.textContent = promoPrice;
    const badge = document.createElement("p");
    badge.className = "plan__badge";
    badge.append(document.createElement("span"));
    badge.firstChild.textContent = "¡Black Friday!";
    plan.prepend(badge);
    button.value = button.value.replace(regularPrice, promoPrice) + " · Descuento Black Friday";
  }
}
