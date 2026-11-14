
const c = window.ALAOUI_CONFIG || {};
const ready = !!(c.SUPABASE_URL && c.SUPABASE_URL.startsWith("https://") && c.SUPABASE_ANON_KEY && c.SUPABASE_ANON_KEY.length > 20);
const db = ready ? supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY) : null;

const esc = s => String(s ?? "").replace(/[&<>"]/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]));

async function run() {
  if (!db) return;

  const [a, b, g] = await Promise.all([
    db.from("shop_settings").select("*").eq("id", 1).maybeSingle(),
    db.from("products").select("*").eq("active", true).order("sort_order"),
    db.from("gallery").select("*").eq("active", true)
  ]);

  if (a.data) {
    document.querySelector("#address").textContent = a.data.address || "";

    const booking = (a.data.whatsapp || "").replace(/\D/g, "");
    const orders = (a.data.phone || "").replace(/\D/g, "");

    const bookingLink = document.querySelector("#wa");
    const orderLink = document.querySelector("#orderWa");

    if (bookingLink) {
      bookingLink.href = booking
        ? "https://wa.me/" + booking + "?text=" + encodeURIComponent("السلام عليكم، بغيت نحجز طاولة في Alaoui Shop.")
        : "#";
    }

    if (orderLink) {
      orderLink.href = orders
        ? "https://wa.me/" + orders + "?text=" + encodeURIComponent("السلام عليكم، بغيت ندير طلبية من Alaoui Shop.")
        : "#";
    }
  }

  document.querySelector("#products").innerHTML = (b.data || []).map(p =>
    `<article>${p.image_url ? `<img src="${esc(p.image_url)}">` : ""}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><strong>${esc(p.price)}</strong></article>`
  ).join("") || "القائمة قيد التحضير";

  document.querySelector("#photos").innerHTML = (g.data || []).map(p =>
    `<img src="${esc(p.image_url)}">`
  ).join("");
}

run().catch(console.error);
