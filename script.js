/* ------------- script.js (كامل) ------------- */
document.addEventListener('DOMContentLoaded', () => {
  // عناصر عامة
  const startBtn = document.getElementById('start-btn');
  const welcome = document.getElementById('welcome-screen');
  const sideMenu = document.getElementById('side-menu');
  const sideBtn = document.getElementById('side-menu-btn');
  const closeSide = document.getElementById('close-side');
  const menuItems = document.querySelectorAll('#side-menu li');
  const sections = document.querySelectorAll('.app-section');

  // لوحة التحكم
  const controlPanel = document.getElementById('control-panel');
  const settingsBtn = document.getElementById('settings-btn');
  const closePanel = document.getElementById('close-panel');
  const loginArea = document.getElementById('login-area');
  const panelOptions = document.getElementById('panel-options');
  const panelLogin = document.getElementById('panel-login');
  const panelPassword = document.getElementById('panel-password');
  const savePasswordBtn = document.getElementById('save-password');
  const newPasswordInput = document.getElementById('new-password');

  // عناصر Pro-Decor
  const fontSelect = document.getElementById('font-select');
  const decorText = document.getElementById('decor-text');
  const decorUpload = document.getElementById('decor-upload');
  const colorType = document.getElementById('color-type');
  const solidColor = document.getElementById('solid-color');
  const gradientsGrid = document.getElementById('gradients');
  const texturesGrid = document.getElementById('textures');
  const previewCanvas = document.getElementById('preview-canvas');
  const downloadBtn = document.getElementById('download-image');
  const ctx = previewCanvas.getContext('2d');

  // الصفحة الرئيسية عناصر
  const galleryEl = document.getElementById('gallery');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resultsEl = document.getElementById('results');

  // About/Contact elements
  const aboutContent = document.getElementById('about-content');
  const contactContent = document.getElementById('contact-content');

  /* -------- بيانات محلية مخزنة -------- */
  let savedPassword = localStorage.getItem('panelPassword') || '1234';
  let galleryList = JSON.parse(localStorage.getItem('app_gallery') || '[]'); // dataURLs
  let texList = JSON.parse(localStorage.getItem('app_textures') || '[]'); // dataURLs
  let fontsList = JSON.parse(localStorage.getItem('app_fonts') || '[]'); // {name, dataBase64}
  let aboutText = localStorage.getItem('app_about') || '';
  let contactText = localStorage.getItem('app_contact') || '';

  // تحميل إعدادات سابقة للعرض
  if (aboutText) aboutContent.textContent = aboutText;
  if (contactText) contactContent.textContent = contactText;

  /* -------- خطوط افتراضية (أسماء) -------- */
  const defaultFonts = [
    {name:'Diwani', cssName:'Diwani'},
    {name:'Thuluth', cssName:'Thuluth'},
    {name:'Kufi', cssName:'Kufi'},
    {name:'Riqaa', cssName:'Riqaa'},
    {name:'Naskh', cssName:'Naskh'}
  ];

  /* -------- دوال مساعدة للملف والـ fonts -------- */
  function readFileAsDataURL(file){
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = ()=> res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  function readFileAsBase64(file){
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = ()=> res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function downloadDataURL(dataURL, filename){
    const a = document.createElement('a'); a.href = dataURL; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }

  // إضافة خيار في select مع منع التكرار
  function addFontOption(name){
    if(!fontSelect) return;
    if([...fontSelect.options].some(o=>o.value===name)) return;
    const op = document.createElement('option');
    op.value = name; op.textContent = name;
    fontSelect.appendChild(op);
  }

  // تحميل الخطوط المحفوظة أو الافتراضية
  async function loadFontsOnStart(){
    // أضف الأسماء الافتراضية أولاً
    defaultFonts.forEach(f => addFontOption(f.name));
    // ثم الخطوط المرفوعة والمحفوظة
    for(const f of fontsList){
      try{
        const binary = atob(f.data);
        const arr = new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++) arr[i]=binary.charCodeAt(i);
        const fontFace = new FontFace(f.name, arr);
        await fontFace.load();
        document.fonts.add(fontFace);
        addFontOption(f.name);
      }catch(e){
        console.warn('فشل تحميل خط مخزن', e);
      }
    }
    renderGradientsGrid();
    renderTexturesGrid();
    renderGallery();
  }

  /* -------- إنشاء شبكة التدرجات (50 تدرج) -------- */
  const gradients = [];
  const palette = [
    ['#FFD27F','#FFB347'], ['#FF9A9E','#FAD0C4'], ['#A18CD1','#FBC2EB'], ['#FAD961','#F76B1C'],
    ['#4facfe','#00f2fe'], ['#43e97b','#38f9d7'], ['#667eea','#764ba2'], ['#f6d365','#fda085'],
    ['#ffecd2','#fcb69f'], ['#a1c4fd','#c2e9fb'], ['#fbc2eb','#a6c1ee'], ['#fdcbf1','#e6dee9'],
    ['#fddb92','#d1fdff'], ['#e0c3fc','#8ec5fc'], ['#f093fb','#f5576c'], ['#5ee7df','#b490ca'],
    ['#ff9a9e','#fecfef'], ['#f6d365','#fda085'], ['#92a9f8','#a0e9fd'], ['#cfd9df','#e2ebf0'],
    ['#ff7e5f','#feb47b'], ['#ffafbd','#ffc3a0'], ['#84fab0','#8fd3f4'], ['#c6ffdd','#fbd786'],
    ['#fbc2eb','#a6c1ee'], ['#fad0c4','#ffd1ff'], ['#fbc2eb','#f8d3ff'], ['#dfe9f3','#fffcdc'],
    ['#f3a683','#f7d794'], ['#c3cfe2','#cfd9df'], ['#fef9a7','#fdd1b6'], ['#e0f7fa','#ffe6f0'],
    ['#ffecd2','#fcb69f'], ['#f093fb','#f5576c'], ['#89f7fe','#66a6ff'], ['#fbd3e9','#bbf7d0'],
    ['#f6d365','#fda085'], ['#fd84a1','#ffb199'], ['#c1dfc4','#f0d4ff'], ['#fceabb','#f8b500'],
    ['#d9a7c7','#fff1f1'], ['#b8e1ff','#d6f3ff'], ['#ffd3a5','#fd6585'], ['#e0c3fc','#8ec5fc'],
    ['#f0e2ec','#b3f0ff'], ['#ffd1ff','#c1f1c5'], ['#f9d29d','#ff8484'], ['#c7ffd8','#a1ffd9'],
    ['#f7ffbe','#ffd1dc'], ['#e6f7ff','#d8ffd6']
  ];
  for(let i=0;i<50;i++) gradients.push(palette[i % palette.length]);

  function renderGradientsGrid(){
    if(!gradientsGrid) return;
    gradientsGrid.innerHTML = '';
    gradients.forEach((g, idx) => {
      const el = document.createElement('div');
      el.className = 'result-card';
      el.style.height = '70px';
      el.style.borderRadius = '8px';
      el.style.cursor = 'pointer';
      el.style.background = `linear-gradient(90deg, ${g[0]}, ${g[1]})`;
      el.title = `تدرج ${idx+1}`;
      el.addEventListener('click', () => {
        selectedGradientIndex = idx;
        renderPreview();
      });
      gradientsGrid.appendChild(el);
    });
  }

  function renderTexturesGrid(){
    if(!texturesGrid) return;
    texturesGrid.innerHTML = '';
    if(texList.length === 0){
      texturesGrid.innerHTML = '<p class="muted">لا توجد تلبيسات مضافة بعد</p>';
      return;
    }
    texList.forEach((data, idx) => {
      const img = document.createElement('img');
      img.src = data;
      img.style.width = '100%';
      img.style.height = '80px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        selectedTextureIndex = idx;
        renderPreview();
      });
      texturesGrid.appendChild(img);
    });
  }

  /* -------- حالة مختارة للتلوين -------- */
  let selectedGradientIndex = 0;
  let selectedTextureIndex = 0;

  /* -------- تحميل الصور المعرض والمعاينة -------- */
  function renderGallery(){
    if(!galleryEl) return;
    galleryEl.innerHTML = '';
    if (galleryList.length === 0){
      galleryEl.innerHTML = '<p class="muted">لا توجد صور مضافة بعد</p>';
      return;
    }
    galleryList.forEach((d, idx) => {
      const img = document.createElement('img');
      img.src = d;
      img.style.width = '100%';
      img.style.height = '130px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';
      galleryEl.appendChild(img);
    });
  }

  /* -------- نتائج البحث (بسيط) -------- */
  if(searchBtn){
    searchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim().toLowerCase();
      resultsEl.innerHTML = '';
      if(!q) return;
      let found = false;
      galleryList.forEach((d, idx) => {
        if(d && d.toLowerCase().includes(q) || true){
          const card = document.createElement('div');
          card.className = 'result-card';
          const im = document.createElement('img'); im.src = d; im.style.width = '100%'; im.style.height='120px'; im.style.objectFit='cover';
          const dl = document.createElement('button'); dl.textContent = 'تحميل'; dl.addEventListener('click', ()=> downloadDataURL(d, `image-${idx+1}.png`));
          card.appendChild(im); card.appendChild(dl);
          resultsEl.appendChild(card);
          found = true;
        }
      });
      if(!found) resultsEl.innerHTML = '<p class="muted">لا توجد نتائج</p>';
    });
  }

  /* -------- names section (فارغة كما طلبت) -------- */
  const namesInput = document.getElementById('names-input');
  const namesResults = document.getElementById('names-results');
  if(namesInput){
    namesInput.addEventListener('input', () => {
      if(namesResults) namesResults.innerHTML = '';
    });
  }

  /* -------- تفعيل تبديل الأقسام -------- */
  menuItems.forEach(it => {
    it.addEventListener('click', () => {
      const target = it.getAttribute('data-section');
      sections.forEach(s => s.classList.remove('active'));
      const el = document.getElementById(target);
      if(el) el.classList.add('active');
      sideMenu.classList.remove('active');
    });
  });
  sideBtn.addEventListener('click', ()=> sideMenu.classList.add('active'));
  closeSide.addEventListener('click', ()=> sideMenu.classList.remove('active'));

  // زر ابدأ: إخفاء الترحيب
  if(startBtn){
    startBtn.addEventListener('click', ()=> { 
      if(welcome) welcome.style.display = 'none'; 
    });
  }

  /* -------- لوحة التحكم: الدخول بكلمة مرور (محسّن) -------- */
  if(settingsBtn){
    settingsBtn.addEventListener('click', () => {
      controlPanel.classList.remove('hidden');
      // نعرض شاشة الدخول فقط أولاً
      if(loginArea) loginArea.style.display = 'block';
      if(panelOptions) panelOptions.classList.add('hidden');
      if(panelPassword){
        panelPassword.value = '';
        // نُعطي تركيز للحقل بعد رندر النافذة (بالتأخير الصغير)
        setTimeout(()=> panelPassword.focus(), 120);
      }
    });
  }

  if(closePanel){
    closePanel.addEventListener('click', () => controlPanel.classList.add('hidden'));
  }

  if(panelLogin){
    panelLogin.addEventListener('click', () => {
      const val = panelPassword ? panelPassword.value : '';
      if(val === savedPassword){
        if(loginArea) loginArea.style.display = 'none';
        if(panelOptions) panelOptions.classList.remove('hidden');
        // تحميل النصوص الحالية داخل الحقول داخل اللوحة
        const aboutTextField = document.getElementById('about-text');
        const contactTextField = document.getElementById('contact-text');
        if(aboutTextField) aboutTextField.value = aboutText;
        if(contactTextField) contactTextField.value = contactText;
      } else {
        // سلوك محسّن عند كلمة مرور خاطئة
        alert('كلمة المرور غير صحيحة');
        if(panelPassword){
          panelPassword.value = '';
          panelPassword.focus();
        }
      }
    });

    // إمكانية الضغط Enter داخل حقل كلمة المرور لتنفيذ الدخول
    if(panelPassword){
      panelPassword.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') panelLogin.click();
      });
    }
  }

  // حفظ كلمة مرور جديدة
  if(savePasswordBtn){
    savePasswordBtn.addEventListener('click', () => {
      const np = newPasswordInput ? newPasswordInput.value.trim() : '';
      if(!np || np.length < 3) return alert('أدخل كلمة مرور أقوى (3 أحرف على الأقل).');
      savedPassword = np;
      localStorage.setItem('panelPassword', savedPassword);
      if(newPasswordInput) newPasswordInput.value = '';
      alert('تم حفظ كلمة المرور');
    });
  }

  /* -------- رفع وحفظ الصور للتطبيق (gallery) -------- */
  const uploadGallery = document.getElementById('upload-gallery');
  const saveGallery = document.getElementById('save-gallery');
  if(saveGallery){
    saveGallery.addEventListener('click', async () => {
      const files = uploadGallery ? uploadGallery.files : null;
      if(!files || files.length === 0) return alert('اختر صوراً أولاً');
      for(const f of files){
        const data = await readFileAsDataURL(f);
        galleryList.push(data);
      }
      localStorage.setItem('app_gallery', JSON.stringify(galleryList));
      if(uploadGallery) uploadGallery.value = '';
      renderGallery();
      alert('تم حفظ صور المعرض');
    });
  }

  /* -------- رفع وحفظ التلبيسات (textures) -------- */
  const uploadTex = document.getElementById('upload-tex');
  const saveTex = document.getElementById('save-tex');
  if(saveTex){
    saveTex.addEventListener('click', async () => {
      const files = uploadTex ? uploadTex.files : null;
      if(!files || files.length === 0) return alert('اختر صور التلبيس');
      for(const f of files){
        const data = await readFileAsDataURL(f);
        texList.push(data);
      }
      localStorage.setItem('app_textures', JSON.stringify(texList));
      if(uploadTex) uploadTex.value = '';
      renderTexturesGrid();
      alert('تم حفظ التلبيسات');
    });
  }

  /* -------- رفع وحفظ الخطوط (ttf/otf) -------- */
  const uploadFonts = document.getElementById('upload-fonts');
  const saveFonts = document.getElementById('save-fonts');
  if(saveFonts){
    saveFonts.addEventListener('click', async () => {
      const files = uploadFonts ? uploadFonts.files : null;
      if(!files || files.length === 0) return alert('اختر ملفات الخطوط');
      for(const f of files){
        const base64 = await readFileAsBase64(f);
        const parts = base64.split(',');
        const b64 = parts.length>1?parts[1]:parts[0];
        const fontName = f.name.replace(/\.[^/.]+$/, "");
        fontsList.push({name:fontName, data:b64});
        try{
          const binary = atob(b64);
          const arr = new Uint8Array(binary.length);
          for(let i=0;i<binary.length;i++) arr[i]=binary.charCodeAt(i);
          const fontFace = new FontFace(fontName, arr);
          await fontFace.load();
          document.fonts.add(fontFace);
          addFontOption(fontName);
        }catch(e){
          console.warn('فشل تحميل الخط مؤقتاً', e);
        }
      }
      localStorage.setItem('app_fonts', JSON.stringify(fontsList));
      if(uploadFonts) uploadFonts.value = '';
      alert('تم رفع الخطوط وإضافتها للقائمة');
    });
  }

  /* -------- About & Contact -------- */
  const aboutTextEl = document.getElementById('about-text');
  const contactTextEl = document.getElementById('contact-text');
  const saveAboutBtn = document.getElementById('save-about');
  const saveContactBtn = document.getElementById('save-contact');

  if(saveAboutBtn){
    saveAboutBtn.addEventListener('click', () => {
      const t = aboutTextEl ? aboutTextEl.value.trim() : '';
      aboutText = t;
      localStorage.setItem('app_about', aboutText);
      aboutContent.textContent = aboutText || 'تطبيق يقدم أدوات زخرفة وتصميم بسيطة وسريعة.';
      alert('تم حفظ نص لمحة التطبيق');
    });
  }
  if(saveContactBtn){
    saveContactBtn.addEventListener('click', () => {
      const t = contactTextEl ? contactTextEl.value.trim() : '';
      contactText = t;
      localStorage.setItem('app_contact', contactText);
      contactContent.textContent = contactText || 'email@example.com';
      alert('تم حفظ نص اتصل بنا');
    });
  }

  /* -------- إعداد المحرر / canvas / معاينة -------- */
  loadFontsOnStart();

  let uploadedNameImage = null;
  if(decorUpload){
    decorUpload.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if(!f) return;
      uploadedNameImage = await readFileAsDataURL(f);
      renderPreview();
    });
  }

  [decorText, fontSelect, solidColor, colorType].forEach(el => {
    if(el) el.addEventListener('input', () => renderPreview());
  });

  if(colorType){
    colorType.addEventListener('change', () => {
      const v = colorType.value;
      if(gradientsGrid) gradientsGrid.style.display = v==='gradient' ? 'grid' : 'none';
      if(texturesGrid) texturesGrid.style.display = v==='texture' ? 'grid' : 'none';
      renderPreview();
    });
  }

  function clearCanvas(){
    if(!ctx) return;
    ctx.clearRect(0,0,previewCanvas.width, previewCanvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0)';
    ctx.fillRect(0,0,previewCanvas.width, previewCanvas.height);
  }

  function renderPreview(){
    if(!ctx) return;
    clearCanvas();
    const text = decorText ? decorText.value.trim() : '';
    if(uploadedNameImage){
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(previewCanvas.width / img.width, previewCanvas.height / img.height);
        const w = img.width * ratio, h = img.height * ratio;
        ctx.drawImage(img, (previewCanvas.width-w)/2, (previewCanvas.height-h)/2, w, h);
      };
      img.src = uploadedNameImage;
      return;
    }
    if(!text){
      ctx.fillStyle = '#222';
      ctx.font = '18px sans-serif';
      ctx.fillText('اكتب اسماً لمعاينته هنا', 20, 40);
      return;
    }
    const fontName = fontSelect ? fontSelect.value : 'sans-serif';
    const fontSize = 72;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px "${fontName}", sans-serif`;
    const x = previewCanvas.width/2;
    const y = previewCanvas.height/2;
    const type = colorType ? colorType.value : 'solid';

    if(type==='solid'){
      ctx.fillStyle = solidColor ? solidColor.value : '#000';
      ctx.fillText(text, x, y);
    } else if(type==='gradient'){
      const g = gradients[selectedGradientIndex] || gradients[0];
      const grad = ctx.createLinearGradient(0,0,previewCanvas.width,0);
      grad.addColorStop(0, g[0]); grad.addColorStop(1, g[1]);
      ctx.fillStyle = grad;
      ctx.fillText(text, x, y);
    } else if(type==='texture'){
      if(!texList[selectedTextureIndex]) {
        ctx.fillStyle = solidColor ? solidColor.value : '#000';
        ctx.fillText(text, x, y);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const pattern = ctx.createPattern(img, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillText(text, x, y);
      };
      img.src = texList[selectedTextureIndex];
    }
  }

  if(downloadBtn){
    downloadBtn.addEventListener('click', () => {
      const w = parseInt(prompt('أدخل عرض الصورة بالـ px (مثال 1200):', '1200')) || 1200;
      const h = parseInt(prompt('أدخل ارتفاع الصورة بالـ px (مثال 400):', '400')) || 400;
      const temp = document.createElement('canvas');
      temp.width = w; temp.height = h;
      const tctx = temp.getContext('2d');
      tctx.clearRect(0,0,w,h);

      if(uploadedNameImage){
        const img = new Image();
        img.onload = () => {
          const ratio = Math.min(w / img.width, h / img.height);
          const rw = img.width * ratio, rh = img.height * ratio;
          tctx.drawImage(img, (w-rw)/2, (h-rh)/2, rw, rh);
          downloadDataURL(temp.toDataURL('image/png'), 'result.png');
        };
        img.src = uploadedNameImage;
        return;
      }

      const text = decorText ? decorText.value.trim() : '';
      const fontName = fontSelect ? fontSelect.value : 'sans-serif';
      const fontSize = Math.floor(h * 0.4);
      tctx.textAlign = 'center'; tctx.textBaseline = 'middle';
      tctx.font = `${fontSize}px "${fontName}", sans-serif`;

      const type = colorType ? colorType.value : 'solid';
      if(type==='solid'){
        tctx.fillStyle = solidColor ? solidColor.value : '#000';
        tctx.fillText(text, w/2, h/2);
        downloadDataURL(temp.toDataURL('image/png'), 'result.png');
      } else if(type==='gradient'){
        const g = gradients[selectedGradientIndex] || gradients[0];
        const grad = tctx.createLinearGradient(0,0,w,0);
        grad.addColorStop(0, g[0]); grad.addColorStop(1, g[1]);
        tctx.fillStyle = grad;
        tctx.fillText(text, w/2, h/2);
        downloadDataURL(temp.toDataURL('image/png'), 'result.png');
      } else if(type==='texture'){
        if(!texList[selectedTextureIndex]){
          tctx.fillStyle = solidColor ? solidColor.value : '#000';
          tctx.fillText(text, w/2, h/2);
          downloadDataURL(temp.toDataURL('image/png'), 'result.png');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const pattern = tctx.createPattern(img, 'repeat');
          tctx.fillStyle = pattern;
          tctx.fillText(text, w/2, h/2);
          downloadDataURL(temp.toDataURL('image/png'), 'result.png');
        };
        img.src = texList[selectedTextureIndex];
      }
    });
  }

  // نهاية DOMContentLoaded
});
