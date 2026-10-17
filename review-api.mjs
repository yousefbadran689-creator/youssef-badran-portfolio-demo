export function validateReview(values) {
  if(typeof values.display_name!=='string'||typeof values.comment!=='string')return null;
  const display_name=values.display_name.trim(),comment=values.comment.trim(),rating=Number(values.rating);
  if(display_name.length<2||display_name.length>60||comment.length<10||comment.length>1000||!Number.isInteger(rating)||rating<1||rating>5||values.consent!==true)return null;
  return {display_name,comment,rating};
}

export function createReviewApi(config, transport=globalThis.fetch) {
  const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url)&&Boolean(config.publishableKey);
  async function request(path,options={}) {
    if(!configured)throw new Error('Review service is not configured');
    const timeout=AbortSignal.timeout(20000);
    const response=await transport(config.url+'/rest/v1/'+path,{...options,headers:{apikey:config.publishableKey,'Content-Type':'application/json',...options.headers},signal:options.signal?AbortSignal.any([options.signal,timeout]):timeout});
    if(!response.ok){const error=await response.json().catch(()=>({}));const failure=new Error(error.message||'Request failed');failure.code=error.code;throw failure;}
    const responseText=await response.text();return responseText?JSON.parse(responseText):null;
  }
  return {configured,request};
}
