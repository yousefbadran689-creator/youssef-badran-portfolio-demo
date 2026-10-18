import {initReviews} from './reviews.mjs';
import {initImageViewer} from './image-viewer.mjs';
import {categories,contact,inquiryLink} from './content.mjs?v=cloud1';
import {loadPublicCatalog} from './load-catalog.mjs?v=cloud1';
import {services} from './services.mjs?v=cloud1';

const $=selector=>document.querySelector(selector);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let language='en',catalog=null,selectedCategory='all',reviewsUI=null,visibleProjects=12;
try{language=localStorage.getItem('yb-language')==='ar'?'ar':'en';}catch{}
const text=pair=>pair[language==='ar'?1:0];
const page=document.body.dataset.page;
const imageViewer=initImageViewer({getLanguage:()=>language,isOtherDialogOpen:()=>false,onDetails:project=>{location.href=`project.html?id=${encodeURIComponent(project.id)}`;}});
function animate(element,frames,options={}){if(!element?.animate||reducedMotion.matches)return null;return element.animate(frames,{duration:550,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards',...options});}
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){revealObserver.unobserve(entry.target);animate(entry.target,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}]);}}),{threshold:.06});
const reveal=elements=>[...elements].forEach(element=>revealObserver.observe(element));
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)document.getAnimations().forEach(item=>item.cancel());});
function node(tag,className,copy){const element=document.createElement(tag);if(className)element.className=className;if(copy!==undefined)element.textContent=copy;return element;}
function artwork(project){
 const art=node('div','project-art');art.style.setProperty('--project-tone',project.tone);
 const viewport=node('div','art-viewport');viewport.style.aspectRatio=`${project.width}/${project.height}`;
 const image=node('img','project-image');image.src=project.image;image.alt=text(project.title);image.width=project.width;image.height=project.height;image.loading='lazy';
 viewport.append(image);art.append(viewport);return art;
}
function renderProjects(){
 const list=$('#projects');if(!list)return;
 const query=($('#project-search')?.value||'').trim().toLocaleLowerCase();
 const all=catalog.projects;
 const filtered=all.filter(project=>(selectedCategory==='all'||project.category===selectedCategory)&&(!query||[...project.title,...project.focus,...project.desc,...categories[project.category]].some(value=>value.toLocaleLowerCase().includes(query))));
 const visible=filtered.slice(0,list.dataset.limit?Number(list.dataset.limit):visibleProjects);
 if($('#project-load-more'))$('#project-load-more').hidden=visible.length>=filtered.length;
 if($('#filters'))$('#filters').replaceChildren(...Object.entries(categories).map(([key,label])=>{
  const button=node('button','filter',text(label));button.type='button';button.dataset.filter=key;button.setAttribute('aria-pressed',String(key===selectedCategory));
  const count=node('span','filter-count',String(key==='all'?all.length:all.filter(project=>project.category===key).length));count.setAttribute('aria-hidden','true');button.append(count);
  button.addEventListener('click',()=>{selectedCategory=key;visibleProjects=12;renderProjects();$('#filters').querySelector(`[data-filter="${key}"]`).focus({preventScroll:true});});return button;
 }));
 if($('#work-count'))$('#work-count').textContent=text([`${filtered.length} projects`,`${filtered.length} تصميم`]);
 if($('#project-empty'))$('#project-empty').hidden=filtered.length>0;
 [...list.children].forEach(element=>revealObserver.unobserve(element));
 list.replaceChildren(...visible.map((project,index)=>{
  const card=node('button','project-card');card.type='button';card.dataset.project=project.id;card.classList.toggle('is-featured',index===0&&selectedCategory==='all'&&!query);
  card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-label',text(['Open full image: ','افتح الصورة كاملة: '])+text(project.title));card.append(artwork(project));
  const info=node('div','project-info');if(card.classList.contains('is-featured'))info.append(node('span','featured-label',text(['IN FOCUS','تحت الضوء'])));
  info.append(node('span','project-category',text(categories[project.category])),node('h3','',text(project.title)),node('p','project-summary',text(project.focus)),node('span','project-action',text(['Open full image ⤢','افتح الصورة كاملة ⤢'])));
  card.append(info);card.addEventListener('click',()=>imageViewer.open(project));return card;
 }));reveal(list.children);
}
function renderServices(){
 const grid=$('#services-grid');if(!grid)return;
 grid.replaceChildren(...services.map(service=>{
  const article=node('article','service-card');article.innerHTML=`<span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${service.path}"/></svg></span>`;
  const link=node('a','',text(['Let’s talk ↗','خلّينا نتكلم ↗']));link.href=`contact.html?service=${encodeURIComponent(service.service)}`;
  article.append(node('h3','',text(service.title)),node('p','',text(service.body)),link);return article;
 }));reveal(grid.children);
}
function renderProject(){
 const root=$('#project-page');if(!root)return;
 const id=new URLSearchParams(location.search).get('id'),project=catalog.projects.find(item=>item.id===id);
 root.replaceChildren();
 const back=node('a','text-link',text(['← Back to all work','ارجع لكل الأعمال ←']));back.href='portfolio.html';root.append(back);
 if(!project){root.append(node('h1','',text(['Project not found','المشروع غير موجود'])),node('p','',text(['It may have moved. Explore the current collection.','ممكن يكون اتنقل. شوف مجموعة الأعمال الحالية.'])));return;}
 const heading=node('header','project-detail-heading');heading.append(node('p','eyebrow',text(categories[project.category])),node('h1','',text(project.title)),node('p','project-detail-description',text(project.desc)));
 const photo=node('button','project-detail-art');photo.type='button';photo.setAttribute('aria-haspopup','dialog');photo.setAttribute('aria-label',text(['Open full image','افتح الصورة كاملة']));photo.append(artwork(project),node('span','image-open-hint',text(['Open full image ⤢','افتح الصورة كاملة ⤢'])));photo.addEventListener('click',()=>imageViewer.open(project));
 const details=node('div','project-detail-meta'),scope=node('section'),palette=node('section');scope.append(node('h2','',text(['Design elements','عناصر التصميم'])));const elements=node('ul','detail-tags');project.deliverables.forEach(pair=>elements.append(node('li','',text(pair))));scope.append(elements);
 palette.append(node('h2','',text(['Color direction','اتجاه الألوان'])));const colors=node('ul','detail-palette');project.palette.forEach(color=>{const item=node('li');const swatch=node('span');swatch.style.backgroundColor=color;swatch.setAttribute('aria-hidden','true');item.append(swatch,node('code','',color));colors.append(item);});palette.append(colors);details.append(scope,palette);
 const inquiry=node('a','button',text(['Let’s create your next project ↗','نصمم مشروعك الجاي ↗']));inquiry.href=`contact.html?service=${encodeURIComponent({branding:'Brand identity',social:'Social media design',posters:'Poster and banner',packaging:'Packaging design'}[project.category])}`;
 const navigation=node('nav','detail-navigation');navigation.setAttribute('aria-label',text(['More projects','مشاريع أخرى']));const index=catalog.projects.indexOf(project);
 for(const [step,pair]of [[-1,['← Previous project','المشروع السابق ←']],[1,['Next project →','المشروع التالي →']]]){const item=catalog.projects[(index+step+catalog.projects.length)%catalog.projects.length];const link=node('a','text-link',text(pair));link.href=`project.html?id=${encodeURIComponent(item.id)}`;navigation.append(link);}
 root.append(heading,photo,details,node('p','work-note',text(['Design concept · Portfolio selection','تصور تصميمي · من مختارات الأعمال'])),inquiry,navigation);
 document.title=`${text(project.title)} — ${text(catalog.profile.name)}`;
}
function setMenu(open){const menu=$('#menu');if(!menu)return;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',text(open?['Close menu','اقفل القائمة']:['Open menu','افتح القائمة']));$('#navigation').classList.toggle('open',open);}
function applyLanguage(){
 document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-en][data-ar]').forEach(element=>element.textContent=element.dataset[language].replaceAll('\\n','\n'));
 document.querySelectorAll('.brand-name').forEach(element=>element.textContent=text(catalog.profile.name));
 document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link=>link.href=`https://wa.me/${catalog.profile.phone}`);
 $('#language').textContent=language==='ar'?'EN':'عربي';$('#language').setAttribute('aria-label',text(['Switch to Arabic','Switch to English']));
 if($('#project-search')){$('#project-search').placeholder=text(['Search projects','اسم التصميم أو مجاله']);$('#project-search').setAttribute('aria-label',text(['Search projects','ابحث في الأعمال']));}
 document.querySelectorAll('.contact-detail').forEach(link=>{if(link.href.startsWith('mailto:')){link.href=`mailto:${catalog.profile.email}`;link.querySelector('b').textContent=catalog.profile.email;}else if(link.href.includes('wa.me/')){link.href=`https://wa.me/${catalog.profile.phone}`;link.querySelector('b').textContent=`+${catalog.profile.phone}`;}});
 document.title=`${text({home:['Creative portfolio','معرض إبداعي'],portfolio:['Selected work','الأعمال'],about:['About','عني'],services:['Services','الخدمات'],reviews:['Reviews','التقييمات'],contact:['Get in touch','التواصل'],project:['Project','المشروع']}[page]||['Portfolio','الأعمال'])} — ${text(catalog.profile.name)}`;
 setMenu(false);renderProjects();renderServices();renderProject();reviewsUI?.refreshText();imageViewer.refreshText();
}
function initContact(){
 const form=$('#contact-form');if(!form)return;
 const requested=new URLSearchParams(location.search).get('service');if([...$('#service-select').options].some(option=>option.value===requested))$('#service-select').value=requested;
 form.addEventListener('submit',event=>{
  event.preventDefault();const values=Object.fromEntries(new FormData(form));form.elements.name.setCustomValidity(values.name.trim()?'':text(['Enter your name.','اكتب اسمك.']));form.elements.message.setCustomValidity(values.message.trim()?'':text(['Tell me about your idea.','احكيلي عن فكرتك.']));if(!form.reportValidity())return;
  const channel=event.submitter?.value==='email'?'email':'whatsapp';const url=inquiryLink(values,channel);
  if(channel==='whatsapp'){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.click();}else location.href=url;
  $('#form-status').textContent=text(channel==='email'?['Your email draft is ready. Review and send it in your email app.','مسودة الإيميل جاهزة. راجعها وابعتها في تطبيق البريد.']:['Your WhatsApp message is ready. Review and send it there.','رسالة واتساب جاهزة. راجعها وابعتها هناك.']);
 });form.addEventListener('input',event=>event.target.setCustomValidity?.(''));
}
async function boot(){
 catalog=await loadPublicCatalog();Object.assign(contact,{email:catalog.profile.email,phone:catalog.profile.phone});
 const requested=new URLSearchParams(location.search).get('category');if(Object.hasOwn(categories,requested))selectedCategory=requested;
 document.querySelectorAll('[data-page-link]').forEach(link=>{const active=link.dataset.pageLink===page||(page==='project'&&link.dataset.pageLink==='portfolio');link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');});
 $('#menu').addEventListener('click',()=>setMenu($('#menu').getAttribute('aria-expanded')!=='true'));document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))setMenu(false);});
 $('#language').addEventListener('click',()=>{language=language==='en'?'ar':'en';try{localStorage.setItem('yb-language',language);}catch{}applyLanguage();});
 $('#project-search')?.addEventListener('input',()=>{visibleProjects=12;renderProjects();});$('#project-load-more')?.addEventListener('click',()=>{visibleProjects+=12;renderProjects();});initContact();reviewsUI=initReviews({getLanguage:()=>language,animate});$('#year').textContent=new Date().getFullYear();applyLanguage();
 reveal(document.querySelectorAll('.page-intro,.section-heading,.about-copy,.about-art,.process,.contact-copy,#contact-form,#review-form,.review-summary,.page-callout'));
 animate($('.site-header'),[{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}]);
 document.querySelectorAll('.hero-copy>*').forEach((element,index)=>animate(element,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{delay:index*70}));
 const progress=node('div','scroll-progress');progress.setAttribute('aria-hidden','true');document.body.append(progress);
 const update=()=>{const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?Math.max(0,Math.min(1,scrollY/range)):0})`;};window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
}
boot().catch(error=>{console.error(error);const message=node('p','public-error',text(['The portfolio could not initialize. Please reload or contact me by email.','تعذّر تحميل الموقع. حدّث الصفحة أو تواصل معايا بالإيميل.']));message.setAttribute('role','alert');$('#main').prepend(message);});
