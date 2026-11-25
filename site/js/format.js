// Particles stay lowercase except at the start: "maría josé DE LA fuente" → "María José de la Fuente"
const PARTICLES = new Set(["de", "del", "la", "las", "los", "y"]);
const capitalize = (word) => word.charAt(0).toLocaleUpperCase("es-CL") + word.slice(1);

export function formatName(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const lower = word.toLocaleLowerCase("es-CL");
      if (i > 0 && PARTICLES.has(lower)) return lower;
      // Hyphen and apostrophe start a new capital: "ana-maría" → "Ana-María", "o'higgins" → "O'Higgins"
      return lower.split(/(?<=[-'’])/).map(capitalize).join("");
    })
    .join(" ");
}

// Same rule as apps-script/transfer-requests.gs: keep both in sync
const VALID_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const DOMAIN_TYPOS = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cl": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "yaho.com": "yahoo.com",
  "icloud.co": "icloud.com",
};

// Without sending a mail we can't know the address exists, only its shape and a likely domain typo
export function checkEmail(email) {
  const clean = email.trim().toLowerCase();
  if (!VALID_EMAIL.test(clean)) return { message: "Correo no válido. Ejemplo: nombre@gmail.com" };
  const [user, domain] = clean.split("@");
  if (!DOMAIN_TYPOS[domain]) return { message: "" };
  const fix = `${user}@${DOMAIN_TYPOS[domain]}`;
  return { message: `¿Quisiste decir ${fix}?`, fix };
}

export function checkField(field, value) {
  const clean = value.trim();
  if (field === "name") return { message: clean ? "" : "Escribe tu nombre y apellido." };
  if (field === "email") return clean ? checkEmail(clean) : { message: "Escribe tu correo." };
  if (!clean) return { message: "Escribe tu teléfono." };
  // A Chilean number has 8 or 9 digits, plus 56 when written with the country code
  const digits = clean.replace(/\D/g, "").length;
  return { message: digits >= 8 && digits <= 12 ? "" : "Revisa el teléfono. Ejemplo: +56 9 1234 5678" };
}
