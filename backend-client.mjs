import {backendConfig} from './backend-config.mjs?v=cloud1';
let clientPromise;
export let backendLoginError='';
export function backendEnabled(){return Boolean(backendConfig.url&&backendConfig.publishableKey)&&typeof location!=='undefined'&&location.protocol!=='file:'&&!document.body.dataset.offline;}
export async function getBackendClient(){
 if(!backendEnabled())return null;
 clientPromise||=import('./supabase-sdk.mjs').then(async({createClient})=>{
  const client=createClient(backendConfig.url,backendConfig.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'yb-portfolio-auth'}});
  const fragment=new URLSearchParams(location.hash.slice(1)),tokenHash=fragment.get('token_hash');
  if(tokenHash){history.replaceState(null,'',location.pathname+location.search);const result=await client.auth.verifyOtp({token_hash:tokenHash,type:'email'});if(result.error)backendLoginError='رابط الدخول منتهي أو استُخدم بالفعل. استخدم كلمة السر أو اطلب رابطًا جديدًا.';}
  return client;
 });
 return clientPromise;
}
