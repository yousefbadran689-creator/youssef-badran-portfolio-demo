import { initReviews } from './reviews.mjs';
import { categories, projects, selectProjects, adjacentProject, inquiryLink } from './content.mjs';
const $ = selector => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionEase = 'cubic-bezier(.22,1,.36,1)';
function animateElement(element, frames, options = {}) {
  if (reducedMotion.matches || !element?.animate) return null;
  return element.animate(frames, {duration:650, easing:motionEase, fill:'backwards', ...options});
}
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    revealObserver.unobserve(entry.target);
    animateElement(entry.target, [{opacity:0, transform:'translateY(25px)'}, {opacity:1, transform:'translateY(0)'}], {delay:Number(entry.target.dataset.revealDelay || 0)});
  });
}, {threshold:.08, rootMargin:'0px 0px -24px 0px'});
function observeReveals(elements, stagger = 0) {
  [...elements].forEach((element,index) => {element.dataset.revealDelay=String(Math.min(index*stagger,210));revealObserver.observe(element);});
}
reducedMotion.addEventListener('change', () => {if(reducedMotion.matches) document.getAnimations().forEach(animation=>animation.cancel());});
let language = 'en';
try { language = localStorage.getItem('yb-language') === 'ar' ? 'ar' : 'en'; } catch {}
let selectedCategory = 'all';
let reviewsUI = null;
let selectedProject = null;
const text = pair => pair[language === 'ar' ? 1 : 0];
const services = [
  {title:['Brand identity','هوية بصرية'],body:['Logos, color palettes and visual systems that give your brand a character of its own.','شعارات وألوان ونظام بصري متكامل يدي علامتك شخصية خاصة.'],service:'Brand identity',path:'M12 3l9 9-9 9-9-9z M12 8v8 M8 12h8'},
  {title:['Social media design','سوشيال ميديا'],body:['Scroll-stopping posts and campaigns, designed to keep your brand consistent and recognizable.','بوستات وحملات تلفت الانتباه وتحافظ على شخصية علامتك في كل ظهور.'],service:'Social media design',path:'M3 4h18v13H3z M8 21h8 M12 17v4 M7 12V9 M12 12V7 M17 12v-2'},
  {title:['Poster & banner','بوسترات وبانرات'],body:['A strong message, at any scale. Posters and advertising visuals made to get noticed.','رسالة قوية بأي مقاس. بوسترات وتصميمات إعلانية تلفت الأنظار.'],service:'Poster and banner',path:'M4 3h16v18H4z M8 7h8 M8 11h5 M8 15h8 M8 18h5'},
  {title:['Packaging design','تصميم العبوات'],body:['Thoughtful packaging concepts that help your product look as good as what’s inside.','تصورات لعبوات بتفاصيل مدروسة تبرز منتجك وتعكس قيمته.'],service:'Packaging design',path:'M12 3l9 5-9 5-9-5z M3 8v8l9 5 9-5V8 M12 13v8 M7.5 5.5l9 5'}
];
function cropElement(project, isDialog = false) {
  const [x,y,w,h] = project.crop;
  const art = document.createElement('div');
  art.className = 'project-art';
  art.style.setProperty('--project-tone',project.tone);
  const viewport=document.createElement('div');viewport.className='art-viewport';viewport.style.aspectRatio=`${w}/${h}`;
  const img = document.createElement('img');
  img.className = 'crop-image'; img.src = 'reference.png'; img.alt = text(project.title); img.width = 1536; img.height = 1024;
  img.loading = isDialog ? 'eager' : 'lazy';
  if(project.image){img.src=project.image;img.className='project-image';img.removeAttribute('width');img.removeAttribute('height');}
  else Object.assign(img.style, {width:`${1536 / w * 100}%`,left:`${-x / w * 100}%`,top:`${-y / h * 100}%`});
  viewport.append(img);art.append(viewport);
  if (!isDialog) { const overlay = document.createElement('span'); overlay.className = 'project-overlay'; overlay.setAttribute('aria-hidden','true'); art.append(overlay); }
  return art;
}
function renderProjects(transition = false) {
  const previous = new Map([...$('#projects').children].map(card => [card.dataset.project, card.getBoundingClientRect()]));
  [...$('#projects').children].forEach(card=>revealObserver.unobserve(card));
  $('#filters').replaceChildren(...Object.entries(categories).map(([key,label]) => {
    const button = document.createElement('button');button.className='filter';button.textContent=text(label);const count=document.createElement('span');count.className='filter-count';count.textContent=selectProjects(key).length;count.setAttribute('aria-hidden','true');button.append(count);button.type='button';button.dataset.filter=key;button.setAttribute('aria-pressed',String(key===selectedCategory));
    button.addEventListener('click',()=>{ if(selectedCategory===key)return; selectedCategory=key; renderProjects(true); $('#filters').querySelector(`[data-filter="${key}"]`).focus({preventScroll:true}); });return button;
  }));
  const visible = selectProjects(selectedCategory);
  $('#work-count').textContent = language === 'ar' ? `${visible.length} تصميمات` : `${String(visible.length).padStart(2,'0')} projects`;
  $('#projects').replaceChildren(...visible.map((project,index)=>{
    const button=document.createElement('button');button.type='button';button.className='project-card';button.dataset.project=project.id;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label',text(['View project: ','شوف المشروع: '])+text(project.title));button.append(cropElement(project));
    const featured=selectedCategory==='all'&&index===0;button.classList.toggle('is-featured',featured);
    const info=document.createElement('div');info.className='project-info';
    const tag=document.createElement('span');tag.className='project-category';tag.textContent=text(categories[project.category]);
    if(featured){const badge=document.createElement('span');badge.className='featured-label';badge.textContent=text(['IN FOCUS','تحت الضوء']);info.append(badge);}
    const title=document.createElement('h3');title.textContent=text(project.title);
    const summary=document.createElement('p');summary.className='project-summary';summary.textContent=text(featured?project.desc:project.focus);
    const action=document.createElement('span');action.className='project-action';action.textContent=text(['Explore project ↗','اكتشف المشروع ↗']);
    info.append(tag,title,summary,action);button.append(info);
    button.addEventListener('click',()=>openProject(project));return button;
  }));
  if (transition) {
    [...$('#projects').children].forEach((card,index)=>{
      const before=previous.get(card.dataset.project),after=card.getBoundingClientRect();
      const dx=before?before.left-after.left:0,dy=before?before.top-after.top:18;
      animateElement(card,[{opacity:before ? 0.7 : 0,transform:`translate(${dx}px,${dy}px) scale(.97)`},{opacity:1,transform:'translate(0,0) scale(1)'}],{duration:480,delay:Math.min(index*35,140)});
    });
  } else observeReveals($('#projects').children,55);
}
function renderServices(){
  [...$('#services-grid').children].forEach(card=>revealObserver.unobserve(card));
  $('#services-grid').replaceChildren(...services.map(service=>{
    const article=document.createElement('article');article.className='service-card';
    article.innerHTML=`<span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${service.path}"/></svg></span><h3></h3><p></p><a href="#contact"><span></span><span aria-hidden="true">↗</span></a>`;
    article.querySelector('h3').textContent=text(service.title);article.querySelector('p').textContent=text(service.body);article.querySelector('a span').textContent=text(['Let’s talk','خلّينا نتكلم']);article.querySelector('a').addEventListener('click',()=>{$('#service-select').value=service.service;});return article;
  }));
  observeReveals($('#services-grid').children,65);
}
function updateDialog(project){
  $('#dialog-category').textContent=text(categories[project.category]);$('#dialog-title').textContent=text(project.title);$('#dialog-description').textContent=text(project.desc);$('#dialog-art').replaceChildren(cropElement(project,true));
  $('#dialog-deliverables').replaceChildren(...project.deliverables.map(pair=>{const item=document.createElement('li');item.textContent=text(pair);return item;}));
  $('#dialog-palette').replaceChildren(...project.palette.map(color=>{const swatch=document.createElement('li');const dot=document.createElement('span');dot.className='palette-dot';dot.style.backgroundColor=color;dot.setAttribute('aria-hidden','true');swatch.append(dot,color);return swatch;}));
  const items=selectProjects(selectedCategory);$('#dialog-position').textContent=`${items.findIndex(item=>item.id===project.id)+1} / ${items.length}`;
  $('#previous-project').disabled=items.length<2;$('#next-project').disabled=items.length<2;
}
function moveProject(step){if(!selectedProject||dialogClosing)return;selectedProject=adjacentProject(selectedProject.id,selectedCategory,step);updateDialog(selectedProject);$('#project-dialog').scrollTop=0;animateElement($('#dialog-art'),[{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300});}
$('#previous-project').addEventListener('click',()=>moveProject(-1));$('#next-project').addEventListener('click',()=>moveProject(1));
$('#project-dialog').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.target.matches('input,textarea,select'))return;event.preventDefault();moveProject((event.key==='ArrowRight'?1:-1)*(language==='ar'?-1:1));});
let dialogClosing = false;
function openProject(project){
  selectedProject=project;updateDialog(project);$('#project-dialog').showModal();document.body.style.overflow='hidden';
  animateElement($('#project-dialog'),[{opacity:0,transform:'translateY(22px) scale(.965)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:360});
}
async function closeProject(){
  const dialog=$('#project-dialog');if(!dialog.open||dialogClosing)return;
  dialogClosing=true;dialog.getAnimations().forEach(animation=>animation.cancel());
  const closing=animateElement(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(12px) scale(.98)'}],{duration:180,easing:'cubic-bezier(.4,0,1,1)'});
  if(closing)await closing.finished.catch(()=>{});
  dialog.close();dialogClosing=false;
}
$('#project-dialog').addEventListener('cancel',event=>{event.preventDefault();closeProject();});
$('#project-dialog').addEventListener('close',()=>{document.body.style.overflow='';selectedProject=null;});
$('#close-dialog').addEventListener('click',closeProject);
$('#project-dialog').addEventListener('click',event=>{const box=event.currentTarget.getBoundingClientRect();if(event.target===event.currentTarget&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))closeProject();});
$('#similar-project').addEventListener('click',async event=>{event.preventDefault();if(selectedProject){const map={branding:'Brand identity',social:'Social media design',posters:'Poster and banner',packaging:'Packaging design'};$('#service-select').value=map[selectedProject.category];}await closeProject();location.hash='contact';});
function setMenu(open){$('#menu').setAttribute('aria-expanded',String(open));$('#navigation').classList.toggle('open',open);$('#menu').setAttribute('aria-label',text(open?['Close menu','اقفل القائمة']:['Open menu','افتح القائمة']));}
$('#menu').addEventListener('click',()=>setMenu($('#menu').getAttribute('aria-expanded')!=='true'));
document.querySelectorAll('.nav a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))setMenu(false);});
function applyLanguage(){
  document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach(element=>{element.textContent=element.dataset[language].replaceAll('\\n','\n');});
  const languageButton=$('#language');languageButton.textContent=language==='ar'?'EN':'عربي';languageButton.lang=language==='ar'?'en':'ar';languageButton.setAttribute('aria-label',language==='ar'?'Switch to English':'Switch to Arabic');
  $('#navigation').setAttribute('aria-label',text(['Main navigation','القائمة الرئيسية']));$('#filters').setAttribute('aria-label',text(['Filter projects','تصفية الأعمال']));$('#close-dialog').setAttribute('aria-label',text(['Close project','اقفل المشروع']));
  document.title=text(['Youssef Badran — Graphic Designer','يوسف بدران — مصمم جرافيك']);
  $('#form-status').textContent='';setMenu(false);renderProjects();renderServices();if(selectedProject)updateDialog(selectedProject);reviewsUI?.refreshText();
}
$('#language').addEventListener('click',()=>{language=language==='en'?'ar':'en';try{localStorage.setItem('yb-language',language);}catch{}applyLanguage();});
$('#contact-form').addEventListener('submit',event=>{
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));const nameField=event.currentTarget.elements.name;const messageField=event.currentTarget.elements.message;
  nameField.setCustomValidity(values.name.trim()?'':text(['Please enter your name.','اكتب اسمك من فضلك.']));messageField.setCustomValidity(values.message.trim()?'':text(['Tell me a little about your project.','احكيلي عن مشروعك من فضلك.']));if(!event.currentTarget.reportValidity())return;
  const channel=event.submitter?.value==='email'?'email':'whatsapp';const url=inquiryLink(values,channel);
  if(channel==='whatsapp'){const anchor=document.createElement('a');anchor.href=url;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.click();}else{window.location.href=url;}
  $('#form-status').textContent=text(channel==='whatsapp'?['Your message is ready in WhatsApp. Review it there and press send.','رسالتك جاهزة في واتساب. راجعها هناك واضغط إرسال.']:['Your email draft is ready to open. If no app opens, use WhatsApp or the email address shown here.','مسودة الإيميل جاهزة للفتح. لو مفيش تطبيق فتح، استخدم واتساب أو الإيميل الموجود هنا.']);
});
$('#contact-form').addEventListener('input',event=>event.target.setCustomValidity?.(''));
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.nav a').forEach(link=>{const active=link.hash===`#${entry.target.id}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -65% 0px',threshold:0});
document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
reviewsUI=initReviews({getLanguage:()=>language,animate:animateElement});
$('#year').textContent=new Date().getFullYear();applyLanguage();

// Content stays visible without animation support; motion is a progressive enhancement.
observeReveals(document.querySelectorAll('.section-heading,.about-copy,.about-art,.process>div,.contact-copy,#contact-form,#review-form,.review-summary'),0);
observeReveals(document.querySelectorAll('.process li'),85);
animateElement($('.site-header'),[{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'translateY(0)'}],{duration:600});
document.querySelectorAll('.hero-copy>.eyebrow,#hero-title>*,.hero-description,.hero-actions,.hero-specialties').forEach((element,index)=>{
  animateElement(element,[{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:820,delay:80+index*75,fill:'backwards'});
});
animateElement($('.hero-art'),[{opacity:0,transform:'translateY(20px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:1100,delay:160,fill:'backwards'});

const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
let scrollFrame=0;
function updateProgress(){scrollFrame=0;const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?Math.max(0,Math.min(1,scrollY/range)):0})`;}
window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress);},{passive:true});
window.addEventListener('resize',updateProgress);updateProgress();

// Light card tilt only on precise pointers, with no listeners on touch devices.
const precisePointer=matchMedia('(hover: hover) and (pointer: fine)');
let tiltFrame=0,tiltedArt=null;
$('#projects').addEventListener('pointermove',event=>{
  if(reducedMotion.matches||!precisePointer.matches)return;
  const art=event.target.closest('.project-card')?.querySelector('.project-art');if(!art)return;
  if(tiltedArt&&tiltedArt!==art){tiltedArt.style.removeProperty('--tilt-x');tiltedArt.style.removeProperty('--tilt-y');}
  tiltedArt=art;cancelAnimationFrame(tiltFrame);
  const x=event.clientX,y=event.clientY;
  tiltFrame=requestAnimationFrame(()=>{const box=art.getBoundingClientRect();art.style.setProperty('--tilt-x',`${-(y-box.top-box.height/2)/box.height*4}deg`);art.style.setProperty('--tilt-y',`${(x-box.left-box.width/2)/box.width*4}deg`);});
});
$('#projects').addEventListener('pointerleave',()=>{cancelAnimationFrame(tiltFrame);if(tiltedArt){tiltedArt.style.removeProperty('--tilt-x');tiltedArt.style.removeProperty('--tilt-y');tiltedArt=null;}});
