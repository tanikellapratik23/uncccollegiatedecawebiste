const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.site-nav');
if(menuButton&&navigation){menuButton.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});}
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});reveals.forEach(item=>observer.observe(item));}else{reveals.forEach(item=>item.classList.add('visible'));}
const lightbox=document.querySelector('.lightbox');
if(lightbox){const image=lightbox.querySelector('img');const caption=lightbox.querySelector('p');document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{image.src=item.dataset.full;image.alt=item.querySelector('img').alt;caption.textContent=item.querySelector('span').textContent;lightbox.showModal()}));lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close()});}
