(function(){
'use strict';
if(window.__imagekitUploadV2)return;
window.__imagekitUploadV2=true;

var K='public_/FlmUc1wNnTX/clb4B39vi/JjwE=';

function show(msg,type){
var color=type==='error'?'#ff4444':type==='success'?'#84cc16':'#ffd700';
var m=document.createElement('div');
m.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:rgba(15,15,25,0.98);border:2px solid '+color+';color:#fff;padding:14px 18px;border-radius:12px;font-family:Cairo,sans-serif;font-size:13px;font-weight:900;z-index:9999999;max-width:90vw;direction:rtl;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.9);line-height:1.6;word-break:break-word;';
m.textContent=msg;
document.body.appendChild(m);
setTimeout(function(){
if(m.parentNode)m.parentNode.removeChild(m);
},type==='error'?8000:3500);
}

function up(f){
var d=new FormData();
d.append('file',f);
d.append('fileName',f.name||('f'+Date.now()));
d.append('publicKey',K);
return fetch('https://upload.imagekit.io/api/v1/files/upload',{method:'POST',body:d})
.then(function(r){
return r.text().then(function(t){
var j;
try{j=JSON.parse(t);}catch(e){j={raw:t};}
return {status:r.status,ok:r.ok,data:j};
});
})
.then(function(res){
if(res.ok&&res.data.url){
return res.data.url;
}
var err=res.data.message||res.data.error||res.data.raw||('HTTP '+res.status);
throw new Error('['+res.status+'] '+err);
});
}

window.UploadService=window.UploadService||{};
var o=window.UploadService.upload;

window.UploadService.upload=function(f){
show('⏳ تجربة ImageKit...','info');
return up(f).then(function(url){
show('✅ ImageKit نجح!','success');
return url;
}).catch(function(e){
show('❌ ImageKit فشل: '+e.message,'error');
console.warn('IK failed:',e.message,e);
if(o){
show('↩️ استخدام الاحتياطي...','info');
return o.call(this,f);
}
throw e;
});
};

console.log('✅ imagekit-upload v2: ready (error visible)');
})();
