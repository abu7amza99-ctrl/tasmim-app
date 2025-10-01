const LS_KEY = "my_design_sections_v1";
const LS_COLORS = "my_design_colors_v1";
const LS_THEME = "my_design_theme_v1";
const MASTER = "1234";

let sections = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
const sidebar = document.getElementById("sidebar");
const sectionsList = document.getElementById("sectionsList");
const main = document.getElementById("main");
const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const welcome = document.getElementById("welcome");
const toggleSidebar = document.getElementById("toggleSidebar");
const searchInput = document.getElementById("searchInput");

// viewer
const viewer = document.getElementById("viewer");
const viewerTitle = document.getElementById("viewerTitle");
const viewerBody = document.getElementById("viewerBody");
const closeViewer = document.getElementById("closeViewer");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

// admin modals & controls
const adminBtn = document.getElementById("adminBtn");
const loginModal = document.getElementById("loginModal");
const adminModal = document.getElementById("adminModal");
const adminPassword = document.getElementById("adminPassword");
const loginBtn = document.getElementById("loginBtn");
const closeLogin = document.getElementById("closeLogin");
const closeAdmin = document.getElementById("closeAdmin");

// admin controls
const newSectionName = document.getElementById("newSectionName");
const addSectionBtn = document.getElementById("addSectionBtn");
const editSectionSelect = document.getElementById("editSectionSelect");
const renameSectionInput = document.getElementById("renameSectionInput");
const renameSectionBtn = document.getElementById("renameSectionBtn");
const deleteSectionBtn = document.getElementById("deleteSectionBtn");

const fileSectionSelect = document.getElementById("fileSectionSelect");
const fileNameInput = document.getElementById("fileNameInput");
const fileUrlInput = document.getElementById("fileUrlInput");
const fileUploadInput = document.getElementById("fileUploadInput");
const fileTypeSelect = document.getElementById("fileTypeSelect");
const saveFileBtn = document.getElementById("saveFileBtn");
const clearUploads = document.getElementById("clearUploads");
const sectionFilesList = document.getElementById("sectionFilesList");

const headerColor = document.getElementById("headerColor");
const textColor = document.getElementById("textColor");
const bgColor = document.getElementById("bgColor");
const saveColors = document.getElementById("saveColors");
const themeSelect = document.getElementById("themeSelect");
const themePreview = document.getElementById("themePreview");
const saveTheme = document.getElementById("saveTheme");

// helpers
function persist(){ localStorage.setItem(LS_KEY, JSON.stringify(sections)); }
function applyColors(obj){
  if(!obj) return;
  if(obj.header) document.documentElement.style.setProperty("--header", obj.header);
  if(obj.text) document.documentElement.style.setProperty("--text", obj.text);
  if(obj.bg) document.documentElement.style.setProperty("--bg", obj.bg);
}
function loadColors(){ const c = JSON.parse(localStorage.getItem(LS_COLORS)||"null"); if(c) applyColors(c); }
function loadTheme(){ const t = localStorage.getItem(LS_THEME); if(t) document.body.setAttribute("data-theme", t); }

// welcome
startBtn?.addEventListener("click", ()=>{ welcome.style.display="none"; });
skipBtn?.addEventListener("click", ()=>{ welcome.style.display="none"; });
setTimeout(()=>{ if(welcome) welcome.style.display="none"; },5000);

// sidebar toggle
toggleSidebar?.addEventListener("click", ()=>{
  const hidden = sidebar.getAttribute("aria-hidden")==="true";
  sidebar.setAttribute("aria-hidden", hidden ? "false":"true");
});

// render lists
function renderSectionsList(){
  sectionsList.innerHTML=""; editSectionSelect.innerHTML=""; fileSectionSelect.innerHTML="";
  const keys = Object.keys(sections);
  if(keys.length===0){ sectionsList.innerHTML = "<li>لا توجد أقسام بعد</li>"; }
  keys.forEach(k=>{
    const li = document.createElement("li"); li.textContent = k; li.addEventListener("click", ()=>showSection(k)); sectionsList.appendChild(li);
    editSectionSelect.appendChild(new Option(k,k)); fileSectionSelect.appendChild(new Option(k,k));
  });
  updateSectionFilesList(fileSectionSelect.value);
}

// show section
function showSection(name){
  main.innerHTML="";
  if(!sections[name] || sections[name].length===0){ main.innerHTML = `<p class="placeholder">لا توجد ملفات في ${name}</p>`; return; }
  const grid = document.createElement("div"); grid.className="grid";
  sections[name].forEach(f=>{
    const c = document.createElement("div"); c.className="card";
    if(f.type==="image"){ c.innerHTML = `<img src="${f.url}" alt="${f.name}"><p>${f.name}</p>`; c.addEventListener("click", ()=>openViewer(f)); }
    else { c.innerHTML = `<p>📄 ${f.name}</p>`; c.addEventListener("click", ()=>openViewer(f)); }
    grid.appendChild(c);
  });
  main.appendChild(grid);
}

// viewer
function openViewer(file){
  viewer.setAttribute("aria-hidden","false");
  viewerTitle.textContent = file.name;
  viewerBody.innerHTML = "";
  if(file.type==="image"){ const img = document.createElement("img"); img.src=file.url; img.style.maxWidth="100%"; viewerBody.appendChild(img); }
  else { const p = document.createElement("p"); p.textContent = file.name; viewerBody.appendChild(p); }
  downloadBtn.onclick = ()=>{ const a=document.createElement("a"); a.href=file.url; a.download=file.name||"file"; a.click(); };
  copyBtn.onclick = ()=>{ navigator.clipboard.writeText(file.url); alert("تم نسخ الرابط"); };
}
closeViewer.addEventListener("click", ()=> viewer.setAttribute("aria-hidden","true"));

// admin open/close & auth
adminBtn.addEventListener("click", ()=> loginModal.removeAttribute("aria-hidden"));
closeLogin.addEventListener("click", ()=> loginModal.setAttribute("aria-hidden","true"));
loginBtn.addEventListener("click", ()=>{
  if(adminPassword.value===MASTER){ loginModal.setAttribute("aria-hidden","true"); adminModal.removeAttribute("aria-hidden"); adminPassword.value=""; renderSectionsList(); }
  else { document.getElementById("loginError").textContent = "❌ كلمة المرور غير صحيحة"; }
});
closeAdmin.addEventListener("click", ()=> adminModal.setAttribute("aria-hidden","true"));

// sections CRUD
addSectionBtn.addEventListener("click", ()=>{
  const n = (newSectionName.value||"").trim(); if(!n) return;
  if(!sections[n]) sections[n]=[];
  newSectionName.value=""; persist(); renderSectionsList();
});
renameSectionBtn.addEventListener("click", ()=>{
  const oldName = editSectionSelect.value; const newName = (renameSectionInput.value||"").trim(); if(!oldName || !newName) return;
  if(sections[newName]) return alert("اسم موجود مسبقاً");
  sections[newName]=sections[oldName]; delete sections[oldName]; persist(); renderSectionsList(); renameSectionInput.value="";
});
deleteSectionBtn.addEventListener("click", ()=>{
  const sec = editSectionSelect.value; if(!sec) return;
  if(!confirm(`هل تريد حذف القسم "${sec}"؟`)) return;
  delete sections[sec]; persist(); renderSectionsList(); main.innerHTML='<p class="placeholder">اختر قسماً من القائمة</p>';
});

// files: helper to read file -> dataURL
function fileToDataURL(file, cb){
  const r = new FileReader();
  r.onload = ()=> cb(r.result);
  r.readAsDataURL(file);
}

// save file (upload or url)
saveFileBtn.addEventListener("click", ()=>{
  const sec = fileSectionSelect.value; if(!sec) { alert("اختر قسم"); return; }
  const name = (fileNameInput.value||"").trim() || "ملف بدون اسم";
  const type = fileTypeSelect.value;
  if(fileUploadInput.files && fileUploadInput.files.length>0){
    const file = fileUploadInput.files[0];
    fileToDataURL(file, data=>{
      sections[sec].push({ name, url: data, type });
      persist(); updateSectionFilesList(sec); fileNameInput.value=""; fileUrlInput.value=""; fileUploadInput.value="";
      if(getCurrentSectionName()===sec) showSection(sec);
    });
    return;
  }
  const url = (fileUrlInput.value||"").trim();
  if(!url){ alert("أدخل رابطاً أو ارفع ملفاً"); return; }
  sections[sec].push({ name, url, type });
  persist(); updateSectionFilesList(sec); fileNameInput.value=""; fileUrlInput.value=""; fileUploadInput.value="";
  if(getCurrentSectionName()===sec) showSection(sec);
});

clearUploads.addEventListener("click", ()=>{ fileNameInput.value=""; fileUrlInput.value=""; fileUploadInput.value=""; });

// update files list in admin
function updateSectionFilesList(section){
  sectionFilesList.innerHTML = "";
  if(!section || !sections[section]) return;
  sections[section].forEach((f, idx)=>{
    const row = document.createElement("div"); row.className="file-row";
    const left = document.createElement("div"); left.textContent = `${f.name} (${f.type})`;
    const right = document.createElement("div");
    const edit = document.createElement("button"); edit.className="btn"; edit.textContent="✏️";
    edit.onclick = ()=>{ const nn = prompt("اسم جديد:", f.name); if(nn){ f.name = nn; persist(); updateSectionFilesList(section); if(getCurrentSectionName()===section) showSection(section); } };
    const del = document.createElement("button"); del.className="btn danger"; del.textContent="🗑";
    del.onclick = ()=>{ if(confirm("حذف الملف؟")){ sections[section].splice(idx,1); persist(); updateSectionFilesList(section); if(getCurrentSectionName()===section) showSection(section); } };
    right.append(edit, del); row.append(left, right); sectionFilesList.appendChild(row);
  });
}

// keep track of current shown section
let currentSection = null;
function getCurrentSectionName(){ return currentSection; }

// when clicking a section in list
function showSection(name){
  currentSection = name;
  showSectionContent(name);
}
function showSectionContent(name){
  main.innerHTML=""; if(!sections[name] || sections[name].length===0){ main.innerHTML = `<p class="placeholder">لا توجد ملفات في ${name}</p>`; return; }
  const grid = document.createElement("div"); grid.className="grid";
  sections[name].forEach(f=>{
    const card = document.createElement("div"); card.className="card";
    if(f.type==="image"){ card.innerHTML = `<img src="${f.url}" alt="${f.name}"><p>${f.name}</p>`; card.addEventListener("click", ()=>openViewer(f)); }
    else { card.innerHTML = `<p>📄 ${f.name}</p>`; card.addEventListener("click", ()=>openViewer(f)); }
    grid.appendChild(card);
  });
  main.appendChild(grid);
}

// search (sections + files)
searchInput.addEventListener("input", ()=>{
  const q = (searchInput.value||"").toLowerCase().trim();
  if(!q){ main.innerHTML = `<p class="placeholder">اختر قسماً من القائمة أو أضف جديداً من لوحة التحكم ✨</p>`; return; }
  const results = [];
  Object.keys(sections).forEach(sec=>{
    if(sec.toLowerCase().includes(q)) results.push({ name: sec, type: "section" });
    sections[sec].forEach(f=>{ if(f.name.toLowerCase().includes(q)) results.push(Object.assign({}, f, { section: sec })); });
  });
  if(results.length===0){ main.innerHTML = `<p class="placeholder">❌ لا توجد نتائج</p>`; return; }
  const grid = document.createElement("div"); grid.className="grid";
  results.forEach(item=>{
    const c = document.createElement("div"); c.className="card";
    if(item.type==="image"){ c.innerHTML = `<img src="${item.url}" alt="${item.name}"><p>${item.name}</p><small>${item.section?item.section:"النتيجة"}</small>`; c.addEventListener("click", ()=>openViewer(item)); }
    else if(item.type==="section"){ c.innerHTML = `<p>📁 ${item.name}</p>`; c.addEventListener("click", ()=>{ showSection(item.name); sidebar.setAttribute("aria-hidden","true"); }); }
    else{ c.innerHTML = `<p>📄 ${item.name}</p><small>${item.section?item.section:""}</small>`; c.addEventListener("click", ()=>openViewer(item)); }
    grid.appendChild(c);
  });
  main.innerHTML=""; main.appendChild(grid);
});

// colors & themes
saveColors.addEventListener("click", ()=>{
  const obj = { header: headerColor.value, text: textColor.value, bg: bgColor.value };
  localStorage.setItem(LS_COLORS, JSON.stringify(obj)); applyColors(obj); alert("✅ تم حفظ الألوان");
});
themeSelect.addEventListener("change", ()=>{
  const v = themeSelect.value;
  if(!v){ themePreview.textContent = "معاينة"; themePreview.style.background=""; themePreview.style.color=""; return; }
  const map = { dark:{bg:"#111",color:"#eee"}, light:{bg:"#fff",color:"#111"}, blue:{bg:"#e8f4ff",color:"#072b61"}, green:{bg:"#eaf6ea",color:"#0b4d2e"}, purple:{bg:"#f5e9ff",color:"#3b0f5a"} };
  const p = map[v]; themePreview.textContent = v; themePreview.style.background = p.bg; themePreview.style.color = p.color;
});
saveTheme.addEventListener("click", ()=>{
  const v = themeSelect.value; if(!v) return alert("اختر ستايل");
  localStorage.setItem(LS_THEME, v); document.body.setAttribute("data-theme", v); alert("✅ تم حفظ الستايل");
});

// initial render
renderSectionsList(); loadColors(); loadTheme(); updateSectionFilesList(fileSectionSelect.value);
