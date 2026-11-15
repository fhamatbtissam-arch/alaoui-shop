
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

function galleryMessage(message) {
  $("galleryMessage").textContent = message;
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
  loadGallery();
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

async function removeStoredImage(imageUrl) {
  if (!imageUrl) return;

  const url = new URL(imageUrl);
  const marker = "/shop-images/";
  const position = url.pathname.indexOf(marker);

  if (position === -1) return;

  const path = decodeURIComponent(
    url.pathname.substring(position + marker.length)
  );

  const { error } = await db.storage
    .from("shop-images")
    .remove([path]);

  if (error) throw error;
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
    if (file) image_url = await uploadProductImage(file);

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

async function loadGallery() {
  const list = $("galleryList");
  if (!list) return;

  list.textContent = "جاري تحميل الصور...";

  const { data, error } = await db
    .from("gallery")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    list.textContent = "تعذر تحميل الصور: " + error.message;
    return;
  }

  if (!data || data.length === 0) {
    list.textContent = "لا توجد صور في المعرض حاليا.";
    return;
  }

  list.innerHTML = data.map(item => `
    <article style="display:inline-block;vertical-align:top;margin:10px;padding:8px;border:1px solid #ccc">
      <img src="${esc(item.image_url)}" alt="صورة المعرض"
        style="width:130px;height:110px;object-fit:cover;display:block">

      <input type="file" accept="image/*"
        data-gallery-file="${esc(item.id)}"
        style="display:block;width:140px;margin:8px 0">

      <button type="button" data-gallery-replace="${esc(item.id)}">
        تغيير الصورة
      </button>

      <button type="button" data-gallery-delete="${esc(item.id)}">
        حذف الصورة
      </button>
    </article>
  `).join("");
}

$("galleryList").addEventListener("click", async e => {
  const replace = e.target.closest("[data-gallery-replace]");
  const del = e.target.closest("[data-gallery-delete]");

  if (replace) {
    const id = replace.dataset.galleryReplace;
    const card = replace.closest("article");
    const fileInput = card.querySelector("[data-gallery-file]");
    const file = fileInput.files[0];

    if (!file) {
      galleryMessage("اختار صورة جديدة أولا.");
      return;
    }

    if (!confirm("واش متأكد بغيتي تبدل هاد الصورة؟")) return;

    replace.disabled = true;
    galleryMessage("جاري تغيير الصورة...");

    try {
      const { data: oldData, error: readError } = await db
        .from("gallery")
        .select("image_url")
        .eq("id", id)
        .single();

      if (readError) throw readError;

      const newUrl = await uploadProductImage(file);

      const { error: updateError } = await db
        .from("gallery")
        .update({ image_url: newUrl })
        .eq("id", id);

      if (updateError) {
        try {
          await removeStoredImage(newUrl);
        } catch (_) {}
        throw updateError;
      }

      try {
        await removeStoredImage(oldData.image_url);
      } catch (storageError) {
        galleryMessage("تبدلات الصورة بنجاح، ولكن الملف القديم بقى فالتخزين.");
        await loadGallery();
        return;
      }

      galleryMessage("تم تغيير الصورة بنجاح ❤️");
      await loadGallery();

    } catch (error) {
      galleryMessage("وقع خطأ: " + error.message);
      replace.disabled = false;
    }
  }

  if (del) {
    const id = del.dataset.galleryDelete;

    if (!confirm("واش متأكد بغيتي تحذف هاد الصورة من المعرض؟")) return;

    del.disabled = true;
    galleryMessage("جاري حذف الصورة...");

    try {
      const { data, error } = await db
        .from("gallery")
        .select("image_url")
        .eq("id", id)
        .single();

      if (error) throw error;

      const { error: deleteError } = await db
        .from("gallery")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      try {
        await removeStoredImage(data.image_url);
      } catch (_) {
        galleryMessage("تحيدات الصورة من المعرض، ولكن الملف بقى فالتخزين.");
        await loadGallery();
        return;
      }

      galleryMessage("تم حذف الصورة بنجاح ❤️");
      await loadGallery();

    } catch (error) {
      galleryMessage("وقع خطأ: " + error.message);
      del.disabled = false;
    }
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
      galleryMessage("خطأ في رفع الصورة: " + error.message);
      return;
    }
  }

  galleryMessage("تم رفع الصور بنجاح");
  e.target.value = "";
  await loadGallery();
};

init();
