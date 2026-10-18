import {loadPublicCatalog} from './load-catalog.mjs?v=pages2';
import {validateCatalog,publicCatalog,moveItem,safeArtworkUrl} from './catalog.mjs?v=pages2';
import {categories} from './content.mjs?v=pages2';
const adminFind=id=>document.getElementById(id);
const draftKey='yb-portfolio-admin-draft-v2';
let draft=null,selectedId=null,selection=null,dirty=false,undo=null,localSaved=true;
const clone=value=>JSON.parse(JSON.stringify(value));
function status(message,id='admin-global-status',bad=false){const element=adminFind(id);element.textContent=message;element.classList.toggle('is-error',bad);}
function saveDraft(){
 try{localStorage.setItem(draftKey,JSON.stringify(publicCatalog(draft)));localSaved=true;adminFind('admin-save-state').textContent='محفوظة محليًا';}
 catch{localSaved=false;adminFind('admin-save-state').textContent='في الجلسة فقط';status('مساحة الحفظ المحلية غير كافية. نزّل ملف المعرض للاحتفاظ بالتعديلات.','admin-global-status',true);}
}
function remember(){undo=clone(draft);adminFind('admin-undo').disabled=false;}
function commit(next){const valid=validateCatalog(next);remember();draft=valid;saveDraft();renderList();}
function renderList(){
 adminFind('admin-total').textContent=draft.projects.length;adminFind('admin-categories').textContent=new Set(draft.projects.map(project=>project.category)).size;
 const query=adminFind('admin-search').value.trim().toLocaleLowerCase();
 const list=adminFind('admin-project-list');list.replaceChildren();
 for(const [index,project]of draft.projects.entries()){
  if(query&&![...project.title,...categories[project.category]].some(value=>value.toLocaleLowerCase().includes(query)))continue;
  const row=document.createElement('article');row.className='admin-project-row';row.classList.toggle('selected',project.id===selectedId);
  const choose=document.createElement('button');choose.type='button';choose.className='admin-project-select';choose.setAttribute('aria-pressed',String(project.id===selectedId));
  const image=document.createElement('img');image.src=project.image;image.alt='';image.loading='lazy';const copy=document.createElement('span'),title=document.createElement('strong'),meta=document.createElement('small');title.textContent=project.title[1];meta.textContent=`${categories[project.category][1]}${index===0?' · العمل المميز':''}`;copy.append(title,meta);choose.append(image,copy);choose.addEventListener('click',()=>{if(guardChanges())selectProject(project);});
  const actions=document.createElement('div');actions.className='admin-row-actions';
  for(const [label,destination,disabled]of [['↑',index-1,index===0],['↓',index+1,index===draft.projects.length-1],['★',0,index===0]]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.disabled=disabled;button.setAttribute('aria-label',`${label==='★'?'اجعل العمل مميزًا':label==='↑'?'حرّك لأعلى':'حرّك لأسفل'}: ${project.title[1]}`);button.addEventListener('click',()=>{if(!guardChanges())return;const next=clone(draft);next.projects=moveItem(next.projects,project.id,destination);commit(next);status('اتحفظ ترتيب الأعمال في المسودة.');});actions.append(button);
  }row.append(choose,actions);list.append(row);
 }
 if(!list.children.length){const empty=document.createElement('p');empty.className='admin-empty';empty.textContent='مفيش أعمال مطابقة. أضف عملًا أو غيّر البحث.';list.append(empty);}
}
function markDirty(){if(!selection)return;dirty=true;adminFind('editor-dirty').textContent='تعديل غير محفوظ';}
function preview(){
 const image=adminFind('editor-preview');image.hidden=!selection?.image;adminFind('editor-no-image').hidden=Boolean(selection?.image);if(selection?.image){image.src=selection.image;image.alt=adminFind('editor-title-ar').value||'معاينة التصميم';}else image.removeAttribute('src');
}
function selectProject(project){
 selection=project?clone(project):null;selectedId=project?.id||null;dirty=false;adminFind('editor-dirty').textContent='';status('','editor-status');
 const form=adminFind('admin-editor');form.reset();
 adminFind('editor-heading').textContent=project?project.title[1]:'اختر عملًا أو أضف تصميمًا جديدًا';
 adminFind('editor-save').disabled=!project;adminFind('editor-delete').disabled=!project||!draft.projects.some(item=>item.id===selectedId);
 if(project){for(const [name,pair]of [['title',project.title],['focus',project.focus],['desc',project.desc]]){adminFind(`editor-${name}-en`).value=pair[0];adminFind(`editor-${name}-ar`).value=pair[1];}adminFind('editor-category').value=project.category;adminFind('editor-tone').value=project.tone;project.palette.forEach((color,index)=>adminFind(`editor-color-${index+1}`).value=color);adminFind('editor-url').value=project.image.startsWith('https:')?project.image:'';}
 adminFind('editor-file-note').textContent=project?.image.startsWith('data:')?'صورة مرفوعة ومضمّنة في الملف':'JPG / PNG / WebP · حتى 10 ميجا';preview();renderList();
}
function readSelection(){
 if(!selection)throw new Error('اختر عملًا أولًا.');
 const project=clone(selection);
 for(const name of ['title','focus','desc'])project[name]=[adminFind(`editor-${name}-en`).value.trim(),adminFind(`editor-${name}-ar`).value.trim()];
 project.category=adminFind('editor-category').value;project.tone=adminFind('editor-tone').value;project.palette=[1,2,3].map(index=>adminFind(`editor-color-${index}`).value);
 const url=adminFind('editor-url').value.trim();if(url)project.image=url;
 const validated=validateCatalog({...draft,projects:[project]});return validated.projects[0];
}
function saveSelection(announce=true){
 try{
  if(!adminFind('admin-editor').reportValidity())return false;
  const project=readSelection(),next=clone(draft),index=next.projects.findIndex(item=>item.id===project.id);
  if(index<0)next.projects.push(project);else next.projects[index]=project;
  commit(next);selectProject(project);if(announce)status(localSaved?'اتحفظ العمل في المسودة على جهازك.':'التعديل موجود في الجلسة. نزّل الملف للاحتفاظ به.','editor-status');return true;
 }catch(error){status('راجع الحقول والصورة: كل عنوان ووصف مطلوب بالعربي والإنجليزي، والصورة تكون JPG أو PNG أو WebP آمنة.','editor-status',true);return false;}
}
function guardChanges(){return !dirty||saveSelection(false);}
async function rasterUpload(file){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('اختار صورة JPG أو PNG أو WebP بحجم أقل من 10 ميجا.');
 const url=URL.createObjectURL(file);
 try{const image=new Image();image.src=url;await image.decode();if(image.naturalWidth>12000||image.naturalHeight>12000)throw new Error('أبعاد الصورة كبيرة جدًا. استخدم صورة أصغر.');const ratio=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return{image:canvas.toDataURL('image/webp',.9),width:canvas.width,height:canvas.height};}finally{URL.revokeObjectURL(url);}
}
async function startAdmin(){
 const current=await loadPublicCatalog();draft=current;
 try{const stored=localStorage.getItem(draftKey);if(stored)draft=validateCatalog(JSON.parse(stored));adminFind('admin-save-state').textContent=stored?'محفوظة محليًا':'المعرض المنشور';}catch{status('المسودة المحفوظة غير صالحة. تم فتح نسخة المعرض المنشورة؛ يمكنك استيراد ملف سليم.','admin-global-status',true);}
 const profileForm=adminFind('admin-profile');
 const fillProfile=()=>{profileForm.elements.nameEn.value=draft.profile.name[0];profileForm.elements.nameAr.value=draft.profile.name[1];profileForm.elements.email.value=draft.profile.email;profileForm.elements.phone.value=draft.profile.phone;};fillProfile();
 adminFind('admin-search').addEventListener('input',renderList);
 adminFind('admin-editor').addEventListener('input',event=>{if(!selection)return;markDirty();if(event.target.id==='editor-url'&&safeArtworkUrl(event.target.value.trim()))selection.image=event.target.value.trim();preview();});
 adminFind('editor-preview').addEventListener('load',event=>{if(selection&&event.target.naturalWidth&&event.target.getAttribute('src')===selection.image){selection.width=event.target.naturalWidth;selection.height=event.target.naturalHeight;}});
 adminFind('editor-preview').addEventListener('error',()=>{if(selection?.image)status('تعذّر تحميل معاينة الصورة. راجع الرابط أو ارفع الصورة من جهازك.','editor-status',true);});
 adminFind('admin-editor').addEventListener('submit',event=>{event.preventDefault();saveSelection();});
 adminFind('editor-cancel').addEventListener('click',()=>selectProject(draft.projects.find(project=>project.id===selectedId)||draft.projects[0]||null));
 adminFind('editor-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;if(!selection){status('أضف عملًا أو اختار عملًا قبل رفع الصورة.','editor-status',true);return;}const target=selectedId;try{status('جاري تجهيز الصورة…','editor-status');const result=await rasterUpload(file);if(target!==selectedId)return;Object.assign(selection,result);adminFind('editor-url').value='';adminFind('editor-file-note').textContent='الصورة الجديدة جاهزة. احفظ العمل لتضمينها في المسودة.';markDirty();preview();status('','editor-status');}catch(error){status(error.message,'editor-status',true);}finally{event.target.value='';}});
 adminFind('admin-add').addEventListener('click',()=>{if(!guardChanges())return;const id=`design-${Date.now().toString(36)}`;selectProject({id,title:['New design','تصميم جديد'],desc:['A new design concept.','تصور تصميمي جديد.'],focus:['A new perspective','رؤية جديدة'],category:'social',image:'',width:1600,height:1200,palette:['#5125ff','#0b0924','#ece8ff'],tone:'#ece8ff',deliverables:[['Campaign concept','تصور حملة']]});dirty=true;adminFind('editor-dirty').textContent='عمل جديد غير محفوظ';adminFind('admin-editor').scrollIntoView({behavior:'smooth',block:'start'});});
 adminFind('editor-delete').addEventListener('click',()=>{if(!selectedId)return;const next=clone(draft);next.projects=next.projects.filter(project=>project.id!==selectedId);commit(next);selectProject(draft.projects[0]||null);status('اتحذف العمل من المسودة. يمكنك استخدام «تراجع» لاسترجاعه.');});
 adminFind('admin-undo').addEventListener('click',()=>{if(!undo)return;draft=validateCatalog(undo);undo=null;adminFind('admin-undo').disabled=true;saveDraft();selectProject(draft.projects.find(project=>project.id===selectedId)||draft.projects[0]||null);fillProfile();status('تم التراجع عن آخر تغيير في المسودة.');});
 profileForm.addEventListener('submit',event=>{event.preventDefault();if(!guardChanges()||!profileForm.reportValidity())return;try{const next=clone(draft);next.profile={name:[profileForm.elements.nameEn.value,profileForm.elements.nameAr.value],email:profileForm.elements.email.value,phone:profileForm.elements.phone.value};commit(next);status(localSaved?'اتحفظت البيانات في المسودة. نزّل الملف لنشرها.':'البيانات موجودة في الجلسة فقط. نزّل الملف للاحتفاظ بها.','profile-status');}catch{status('راجع الاسم والإيميل ورقم الواتساب بكود الدولة.','profile-status',true);}});
 adminFind('admin-export').addEventListener('click',()=>{if(!guardChanges())return;const blob=new Blob([JSON.stringify(publicCatalog(draft),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='portfolio-data.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('اتنزّل ملف المعرض. ارفعه في مستودع GitHub لإظهار التعديلات للزوار.');});
 adminFind('admin-import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>30*1024*1024)throw new Error('Large file');const incoming=validateCatalog(JSON.parse(await file.text()));commit(incoming);selectProject(draft.projects[0]||null);fillProfile();status('تم استيراد الملف في المسودة المحلية. لم يتم نشره على الموقع.');}catch{status('تعذّر الاستيراد. اختر ملف معرض JSON سليمًا أقل من 30 ميجا؛ المسودة الحالية لم تتغيّر.','admin-global-status',true);}finally{event.target.value='';}});
 selectProject(draft.projects[0]||null);
}
startAdmin().catch(error=>{console.error(error);status('تعذّر تحميل المحرر. حدّث الصفحة أو افتح الموقع من رابط GitHub Pages.','admin-global-status',true);});
