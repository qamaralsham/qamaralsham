(function(){
'use strict';
if(window.__ftUploadFixV1)return;
window.__ftUploadFixV1=true;

function toast(i,m){if(typeof showToast==='function')showToast(i,m);}

// إنشاء file inputs
function mkInput(accept){
var fi=document.createElement('input');
fi.type='file';
fi.accept=accept;
fi.style.display='none';
document.body.appendChild(fi);
return fi;
}

var inputFiles=mkInput('image/*,video/*,audio/*');
var inputAudio=mkInput('audio/*');
var inputVideo=mkInput('video/*');

async function doUpload(fi,forceType){
var file=fi.files&&fi.files[0];
if(!file)return;
fi.value='';
var type=forceType||'auto';
if(type==='auto'){
if(file.type.indexOf('video/')===0)type='video';
else if(file.type.indexOf('audio/')===0)type='audio';
else type='image';
}
var maxMb=type==='video'?50:type==='audio'?30:20;
if(file.size/(1024*1024)>maxMb){
toast('fa-exclamation-triangle','⚠️ الحد '+maxMb+'MB');
return;
}
toast('fa-spinner','⏳ جاري الرفع...');
try{
if(!window.UploadService||typeof window.UploadService.upload!=='function'){
throw new Error('خدمة الرفع غير جاهزة');
}
var url=await window.UploadService.upload(file);
if(!url)throw new Error('لم يرجع رابط');
var pm=document.getElementById('private-chat-modal');
var isPm=pm&&pm.classList.contains('open');
var inputId=isPm?'pc-input':'message-input';
var inp=document.getElementById(inputId);
if(!inp)throw new Error('حقل الإدخال غير موجود');
var token;
if(file.type.indexOf('image/')===0)token='[img:'+url+']';
else if(file.type.indexOf('video/')===0)token='[video:'+url+']';
else if(file.type.indexOf('audio/')===0)token='[audio:'+url+']';
else token='[img:'+url+']';
var cur=inp.value;
inp.value=(cur?cur+' ':'')+token+' ';
try{inp.focus();}catch(e){}
toast('fa-check','✅ تم الرفع — اضغط إرسال');
}catch(err){
console.error('FT upload failed:',err);
toast('fa-times','⚠️ '+(err.message||'فشل الرفع'));
}
}

inputFiles.onchange=function(){doUpload(this,'auto');};
inputAudio.onchange=function(){doUpload(this,'audio');};
inputVideo.onchange=function(){doUpload(this,'video');};

function closeToolbar(){
var t=document.getElementById('floating-toolbar');
if(t)t.classList.remove('open');
var b=document.getElementById('plus-btn');
if(b)b.classList.remove('active');
}

// اربط الأزرار بعد بناء الشريط
var attempts=0;
var t=setInterval(function(){
attempts++;
var tb=document.getElementById('floating-toolbar');
if(!tb||!tb.getAttribute('data-v2')){
if(attempts>=60)clearInterval(t);
return;
}

// زر ملفات
var filesBtn=tb.querySelector('[data-action="files"]');
if(filesBtn&&!filesBtn.__ftFix){
filesBtn.__ftFix=true;
filesBtn.onclick=function(e){
e.preventDefault();e.stopPropagation();
closeToolbar();
inputFiles.click();
};
}

// زر صوتيات
var audioBtn=tb.querySelector('[data-action="audio"]');
if(audioBtn&&!audioBtn.__ftFix){
audioBtn.__ftFix=true;
audioBtn.onclick=function(e){
e.preventDefault();e.stopPropagation();
closeToolbar();
inputAudio.click();
};
}

clearInterval(t);
console.log('✅ ft-upload-fix: files + audio buttons wired');
},500);
})();
