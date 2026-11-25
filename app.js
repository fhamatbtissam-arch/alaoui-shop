
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
    ? "https://wa.me/" + orders + "?text=" + encodeURIComponent(orderText)
    : "#";

  return `
    <article>
      ${p.image_url ? `
        <img
          class="menu-photo"
          src="${esc(p.image_url)}"
          alt="${esc(p.name)}"
          loading="lazy"
          style="cursor:zoom-in"
        >
      ` : ""}
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

// تكبير الصور داخل الموقع
function showImageViewer(src, alt = "صورة") {
  if (!src) return;

  let viewer = document.getElementById("imageViewer");

  if (!viewer) {
    viewer = document.createElement("div");
    viewer.id = "imageViewer";

    viewer.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,0.92);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
    `;

    viewer.innerHTML = `
      <button
        type="button"
        id="closeImageViewer"
        aria-label="إغلاق الصورة"
        style="
          position:absolute;
          top:15px;
          right:18px;
          width:45px;
          height:45px;
          border:0;
          border-radius:50%;
          background:#c9a34a;
          color:#24080d;
          font-size:30px;
          cursor:pointer;
        "
      >×</button>

      <img
        id="viewerImage"
        alt=""
        style="
          max-width:100%;
          max-height:85vh;
          object-fit:contain;
          border-radius:8px;
        "
      >
    `;

    document.body.appendChild(viewer);

    viewer.addEventListener("click", function(e) {
      if (
        e.target === viewer ||
        e.target.id === "closeImageViewer"
      ) {
        viewer.remove();
      }
    });
  }

  const viewerImage = document.getElementById("viewerImage");
  viewerImage.src = src;
  viewerImage.alt = alt;

  document.getElementById("closeImageViewer").focus();
}

// إغلاق الصورة بزر Escape
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    document.getElementById("imageViewer")?.remove();
  }
});

async function run() {
  const products = document.querySelector("#products");
  const drinksProducts = document.querySelector("#drinksProducts");
  const storeProducts = document.querySelector("#storeProducts");
  const photos = document.querySelector("#photos");

  if (!db) {
    if (products) products.textContent = "تعذر الاتصال بقاعدة البيانات.";
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

      const address = document.querySelector("#address");
      if (address) {
        address.textContent = settings.address || "";
      }

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
    if (products) {
      products.innerHTML = (productsResult.data || [])
        .map(p => productCard(p, orders))
        .join("") || "قائمة الطعام قيد التحضير";
    }

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
        p.image_url ? `
          <img
            class="gallery-photo"
            src="${esc(p.image_url)}"
            alt="صورة المحل"
            loading="lazy"
            style="cursor:zoom-in"
          >
        ` : ""
      ).join("");
    }

  } catch (error) {
    console.error("Shop loading error:", error);

    if (products) {
      products.textContent = "وقع مشكل في تحميل القائمة. المرجو المحاولة لاحقاً.";
    }

    if (drinksProducts) {
      drinksProducts.textContent = "وقع مشكل في تحميل المشروبات.";
    }

    if (storeProducts) {
      storeProducts.textContent = "وقع مشكل في تحميل المتجر.";
    }
  }
}

// الضغط على صور الطعام والمشروبات والمتجر والمعرض
document.addEventListener("click", function(e) {
  const photo = e.target.closest(".menu-photo, .gallery-photo, #photos img");

  if (!photo) return;

  showImageViewer(
    photo.currentSrc || photo.src,
    photo.alt
  );
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
      reviewsCount.textContent = reviews.length + " تقييم منشور";
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

    if (button) button.disabled = true;

    if (reviewMessage) {
      reviewMessage.textContent = "جاري إرسال التقييم...";
    }

    try {
      if (!db) throw new Error("تعذر الاتصال بقاعدة البيانات.");

      const { error } = await db.from("reviews").insert({
        customer_name: document.getElementById("reviewName").value.trim(),
        rating: Number(document.getElementById("reviewRating").value),
        comment: document.getElementById("reviewComment").value.trim(),
        approved: false
      });

      if (error) throw error;

      if (reviewMessage) {
        reviewMessage.textContent =
          "شكراً على تقييمك! غادي يظهر من بعد المراجعة ❤️";
      }

      reviewForm.reset();

    } catch (error) {
      if (reviewMessage) {
        reviewMessage.textContent = "وقع خطأ: " + error.message;
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
}

loadReviews();
