import {backendEnabled,getBackendClient,backendLoginError} from './backend-client.mjs?v=cloud1';
import {loadCloudCatalog,saveCloudCatalog} from './cloud-store.mjs?v=cloud1';
const cloudFind=id=>document.getElementById(id);
export async function initAdminCloud({getDraft,guardChanges,baseRevision,setRevision,applyPublished}){
 const panel=cloudFind('admin-auth-panel'),workspace=cloudFind('admin-workspace-view');
 if(!backendEnabled()){if(panel)panel.hidden=true;if(workspace)workspace.hidden=false;document.querySelectorAll?.('[data-cloud-only]').forEach(element=>element.hidden=true);if(cloudFind('admin-mode-heading'))cloudFind('admin-mode-heading').textContent='نسخة غير متصلة — التعديلات محلية';if(cloudFind('admin-mode-note'))cloudFind('admin-mode-note').textContent='تقدر تعدّل المسودة وتنزّل ملف المعرض. افتح الموقع المنشور لتسجيل الدخول والنشر المباشر.';return;}
 panel.hidden=false;workspace.hidden=true;
 const client=await getBackendClient();let allowed=false,publishing=false,sessionRequest=0,revision=baseRevision,reviewOffset=0,reviewLoading=false;
 const editControls=cloudFind('admin-edit-controls');
 const busy=value=>{publishing=value;editControls.disabled=value;workspace.setAttribute('aria-busy',String(value));};
 const notice=(message,bad=false)=>{cloudFind('cloud-status').textContent=message;cloudFind('cloud-status').classList.toggle('is-error',bad);};
 const authNotice=message=>cloudFind('admin-auth-status').textContent=message;
 const snapshot=await loadCloudCatalog(client);
 if(revision===null||revision===undefined){revision=snapshot.revision;setRevision(revision);applyPublished(snapshot);}
 else if(revision!==snapshot.revision)notice('المعرض المنشور اتغيّر من جهاز آخر. احفظ نسخة من مسودتك ثم حمّل النسخة المنشورة قبل النشر.',true);
 async function refreshAccess(){
  const current=++sessionRequest;allowed=false;workspace.hidden=true;cloudFind('admin-session').hidden=true;cloudFind('admin-login').hidden=false;
  const{data,error}=await client.auth.getUser();if(current!==sessionRequest)return;
  if(error||!data.user){authNotice(backendLoginError||'سجّل دخولك بحساب إدارة الموقع لتعديل الأعمال ونشرها.');return;}
  const membership=await client.from('portfolio_admins').select('user_id').eq('user_id',data.user.id).maybeSingle();if(current!==sessionRequest)return;
  cloudFind('admin-session').hidden=false;cloudFind('admin-account-email').textContent=data.user.email||'';
  if(membership.error||!membership.data){authNotice('تم تسجيل الدخول، لكن الحساب لا يملك صلاحية إدارة الموقع.');return;}
  allowed=true;cloudFind('admin-login').hidden=true;workspace.hidden=false;authNotice('أنت مسجل كمدير الموقع. احفظ مسودتك ثم اضغط «نشر التعديلات».');
  await renderModeration();
 }
 client.auth.onAuthStateChange(()=>queueMicrotask(()=>refreshAccess().catch(()=>authNotice('تعذّر التحقق من صلاحية الحساب. حدّث الصفحة.'))));
 cloudFind('admin-login').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.target;if(!form.reportValidity())return;
  cloudFind('admin-sign-in').disabled=true;authNotice('جاري تسجيل الدخول…');
  try{const{error}=await client.auth.signInWithPassword({email:form.elements.email.value.trim(),password:form.elements.password.value});if(error)throw error;await refreshAccess();}
  catch{authNotice('تعذّر تسجيل الدخول. راجع الإيميل وكلمة السر وتأكيد الحساب.');}
  finally{form.elements.password.value='';cloudFind('admin-sign-in').disabled=false;}
 });
 cloudFind('admin-magic-link').addEventListener('click',async()=>{
  const email=cloudFind('admin-login').elements.email;if(!email.reportValidity())return;
  cloudFind('admin-magic-link').disabled=true;
  try{const{error}=await client.auth.signInWithOtp({email:email.value.trim(),options:{shouldCreateUser:false,emailRedirectTo:new URL('admin.html',location.href).href}});if(error)throw error;authNotice('لو الحساب مسجّل، هتوصلك رسالة دخول على الإيميل. افتح الرابط من نفس المتصفح.');}
  catch{authNotice('تعذّر إرسال رابط الدخول. جرّب لاحقًا أو استخدم كلمة السر.');}
  finally{cloudFind('admin-magic-link').disabled=false;}
 });
 cloudFind('admin-sign-out').addEventListener('click',async()=>{
  allowed=false;workspace.hidden=true;cloudFind('admin-review-list').replaceChildren();
  const{error}=await client.auth.signOut();if(error)authNotice('تعذّر إنهاء الجلسة. جرّب تسجيل الخروج مرة أخرى.');else await refreshAccess();
 });
 cloudFind('admin-password-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!allowed||!event.target.reportValidity())return;
  const field=event.target.elements.newPassword;cloudFind('admin-password-save').disabled=true;
  try{const{error}=await client.auth.updateUser({password:field.value});if(error)throw error;cloudFind('admin-password-status').textContent='اتحفظت كلمة السر. تقدر تستخدم الإيميل وكلمة السر للدخول بعد كده.';}
  catch{cloudFind('admin-password-status').textContent='كلمة السر لم تتغيّر. جرّب كلمة أقوى أو سجّل الدخول من جديد.';}
  finally{field.value='';cloudFind('admin-password-save').disabled=false;}
 });
 cloudFind('admin-publish-live').addEventListener('click',async()=>{
  if(!allowed||publishing||!guardChanges())return;
  busy(true);cloudFind('admin-publish-live').disabled=true;notice('جاري رفع الصور وحفظ المعرض…');
  try{const next=await saveCloudCatalog(client,getDraft(),revision);revision=next.revision;setRevision(revision);applyPublished(next);notice('تم نشر التعديلات. هتظهر للزوار عند تحديث الموقع.');}
  catch(error){notice(error.code==='PT409'?'في نسخة أحدث منشورة. نزّل مسودتك كنسخة احتياطية ثم حمّل النسخة المنشورة وأعد التعديل.':'تعذّر النشر. مسودتك موجودة؛ راجع اتصالك وصلاحية الحساب ثم جرّب مرة أخرى.',true);}
  finally{busy(false);cloudFind('admin-publish-live').disabled=false;}
 });
 cloudFind('admin-reload-live').addEventListener('click',async()=>{
  if(!allowed||publishing||!guardChanges())return;
  busy(true);
  try{const next=await loadCloudCatalog(client);revision=next.revision;setRevision(revision);applyPublished(next);notice('تم تحميل النسخة المنشورة في المحرر. زر «تراجع» يرجع المسودة السابقة.');}
  catch{notice('تعذّر تحميل النسخة المنشورة. المسودة الحالية لم تتغيّر.',true);}
  finally{busy(false);}
 });
 async function renderModeration(append=false){
  if(!allowed||reviewLoading)return;reviewLoading=true;const list=cloudFind('admin-review-list'),more=cloudFind('admin-reviews-more');more.disabled=true;
  if(!append){reviewOffset=0;list.replaceChildren();}
  const{data,error}=await client.from('portfolio_reviews').select('id,display_name,rating,comment,created_at,status').order('created_at',{ascending:false}).order('id',{ascending:false}).range(reviewOffset,reviewOffset+99);
  reviewLoading=false;more.disabled=false;
  if(!allowed)return;if(error){cloudFind('admin-review-status').textContent='تعذّر تحميل التقييمات. جرّب التحديث.';return;}
  reviewOffset+=data.length;more.hidden=data.length<100;cloudFind('admin-review-status').textContent=reviewOffset?'':'لا توجد تقييمات حتى الآن.';
  for(const row of data){
   const article=document.createElement('article');article.className='moderation-row';const heading=document.createElement('h3');heading.textContent=`${row.display_name} · ${'★'.repeat(row.rating)}`;
   const label=document.createElement('small');label.textContent={pending:'بانتظار المراجعة',approved:'منشور',rejected:'غير منشور'}[row.status];
   const comment=document.createElement('p');comment.textContent=row.comment;comment.dir='auto';const actions=document.createElement('div');actions.className='admin-actions';
   for(const[state,copy]of [['approved','اعتماد ونشر'],['rejected','إخفاء']]){const button=document.createElement('button');button.type='button';button.className='admin-subtle';button.textContent=copy;button.disabled=state===row.status;
    button.addEventListener('click',async()=>{if(!allowed)return;button.disabled=true;const result=await client.from('portfolio_reviews').update({status:state}).eq('id',row.id).select('id').single();if(result.error){cloudFind('admin-review-status').textContent='التغيير لم يُحفظ. راجع الاتصال وحاول تاني.';button.disabled=false;}else await renderModeration();});actions.append(button);}
   article.append(heading,label,comment,actions);list.append(article);
  }
 }
 cloudFind('admin-refresh-reviews').addEventListener('click',()=>renderModeration());
 cloudFind('admin-reviews-more').addEventListener('click',()=>renderModeration(true));
 await refreshAccess();
}
