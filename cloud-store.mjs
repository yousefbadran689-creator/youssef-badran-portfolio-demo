import {validateCatalog,publicCatalog} from './catalog.mjs?v=cloud1';
export function decodeRaster(value){
 const match=typeof value==='string'&&value.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
 if(!match)throw new Error('Invalid raster image');
 const raw=atob(match[2]),bytes=Uint8Array.from(raw,char=>char.charCodeAt(0));
 if(bytes.byteLength>10*1024*1024)throw new Error('Image exceeds 10 MB');
 return{type:match[1],bytes};
}
export async function loadCloudCatalog(client){
 const{data,error}=await client.from('portfolio_site').select('catalog,revision').eq('id','main').single();
 if(error)throw error;if(!data)throw new Error('Catalog unavailable');
 return{catalog:validateCatalog(data.catalog),revision:Number(data.revision)};
}
export async function saveCloudCatalog(client,value,revision){
 if(!Number.isSafeInteger(revision)||revision<0)throw new Error('Reload the published catalog before saving');
 const catalog=publicCatalog(value);
 for(const project of catalog.projects){
  if(!project.image.startsWith('data:'))continue;
  const{bytes,type}=decodeRaster(project.image),extension=type.split('/')[1];
  const path=`artworks/${project.id}-${crypto.randomUUID()}.${extension}`,storage=client.storage.from('portfolio-images');
  const{error}=await storage.upload(path,bytes,{contentType:type,cacheControl:'31536000',upsert:false});
  if(error)throw error;project.image=storage.getPublicUrl(path).data.publicUrl;
 }
 const{data,error}=await client.rpc('publish_portfolio',{new_catalog:catalog,expected_revision:revision});
 if(error)throw Object.assign(new Error(error.message||'Publish failed'),{code:error.code});
 const next=Number(Array.isArray(data)?data[0]?.revision:data?.revision);
 if(!Number.isSafeInteger(next)||next<=revision)throw new Error('Publication could not be confirmed');
 return{catalog,revision:next};
}
