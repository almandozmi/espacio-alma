// Bound to the owner's sheet and deployed as a web app; site/js/transfer.js posts the transfer form here.

// Empty sends the notice to the account that deployed the script
const NOTIFY_TO = "";

const HEADERS = ["Fecha", "Plan", "Nombre", "Correo", "Teléfono", "Estado"];

function doPost(e) {
  const data = e.parameter;
  // Bot trap: people never see this field, so a filled one is ignored
  if (data.website) return reply({ ok: true });

  // Data comes from the internet: trim and cap it before use
  const field = (name) => String(data[name] || "").trim().slice(0, 200);
  const request = {
    plan: field("plan"),
    name: field("name"),
    email: field("email"),
    phone: field("phone"),
  };
  // Same rule as checkEmail in site/js/format.js
  if (!request.name || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i.test(request.email)) {
    return reply({ ok: false });
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  // The leading apostrophe stores text as is: "+56 9…" stays a phone and nothing becomes a formula
  const text = (value) => "'" + value;
  sheet.appendRow([
    new Date(),
    text(request.plan),
    text(request.name),
    text(request.email),
    text(request.phone),
    "Pendiente",
  ]);

  MailApp.sendEmail({
    to: NOTIFY_TO || Session.getEffectiveUser().getEmail(),
    replyTo: request.email,
    name: "Sitio Espacio Alma",
    subject: "Nueva solicitud de transferencia: " + (request.plan || "sin plan"),
    body: [
      "Alguien quiere pagar por transferencia desde el sitio.",
      "",
      "Plan: " + request.plan,
      "Nombre: " + request.name,
      "Correo: " + request.email,
      "Teléfono: " + request.phone,
      "",
      'Para enviarle los datos de transferencia, aprieta "Responder": el correo ya va dirigido a esta persona.',
      "Todas las solicitudes quedan en la planilla: " + spreadsheet.getUrl(),
    ].join("\n"),
  });

  return reply({ ok: true });
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
