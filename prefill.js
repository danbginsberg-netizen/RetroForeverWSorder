/* Pre-fill the order from a link, e.g. from the Capsule Builder:
   ?cart=SKU:dozens,SKU:dozens&store=Store%20Name   (0.5 dozen = 6 pieces)
   Only fills the quantity boxes (and the business name). The buyer still reviews and submits. */
(function () {
  var p = new URLSearchParams(location.search);
  var cart = p.get("cart");
  if (!cart || typeof PRODUCTS === "undefined") return;
  var idx = {};
  PRODUCTS.forEach(function (x, i) { idx[String(x.sku).toUpperCase()] = i; });
  var filled = [], missing = [];
  cart.split(",").forEach(function (t) {
    var bits = t.split(":"), sku = String(bits[0] || "").trim().toUpperCase();
    var dz = Math.max(0, Math.round((parseFloat(bits[1]) || 0) * 2) / 2);
    if (!sku || !dz) return;
    var i = idx[sku];
    var inp = i == null ? null : document.querySelector('input.qty[data-i="' + i + '"]');
    if (!inp) { missing.push(sku); return; }
    inp.value = dz;
    filled.push(inp.closest("tr"));
  });
  // bring the filled styles to the top of the list and tint them
  var tbody = document.getElementById("tbody");
  filled.slice().reverse().forEach(function (tr) { tr.style.background = "#f3eefb"; tbody.insertBefore(tr, tbody.firstChild); });
  var store = p.get("store"), bn = document.getElementById("business_name");
  if (store && bn && !bn.value) bn.value = store;
  if (typeof recalc === "function") recalc();
  var n = filled.length;
  var note = document.createElement("div");
  note.style.cssText = "margin:12px 0;padding:10px 14px;border:1px solid #b8a9d9;background:#f3eefb;border-radius:8px;font-size:14px;line-height:1.4";
  note.textContent = "Pre-filled from your curated capsule: " + n + " style" + (n === 1 ? "" : "s") + " at the top of the list." +
    (missing.length ? " Not on this order page: " + missing.join(", ") + " (email us for these)." : "") +
    " Review the quantities, add your details and submit.";
  var table = tbody.closest("table");
  table.parentNode.insertBefore(note, table);
  // take the buyer to their styles; repeat once images above have loaded and moved the page
  function go() { note.scrollIntoView({ block: "center", behavior: "instant" }); }
  if (document.readyState === "complete") setTimeout(go, 200); else window.addEventListener("load", function () { setTimeout(go, 200); });
  setTimeout(go, 1500);
})();

/* Rep code and capsule ID (Capsule Builder v1.6.0): &rep=CODE&cap=ID on a capsule's order link credit the order to the
   rep. Both go into "Order taken by" and onto the emailed order summary; the buyer sees a short note. Works with or
   without ?cart=. Codes are letters, numbers and dashes only. */
(function () {
  var p = new URLSearchParams(location.search);
  var clean = function (v, n) { v = String(v || "").trim().slice(0, n); return /^[A-Za-z0-9-]+$/.test(v) ? v : ""; };
  var rep = clean(p.get("rep"), 20).toUpperCase(), cap = clean(p.get("cap"), 24);
  if (!rep && !cap) return;
  var tag = [rep ? "Rep code " + rep : "", cap ? "Capsule " + cap : ""].filter(Boolean).join(" · ");
  var ob = document.getElementById("order_by");
  if (ob && rep) { var o = document.createElement("option"); o.textContent = "Rep code " + rep; ob.appendChild(o); ob.value = o.value; }
  if (typeof buildSummary === "function") {
    var orig = buildSummary;
    buildSummary = function () { var l = orig.apply(this, arguments); if (l && l.length) l.push("Credited to: " + tag); return l; };
  }
  var bn = document.getElementById("business_name"), fs = bn && bn.closest("fieldset");
  if (fs) {
    var n = document.createElement("div");
    n.style.cssText = "margin:10px 0 0;padding:8px 12px;border:1px dashed #b8a9d9;border-radius:8px;font-size:13px;color:#5b4a8b";
    n.textContent = (rep ? "This order will be credited to your sales rep (code " + rep + ")." : "This order came from a curated capsule.") + (cap ? " Capsule reference " + cap + "." : "");
    fs.appendChild(n);
  }
})();
