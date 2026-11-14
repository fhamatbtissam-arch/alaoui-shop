
const c=window.ALAOUI_CONFIG||{};
const ready=!!(c.SUPABASE_URL&&c.SUPABASE_URL.startsWith("https://")&&c.SUPABASE_ANON_KEY&&c.SUPABASE_ANON_KEY.length>20);
const db=ready?supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY):null;
const $=x=>document.getElementById(x);
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));

async function init(){
  if(!db){$("msg").textContent="تحقق من إعدادات Supabase.";return;}
  const {data}=await db.auth.getSession();
  if(data.session)show();
}
function show(){
  $("login").hidden=true;
  $("dash").hidden=false;
  load();
  loadSettings();
}
$("loginform").onsubmit=async e=>{
  e.preventDefault();
  const {error}=await db.auth.signInWithPassword({
    email:$("email").value,
    password:$("password").value
  });
  $("msg").textContent=error?error.message:"";
  if(!error)show();
};
$("logout").onclick=async()=>{
  await db.auth.signOut();
  location.reload();
};

async function loadSettings(){
  const {data,error}=await db.from("shop_settings").select("*").eq("id",1).maybeSingle();
  if(error){$("settingsmsg").textContent=error.message;return;}
  if(data){
    $("shopaddress").value=data.address||"";
    $("bookingphone").value=data.whatsapp||"";
    $("orderphone").value=data.phone||"";
  }
}

$("settingsform").onsubmit=async e=>{
  e.preventDefault();
  const {error}=await db.from("shop_settings").update({
    address:$("shopaddress").value.trim(),
    whatsapp:$("bookingphone").value.trim(),
    phone:$("orderphone").value.trim()
  }).eq("id",1);
  $("settingsmsg").textContent=error?"فشل الحفظ: "+error.message:"تم حفظ إعدادات المحل بنجاح.";
};

$("productform").onsubmit=async e=>{
  e.preventDefault();
  const {error}=await db.from("products").insert({
    name:$("name").value,
    description:$("desc").value,
    price:$("price").value,
    active:true
  });
  $("msg").textContent=error?.message||"تمت الإضافة";
  if(!error)e.target.reset();
  load();
};

async function load(){
  const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
  if(error){$("list").textContent=error.message;return;}
  $("list").innerHTML=(data||[]).map(p=>`
    <article>
      <p><strong>${esc(p.name)}</strong> — ${esc(p.price)}</p>
      <button type="button" data-edit="${esc(p.id)}">تعديل</button>
      <button type="button" data-delete="${esc(p.id)}">حذف</button>
    </article>
  `).join("")||"لا توجد منتجات";
}

$("list").addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit]");
  const del=e.target.closest("[data-delete]");

  if(edit){
    const id=edit.dataset.edit;
    const {data,error}=await db.from("products").select("*").eq("id",id).single();
    if(error){$("msg").textContent=error.message;return;}

    const name=prompt("اسم المنتج:",data.name||"");
    if(name===null)return;
    const description=prompt("وصف المنتج:",data.description||"");
    if(description===null)return;
    const price=prompt("ثمن المنتج:",data.price||"");
    if(price===null)return;

    const {error:updateError}=await db.from("products").update({
      name,description,price
    }).eq("id",id);

    $("msg").textContent=updateError?"فشل التعديل: "+updateError.message:"تم تعديل المنتج بنجاح";
    load();
  }

  if(del){
    const id=del.dataset.delete;
    if(!confirm("واش متأكد بغيتي تحذف هاد المنتج؟"))return;

    const {error}=await db.from("products").delete().eq("id",id);
    $("msg").textContent=error?"فشل الحذف: "+error.message:"تم حذف المنتج";
    load();
  }
});

$("images").onchange=async e=>{
  for(const f of e.target.files){
    const path=Date.now()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const {error}=await db.storage.from("shop-images").upload(path,f);
    if(error){$("msg").textContent=error.message;continue;}
    const u=db.storage.from("shop-images").getPublicUrl(path).data.publicUrl;
    const {error:insertError}=await db.from("gallery").insert({image_url:u,storage_path:path});
    if(insertError)$("msg").textContent=insertError.message;
  }
  $("msg").textContent="تم رفع الصور";
};

init();
