var $  = function(s){ return document.querySelector(s); };
var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
function rnd(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function shuffle(a){ var r=a.slice(); for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i]; r[i]=r[j]; r[j]=t; } return r; }
if(!String.prototype.padStart){ String.prototype.padStart=function(n){ var s=String(this); while(s.length<n) s='0'+s; return s; }; }
function fmtTime(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0'); }
function ssGet(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }
function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }

/* ---------------- Audio ---------------- */
var AudioFX = (function(){
  var ctx=null, noiseBuf=null, muted=false;
  function ensure(){
    try{
      if(!ctx){
        ctx = new (window.AudioContext||window.webkitAudioContext)();
        noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate*1.2), ctx.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for(var i=0;i<d.length;i++) d[i] = Math.random()*2-1;
      }
      if(ctx.state==='suspended'){ try{ ctx.resume(); }catch(e2){} }
    }catch(e){ ctx=null; }
    return ctx;
  }
  function now(){ var c=ensure(); return c? c.currentTime : null; }
  function beep(f,t0,dur,type,vol){
    try{
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type=type||'sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol||.2,t0+.012);
      g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0+dur+.05);
    }catch(e){}
  }
  function noise(t0,dur,freq,vol,type){
    try{
      var s=ctx.createBufferSource(); s.buffer=noiseBuf;
      var f=ctx.createBiquadFilter(); f.type=type||'bandpass'; f.frequency.value=freq; f.Q.value=.9;
      var g=ctx.createGain();
      g.gain.setValueAtTime(vol||.25,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
      s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(t0); s.stop(t0+dur+.05);
    }catch(e){}
  }
  return {
    ensure:ensure,
    isMuted:function(){ return muted; },
    toggle:function(){ muted=!muted; return muted; },
    good:function(){ if(muted) return; var t=now(); if(t==null) return; beep(523,t,.16); beep(659,t+.09,.16); beep(784,t+.18,.22); },
    bad:function(){ if(muted) return; var t=now(); if(t==null) return; beep(233,t,.2,'triangle',.22); beep(165,t+.13,.3,'triangle',.22); },
    pop:function(){ if(muted) return; var t=now(); if(t==null) return;
      try{ var o=ctx.createOscillator(), g=ctx.createGain();
        o.frequency.setValueAtTime(500+Math.random()*250,t);
        o.frequency.exponentialRampToValueAtTime(900+Math.random()*200,t+.07);
        g.gain.setValueAtTime(.22,t); g.gain.exponentialRampToValueAtTime(.0001,t+.09);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+.12); }catch(e){} },
    ding:function(){ if(muted) return; var t=now(); if(t==null) return; beep(880,t,.12); beep(1320,t+.06,.18); },
    tick:function(){ if(muted) return; var t=now(); if(t==null) return; beep(1250,t,.04,'sine',.07); },
    key:function(){ if(muted) return; var t=now(); if(t==null) return; noise(t,.025,3200,.1,'highpass'); },
    whoosh:function(){ if(muted) return; var t=now(); if(t==null) return; noise(t,.25,2400,.2,'highpass'); },
    whistle:function(){ if(muted) return; var t=now(); if(t==null) return; beep(2350,t,.14,'square',.12); beep(2350,t+.2,.34,'square',.12); },
    cheer:function(){ if(muted) return; var t=now(); if(t==null) return;
      noise(t,.9,950,.35); beep(392,t+.05,.5,'sawtooth',.05); beep(494,t+.15,.5,'sawtooth',.05); beep(587,t+.25,.6,'sawtooth',.05); },
    aww:function(){ if(muted) return; var t=now(); if(t==null) return;
      beep(330,t,.25,'triangle',.16); beep(262,t+.18,.3,'triangle',.16); beep(196,t+.36,.45,'triangle',.16); },
    fanfare:function(){ if(muted) return; var t=now(); if(t==null) return;
      var seq=[523,659,784,1046], i;
      for(i=0;i<seq.length;i++) beep(seq[i], t+i*.12, .28, 'triangle', .2);
      for(i=0;i<seq.length;i++) beep(seq[i], t+.55, .7, 'sine', .1); }
  };
})();

/* ---------------- Math ---------------- */
function lin(a,b){
  var s='';
  if(a!==0) s += (a===1?'x': a===-1?'-x': a+'x');
  if(b!==0){
    if(s==='') s += (b>0? String(b) : '-'+Math.abs(b));
    else s += (b>0? ' + '+b : ' - '+Math.abs(b));
  }
  if(!s) s='0';
  return s.replace(/-/g,'\u2212');
}
function mathHTML(s){ return String(s).replace(/x/g,'<i class="vx">x</i>'); }
function subX(s,v){
  var t=String(v);
  s = String(s).replace(/(\d+)\s*x/g, '$1('+t+')');
  s = s.replace(/(^|[\s(\u2212+\-])x/g, '$1'+t);
  return s;
}
var calcErr='Syntax ERROR';
function calcEval(src, x, ans){
  var s = String(src);
  var i=0;
  function fail(m){ calcErr=m; throw 0; }
  function ws(){ while(i<s.length && (s[i]===' '||s[i]==='\t')) i++; }
  function take(tok){ if(s.indexOf(tok,i)===i){ i+=tok.length; return true; } return false; }
  function primary(){
    ws();
    if(take('\u2212')) return -primary();
    if(take('-'))  return -primary();
    if(take('+'))  return primary();
    if(take('(')){ var v=expression(); ws(); if(!take(')')) fail('Syntax ERROR'); return v; }
    if(take('\u221a')){ ws(); if(!take('(')) fail('Syntax ERROR'); var r=expression(); ws(); if(!take(')')) fail('Syntax ERROR'); if(r<0) fail('Math ERROR'); return Math.sqrt(r); }
    if(take('log')){ ws(); if(!take('(')) fail('Syntax ERROR'); var l=expression(); ws(); if(!take(')')) fail('Syntax ERROR'); if(l<=0) fail('Math ERROR'); return Math.log10(l); }
    if(take('ln')){ ws(); if(!take('(')) fail('Syntax ERROR'); var n=expression(); ws(); if(!take(')')) fail('Syntax ERROR'); if(n<=0) fail('Math ERROR'); return Math.log(n); }
    if(take('Ans')) return (ans==null? 0 : ans);
    if(s[i]==='X'||s[i]==='x'){ if(x==null) fail('Syntax ERROR'); i++; return x; }
    var j=i;
    while(j<s.length && ((s[j]>='0'&&s[j]<='9')||s[j]==='.')) j++;
    if(j===i) fail('Syntax ERROR');
    var num=parseFloat(s.slice(i,j)); i=j;
    if(isNaN(num)) fail('Syntax ERROR');
    return num;
  }
  function power(){
    var v=primary(); ws();
    if(take('^')) return Math.pow(v, power());
    if(s[i]==='\u00b2'){ i++; return v*v; }
    return v;
  }
  function term(){
    var v=power();
    for(;;){
      ws();
      if(take('\u00d7')||take('*')){ v*=power(); }
      else if(take('\u00f7')||take('/')){ var d=power(); if(d===0) fail('Math ERROR'); v/=d; }
      else if(s[i]==='(' || s[i]==='\u221a' || s.indexOf('log',i)===i || s.indexOf('ln',i)===i || s.indexOf('Ans',i)===i || s[i]==='X' || s[i]==='x'){ v*=power(); }
      else return v;
    }
  }
  function expression(){
    var v=term();
    for(;;){
      ws();
      if(take('+')) v+=term();
      else if(take('\u2212')||take('-')) v-=term();
      else return v;
    }
  }
  try{
    var val=expression(); ws();
    if(i<s.length) fail('Syntax ERROR');
    if(!isFinite(val)) fail('Math ERROR');
    return Math.round(val*1e9)/1e9;
  }catch(e){ return null; }
}
function pickX(ex){
  var c=[], v;
  for(v=2; v<=13; v++) if(ex.indexOf(v)<0) c.push(v);
  return c.length? pick(c) : 17;
}

/* ---------------- Emblems ---------------- */
var CMP_MAIN='<path d="M32 14.5 L37 29.5 L32 32 Z" fill="#ecc87e" stroke="#8a6a2a" stroke-width=".5"/><path d="M32 14.5 L27 29.5 L32 32 Z" fill="#8a6a2a"/>';
var CMP_DIA='<path d="M32 21 L35.2 29.6 L32 32 Z" fill="#d2a44d" stroke="#8a6a2a" stroke-width=".4"/><path d="M32 21 L28.8 29.6 L32 32 Z" fill="#5c4a24"/>';
var CMP_TXT='font-family="Georgia,serif" font-size="6.5" font-weight="700" fill="#d2a44d"';
var EMBLEMS={
  akram:'<svg viewBox="0 0 64 64">'+
    '<circle cx="32" cy="32" r="30" fill="none" stroke="#8a6a2a" stroke-width="1.6"/>'+
    '<circle cx="32" cy="32" r="27" fill="none" stroke="#d2a44d" stroke-width="3.2" stroke-dasharray="1.1 5.35" opacity=".9"/>'+
    '<circle cx="32" cy="32" r="21.5" fill="none" stroke="#d2a44d" stroke-width=".8" opacity=".55"/>'+
    '<text x="32" y="11.8" text-anchor="middle" '+CMP_TXT+'>N</text>'+
    '<text x="55.2" y="34.4" text-anchor="middle" '+CMP_TXT+'>E</text>'+
    '<text x="32" y="58.2" text-anchor="middle" '+CMP_TXT+'>S</text>'+
    '<text x="8.8" y="34.4" text-anchor="middle" '+CMP_TXT+'>W</text>'+
    '<g>'+CMP_MAIN+'</g>'+
    '<g transform="rotate(90 32 32)">'+CMP_MAIN+'</g>'+
    '<g transform="rotate(180 32 32)">'+CMP_MAIN+'</g>'+
    '<g transform="rotate(270 32 32)">'+CMP_MAIN+'</g>'+
    '<g transform="rotate(45 32 32)">'+CMP_DIA+'</g>'+
    '<g transform="rotate(135 32 32)">'+CMP_DIA+'</g>'+
    '<g transform="rotate(225 32 32)">'+CMP_DIA+'</g>'+
    '<g transform="rotate(315 32 32)">'+CMP_DIA+'</g>'+
    '<circle cx="32" cy="32" r="2.6" fill="#ecc87e" stroke="#8a6a2a" stroke-width="1"/>'+
    '</svg>',
  mohamed:'<svg viewBox="0 0 64 64" fill="none">'+
    '<circle cx="32" cy="10" r="4.6" stroke="#d2a44d" stroke-width="2.6"/>'+
    '<path d="M32 14.5 V52" stroke="#d2a44d" stroke-width="2.6" stroke-linecap="round"/>'+
    '<path d="M22 20 H42" stroke="#d2a44d" stroke-width="2.6" stroke-linecap="round"/>'+
    '<path d="M32 52 C22 52 14 46 13.5 38 M32 52 C42 52 50 46 50.5 38" stroke="#d2a44d" stroke-width="2.6" stroke-linecap="round"/>'+
    '<path d="M13.5 38 L7.5 42 L13 46 Z" fill="#d2a44d"/>'+
    '<path d="M50.5 38 L56.5 42 L51 46 Z" fill="#d2a44d"/></svg>',
  ghost:'<svg viewBox="0 0 64 64"><path d="M32 6 C21 6 14 14 14 24 V52 L20 46 L26 52 L32 46 L38 52 L44 46 L50 52 V24 C50 14 43 6 32 6 Z" fill="rgba(210,164,77,.15)" stroke="#d2a44d" stroke-width="2.5"/><circle cx="26" cy="24" r="3.4" fill="#ecc87e"/><circle cx="38" cy="24" r="3.4" fill="#ecc87e"/></svg>'
};
var TEACHER_META={
  akram:{ name:'Mr. Akram', role:'Founder & Designer', tag:'The Compass \u00b7 Foundations Track' },
  mohamed:{ name:'Mr. Mohamed', role:'EST & SAT Coach', tag:'The Anchor \u00b7 EST & SAT Track' }
};
var PROMPT_A='Simplify the expression';
var PROMPT_M='Which expression is equivalent to the one above?';

/* ---------------- Hints (طريقة الآلة) ---------------- */
var HINT_KEY='Open the calculator and type the whole expression exactly as written \u2014 press <b>ALPHA</b> then <span class="mth">)</span> to type each <span class="mth"><i class="vx">x</i></span>.';
var HINT_CALC='Press <b>CALC</b>, give <i class="vx">x</i> a fresh number (never 0, never 1, and never a number from the question), press <b>=</b> and <b>keep the result in your head</b> \u2014 then test the four choices with the <b>same</b> <i class="vx">x</i>. The one that gives your remembered number is the answer.';

/* ---------------- Generators: Mr. Akram ---------------- */
function genL1(){
  for(var t=0;t<60;t++){
    var a1=rnd(1,9), a2=rnd(1,9), c1=rnd(1,9), c2=rnd(1,9);
    var s2=pick(['+','-']), s3=pick(['+','-']);
    var a = a1 + (s2==='+'?a2:-a2); if(a===0) continue;
    var b = c1 + (s3==='+'?c2:-c2);
    var text = Math.random()<.5 ? (a1+'x + '+c1+' '+s2+' '+a2+'x '+s3+' '+c2) : (c1+' + '+a1+'x '+s2+' '+a2+'x '+s3+' '+c2);
    return { text:text, a:a, b:b, ex:[a1,a2,c1,c2], tag:'Like terms', hint:[HINT_KEY, HINT_CALC] };
  }
  return null;
}
function genL2(){
  for(var t=0;t<60;t++){
    var a1=rnd(2,9), a2=rnd(1,9), a3=rnd(1,9), c1=rnd(1,9), c2=rnd(1,9);
    var s2=pick(['+','-']), s3=pick(['+','-']), t1=pick(['+','-']), t2=pick(['+','-']);
    var a = a1 + (s2==='+'?a2:-a2) + (s3==='+'?a3:-a3); if(a===0) continue;
    var b = c1 + (t2==='+'?c2:-c2);
    var text = a1+'x '+s2+' '+a2+'x '+t1+' '+c1+' '+s3+' '+a3+'x '+t2+' '+c2;
    return { text:text, a:a, b:b, ex:[a1,a2,a3,c1,c2], tag:'Long expressions',
      hint:['Type every term and every sign carefully \u2014 one missed term changes the number completely. <b>ALPHA</b> then <span class="mth">)</span> for each <i class="vx">x</i>.', HINT_CALC] };
  }
  return null;
}
function genL3(){
  var a=rnd(2,9), b=rnd(2,9), s=pick(['+','-']);
  var B = s==='+'? a*b : -a*b;
  return { text:(a+'(x '+s+' '+b+')'), a:a, b:B, ex:[a,b], tag:'Distributive',
    hint:['Type the bracket exactly as shown: number, <span class="mth">(</span>, <i class="vx">x</i>, sign, number, <span class="mth">)</span>. <b>ALPHA</b> then <span class="mth">)</span> gives you the <i class="vx">x</i>.',
      'After <b>CALC</b> with a fresh <i class="vx">x</i>, press <b>=</b> and keep the number in your head. A correct choice must give back exactly that number with the same <i class="vx">x</i>.'] };
}
function genL4(){
  for(var t=0;t<60;t++){
    var a = Math.random()<.55 ? -rnd(2,5) : rnd(2,6);
    var b=rnd(2,9), s=pick(['+','-']);
    var c=rnd(1,9), sc=pick(['+','-']);
    var d=rnd(2,9), sd=pick(['+','-']);
    var A = a + (sc==='+'?c:-c); if(A===0) continue;
    var Bp = s==='+'? a*b : -a*b;
    var B = Bp + (sd==='+'?d:-d);
    var text = a+'(x '+s+' '+b+') '+sc+' '+c+'x '+sd+' '+d;
    return { text:text, a:A, b:B, ex:[Math.abs(a),b,c,d], tag:'Distribute & combine',
      hint:['Type the whole line exactly \u2014 including the sign in front of the bracket. <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>.',
        'Use one fresh <i class="vx">x</i> for the whole question: <b>CALC</b>, type it, <b>=</b>, remember the number. Then test each choice with that same <i class="vx">x</i> and look for the match.'] };
  }
  return null;
}
function genL5(){
  var a=rnd(2,7), b=rnd(2,9), s1=pick(['+','-']);
  var c=rnd(2,7), d=rnd(2,9), s2=pick(['+','-']);
  var A=a+c, B=(s1==='+'?a*b:-a*b)+(s2==='+'?c*d:-c*d);
  return { text:(a+'(x '+s1+' '+b+') + '+c+'(x '+s2+' '+d+')'), a:A, b:B, ex:[a,b,c,d], tag:'Two brackets',
    hint:['No hand-expanding needed \u2014 just type both brackets exactly as they appear. <b>ALPHA</b> then <span class="mth">)</span> for each <i class="vx">x</i>.',
      'One fresh <i class="vx">x</i> for everything: <b>CALC</b>, type it, <b>=</b>, remember the result, then test all four choices with the same <i class="vx">x</i>.'] };
}
function genL6(){
  for(var t=0;t<60;t++){
    if(Math.random()<.6){
      var a=rnd(3,8), c=rnd(1,a-1), b=rnd(2,9), d=rnd(2,9);
      var s1=pick(['+','-']), s2=pick(['+','-']);
      var A=a-c, B=(s1==='+'?a*b:-a*b)-(s2==='+'?c*d:-c*d);
      var text = a+'(x '+s1+' '+b+') \u2212 '+c+'(x '+s2+' '+d+')';
      return { text:text, a:A, b:B, ex:[a,b,c,d], tag:'Subtracting brackets',
        hint:['Read the expression once from left to right, then type it exactly \u2014 signs included. <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>.',
          '<b>CALC</b> \u2192 fresh <i class="vx">x</i> (not 0, 1, or any number in the question) \u2192 <b>=</b> \u2192 remember the number. Same <i class="vx">x</i> on every choice: find the match.'] };
    }
    var a2=rnd(3,9), c2=rnd(1,a2-1), d2=rnd(2,9), sp=pick(['+','-']);
    var A2=a2-c2, B2 = sp==='+'? -d2 : d2;
    var text2 = a2+'x \u2212 ('+c2+'x '+sp+' '+d2+')';
    return { text:text2, a:A2, b:B2, ex:[a2,c2,d2], tag:'Subtracting brackets',
      hint:['Type it exactly as it looks \u2014 the minus, the bracket, everything. <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>.', HINT_CALC] };
  }
  return null;
}

/* ---------------- Generators: Mr. Mohamed (EST/SAT) ---------------- */
function genM1(){
  for(var t=0;t<60;t++){
    var a1=rnd(5,12), a2=rnd(3,9), c1=rnd(10,19), c2=rnd(6,15);
    var s2=pick(['+','-']), s3=pick(['+','-']);
    var a = a1 + (s2==='+'?a2:-a2); if(a===0) continue;
    var b = c1 + (s3==='+'?c2:-c2);
    var text = Math.random()<.5 ? (a1+'x + '+c1+' '+s2+' '+a2+'x '+s3+' '+c2) : (c1+' + '+a1+'x '+s2+' '+a2+'x '+s3+' '+c2);
    return { text:text, a:a, b:b, ex:[a1,a2,c1,c2], tag:'Like terms', hint:[HINT_KEY, HINT_CALC] };
  }
  return null;
}
function genM2(){
  for(var t=0;t<60;t++){
    var a1=rnd(4,9), a2=rnd(2,7), a3=rnd(1,6), c1=rnd(8,19), c2=rnd(4,14);
    var s2=pick(['+','-']), s3=pick(['+','-']), t1=pick(['+','-']), t2=pick(['+','-']);
    var a = a1 + (s2==='+'?a2:-a2) + (s3==='+'?a3:-a3); if(a===0) continue;
    var b = c1 + (t2==='+'?c2:-c2);
    var text = a1+'x '+s2+' '+a2+'x '+t1+' '+c1+' '+s3+' '+a3+'x '+t2+' '+c2;
    return { text:text, a:a, b:b, ex:[a1,a2,a3,c1,c2], tag:'Long expressions',
      hint:['Type every term and every sign carefully \u2014 one missed term changes the number completely. <b>ALPHA</b> then <span class="mth">)</span> for each <i class="vx">x</i>.', HINT_CALC] };
  }
  return null;
}
function genM3(){
  var a=rnd(2,6), b=rnd(2,5), c=rnd(2,9), s=pick(['+','-']);
  var A=a*b, B=(s==='+'? a*c : -a*c);
  return { text:(a+'('+b+'x '+s+' '+c+')'), a:A, b:B, ex:[a,b,c], tag:'Distributive ax',
    hint:['The bracket contains a coefficient in front of <i class="vx">x</i> \u2014 type it too: for '+a+'('+b+'x '+s+' '+c+'), press '+a+', <span class="mth">(</span>, '+b+', <b>ALPHA</b>+<span class="mth">)</span> for <i class="vx">x</i>, '+s+' '+c+', <span class="mth">)</span>.',
      'One fresh <i class="vx">x</i> (not 0, 1, or any number in the question): <b>CALC</b>, type it, <b>=</b>, keep the number in your head \u2014 then test the choices with the same <i class="vx">x</i>.'] };
}
function genM4(){
  for(var t=0;t<60;t++){
    var a = Math.random()<.6 ? -rnd(2,5) : rnd(2,5);
    var b=rnd(2,5), c=rnd(2,9), s=pick(['+','-']);
    var c2=rnd(2,9), sc=pick(['+','-']);
    var d=rnd(2,12), sd=pick(['+','-']);
    var A = a*b + (sc==='+'?c2:-c2); if(A===0) continue;
    var B = (s==='+'? a*c : -a*c) + (sd==='+'?d:-d);
    var text = a+'('+b+'x '+s+' '+c+') '+sc+' '+c2+'x '+sd+' '+d;
    return { text:text, a:A, b:B, ex:[Math.abs(a),b,c,c2,d], tag:'Negative distribution',
      hint:['Type the whole line exactly \u2014 the sign in front of the bracket belongs to the number after it. <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>.',
        'Same fresh <i class="vx">x</i> for the original and every choice: <b>CALC</b>, type it, <b>=</b>, remember the number, then hunt the match.'] };
  }
  return null;
}
function genM5(){
  var a=rnd(2,5), b=rnd(2,5), c=rnd(2,9), s1=pick(['+','-']);
  var e=rnd(2,5), f=rnd(2,5), g=rnd(2,9), s2=pick(['+','-']);
  var A=a*b+e*f, B=(s1==='+'?a*c:-a*c)+(s2==='+'?e*g:-e*g);
  return { text:(a+'('+b+'x '+s1+' '+c+') + '+e+'('+f+'x '+s2+' '+g+')'), a:A, b:B, ex:[a,b,c,e,f,g], tag:'Two brackets',
    hint:['Type both brackets exactly as they appear \u2014 coefficients inside included. <b>ALPHA</b> then <span class="mth">)</span> for each <i class="vx">x</i>.',
      'One fresh <i class="vx">x</i> for everything: <b>CALC</b>, type it, <b>=</b>, remember the number, then test all four choices with the same <i class="vx">x</i>.'] };
}
function genM6(){
  for(var t=0;t<60;t++){
    if(Math.random()<.6){
      var a=rnd(2,5), b=rnd(2,5), c=rnd(2,9), s1=pick(['+','-']);
      var e=rnd(1,4), f=rnd(2,5), g=rnd(2,9), s2=pick(['+','-']);
      var A=a*b-e*f;
      var B=(s1==='+'?a*c:-a*c)-(s2==='+'?e*g:-e*g);
      var text = a+'('+b+'x '+s1+' '+c+') \u2212 '+e+'('+f+'x '+s2+' '+g+')';
      return { text:text, a:A, b:B, ex:[a,b,c,e,f,g], tag:'Subtracting brackets',
        hint:['Type it exactly, signs included \u2014 the minus sits between the two brackets. <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>.',
          '<b>CALC</b> \u2192 fresh <i class="vx">x</i> \u2192 <b>=</b> \u2192 remember the number. Test every choice with that same <i class="vx">x</i> and find the match.'] };
    }
    var a2=rnd(4,9), c2=rnd(2,a2-1), d2=rnd(2,12), sp=pick(['+','-']);
    var A2=a2-c2, B2 = sp==='+'? -d2 : d2;
    var text2 = a2+'x \u2212 ('+c2+'x '+sp+' '+d2+')';
    return { text:text2, a:A2, b:B2, ex:[a2,c2,d2], tag:'Subtracting brackets',
      hint:['Type it exactly as it looks \u2014 the minus, the bracket, everything. <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>.', HINT_CALC] };
  }
  return null;
}

/* ---------------- Choices & lessons ---------------- */
function distractorsFor(q){
  var out=[], seen={}; seen[lin(q.a,q.b)]=1;
  function tryC(A,B){ var t=lin(A,B); if(t!=='0' && !seen[t]){ seen[t]=1; out.push({a:A,b:B}); } }
  tryC(q.a,-q.b); tryC(-q.a,q.b); tryC(0,q.a+q.b); tryC(q.a,q.b+q.a);
  tryC(q.a+(q.a>0?1:-1)*rnd(1,3), q.b);
  tryC(q.a, q.b+(q.b>=0?1:-1)*rnd(1,3));
  return shuffle(out);
}
function buildChoices(q, correctIdx){
  var opts=[null,null,null,null];
  opts[correctIdx]={a:q.a, b:q.b};
  var pool=distractorsFor(q), used={}; used[lin(q.a,q.b)]=1;
  for(var s=0;s<4;s++){
    if(s===correctIdx) continue;
    var c=null, p;
    for(p=0;p<pool.length;p++){ if(!used[lin(pool[p].a,pool[p].b)]){ c=pool[p]; break; } }
    var guard=0;
    while(!c && guard++<40){
      var f={a:q.a, b:q.b + rnd(1,6)*(Math.random()<.5?-1:1)};
      if(!used[lin(f.a,f.b)]) c=f;
    }
    if(!c) c={a:q.a, b:q.b+9};
    opts[s]=c; used[lin(c.a,c.b)]=1;
  }
  return opts;
}
function balancedSeq(n){
  var s=[];
  while(s.length<n){ var sh=shuffle([0,1,2,3]); for(var i=0;i<sh.length && s.length<n;i++) s.push(sh[i]); }
  return s;
}
function buildQuestions(lesson, seq){
  var n = lesson.master? 30:20, out=[], seen={}, guard=0;
  while(out.length<n && guard++<900){
    var q=lesson.gen();
    if(!q || seen[q.text]) continue;
    seen[q.text]=1;
    q.choices = buildChoices(q, seq[out.length]);
    q.correctIdx = seq[out.length];
    out.push(q);
  }
  return out;
}
var mixedGen=function(){
  var all=[genL1,genL2,genL3,genL4,genL5,genL6,genM1,genM2,genM3,genM4,genM5,genM6];
  return pick(all)();
};

var BANKS={
  akram:[
   { id:'l1', num:'01', title:'Combining Like Terms', desc:'Add and subtract terms that share the same variable.', gen:genL1, prompt:PROMPT_A,
     skills:['Identify the terms that contain the same variable','Type the whole expression on the calculator first','Test the choices with one fresh value of x'],
     worked:{ q:'2x + 5 + 3x \u2212 4', ex:[2,5,3,4], x:7, orig:'2(7) + 5 + 3(7) \u2212 4', ov:36,
       choices:[{t:'5x \u2212 1',v:34},{t:'5x + 1',v:36,ok:true},{t:'6x + 1',v:43},{t:'5x + 9',v:44}],
       ans:'5x + 1' } },
   { id:'l2', num:'02', title:'Longer Expressions', desc:'Stay organised when the expression grows longer.', gen:genL2, prompt:PROMPT_A,
     skills:['Collect every x-term before adding anything','A lone \u2212x counts as \u22121x','One fresh x for the whole question on the calculator'],
     worked:{ q:'4x \u2212 2 + 7x + 9 \u2212 x', ex:[4,2,7,9,1], x:7, orig:'4(7) \u2212 2 + 7(7) + 9 \u2212 7', ov:77,
       choices:[{t:'10x + 7',v:77,ok:true},{t:'x + 7',v:14},{t:'10x \u2212 7',v:63},{t:'11x + 7',v:84}],
       ans:'10x + 7' } },
   { id:'l3', num:'03', title:'The Distributive Property', desc:'Multiply a number into a bracket: a(x + b).', gen:genL3, prompt:PROMPT_A,
     skills:['The outside number multiplies BOTH inside terms','Type the bracket exactly on the calculator','The correct choice returns your remembered number'],
     worked:{ q:'3(x + 4)', ex:[3,4], x:7, orig:'3(7 + 4)', ov:33,
       choices:[{t:'3x + 12',v:33,ok:true},{t:'3x + 4',v:25},{t:'x + 12',v:19},{t:'7x',v:49}],
       ans:'3x + 12' } },
   { id:'l4', num:'04', title:'Brackets &amp; Combining', desc:'Distribute first \u2014 especially with negatives \u2014 then combine.', gen:genL4, prompt:PROMPT_A,
     skills:['Distribute before doing anything else','A negative outside flips both inner signs','Same fresh x tests the original and every choice'],
     worked:{ q:'\u22122(x \u2212 5) + 3x', ex:[2,5,3], x:7, orig:'\u22122(7 \u2212 5) + 3(7)', ov:17,
       choices:[{t:'x + 10',v:17,ok:true},{t:'5x + 10',v:45},{t:'x \u2212 10',v:-3},{t:'x + 2',v:9}],
       ans:'x + 10' } },
   { id:'l5', num:'05', title:'Two Brackets', desc:'Expand two brackets inside one expression.', gen:genL5, prompt:PROMPT_A,
     skills:['Expand each bracket on its own line','Type both brackets exactly as they appear','One fresh x for the original and all four choices'],
     worked:{ q:'2(x + 3) + 4(x \u2212 1)', ex:[2,3,4,1], x:7, orig:'2(7 + 3) + 4(7 \u2212 1)', ov:44,
       choices:[{t:'6x + 2',v:44,ok:true},{t:'6x + 4',v:46},{t:'8x + 2',v:58},{t:'6x \u2212 2',v:40}],
       ans:'6x + 2' } },
   { id:'master', num:'\u2605', title:'Master Challenge', desc:'Every skill from the five lessons, mixed together. 30 questions.',
     gen:function(){ return pick([genL1,genL2,genL3,genL4,genL5,genL6])(); }, master:true, prompt:PROMPT_A,
     skills:['Every skill from Lessons 01\u201305 mixed together','Read the whole expression before you type it','The calculator method always finds the answer'],
     worked:{ q:'2(x \u2212 3) + 5x + 4', ex:[2,3,5,4], x:7, orig:'2(7 \u2212 3) + 5(7) + 4', ov:47,
       choices:[{t:'7x \u2212 2',v:47,ok:true},{t:'7x + 2',v:51},{t:'7x \u2212 6',v:43},{t:'7x + 1',v:50}],
       ans:'7x \u2212 2' } }
  ],
  mohamed:[
   { id:'m1', num:'01', title:'Like Terms \u2014 SAT Style', desc:'Bigger numbers, SAT flavour \u2014 same calculator method.', gen:genM1, prompt:PROMPT_M,
     skills:['Read the expression once, then type it whole','Press ALPHA then ) for every x','One fresh x tests the original and every choice'],
     worked:{ q:'6x + 9 \u2212 2x + 3', ex:[6,9,2,3], x:7, orig:'6(7) + 9 \u2212 2(7) + 3', ov:40,
       choices:[{t:'4x + 12',v:40,ok:true},{t:'4x + 6',v:34},{t:'8x + 12',v:68},{t:'4x \u2212 6',v:22}],
       ans:'4x + 12' } },
   { id:'m2', num:'02', title:'Longer Expressions \u2014 Advanced', desc:'Five x-terms and three constants \u2014 full focus required.', gen:genM2, prompt:PROMPT_M,
     skills:['Type every term and sign in order','One missed sign changes everything','Same fresh x for the original and all choices'],
     worked:{ q:'5x \u2212 3 + 2x + 8 \u2212 x', ex:[5,3,2,8,1], x:7, orig:'5(7) \u2212 3 + 2(7) + 8 \u2212 7', ov:47,
       choices:[{t:'6x + 5',v:47,ok:true},{t:'6x \u2212 5',v:37},{t:'7x + 5',v:54},{t:'5x + 5',v:40}],
       ans:'6x + 5' } },
   { id:'m3', num:'03', title:'Distributive with Coefficients', desc:'EST favourite: a(bx + c). Type the inner coefficient too.', gen:genM3, prompt:PROMPT_M,
     skills:['The bracket contains a number in front of x','Type a, bracket, b, x, sign, c, bracket','The correct choice returns your remembered number'],
     worked:{ q:'4(2x + 3)', ex:[4,2,3], x:7, orig:'4(2(7) + 3)', ov:68,
       choices:[{t:'8x + 12',v:68,ok:true},{t:'8x + 3',v:59},{t:'4x + 12',v:40},{t:'6x + 7',v:49}],
       ans:'8x + 12' } },
   { id:'m4', num:'04', title:'Negative Distribution', desc:'A negative outside the bracket \u2014 sign discipline on the keys.', gen:genM4, prompt:PROMPT_M,
     skills:['The sign before the bracket belongs to the number after it','Type the whole line exactly as written','Same fresh x tests everything'],
     worked:{ q:'\u22123(2x \u2212 5) + 4x', ex:[3,2,5,4], x:7, orig:'\u22123(2(7) \u2212 5) + 4(7)', ov:1,
       choices:[{t:'\u22122x + 15',v:1,ok:true},{t:'2x \u2212 15',v:-1},{t:'2x + 15',v:29},{t:'\u22122x \u2212 15',v:-29}],
       ans:'\u22122x + 15' } },
   { id:'m5', num:'05', title:'Double Brackets \u2014 SAT Style', desc:'Two brackets with coefficients inside, in one expression.', gen:genM5, prompt:PROMPT_M,
     skills:['Type both brackets exactly as they appear','Coefficients inside the brackets are typed too','One fresh x for the original and all four choices'],
     worked:{ q:'2(3x + 1) + 3(2x \u2212 5)', ex:[2,3,1,5], x:7, orig:'2(3(7) + 1) + 3(2(7) \u2212 5)', ov:71,
       choices:[{t:'12x \u2212 13',v:71,ok:true},{t:'12x + 13',v:97},{t:'5x \u2212 4',v:31},{t:'12x \u2212 4',v:80}],
       ans:'12x \u2212 13' } },
   { id:'mmaster', num:'\u2605', title:'Master Challenge \u2014 Mixed', desc:'Every Mohamed skill mixed together. 30 questions.',
     gen:function(){ return pick([genM1,genM2,genM3,genM4,genM5,genM6])(); }, master:true, prompt:PROMPT_M,
     skills:['Every skill from this track mixed together','Read the whole expression before you type it','The calculator method always finds the answer'],
     worked:{ q:'3(2x \u2212 1) \u2212 (5x + 4)', ex:[3,2,1,5,4], x:7, orig:'3(2(7) \u2212 1) \u2212 (5(7) + 4)', ov:0,
       choices:[{t:'x \u2212 7',v:0,ok:true},{t:'x + 7',v:14},{t:'\u2212x \u2212 7',v:-14},{t:'11x + 3',v:80}],
       ans:'x \u2212 7' } }
  ]
};
function getLessons(){ return BANKS[P.teacher||'akram']; }
var METHOD_STEPS = [
 'Type the <b>whole expression</b> into the calculator. Press <b>ALPHA</b> then <span class="mth">)</span> to type the variable <span class="mth"><i class="vx">x</i></span>.',
 'Press <b>CALC</b>.',
 'Choose any value for <span class="mth"><i class="vx">x</i></span> \u2014 <b>never 0</b>, <b>never 1</b>, and <b>never a number that already appears in the question</b>.',
 'Press <b>=</b> and <b>keep the result in your head</b> \u2014 that number is your reference for this question.',
 'Press <b>AC</b>, type one of the choices, press <b>CALC</b>, enter the <b>same</b> <span class="mth"><i class="vx">x</i></span> value, press <b>=</b>. The choice that gives the <b>same number you remembered</b> is correct. Repeat for every choice.'
];

/* ---------------- Storage ---------------- */
var PKEY='aidAcademyV5';
var P = { name:'', teacher:'akram', completed:{} };
try{
  var raw=localStorage.getItem(PKEY);
  if(raw){ var o=JSON.parse(raw); if(o && typeof o==='object'){ P.name=o.name||''; P.teacher=o.teacher||'akram'; P.completed=o.completed||{}; } }
  if(!P.name){ var old=localStorage.getItem('aidAcademyV4'); if(old){ var o2=JSON.parse(old); if(o2 && o2.name) P.name=o2.name; } }
}catch(e){}
function saveP(){ try{ localStorage.setItem(PKEY, JSON.stringify(P)); }catch(e){} }

/* ---------------- Router ---------------- */
var CURSCREEN='scr-splash', toastT=null;
function toast(msg){
  var t=$('#toast'); if(!t) return;
  t.textContent=msg; t.classList.add('on');
  clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('on'); },3000);
}
function setEmblem(){ var e=$('#tbEmblem'); if(e) e.innerHTML=EMBLEMS[P.teacher]||''; }
function show(id){
  CURSCREEN=id;
  var scr=$$('.screen');
  for(var i=0;i<scr.length;i++){ if(scr[i].id===id) scr[i].classList.add('on'); else scr[i].classList.remove('on'); }
  $('#topbar').classList.toggle('hidden', id==='scr-splash');
  $('#tbTimer').style.display = (id==='scr-quiz'||id==='scr-game'||id==='scr-ghost-duel')? '' : 'none';
  dockCalc();
  window.scrollTo(0,0);
}
function setMuteIcon(){
  $('#btnMute').innerHTML = AudioFX.isMuted()
   ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6"/></svg>'
   : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
}

/* ================================================================
   CASIO CALCULATOR — ALPHA + ) لكتابة x
================================================================ */
var CZ = { expr:'', cur:0, base:'input', shift:false, alpha:false, xval:'',
           lastX:null, lastRes:null, mem:null, msg:null, errMsg:'',
           forbidden:{0:1,1:1} };
var czEl=null;

var CZK = [
  {id:'SHIFT', t:'SHIFT', c:'k-shift'},
  {id:'ALPHA', t:'ALPHA', c:'k-alpha'},
  {id:'REPLAY'},
  {id:'MODE', t:'MODE', c:'k-fn'},
  {id:'ON', t:'ON', c:'k-fn'},
  {id:'CALC', t:'CALC', c:'k-fn k-calc'},
  {id:'SQRT', t:'\u221a', c:'k-fn', mth:1},
  {id:'X2', t:'x\u00b2', c:'k-fn', mth:1},
  {id:'POW', t:'x\u02b8', c:'k-fn', mth:1},
  {id:'LOG', t:'log', c:'k-fn', mth:1},
  {id:'LN', t:'ln', c:'k-fn', mth:1},
  {id:'LP', t:'(', c:'k-fn', mth:1},
  {id:'RP', t:')', c:'k-fn', red:'x', mth:1},
  {id:'ANS', t:'Ans', c:'k-fn', mth:1},
  {id:'RCL', t:'RCL', c:'k-fn', yellow:'STO'},
  {id:'7', c:'num'},{id:'8', c:'num'},{id:'9', c:'num'},
  {id:'DEL', t:'DEL', c:'k-fn'},
  {id:'AC', t:'AC', c:'k-fn k-ac'},
  {id:'4', c:'num'},{id:'5', c:'num'},{id:'6', c:'num'},
  {id:'MUL', t:'\u00d7', c:'k-op', mth:1},{id:'DIV', t:'\u00f7', c:'k-op', mth:1},
  {id:'1', c:'num'},{id:'2', c:'num'},{id:'3', c:'num'},
  {id:'ADD', t:'+', c:'k-op'},{id:'SUB', t:'\u2212', c:'k-op', mth:1},
  {id:'0', c:'num'},{id:'.', t:'.', c:'num'},
  {id:'EXP', t:'\u00d710\u02e3', c:'k-fn k-exp', mth:1},
  {id:'=', t:'=', c:'k-eq', span:2}
];
function buildCasioKeys(){
  var g=$('#czKeys');
  CZK.forEach(function(k){
    if(k.id==='REPLAY'){
      var d=document.createElement('div'); d.className='k-replay';
      d.innerHTML='<div class="czr-pad"><button class="czr czr-l" data-id="left" aria-label="Cursor left">\u25c0</button><button class="czr czr-r" data-id="right" aria-label="Cursor right">\u25b6</button></div><span class="czr-cap">REPLAY</span>';
      g.appendChild(d); return;
    }
    var b=document.createElement('button');
    b.className='cz '+(k.c||''); b.setAttribute('data-id',k.id);
    b.setAttribute('type','button');
    if(k.span) b.style.gridColumn='span '+k.span;
    var inner='';
    if(k.red||k.yellow) b.classList.add('has-top');
    if(k.red)    inner+='<span class="fx-top red">'+k.red+'</span>';
    if(k.yellow) inner+='<span class="fx-top yellow">'+k.yellow+'</span>';
    inner+='<span class="fx-main'+(k.mth?' mth':'')+'">'+(k.t||k.id)+'</span>';
    b.innerHTML=inner;
    g.appendChild(b);
  });
  g.addEventListener('click', function(e){
    var t=e.target;
    while(t && t!==g && !(t.getAttribute && t.getAttribute('data-id'))) t=t.parentNode;
    if(!t || t===g || !t.getAttribute('data-id')) return;
    czPress(t.getAttribute('data-id'));
    AudioFX.key();
    try{ czEl.focus({preventScroll:true}); }catch(err){ try{ czEl.focus(); }catch(e2){} }
  });
}
function czFmt(v){
  if(v==null) return '';
  if(isFinite(v) && Math.floor(v)===v) return String(v);
  return String(parseFloat((Math.round(v*1e9)/1e9).toPrecision(10)));
}
function czInsert(txt){
  if(CZ.base==='result'){ CZ.expr=''; CZ.cur=0; CZ.base='input'; CZ.msg=null; }
  if(CZ.base!=='input') return;
  CZ.expr = CZ.expr.slice(0,CZ.cur)+txt+CZ.expr.slice(CZ.cur);
  CZ.cur += txt.length; CZ.msg=null;
}
function czInsertOp(op){
  if(CZ.base==='result'){ CZ.expr='Ans'; CZ.cur=3; CZ.base='input'; }
  if(CZ.base!=='input') return;
  if(CZ.cur===0){ if(op==='\u2212') czInsert(op); return; }
  var prev=CZ.expr.charAt(CZ.cur-1);
  var prev2=CZ.cur>1? CZ.expr.charAt(CZ.cur-2) : '';
  if(prev==='+'||prev==='\u2212'){
    if(op==='\u2212' && (prev2==='\u00d7'||prev2==='\u00f7')){ czInsert(op); }
    else{ CZ.expr=CZ.expr.slice(0,CZ.cur-1)+op+CZ.expr.slice(CZ.cur); }
  } else czInsert(op);
}
function czEquals(){
  if(CZ.base==='askX'){
    var v=parseFloat(CZ.xval);
    if(isNaN(v)){ CZ.base='error'; CZ.errMsg='X? Enter a value'; czRender(); AudioFX.bad(); return; }
    if(CZ.forbidden[v]!==undefined){
      CZ.msg='Pick another X';
      toast('Never use 0, 1, or a number from the question as the value of X \u2014 pick a fresh number.');
      AudioFX.bad(); czRender(); return;
    }
    var r=calcEval(CZ.expr, v, CZ.lastRes);
    if(r===null){ CZ.base='error'; CZ.errMsg=calcErr; AudioFX.bad(); }
    else{ CZ.base='result'; CZ.lastX=v; CZ.lastRes=r; AudioFX.ding(); }
  }else if(CZ.base==='input'){
    if(CZ.expr.indexOf('X')>=0 || CZ.expr.indexOf('x')>=0){ CZ.msg='Press CALC to set X'; czRender(); return; }
    if(!CZ.expr) return;
    var r2=calcEval(CZ.expr, null, CZ.lastRes);
    if(r2===null){ CZ.base='error'; CZ.errMsg=calcErr; AudioFX.bad(); }
    else{ CZ.base='result'; CZ.lastRes=r2; AudioFX.ding(); }
  }
  czRender();
}
function czReset(full){
  CZ.expr=''; CZ.cur=0; CZ.base='input'; CZ.xval=''; CZ.msg=null; CZ.errMsg='';
  CZ.shift=false; CZ.alpha=false;
  if(full){ CZ.lastRes=null; CZ.lastX=null; CZ.mem=null; }
  czRender();
}
function czPress(id){
  if(CZ.base==='error'){
    if(id==='AC'||id==='ON'){ czReset(id==='ON'); return; }
    if(id==='DEL'||id==='left'||id==='right'){ CZ.base='input'; CZ.errMsg=''; }
    else{ CZ.expr=''; CZ.cur=0; CZ.xval=''; CZ.base='input'; CZ.errMsg=''; }
  }
  var isDigit = /^[0-9]$/.test(id) || id==='.';
  switch(id){
    case 'SHIFT': if(CZ.base!=='askX'){ CZ.shift=!CZ.shift; CZ.alpha=false; } break;
    case 'ALPHA': if(CZ.base!=='askX'){ CZ.alpha=!CZ.alpha; CZ.shift=false; } break;
    case 'ON': czReset(true); return;
    case 'AC': CZ.expr=''; CZ.cur=0; CZ.xval=''; CZ.msg=null; CZ.base='input'; break;
    case 'DEL':
      if(CZ.base==='askX'){ CZ.xval=CZ.xval.slice(0,-1); }
      else{
        if(CZ.base==='result'){ CZ.base='input'; CZ.cur=CZ.expr.length; }
        if(CZ.cur>0){ CZ.expr=CZ.expr.slice(0,CZ.cur-1)+CZ.expr.slice(CZ.cur); CZ.cur--; }
      }
      break;
    case 'left':
      if(CZ.base==='result'){ CZ.base='input'; CZ.cur=CZ.expr.length; }
      else if(CZ.base==='input'){ CZ.cur=Math.max(0,CZ.cur-1); }
      break;
    case 'right':
      if(CZ.base==='result'){ CZ.base='input'; CZ.cur=CZ.expr.length; }
      else if(CZ.base==='input'){ CZ.cur=Math.min(CZ.expr.length,CZ.cur+1); }
      break;
    case 'MODE': CZ.msg='COMP'; break;
    case 'CALC':
      CZ.msg=null;
      if(!CZ.expr){ CZ.msg='Type the expression first'; break; }
      if(CZ.expr.indexOf('X')>=0 || CZ.expr.indexOf('x')>=0){ CZ.base='askX'; CZ.xval=''; CZ.shift=false; CZ.alpha=false; }
      else czEquals();
      break;
    case 'RCL':
      if(CZ.shift){
        CZ.shift=false;
        if(CZ.lastRes!==null){ CZ.mem=CZ.lastRes; CZ.msg='M \u2190 '+czFmt(CZ.lastRes); AudioFX.tick(); }
        else CZ.msg='Nothing to store yet';
      }else{
        CZ.msg=(CZ.mem!==null)? 'M = '+czFmt(CZ.mem) : 'M is empty';
      }
      break;
    case 'ANS': czInsert('Ans'); break;
    case 'X2':  czInsert('\u00b2'); break;
    case 'POW': czInsert('^'); break;
    case 'SQRT':czInsert('\u221a('); break;
    case 'LOG': czInsert('log('); break;
    case 'LN':  czInsert('ln('); break;
    case 'EXP': czInsert('\u00d710^'); break;
    case 'MUL': czInsertOp('\u00d7'); break;
    case 'DIV': czInsertOp('\u00f7'); break;
    case 'ADD': czInsertOp('+'); break;
    case 'SUB': czInsertOp('\u2212'); break;
    case 'LP': czInsert('('); break;
    case 'RP':
      if(CZ.alpha){ CZ.alpha=false; czInsert('X'); }
      else czInsert(')');
      break;
    case '=': czEquals(); break;
    default:
      if(isDigit){
        if(CZ.base==='askX'){ if(!(id==='.' && CZ.xval.indexOf('.')>=0)) CZ.xval+=id; }
        else czInsert(id);
      }
  }
  if(id!=='SHIFT' && id!=='ALPHA'){ CZ.shift=false; CZ.alpha=false; }
  czRender();
}
function czRender(){
  $('#indShift').classList.toggle('on', CZ.shift);
  $('#indAlpha').classList.toggle('on', CZ.alpha);
  $('#indSto').classList.toggle('on', CZ.shift);
  $('#indM').classList.toggle('on', CZ.mem!==null);
  $('#indX').classList.toggle('on', CZ.base==='askX');
  var l1=$('#czLine1'), l2=$('#czLine2');
  var pretty=CZ.expr.replace(/X/g,'x');
  if(CZ.base==='askX'){
    l1.innerHTML=pretty.replace(/x/g,'<i>x</i>');
    l2.className='cz-line2';
    l2.innerHTML='X? '+CZ.xval+'<span class="cz-cursor"></span>';
  }else if(CZ.base==='result'){
    l1.innerHTML=pretty.replace(/x/g,'<i>x</i>');
    l2.className='cz-line2';
    l2.textContent=czFmt(CZ.lastRes);
  }else if(CZ.base==='error'){
    l1.innerHTML=pretty.replace(/x/g,'<i>x</i>');
    l2.className='cz-line2';
    l2.textContent=CZ.errMsg;
  }else{
    var a=pretty.slice(0,CZ.cur), b=pretty.slice(CZ.cur);
    l1.innerHTML=a.replace(/x/g,'<i>x</i>')+'<span class="cz-cursor"></span>'+b.replace(/x/g,'<i>x</i>');
    if(CZ.msg){ l2.className='cz-line2 small'; l2.textContent=CZ.msg; }
    else{ l2.className='cz-line2'; l2.textContent='\u00a0'; }
  }
}
function czSetQuestion(q){
  CZ.forbidden={0:1,1:1};
  var el=$('#czAvoid');
  if(q && q.ex){
    var uniq=[], i;
    for(i=0;i<q.ex.length;i++){ if(uniq.indexOf(q.ex[i])<0) uniq.push(q.ex[i]); }
    for(i=0;i<uniq.length;i++) CZ.forbidden[uniq[i]]=1;
    el.style.display='';
    el.innerHTML='Avoid for this question: <b>0, 1, '+(uniq.length? uniq.join(', '):'')+'</b>';
  }else{
    el.style.display='none';
  }
}
function bindCalcKeyboard(){
  czEl.addEventListener('keydown', function(e){
    if(e.key==='x'||e.key==='X'){
      e.preventDefault();
      if(CZ.base==='result'){ CZ.expr=''; CZ.cur=0; CZ.base='input'; }
      if(CZ.base==='input'){ CZ.expr=CZ.expr.slice(0,CZ.cur)+'X'+CZ.expr.slice(CZ.cur); CZ.cur++; }
      czRender(); return;
    }
    var map={'+':'ADD','-':'SUB','*':'MUL','/':'DIV','Enter':'=','=':'=','Backspace':'DEL','Escape':'AC',
             '(':'LP',')':'RP','.':'.','^':'POW','ArrowLeft':'left','ArrowRight':'right'};
    var id=null;
    if(/^[0-9]$/.test(e.key)) id=e.key;
    else id=map[e.key]||null;
    if(id){ e.preventDefault(); czPress(id); AudioFX.key(); }
  });
}
var CZopen=true;
function dockCalc(){
  var slot = (CURSCREEN==='scr-quiz')? $('#quizCalcSlot') : (CURSCREEN==='scr-intro')? $('#introCalcSlot') : null;
  var holder=$('#calcHolder');
  var lbls=[];
  if($('#btnCalcLbl')) lbls.push($('#btnCalcLbl'));
  if($('#btnCalcTryLbl')) lbls.push($('#btnCalcTryLbl'));
  if($('#quizCalcLaunch')) $('#quizCalcLaunch').style.display = (CURSCREEN==='scr-quiz')? '' : 'none';
  if($('#introCalcLaunch')) $('#introCalcLaunch').style.display = (CURSCREEN==='scr-intro')? '' : 'none';
  if(!slot){
    if(czEl && czEl.parentElement!==holder) holder.appendChild(czEl);
    for(var i=0;i<lbls.length;i++) lbls[i].textContent='Show Calculator';
    return;
  }
  for(var j=0;j<lbls.length;j++) lbls[j].textContent=CZopen? 'Hide Calculator':'Show Calculator';
  if(CZopen){
    slot.classList.remove('closed');
    if(czEl.parentElement!==slot) slot.appendChild(czEl);
  }else{
    slot.classList.add('closed');
    if(czEl.parentElement!==holder) holder.appendChild(czEl);
  }
}
function toggleCalc(){ CZopen=!CZopen; dockCalc(); AudioFX.tick(); }

/* ---------------- Hub ---------------- */
function renderHub(){
  setEmblem();
  var L=getLessons();
  $('#hubHello').innerHTML='<span class="emb-xs">'+(EMBLEMS[P.teacher]||'')+'</span>Welcome, '+P.name;
  $('#hubTitle').textContent=TEACHER_META[P.teacher].name+' \u2014 Training Path';
  var doneCount=0, i;
  for(i=0;i<L.length;i++){ if(!L[i].master && P.completed[L[i].id]) doneCount++; }
  var masterOpen=doneCount>=5;
  var html=L.map(function(les){
    var c=P.completed[les.id], act, meta, lockLine=false;
    if(les.master){
      if(masterOpen){
        act='<button class="btn primary" data-start="'+les.id+'">Enter the Master</button>';
        meta=c? ('Completed \u00b7 best '+c.score+'/30 \u00b7 '+fmtTime(c.time)+' \u00b7 '+c.rank) : 'Unlocked \u2014 30 mixed questions await';
      }else{
        act='<button class="btn ghost" disabled><svg class="lockic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></button>';
        lockLine=true;
      }
    }else{
      act='<button class="btn '+(c? 'ghost':'primary')+'" data-start="'+les.id+'">'+(c? 'Review':'Start')+'</button>';
      meta=c? ('Completed \u00b7 best '+c.score+'/20 \u00b7 '+fmtTime(c.time)+' \u00b7 '+c.rank) : '20 questions \u00b7 game breaks every 5';
    }
    return '<div class="lrow '+(les.master&&!masterOpen?'locked':'')+'">'+
      '<div class="lnum">'+les.num+'</div>'+
      '<div class="linfo"><h3>'+les.title+'</h3><p>'+les.desc+'</p>'+
      '<div class="lmeta '+(lockLine?'lockline':'')+'">'+
      (lockLine? ('Locked \u2014 finish all five lessons to unlock ('+doneCount+'/5 done)') : meta)+'</div></div>'+
      '<div class="lact">'+act+'</div></div>';
  }).join('');
  html+='<div class="lrow"><div class="gemb">'+EMBLEMS.ghost+'</div>'+
    '<div class="linfo"><h3>Ghost Mode \u2014 Vertical Duel</h3><p>Two students stand face-to-face: the screen splits top and bottom, each half rotated toward its own player. 2 minutes per question \u2014 a first correct lock leaves the rival only 10 seconds. No calculator, no hints.</p>'+
    '<div class="lmeta">2 duelists \u00b7 rotated halves \u00b7 champion certificate by Mr. Akram</div></div>'+
    '<div class="lact"><button class="btn primary" id="btnGhost" type="button">Enter Ghost Mode</button></div></div>';
  $('#lessonList').innerHTML=html;
  var btns=$$('#lessonList [data-start]');
  btns.forEach(function(b){
    b.onclick=function(){
      AudioFX.tick();
      var id=b.getAttribute('data-start'), L2=getLessons(), found=null, i2;
      for(i2=0;i2<L2.length;i2++){ if(L2[i2].id===id){ found=L2[i2]; break; } }
      if(found){ renderIntro(found); show('scr-intro'); }
    };
  });
  var gbtn=$('#btnGhost');
  if(gbtn) gbtn.onclick=function(){ AudioFX.tick(); initGhostSetup(); show('scr-ghost-setup'); };
  $('#hubProgress').innerHTML='Master Challenge progress: <b>'+doneCount+' / 5</b> lessons completed'+(masterOpen? ' \u2014 the Master is open!':' \u2014 keep going!');
}

/* ---------------- Intro ---------------- */
var introLesson=null;
function renderIntro(L){
  introLesson=L;
  $('#introChip').textContent=L.master? 'Master Challenge':'Lesson '+L.num;
  $('#introTitle').innerHTML=L.title;
  $('#introDesc').innerHTML=L.desc;
  $('#skillList').innerHTML=L.skills.map(function(s){ return '<li>'+s+'</li>'; }).join('');
  $('#methodList').innerHTML=METHOD_STEPS.map(function(s){ return '<li>'+s+'</li>'; }).join('');
  var w=L.worked;
  var choiceRows=w.choices.map(function(c){
    return '<div class="wch '+(c.ok?'ok':'no')+'"><span class="t">'+mathHTML(c.t)+'</span>'+
      '<span class="v"><span class="mth">'+mathHTML(subX(c.t,w.x))+'</span> = '+c.v+'</span>'+
      '<span class="verdict">'+(c.ok? '\u2713 MATCH \u2014 correct answer':'\u2717 different')+'</span></div>';
  }).join('');
  $('#workedBox').innerHTML=
    '<div class="worked-q">Q \u00b7 <span class="wq">'+mathHTML(w.q)+'</span></div>'+
    '<div class="steps">'+
      '<div class="step"><span class="step-n">1</span><div class="step-body"><b>Pick a test value for <i class="vx">x</i>.</b> '+
        'Not 0, not 1, and not any number in the question ('+w.ex.join(', ')+'). Let\u2019s use <b><i class="vx">x</i> = '+w.x+'</b>.</div></div>'+
      '<div class="step"><span class="step-n">2</span><div class="step-body"><b>Test the original expression on the calculator.</b> '+
        'Type it (<b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>), press CALC, enter '+w.x+', press = : &nbsp;<span class="mth">'+mathHTML(w.orig)+
        '</span> = <b>'+w.ov+'</b> \u00b7 <b>keep that number in your head.</b></div></div>'+
      '<div class="step"><span class="step-n">3</span><div class="step-body"><b>Test every choice with the same <i class="vx">x</i> = '+w.x+':</b>'+
        '<div class="wch-table">'+choiceRows+'</div></div></div>'+
      '<div class="step"><span class="step-n">4</span><div class="step-body"><b>Answer: <span class="mth">'+mathHTML(w.ans)+'</span>.</b> '+
        'It was the only choice that gave back the number you remembered (<b>'+w.ov+'</b>) with <i class="vx">x</i> = '+w.x+' \u2014 that is exactly how the calculator proves it.</div></div>'+
    '</div>';
  czSetQuestion({ex:w.ex});
  $('#btnStartLesson').textContent='Start Lesson \u2014 '+(L.master?30:20)+' Questions';
}

/* ---------------- Timer ---------------- */
var Timer = {
  acc:0, on:false, t0:0, intv:null,
  start:function(){ this.stop(); this.acc=0; this.on=true; this.t0=Date.now();
    var self=this; this.intv=setInterval(function(){ self.ui(); },500); this.ui(); },
  pause:function(){ if(this.on){ this.acc+=Date.now()-this.t0; this.on=false; } clearInterval(this.intv); },
  resume:function(){ if(!this.on){ this.t0=Date.now(); this.on=true; }
    var self=this; clearInterval(this.intv); this.intv=setInterval(function(){ self.ui(); },500); },
  stop:function(){ this.pause(); },
  elapsed:function(){ return Math.round((this.acc+(this.on? Date.now()-this.t0 : 0))/1000); },
  ui:function(){ $('#tbTimer').textContent=fmtTime(this.elapsed()); }
};

/* ---------------- Quiz ---------------- */
var QZ={ lesson:null, qs:[], i:0, score:0, mistakes:[], answered:false, hintShown:0, breakIdx:0 };
var PRAISE=['Excellent!','Perfect!','Brilliant!','Great job!','Well done!','Fantastic!'];
var ENCOURAGE=['Good try \u2014 let\u2019s see why.','Almost! Check the steps below.','Not quite, but the next one is yours!','Keep going \u2014 mistakes build champions.'];

function answeredCount(){ return QZ.i + (QZ.answered?1:0); }
function updateStopBtn(){
  var b=$('#btnStop'); if(!b) return;
  b.style.display=(answeredCount()>=10)? '' : 'none';
}
function startLesson(L){
  if(!L) return;
  QZ.lesson=L;
  var n=L.master?30:20;
  QZ.qs=buildQuestions(L, balancedSeq(n));
  QZ.i=0; QZ.score=0; QZ.mistakes=[]; QZ.breakIdx=0;
  $('#tbLesson').innerHTML=TEACHER_META[P.teacher].name+' \u00b7 '+L.title;
  $('#qLessonChip').textContent=L.master? 'Master Challenge':'Lesson '+L.num;
  var total=QZ.qs.length || n;
  var ticks=$('#qTicks'); ticks.innerHTML='';
  for(var k=5;k<total;k+=5){
    var t=document.createElement('span'); t.className='q-tick';
    t.style.left=(k/total*100)+'%'; ticks.appendChild(t);
  }
  show('scr-quiz'); Timer.start(); renderQ();
}
function renderQ(){
  var q=QZ.qs[QZ.i], total=QZ.qs.length;
  if(!q) return;
  $('#qNum').textContent='Question '+(QZ.i+1)+' of '+total;
  $('#qFill').style.width=((QZ.i+1)/total*100)+'%';
  $('#qPrompt').textContent=(QZ.lesson && QZ.lesson.prompt)? QZ.lesson.prompt : PROMPT_A;
  $('#qExpr').innerHTML=mathHTML(q.text);
  czSetQuestion(q);
  var letters=['A','B','C','D'];
  $('#qOpts').innerHTML=q.choices.map(function(c,i){
    return '<button class="opt" type="button" data-i="'+i+'"><span class="key">'+letters[i]+'</span><span>'+mathHTML(lin(c.a,c.b))+'</span></button>';
  }).join('');
  var btns=$$('#qOpts .opt');
  btns.forEach(function(b){ b.onclick=function(){ answer(parseInt(b.getAttribute('data-i'),10)); }; });
  QZ.answered=false; QZ.hintShown=0;
  $('#hintCount').textContent='2'; $('#btnHint').disabled=false;
  $('#hintBox').hidden=true; $('#hintBox').innerHTML='';
  $('#feedback').hidden=true; $('#feedback').innerHTML='';
  updateStopBtn();
}
function answer(idx){
  if(QZ.answered) return;
  QZ.answered=true;
  var q=QZ.qs[QZ.i], ok=(idx===q.correctIdx), chosen=q.choices[idx];
  var opts=$$('#qOpts .opt');
  opts.forEach(function(b,i){
    b.disabled=true;
    if(i===q.correctIdx) b.classList.add('correct');
    else if(i===idx) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  if(ok) QZ.score++;
  else QZ.mistakes.push({num:QZ.i+1, text:q.text, tag:q.tag,
    chosen:lin(chosen.a,chosen.b), correct:lin(q.a,q.b)});
  var fb=$('#feedback'); fb.hidden=false; fb.className='feedback '+(ok?'good':'bad');
  var ico=ok
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var last=(QZ.i+1>=QZ.qs.length);
  var nextLbl=last? 'Finish Lesson \u00b7 See My Results':'Next Question \u2192';
  var html='<div class="fb-head">'+ico+' '+(ok? pick(PRAISE):pick(ENCOURAGE))+'</div>'+
    '<div class="fb-sub">'+(ok
      ? 'Correct \u2014 <span class="mth">'+mathHTML(lin(q.a,q.b))+'</span> is the simplified form.</div><div class="fb-proof">Calculator proof: the same <i class="vx">x</i> gives back the number you remembered.</div>'
      : 'The correct answer is <span class="mth">'+mathHTML(lin(q.a,q.b))+'</span>. Here is the full solution, exactly as the calculator does it:</div>');
  if(!ok) html+=correctionHTML(q);
  html+='<button class="btn primary" id="btnNext" type="button">'+nextLbl+'</button>';
  fb.innerHTML=html;
  $('#btnNext').onclick=nextQ;
  try{ fb.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){ fb.scrollIntoView(); }
  updateStopBtn();
  if(ok) AudioFX.good(); else AudioFX.bad();
}
function correctionHTML(q){
  var x=pickX(q.ex);
  var ov=calcEval(q.text, x);
  if(ov===null) ov=q.a*x+q.b;
  var rows=q.choices.map(function(c,i){
    return {t:lin(c.a,c.b), v:c.a*x+c.b, ok:(i===q.correctIdx)};
  });
  var rowHtml=rows.map(function(r){
    return '<div class="wch '+(r.ok?'ok':'no')+'"><span class="t">'+mathHTML(r.t)+'</span>'+
      '<span class="v"><span class="mth">'+mathHTML(subX(r.t,x))+'</span> = '+r.v+'</span>'+
      '<span class="verdict">'+(r.ok? '\u2713 matches '+ov+' \u2014 correct':'\u2717 different')+'</span></div>';
  }).join('');
  var S=[];
  S.push('<b>Choose a test value for <i class="vx">x</i>.</b> Never 0, never 1, and never a number from the question ('+q.ex.join(', ')+'). Let\u2019s use <b><i class="vx">x</i> = '+x+'</b>.');
  S.push('<b>Test the original expression.</b> Type it on the calculator (<b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>), press CALC, enter '+x+', press = : &nbsp;<span class="mth">'+mathHTML(subX(q.text,x))+'</span> = <b>'+ov+'</b>. Keep that number in your head.');
  S.push('<b>Test every choice with the same <i class="vx">x</i> = '+x+'</b> \u2014 press AC, type the choice, CALC, '+x+', = :'+
    '<div class="wch-table">'+rowHtml+'</div>');
  S.push('<b>Answer: <span class="mth">'+mathHTML(lin(q.a,q.b))+'</span></b> \u2014 the only choice that gave back the number you remembered (<b>'+ov+'</b>) with <i class="vx">x</i> = '+x+'. That is exactly how the calculator proves it.');
  return '<div class="steps">'+S.map(function(s,i){
    return '<div class="step"><span class="step-n">'+(i+1)+'</span><div class="step-body">'+s+'</div></div>';
  }).join('')+'</div>';
}
function nextQ(){
  QZ.i++;
  if(QZ.i>=QZ.qs.length){ finishLesson(false); return; }
  if(QZ.i%5===0){ startBreak(); return; }
  renderQ();
}

/* ---------------- Early stop ---------------- */
function openStop(){
  var ans=answeredCount();
  $('#stopStats').innerHTML=
    '<div class="mini"><div class="v">'+ans+'</div><div class="l">Answered</div></div>'+
    '<div class="mini"><div class="v" style="color:var(--good)">'+QZ.score+'</div><div class="l">Correct</div></div>'+
    '<div class="mini"><div class="v" style="color:var(--bad)">'+QZ.mistakes.length+'</div><div class="l">Wrong</div></div>'+
    '<div class="mini"><div class="v">'+fmtTime(Timer.elapsed())+'</div><div class="l">Time</div></div>';
  $('#stopModal').classList.add('on');
  AudioFX.tick();
}

/* ================================================================
   GAMES — 7 ألعاب بتتناوب كل 5 أسئلة
================================================================ */
function rr(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
var cv=null, cx=null;
function pt(e){
  var t=(e.touches && e.touches[0])? e.touches[0] : e;
  var r=cv.getBoundingClientRect();
  return {x:(t.clientX-r.left)*cv.width/r.width, y:(t.clientY-r.top)*cv.height/r.height};
}
var PAL=['#d2a44d','#ecc87e','#8db578','#cf7f65','#e7dcc3','#9a86b8'];
var gRaf=0, gCleanup=null;
function stopGameLoop(){
  if(gRaf){ cancelAnimationFrame(gRaf); gRaf=0; }
  if(gCleanup){ gCleanup(); gCleanup=null; }
}
var GAMES=[
 { name:'Shape Catcher',
   desc:'Shapes fall from the sky. Slide the crate with your finger or mouse and catch <b>only</b> the shape shown at the top \u2014 a wrong catch costs a point. 30 seconds!',
   run:catchGame },
 { name:'Rocket Dodge',
   desc:'Pilot the golden rocket: move with your finger or the arrow keys and dodge the falling asteroids. Every asteroid you survive is a point \u2014 every hit costs two. 30 seconds of flying!',
   run:rocketGame },
 { name:'Memory Match',
   desc:'Flip the cards and match the 8 pairs of mathematical symbols. Fewer moves, sharper memory \u2014 finish the board to continue!',
   run:memoryGame },
 { name:'Penalty Shootout',
   desc:'Drag the ball back, aim with the reticle \u2014 the further you drag, the harder the shot \u2014 and release. Five shots against a diving keeper. Beat him!',
   run:shootGame },
 { name:'Fruit Slice',
   desc:'Fruits launch into the air \u2014 swipe your finger (or hold the mouse and drag) to slice them with the blade. Every fruit sliced is a point. 30 seconds!',
   run:fruitGame },
 { name:'Bubble Rush',
   desc:'Colorful bubbles pop up and vanish fast. Tap them before they disappear \u2014 every pop is a point. 22 seconds of speed!',
   run:popGame },
 { name:'Quick Calc',
   desc:'Mental math at full speed: multiplication and division, four options, 45 seconds. Every correct answer in a row multiplies your points!',
   run:quickCalcGame }
];
function startBreak(){
  Timer.pause();
  var g=GAMES[QZ.breakIdx%GAMES.length]; QZ.breakIdx++;
  $('#gameTitle').textContent=g.name;
  $('#gameHud').textContent='';
  var ov=$('#gameOverlay'); ov.classList.add('on');
  $('#gOvTitle').textContent=g.name;
  $('#gOvText').innerHTML=g.desc;
  var btn=$('#gOvBtn'); btn.textContent='Play';
  btn.onclick=function(){
    ov.classList.remove('on'); AudioFX.ensure();
    g.run(function(res){
      ov.classList.add('on');
      $('#gOvTitle').textContent='Great break!';
      $('#gOvText').innerHTML=res;
      var b=$('#gOvBtn'); b.textContent='Continue Lesson';
      b.onclick=function(){ ov.classList.remove('on'); stopGameLoop(); Timer.resume(); show('scr-quiz'); renderQ(); };
    });
  };
  show('scr-game');
}
function shapePath(ctx,type,s){
  ctx.beginPath();
  if(type==='circle') ctx.arc(0,0,s,0,Math.PI*2);
  else if(type==='square'){ ctx.rect(-s*.85,-s*.85,s*1.7,s*1.7); }
  else if(type==='diamond'){ ctx.moveTo(0,-s*1.15); ctx.lineTo(s*1.15,0); ctx.lineTo(0,s*1.15); ctx.lineTo(-s*1.15,0); ctx.closePath(); }
  else if(type==='triangle'){ ctx.moveTo(0,-s*1.15); ctx.lineTo(s,s*.8); ctx.lineTo(-s,s*.8); ctx.closePath(); }
  else if(type==='star'){
    for(var i=0;i<10;i++){
      var r=(i%2? s*.5 : s*1.2), a=-Math.PI/2+i*Math.PI/5;
      if(i) ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); else ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    ctx.closePath();
  }
}
function burst(parts,x,y,color,n){
  var count=n||14;
  for(var i=0;i<count;i++){
    var a=Math.random()*Math.PI*2, sp=90+Math.random()*220;
    parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,life:.6,color:color});
  }
}
function drawParts(ctx,parts,dt){
  var keep=[];
  parts.forEach(function(p){
    p.life-=dt; if(p.life<=0) return;
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=380*dt;
    ctx.globalAlpha=Math.max(0,p.life/.6); ctx.fillStyle=p.color;
    ctx.fillRect(p.x-3,p.y-3,6,6); keep.push(p);
  });
  ctx.globalAlpha=1; return keep;
}

/* --- Shape Catcher --- */
function catchGame(onEnd){
  var TYPES=['circle','square','triangle','star','diamond'];
  var stars=[], i;
  for(i=0;i<46;i++) stars.push({x:Math.random()*960,y:Math.random()*440,r:Math.random()*1.6+.5,a:Math.random()*.5+.15});
  var shapes=[], parts=[], target=pick(TYPES), score=0, caught=0, timeLeft=30, spawnAcc=0, last=performance.now();
  var boxX=480, pointerX=480;
  var keys={};
  var onMove=function(e){ pointerX=pt(e).x; };
  var onKey=function(e){ keys[e.key]=true; };
  var onKeyUp=function(e){ keys[e.key]=false; };
  cv.addEventListener('pointermove',onMove);
  window.addEventListener('keydown',onKey); window.addEventListener('keyup',onKeyUp);
  gCleanup=function(){ cv.removeEventListener('pointermove',onMove);
    window.removeEventListener('keydown',onKey); window.removeEventListener('keyup',onKeyUp); };
  AudioFX.whistle();
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000); last=now;
    timeLeft-=dt;
    if(timeLeft<=0){
      stopGameLoop();
      onEnd('You caught <b>'+caught+'</b> correct shapes with a score of <b>'+score+'</b>. Focus restored \u2014 back to the questions!');
      return;
    }
    if(keys['ArrowLeft'])  pointerX-=420*dt;
    if(keys['ArrowRight']) pointerX+=420*dt;
    spawnAcc+=dt;
    var rate=Math.max(.55, .95-(30-timeLeft)*.014);
    if(spawnAcc>rate){
      spawnAcc=0;
      shapes.push({type:pick(TYPES), x:rnd(60,900), y:-40, vy:rnd(150,240)+(30-timeLeft)*3,
        size:rnd(19,30), rot:Math.random()*6, vr:(Math.random()-.5)*1.6, color:pick(PAL)});
    }
    if(Math.random()<dt/9){
      var alt=[];
      for(var q=0;q<TYPES.length;q++){ if(TYPES[q]!==target) alt.push(TYPES[q]); }
      if(alt.length) target=pick(alt);
    }
    boxX+=(pointerX-boxX)*Math.min(1,dt*10);
    var boxTop=540-95, keep=[];
    shapes.forEach(function(sh){
      sh.y+=sh.vy*dt; sh.rot+=sh.vr*dt;
      var hit=(sh.y+sh.size>=boxTop && sh.y-sh.size<=540-18 && Math.abs(sh.x-boxX)<78+sh.size*.6);
      if(hit){
        if(sh.type===target){ score++; caught++; AudioFX.ding(); burst(parts,sh.x,boxTop,'#ecc87e'); }
        else{ score--; AudioFX.bad(); burst(parts,sh.x,boxTop,'#cf7f65',8); }
        return;
      }
      if(sh.y<620) keep.push(sh);
    });
    shapes=keep;
    cx.fillStyle='#12100a'; cx.fillRect(0,0,960,540);
    stars.forEach(function(s){ cx.globalAlpha=s.a; cx.fillStyle='#e7dcc3';
      cx.beginPath(); cx.arc(s.x,s.y,s.r,0,Math.PI*2); cx.fill(); });
    cx.globalAlpha=1;
    cx.fillStyle='rgba(26,21,16,.92)'; cx.strokeStyle='#d2a44d'; cx.lineWidth=2;
    rr(cx,22,20,262,54,12); cx.fill(); cx.stroke();
    cx.save(); cx.translate(56,47); cx.fillStyle='#ecc87e'; shapePath(cx,target,15); cx.fill(); cx.restore();
    cx.fillStyle='#e7dcc3'; cx.font='600 19px Instrument Sans'; cx.textAlign='left';
    cx.fillText('CATCH: '+target.toUpperCase(), 84, 54);
    cx.textAlign='right'; cx.fillStyle='#ecc87e'; cx.font='600 24px STIX Two Text';
    cx.fillText('Score '+score, 938, 40);
    cx.fillStyle='#a6997e'; cx.font='18px STIX Two Text';
    cx.fillText(Math.ceil(timeLeft)+'s', 938, 66);
    shapes.forEach(function(sh){
      cx.save(); cx.translate(sh.x,sh.y); cx.rotate(sh.rot);
      cx.fillStyle=sh.color; cx.strokeStyle='rgba(12,9,6,.65)'; cx.lineWidth=2.5;
      shapePath(cx,sh.type,sh.size); cx.fill(); cx.stroke(); cx.restore();
    });
    var bw=156;
    cx.fillStyle='#211a13'; cx.strokeStyle='#d2a44d'; cx.lineWidth=3;
    rr(cx,boxX-bw/2, boxTop, bw, 62, 10); cx.fill(); cx.stroke();
    cx.strokeStyle='rgba(210,164,77,.5)'; cx.lineWidth=2;
    cx.beginPath();
    cx.moveTo(boxX-bw/2+10,boxTop+8); cx.lineTo(boxX+bw/2-10,boxTop+54);
    cx.moveTo(boxX+bw/2-10,boxTop+8); cx.lineTo(boxX-bw/2+10,boxTop+54);
    cx.stroke();
    parts=drawParts(cx,parts,dt);
    gRaf=requestAnimationFrame(loop);
  }
  gRaf=requestAnimationFrame(loop);
}

/* --- Rocket Dodge --- */
function rocketGame(onEnd){
  var rx=480, stars=[], rocks=[], parts=[];
  var i;
  for(i=0;i<60;i++) stars.push({x:Math.random()*960, y:Math.random()*540, r:Math.random()*1.4+.4, sp:30+Math.random()*70});
  var timeLeft=30, score=0, spawnAcc=0, last=performance.now();
  var keys={};
  var onKey=function(e){ keys[e.key]=true; };
  var onKeyUp=function(e){ keys[e.key]=false; };
  var onMove=function(e){ rx=Math.max(40, Math.min(920, pt(e).x)); };
  window.addEventListener('keydown',onKey); window.addEventListener('keyup',onKeyUp);
  cv.addEventListener('pointermove',onMove);
  gCleanup=function(){ window.removeEventListener('keydown',onKey); window.removeEventListener('keyup',onKeyUp); cv.removeEventListener('pointermove',onMove); };
  AudioFX.whistle();
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000); last=now;
    timeLeft-=dt;
    if(timeLeft<=0){
      stopGameLoop();
      onEnd('You survived the asteroid field with a score of <b>'+score+'</b>. Nice piloting \u2014 back to algebra!');
      return;
    }
    if(keys['ArrowLeft'])  rx-=430*dt;
    if(keys['ArrowRight']) rx+=430*dt;
    rx=Math.max(40, Math.min(920, rx));
    var speed=260+(30-timeLeft)*4;
    stars.forEach(function(s){ s.y+=s.sp*dt; if(s.y>540){ s.y=0; s.x=Math.random()*960; } });
    spawnAcc+=dt;
    if(spawnAcc>Math.max(.28, .55-(30-timeLeft)*.008)){
      spawnAcc=0;
      rocks.push({x:rnd(60,900), y:-30, r:rnd(16,34), vy:speed+rnd(0,90), vx:rnd(-40,40), rot:Math.random()*6, vr:rnd(-2,2)});
    }
    var keep=[];
    rocks.forEach(function(r){
      r.y+=r.vy*dt; r.x+=r.vx*dt; r.rot+=r.vr*dt;
      if(Math.hypot(r.x-rx, r.y-470)<r.r+16){
        score=Math.max(0, score-2); AudioFX.bad(); burst(parts, rx, 470, '#cf7f65', 10);
        return;
      }
      if(r.y>580){ score++; return; }
      keep.push(r);
    });
    rocks=keep;
    cx.fillStyle='#0c0a14'; cx.fillRect(0,0,960,540);
    stars.forEach(function(s){ cx.fillStyle='rgba(231,220,195,.55)'; cx.beginPath(); cx.arc(s.x,s.y,s.r,0,Math.PI*2); cx.fill(); });
    rocks.forEach(function(r){
      cx.save(); cx.translate(r.x,r.y); cx.rotate(r.rot);
      cx.fillStyle='#6f6552'; cx.strokeStyle='#3b3225'; cx.lineWidth=2;
      cx.beginPath();
      for(var i2=0;i2<7;i2++){ var a=i2/7*Math.PI*2, rr2=r.r*(i2%2? .75:1);
        if(i2)cx.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2); else cx.moveTo(Math.cos(a)*rr2,Math.sin(a)*rr2); }
      cx.closePath(); cx.fill(); cx.stroke();
      cx.fillStyle='#2d261d';
      cx.beginPath(); cx.arc(-r.r*.25,-r.r*.2,r.r*.16,0,Math.PI*2); cx.fill();
      cx.beginPath(); cx.arc(r.r*.3,r.r*.15,r.r*.11,0,Math.PI*2); cx.fill();
      cx.restore();
    });
    cx.save(); cx.translate(rx,470);
    cx.fillStyle='#cf7f65';
    cx.beginPath(); cx.moveTo(-7,14); cx.lineTo(0,14+16+Math.random()*10); cx.lineTo(7,14); cx.closePath(); cx.fill();
    cx.fillStyle='#d2a44d';
    cx.beginPath(); cx.moveTo(0,-26); cx.quadraticCurveTo(12,-8,10,14); cx.lineTo(-10,14); cx.quadraticCurveTo(-12,-8,0,-26); cx.closePath(); cx.fill();
    cx.fillStyle='#ecc87e';
    cx.beginPath(); cx.moveTo(10,8); cx.lineTo(24,20); cx.lineTo(10,16); cx.closePath(); cx.fill();
    cx.beginPath(); cx.moveTo(-10,8); cx.lineTo(-24,20); cx.lineTo(-10,16); cx.closePath(); cx.fill();
    cx.fillStyle='#1a1510'; cx.beginPath(); cx.arc(0,-6,4.5,0,Math.PI*2); cx.fill();
    cx.strokeStyle='#8a6a2a'; cx.lineWidth=1.5;
    cx.beginPath(); cx.moveTo(0,-26); cx.quadraticCurveTo(12,-8,10,14); cx.stroke();
    cx.restore();
    parts=drawParts(cx,parts,dt);
    cx.fillStyle='#ecc87e'; cx.font='600 24px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Score '+score, 26, 44);
    cx.fillStyle='#a6997e'; cx.font='19px STIX Two Text'; cx.textAlign='right';
    cx.fillText(Math.ceil(timeLeft)+'s', 934, 44);
    gRaf=requestAnimationFrame(loop);
  }
  gRaf=requestAnimationFrame(loop);
}

/* --- Memory Match --- */
function memoryGame(onEnd){
  var SYM=['\u03c0','\u221a','\u2264','\u2265','\u2260','\u2211','\u0394','\u03b8'];
  var cards=shuffle(SYM.concat(SYM)).map(function(s){ return {s:s, up:false, done:false}; });
  var openIdx=[], lock=false, moves=0, matched=0, t0=performance.now();
  var CW=150, CH=96, GAP=12;
  var OX=(960-(4*CW+3*GAP))/2, OY=(540-(4*CH+3*GAP))/2+12;
  function draw(){
    cx.fillStyle='#12100a'; cx.fillRect(0,0,960,540);
    cards.forEach(function(c,i){
      var col=i%4, row=(i-col)/4;
      var x=OX+col*(CW+GAP), y=OY+row*(CH+GAP);
      if(c.up||c.done){
        cx.fillStyle=c.done? '#2b2415' : '#211a13';
        rr(cx,x,y,CW,CH,12); cx.fill();
        cx.strokeStyle=c.done? '#8db578' : '#d2a44d'; cx.lineWidth=2; cx.stroke();
        cx.fillStyle=c.done? '#8db578' : '#ecc87e';
        cx.font='600 44px STIX Two Text'; cx.textAlign='center'; cx.textBaseline='middle';
        cx.fillText(c.s, x+CW/2, y+CH/2+2);
      }else{
        var g=cx.createLinearGradient(x,y,x,y+CH);
        g.addColorStop(0,'#2b2620'); g.addColorStop(1,'#191512');
        cx.fillStyle=g; rr(cx,x,y,CW,CH,12); cx.fill();
        cx.strokeStyle='#3b3225'; cx.lineWidth=2; cx.stroke();
        cx.fillStyle='#8a6a2a'; cx.font='700 20px Fraunces'; cx.textAlign='center'; cx.textBaseline='middle';
        cx.fillText('A\u00b7I\u00b7D', x+CW/2, y+CH/2);
      }
    });
    cx.textBaseline='alphabetic';
    cx.fillStyle='#ecc87e'; cx.font='600 22px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Pairs '+matched+'/8', 26, 40);
    cx.fillStyle='#a6997e';
    cx.fillText('Moves '+moves, 26, 66);
  }
  var onDown=function(e){
    if(lock) return;
    var p=pt(e);
    var col=Math.floor((p.x-OX)/(CW+GAP)), row=Math.floor((p.y-OY)/(CH+GAP));
    if(col<0||col>3||row<0||row>3) return;
    var i=row*4+col;
    var x0=OX+col*(CW+GAP), y0=OY+row*(CH+GAP);
    if(p.x<x0||p.x>x0+CW||p.y<y0||p.y>y0+CH) return;
    if(cards[i].up||cards[i].done) return;
    cards[i].up=true; openIdx.push(i); AudioFX.tick();
    draw();
    if(openIdx.length===2){
      moves++; lock=true;
      var a=cards[openIdx[0]], b=cards[openIdx[1]];
      setTimeout(function(){
        if(a.s===b.s && openIdx[0]!==openIdx[1]){ a.done=b.done=true; matched++; AudioFX.ding(); }
        else{ a.up=b.up=false; AudioFX.bad(); }
        openIdx=[]; lock=false; draw();
        if(matched===8){
          var t=(performance.now()-t0)/1000;
          stopGameLoop();
          onEnd('All 8 pairs matched in <b>'+moves+' moves</b> and '+t.toFixed(1)+' seconds. Sharp memory \u2014 back to the questions!');
        }
      }, 650);
    }
  };
  cv.addEventListener('pointerdown',onDown);
  gCleanup=function(){ cv.removeEventListener('pointerdown',onDown); };
  draw();
}

/* --- Penalty Shootout --- */
function shootGame(onEnd){
  var G={x1:300,x2:660,y1:168,y2:330};
  var zones=[{x:345,y:205},{x:480,y:195},{x:615,y:205},{x:350,y:290},{x:480,y:285},{x:610,y:290}];
  var ball={x:480,y:468,vx:0,vy:0,rot:0,tgt:null};
  var phase='aim', aiming=false, aim={x:480,y:220};
  var shots=0, goals=0, resT=0, resWord='', wordT=0;
  var keeper={x:480,y:295,tx:480,ty:295,dive:false,delay:0};
  var trail=[];
  var crowd=[], ci;
  for(ci=0;ci<170;ci++) crowd.push({x:Math.random()*960, y:Math.random()*118, r:Math.random()*2.6+1.2,
    c:pick(['#3a332a','#4a3f2f','#5c4d33','#2d261d','#6f5b3a','#241f18'])});
  var last=performance.now();
  var onDown=function(e){
    var p=pt(e);
    if(phase==='aim' && Math.hypot(p.x-ball.x,p.y-ball.y)<110) aiming=true;
  };
  var onMove=function(e){
    if(aiming){
      var p=pt(e);
      aim={x:Math.min(780,Math.max(180,p.x)), y:Math.min(380,Math.max(110,p.y))};
    }
  };
  var onUp=function(){
    if(!aiming) return;
    aiming=false;
    if(Math.hypot(aim.x-ball.x,aim.y-ball.y)<45) return;
    phase='fly'; AudioFX.whoosh();
    var d=Math.hypot(aim.x-ball.x,aim.y-ball.y); if(d<1) d=1;
    var power=Math.min(1,d/300);
    var sp=800+power*560;
    ball.vx=(aim.x-ball.x)/d*sp; ball.vy=(aim.y-ball.y)/d*sp;
    ball.tgt={x:aim.x, y:aim.y};
    var zone;
    if(Math.random()<.5){
      zone=zones[0];
      for(var z=0;z<zones.length;z++){
        if(Math.hypot(zones[z].x-aim.x,zones[z].y-aim.y)<Math.hypot(zone.x-aim.x,zone.y-aim.y)) zone=zones[z];
      }
    }else zone=pick(zones);
    keeper.dive=true; keeper.delay=.09; keeper.tx=zone.x; keeper.ty=zone.y+14;
  };
  cv.addEventListener('pointerdown',onDown); cv.addEventListener('pointermove',onMove);
  cv.addEventListener('pointerup',onUp); cv.addEventListener('pointercancel',onUp);
  gCleanup=function(){ cv.removeEventListener('pointerdown',onDown); cv.removeEventListener('pointermove',onMove);
    cv.removeEventListener('pointerup',onUp); cv.removeEventListener('pointercancel',onUp); };
  AudioFX.whistle();
  function resolve(){
    var t=ball.tgt;
    var inGoal=(t.x>G.x1+12 && t.x<G.x2-12 && t.y>G.y1+8 && t.y<G.y2);
    var saved=(inGoal && keeper.dive && Math.hypot(ball.x-keeper.x, ball.y-(keeper.y-26))<64);
    if(!inGoal) resWord='MISS!';
    else if(saved){ resWord='SAVED!'; AudioFX.aww(); ball.vx*=-.3; ball.vy=Math.abs(ball.vy)*.35; }
    else{ resWord='GOAL!'; goals++; AudioFX.cheer(); }
    phase='result'; resT=1.6; wordT=0; shots++;
  }
  function drawScene(dt){
    var sky=cx.createLinearGradient(0,0,0,540);
    sky.addColorStop(0,'#0e1a12'); sky.addColorStop(.24,'#14301e'); sky.addColorStop(.26,'#12200f'); sky.addColorStop(1,'#0c180c');
    cx.fillStyle=sky; cx.fillRect(0,0,960,540);
    cx.fillStyle='#0a0f0b'; cx.fillRect(0,0,960,130);
    crowd.forEach(function(c){ cx.fillStyle=c.c; cx.beginPath(); cx.arc(c.x,c.y,c.r,0,Math.PI*2); cx.fill(); });
    cx.fillStyle='rgba(231,220,195,.1)'; cx.fillRect(0,126,960,5);
    for(var i=0;i<5;i++){ cx.fillStyle=(i%2? 'rgba(255,255,255,.03)':'rgba(0,0,0,.05)'); cx.fillRect(0,130+i*82,960,82); }
    cx.strokeStyle='rgba(231,220,195,.3)'; cx.lineWidth=2.5;
    cx.beginPath(); cx.moveTo(60,330); cx.lineTo(900,330); cx.stroke();
    cx.strokeStyle='rgba(231,220,195,.18)'; cx.lineWidth=2;
    cx.beginPath();
    cx.moveTo(230,330); cx.lineTo(280,452); cx.lineTo(680,452); cx.lineTo(730,330);
    cx.moveTo(380,330); cx.lineTo(400,392); cx.lineTo(560,392); cx.lineTo(580,330);
    cx.stroke();
    cx.strokeStyle='rgba(231,220,195,.16)'; cx.lineWidth=1;
    var n=14;
    for(var k=0;k<=n;k++){
      var t2=k/n;
      var xt=G.x1+t2*(G.x2-G.x1);
      var xb=G.x1-16+t2*(G.x2-G.x1+32);
      cx.beginPath(); cx.moveTo(xt,G.y1); cx.lineTo(xb,G.y2); cx.stroke();
    }
    var m=8;
    for(var j=0;j<=m;j++){
      var ty=G.y1+(G.y2-G.y1)*j/m;
      var inset=16*(j/m);
      cx.beginPath(); cx.moveTo(G.x1-inset,ty); cx.lineTo(G.x2+inset,ty); cx.stroke();
    }
    cx.strokeStyle='#ecc87e'; cx.lineWidth=8; cx.lineCap='round';
    cx.beginPath(); cx.moveTo(G.x1,G.y2+6); cx.lineTo(G.x1,G.y1); cx.lineTo(G.x2,G.y1); cx.lineTo(G.x2,G.y2+6); cx.stroke();
    cx.strokeStyle='rgba(138,106,42,.6)'; cx.lineWidth=3;
    cx.beginPath(); cx.moveTo(G.x1-4,G.y2+8); cx.lineTo(G.x1-4,G.y1-2); cx.lineTo(G.x2+4,G.y1-2); cx.lineTo(G.x2+4,G.y2+8); cx.stroke();
    var kx=keeper.x, ky=keeper.y+Math.sin(performance.now()/320)*3;
    if(keeper.dive && keeper.delay<=0){
      kx+=(keeper.tx-keeper.x)*Math.min(1,dt*6.5);
      ky+=(keeper.ty-keeper.y)*Math.min(1,dt*6.5);
    }
    var rot=Math.max(-.55,Math.min(.55,(kx-480)/160));
    cx.save(); cx.translate(kx,ky); cx.rotate(rot);
    cx.strokeStyle='#b08348'; cx.lineWidth=6; cx.lineCap='round';
    cx.beginPath(); cx.moveTo(-6,12); cx.lineTo(-12,36); cx.moveTo(6,12); cx.lineTo(12,36); cx.stroke();
    cx.fillStyle='#d2a44d'; rr(cx,-14,-20,28,34,9); cx.fill();
    cx.strokeStyle='#8a6a2a'; cx.lineWidth=1.5; rr(cx,-14,-20,28,34,9); cx.stroke();
    cx.fillStyle='#ecc87e'; cx.beginPath(); cx.arc(0,-29,9,0,Math.PI*2); cx.fill();
    cx.strokeStyle='#b08348'; cx.lineWidth=5;
    cx.beginPath(); cx.moveTo(-12,-10); cx.lineTo(-22,keeper.dive? -30 : -6);
    cx.moveTo(12,-10); cx.lineTo(22,keeper.dive? -30 : -6); cx.stroke();
    cx.fillStyle='#efe6d2';
    cx.beginPath(); cx.arc(-22,keeper.dive? -32 : -8,7,0,Math.PI*2); cx.fill();
    cx.beginPath(); cx.arc(22,keeper.dive? -32 : -8,7,0,Math.PI*2); cx.fill();
    cx.strokeStyle='#3b3225'; cx.lineWidth=1.2;
    cx.beginPath(); cx.arc(-22,keeper.dive? -32 : -8,7,0,Math.PI*2); cx.stroke();
    cx.beginPath(); cx.arc(22,keeper.dive? -32 : -8,7,0,Math.PI*2); cx.stroke();
    cx.restore();
    var keepT=[];
    trail.forEach(function(t){ t.life-=dt; if(t.life>0) keepT.push(t); });
    trail=keepT;
    trail.forEach(function(t){ cx.globalAlpha=t.life*.5; cx.fillStyle='#ecc87e';
      cx.beginPath(); cx.arc(t.x,t.y,6,0,Math.PI*2); cx.fill(); });
    cx.globalAlpha=1;
    cx.save(); cx.translate(ball.x,ball.y); cx.rotate(ball.rot);
    cx.fillStyle='#efe6d2'; cx.beginPath(); cx.arc(0,0,17,0,Math.PI*2); cx.fill();
    cx.strokeStyle='#3b3225'; cx.lineWidth=1.4; cx.stroke();
    cx.fillStyle='#2d261d';
    cx.beginPath();
    for(var pI=0;pI<5;pI++){
      var a=-Math.PI/2+pI*2*Math.PI/5, r=6.5;
      if(pI)cx.lineTo(Math.cos(a)*r,Math.sin(a)*r); else cx.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    cx.closePath(); cx.fill();
    cx.strokeStyle='rgba(43,38,29,.6)'; cx.lineWidth=2;
    for(var sI=0;sI<5;sI++){
      var a2=-Math.PI/2+(sI+.5)*2*Math.PI/5;
      cx.beginPath(); cx.arc(Math.cos(a2)*11.5,Math.sin(a2)*11.5,4.5,0,Math.PI*2); cx.stroke();
    }
    cx.restore();
    if(aiming && phase==='aim'){
      var pw=Math.min(1, Math.hypot(aim.x-ball.x,aim.y-ball.y)/300);
      cx.strokeStyle='rgba(236,200,126,.85)'; cx.lineWidth=3; cx.setLineDash([10,8]);
      cx.beginPath(); cx.moveTo(ball.x,ball.y); cx.lineTo(aim.x,aim.y); cx.stroke(); cx.setLineDash([]);
      cx.strokeStyle='#ecc87e'; cx.lineWidth=2.5;
      cx.beginPath(); cx.arc(aim.x,aim.y,15,0,Math.PI*2); cx.stroke();
      cx.beginPath(); cx.moveTo(aim.x-22,aim.y); cx.lineTo(aim.x-8,aim.y);
      cx.moveTo(aim.x+8,aim.y); cx.lineTo(aim.x+22,aim.y);
      cx.moveTo(aim.x,aim.y-22); cx.lineTo(aim.x,aim.y-8);
      cx.moveTo(aim.x,aim.y+8); cx.lineTo(aim.x,aim.y+22); cx.stroke();
      cx.strokeStyle='rgba(207,127,101,.9)'; cx.lineWidth=5; cx.lineCap='round';
      cx.beginPath(); cx.arc(ball.x,ball.y,25,-Math.PI/2,-Math.PI/2+pw*2*Math.PI); cx.stroke();
      cx.fillStyle='rgba(236,200,126,.9)'; cx.font='600 15px Instrument Sans'; cx.textAlign='center';
      cx.fillText('release to shoot', 480, 528);
    }
    cx.fillStyle='#e7dcc3'; cx.font='600 22px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Shot '+Math.min(shots+1,5)+'/5  \u00b7  Goals '+goals, 26, 42);
    if(phase==='aim' && shots===0 && !aiming){
      cx.fillStyle='rgba(231,220,195,.75)'; cx.font='17px Instrument Sans';
      cx.fillText('Drag the ball back, aim, release\u2026', 380, 500);
    }
    if(phase==='result' && resWord){
      var sc=1+Math.sin(wordT*Math.PI)*.25;
      cx.save(); cx.translate(480,230); cx.scale(sc,sc);
      cx.fillStyle=(resWord==='GOAL!'? '#ecc87e' : (resWord==='SAVED!'? '#cf7f65' : '#a6997e'));
      cx.font='700 72px Fraunces'; cx.textAlign='center'; cx.globalAlpha=Math.min(1,wordT*2);
      cx.fillText(resWord,0,0); cx.restore(); cx.globalAlpha=1;
    }
  }
  function loop(now){
    var dt=Math.min(.04,(now-last)/1000); last=now;
    if(phase==='fly'){
      if(keeper.delay>0) keeper.delay-=dt;
      ball.x+=ball.vx*dt; ball.y+=ball.vy*dt;
      ball.rot+=Math.hypot(ball.vx,ball.vy)*dt*.02;
      trail.push({x:ball.x,y:ball.y,life:.35});
      if(Math.hypot(ball.x-ball.tgt.x, ball.y-ball.tgt.y)<16) resolve();
      else if(ball.x<-50||ball.x>1010||ball.y<-50){ resWord='MISS!'; phase='result'; resT=1.6; wordT=0; shots++; }
    }
    if(phase==='result'){
      wordT=Math.min(1,wordT+dt*4); resT-=dt;
      if(resWord==='SAVED!'){ ball.x+=ball.vx*dt; ball.y+=ball.vy*dt; ball.vy+=300*dt; }
      if(resT<=0){
        if(shots>=5){
          stopGameLoop();
          onEnd('You scored <b>'+goals+' / 5</b> goals'+(goals>=4? ' \u2014 striker material!': (goals>=2? ' \u2014 a solid performance.':' \u2014 the keeper wins this round.'))+' Now, back to algebra!');
          return;
        }
        ball={x:480,y:468,vx:0,vy:0,rot:0,tgt:null}; trail=[];
        keeper.dive=false; keeper.x=480; keeper.y=295; phase='aim';
      }
    }
    drawScene(dt);
    gRaf=requestAnimationFrame(loop);
  }
  gRaf=requestAnimationFrame(loop);
}

/* --- Fruit Slice --- */
function fruitGame(onEnd){
  var kinds=[{c:'#cf7f65',c2:'#a85a42',leaf:true},
             {c:'#ecc87e',c2:'#d2a44d',leaf:true},
             {c:'#8db578',c2:'#5f8a4e',leaf:true},
             {c:'#e7dcc3',c2:'#c9b083',leaf:false}];
  var fruits=[], parts=[], score=0, timeLeft=30, spawnAcc=0, last=performance.now();
  var sword={x:480,y:270,px:480,py:270,active:false};
  var trail=[];
  var onMove=function(e){
    var p=pt(e);
    sword.px=sword.x; sword.py=sword.y; sword.x=p.x; sword.y=p.y;
    sword.active=(e.pointerType==='touch' || e.pointerType==='pen' || (e.buttons && e.buttons>0));
    if(sword.active && Math.hypot(sword.x-sword.px,sword.y-sword.py)>4){
      trail.push({x:sword.x,y:sword.y,life:.25});
      if(trail.length>14) trail.shift();
    }
  };
  cv.addEventListener('pointermove',onMove);
  cv.addEventListener('pointerdown',onMove);
  cv.addEventListener('pointerup',function(){ sword.active=false; });
  gCleanup=function(){ cv.removeEventListener('pointermove',onMove); cv.removeEventListener('pointerdown',onMove); };
  AudioFX.whistle();
  function loop(now){
    var dt=Math.min(.04,(now-last)/1000); last=now;
    timeLeft-=dt;
    if(timeLeft<=0){
      stopGameLoop();
      onEnd('You sliced <b>'+score+'</b> fruits in 30 seconds. Blade mastered \u2014 back to algebra!');
      return;
    }
    spawnAcc+=dt;
    if(spawnAcc>Math.max(.42, .78-(30-timeLeft)*.012)){
      spawnAcc=0;
      fruits.push({x:rnd(120,840), y:565, vx:rnd(-70,70), vy:-(540+rnd(0,170)),
        k:pick(kinds), rot:Math.random()*6, vr:rnd(-3,3), cut:false, r:rnd(30,42)});
    }
    var keep=[];
    fruits.forEach(function(f){
      if(f.cut){ f.y+=560*dt; f.rot+=f.vr*2*dt; if(f.y<620) keep.push(f); return; }
      f.vy+=900*dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.rot+=f.vr*dt;
      var seg=Math.hypot(sword.x-sword.px, sword.y-sword.py);
      if(sword.active && seg>18){
        var dx=sword.x-sword.px, dy=sword.y-sword.py;
        var distLine=Math.abs(dy*(f.x-sword.px)-dx*(f.y-sword.py))/seg;
        if(distLine<f.r+8 && Math.hypot(f.x-sword.x,f.y-sword.y)<95){
          f.cut=true; score++; AudioFX.whoosh();
          burst(parts,f.x,f.y,f.k.c,12);
        }
      }
      if(f.y<640) keep.push(f);
    });
    fruits=keep;
    cx.fillStyle='#161009'; cx.fillRect(0,0,960,540);
    cx.fillStyle='rgba(231,220,195,.05)';
    for(var y=30;y<540;y+=70){ cx.beginPath(); cx.arc((y*13)%960,y,1.2,0,Math.PI*2); cx.fill(); }
    fruits.forEach(function(f){
      cx.save(); cx.translate(f.x,f.y); cx.rotate(f.rot);
      cx.fillStyle=f.k.c; cx.strokeStyle=f.k.c2; cx.lineWidth=3;
      if(f.cut){
        cx.beginPath(); cx.arc(-9,0,f.r*.85,-.9,.9); cx.lineTo(-9-f.r*.4,0); cx.closePath(); cx.fill(); cx.stroke();
        cx.beginPath(); cx.arc(9,0,f.r*.85,Math.PI-.9,Math.PI+.9); cx.lineTo(9+f.r*.4,0); cx.closePath(); cx.fill(); cx.stroke();
      }else{
        cx.beginPath(); cx.arc(0,0,f.r,0,Math.PI*2); cx.fill(); cx.stroke();
        if(f.k.leaf){
          cx.strokeStyle=f.k.c2; cx.beginPath(); cx.moveTo(0,-f.r); cx.quadraticCurveTo(6,-f.r-10,14,-f.r-6); cx.stroke();
          cx.fillStyle='#5f8a4e'; cx.beginPath(); cx.ellipse(17,-f.r-4,9,4,.6,0,Math.PI*2); cx.fill();
        }else{
          cx.strokeStyle=f.k.c2; cx.lineWidth=4; cx.beginPath(); cx.arc(0,0,f.r*.6,0,Math.PI*2); cx.stroke();
        }
      }
      cx.restore();
    });
    var keepT=[];
    trail.forEach(function(t){ t.life-=dt; if(t.life>0) keepT.push(t); });
    trail=keepT;
    if(trail.length>1){
      cx.strokeStyle='rgba(236,200,126,.75)'; cx.lineWidth=6; cx.lineCap='round';
      cx.beginPath(); cx.moveTo(trail[0].x,trail[0].y);
      for(var i=1;i<trail.length;i++) cx.lineTo(trail[i].x,trail[i].y);
      cx.stroke();
      cx.strokeStyle='rgba(243,236,216,.95)'; cx.lineWidth=2;
      cx.beginPath(); cx.moveTo(trail[0].x,trail[0].y);
      for(var j=1;j<trail.length;j++) cx.lineTo(trail[j].x,trail[j].y);
      cx.stroke();
    }
    parts=drawParts(cx,parts,dt);
    cx.fillStyle='#ecc87e'; cx.font='600 24px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Sliced '+score, 26, 44);
    cx.fillStyle='#a6997e'; cx.font='19px STIX Two Text'; cx.textAlign='right';
    cx.fillText(Math.ceil(timeLeft)+'s', 934, 44);
    gRaf=requestAnimationFrame(loop);
  }
  gRaf=requestAnimationFrame(loop);
}

/* --- Bubble Rush --- */
function popGame(onEnd){
  var bubbles=[], timeLeft=22, score=0, spawnAcc=0, last=performance.now();
  var best=parseInt(ssGet('aidPopBest')||'0',10) || 0;
  var onDown=function(e){
    var p=pt(e);
    for(var i=bubbles.length-1;i>=0;i--){
      var b=bubbles[i];
      if(Math.hypot(p.x-b.x,p.y-b.y)<b.r+10){
        bubbles.splice(i,1); score++; AudioFX.pop();
        if(score>best){ best=score; ssSet('aidPopBest',String(best)); }
        break;
      }
    }
  };
  cv.addEventListener('pointerdown',onDown);
  gCleanup=function(){ cv.removeEventListener('pointerdown',onDown); };
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000); last=now;
    timeLeft-=dt;
    if(timeLeft<=0){
      stopGameLoop();
      onEnd('You popped <b>'+score+'</b> bubbles'+((score>=best&&score>0)? ' \u2014 a new personal best!':' \u00b7 best this session: '+best)+'. Reflexes sharpened \u2014 let\u2019s solve!');
      return;
    }
    var rate=Math.max(.34, .62-(22-timeLeft)*.013);
    spawnAcc+=dt;
    if(spawnAcc>rate && bubbles.length<11){
      spawnAcc=0;
      bubbles.push({x:rnd(70,890), y:rnd(70,470), r:rnd(24,42), color:pick(PAL), age:0, life:rnd(.8,1.5)});
    }
    var keep=[];
    bubbles.forEach(function(b){ b.age+=dt; if(b.age<b.life) keep.push(b); });
    bubbles=keep;
    cx.fillStyle='#12100a'; cx.fillRect(0,0,960,540);
    cx.fillStyle='rgba(231,220,195,.05)';
    for(var y=40;y<540;y+=80){
      for(var x=40;x<960;x+=80){ cx.beginPath(); cx.arc(x,y,1.5,0,Math.PI*2); cx.fill(); }
    }
    bubbles.forEach(function(b){
      var grow=Math.min(1,b.age/.12), shrink=(b.age>b.life-.22)? (b.life-b.age)/.22 : 1;
      var k=Math.max(0,Math.min(1,grow))*shrink, r=b.r*k, pulse=1+Math.sin(b.age*10)*.03;
      cx.fillStyle=b.color+'2e'; cx.strokeStyle=b.color; cx.lineWidth=Math.max(3,b.r*.13);
      cx.beginPath(); cx.arc(b.x,b.y,r*pulse,0,Math.PI*2); cx.fill(); cx.stroke();
      cx.strokeStyle='rgba(243,236,216,.75)'; cx.lineWidth=3.5; cx.lineCap='round';
      cx.beginPath(); cx.arc(b.x,b.y,r*.62,-2.3,-1.2); cx.stroke();
    });
    cx.fillStyle='#ecc87e'; cx.font='600 26px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Score '+score, 26, 44);
    cx.fillStyle='#a6997e'; cx.font='19px STIX Two Text'; cx.textAlign='right';
    cx.fillText(Math.ceil(timeLeft)+'s  \u00b7  best '+best, 934, 44);
    gRaf=requestAnimationFrame(loop);
  }
  gRaf=requestAnimationFrame(loop);
}

/* --- Quick Calc --- */
function quickCalcGame(onEnd){
  var big=0, small=0, op='\u00d7', answer=0, score=0, streak=0, bestStreak=0;
  var tLeft=45, last=performance.now(), flashOk=0, flashNo=0, curOpts=[];
  var W=190, H=88, GAP=22, Y0=318, OX=(960-(W*2+GAP))/2;
  function newQ(){
    op=pick(['\u00d7','\u00f7']);
    if(op==='\u00d7'){ big=rnd(3,12); small=rnd(3,9); answer=big*small; }
    else{ small=rnd(3,9); answer=rnd(3,12); big=small*answer; }
    var s=[answer], guard=0;
    while(s.length<4 && guard++<80){
      var v=answer+rnd(-12,12);
      if(v>0 && s.indexOf(v)<0) s.push(v);
    }
    while(s.length<4) s.push(answer+s.length+3);
    curOpts=shuffle(s);
  }
  function render(){
    cx.fillStyle='#12100a'; cx.fillRect(0,0,960,540);
    cx.fillStyle='#a6997e'; cx.font='600 20px Instrument Sans'; cx.textAlign='center';
    cx.fillText('SOLVE FAST', 480, 92);
    cx.fillStyle='#efe6d2'; cx.font='600 68px STIX Two Text';
    cx.fillText(big+' '+op+' '+small, 480, 208);
    curOpts.forEach(function(v,i){
      var x=OX+(i%2)*(W+GAP), y=Y0+((i-(i%2))/2)*(H+GAP);
      cx.fillStyle='#211a13'; rr(cx,x,y,W,H,14); cx.fill();
      cx.strokeStyle='#3b3225'; cx.lineWidth=2; cx.stroke();
      cx.fillStyle='#ecc87e'; cx.font='600 34px STIX Two Text'; cx.textAlign='center'; cx.textBaseline='middle';
      cx.fillText(String(v), x+W/2, y+H/2+2);
    });
    cx.textBaseline='alphabetic';
    cx.fillStyle='#ecc87e'; cx.font='600 26px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Score '+score, 26, 44);
    if(streak>1){ cx.fillStyle='#cf7f65'; cx.font='600 20px STIX Two Text'; cx.fillText('\u00d7'+streak+' streak', 26, 72); }
    cx.fillStyle='#a6997e'; cx.textAlign='right';
    cx.fillText(Math.ceil(tLeft)+'s', 934, 44);
    if(flashOk>0){ cx.fillStyle='rgba(141,181,120,'+Math.min(.25,flashOk)+')'; cx.fillRect(0,0,960,540); }
    if(flashNo>0){ cx.fillStyle='rgba(195,105,80,'+Math.min(.25,flashNo)+')'; cx.fillRect(0,0,960,540); }
  }
  var onDown=function(e){
    var p=pt(e);
    for(var i=0;i<4;i++){
      var x=OX+(i%2)*(W+GAP), y=Y0+((i-(i%2))/2)*(H+GAP);
      if(p.x>x&&p.x<x+W&&p.y>y&&p.y<y+H){
        if(curOpts[i]===answer){
          score+=streak+1; streak++;
          if(streak>bestStreak) bestStreak=streak;
          flashOk=.25; AudioFX.ding();
        }else{ streak=0; flashNo=.25; AudioFX.bad(); }
        newQ();
        break;
      }
    }
  };
  cv.addEventListener('pointerdown',onDown);
  gCleanup=function(){ cv.removeEventListener('pointerdown',onDown); };
  newQ();
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000); last=now;
    tLeft-=dt; flashOk=Math.max(0,flashOk-dt); flashNo=Math.max(0,flashNo-dt);
    if(tLeft<=0){
      stopGameLoop();
      onEnd('Quick math: <b>'+score+'</b> points with a best streak of <b>\u00d7'+bestStreak+'</b>. Brain warmed up \u2014 back to the questions!');
      return;
    }
    render();
    gRaf=requestAnimationFrame(loop);
  }
  gRaf=requestAnimationFrame(loop);
}

/* ---------------- Results ---------------- */
function placeOf(errors){
  if(errors<=2)  return {rank:'1st Place', tier:'gold'};
  if(errors<=4)  return {rank:'2nd Place', tier:'silver'};
  if(errors<=6)  return {rank:'3rd Place', tier:'bronze'};
  if(errors<=8)  return {rank:'4th Place', tier:'iron'};
  if(errors<=10) return {rank:'5th Place', tier:'iron'};
  return {rank:'Keep Training', tier:'none'};
}
function medalSVG(tier){
  var cols={gold:['#d8a84e','#8a6a2a'],silver:['#c3cbd4','#78828d'],bronze:['#b98767','#7a5138'],iron:['#8e8578','#5c564c'],none:['#8e8578','#5c564c']}[tier];
  return '<svg class="medal" viewBox="0 0 120 130">'+
    '<path d="M42 0 L58 34 L32 44 L20 12 Z" fill="'+cols[0]+'" stroke="'+cols[1]+'" stroke-width="2"/>'+
    '<path d="M78 0 L62 34 L88 44 L100 12 Z" fill="'+cols[0]+'" stroke="'+cols[1]+'" stroke-width="2"/>'+
    '<circle cx="60" cy="82" r="36" fill="'+cols[0]+'" stroke="'+cols[1]+'" stroke-width="3.5"/>'+
    '<circle cx="60" cy="82" r="27" fill="none" stroke="'+cols[1]+'" stroke-width="1.6"/>'+
    '<path d="M60 66 l5.1 10.6 11.7 1.6 -8.5 8.2 2.1 11.6 -10.4-5.6 -10.4 5.6 2.1-11.6 -8.5-8.2 11.7-1.6 Z" fill="'+cols[1]+'"/></svg>';
}
var lastLesson=null;
function finishLesson(early){
  early=!!early;
  Timer.stop();
  var L=QZ.lesson;
  var total= early? answeredCount() : QZ.qs.length;
  if(total<1) return;
  var time=Timer.elapsed(), errors=QZ.mistakes.length;
  var place=placeOf(errors);
  lastLesson=L;
  var prev=P.completed[L.id];
  if(!prev || QZ.score>prev.score || (QZ.score===prev.score && time<prev.time)){
    P.completed[L.id]={score:QZ.score, errors:errors, time:time, rank:place.rank, total:total}; saveP();
  }
  renderResults(L,{total:total,time:time,errors:errors,place:place,early:early});
  show('scr-results');
  AudioFX.fanfare();
  if(L.master && !prev) toast('MASTER CHALLENGE COMPLETE \u2014 legendary!');
}
function renderResults(L,r){
  var tm=TEACHER_META[P.teacher];
  $('#resChip').textContent=L.master? (r.early? 'Master \u2014 Ended Early':'Master Challenge Complete') : (r.early? 'Lesson Ended Early':'Lesson Complete');
  $('#resTitle').innerHTML=L.title;
  $('#resMedal').innerHTML=medalSVG(r.place.tier);
  var praise=(r.errors===0)? 'A flawless run \u2014 not a single slip. Outstanding!' :
    (r.place.tier==='none'? 'Every mistake is a map of what to fix next. Retry and climb the ranks!' :
    'You finished in '+r.place.rank+' \u2014 '+(r.total-r.errors)+' correct answers.');
  if(r.early) praise+=' (stopped after '+r.total+' questions)';
  $('#resPraise').textContent=praise;
  $('#perfectBox').innerHTML=(r.errors===0)? '<div class="perfect">PERFECT LESSON \u2014 ZERO MISTAKES</div>':'';
  var acc=Math.round((r.total-r.errors)/r.total*100);
  $('#resStats').innerHTML=
    '<div class="stat"><div class="v">'+QZ.score+'/'+r.total+'</div><div class="l">Score</div></div>'+
    '<div class="stat"><div class="v">'+fmtTime(r.time)+'</div><div class="l">Time</div></div>'+
    '<div class="stat"><div class="v">'+r.errors+'</div><div class="l">Mistakes</div></div>'+
    '<div class="stat"><div class="v">'+acc+'%</div><div class="l">Accuracy</div></div>';
  $('#ruleLine').innerHTML='Placement rule: <b>0\u20132 mistakes</b> \u2192 1st &nbsp;\u00b7&nbsp; <b>3\u20134</b> \u2192 2nd &nbsp;\u00b7&nbsp; <b>5\u20136</b> \u2192 3rd &nbsp;\u00b7&nbsp; <b>7\u20138</b> \u2192 4th &nbsp;\u00b7&nbsp; <b>9\u201310</b> \u2192 5th &nbsp;\u00b7&nbsp; more \u2192 keep training';
  $('#mistakesList').innerHTML=QZ.mistakes.length? QZ.mistakes.map(function(m){
    return '<div class="mrow"><span class="mnum">Q'+m.num+'</span>'+
      (m.tag? '<span class="mtag">'+m.tag+'</span>':'')+
      '<span class="mq">'+mathHTML(m.text)+'</span>'+
      '<span class="mans you">you chose '+mathHTML(m.chosen)+'</span>'+
      '<span class="mans ok">correct: '+mathHTML(m.correct)+'</span></div>';
  }).join('')
  : '<p class="muted">Nothing to report \u2014 you made zero mistakes. Every single answer was correct!</p>';
  var rivals=['Omar','Sara','Youssef','Malak','Adam'].map(function(n){
    var e=pick([0,1,1,2,2,3,3,4,4,5,6,7]);
    return {name:n, errors:e, time:e*22+rnd(70,160)};
  });
  rivals.push({name:P.name, errors:r.errors, time:r.time, me:true});
  rivals.sort(function(a,b){ return a.errors-b.errors || a.time-b.time; });
  $('#leaderList').innerHTML=rivals.map(function(p,i){
    return '<div class="lrow2 '+(p.me?'me':'')+'"><span class="lpos">'+(i+1)+'</span>'+
    '<span class="lname">'+p.name+(p.me? ' \u2014 you':'')+'</span>'+
    '<span class="lstat">'+p.errors+' mistake'+(p.errors===1?'':'s')+' \u00b7 '+fmtTime(p.time)+'</span></div>';
  }).join('');
  $('#certName').textContent=P.name;
  $('#certLesson').textContent=(L.master? 'The Master Challenge \u2014 ':'Lesson '+L.num+' \u2014 ')+String(L.title).replace(/&amp;/g,'&')+' \u00b7 '+tm.name;
  $('#certStats').textContent='Score '+QZ.score+'/'+r.total+'  \u00b7  Time '+fmtTime(r.time)+'  \u00b7  '+r.place.rank;
  $('#certDate').textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  $('#sigEmb').innerHTML=EMBLEMS[P.teacher]||'';
  $('#sigName').textContent=tm.name;
  $('#sigRole').textContent=tm.role;
}

/* ================================================================
   GHOST MODE — DUEL عمودي (فوق مقلوب / تحت معدول)
   2 دقيقة لكل سؤال · صح الأول = 10 ثواني للتاني · غلط الأول = الوقت بيكمل
================================================================ */
var GM={players:[],count:10,results:[]};
var gmSelQ=10;
function initGhostSetup(){
  gmSelQ=10;
  $('#gmNames').innerHTML=
    '<input class="gm-inp" maxlength="18" placeholder="Player 1 \u2014 TOP side" autocomplete="off">'+
    '<input class="gm-inp" maxlength="18" placeholder="Player 2 \u2014 BOTTOM side" autocomplete="off">';
  var segQ=$('#gmCount');
  segQ.innerHTML=[5,10,15,20].map(function(n){
    return '<button type="button" data-v="'+n+'"'+(n===10?' class="sel"':'')+'>'+n+' Questions</button>';
  }).join('');
  segQ.onclick=function(e){
    var b=e.target;
    if(!b || !b.getAttribute || !b.getAttribute('data-v')) return;
    gmSelQ=parseInt(b.getAttribute('data-v'),10);
    var bs=$$('#gmCount button');
    for(var i=0;i<bs.length;i++){ bs[i].classList.toggle('sel', bs[i]===b); }
    AudioFX.tick();
  };
}
var DUEL={active:false,total:10,qi:0,qs:[],p:null,afterT:null,qT0:0,qInt:null,QT:120,qt:120,grace:false,graceP:-1};
function buildDuelQuestions(n){
  var seq=balancedSeq(n), out=[], seen={}, guard=0;
  while(out.length<n && guard++<600){
    var q=mixedGen();
    if(!q || seen[q.text]) continue;
    seen[q.text]=1;
    q.choices=buildChoices(q, seq[out.length]);
    q.correctIdx=seq[out.length];
    out.push(q);
  }
  return out;
}
function startDuel(){
  DUEL={active:true, total:GM.count, qi:0, qs:buildDuelQuestions(GM.count),
    p:[
      {name:GM.players[0]||'Player 1', score:0, wrong:0, react:0, answered:false, ok:false, ms:0, choice:-1},
      {name:GM.players[1]||'Player 2', score:0, wrong:0, react:0, answered:false, ok:false, ms:0, choice:-1}
    ],
    afterT:null, qT0:0, qInt:null, QT:120, qt:120, grace:false, graceP:-1};
  $('#dvTName').textContent=DUEL.p[0].name;
  $('#dvBName').textContent=DUEL.p[1].name;
  $('#dvTScore').textContent='0';
  $('#dvBScore').textContent='0';
  $('#tbLesson').textContent='Ghost Duel';
  show('scr-ghost-duel'); Timer.start(); duelQ();
  toast('No calculator, no hints \u2014 2 minutes per question!');
}
function duelStartTimer(){
  clearInterval(DUEL.qInt);
  var bar=$('#duelQBar');
  bar.style.width='100%';
  bar.classList.toggle('low', DUEL.QT<=15);
  DUEL.qInt=setInterval(function(){
    if(!DUEL.active){ clearInterval(DUEL.qInt); return; }
    DUEL.qt-=0.1;
    bar.style.width=Math.max(0, DUEL.qt/DUEL.QT*100)+'%';
    if(DUEL.qt<=Math.min(15, DUEL.QT*.3)) bar.classList.add('low');
    if(DUEL.qt<=0){
      clearInterval(DUEL.qInt);
      if(DUEL.grace) duelGraceOut();
      else duelTimeUp();
    }
  },100);
}
function duelQ(){
  if(DUEL.qi>=DUEL.total){ duelEnd(); return; }
  clearTimeout(DUEL.afterT); clearInterval(DUEL.qInt);
  DUEL.grace=false; DUEL.graceP=-1; DUEL.QT=120; DUEL.qt=120;
  var q=DUEL.qs[DUEL.qi];
  $('#duelQNum').textContent='Q '+(DUEL.qi+1)+'/'+DUEL.total;
  $('#dvTExpr').innerHTML=mathHTML(q.text);
  $('#dvBExpr').innerHTML=mathHTML(q.text);
  DUEL.p[0].answered=false; DUEL.p[1].answered=false;
  DUEL.p[0].ok=false; DUEL.p[1].ok=false;
  DUEL.p[0].choice=-1; DUEL.p[1].choice=-1;
  renderDVSide(0,q); renderDVSide(1,q);
  $('#duelTurn').textContent='2 minutes \u00b7 first correct takes the point';
  DUEL.qT0=performance.now();
  duelStartTimer();
}
/* النص الفوقي مقلوب 180° فبيترتب معكوس في الـDOM عشان الطالب الفوقاني يشوف A B C D من جهته */
function renderDVSide(pi,q){
  var L=['A','B','C','D'];
  var order=(pi===0)? [3,2,1,0] : [0,1,2,3];
  var box=$('#dv'+(pi===0?'T':'B')+'Opts');
  box.innerHTML=order.map(function(i){
    return '<button class="dv-opt" type="button" data-i="'+i+'"><span class="k">'+L[i]+'</span><span>'+mathHTML(lin(q.choices[i].a,q.choices[i].b))+'</span></button>';
  }).join('');
  $$('#dv'+(pi===0?'T':'B')+'Opts .dv-opt').forEach(function(b){
    b.onclick=function(){ duelAnswer(pi, parseInt(b.getAttribute('data-i'),10)); };
  });
  var st=$('#dv'+(pi===0?'T':'B')+'Stat');
  st.textContent='Your move\u2026'; st.className='dv-stat';
}
function duelAnswer(pi, oi){
  if(!DUEL.active || DUEL.p[pi].answered) return;
  var q=DUEL.qs[DUEL.qi];
  DUEL.p[pi].answered=true;
  var ms=performance.now()-DUEL.qT0;
  DUEL.p[pi].ms=ms; DUEL.p[pi].react+=ms; DUEL.p[pi].choice=oi;
  var ok=(oi===q.correctIdx);
  DUEL.p[pi].ok=ok;
  if(ok) DUEL.p[pi].score++; else DUEL.p[pi].wrong++;
  /* نقفل جهته بدون كشف الإجابة للتاني */
  var btns=$$('#dv'+(pi===0?'T':'B')+'Opts .dv-opt');
  btns.forEach(function(b){ b.disabled=true; b.classList.add('dim'); });
  var st=$('#dv'+(pi===0?'T':'B')+'Stat');
  st.textContent='Locked in '+(ms/1000).toFixed(1)+'s';
  st.className='dv-stat';
  AudioFX.tick();
  var other=1-pi;
  if(DUEL.p[other].answered){ duelRoundDone(1400); return; }
  if(ok){
    /* الأول جاوب صح → التاني له 10 ثواني بس */
    DUEL.grace=true; DUEL.graceP=other;
    DUEL.QT=10; DUEL.qt=10;
    var ost=$('#dv'+(other===0?'T':'B')+'Stat');
    ost.textContent='Rival locked it! 10 seconds\u2026';
    ost.className='dv-stat';
    duelStartTimer();
  }
  /* لو غلط: المؤقت العادي (الباقي من الدقيقتين) بيكمل عادي للتاني — مفيش تغيير */
}
function duelGraceOut(){
  var other=DUEL.graceP;
  if(other>=0 && !DUEL.p[other].answered){
    DUEL.p[other].answered=true; DUEL.p[other].choice=-1; DUEL.p[other].ok=false;
    DUEL.p[other].wrong++; DUEL.p[other].ms=10000; DUEL.p[other].react+=10000;
    var b=$$('#dv'+(other===0?'T':'B')+'Opts .dv-opt');
    b.forEach(function(x){ x.disabled=true; x.classList.add('dim'); });
  }
  duelRoundDone(1400);
}
function duelTimeUp(){
  if(!DUEL.active) return;
  for(var pi=0;pi<2;pi++){
    if(!DUEL.p[pi].answered){
      DUEL.p[pi].answered=true; DUEL.p[pi].choice=-1; DUEL.p[pi].ok=false;
      DUEL.p[pi].wrong++; DUEL.p[pi].ms=120000; DUEL.p[pi].react+=120000;
      var b=$$('#dv'+(pi===0?'T':'B')+'Opts .dv-opt');
      b.forEach(function(x){ x.disabled=true; x.classList.add('dim'); });
    }
  }
  duelRoundDone(1600);
}
function duelRoundDone(delay){
  clearInterval(DUEL.qInt); clearTimeout(DUEL.afterT);
  DUEL.grace=false; DUEL.graceP=-1;
  var q=DUEL.qs[DUEL.qi], pi;
  for(pi=0;pi<2;pi++){
    var btns=$$('#dv'+(pi===0?'T':'B')+'Opts .dv-opt');
    btns.forEach(function(b){
      var bi=parseInt(b.getAttribute('data-i'),10);
      b.classList.remove('dim');
      if(bi===q.correctIdx) b.classList.add('correct');
      else if(DUEL.p[pi].choice===bi) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    var st=$('#dv'+(pi===0?'T':'B')+'Stat');
    if(DUEL.p[pi].choice===-1){ st.textContent='Too slow'; st.className='dv-stat no'; }
    else if(DUEL.p[pi].ok){ st.textContent='Correct +1 ('+(DUEL.p[pi].ms/1000).toFixed(1)+'s)'; st.className='dv-stat ok'; }
    else{ st.textContent='Wrong'; st.className='dv-stat no'; }
    $('#dv'+(pi===0?'T':'B')+'Score').textContent=DUEL.p[pi].score;
  }
  if(DUEL.p[0].ok && DUEL.p[1].ok){
    $('#duelTurn').textContent='Both correct \u2014 faster: '+((DUEL.p[0].ms<=DUEL.p[1].ms)? DUEL.p[0].name : DUEL.p[1].name);
    AudioFX.good();
  }else if(DUEL.p[0].ok){ $('#duelTurn').textContent=DUEL.p[0].name+' takes the point!'; AudioFX.good(); }
  else if(DUEL.p[1].ok){ $('#duelTurn').textContent=DUEL.p[1].name+' takes the point!'; AudioFX.good(); }
  else{ $('#duelTurn').textContent='No point this round'; AudioFX.bad(); }
  DUEL.afterT=setTimeout(function(){
    DUEL.qi++;
    duelQ();
  }, delay);
}
function duelEnd(){
  clearTimeout(DUEL.afterT); clearInterval(DUEL.qInt);
  DUEL.active=false; Timer.stop();
  var a=DUEL.p[0], b=DUEL.p[1];
  GM.results=[
    {name:a.name, score:a.score, errors:a.wrong, total:DUEL.total, time:Math.round(a.react/1000)},
    {name:b.name, score:b.score, errors:b.wrong, total:DUEL.total, time:Math.round(b.react/1000)}
  ];
  ghostResults();
}
function ghostResults(){
  var ranked=GM.results.slice().sort(function(x,y){ return y.score-x.score || x.time-y.time; });
  var w=ranked[0], l=ranked[ranked.length-1];
  $('#grMedal').innerHTML=medalSVG('gold');
  $('#grTitle').textContent='Duel Complete';
  $('#grPraise').textContent=w.name+' wins '+w.score+'\u2013'+l.score+' against '+l.name+'. The champion answered everything in a total of '+fmtTime(w.time)+' \u2014 duel ran for '+fmtTime(Timer.elapsed())+'.';
  $('#grChampEmb').innerHTML=EMBLEMS.ghost;
  $('#grChampName').textContent=w.name;
  var avg=w.total? Math.round(w.time/w.total) : 0;
  $('#grChampStats').textContent='Score '+w.score+'/'+w.total+' \u00b7 '+w.errors+' wrong \u00b7 avg '+fmtTime(avg)+' per answer';
  var tiers=['gold','silver','bronze','iron'];
  $('#gmTable').innerHTML=ranked.map(function(p,i){
    var sm=medalSVG(tiers[i]||'iron').replace('class="medal"','class="medal sm"');
    return '<div class="lrow2"><span class="lpos">'+(i+1)+'</span><span class="lname">'+p.name+(i===0?' \u2014 champion':'')+'</span>'+
      '<span class="lstat">'+p.score+'/'+p.total+' correct \u00b7 '+p.errors+' wrong \u00b7 answer time '+fmtTime(p.time)+'</span>'+sm+'</div>';
  }).join('');
  $('#gcName').textContent=w.name;
  $('#gcStats').textContent='Ghost Mode Champion \u00b7 Score '+w.score+'/'+w.total+' \u00b7 Total answer time '+fmtTime(w.time)+' \u00b7 Duel duration '+fmtTime(Timer.elapsed());
  $('#gcEmb').innerHTML=EMBLEMS.akram;
  $('#gcDate').textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  show('scr-ghost-results');
  AudioFX.fanfare();
  toast('Champion: '+w.name+'!');
}

/* ---------------- Init ---------------- */
function refreshTeacherCards(){
  var cards=$$('#teacherCards .tcard');
  cards.forEach(function(c){ c.classList.toggle('sel', c.getAttribute('data-t')===P.teacher); });
}
function boot(){
  var REQUIRED=['btnBegin','inpName','btnName','btnRename','teacherCards','lessonList','hubProgress','hubHello','hubTitle',
    'introChip','introTitle','introDesc','skillList','methodList','workedBox','btnStartLesson','btnIntroBack',
    'btnCalcTry','btnCalcTryLbl','introCalcSlot','introCalcLaunch',
    'qLessonChip','qNum','qFill','qTicks','qExpr','qPrompt','qOpts','btnHint','hintCount','hintBox','feedback',
    'btnCalc','btnCalcLbl','quizCalcSlot','quizCalcLaunch','btnStop','stopModal','stopStats','stopKeep','stopFinish','stopExit',
    'gmNames','gmCount','gmStart','gmBack',
    'scr-ghost-duel','duelQNum','duelTurn','duelQBar',
    'dvTName','dvTExpr','dvTOpts','dvTStat','dvTScore',
    'dvBName','dvBExpr','dvBOpts','dvBStat','dvBScore','btnDuelAbort',
    'grMedal','grTitle','grPraise','grChampEmb','grChampName','grChampStats','gmTable',
    'ghostCert','gcName','gcStats','gcEmb','gcDate','btnGhostPrint','btnGhostRematch','btnGhostExit',
    'gameTitle','gameHud','gameCv','gameOverlay','gOvTitle','gOvText','gOvBtn',
    'resChip','resTitle','resPraise','resMedal','perfectBox','resStats','ruleLine','mistakesList','leaderList',
    'certName','certLesson','certStats','certDate','certCard','btnPrint','btnRetry','btnHub','sigName','sigEmb','sigRole',
    'topbar','tbLesson','tbTimer','tbEmblem','btnMute','btnFull','toast','printOnly',
    'calcHolder','casio','czKeys','czLine1','czLine2','czAvoid',
    'indShift','indAlpha','indSto','indM','indX','scr-splash'];
  var missing=[];
  for(var i=0;i<REQUIRED.length;i++){ if(!document.getElementById(REQUIRED[i])) missing.push(REQUIRED[i]); }
  if(missing.length){
    toast('Setup error \u2014 missing: '+missing.join(', '));
    return;
  }
  czEl=$('#casio'); cv=$('#gameCv'); cx=cv.getContext('2d');
  buildCasioKeys(); bindCalcKeyboard();
  czRender(); czSetQuestion(null);

  var embs=$$('#teacherCards .emb');
  embs.forEach(function(e){ e.innerHTML=EMBLEMS[e.getAttribute('data-emb')]||''; });
  refreshTeacherCards(); setEmblem();
  $$('#teacherCards .tcard').forEach(function(c){
    c.onclick=function(){
      P.teacher=c.getAttribute('data-t'); saveP();
      refreshTeacherCards(); setEmblem(); AudioFX.tick();
    };
  });

  $('#btnMute').onclick=function(){ AudioFX.toggle(); setMuteIcon(); };
  $('#btnFull').onclick=function(){
    try{
      if(!document.fullscreenElement){ if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
      else if(document.exitFullscreen){ document.exitFullscreen(); }
    }catch(e){}
  };
  $('#btnBegin').onclick=function(){
    try{
      if(P.name){ renderHub(); show('scr-hub'); }
      else{ show('scr-name'); setTimeout(function(){ try{ $('#inpName').focus(); }catch(e){} },60); }
    }catch(err){ toast('Error: '+err.message); }
    AudioFX.tick();
  };
  $('#btnName').onclick=function(){
    var v=$('#inpName').value.trim();
    if(!v){
      $('#inpName').classList.add('shake');
      setTimeout(function(){ $('#inpName').classList.remove('shake'); },400);
      $('#inpName').focus(); return;
    }
    P.name=v; saveP(); renderHub(); show('scr-hub');
    toast('Welcome, '+v+' \u2014 '+TEACHER_META[P.teacher].name+"'s track.");
  };
  $('#inpName').addEventListener('keydown', function(e){ if(e.key==='Enter') $('#btnName').click(); });
  $('#btnRename').onclick=function(){ $('#inpName').value=P.name; refreshTeacherCards(); show('scr-name');
    setTimeout(function(){ try{ $('#inpName').focus(); }catch(e){} },60); };
  $('#btnIntroBack').onclick=function(){ show('scr-hub'); };
  $('#btnCalcTry').onclick=toggleCalc;
  $('#btnCalc').onclick=toggleCalc;
  $('#quizCalcLaunch').onclick=function(){ CZopen=true; dockCalc(); AudioFX.tick(); };
  $('#introCalcLaunch').onclick=function(){ CZopen=true; dockCalc(); AudioFX.tick(); };
  $('#btnStartLesson').onclick=function(){ startLesson(introLesson); };
  $('#btnHint').onclick=function(){
    if(QZ.answered || QZ.hintShown>=2) return;
    var q=QZ.qs[QZ.i]; if(!q) return;
    var hb=$('#hintBox'); hb.hidden=false;
    hb.innerHTML+='<span class="hstep">Hint '+(QZ.hintShown+1)+'</span><span class="htxt">'+q.hint[QZ.hintShown]+'</span>';
    QZ.hintShown++;
    $('#hintCount').textContent=String(2-QZ.hintShown);
    if(QZ.hintShown>=2) $('#btnHint').disabled=true;
    AudioFX.tick();
  };
  $('#btnStop').onclick=openStop;
  $('#stopKeep').onclick=function(){ $('#stopModal').classList.remove('on'); AudioFX.tick(); };
  $('#stopFinish').onclick=function(){ $('#stopModal').classList.remove('on'); finishLesson(true); };
  $('#stopExit').onclick=function(){
    $('#stopModal').classList.remove('on');
    Timer.stop();
    toast('Lesson exited \u2014 this run was not saved.');
    renderHub(); show('scr-hub');
  };
  /* ghost duel */
  $('#gmBack').onclick=function(){ show('scr-hub'); };
  $('#gmStart').onclick=function(){
    var ins=$$('.gm-inp');
    GM={players:[
      (ins[0] && ins[0].value.trim())||'Player 1',
      (ins[1] && ins[1].value.trim())||'Player 2'
    ], count:gmSelQ, results:[]};
    AudioFX.tick();
    startDuel();
  };
  $('#btnDuelAbort').onclick=function(){
    clearTimeout(DUEL.afterT); clearInterval(DUEL.qInt);
    DUEL.active=false; Timer.stop();
    toast('Duel aborted \u2014 no champion this time.');
    renderHub(); show('scr-hub');
  };
  $('#btnGhostPrint').onclick=function(){
    var po=$('#printOnly');
    po.innerHTML='<div class="cert">'+$('#ghostCert').innerHTML+'</div>';
    window.print();
    setTimeout(function(){ po.innerHTML=''; },800);
  };
  $('#btnGhostRematch').onclick=function(){ GM.results=[]; AudioFX.tick(); startDuel(); };
  $('#btnGhostExit').onclick=function(){ renderHub(); show('scr-hub'); };

  $('#btnPrint').onclick=function(){
    var po=$('#printOnly');
    po.innerHTML='<div class="cert">'+$('#certCard').innerHTML+'</div>';
    window.print();
    setTimeout(function(){ po.innerHTML=''; },800);
  };
  $('#btnRetry').onclick=function(){ startLesson(lastLesson); };
  $('#btnHub').onclick=function(){ renderHub(); show('scr-hub'); };

  window.addEventListener('keydown', function(e){
    var ae=document.activeElement;
    if(ae && (ae.tagName==='INPUT' || ae.id==='casio' || (czEl && czEl.contains(ae)))) return;
    if($('#stopModal').classList.contains('on')) return;
    /* الجوست: الطالب فوق 1-4 والطالب تحت 7-8-9-0 (بنفس ترتيب ما كل واحد شايفه) */
    if($('#scr-ghost-duel').classList.contains('on')){
      var pi=-1, ki=-1;
      if(e.key>='1' && e.key<='4'){ pi=0; ki=+e.key-1; }
      else if(e.key==='7'){ pi=1; ki=0; }
      else if(e.key==='8'){ pi=1; ki=1; }
      else if(e.key==='9'){ pi=1; ki=2; }
      else if(e.key==='0'){ pi=1; ki=3; }
      if(pi>=0){ e.preventDefault(); duelAnswer(pi,ki); }
      return;
    }
    if(!$('#scr-quiz').classList.contains('on')) return;
    if(!QZ.answered && /^[1-4]$/.test(e.key)){
      var b=$$('#qOpts .opt')[+e.key-1];
      if(b && !b.disabled) b.click();
    }else if(e.key==='Enter' && QZ.answered && $('#btnNext')){ $('#btnNext').click(); }
  });

  setMuteIcon();
  show('scr-splash');
  if(P.name) $('#inpName').value=P.name;
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

window.AID_LOADED = true;