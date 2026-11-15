
const c = window.ALAOUI_CONFIG || {};

const ready = !!(
  c.SUPABASE_URL &&
  c.SUPABASE_URL.startsWith("https://") &&
  c.SUPABASE_ANON_KEY &&
  c.SUPABASE_ANON_KEY.length > 20
);

const db = ready
  ? supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY)
  : null;

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, x => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[x]));

async function run() {
  const products = document.querySelector("#products");
  const photos = document.querySelector("#photos");

  if (!db) {
    products.textContent = "تعذر الاتصال بقاعدة البيانات.";
    return;
  }

  try {
    const [settingsResult, productsResult, galleryResult] =
      await Promise.all([
        db.from("shop_settings").select("*").eq("id", 1).maybeSingle(),
        db.from("products").select("*").eq("active", true),
        db.from("gallery")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("id", { ascending: false })
      ]);

    if (productsResult.error) throw productsResult.error;

    let orders = "";

    if (settingsResult.data) {
      const settings = settingsResult.data;

      document.querySelector("#address").textContent =
        settings.address || "";

      const booking = (settings.whatsapp || "").replace(/\D/g, "");
      orders = (settings.phone || "").replace(/\D/g, "");

      const bookingLink = document.querySelector("#wa");
      const orderLink = document.querySelector("#orderWa");

      if (bookingLink) {
        bookingLink.href = booking
          ? "https://wa.me/" + booking +
            "?text=" + encodeURIComponent(
              "السلام عليكم، بغيت نحجز طاولة في Alaoui Shop."
            )
          : "#";
      }

      if (orderLink) {
        orderLink.href = orders
          ? "https://wa.me/" + orders +
            "?text=" + encodeURIComponent(
              "السلام عليكم، بغيت ندير طلبية من Alaoui Shop."
            )
          : "#";
      }
    }

    const items = productsResult.data || [];

    products.innerHTML = items.map(p => {
      const orderText =
        "السلام عليكم، بغيت نطلب هاد المنتج من Alaoui Shop:\n" +
        "المنتج: " + p.name + "\n" +
        "الثمن: " + p.price;

      const orderUrl = orders
        ? "https://wa.me/" + orders +
          "?text=" + encodeURIComponent(orderText)
        : "#";

      return `
        <article>
          ${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}">` : ""}
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.description)}</p>
          <strong>${esc(p.price)}</strong>
          ${
            orders
              ? `<a class="btn" href="${orderUrl}" target="_blank" rel="noopener">اطلب عبر واتساب</a>`
              : `<p>رقم الطلبات غير متوفر حالياً</p>`
          }
        </article>
      `;
    }).join("") || "المنتجات قيد التحضير";

    if (galleryResult.error) {
      console.error("Gallery error:", galleryResult.error);
    } else {
      photos.innerHTML = (galleryResult.data || []).map(p =>
        `<img src="${esc(p.image_url)}" alt="صورة المحل">`
      ).join("");
    }

  } catch (error) {
    console.error("Shop loading error:", error);
    products.textContent = "وقع مشكل في تحميل القائمة. المرجو المحاولة لاحقاً.";
  }
}

run();
