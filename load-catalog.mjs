import {defaultCatalog} from './content.mjs?v=cloud1';
import {validateCatalog} from './catalog.mjs?v=cloud1';
import {getBackendClient,backendEnabled} from './backend-client.mjs?v=cloud1';
import {loadCloudCatalog} from './cloud-store.mjs?v=cloud1';
export async function loadPublicCatalog(){
 if(location.protocol!=='file:'&&!document.body.dataset.offline){
  if(backendEnabled())try{return (await loadCloudCatalog(await getBackendClient())).catalog;}catch(error){console.warn('Live catalog unavailable; using the packaged collection.',error);}
  try{const response=await fetch('portfolio-data.json',{cache:'no-cache'});if(!response.ok)throw new Error('Catalog unavailable');return validateCatalog(await response.json());}
  catch(error){console.warn('Using the bundled portfolio catalog.',error);}
 }
 return validateCatalog(defaultCatalog);
}
