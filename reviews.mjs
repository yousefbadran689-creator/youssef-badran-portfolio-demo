import { reviewConfig } from './reviews-config.mjs';
import { createReviewApi, validateReview } from './review-api.mjs';

export function initReviews({getLanguage, animate}) {
  const find = selector => document.querySelector(selector);
  const form = find('#review-form');
  if (!form) return {refreshText(){}};
  const t = values => values[getLanguage()==='ar'?1:0];
  const {configured,request:api} = createReviewApi(reviewConfig);
  const labels = [['Choose a rating','اختار عدد النجوم'],['Poor','ضعيف'],['Fair','مقبول'],['Good','جيد'],['Very good','جيد جدًا'],['Excellent','ممتاز']];
  let rows=[],total=0,average=null,loading=false,sending=false,loadError=false,status='',submissionId=null,requestId=0,loadController;
  const selected = () => Number(form.elements.rating.value || 0);
  function paintStars(value=selected()) { find('#rating-picker').querySelectorAll('label').forEach((label,index)=>label.classList.toggle('is-lit',index<value)); }
  function statusText(){
    const messages={success:['Thank you! Your review was received and is awaiting review.','شكرًا ليك! تقييمك وصل وهو بانتظار المراجعة.'],error:['Your review could not be sent. Your words are still here; please try again.','تعذر إرسال التقييم. كلامك لسه موجود؛ جرّب تاني.'],invalid:['Choose 1–5 stars, enter your name and at least 10 characters, and agree to publication.','اختار من 1 لـ5 نجوم، واكتب اسمك وتعليق من 10 حروف على الأقل، ووافق على النشر.']};
    find('#review-submit-status').textContent=status?t(messages[status]):'';
  }
  function render(){
    find('#review-average').textContent=average===null?'—':new Intl.NumberFormat(getLanguage(),{minimumFractionDigits:1,maximumFractionDigits:1}).format(average);
    find('#review-summary-stars').textContent=average===null?'☆☆☆☆☆':'★'.repeat(Math.round(average))+'☆'.repeat(5-Math.round(average));
    find('#review-count').textContent=total?t([`${total} published reviews · out of 5`,`${total} تقييم منشور · من 5`]):t(['No published reviews yet','لسه مفيش تقييمات منشورة']);
    find('#rating-description').textContent=t(labels[selected()]);paintStars();
    find('#review-character-count').textContent=`${form.elements.comment.value.length} / 1000`;
    find('#review-connection-note').textContent=configured?'':t(['Review submissions are not open yet. You can try selecting stars and writing your feedback.','استقبال التقييمات لسه غير مفعّل. تقدر تجرّب اختيار النجوم وكتابة التعليق.']);
    find('#review-submit').disabled=!configured||sending;
    find('#review-submit span').textContent=sending?t(['Sending…','جاري الإرسال…']):t(['Submit review','إرسال التقييم']);
    find('#reviews-load-error').textContent=loadError?t(['Reviews could not be loaded. Please try again.','تعذر تحميل التقييمات. جرّب تاني.']):'';
    find('#reviews-retry').hidden=!loadError;
    find('#reviews-more').hidden=rows.length>=total||!rows.length;find('#reviews-more').disabled=loading;
    find('#review-sort').disabled=!configured||loading;
    const list=find('#reviews-list');list.setAttribute('aria-busy',String(loading));
    if(!rows.length){
      const empty=document.createElement('div');empty.className='reviews-empty';
      const icon=document.createElement('span');icon.className='empty-review-icon';icon.textContent='✧';icon.setAttribute('aria-hidden','true');
      const heading=document.createElement('h3');heading.textContent=loading?t(['Loading experiences…','بنحمّل آراء العملاء…']):t(['Every experience matters.','كل تجربة بتفرق.']);
      const body=document.createElement('p');body.textContent=t(['Published client reviews will appear here.','آراء العملاء المنشورة هتظهر هنا.']);empty.append(icon,heading,body);list.replaceChildren(empty);
    }else{
      list.replaceChildren(...rows.map(row=>{
        const card=document.createElement('article');card.className='review-card';const top=document.createElement('div');top.className='review-card-top';
        const avatar=document.createElement('span');avatar.className='review-avatar';avatar.textContent=Array.from(row.display_name.trim()).slice(0,1).join('');avatar.setAttribute('aria-hidden','true');
        const identity=document.createElement('div'),name=document.createElement('h4'),date=document.createElement('time');name.textContent=row.display_name;name.dir='auto';date.dateTime=row.created_at;date.textContent=new Intl.DateTimeFormat(getLanguage(),{dateStyle:'medium'}).format(new Date(row.created_at));identity.append(name,date);top.append(avatar,identity);
        const stars=document.createElement('div');stars.className='review-stars';stars.textContent='★'.repeat(row.rating)+'☆'.repeat(5-row.rating);stars.setAttribute('aria-label',t([`${row.rating} out of 5 stars`,`${row.rating} من 5 نجوم`]));
        const comment=document.createElement('p');comment.textContent=row.comment;comment.dir='auto';card.append(top,stars,comment);return card;
      }));
    }
    statusText();
  }
  async function load(append=false){
    if(!configured)return;
    loadController?.abort();loadController=new AbortController();const current=++requestId;
    loading=true;loadError=false;if(!append)rows=[];render();
    const order={newest:'created_at.desc',highest:'rating.desc,created_at.desc',lowest:'rating.asc,created_at.desc'}[find('#review-sort').value];
    try{
      const [next,summary]=await Promise.all([
        api(`portfolio_reviews?select=id,display_name,rating,comment,created_at&order=${order}&limit=12&offset=${append?rows.length:0}`,{signal:loadController.signal}),
        api('rpc/portfolio_review_summary',{method:'POST',body:'{}',signal:loadController.signal})
      ]);
      if(current!==requestId)return;
      rows=append?[...rows,...next]:next;const totals=Array.isArray(summary)?summary[0]:summary;total=Number(totals?.review_count||0);average=total?Number(totals.average_rating):null;
    }catch(error){if(current!==requestId||error.name==='AbortError')return;loadError=true;}
    finally{if(current===requestId){loading=false;render();}}
  }
  find('#rating-picker').querySelectorAll('label').forEach((label,index)=>label.addEventListener('pointerenter',()=>paintStars(index+1)));
  find('#rating-picker').addEventListener('pointerleave',()=>paintStars());
  form.addEventListener('input',event=>{event.target.setCustomValidity?.('');status='';statusText();find('#review-character-count').textContent=`${form.elements.comment.value.length} / 1000`;});
  form.addEventListener('change',()=>{paintStars();find('#rating-description').textContent=t(labels[selected()]);});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!configured||sending)return;
    const values=validateReview({display_name:form.elements.display_name.value,comment:form.elements.comment.value,rating:selected(),consent:form.elements.consent.checked});
    if(!values){status='invalid';statusText();return;}
    if(!form.reportValidity())return;
    submissionId ||= crypto.randomUUID();sending=true;status='';render();
    try{
      await api('portfolio_reviews',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...values,submission_id:submissionId})});
      status='success';form.reset();submissionId=null;
    }catch(error){if(error.code==='23505'){status='success';form.reset();submissionId=null;}else{status='error';}}
    finally{sending=false;render();if(status==='success')animate?.(find('#review-submit-status'),[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:300});}
  });
  find('#review-sort').addEventListener('change',()=>load());find('#reviews-retry').addEventListener('click',()=>load());find('#reviews-more').addEventListener('click',()=>load(true));
  render();load();return{refreshText:render};
}
