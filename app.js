
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

let currentLanguage = localStorage.getItem("alaoui-language") || "ar";

const translations = {
  ar: {
    navMenu: "🍽️ قائمة الطعام",
    navDrinks: "🥤 المشروبات",
    navStore: "🛍️ المتجر الإلكتروني",
    navGallery: "الصور",
    navContact: "تواصل معنا",
    heroSmall: "قهوة ومأكولات • نكهة مغربية",
    welcome: "مرحبا بكم في",
    heroText: "جلسة زوينة، مذاق أصيل، ومرحبا بالجميع.",
    discoverMenu: "اكتشف قائمة الطعام",
    hello: "مرحبا بكم",
    mainTitle: "الذوق الأصيل كيجمعنا",
    mainText: "اكتشفوا تشكيلتنا من المشروبات والمأكولات واستمتعوا بأجواء مريحة.",
    menuTitle: "🍽️ قائمة الطعام",
    menuText: "اكتشفوا المأكولات ديالنا.",
    drinksTitle: "🥤 المشروبات",
    drinksText: "اكتشفوا تشكيلة المشروبات ديالنا.",
    drinksLoading: "المشروبات قيد التجهيز.",
    storeTitle: "🛍️ المتجر الإلكتروني",
    storeText: "تسوقوا منتجاتنا واطلبوا بسهولة.",
    storeLoading: "المتجر الإلكتروني قيد التجهيز.",
    galleryTitle: "صور المحل",
    contactTitle: "تواصلوا معنا",
    addressDefault: "العنوان سيضاف قريباً",
    booking: "الحجز عبر واتساب",
    order: "الطلب عبر واتساب",
    map: "📍 موقع المحل على Google Maps",
    reviewsTitle: "⭐ آراء وتقييمات زبنائنا",
    reviewsText: "رأيك كيعنينا، شارك معنا تجربتك.",
    averageTitle: "⭐ المعدل العام للتقييمات",
    namePlaceholder: "الاسم ديالك",
    ratingLabel: "التقييم ديالك:",
    rating5: "⭐⭐⭐⭐⭐ ممتاز",
    rating4: "⭐⭐⭐⭐ جيد جداً",
    rating3: "⭐⭐⭐ جيد",
    rating2: "⭐⭐ ضعيف",
    rating1: "⭐ سيئ",
    commentPlaceholder: "كتب لينا رأيك...",
    sendReview: "إرسال التقييم",
    reviewsLoading: "جاري تحميل التقييمات...",
    copyright: "جميع الحقوق محفوظة. يُمنع نسخ أو إعادة استعمال محتوى الموقع دون إذن مسبق من المالك.",
    orderButton: "اطلب عبر واتساب",
    noPhone: "رقم الطلبات غير متوفر حالياً",
    noProducts: "قائمة الطعام قيد التحضير",
    noDrinks: "المشروبات قيد التحضير.",
    noStore: "المتجر الإلكتروني قيد التجهيز.",
    dbError: "تعذر الاتصال بقاعدة البيانات.",
    loadError: "وقع مشكل في تحميل القائمة. المرجو المحاولة لاحقاً.",
    drinksError: "وقع مشكل في تحميل المشروبات.",
    storeError: "وقع مشكل في تحميل المتجر.",
    imageAlt: "صورة المحل",
    closeImage: "إغلاق الصورة",
    reviewLoading: "جاري تحميل التقييمات...",
    reviewError: "تعذر تحميل التقييمات.",
    reviewCount: "تقييم منشور",
    noReviews: "لا توجد تقييمات منشورة بعد",
    firstReview: "كون أول واحد يشارك رأيو معنا!",
    reviewSending: "جاري إرسال التقييم...",
    reviewSuccess: "شكراً على تقييمك! غادي يظهر من بعد المراجعة ❤️",
    reviewSendError: "وقع خطأ: ",
    ratingCountError: "تعذر حساب التقييمات",
    bookingMessage: "السلام عليكم، بغيت نحجز طاولة في Alaoui Shop.",
    orderMessage: "السلام عليكم، بغيت ندير طلبية من Alaoui Shop.",
    productMessage: "السلام عليكم، بغيت نطلب هاد المنتج من Alaoui Shop:",
    productLabel: "المنتج: ",
    priceLabel: "الثمن: "
  },

  fr: {
    navMenu: "🍽️ Menu",
    navDrinks: "🥤 Boissons",
    navStore: "🛍️ Boutique en ligne",
    navGallery: "Photos",
    navContact: "Contactez-nous",
    heroSmall: "Café et cuisine • Saveurs marocaines",
    welcome: "Bienvenue chez",
    heroText: "Un bel endroit, des saveurs authentiques et bienvenue à tous.",
    discoverMenu: "Découvrir le menu",
    hello: "Bienvenue",
    mainTitle: "Le goût authentique nous rassemble",
    mainText: "Découvrez notre sélection de boissons et de plats dans une ambiance agréable.",
    menuTitle: "🍽️ Menu",
    menuText: "Découvrez nos plats.",
    drinksTitle: "🥤 Boissons",
    drinksText: "Découvrez notre sélection de boissons.",
    drinksLoading: "Boissons en préparation.",
    storeTitle: "🛍️ Boutique en ligne",
    storeText: "Découvrez nos produits et commandez facilement.",
    storeLoading: "Boutique en préparation.",
    galleryTitle: "Photos du restaurant",
    contactTitle: "Contactez-nous",
    addressDefault: "Adresse bientôt disponible",
    booking: "Réserver sur WhatsApp",
    order: "Commander sur WhatsApp",
    map: "📍 Emplacement sur Google Maps",
    reviewsTitle: "⭐ Avis de nos clients",
    reviewsText: "Votre avis compte. Partagez votre expérience.",
    averageTitle: "⭐ Note moyenne",
    namePlaceholder: "Votre nom",
    ratingLabel: "Votre note :",
    rating5: "⭐⭐⭐⭐⭐ Excellent",
    rating4: "⭐⭐⭐⭐ Très bien",
    rating3: "⭐⭐⭐ Bien",
    rating2: "⭐⭐ Faible",
    rating1: "⭐ Mauvais",
    commentPlaceholder: "Écrivez votre avis...",
    sendReview: "Envoyer l'avis",
    reviewsLoading: "Chargement des avis...",
    copyright: "Tous droits réservés. Toute copie ou réutilisation du contenu est interdite sans autorisation préalable du propriétaire.",
    orderButton: "Commander sur WhatsApp",
    noPhone: "Numéro de commande indisponible actuellement",
    noProducts: "Menu en préparation",
    noDrinks: "Boissons en préparation.",
    noStore: "Boutique en préparation.",
    dbError: "Impossible de se connecter à la base de données.",
    loadError: "Erreur lors du chargement du menu. Veuillez réessayer.",
    drinksError: "Erreur lors du chargement des boissons.",
    storeError: "Erreur lors du chargement de la boutique.",
    imageAlt: "Photo du restaurant",
    closeImage: "Fermer l'image",
    reviewLoading: "Chargement des avis...",
    reviewError: "Impossible de charger les avis.",
    reviewCount: "avis publiés",
    noReviews: "Aucun avis publié pour le moment",
    firstReview: "Soyez le premier à partager votre avis !",
    reviewSending: "Envoi de votre avis...",
    reviewSuccess: "Merci pour votre avis ! Il sera publié après vérification ❤️",
    reviewSendError: "Une erreur est survenue : ",
    ratingCountError: "Impossible de calculer les avis",
    bookingMessage: "Bonjour, je voudrais réserver une table chez Alaoui Shop.",
    orderMessage: "Bonjour, je voudrais passer une commande chez Alaoui Shop.",
    productMessage: "Bonjour, je voudrais commander ce produit chez Alaoui Shop :",
    productLabel: "Produit : ",
    priceLabel: "Prix : "
  },

  en: {
    navMenu: "🍽️ Food Menu",
    navDrinks: "🥤 Drinks",
    navStore: "🛍️ Online Store",
    navGallery: "Gallery",
    navContact: "Contact Us",
    heroSmall: "Coffee and Food • Moroccan Flavors",
    welcome: "Welcome to",
    heroText: "A lovely place, authentic flavors, and a warm welcome to everyone.",
    discoverMenu: "Discover the Menu",
    hello: "Welcome",
    mainTitle: "Authentic Taste Brings Us Together",
    mainText: "Discover our selection of drinks and dishes in a relaxing atmosphere.",
    menuTitle: "🍽️ Food Menu",
    menuText: "Discover our dishes.",
    drinksTitle: "🥤 Drinks",
    drinksText: "Discover our drinks selection.",
    drinksLoading: "Drinks coming soon.",
    storeTitle: "🛍️ Online Store",
    storeText: "Explore our products and order easily.",
    storeLoading: "Online store coming soon.",
    galleryTitle: "Restaurant Photos",
    contactTitle: "Contact Us",
    addressDefault: "Address coming soon",
    booking: "Book on WhatsApp",
    order: "Order on WhatsApp",
    map: "📍 Find us on Google Maps",
    reviewsTitle: "⭐ Customer Reviews",
    reviewsText: "Your opinion matters. Share your experience.",
    averageTitle: "⭐ Average Rating",
    namePlaceholder: "Your name",
    ratingLabel: "Your rating:",
    rating5: "⭐⭐⭐⭐⭐ Excellent",
    rating4: "⭐⭐⭐⭐ Very Good",
    rating3: "⭐⭐⭐ Good",
    rating2: "⭐⭐ Poor",
    rating1: "⭐ Bad",
    commentPlaceholder: "Write your review...",
    sendReview: "Submit Review",
    reviewsLoading: "Loading reviews...",
    copyright: "All rights reserved. Copying or reusing website content without the owner's prior permission is prohibited.",
    orderButton: "Order on WhatsApp",
    noPhone: "Order phone number is currently unavailable",
    noProducts: "Food menu coming soon",
    noDrinks: "Drinks coming soon.",
    noStore: "Online store coming soon.",
    dbError: "Unable to connect to the database.",
    loadError: "There was a problem loading the menu. Please try again later.",
    drinksError: "There was a problem loading drinks.",
    storeError: "There was a problem loading the store.",
    imageAlt: "Restaurant photo",
    closeImage: "Close image",
    reviewLoading: "Loading reviews...",
    reviewError: "Unable to load reviews.",
    reviewCount: "published reviews",
    noReviews: "No reviews published yet",
    firstReview: "Be the first to share your opinion!",
    reviewSending: "Submitting your review...",
    reviewSuccess: "Thank you for your review! It will appear after moderation ❤️",
    reviewSendError: "An error occurred: ",
    ratingCountError: "Unable to calculate reviews",
    bookingMessage: "Hello, I would like to book a table at Alaoui Shop.",
    orderMessage: "Hello, I would like to place an order at Alaoui Shop.",
    productMessage: "Hello, I would like to order this product from Alaoui Shop:",
    productLabel: "Product: ",
    priceLabel: "Price: "
  },

  es: {
    navMenu: "🍽️ Menú",
    navDrinks: "🥤 Bebidas",
    navStore: "🛍️ Tienda en línea",
    navGallery: "Fotos",
    navContact: "Contáctenos",
    heroSmall: "Café y comida • Sabores marroquíes",
    welcome: "Bienvenidos a",
    heroText: "Un lugar agradable, sabores auténticos y una cálida bienvenida para todos.",
    discoverMenu: "Descubrir el menú",
    hello: "Bienvenidos",
    mainTitle: "El sabor auténtico nos une",
    mainText: "Descubre nuestra selección de bebidas y platos en un ambiente agradable.",
    menuTitle: "🍽️ Menú",
    menuText: "Descubre nuestros platos.",
    drinksTitle: "🥤 Bebidas",
    drinksText: "Descubre nuestra selección de bebidas.",
    drinksLoading: "Bebidas próximamente.",
    storeTitle: "🛍️ Tienda en línea",
    storeText: "Descubre nuestros productos y compra fácilmente.",
    storeLoading: "Tienda en preparación.",
    galleryTitle: "Fotos del restaurante",
    contactTitle: "Contáctenos",
    addressDefault: "Dirección próximamente",
    booking: "Reservar por WhatsApp",
    order: "Pedir por WhatsApp",
    map: "📍 Ubicación en Google Maps",
    reviewsTitle: "⭐ Opiniones de nuestros clientes",
    reviewsText: "Tu opinión nos importa. Comparte tu experiencia.",
    averageTitle: "⭐ Valoración media",
    namePlaceholder: "Tu nombre",
    ratingLabel: "Tu valoración:",
    rating5: "⭐⭐⭐⭐⭐ Excelente",
    rating4: "⭐⭐⭐⭐ Muy bueno",
    rating3: "⭐⭐⭐ Bueno",
    rating2: "⭐⭐ Malo",
    rating1: "⭐ Muy malo",
    commentPlaceholder: "Escribe tu opinión...",
    sendReview: "Enviar opinión",
    reviewsLoading: "Cargando opiniones...",
    copyright: "Todos los derechos reservados. Se prohíbe copiar o reutilizar el contenido sin autorización previa del propietario.",
    orderButton: "Pedir por WhatsApp",
    noPhone: "El número de pedidos no está disponible actualmente",
    noProducts: "Menú en preparación",
    noDrinks: "Bebidas próximamente.",
    noStore: "Tienda en preparación.",
    dbError: "No se pudo conectar con la base de datos.",
    loadError: "Hubo un problema al cargar el menú. Inténtalo más tarde.",
    drinksError: "Hubo un problema al cargar las bebidas.",
    storeError: "Hubo un problema al cargar la tienda.",
    imageAlt: "Foto del restaurante",
    closeImage: "Cerrar imagen",
    reviewLoading: "Cargando opiniones...",
    reviewError: "No se pudieron cargar las opiniones.",
    reviewCount: "opiniones publicadas",
    noReviews: "Todavía no hay opiniones publicadas",
    firstReview: "¡Sé el primero en compartir tu opinión!",
    reviewSending: "Enviando tu opinión...",
    reviewSuccess: "¡Gracias por tu opinión! Aparecerá después de la revisión ❤️",
    reviewSendError: "Ha ocurrido un error: ",
    ratingCountError: "No se pudieron calcular las opiniones",
    bookingMessage: "Hola, quisiera reservar una mesa en Alaoui Shop.",
    orderMessage: "Hola, quisiera hacer un pedido en Alaoui Shop.",
    productMessage: "Hola, quisiera pedir este producto de Alaoui Shop:",
    productLabel: "Producto: ",
    priceLabel: "Precio: "
  }
};

const productTranslations = {
  "بسطيلة بالخضر": {
    fr: "Pastilla aux légumes",
    en: "Vegetable Pastilla",
    es: "Pastela de verduras"
  },
  "كريب الموز ونوتيلا": {
    fr: "Crêpe banane et Nutella",
    en: "Banana and Nutella Crêpe",
    es: "Crepe de plátano y Nutella"
  },
  "بسطيلة بالدجاج": {
    fr: "Pastilla au poulet",
    en: "Chicken Pastilla",
    es: "Pastela de pollo"
  },
  "طاجين باللحم والخضر": {
    fr: "Tajine de viande aux légumes",
    en: "Meat and Vegetable Tagine",
    es: "Tajín de carne con verduras"
  },
  "سلطة مغربية متنوعة": {
    fr: "Salade marocaine variée",
    en: "Mixed Moroccan Salad",
    es: "Ensalada marroquí variada"
  },
  "كسكس مغربي باللحم والخضر": {
    fr: "Couscous marocain à la viande et aux légumes",
    en: "Moroccan Couscous with Meat and Vegetables",
    es: "Cuscús marroquí con carne y verduras"
  },
  "كسكس مغربي بالدجاج": {
    fr: "Couscous marocain au poulet",
    en: "Moroccan Chicken Couscous",
    es: "Cuscús marroquí con pollo"
  },
  "شاي بالنعناع": {
    fr: "Thé à la menthe",
    en: "Moroccan Mint Tea",
    es: "Té marroquí con menta"
  },
  "قهوة كابوتشينو": {
    fr: "Café cappuccino",
    en: "Cappuccino Coffee",
    es: "Café capuchino"
  },
  "عصير الموز الطازج": {
    fr: "Jus de banane frais",
    en: "Fresh Banana Juice",
    es: "Zumo de plátano natural"
  }
};

function tr(key) {
  return translations[currentLanguage]?.[key] ||
    translations.ar[key] ||
    key;
}

function translatedProductName(name) {
  const original = String(name ?? "").trim();
  const translated = productTranslations[original];
  return translated?.[currentLanguage] || original;
}

function setLanguage(language) {
  if (!translations[language]) language = "ar";

  currentLanguage = language;
  localStorage.setItem("alaoui-language", language);

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    const key = element.dataset.i18nPlaceholder;
    if (translations[language][key]) {
      element.placeholder = translations[language][key];
    }
  });

  const selector = document.getElementById("languageSelect");
  if (selector) selector.value = language;

  if (typeof window.renderShopProducts === "function") {
    window.renderShopProducts();
  }

  if (typeof window.loadReviews === "function") {
    window.loadReviews();
  }
}

const languageSelect = document.getElementById("languageSelect");

if (languageSelect) {
  languageSelect.addEventListener("change", e => {
    setLanguage(e.target.value);
  });
}

function productCard(p, orders) {
  const originalName = String(p.name ?? "");
  const displayName = translatedProductName(originalName);

  const orderText =
    tr("productMessage") + "\n" +
    tr("productLabel") + originalName + "\n" +
    tr("priceLabel") + (p.price || "");

  const orderUrl = orders
    ? "https://wa.me/" + orders + "?text=" + encodeURIComponent(orderText)
    : "#";

  return `
    <article>
      ${p.image_url ? `
        <img
          class="menu-photo"
          src="${esc(p.image_url)}"
          alt="${esc(displayName)}"
          loading="lazy"
          style="cursor:zoom-in"
        >
      ` : ""}
      <h3>${esc(displayName)}</h3>
      ${p.description ? `<p>${esc(p.description)}</p>` : ""}
      <strong>${esc(p.price)}</strong>
      ${
        orders
          ? `<a class="btn" href="${orderUrl}" target="_blank" rel="noopener">${esc(tr("orderButton"))}</a>`
          : `<p>${esc(tr("noPhone"))}</p>`
      }
    </article>
  `;
}

// تكبير الصور داخل الموقع
function showImageViewer(src, alt = "Image") {
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
        aria-label="${esc(tr("closeImage"))}"
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

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    document.getElementById("imageViewer")?.remove();
  }
});

let shopData = {
  products: [],
  drinks: [],
  store: []
};

let shopOrders = "";

function renderShopProducts() {
  const products = document.querySelector("#products");
  const drinksProducts = document.querySelector("#drinksProducts");
  const storeProducts = document.querySelector("#storeProducts");

  if (products) {
    products.innerHTML = shopData.products
      .map(p => productCard(p, shopOrders))
      .join("") || esc(tr("noProducts"));
  }

  if (drinksProducts) {
    drinksProducts.innerHTML = shopData.drinks
      .map(p => productCard(p, shopOrders))
      .join("") || esc(tr("noDrinks"));
  }

  if (storeProducts) {
    storeProducts.innerHTML = shopData.store
      .map(p => productCard(p, shopOrders))
      .join("") || esc(tr("noStore"));
  }
}

window.renderShopProducts = renderShopProducts;

async function run() {
  const products = document.querySelector("#products");
  const drinksProducts = document.querySelector("#drinksProducts");
  const storeProducts = document.querySelector("#storeProducts");
  const photos = document.querySelector("#photos");

  if (!db) {
    if (products) products.textContent = tr("dbError");
    if (drinksProducts) drinksProducts.textContent = tr("dbError");
    if (storeProducts) storeProducts.textContent = tr("dbError");
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

    if (settingsResult.data) {
      const settings = settingsResult.data;

      const address = document.querySelector("#address");
      if (address) {
        address.textContent = settings.address || "";
      }

      const booking = (settings.whatsapp || "").replace(/\D/g, "");
      shopOrders = (settings.phone || "").replace(/\D/g, "");

      const bookingLink = document.querySelector("#wa");
      const orderLink = document.querySelector("#orderWa");

      if (bookingLink) {
        bookingLink.href = booking
          ? "https://wa.me/" + booking +
            "?text=" + encodeURIComponent(tr("bookingMessage"))
          : "#";
      }

      if (orderLink) {
        orderLink.href = shopOrders
          ? "https://wa.me/" + shopOrders +
            "?text=" + encodeURIComponent(tr("orderMessage"))
          : "#";
      }
    }

    shopData.products = productsResult.data || [];
    shopData.drinks = drinksResult.error ? [] : (drinksResult.data || []);
    shopData.store = storeResult.error ? [] : (storeResult.data || []);

    if (drinksResult.error) {
      console.error("Drinks error:", drinksResult.error);
      if (drinksProducts) drinksProducts.textContent = tr("drinksError");
    }

    if (storeResult.error) {
      console.error("Store products error:", storeResult.error);
      if (storeProducts) storeProducts.textContent = tr("storeError");
    }

    renderShopProducts();

    if (galleryResult.error) {
      console.error("Gallery error:", galleryResult.error);
    } else if (photos) {
      photos.innerHTML = (galleryResult.data || []).map(p =>
        p.image_url ? `
          <img
            class="gallery-photo"
            src="${esc(p.image_url)}"
            alt="${esc(tr("imageAlt"))}"
            loading="lazy"
            style="cursor:zoom-in"
          >
        ` : ""
      ).join("");
    }

  } catch (error) {
    console.error("Shop loading error:", error);

    if (products) products.textContent = tr("loadError");
    if (drinksProducts) drinksProducts.textContent = tr("drinksError");
    if (storeProducts) storeProducts.textContent = tr("storeError");
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

  reviewsList.textContent = tr("reviewLoading");

  const { data, error } = await db
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    reviewsList.textContent = tr("reviewError");

    if (reviewsAverage) reviewsAverage.textContent = "-- / 5";
    if (reviewsCount) reviewsCount.textContent = tr("ratingCountError");

    return;
  }

  const reviews = data || [];

  if (reviews.length > 0) {
    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0), 0
    );

    const average = total / reviews.length;

    if (reviewsAverage) {
      reviewsAverage.textContent = average.toFixed(1) + " / 5";
    }

    if (reviewsCount) {
      reviewsCount.textContent = reviews.length + " " + tr("reviewCount");
    }
  } else {
    if (reviewsAverage) reviewsAverage.textContent = "-- / 5";
    if (reviewsCount) reviewsCount.textContent = tr("noReviews");
  }

  reviewsList.innerHTML = reviews.map(review => `
    <article class="review-card">
      <h3>${reviewEscape(review.customer_name)}</h3>
      <p>${"⭐".repeat(Number(review.rating))}</p>
      <p>${reviewEscape(review.comment)}</p>
    </article>
  `).join("") || `<p>${esc(tr("firstReview"))}</p>`;
}

window.loadReviews = loadReviews;

if (reviewForm) {
  reviewForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const button = reviewForm.querySelector('button[type="submit"]');

    if (button) button.disabled = true;

    if (reviewMessage) {
      reviewMessage.textContent = tr("reviewSending");
    }

    try {
      if (!db) throw new Error(tr("dbError"));

      const { error } = await db.from("reviews").insert({
        customer_name: document.getElementById("reviewName").value.trim(),
        rating: Number(document.getElementById("reviewRating").value),
        comment: document.getElementById("reviewComment").value.trim(),
        approved: false
      });

      if (error) throw error;

      if (reviewMessage) {
        reviewMessage.textContent = tr("reviewSuccess");
      }

      reviewForm.reset();

    } catch (error) {
      if (reviewMessage) {
        reviewMessage.textContent = tr("reviewSendError") + error.message;
      }
    } finally {
      if (button) button.disabled = false;
    }
  });
}

// تطبيق اللغة المحفوظة
setLanguage(currentLanguage);

// تحميل بيانات الموقع والتقييمات
run();
loadReviews();
