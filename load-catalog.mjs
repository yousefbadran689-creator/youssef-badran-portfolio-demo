import {defaultCatalog} from './content.mjs?v=pages2';
import {validateCatalog} from './catalog.mjs?v=pages2';
export async function loadPublicCatalog(){
 if(location.protocol!=='file:'&&!document.body.dataset.offline){
  try{const response=await fetch('portfolio-data.json',{cache:'no-cache'});if(!response.ok)throw new Error('Catalog unavailable');return validateCatalog(await response.json());}
  catch(error){console.warn('Using the bundled portfolio catalog.',error);}
 }
 return validateCatalog(defaultCatalog);
}
