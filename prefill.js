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
  function go() { note.scrollIntoView({ block: "center" }); }
  if (document.readyState === "complete") setTimeout(go, 200); else window.addEventListener("load", function () { setTimeout(go, 200); });
  setTimeout(go, 1500);
})();
