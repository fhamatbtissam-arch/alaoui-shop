
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

function productCard(p, orders) {
  const orderText =
    "السلام عليكم، بغيت نطلب هاد المنتج من Alaoui Shop:\n" +
    "المنتج: " + p.name + "\n" +
    "الثمن: " + (p.price || "");

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
}

async function run() {
  const products = document.querySelector("#products");
  const drinksProducts = document.querySelector("#drinksProducts");
  const storeProducts = document.querySelector("#storeProducts");
  const photos = document.querySelector("#photos");

  if (!db) {
    products.textContent = "تعذر الاتصال بقاعدة البيانات.";
    if (drinksProducts) drinksProducts.textContent = "تعذر الاتصال بقاعدة البيانات.";
    if (storeProducts) storeProducts.textContent = "تعذر الاتصال بقاعدة البيانات.";
    return;
  }

  try {
    const [
      settingsResult,
      productsResult,
      drinksResult,
      storeResult,
      galleryResult
    ] = await Promise.all([
      db.from("shop_settings").select("*").eq("id", 1).maybeSingle(),
      db.from("products").select("*").eq("active", true),
      db.from("drinks").select("*").eq("active", true).order("id", { ascending: false }),
      db.from("store_products").select("*").eq("active", true).order("id", { ascending: false }),
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

    // قائمة الطعام
    products.innerHTML = (productsResult.data || [])
      .map(p => productCard(p, orders))
      .join("") || "قائمة الطعام قيد التحضير";

    // المشروبات
    if (drinksProducts) {
      if (drinksResult.error) {
        console.error("Drinks error:", drinksResult.error);
        drinksProducts.textContent = "تعذر تحميل المشروبات حالياً.";
      } else {
        drinksProducts.innerHTML = (drinksResult.data || [])
          .map(p => productCard(p, orders))
          .join("") || "المشروبات قيد التحضير.";
      }
    }

    // المتجر الإلكتروني
    if (storeProducts) {
      if (storeResult.error) {
        console.error("Store products error:", storeResult.error);
        storeProducts.textContent = "تعذر تحميل منتجات المتجر حالياً.";
      } else {
        storeProducts.innerHTML = (storeResult.data || [])
          .map(p => productCard(p, orders))
          .join("") || "المتجر الإلكتروني قيد التجهيز.";
      }
    }

    // معرض الصور
    if (galleryResult.error) {
      console.error("Gallery error:", galleryResult.error);
    } else if (photos) {
      photos.innerHTML = (galleryResult.data || []).map(p =>
        `<img src="${esc(p.image_url)}" alt="صورة المحل">`
      ).join("");
    }

  } catch (error) {
    console.error("Shop loading error:", error);
    products.textContent = "وقع مشكل في تحميل القائمة. المرجو المحاولة لاحقاً.";

    if (drinksProducts) {
      drinksProducts.textContent = "وقع مشكل في تحميل المشروبات.";
    }

    if (storeProducts) {
      storeProducts.textContent = "وقع مشكل في تحميل المتجر.";
    }
  }
}

// فتح صور المعرض عند الضغط عليها
document.addEventListener("click", function (e) {
  const photo = e.target.closest("#photos img");

  if (!photo) return;

  window.open(photo.src, "_blank");
});

run();

// ===============================
// تقييمات الزبناء والمعدل العام
// ===============================

const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");
const reviewMessage = document.getElementById("reviewMessage");
const reviewsAverage = document.getElementById("reviewsAverage");
const reviewsCount = document.getElementById("reviewsCount");

function reviewEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

async function loadReviews() {
  if (!reviewsList || !db) return;

  reviewsList.textContent = "جاري تحميل التقييمات...";

  const { data, error } = await db
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    reviewsList.textContent = "تعذر تحميل التقييمات.";

    if (reviewsAverage) reviewsAverage.textContent = "-- / 5";
    if (reviewsCount) reviewsCount.textContent = "تعذر حساب التقييمات";

    return;
  }

  const reviews = data || [];

  // حساب المعدل العام
  if (reviews.length > 0) {
    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0), 0
    );

    const average = total / reviews.length;

    if (reviewsAverage) {
      reviewsAverage.textContent = average.toFixed(1) + " / 5";
    }

    if (reviewsCount) {
      reviewsCount.textContent =
        reviews.length + " تقييم منشور";
    }
  } else {
    if (reviewsAverage) reviewsAverage.textContent = "-- / 5";
    if (reviewsCount) reviewsCount.textContent = "لا توجد تقييمات منشورة بعد";
  }

  // عرض التقييمات
  reviewsList.innerHTML = reviews.map(review => `
    <article class="review-card">
      <h3>${reviewEscape(review.customer_name)}</h3>
      <p>${"⭐".repeat(Number(review.rating))}</p>
      <p>${reviewEscape(review.comment)}</p>
    </article>
  `).join("") || "<p>كون أول واحد يشارك رأيو معنا!</p>";
}

if (reviewForm) {
  reviewForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const button = reviewForm.querySelector('button[type="submit"]');
    button.disabled = true;
    reviewMessage.textContent = "جاري إرسال التقييم...";

    try {
      const { error } = await db.from("reviews").insert({
        customer_name: document.getElementById("reviewName").value.trim(),
        rating: Number(document.getElementById("reviewRating").value),
        comment: document.getElementById("reviewComment").value.trim(),
        approved: false
      });

      if (error) throw error;

      reviewMessage.textContent =
        "شكراً على تقييمك! غادي يظهر من بعد المراجعة ❤️";

      reviewForm.reset();

    } catch (error) {
      reviewMessage.textContent = "وقع خطأ: " + error.message;
    } finally {
      button.disabled = false;
    }
  });
}

loadReviews();
