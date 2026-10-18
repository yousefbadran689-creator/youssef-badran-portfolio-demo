const catalogCategories=new Set(['branding','social','posters','packaging']);
const catalogText=(value,max,label)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error(`Invalid ${label}`);return value.trim();};
const catalogPair=(value,max,label)=>{if(!Array.isArray(value)||value.length!==2)throw new Error(`Invalid ${label}`);return value.map(item=>catalogText(item,max,label));};
export function safeArtworkUrl(value){
 if(typeof value!=='string'||value.length>12000000)return false;
 if(/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value))return true;
 if(/^https:\/\//i.test(value)){try{const url=new URL(value);return !url.username&&!url.password;}catch{return false;}}
 return /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp)$/i.test(value)&&!value.includes('..');
}
export function validateCatalog(data){
 if(!data||data.schemaVersion!==1||!data.profile||!Array.isArray(data.projects)||data.projects.length>200)throw new Error('Invalid catalog format');
 const name=catalogPair(data.profile.name,100,'name'),email=catalogText(data.profile.email,200,'email'),phone=catalogText(data.profile.phone,16,'phone');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\d{8,15}$/.test(phone))throw new Error('Invalid contact details');
 const ids=new Set();
 const projects=data.projects.map(project=>{
  if(!project||!/^[a-z0-9][a-z0-9-]{1,63}$/.test(project.id)||ids.has(project.id))throw new Error('Invalid or duplicate project ID');ids.add(project.id);
  if(!catalogCategories.has(project.category)||!safeArtworkUrl(project.image))throw new Error('Invalid project category or image');
  if(!Number.isFinite(project.width)||!Number.isFinite(project.height)||project.width<1||project.height<1||project.width>12000||project.height>12000)throw new Error('Invalid image dimensions');
  const palette=project.palette||['#5125ff','#0b0924','#ece8ff'];
  if(!Array.isArray(palette)||palette.length!==3||!palette.every(color=>/^#[0-9a-f]{6}$/i.test(color)))throw new Error('Invalid palette');
  const deliverables=project.deliverables||[['Campaign concept','تصور حملة']];
  if(!Array.isArray(deliverables)||!deliverables.length||deliverables.length>8)throw new Error('Invalid design elements');
  return{id:project.id,title:catalogPair(project.title,150,'title'),desc:catalogPair(project.desc,2000,'description'),focus:catalogPair(project.focus,200,'focus'),category:project.category,image:project.image,width:project.width,height:project.height,palette:[...palette],tone:/^#[0-9a-f]{6}$/i.test(project.tone)?project.tone:palette[0],deliverables:deliverables.map(pair=>catalogPair(pair,150,'design element'))};
 });
 return{schemaVersion:1,profile:{name,email,phone},projects};
}
export function publicCatalog(data){return validateCatalog(data);}
export function moveItem(items,id,to){const result=[...items],from=result.findIndex(item=>item.id===id);if(from<0)return result;const[item]=result.splice(from,1);result.splice(Math.max(0,Math.min(result.length,to)),0,item);return result;}
