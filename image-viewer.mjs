const clampImageValue=(value,min,max)=>Math.max(min,Math.min(max,value));

export function fitArtwork(width,height,viewWidth,viewHeight){
  width=Math.max(1,width||1);height=Math.max(1,height||1);
  const ratio=Math.min(Math.max(1,viewWidth-32)/width,Math.max(1,viewHeight-32)/height);
  return {width:width*ratio,height:height*ratio};
}
export function zoomArtwork(state,nextScale,point={x:state.viewWidth/2,y:state.viewHeight/2}){
  const scale=clampImageValue(Number.isFinite(nextScale)?nextScale:1,1,3);
  const axis=(size,viewport,scroll,anchor)=>{
    const previous=size*state.scale,next=size*scale;
    const offset=Math.max(0,(viewport-previous)/2),nextOffset=Math.max(0,(viewport-next)/2);
    return clampImageValue((scroll+anchor-offset)/previous*next+nextOffset-anchor,0,Math.max(0,next-viewport));
  };
  return {scale,x:axis(state.width,state.viewWidth,state.x,point.x),y:axis(state.height,state.viewHeight,state.y,point.y)};
}

export function initImageViewer({getLanguage,onDetails,isOtherDialogOpen}){
  const element=id=>document.getElementById(id);
  const dialog=element('image-viewer'),stage=element('viewer-stage'),track=element('viewer-track'),image=element('viewer-image');
  const zoomIn=element('viewer-zoom-in'),zoomOut=element('viewer-zoom-out'),fitButton=element('viewer-fit'),closeButton=element('viewer-close');
  let project=null,scale=1,fit={width:1,height:1},gesture=null,drag=null;
  const pointers=new Map();
  const translated=pair=>pair[getLanguage()==='ar'?1:0];
  const state=()=>({scale,...fit,viewWidth:stage.clientWidth,viewHeight:stage.clientHeight,x:stage.scrollLeft,y:stage.scrollTop});
  function refreshText(){
    element('viewer-title').textContent=project?translated(project.title):translated(['Artwork','الصورة']);
    image.alt=project?translated(project.title):'';
    zoomIn.setAttribute('aria-label',translated(['Zoom in','تكبير الصورة']));
    zoomOut.setAttribute('aria-label',translated(['Zoom out','تصغير الصورة']));
    closeButton.setAttribute('aria-label',translated(['Close image','إغلاق الصورة']));
    fitButton.textContent=translated(['Fit','ملاءمة']);
    fitButton.setAttribute('aria-label',translated(['Fit the whole image','عرض الصورة كاملة']));
    element('viewer-details').textContent=translated(['Project details ↗','تفاصيل المشروع ↗']);
    element('viewer-hint').textContent=translated(['Double click or pinch to zoom. Drag to explore.','اضغط مرتين أو استخدم إصبعين للتكبير، واسحب الصورة لتحريكها.']);
    stage.setAttribute('aria-label',translated(['Full image. Use plus, minus or zero to zoom.','الصورة كاملة. استخدم أزرار التكبير والتصغير أو صفر للملاءمة.']));
    element('viewer-error').textContent=translated(['The image could not load. Close and try again.','تعذّر تحميل الصورة. اقفلها وجرّب تفتحها تاني.']);
  }
  function paint(result){
    scale=result.scale;
    track.style.width=`${Math.max(stage.clientWidth,fit.width*scale)}px`;
    track.style.height=`${Math.max(stage.clientHeight,fit.height*scale)}px`;
    image.style.width=`${fit.width*scale}px`;image.style.height=`${fit.height*scale}px`;
    stage.scrollLeft=result.x;stage.scrollTop=result.y;
    stage.dataset.zoomed=String(scale>1.001);
    element('viewer-zoom').textContent=`${Math.round(scale*100)}%`;
    zoomOut.disabled=scale<=1.001;zoomIn.disabled=scale>=2.999;
  }
  function changeZoom(next,point){if(dialog.open)paint(zoomArtwork(state(),next,point));}
  function fitImage(){
    if(!dialog.open||!project)return;
    fit=fitArtwork(project.width||image.naturalWidth,project.height||image.naturalHeight,stage.clientWidth,stage.clientHeight);
    paint({scale:1,x:0,y:0});
  }
  function open(selected){
    project=selected;image.src=selected.image;image.draggable=false;
    element('viewer-error').hidden=true;image.hidden=false;
    refreshText();
    if(!dialog.open)dialog.showModal();
    document.body.style.overflow='hidden';fitImage();closeButton.focus({preventScroll:true});
  }
  closeButton.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    for(const id of pointers.keys())if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);
    pointers.clear();gesture=null;drag=null;stage.classList.remove('is-dragging');
    document.body.style.overflow=isOtherDialogOpen()?'hidden':'';project=null;image.removeAttribute('src');
  });
  zoomIn.addEventListener('click',()=>changeZoom(scale+.5));
  zoomOut.addEventListener('click',()=>changeZoom(scale-.5));
  fitButton.addEventListener('click',fitImage);
  element('viewer-details').addEventListener('click',()=>{const selected=project;dialog.close();onDetails(selected);});
  image.addEventListener('load',()=>{if(dialog.open&&scale===1)fitImage();});
  image.addEventListener('error',()=>{if(!dialog.open)return;image.hidden=true;element('viewer-error').hidden=false;});
  stage.addEventListener('dblclick',event=>{
    const rect=stage.getBoundingClientRect();changeZoom(scale>1?1:2,{x:event.clientX-rect.left,y:event.clientY-rect.top});
  });
  stage.addEventListener('wheel',event=>{
    if(!event.ctrlKey&&!event.metaKey)return;
    event.preventDefault();const rect=stage.getBoundingClientRect();
    changeZoom(scale*Math.exp(-event.deltaY*.005),{x:event.clientX-rect.left,y:event.clientY-rect.top});
  },{passive:false});
  dialog.addEventListener('keydown',event=>{
    if(['+','=','-','0'].includes(event.key)){
      event.preventDefault();if(event.key==='0')fitImage();else changeZoom(scale+(event.key==='-'?-.5:.5));
    }
  });
  const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  const distance=(a,b)=>Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
  const point=event=>{const rect=stage.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};};
  stage.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const position=point(event);pointers.set(event.pointerId,position);stage.setPointerCapture(event.pointerId);
    if(pointers.size===2){
      const [a,b]=[...pointers.values()];gesture={distance:distance(a,b),scale,last:midpoint(a,b)};drag=null;
    }else if(pointers.size===1){drag={...position,xScroll:stage.scrollLeft,yScroll:stage.scrollTop};}
    if(scale>1)stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;
    event.preventDefault();const position=point(event);pointers.set(event.pointerId,position);
    if(pointers.size>=2&&gesture){
      const [a,b]=[...pointers.values()],center=midpoint(a,b);
      changeZoom(gesture.scale*distance(a,b)/gesture.distance,gesture.last);
      stage.scrollLeft-=center.x-gesture.last.x;stage.scrollTop-=center.y-gesture.last.y;gesture.last=center;
    }else if(drag&&scale>1){stage.scrollLeft=drag.xScroll-(position.x-drag.x);stage.scrollTop=drag.yScroll-(position.y-drag.y);}
  });
  function endPointer(event){
    pointers.delete(event.pointerId);gesture=null;
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    if(pointers.size===1){const remaining=[...pointers.values()][0];drag={...remaining,xScroll:stage.scrollLeft,yScroll:stage.scrollTop};}
    else {drag=null;stage.classList.remove('is-dragging');}
  }
  stage.addEventListener('pointerup',endPointer);stage.addEventListener('pointercancel',endPointer);
  window.addEventListener('resize',fitImage);refreshText();
  return {open,refreshText};
}
