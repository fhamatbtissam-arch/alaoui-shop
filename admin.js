
const c = window.ALAOUI_CONFIG || {};

const ready = !!(
  c.SUPABASE_URL &&
  c.SUPABASE_URL.startsWith("https://") &&
  c.SUPABASE_ANON_KEY &&
  c.SUPABASE_ANON_KEY.length > 20
);

const db = ready ? supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);

const esc = s => String(s ?? "").replace(/[&<>"']/g, x => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;",
  '"': "&quot;", "'": "&#39;"
}[x]));

function showMsg(message) {
  $("msg").textContent = message;
}

async function init() {
  if (!db) {
    showMsg("تحقق من إعدادات Supabase.");
    return;
  }

  const { data, error } = await db.auth.getSession();
  if (error) showMsg(error.message);
  if (data?.session) show();
}

function show() {
  $("login").hidden = true;
  $("dash").hidden = false;
  load();
  loadSettings();
}

$("loginform").onsubmit = async e => {
  e.preventDefault();

  const { error } = await db.auth.signInWithPassword({
    email: $("email").value,
    password: $("password").value
  });

  showMsg(error ? error.message : "");
  if (!error) show();
};

$("logout").onclick = async () => {
  await db.auth.signOut();
  location.reload();
};

async function loadSettings() {
  const { data, error } = await db
    .from("shop_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    $("settingsmsg").textContent = error.message;
    return;
  }

  if (data) {
    $("shopaddress").value = data.address || "";
    $("bookingphone").value = data.whatsapp || "";
    $("orderphone").value = data.phone || "";
  }
}

$("settingsform").onsubmit = async e => {
  e.preventDefault();

  const { error } = await db.from("shop_settings").update({
    address: $("shopaddress").value.trim(),
    whatsapp: $("bookingphone").value.trim(),
    phone: $("orderphone").value.trim()
  }).eq("id", 1);

  $("settingsmsg").textContent = error
    ? "فشل الحفظ: " + error.message
    : "تم حفظ إعدادات المحل بنجاح.";
};

async function uploadProductImage(file) {
  if (!file) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = "products/" + Date.now() + "-" + safeName;

  const { error } = await db.storage
    .from("shop-images")
    .upload(path, file);

  if (error) throw error;

  const { data } = db.storage
    .from("shop-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

$("productform").onsubmit = async e => {
  e.preventDefault();

  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  button.disabled = true;
  showMsg("جاري إضافة المنتج والصورة...");

  try {
    const name = $("name").value.trim();
    const description = $("desc").value.trim();
    const price = $("price").value.trim();
    const file = $("productImage").files[0];

    let image_url = null;

    if (file) {
      image_url = await uploadProductImage(file);
    }

    const { error } = await db.from("products").insert({
      name,
      description,
      price,
      image_url,
      active: true
    });

    if (error) throw error;

    showMsg("تمت إضافة المنتج والصورة بنجاح ❤️");
    e.target.reset();
    await load();

  } catch (error) {
    showMsg("وقع خطأ: " + error.message);
  } finally {
    button.disabled = false;
  }
};

async function load() {
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    $("list").textContent = error.message;
    return;
  }

  $("list").innerHTML = (data || []).map(p => `
    <article>
      ${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" style="width:100px;height:100px;object-fit:cover">` : ""}
      <p><strong>${esc(p.name)}</strong> — ${esc(p.price)}</p>
      <button type="button" data-edit="${esc(p.id)}">تعديل</button>
      <button type="button" data-delete="${esc(p.id)}">حذف</button>
    </article>
  `).join("") || "لا توجد منتجات";
}

$("list").addEventListener("click", async e => {
  const edit = e.target.closest("[data-edit]");
  const del = e.target.closest("[data-delete]");

  if (edit) {
    const id = edit.dataset.edit;

    const { data, error } = await db
      .from("products").select("*").eq("id", id).single();

    if (error) {
      showMsg(error.message);
      return;
    }

    const name = prompt("اسم المنتج:", data.name || "");
    if (name === null) return;

    const description = prompt("وصف المنتج:", data.description || "");
    if (description === null) return;

    const price = prompt("ثمن المنتج:", data.price || "");
    if (price === null) return;

    const { error: updateError } = await db
      .from("products")
      .update({ name, description, price })
      .eq("id", id);

    showMsg(updateError ? updateError.message : "تم تعديل المنتج بنجاح");
    await load();
  }

  if (del) {
    const id = del.dataset.delete;

    if (!confirm("واش متأكد بغيتي تحذف هاد المنتج؟")) return;

    const { error } = await db
      .from("products")
      .delete()
      .eq("id", id);

    showMsg(error ? error.message : "تم حذف المنتج");
    await load();
  }
});

$("images").onchange = async e => {
  const files = Array.from(e.target.files || []);

  for (const file of files) {
    try {
      const image_url = await uploadProductImage(file);

      const { error } = await db.from("gallery").insert({
        image_url
      });

      if (error) throw error;

    } catch (error) {
      showMsg("خطأ في رفع الصورة: " + error.message);
      return;
    }
  }

  showMsg("تم رفع الصور بنجاح");
  e.target.value = "";
};

init();
