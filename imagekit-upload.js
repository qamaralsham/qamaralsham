(function(){
var K='public_/FlmUc1wNnTX/clb4B39vi/JjwE=';
function up(f){
var d=new FormData();
d.append('file',f);
d.append('fileName',f.name||('f'+Date.now()));
d.append('publicKey',K);
return fetch('https://upload.imagekit.io/api/v1/files/upload',{method:'POST',body:d})
.then(function(r){return r.json()})
.then(function(x){if(x.url)return x.url;throw new Error(x.message||'fail')});
}
window.UploadService=window.UploadService||{};
var o=window.UploadService.upload;
window.UploadService.upload=function(f){
return up(f).catch(function(e){
console.warn('IK failed:',e.message);
if(o)return o.call(this,f);
throw e;
});
};
console.log('✅ ImageKit ready');
})();
