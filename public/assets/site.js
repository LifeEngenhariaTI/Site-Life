const menu=document.querySelector('.mobile-menu');
const links=document.querySelector('.links');
function closeMenu(){
 links?.classList.remove('open');
 menu?.setAttribute('aria-expanded','false');
 menu?.setAttribute('aria-label','Abrir menu');
 document.querySelectorAll('.nav-menu[open]').forEach(el=>el.removeAttribute('open'));
}
menu?.addEventListener('click',()=>{
 const open=links.classList.toggle('open');
 menu.setAttribute('aria-expanded',String(open));
 menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
});
document.addEventListener('click',event=>{
 if(!event.target.closest('.header'))closeMenu();
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){
  const opened=document.querySelector('.nav-menu[open]');
  if(opened){opened.removeAttribute('open');opened.querySelector('summary').focus()}
  else if(links?.classList.contains('open')){closeMenu();menu.focus()}
 }
});
links?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.querySelectorAll('.nav-menu').forEach(el=>el.addEventListener('toggle',()=>{
 if(el.open)document.querySelectorAll('.nav-menu').forEach(other=>{if(other!==el)other.open=false});
}));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
function routeOldAnchors(){
 const hash=location.hash.slice(1);
 if(!hash)return;
 const homeRoutes={empresa:'/empresa/',estrutura:'/empresa/#estrutura',areas:'/servicos/',servicos:'/servicos/',mercados:'/mercados/',industria:'/mercados/industria/',saude:'/mercados/saude/',infraestrutura:'/mercados/infraestrutura/',edificacoes:'/mercados/edificacoes/',sustentabilidade:'/empresa/#sustentabilidade','projetos-realizados':'/na-pratica/',atuacao:'/empresa/',processo:'/contato/#processo',contato:'/contato/'};
 if(location.pathname==='/'&&homeRoutes[hash]){location.replace(homeRoutes[hash]);return}
 const areas={refrigeracao:'refrigeracao',saude:'saude','qualidade-ar':'qualidade-do-ar',engenharia:'projetos-automacao'};
 if(location.pathname==='/servicos/'&&areas[hash]){location.replace('/servicos/'+areas[hash]+'/');return}
 const target=document.getElementById(hash);
 if(target?.matches('details')){target.open=true;target.scrollIntoView()}
}
routeOldAnchors();
window.addEventListener('hashchange',routeOldAnchors);
document.querySelectorAll('[data-mail-form]').forEach(form=>form.addEventListener('submit',event=>{
 event.preventDefault();
 if(!form.checkValidity()){form.reportValidity();return}
 const data=new FormData(form),lines=[];
 data.forEach((value,key)=>{if(String(value).trim())lines.push(key+': '+value)});
 const recipient=form.dataset.recipient;
 const prefix=form.dataset.subjectPrefix||'Comunicação Life';
 const detail=data.get('Assunto')||data.get('Solicitação')||data.get('Tipo')||'Nova mensagem';
 const subject=prefix+' - '+detail;
 const body='Mensagem preparada pelo site da Life Engenharia\n\n'+lines.join('\n\n');
 const status=form.querySelector('[data-form-status]');
 if(status)status.textContent='Abrindo seu aplicativo de e-mail para enviar a mensagem a '+recipient+'.';
 window.location.href='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}));
