export const contact = { email: 'yousefbadran6999@gmail.com', phone: '201147555067' };
export const categories = {
  all: ['All work', 'كل الأعمال'], branding: ['Branding', 'هوية بصرية'], social: ['Social media', 'سوشيال ميديا'], posters: ['Posters', 'بوسترات'], packaging: ['Packaging', 'تغليف']
};
export const projects = [
  { id:'noir', title:['NOIR · A sense of luxury','NOIR · إحساس بالفخامة'], category:'branding', crop:[52,572,250,125], desc:['A fragrance concept built around warm gold, deep black and a cinematic product composition.','تصور بصري لعطر يمزج الذهبي الدافئ والأسود العميق مع تكوين إعلاني سينمائي.'] },
  { id:'tasty', title:['Tasty · Made to crave','Tasty · تصميم يفتح النفس'], category:'social', crop:[315,572,257,125], desc:['A bold food campaign concept with warm colors, strong typography and an appetizing focal point.','تصور لحملة مطعم بألوان دافئة، كتابة جريئة وصورة رئيسية شهية تلفت الانتباه.'] },
  { id:'drive', title:['Drive · The future in motion','Drive · المستقبل بيتحرك'], category:'posters', crop:[585,572,252,125], desc:['An automotive poster concept that brings speed and precision to life through electric blue and light.','تصور لبوستر سيارات يجسد السرعة والدقة من خلال الأزرق الكهربائي والإضاءة.'] },
  { id:'future', title:['Your future starts here','مستقبلك بيبدأ هنا'], category:'social', crop:[52,708,250,129], desc:['An education campaign concept with a fresh blue palette and a clear, approachable message.','تصور لحملة تعليمية بألوان زرقاء منعشة ورسالة واضحة وقريبة من الجمهور.'] },
  { id:'volt', title:['VOLT · Everyday essentials','VOLT · أساسيات كل يوم'], category:'packaging', crop:[315,708,257,129], desc:['A men’s skincare packaging presentation combining a clean black identity with natural accents.','عرض لتصميم عبوات عناية رجالية يجمع بين هوية سوداء بسيطة ولمسات طبيعية.'] },
  { id:'coffee', title:['A better day, a better coffee','بداية أحلى مع كل قهوة'], category:'branding', crop:[585,708,252,129], desc:['A coffee brand concept shaped by rich browns, warm lighting and an inviting product scene.','تصور لعلامة قهوة بدرجات بنية غنية وإضاءة دافئة ومشهد منتج جذاب.'] },
  { id:'collection', title:['New collection · New attitude','تشكيلة جديدة · شخصية مختلفة'], category:'social', crop:[52,848,250,133], desc:['A fashion campaign concept with an understated palette and a confident editorial composition.','تصور لحملة أزياء بألوان هادئة وتكوين بصري واثق مستوحى من المجلات.'] },
  { id:'discover', title:['Discover a little more','اكتشف العالم'], category:'posters', crop:[315,848,257,133], desc:['A travel poster concept pairing an expansive coastal view with bold Arabic typography.','تصور لبوستر سفر يجمع إطلالة ساحلية واسعة مع خطوط عربية قوية.'] },
  { id:'tech', title:['Modern tech · Feel the difference','Modern Tech · حس بالفرق'], category:'social', crop:[585,848,252,133], desc:['A technology campaign concept using violet lighting and a sculptural product composition.','تصور لحملة تقنية بإضاءة بنفسجية وتكوين منتج يبرز التفاصيل والشكل.'] }
];
export function selectProjects(category) { return category === 'all' ? projects : projects.filter(p => p.category === category); }
export const projectDetails = {
  noir:{palette:['#21170F','#C89B53','#F3E5CD'],tone:'#eee6da',focus:['Luxury fragrance campaign','حملة عطر فاخر'],deliverables:[['Art direction','توجيه فني'],['Campaign key visual','التصميم الرئيسي للحملة'],['Brand presentation','عرض الهوية']]},
  tasty:{palette:['#3C1809','#FFB321','#EE4B25'],tone:'#fff0d7',focus:['Food that catches the eye','تصميم يفتح النفس'],deliverables:[['Social campaign','حملة سوشيال'],['Offer layout','تصميم عرض'],['Visual hierarchy','تسلسل بصري']]},
  drive:{palette:['#081727','#1688D0','#CCDFF4'],tone:'#e0edf8',focus:['Movement, precision, energy','حركة ودقة وطاقة'],deliverables:[['Advertising poster','بوستر إعلاني'],['Product composition','تكوين المنتج'],['Digital banner','بانر رقمي']]},
  future:{palette:['#1048C1','#56BFFF','#EDF8FF'],tone:'#e8f4ff',focus:['A clearer start to the future','بداية أوضح للمستقبل'],deliverables:[['Arabic typography','كتابة عربية'],['Enrollment campaign','حملة تسجيل'],['Social visual','تصميم سوشيال']]},
  volt:{palette:['#151C1D','#698764','#DBE2DD'],tone:'#e4e9e4',focus:['Everyday care, considered design','عناية يومية بتصميم مدروس'],deliverables:[['Packaging concept','تصور عبوة'],['Product presentation','عرض المنتج'],['Visual direction','اتجاه بصري']]},
  coffee:{palette:['#382014','#A8672D','#F0DEBE'],tone:'#eee1d2',focus:['Warmth in every detail','دفء في كل تفصيلة'],deliverables:[['Brand concept','تصور هوية'],['Product scene','مشهد منتج'],['Campaign visual','تصميم حملة']]},
  collection:{palette:['#181C22','#697078','#E9E9E7'],tone:'#e7e9eb',focus:['A confident new collection','تشكيلة جديدة بثقة'],deliverables:[['Fashion campaign','حملة أزياء'],['Editorial layout','تكوين تحريري'],['Social visual','تصميم سوشيال']]},
  discover:{palette:['#12245C','#41B7D7','#F0D6BE'],tone:'#e5f4f6',focus:['An invitation to explore','دعوة للاكتشاف'],deliverables:[['Travel poster','بوستر سياحي'],['Arabic typography','كتابة عربية'],['Destination campaign','حملة وجهة سياحية']]},
  tech:{palette:['#141029','#8549E4','#CFB1FF'],tone:'#ece5fa',focus:['Technology with character','تكنولوجيا بشخصية'],deliverables:[['Product campaign','حملة منتج'],['Lighting direction','اتجاه الإضاءة'],['Social visual','تصميم سوشيال']]}
};
// To use a Canva export, set image to a relative PNG/WebP/JPG path here.
// Leave it empty to preserve the original reference crop.
projects.forEach(project => Object.assign(project, projectDetails[project.id], { image: project.image || '' }));
export function adjacentProject(id, category, step) {
  const items=selectProjects(category),index=items.findIndex(project=>project.id===id);
  return items[(Math.max(0,index)+step+items.length)%items.length];
}
export function inquiryBody({ name, email, service, message }) { return `Hi Youssef,\n\n${message.trim()}\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nService: ${service}`; }
export function inquiryLink(values, channel) { const body = inquiryBody(values); return channel === 'whatsapp' ? `https://wa.me/${contact.phone}?text=${encodeURIComponent(body)}` : `mailto:${contact.email}?subject=${encodeURIComponent('Design project enquiry — ' + values.name.trim())}&body=${encodeURIComponent(body)}`; }
