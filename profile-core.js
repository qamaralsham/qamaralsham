// ==============================================
// profile-core.js v5.0 — Final
// ==============================================

let currentUser = null, targetUser = null, viewMode = 'owner';
let bgType = 'color', bgValue = '#050508', musicURL = null, musicPlaying = false;
let nameColor = null, nameGradient = null, nameFrame = null, nameShape = null, nameGlow = 'none';
let nameSize = 20;
let frameInset = -8;
let _localLockUntil = 0;
let _lastUserHash = '';
let _iLiked = false;
let _isVisitorCollapsed = false;

const IMGBB = '80fd32c4ef79b5f25fbcf0893547de4f';
const FRAMES = [];

const COLORS = ['#ffffff','#000000','#ffd700','#ff8c00','#ff69b4','#ff1493','#e0115f','#ff4757','#ff0000','#ff6347','#ff4500','#ffa500','#feca57','#ffff00','#adff2f','#39ff14','#00cc00','#00ff88','#2ecc71','#00b894','#00f3ff','#00bfff','#00bcd4','#1e90ff','#3498db','#0066ff','#0000ff','#8a2be2','#a855f7','#7c3aed','#6c5ce7','#9b59b6','#ff00ff','#da70d6','#e84393','#c0c0c0','#808080','#696969','#8b4513','#ff006e'];

const GRADS = [['#ffd700','#ff8c00'],['#ff69b4','#ff1493'],['#00f3ff','#0066ff'],['#39ff14','#00cc00'],['#a855f7','#7c3aed'],['#e0115f','#ff4757'],['#feca57','#ff9f43'],['#00b894','#0984e3'],['#fd79a8','#e84393'],['#6c5ce7','#a29bfe'],['#74b9ff','#0984e3'],['#55efc4','#00b894'],['#ffeaa7','#fdcb6e'],['#e17055','#d35400'],['#81ecec','#00cec9'],['#fab1a0','#e17055'],['#ffffff','#cccccc'],['#000000','#333333'],['#ffd700','#ff006e'],['#00ff88','#0066ff'],['#ff0055','#ffd700'],['#8b00ff','#ff006e'],['#00f3ff','#ff00ff'],['#ffcc00','#ff6699'],['#00ffcc','#0066ff'],['#ff66cc','#9900
