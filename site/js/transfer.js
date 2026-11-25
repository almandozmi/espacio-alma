import { checkField, formatName } from "./format.js";

const doneTemplate = document.querySelector("#transfer-done");
// Invoker commands are Baseline only since December 2025: older browsers get the same buttons through clicks
const hasInvokers = "commandForElement" in HTMLButtonElement.prototype;

const dialog = document.querySelector("#transfer");
const form = dialog.querySelector("form");
const { plan, name, email, phone } = form.elements;
const submit = form.querySelector('[type="submit"]');
const error = document.createElement("p");
error.className = "transfer__error";
error.setAttribute("role", "alert");
error.textContent = "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.";
let sending = false;

// Our own messages replace the browser bubbles; without JavaScript the browser validates instead
form.noValidate = true;
// "false", not unset: Firefox and Safari announce an empty required field as invalid before any typing
const clearInvalid = () => [name, email, phone].forEach((input) => input.setAttribute("aria-invalid", "false"));
clearInvalid();

// The select only shows if this script didn't load; here the button that opened the dialog picks the plan
function choose(button) {
  plan.value = button.value;
  dialog.querySelector(".transfer__plan").textContent = plan.selectedOptions[0]?.text ?? "";
}

if (!hasInvokers) {
  for (const button of document.querySelectorAll('[commandfor="transfer"][command="show-modal"]')) {
    button.addEventListener("click", () => {
      choose(button);
      dialog.showModal();
    });
  }
}

// Plays the exit animation first; with reduced motion there is none and it closes at once
function close() {
  if (!dialog.open || dialog.dataset.closing) return;
  dialog.dataset.closing = "true";
  Promise.allSettled(dialog.getAnimations().map((animation) => animation.finished)).then(() => {
    delete dialog.dataset.closing;
    dialog.close();
  });
}

function validate(input) {
  const { message, fix } = checkField(input.name, input.value);
  const output = document.getElementById(input.getAttribute("aria-describedby"));
  // Rebuilding the same message would remove the "Corregir" button between its mousedown and click
  if (output.firstChild?.data !== message) {
    output.textContent = message;
    if (fix) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "field__fix";
      button.textContent = "Corregir";
      button.addEventListener("click", () => {
        email.value = fix;
        validate(email);
        email.focus();
      });
      output.append(button);
    }
  }
  input.setAttribute("aria-invalid", message ? "true" : "false");
  return !message;
}

dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  close();
});
dialog.addEventListener("command", (event) => {
  if (event.command === "show-modal") return choose(event.source);
  if (event.command !== "close") return;
  event.preventDefault();
  close();
});
if (!hasInvokers) dialog.querySelector(".transfer__close").addEventListener("click", close);
// Pressed and released outside the box: a text selection dragged out of a field must not close it and lose what was typed
const outside = (event) => {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
};
let pressedOutside = false;
dialog.addEventListener("pointerdown", (event) => (pressedOutside = outside(event)));
dialog.addEventListener("pointerup", (event) => pressedOutside && outside(event) && close());

dialog.addEventListener("close", () => {
  form.reset();
  clearInvalid();
  for (const output of form.querySelectorAll(".field__message")) output.textContent = "";
  error.remove();
  dialog.querySelector(".transfer__done")?.replaceWith(form);
});

name.addEventListener("blur", () => (name.value = formatName(name.value)));
// Typing only clears or updates a message already shown; the email is checked when leaving the field
for (const input of [name, email, phone]) {
  input.addEventListener("input", () => input.getAttribute("aria-invalid") === "true" && validate(input));
}
email.addEventListener("blur", () => email.value.trim() && validate(email));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sending) return;
  name.value = formatName(name.value);
  email.value = email.value.trim().toLowerCase();
  // All three are checked so every message shows at once; focus goes to the first problem
  const invalid = [name, email, phone].filter((input) => !validate(input));
  if (invalid.length) return invalid[0].focus();

  sending = true;
  submit.setAttribute("aria-disabled", "true");
  submit.textContent = "Enviando…";
  error.remove();
  try {
    // A simple form POST needs no CORS preflight, which Apps Script can't answer
    const response = await fetch(form.action, { method: "POST", body: new URLSearchParams(new FormData(form)), signal: AbortSignal.timeout(15000) });
    if (!(await response.json()).ok) throw new Error("Rejected");
    // Closed while sending: the next open must show a fresh form, not this result
    if (!dialog.open) return;
    const done = doneTemplate.content.firstElementChild.cloneNode(true);
    done.querySelector("button").addEventListener("click", close);
    form.replaceWith(done);
    // The submit button just disappeared; focus on the thanks so screen readers read it
    done.focus();
  } catch {
    if (dialog.open) form.querySelector(".transfer__privacy").before(error);
  } finally {
    sending = false;
    submit.removeAttribute("aria-disabled");
    submit.textContent = "Enviar";
  }
});
