const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.site-nav');
if(menuButton&&navigation){menuButton.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});}
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});reveals.forEach(item=>observer.observe(item));}else{reveals.forEach(item=>item.classList.add('visible'));}
