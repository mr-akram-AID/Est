'use strict';
/* ================================================================
   AID v7.0 — EQUIVALENT EXPRESSIONS · Design by Mr. Akram
   One topic, six levels per coach, one solving method:
   type the expression -> CALC -> a fresh value for x (never 0,
   1, or any number from the question) -> = -> keep the answer
   -> test every choice at the SAME value -> the match wins.
   Two letters: ALPHA + ) types x · ALPHA + S<->D types y.
   Free trial: first level of each coach. Full access: code.
   Carried over: mistake review, session rescue, per-question
   timing, statistics center, EST & SAT exam simulation.
================================================================ */
var $  = function(s){ return document.querySelector(s); };
var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
function rnd(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function shuffle(a){ var r=a.slice(); for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i]; r[i]=r[j]; r[j]=t; } return r; }
if(!String.prototype.padStart){ String.prototype.padStart=function(n){ var s=String(this); while(s.length<n) s='0'+s; return s; }; }
function fmtTime(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0'); }
function ssGet(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }
function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }

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

/* ---------------- Math core — with x AND y ---------------- */
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
function mathHTML(s){ return String(s).replace(/x/g,'<i class="vx">x</i>').replace(/y/g,'<i class="vx">y</i>'); }
var calcErr='Syntax ERROR';
function calcEval(src, x, ans, y){
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
    if(take('ln')){ ws(); if(!take('(')) fail('Syntax ERROR'); var n=expression(); ws(); if(!take(')') fail('Syntax ERROR'); if(n<=0) fail('Math ERROR'); return Math.log(n); }
    if(take('Ans')) return (ans==null? 0 : ans);
    if(s[i]==='X'||s[i]==='x'){ if(x==null) fail('Syntax ERROR'); i++; return x; }
    if(s[i]==='Y'||s[i]==='y'){ if(y==null) fail('Syntax ERROR'); i++; return y; }
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
    var ch=s[i];
    if(ch==='\u00b2'||ch==='\u00b3'||ch==='\u2074'){
      i++;
      var e=(ch==='\u00b2')? 2 : (ch==='\u00b3'? 3 : 4);
      return Math.pow(v, e);
    }
    return v;
  }
  function term(){
    var v=power();
    for(;;){
      ws();
      if(take('\u00d7')||take('*')){ v*=power(); }
      else if(take('\u00f7')||take('/')){ var d=power(); if(d===0) fail('Math ERROR'); v/=d; }
      else if(s[i]==='(' || s[i]==='\u221a' || s.indexOf('log',i)===i || s.indexOf('ln',i)===i || s.indexOf('Ans',i)===i || s[i]==='X' || s[i]==='x' || s[i]==='Y' || s[i]==='y'){ v*=power(); }
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

/* ---------------- Polynomial helpers ---------------- */
var SUPS={'2':'\u00b2','3':'\u00b3','4':'\u2074'};
function fmtNum(v){ return String(v).replace(/-/g,'\u2212'); }
function polyVal(coeffs,x){
  var v=0;
  for(var i=0;i<coeffs.length;i++) v=v*x+coeffs[i];
  return v;
}
function polyText(coeffs){
  var deg=coeffs.length-1, parts=[], i;
  for(i=0;i<coeffs.length;i++){
    var p=deg-i, c=coeffs[i];
    if(c===0) continue;
    var abs=Math.abs(c), term;
    if(p===0) term=String(abs);
    else{
      var pw=(p===1)? 'x' : ('x'+SUPS[String(p)]);
      term=(abs===1)? pw : (abs+pw);
    }
    parts.push({neg:c<0, t:term});
  }
  var s='';
  for(var j=0;j<parts.length;j++){
    if(j===0) s+=(parts[j].neg? '\u2212':'')+parts[j].t;
    else s+=(parts[j].neg? ' \u2212 ':' + ')+parts[j].t;
  }
  return s||'0';
}
/* ================================================================
   EQUIVALENT EXPRESSIONS ENGINE
   Every question carries: the given expression, 4 choices, the
   forbidden numbers (0, 1 + every number printed in the question
   and choices), and a demo evaluation used by the feedback tables.
   Safety: every distractor is verified to differ from the correct
   answer at EVERY allowed test value — two expressions can never
   agree where the student is allowed to test.
================================================================ */
var HINT_EQ1='Type the given expression on the calculator, press CALC, and choose a fresh value for x \u2014 never 0, never 1, and never a number you can see in the question. Enter it, press =, and keep that answer in your head.';
var HINT_EQ2='Now type each choice, press CALC, and enter the SAME x-value you used before, then press =. The choice that gives the same answer as the original is the equivalent expression.';
var HINT_EQY1='Two letters? Type x with ALPHA then ), and y with ALPHA then S\u21c4D. Give them two different fresh values \u2014 never 0, never 1, and none of the question numbers.';
var HINT_EQY2='Press CALC, enter your x-value, then your y-value, press =, and keep the answer. Test every choice with the SAME pair \u2014 the match is the equivalent expression.';
var HINT_EQF1='Fractions are typed with the \u00f7 key: 2x/3 is 2, x, \u00f7, 3. Choose a fresh x \u2014 the calculator handles the rest exactly.';
var HINT_EQF2='Every choice gets the same x-value \u2014 compare the screen numbers. Same number = equivalent.';

var PROMPT_EQ='Which of the following is equivalent to the given expression?';
var PHRASE_EQ=[
 'Which of the following is equivalent to the given expression?',
 'Which expression is equivalent to the one below?',
 'Which of the following expressions is equivalent to the given one?'
];

/* ---- expression builders: {t: display text, f: numeric value} ---- */
function E(t, f){ return {t:t, f:f}; }
function coefX(c){ return (c===1)? 'x' : (c===-1? '\u2212x' : c+'x'); }
function linE(a,b){ return E(lin(a,b), function(x,y){ return a*x+b; }); }
function quadE(A,B,C){ return E(polyText([A,B,C]), function(x,y){ return A*x*x+B*x+C; }); }
function factE(a,b,c,d){
  return E('('+lin(a,b)+')('+lin(c,d)+')', function(x,y){ return (a*x+b)*(c*x+d); });
}
function sqE(a,b){
  return E('('+lin(a,b)+')\u00b2', function(x,y){ return (a*x+b)*(a*x+b); });
}
function cfE(k,m,n){
  return E(k+'x('+lin(m,n)+')', function(x,y){ return k*x*(m*x+n); });
}
function gcd2(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ var t2=a%b; a=b; b=t2; } return a||1; }
function fracXE(num, den){
  var g=gcd2(num,den);
  num=num/g; den=den/g;
  if(den===1) return coefX(num);
  return coefX(num)+'/'+den;
}
function fracSumE(p,q,r,s){
  return E(coefX(p)+'/'+q+' + '+coefX(r)+'/'+s, function(x,y){ return p*x/q + r*x/s; });
}
var SUPD={'0':'\u2070','1':'\u00b9','2':'\u00b2','3':'\u00b3','4':'\u2074','5':'\u2075','6':'\u2076','7':'\u2077','8':'\u2078','9':'\u2079'};
function supN(n){ var s=String(n), out='', i; for(i=0;i<s.length;i++) out+=SUPD[s.charAt(i)]||s.charAt(i); return out; }
function powTerm(a,n){ return coefX(a)+supN(n); }
function powE(a,m,b,n){
  return E('('+powTerm(a,m)+')('+powTerm(b,n)+')', function(x,y){ return a*Math.pow(x,m)*b*Math.pow(x,n); });
}
function powRE(ab, n){
  return E(powTerm(ab,n), function(x,y){ return ab*Math.pow(x,n); });
}
function xyLin(a,b,c){
  var parts=[];
  function push(coef, sym){
    if(coef===0) return;
    var abs=Math.abs(coef);
    parts.push({neg:coef<0, t:(abs===1? sym : abs+sym)});
  }
  push(a,'x'); push(b,'y');
  if(c!==0) parts.push({neg:c<0, t:String(Math.abs(c))});
  if(!parts.length) return '0';
  var s='';
  for(var j=0;j<parts.length;j++){
    if(j===0) s+=(parts[j].neg? '\u2212':'')+parts[j].t;
    else s+=(parts[j].neg? ' \u2212 ':' + ')+parts[j].t;
  }
  return s;
}
function linXYE(a,b,c){ return E(xyLin(a,b,c), function(x,y){ return a*x+b*y+c; }); }

/* ---- safety machinery ---- */
function collectNums(str){
  var m=String(str).match(/\d+/g), out=[], i, v;
  if(!m) return out;
  for(i=0;i<m.length;i++){
    v=parseInt(m[i],10);
    if(v>=2 && v<=15 && out.indexOf(v)<0) out.push(v);
  }
  return out;
}
function freshVal(nums, extra){
  var c=[], v;
  for(v=2;v<=15;v++){
    if(nums && nums.indexOf(v)>=0) continue;
    if(extra && extra.indexOf(v)>=0) continue;
    c.push(v);
  }
  return c.length? pick(c) : 17;
}
function clashFree(a, b, nums, twoVar){
  var x, y;
  function allowed(v){ return v>=2 && v<=20 && nums.indexOf(v)<0; }
  for(x=2;x<=20;x++){
    if(!allowed(x)) continue;
    if(!twoVar){
      if(Math.abs(a.f(x,0)-b.f(x,0))<1e-9) return false;
    }else{
      for(y=2;y<=20;y++){
        if(!allowed(y) || y===x) continue;
        if(Math.abs(a.f(x,y)-b.f(x,y))<1e-9) return false;
      }
    }
  }
  return true;
}
function makeEquivQ(orig, correct, wrongs, opts){
  opts=opts||{};
  var twoVar=!!opts.twoVar, i;
  /* all four texts must be distinct */
  var texts=[orig.t, correct.t];
  for(i=0;i<wrongs.length;i++){
    if(texts.indexOf(wrongs[i].t)>=0) return null;
    texts.push(wrongs[i].t);
  }
  /* forbidden numbers: everything printed in the question and the choices */
  var nums=collectNums(orig.t+' '+correct.t+' '+wrongs[0].t+' '+wrongs[1].t+' '+wrongs[2].t);
  /* every distractor must differ from the correct answer at every allowed value */
  for(i=0;i<wrongs.length;i++){
    if(!clashFree(correct, wrongs[i], nums, twoVar)) return null;
  }
  /* demo values for the feedback tables */
  var dx=freshVal(nums);
  var dy=twoVar? freshVal(nums, [dx]) : 0;
  var ov=Math.round(orig.f(dx,dy)*1000)/1000;
  var items=shuffle([{e:correct, ok:true}].concat(wrongs.map(function(w){ return {e:w, ok:false}; })));
  var q={
    kind:'equiv',
    text:orig.t,
    twoVar:twoVar,
    exnums:nums.slice(0,9),
    demo:{x:dx, y:twoVar? dy : null, orig:ov, vals:[]},
    choices:[],
    correctIdx:-1,
    prompt:opts.prompt || pick(PHRASE_EQ),
    tag:opts.tag || 'Equivalent',
    hint:opts.hint || [HINT_EQ1, HINT_EQ2]
  };
  for(i=0;i<items.length;i++){
    q.choices.push({ex:items[i].e.t});
    q.demo.vals.push(Math.round(items[i].e.f(dx,dy)*1000)/1000);
    if(items[i].ok) q.correctIdx=i;
  }
  if(q.correctIdx<0) return null;
  return q;
}

/* ================================================================
   MR. AKRAM GENERATORS — Equivalent Expressions
   L1 like terms · L2 distribution · L3 FOIL · L4 special products
   L5 fractions & powers · L6 two variables · E exam · ★ master
================================================================ */

/* ---- Level 1 · First Steps: combining like terms ---- */
function genEE1(){
  for(var t=0;t<80;t++){
    var a=rnd(2,6), c=rnd(2,6);
    if(a===c) continue;
    if(a*c===a+c) continue;
    var s1=pick([1,-1]), s2=pick([1,-1]);
    var b=rnd(2,9), d=rnd(2,9);
    var K=s1*b+s2*d;
    if(K===0) continue;
    var qText=coefX(a)+' '+(s1>0?'+ ':'\u2212 ')+b+' + '+coefX(c)+' '+(s2>0?'+ ':'\u2212 ')+d;
    var orig=E(qText, function(x,y){ return a*x+s1*b+c*x+s2*d; });
    var correct=linE(a+c, K);
    var w1=linE(a+c, -K);
    var w2=linE(a*c, K);
    var w3=linE(a+c, s1*b);
    var q=makeEquivQ(orig, correct, [w1,w2,w3], {
      tag:'Like Terms \u00b7 L1',
      hint:[HINT_EQ1, HINT_EQ2]
    });
    if(q) return q;
  }
  return null;
}

/* ---- Level 2 · Distribution ---- */
function genEE2(){
  for(var t=0;t<80;t++){
    var a=rnd(2,5), b=rnd(2,7), c=rnd(2,6), d=rnd(2,8);
    var s=pick([1,-1]), u=pick([1,-1]), tc=pick([1,-1]);
    var A=a+tc*c;
    if(A<=1) continue;
    var K=a*s*b+u*d;
    var qText=a+'(x '+(s>0?'+ ':'\u2212 ')+b+') '+(tc>0?'+ ':'\u2212 ')+c+'x '+(u>0?'+ ':'\u2212 ')+d;
    var orig=E(qText, function(x,y){ return a*(x+s*b)+tc*c*x+u*d; });
    var correct=linE(A, K);
    var w1=linE(a+tc*c, s*b+u*d);
    var w2=linE(a+tc*c, -a*s*b+u*d);
    var w3=linE(a-tc*c, K);
    var q=makeEquivQ(orig, correct, [w1,w2,w3], {
      tag:'Distribution \u00b7 L2',
      hint:[HINT_EQ1, HINT_EQ2]
    });
    if(q) return q;
  }
  return null;
}

/* ---- Level 3 · FOIL ---- */
function genEE3(){
  for(var t=0;t<80;t++){
    var a=rnd(2,4), c=rnd(1,3);
    var b=rnd(2,7)*pick([1,-1]), d=rnd(2,7)*pick([1,-1]);
    var ac=a*c, mid=a*d+b*c, cst=b*d;
    if(mid===0) continue;
    var orig=factE(a,b,c,d);
    var correct=quadE(ac, mid, cst);
    var w1=quadE(ac, mid, -cst);
    var w2=quadE(ac, a*d-b*c, cst);
    var w3=quadE(ac, 0, cst);
    var q=makeEquivQ(orig, correct, [w1,w2,w3], {
      tag:'FOIL \u00b7 L3',
      hint:[HINT_EQ1, HINT_EQ2]
    });
    if(q) return q;
  }
  return null;
}

/* ---- Level 4 · Special products & common factors ---- */
function genEE4(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.4){
      var a=rnd(2,4), b=rnd(2,6), sg=pick([1,-1]);
      var orig=sqE(a, sg*b);
      var correct=quadE(a*a, 2*a*sg*b, b*b);
      var w1=quadE(a*a, 0, b*b);
      var w2=quadE(a*a, -2*a*sg*b, b*b);
      var w3=quadE(a*a, 2*a*sg*b, 2*b*b);
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {tag:'Special Products \u00b7 L4'});
      if(q) return q;
    }else if(roll<.7){
      var m=rnd(2,4), n=rnd(2,5), k=rnd(2,6);
      var orig2=quadE(m*n, m*k, 0);
      var correct2=cfE(m, n, k);
      var w1b=cfE(m, n, -k);
      var w2b=cfE(m, n, k+1);
      var w3b=cfE(m+1, n, k);
      var q2=makeEquivQ(orig2, correct2, [w1b,w2b,w3b], {tag:'Common Factor \u00b7 L4'});
      if(q2) return q2;
    }else{
      var a2=rnd(2,4), b2=rnd(2,6);
      var orig3=quadE(a2*a2, 0, -b2*b2);
      var correct3=factE(a2, b2, a2, -b2);
      var w1c=factE(a2, b2, a2, b2);
      var w2c=quadE(a2*a2, 0, b2*b2);
      var w3c=factE(a2, b2, 1, -b2);
      var q3=makeEquivQ(orig3, correct3, [w1c,w2c,w3c], {tag:'Difference of Squares \u00b7 L4'});
      if(q3) return q3;
    }
  }
  return null;
}

/* ---- Level 5 · Fractions & powers ---- */
function genEE5(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.55){
      var q1=pick([3,4,5,6]), s1=pick([3,4,5,6]);
      if(q1===s1) continue;
      var p=rnd(1,5), r=rnd(1,5);
      var num=p*s1+r*q1, den=q1*s1;
      var orig=fracSumE(p,q1,r,s1);
      var correct=E(fracXE(num,den), function(x,y){ return num*x/den; });
      var w1=E(fracXE(p+r, q1+s1), function(x,y){ return (p+r)*x/(q1+s1); });
      var w2=E(fracXE(p, den), function(x,y){ return p*x/den; });
      var w3=E(fracXE(p+r, den), function(x,y){ return (p+r)*x/den; });
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {
        tag:'Fractions \u00b7 L5',
        hint:[HINT_EQF1, HINT_EQF2]
      });
      if(q) return q;
    }else{
      var a=rnd(2,5), b=rnd(2,5);
      var m=rnd(2,4), n=rnd(2,4);
      var orig2=powE(a,m,b,n);
      var correct2=powRE(a*b, m+n);
      var w1b=powRE(a*b, m*n);
      var w2b=powRE(a*b, m);
      var w3b=powRE(a+b, m+n);
      var q2=makeEquivQ(orig2, correct2, [w1b,w2b,w3b], {
        tag:'Powers \u00b7 L5',
        hint:[HINT_EQ1, HINT_EQ2]
      });
      if(q2) return q2;
    }
  }
  return null;
}

/* ---- Level 6 · Two variables + expert mix ---- */
function genEE6(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.5){
      var k1=rnd(2,4), k2=rnd(2,4);
      var a1=pick([1,2,3]), b1=rnd(1,5);
      var a2=pick([1,2,3]), b2=rnd(1,5);
      var sv1=pick([1,-1]), sv2=pick([1,-1]);
      var minus=(Math.random()<.5);
      var sgn=minus? -1 : 1;
      var A=k1*a1+sgn*k2*a2;
      var B=k1*sv1*b1+sgn*k2*sv2*b2;
      if(A===0 || B===0) continue;
      var qText=k1+'('+xyLin(a1, sv1*b1, 0)+')'+(minus? ' \u2212 ' : ' + ')+k2+'('+xyLin(a2, sv2*b2, 0)+')';
      var orig=E(qText, function(x,y){ return k1*(a1*x+sv1*b1*y)+sgn*k2*(a2*x+sv2*b2*y); });
      var correct=linXYE(A, B, 0);
      var w1=linXYE(A, k1*sv1*b1-sgn*k2*sv2*b2, 0);
      var w2=linXYE(k1*a1-sgn*k2*a2, B, 0);
      var w3=linXYE(A, k1*sv1*b1, 0);
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {
        twoVar:true,
        tag:'Two Variables \u00b7 L6',
        hint:[HINT_EQY1, HINT_EQY2]
      });
      if(q) return q;
    }else if(roll<.75){
      return genEE3();
    }else{
      return genEE5();
    }
  }
  return null;
}

/* ---- E · EST & SAT Exam Simulation: easy to hard ---- */
function genExamEI(prog){
  if(prog<0.18)      return genEE1();
  else if(prog<0.38) return genEE2();
  else if(prog<0.58) return genEE3();
  else if(prog<0.78) return genEE4();
  else if(prog<0.92) return genEE5();
  else               return genEE6();
}

/* ---- ★ Master Challenge: everything mixed, hard-biased ---- */
function genMasterEI(){
  return pick([genEE2,genEE3,genEE3,genEE4,genEE4,genEE5,genEE5,genEE6,genEE6])();
}
/* ================================================================
   MR. MOHAMED GENERATORS — EST & SAT Track (Equivalent Expressions)
   L1 the SAT form · L2 the trap forms · L3 factored<->expanded
   L4 fractions · L5 two variables · L6 expert mix · ★ master
================================================================ */
function genME1(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.5){
      var a=rnd(2,9), c=rnd(2,9);
      if(a===c || a*c===a+c) continue;
      var s1=pick([1,-1]), s2=pick([1,-1]);
      var b=rnd(2,12), d=rnd(2,12);
      var K=s1*b+s2*d;
      if(K===0) continue;
      var qText=coefX(a)+' '+(s1>0?'+ ':'\u2212 ')+b+' + '+coefX(c)+' '+(s2>0?'+ ':'\u2212 ')+d;
      var orig=E(qText, function(x,y){ return a*x+s1*b+c*x+s2*d; });
      var correct=linE(a+c, K);
      var w1=linE(a+c, -K);
      var w2=linE(a*c, K);
      var w3=linE(a+c, s1*b);
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {tag:'SAT \u00b7 Equivalent', hint:[HINT_EQ1,HINT_EQ2]});
      if(q) return q;
    }else{
      var a2=rnd(2,9), b2=rnd(2,9)*pick([1,-1]), c2=rnd(2,12)*pick([1,-1]);
      var qText2=a2+'(x '+(b2>0?'+ ':'\u2212 ')+Math.abs(b2)+') '+(c2>0?'+ ':'\u2212 ')+Math.abs(c2);
      var orig2=E(qText2, function(x,y){ return a2*(x+b2)+c2; });
      var correct2=linE(a2, a2*b2+c2);
      var w1b=linE(a2, b2+c2);
      var w2b=linE(a2, a2*b2-c2);
      var w3b=linE(a2+1, a2*b2+c2);
      var q2=makeEquivQ(orig2, correct2, [w1b,w2b,w3b], {tag:'SAT \u00b7 Equivalent', hint:[HINT_EQ1,HINT_EQ2]});
      if(q2) return q2;
    }
  }
  return null;
}
function genME2(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.6){
      var a=rnd(2,7), b=rnd(2,8), c=rnd(2,6), d=rnd(2,8);
      var sb=pick([1,-1]), sd=pick([1,-1]);
      var A=a-c;
      if(Math.abs(A)<1) continue;
      var K=a*sb*b - c*sd*d;
      var qText=a+'(x '+(sb>0?'+ ':'\u2212 ')+b+') \u2212 '+c+'(x '+(sd>0?'+ ':'\u2212 ')+d+')';
      var orig=E(qText, function(x,y){ return a*(x+sb*b) - c*(x+sd*d); });
      var correct=linE(A, K);
      var w1=linE(a+c, K);
      var w2=linE(a-c, a*sb*b + c*sd*d);
      var w3=linE(a-c, sb*b - sd*d);
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {tag:'EST \u00b7 The Trap', hint:[HINT_EQ1,HINT_EQ2]});
      if(q) return q;
    }else{
      var a2=rnd(3,8), b2=rnd(2,7), c2=rnd(2,5), d2=rnd(2,7);
      var s1=pick([1,-1]), s2=pick([1,-1]);
      var A2=a2+c2, K2=a2*s1*b2 + c2*s2*d2;
      if(A2<2) continue;
      var qText2=a2+'(x '+(s1>0?'+ ':'\u2212 ')+b2+') + '+c2+'(x '+(s2>0?'+ ':'\u2212 ')+d2+')';
      var orig2=E(qText2, function(x,y){ return a2*(x+s1*b2)+c2*(x+s2*d2); });
      var correct2=linE(A2, K2);
      var w1b=linE(A2, s1*b2 + s2*d2);
      var w2b=linE(A2, a2*s1*b2 - c2*s2*d2);
      var w3b=linE(a2-c2, K2);
      var q2=makeEquivQ(orig2, correct2, [w1b,w2b,w3b], {tag:'EST \u00b7 The Trap', hint:[HINT_EQ1,HINT_EQ2]});
      if(q2) return q2;
    }
  }
  return null;
}
function genME3(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.45){
      var p=rnd(2,7), q2=rnd(2,7);
      if(p===q2) continue;
      var sp=pick([1,-1]), sq=pick([1,-1]);
      var B=sp*p+sq*q2, C=sp*p*sq*q2;
      var orig=quadE(1, B, C);
      var correct=factE(1, sp*p, 1, sq*q2);
      var w1=factE(1, -sp*p, 1, -sq*q2);
      var w2=factE(1, sp*p, 1, -sq*q2);
      var w3=factE(1, sp, 1, sq*p*q2);
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {tag:'SAT \u00b7 Factored Form', hint:[HINT_EQ1,HINT_EQ2]});
      if(q) return q;
    }else if(roll<.8){
      var a=rnd(2,5), c=rnd(1,4);
      var b=rnd(2,9)*pick([1,-1]), d=rnd(2,9)*pick([1,-1]);
      var mid=a*d+b*c;
      if(mid===0) continue;
      var orig2=factE(a,b,c,d);
      var correct2=quadE(a*c, mid, b*d);
      var w1c=quadE(a*c, mid, -b*d);
      var w2c=quadE(a*c, -mid, b*d);
      var w3c=quadE(a*c, 0, b*d);
      var q2=makeEquivQ(orig2, correct2, [w1c,w2c,w3c], {tag:'SAT \u00b7 Expanded Form', hint:[HINT_EQ1,HINT_EQ2]});
      if(q2) return q2;
    }else{
      var a3=rnd(2,5), b3=rnd(2,7);
      var orig3=quadE(a3*a3, 0, -b3*b3);
      var correct3=factE(a3, b3, a3, -b3);
      var w1d=factE(a3, b3, a3, b3);
      var w2d=quadE(a3*a3, 2*a3*b3, -b3*b3);
      var w3d=factE(a3, b3, 1, -b3);
      var q3=makeEquivQ(orig3, correct3, [w1d,w2d,w3d], {tag:'SAT \u00b7 Difference of Squares', hint:[HINT_EQ1,HINT_EQ2]});
      if(q3) return q3;
    }
  }
  return null;
}
function genME4(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.6){
      var q1=pick([2,3,4,5,6]), s1=pick([3,4,5,6,8]);
      if(q1===s1) continue;
      var p=rnd(1,6), r=rnd(1,6);
      var num=p*s1+r*q1, den=q1*s1;
      var orig=fracSumE(p,q1,r,s1);
      var correct=E(fracXE(num,den), function(x,y){ return num*x/den; });
      var w1=E(fracXE(p+r, q1+s1), function(x,y){ return (p+r)*x/(q1+s1); });
      var w2=E(fracXE(p, den), function(x,y){ return p*x/den; });
      var w3=E(fracXE(p+r, den), function(x,y){ return (p+r)*x/den; });
      var q=makeEquivQ(orig, correct, [w1,w2,w3], {tag:'SAT \u00b7 Fractions', hint:[HINT_EQF1,HINT_EQF2]});
      if(q) return q;
    }else{
      var q2=pick([3,4,5,6]), r2=rnd(2,7), p2=rnd(2,7);
      var orig2=E(p2+'/'+q2+' + '+coefX(r2)+'/'+q2, function(x,y){ return p2/q2 + r2*x/q2; });
      var correct2=E('('+coefX(r2)+' + '+p2+')/'+q2, function(x,y){ return (r2*x+p2)/q2; });
      var w1b=E('('+coefX(r2)+' \u2212 '+p2+')/'+q2, function(x,y){ return (r2*x-p2)/q2; });
      var w2b=E('('+coefX(p2)+' + '+r2+')/'+q2, function(x,y){ return (p2*x+r2)/q2; });
      var w3b=E('('+coefX(r2)+' + '+p2+')/'+(2*q2), function(x,y){ return (r2*x+p2)/(2*q2); });
      var q2o=makeEquivQ(orig2, correct2, [w1b,w2b,w3b], {tag:'SAT \u00b7 Fractions', hint:[HINT_EQF1,HINT_EQF2]});
      if(q2o) return q2o;
    }
  }
  return null;
}
function genME5(){
  for(var t=0;t<80;t++){
    var k1=rnd(2,6), k2=rnd(2,6);
    var a1=pick([1,2,3,4]), b1=rnd(1,7);
    var a2=pick([1,2,3,4]), b2=rnd(1,7);
    var sv1=pick([1,-1]), sv2=pick([1,-1]);
    var minus=(Math.random()<.5);
    var sgn=minus? -1:1;
    var A=k1*a1+sgn*k2*a2, B=k1*sv1*b1+sgn*k2*sv2*b2;
    if(A===0 || B===0) continue;
    var qText=k1+'('+xyLin(a1, sv1*b1, 0)+')'+(minus? ' \u2212 ':' + ')+k2+'('+xyLin(a2, sv2*b2, 0)+')';
    var orig=E(qText, function(x,y){ return k1*(a1*x+sv1*b1*y)+sgn*k2*(a2*x+sv2*b2*y); });
    var correct=linXYE(A, B, 0);
    var w1=linXYE(A, k1*sv1*b1-sgn*k2*sv2*b2, 0);
    var w2=linXYE(k1*a1-sgn*k2*a2, B, 0);
    var w3=linXYE(A, k1*sv1*b1, 0);
    var q=makeEquivQ(orig, correct, [w1,w2,w3], {twoVar:true, tag:'SAT \u00b7 Two Variables', hint:[HINT_EQY1,HINT_EQY2]});
    if(q) return q;
  }
  return null;
}
function genME6(){
  for(var t=0;t<80;t++){
    var roll=Math.random();
    if(roll<.25) return genME2();
    if(roll<.45) return genME4();
    if(roll<.6)  return genME5();
    if(roll<.8)  return genME3();
    var a=rnd(2,6), b=rnd(2,6);
    var m=rnd(2,5), n=rnd(2,5);
    var orig=powE(a,m,b,n);
    var correct=powRE(a*b, m+n);
    var w1=powRE(a*b, m*n);
    var w2=powRE(a*b, m);
    var w3=powRE(a+b, m+n);
    var q=makeEquivQ(orig, correct, [w1,w2,w3], {tag:'EST \u00b7 Expert Mix', hint:[HINT_EQ1,HINT_EQ2]});
    if(q) return q;
  }
  return null;
}
function genMasterMI(){
  return pick([genME2,genME3,genME3,genME4,genME4,genME5,genME5,genME6,genME6,genEE4])();
}

/* ================================================================
   LESSON BANKS — both coaches, one topic: Equivalent Expressions
================================================================ */
var BANKS={
  akram:[
   { id:'ee1', num:'01', title:'Equivalent Expressions \u2014 Level 1 \u00b7 First Steps',
     desc:'Combining like terms \u2014 type it, CALC it, and test every choice at the same fresh value of x.',
     gen:genEE1, prompt:PROMPT_EQ,
     steps:[
      'Write the expression on the calculator \u2014 press <b>ALPHA</b> then <span class="mth">)</span> for <span class="mth"><i class="vx">x</i></span>.',
      'Press <b>CALC</b> \u2014 the calculator asks for the value of x.',
      'Choose any fresh value \u2014 except <b>0</b>, <b>1</b>, and any number written in the question (the coach line under the calculator lists them for you).',
      'Press <b>=</b> \u2014 keep the answer in your head.',
      'Type each choice, press <b>CALC</b>, enter the <b>same value</b> of x, press <b>=</b> \u2014 the choice that returns your first answer is the equivalent expression.'
     ],
     skills:['Type an expression with ALPHA + )','Pick a fresh test value \u2014 never 0, 1, or question numbers','Same value for the original and every choice'],
     worked:{ kind:'equiv', q:'2x \u2212 5 + 3x + 4', exnums:[2,5,3,4],
       demo:{x:7, orig:34},
       choices:[
         {ex:'5x + 1', v:36, w:'constant sign slip'},
         {ex:'6x \u2212 1', v:41, w:'coefficients multiplied instead of added'},
         {ex:'5x \u2212 1', v:34, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'5x \u2212 5', v:30, w:'only the first constant was combined'}
       ], ans:'5x \u2212 1' } },
   { id:'ee2', num:'02', title:'Equivalent Expressions \u2014 Level 2 \u00b7 Distribution',
     desc:'Brackets like 3(x \u2212 4) + 2x \u2014 no distribution by hand: type it exactly as printed and let the test decide.',
     gen:genEE2, prompt:PROMPT_EQ,
     steps:[
      'Type the expression <b>exactly as printed</b> \u2014 brackets and all. The calculator distributes it for you at the test value.',
      'Press <b>CALC</b>, choose a fresh value for x \u2014 never 0, 1, or a question number \u2014 and press <b>=</b>.',
      'Keep the answer in your head.',
      'Type each choice, <b>CALC</b>, the <b>same value</b>, <b>=</b> \u2014 the matching choice is the equivalent expression. Distribution slips die instantly at the test value.'
     ],
     skills:['Brackets are typed exactly as printed','The calculator distributes for you at the test value','Spot the forgot-to-distribute trap'],
     worked:{ kind:'equiv', q:'3(x \u2212 4) + 2x', exnums:[3,4,2,5,12],
       demo:{x:7, orig:23},
       choices:[
         {ex:'5x \u2212 4', v:31, w:'distributed the x but not the 4'},
         {ex:'5x \u2212 12', v:23, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'x \u2212 12', v:-5, w:'subtracted 2x instead of adding it'},
         {ex:'5x + 12', v:47, w:'flipped the inner sign: 3(x + 4)'}
       ], ans:'5x \u2212 12' } },
   { id:'ee3', num:'03', title:'Equivalent Expressions \u2014 Level 3 \u00b7 FOIL',
     desc:'Products of brackets like (2x + 3)(x \u2212 5) \u2014 expand or not, the CALC test decides in seconds.',
     gen:genEE3, prompt:PROMPT_EQ,
     steps:[
      'Type the product exactly as printed \u2014 for example <span class="mth">(</span>, 2, x, +, 3, <span class="mth">)</span>, <span class="mth">(</span>, x, \u2212, 5, <span class="mth">)</span>.',
      'Press <b>CALC</b>, enter a fresh value for x, press <b>=</b> \u2014 keep the answer.',
      'For the quadratic choices, use the <span class="mth">x\u00b2</span> key (and <span class="mth">x^</span> for higher powers).',
      'Test every choice at the <b>same value</b> \u2014 the choice that matches is the expanded form. No FOIL by hand needed.'
     ],
     skills:['Type products of brackets as printed','Use x\u00b2 and x^ for the powered choices','FOIL slips never survive the CALC test'],
     worked:{ kind:'equiv', q:'(2x + 3)(x \u2212 5)', exnums:[2,3,5,7,13,15],
       demo:{x:9, orig:84},
       choices:[
         {ex:'2x\u00b2 \u2212 13x \u2212 15', v:30, w:'outer and inner subtracted instead of added'},
         {ex:'2x\u00b2 \u2212 7x \u2212 15', v:84, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'2x\u00b2 \u2212 15', v:147, w:'first and last only \u2014 the middle went missing'},
         {ex:'2x\u00b2 + 7x \u2212 15', v:210, w:'middle sign flipped'}
       ], ans:'2x\u00b2 \u2212 7x \u2212 15' } },
   { id:'ee4', num:'04', title:'Equivalent Expressions \u2014 Level 4 \u00b7 Special Products',
     desc:'Perfect squares, difference of squares, and common factors \u2014 in both directions, one method.',
     gen:genEE4, prompt:PROMPT_EQ,
     steps:[
      'Type the given form exactly as printed \u2014 squared brackets with the <span class="mth">x\u00b2</span> key, factored forms with two brackets.',
      'Press <b>CALC</b>, enter a fresh value for x, press <b>=</b> \u2014 keep the answer.',
      'Test every choice at the <b>same value</b> \u2014 expanded or factored, every choice is just a string to test.',
      'The choice that reproduces your answer is the equivalent expression \u2014 direction never matters.'
     ],
     skills:['Perfect squares and difference of squares','Factored and expanded forms are just choices','One method for every direction'],
     worked:{ kind:'equiv', q:'(x + 3)\u00b2', exnums:[3,6,9,12],
       demo:{x:5, orig:64},
       choices:[
         {ex:'x\u00b2 + 9', v:34, w:'the middle term went missing \u2014 the classic slip'},
         {ex:'x\u00b2 + 6x + 9', v:64, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'x\u00b2 \u2212 6x + 9', v:4, w:'middle sign flipped'},
         {ex:'x\u00b2 + 12x + 9', v:94, w:'doubled the middle term'}
       ], ans:'x\u00b2 + 6x + 9' } },
   { id:'ee5', num:'05', title:'Equivalent Expressions \u2014 Level 5 \u00b7 Fractions & Powers',
     desc:'Fractions typed with the \u00f7 key and powers with the x^ key \u2014 the method never changes.',
     gen:genEE5, prompt:PROMPT_EQ,
     steps:[
      'Fractions are typed with the <b>\u00f7</b> key: <span class="mth">2x/3</span> is 2, x, <b>\u00f7</b>, 3. Powers use the <b>x^</b> key.',
      'Type the expression, press <b>CALC</b>, choose a fresh value for x, press <b>=</b> \u2014 keep the answer.',
      'Test every choice at the <b>same value</b> \u2014 the calculator handles fractions and powers exactly.',
      'The choice that reproduces your answer is the equivalent expression.'
     ],
     skills:['Fractions typed with the \u00f7 key','Powers typed with the x^ key','The test value exposes every slip'],
     worked:{ kind:'equiv', q:'2x/3 + x/4', exnums:[2,3,4,11,12,7,5],
       demo:{x:9, orig:8.25},
       choices:[
         {ex:'3x/7', v:3.857, w:'added the tops and the bottoms'},
         {ex:'11x/12', v:8.25, ok:true, w:'one common denominator \u2014 the LCD'},
         {ex:'2x/3', v:6, w:'kept only the first fraction'},
         {ex:'5x/12', v:3.75, w:'added the original numerators over the LCD'}
       ], ans:'11x/12' } },
   { id:'ee6', num:'06', title:'Equivalent Expressions \u2014 Level 6 \u00b7 Two Variables',
     desc:'x and y together \u2014 ALPHA + ) and ALPHA + S\u21c4D, two different fresh values, the same pair everywhere.',
     gen:genEE6, prompt:PROMPT_EQ,
     steps:[
      'Type the expression \u2014 <b>ALPHA</b> then <span class="mth">)</span> for x, and <b>ALPHA</b> then <span class="mth">S\u21c4D</span> for y.',
      'Press <b>CALC</b> \u2014 the calculator asks for x first, then y. Give them <b>two different fresh values</b> \u2014 never 0, 1, or question numbers.',
      'Press <b>=</b> \u2014 keep the answer in your head.',
      'Test every choice with the <b>same pair</b> of values \u2014 the choice that matches is the equivalent expression.'
     ],
     skills:['ALPHA + ) for x \u00b7 ALPHA + S\u21c4D for y','Two different fresh values','Reuse the same pair for every choice'],
     worked:{ kind:'equiv', q:'3(x + 2y) \u2212 2(x \u2212 y)', twoVar:true, exnums:[3,2,8,4,7,5],
       demo:{x:6, y:9, orig:78},
       choices:[
         {ex:'x + 8y', v:78, ok:true, w:'distributed both brackets correctly'},
         {ex:'x + 4y', v:42, w:'the minus never reached the y inside'},
         {ex:'x + 7y', v:69, w:'distributed the x but left one y inside'},
         {ex:'5x + 4y', v:66, w:'added 3x + 2x instead of subtracting'}
       ], ans:'x + 8y' } },
   { id:'eex', num:'E', title:'EST & SAT Exam Simulation',
     desc:'30 questions in real exam order \u2014 easy to hard, every format, no hints, no breaks. Exactly like the paper.',
     gen:genExamEI, exam:true, prompt:PROMPT_EQ,
     steps:[
      'Read the question once fully before touching the keys \u2014 spot the form: like terms, brackets, fractions, powers, or two letters.',
      'Type the expression, press <b>CALC</b>, choose a fresh value (never 0, 1, or a question number), press <b>=</b>.',
      'Test every choice at the <b>same value</b> \u2014 the match is your answer.',
      'No hints, no game breaks \u2014 exactly like the real paper. Trust the method.'
     ],
     skills:['Read the whole question first','Solve without hints \u2014 like the paper','Manage your time across 30 questions'],
     worked:{ kind:'equiv', q:'x\u00b2 \u2212 7x + 12', exnums:[7,12,3,4],
       demo:{x:5, orig:2},
       choices:[
         {ex:'(x + 3)(x \u2212 4)', v:8, w:'one sign flipped'},
         {ex:'(x \u2212 3)(x \u2212 4)', v:2, ok:true, w:'sum \u22127, product +12 \u2014 the right pair'},
         {ex:'(x \u2212 3)(x + 4)', v:18, w:'one sign flipped'},
         {ex:'(x \u2212 1)(x \u2212 12)', v:-28, w:'multiplies to +12 but sums to \u221213'}
       ], ans:'(x \u2212 3)(x \u2212 4)' } },
   { id:'master', num:'\u2605', title:'Master Challenge \u2014 Equivalent Expressions',
     desc:'Every level mixed together. 30 questions.',
     gen:genMasterEI, master:true, prompt:PROMPT_EQ,
     steps:[
      'Read the form first \u2014 then type it, <b>CALC</b>, fresh value, <b>=</b>.',
      'Test every choice at the <b>same value</b> \u2014 the match wins.',
      'Two letters? Two different fresh values, same pair everywhere.',
      'Every form from all six levels can appear \u2014 one method answers them all.'
     ],
     skills:['All six levels mixed together','One method answers every form','Trust the CALC test'],
     worked:{ kind:'equiv', q:'(2x\u00b2)(3x\u00b3)', exnums:[2,3,6,5],
       demo:{x:4, orig:6144},
       choices:[
         {ex:'6x\u2076', v:24576, w:'exponents multiplied instead of added'},
         {ex:'6x\u2075', v:6144, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'6x\u00b2', v:96, w:'kept only one exponent'},
         {ex:'5x\u2075', v:5120, w:'coefficients added instead of multiplied'}
       ], ans:'6x\u2075' } }
  ],
  mohamed:[
   { id:'me1', num:'01', title:'Equivalent Expressions \u2014 Level 1 \u00b7 The SAT Form',
     desc:'\u201cWhich expression is equivalent to\u2026?\u201d \u2014 the direct SAT form with real exam distractors.',
     gen:genME1, prompt:PROMPT_EQ,
     steps:[
      'Type the expression \u2014 <b>ALPHA</b> then <span class="mth">)</span> for x \u2014 exactly as printed, brackets and all.',
      'Press <b>CALC</b>, choose a fresh value for x \u2014 never 0, 1, or a question number \u2014 press <b>=</b>.',
      'Keep the answer, then test every choice at the <b>same value</b>.',
      'The choice that reproduces your answer is the equivalent expression \u2014 the look-alikes fall away.'
     ],
     skills:['The direct SAT multiple-choice form','Fresh values expose the look-alikes','Same value everywhere = a fair test'],
     worked:{ kind:'equiv', q:'4(x + 5) \u2212 7', exnums:[4,5,7,13,2,27],
       demo:{x:6, orig:37},
       choices:[
         {ex:'4x \u2212 2', v:22, w:'distributed the x but not the 5'},
         {ex:'4x + 13', v:37, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'4x + 27', v:51, w:'the minus never reached the 7'},
         {ex:'x \u2212 2', v:4, w:'treated 4(x + 5) as x + 5'}
       ], ans:'4x + 13' } },
   { id:'me2', num:'02', title:'Equivalent Expressions \u2014 Level 2 \u00b7 The Trap Forms',
     desc:'The minus that never reaches the bracket \u2014 the EST traps that punish careless distribution.',
     gen:genME2, prompt:PROMPT_EQ,
     steps:[
      'Type the expression exactly as printed \u2014 the minus sign included.',
      'Press <b>CALC</b>, enter a fresh value for x, press <b>=</b> \u2014 keep the answer.',
      'Test every choice at the <b>same value</b>.',
      'The traps (a minus that never reached the inside, x-terms added instead of subtracted) fall apart at the test value \u2014 the calculator never gets trapped.'
     ],
     skills:['The minus must reach everything inside','Traps die at the test value','Type it exactly as printed'],
     worked:{ kind:'equiv', q:'5(x \u2212 3) \u2212 2(x + 4)', exnums:[5,3,2,4,23,7],
       demo:{x:6, orig:-5},
       choices:[
         {ex:'3x \u2212 23', v:-5, ok:true, w:'distributed both minuses correctly'},
         {ex:'3x \u2212 7', v:11, w:'the minus reached x but not the 4 inside'},
         {ex:'7x \u2212 7', v:35, w:'added the x-terms instead of subtracting'},
         {ex:'3x + 23', v:41, w:'final constant sign flipped'}
       ], ans:'3x \u2212 23' } },
   { id:'me3', num:'03', title:'Equivalent Expressions \u2014 Level 3 \u00b7 Factored \u2194 Expanded',
     desc:'Both directions: open the brackets or pick the factored form \u2014 the CALC test never changes.',
     gen:genME3, prompt:PROMPT_EQ,
     steps:[
      'Factored or expanded \u2014 type the given form exactly as printed.',
      'Press <b>CALC</b>, enter a fresh value for x, press <b>=</b> \u2014 keep the answer.',
      'Test every choice at the <b>same value</b> \u2014 brackets and squares are just strings to the calculator.',
      'The choice that reproduces your answer is the equivalent form \u2014 direction never matters.'
     ],
     skills:['Factored or expanded \u2014 both are just strings','Pick the pair that reproduces the value','Sign slips never survive CALC'],
     worked:{ kind:'equiv', q:'(3x \u2212 2)(x + 6)', exnums:[3,2,6,16,12,20],
       demo:{x:5, orig:143},
       choices:[
         {ex:'3x\u00b2 + 16x \u2212 12', v:143, ok:true, w:'same value at every x \u2014 equivalent'},
         {ex:'3x\u00b2 \u2212 16x \u2212 12', v:-17, w:'middle sign flipped'},
         {ex:'3x\u00b2 \u2212 12', v:63, w:'first and last only'},
         {ex:'3x\u00b2 + 20x \u2212 12', v:163, w:'the inner sign was dropped'}
       ], ans:'3x\u00b2 + 16x \u2212 12' } },
   { id:'me4', num:'04', title:'Equivalent Expressions \u2014 Level 4 \u00b7 Fractions',
     desc:'One common denominator or a single fraction \u2014 tested with the \u00f7 key, exactly like the paper.',
     gen:genME4, prompt:PROMPT_EQ,
     steps:[
      'Fractions are typed with the <b>\u00f7</b> key: <span class="mth">x/4</span> is x, <b>\u00f7</b>, 4.',
      'Press <b>CALC</b>, enter a fresh value for x, press <b>=</b> \u2014 keep the answer.',
      'Test every choice at the <b>same value</b> \u2014 single fractions included: type the top, <b>\u00f7</b>, the bottom.',
      'The choice that reproduces your answer is the equivalent expression.'
     ],
     skills:['One fraction or two \u2014 same test','The \u00f7 key enters fractions exactly','Common-denominator slips exposed'],
     worked:{ kind:'equiv', q:'2/5 + 3x/5', exnums:[2,5,3,10],
       demo:{x:4, orig:2.8},
       choices:[
         {ex:'(3x + 2)/5', v:2.8, ok:true, w:'one single fraction \u2014 the LCD'},
         {ex:'(3x \u2212 2)/5', v:2, w:'constant sign slip'},
         {ex:'(2x + 3)/5', v:2.2, w:'the terms were swapped'},
         {ex:'(3x + 2)/10', v:1.4, w:'denominators added instead of kept'}
       ], ans:'(3x + 2)/5' } },
   { id:'me5', num:'05', title:'Equivalent Expressions \u00b7 Level 5 \u00b7 Two Variables',
     desc:'x and y in the same expression \u2014 two fresh values, different from each other, reused everywhere.',
     gen:genME5, prompt:PROMPT_EQ,
     steps:[
      'Type the expression \u2014 <b>ALPHA</b> then <span class="mth">)</span> for x, and <b>ALPHA</b> then <span class="mth">S\u21c4D</span> for y.',
      'Press <b>CALC</b> \u2014 enter your fresh x, then your fresh y \u2014 <b>different values</b>, never 0, 1, or question numbers.',
      'Press <b>=</b> \u2014 keep the answer.',
      'Test every choice with the <b>same pair</b> \u2014 the match is the equivalent expression.'
     ],
     skills:['x and y with two different values','ALPHA + ) and ALPHA + S\u21c4D','Same pair for every choice'],
     worked:{ kind:'equiv', q:'5(2x + y) + 3(x \u2212 4y)', twoVar:true, exnums:[5,2,3,4,13,7,17],
       demo:{x:6, y:8, orig:22},
       choices:[
         {ex:'13x \u2212 7y', v:22, ok:true, w:'distributed both brackets correctly'},
         {ex:'13x + 17y', v:214, w:'the minus never reached the 4y'},
         {ex:'7x \u2212 7y', v:-14, w:'subtracted the x-terms instead of adding'},
         {ex:'13x + y', v:86, w:'distributed the x but left one y inside'}
       ], ans:'13x \u2212 7y' } },
   { id:'me6', num:'06', title:'Equivalent Expressions \u2014 Level 6 \u00b7 Expert Mix',
     desc:'Every form mixed with exam-tough numbers \u2014 traps, fractions, two variables, and powers.',
     gen:genME6, prompt:PROMPT_EQ,
     steps:[
      'Read the form first \u2014 one letter, two letters, fractions, or powers \u2014 then type it.',
      'Press <b>CALC</b>, enter fresh value(s) \u2014 never 0, 1, or question numbers \u2014 press <b>=</b>.',
      'Test every choice at the <b>same value(s)</b> \u2014 the calculator handles every form exactly.',
      'The choice that reproduces your answer is the equivalent expression.'
     ],
     skills:['Every exam form in one level','Tough numbers and sign traps','The calculator method answers all'],
     worked:{ kind:'equiv', q:'2(x \u2212 7) \u2212 3(x \u2212 4)', exnums:[2,7,3,4,26,5,18],
       demo:{x:6, orig:-8},
       choices:[
         {ex:'\u2212x \u2212 2', v:-8, ok:true, w:'distributed both minuses correctly'},
         {ex:'\u2212x \u2212 26', v:-31, w:'the minus never reached the 4'},
         {ex:'5x \u2212 2', v:28, w:'added the x-terms instead of subtracting'},
         {ex:'\u2212x \u2212 18', v:-24, w:'distributed the x but not the 4'}
       ], ans:'\u2212x \u2212 2' } },
   { id:'mmaster', num:'\u2605', title:'Master Challenge \u2014 Mixed',
     desc:'Every exam form mixed together. 30 questions.',
     gen:genMasterMI, master:true, prompt:PROMPT_EQ,
     steps:[
      'Read the whole question before you type \u2014 then <b>CALC</b>, fresh value(s), <b>=</b>.',
      'Test every choice at the <b>same value(s)</b> \u2014 the match wins.',
      'Two letters? Two different fresh values, same pair everywhere.',
      'Every exam form from this track can appear \u2014 one method answers them all.'
     ],
     skills:['Every exam form from this track mixed together','Read before you type','The CALC test always decides'],
     worked:{ kind:'equiv', q:'x\u00b2 \u2212 5x \u2212 14', exnums:[5,14,7,2],
       demo:{x:3, orig:-20},
       choices:[
         {ex:'(x + 7)(x \u2212 2)', v:10, w:'both signs flipped'},
         {ex:'(x \u2212 7)(x + 2)', v:-20, ok:true, w:'sum \u22125, product \u221214 \u2014 the right pair'},
         {ex:'(x \u2212 7)(x \u2212 2)', v:-4, w:'one sign flipped'},
         {ex:'(x \u2212 14)(x + 1)', v:-44, w:'multiplies to \u221214 but sums to \u221213'}
       ], ans:'(x \u2212 7)(x + 2)' } }
  ]
};
function getLessons(){ return BANKS[P.teacher||'akram']; }
var METHOD_STEPS = [
 'Write the expression on the calculator \u2014 press <b>ALPHA</b> then <span class="mth">)</span> for <span class="mth"><i class="vx">x</i></span> (and <b>ALPHA</b> then <span class="mth">S\u21c4D</span> for <span class="mth"><i class="vx">y</i></span>).',
 'Press <b>CALC</b>.',
 'Choose any value for <span class="mth"><i class="vx">x</i></span> \u2014 except <b>0</b>, <b>1</b>, and any number written in the question.',
 'Press <b>=</b> \u2014 keep the answer in your mind.',
 'Try the choices the same way: type each choice, press <b>CALC</b>, enter the <b>same value</b> of <span class="mth"><i class="vx">x</i></span>, press <b>=</b> \u2014 the choice that returns your first answer is the equivalent expression.'
];
/* ================================================================
   ACCESS KEYS — the active key is assembled at runtime and never
   appears as plain text anywhere in this file. Retired placeholder
   entries below are rejected on purpose.
================================================================ */
var RETIRED_KEYS=['AY108','AY110','AY205'];
var _vt=[0x44,0x5C,0x34,0x34,0x34];
function _buildTag(){
  var s='', i;
  for(i=0;i<_vt.length;i++) s+=String.fromCharCode(_vt[i]-3);
  return s;
}
function isCodeValid(code){
  var i, c=String(code||'').toUpperCase().trim();
  if(!c) return false;
  for(i=0;i<RETIRED_KEYS.length;i++){ if(RETIRED_KEYS[i]===c) return false; }
  return c===_buildTag();
}
function hasFullAccess(){
  try{ return localStorage.getItem('aidAccessEQ')==='1'; }catch(e){ return false; }
}
function setFullAccess(){
  try{ localStorage.setItem('aidAccessEQ','1'); }catch(e){}
}
/* Code field injected under the name input (no HTML edit needed) */
function injectCodeField(){
  if(document.getElementById('aidCode')) return;
  var inp=$('#inpName'); if(!inp) return;
  var wrap=document.createElement('div');
  wrap.style.marginTop='1rem';
  wrap.innerHTML=
    '<div style="font-size:.72rem; letter-spacing:.22em; text-transform:uppercase; color:var(--muted); margin-bottom:.4rem; font-weight:600">Access code (optional)</div>'+
    '<input id="aidCode" class="gm-inp" maxlength="24" placeholder="Have a code? Enter it for the full version" autocomplete="off" style="text-transform:uppercase">'+
    '<div id="aidCodeMsg" style="margin-top:.5rem; font-size:.88rem; min-height:1.2em; font-weight:600"></div>';
  inp.parentElement.insertBefore(wrap, inp.nextSibling);
  var ce=document.getElementById('aidCode');
  ce.addEventListener('keydown', function(e){ if(e.key==='Enter') $('#btnName').click(); });
}
/* Unlock modal (reuses the stop-modal styling) */
function ensureUnlockModal(){
  var m=document.getElementById('unlockModal');
  if(m) return m;
  var back=document.createElement('div');
  back.id='unlockModal'; back.className='stop-back';
  var card=document.createElement('div');
  card.className='stop-card';
  card.innerHTML='<div class="eyebrow">Full Version</div>'+
    '<h2 style="margin-bottom:0">Enter your access code</h2>'+
    '<input class="gm-inp" id="unlockInp" maxlength="24" placeholder="Access code" autocomplete="off" style="text-transform:uppercase; margin-top:1rem">'+
    '<div id="unlockMsg" style="margin-top:.6rem; font-size:.9rem; min-height:1.2em; font-weight:600"></div>'+
    '<div class="row center"><button class="btn primary" id="unlockBtn" type="button">Unlock</button>'+
    '<button class="btn ghost" id="unlockClose" type="button">Cancel</button></div>';
  back.appendChild(card);
  document.body.appendChild(back);
  document.getElementById('unlockBtn').onclick=tryUnlock;
  document.getElementById('unlockClose').onclick=function(){ back.classList.remove('on'); };
  document.getElementById('unlockInp').addEventListener('keydown', function(e){ if(e.key==='Enter') tryUnlock(); });
  return back;
}
function openUnlockModal(){
  var m=ensureUnlockModal();
  var inp=document.getElementById('unlockInp');
  var msg=document.getElementById('unlockMsg');
  if(inp) inp.value='';
  if(msg){ msg.textContent=''; }
  m.classList.add('on');
  setTimeout(function(){ try{ inp.focus(); }catch(e){} },60);
}
function tryUnlock(){
  var inp=document.getElementById('unlockInp');
  var msg=document.getElementById('unlockMsg');
  var v=(inp && inp.value)? inp.value.trim().toUpperCase() : '';
  if(!isCodeValid(v)){
    if(msg){ msg.textContent='Wrong code \u2014 try again.'; msg.style.color='var(--bad)'; }
    AudioFX.bad();
    return;
  }
  setFullAccess();
  if(msg){ msg.textContent='Unlocked \u2014 full version activated!'; msg.style.color='var(--good)'; }
  AudioFX.good();
  setTimeout(function(){
    document.getElementById('unlockModal').classList.remove('on');
    renderHub();
    toast('Full version unlocked \u2014 every level is yours!');
  }, 600);
}/* ================================================================
   STORAGE — player, lifetime statistics, mistake bank, session
================================================================ */
var PKEY='aidAcademyV7';
var P = { name:'', teacher:'akram', completed:{}, stats:{totalQ:0, correct:0, totalTime:0, attempts:{}} };
try{
  var raw=localStorage.getItem(PKEY), o=null;
  if(raw){ o=JSON.parse(raw); }
  if(o && typeof o==='object'){
    P.name=o.name||'';
    P.teacher=o.teacher||'akram';
    P.completed=o.completed||{};
    P.stats=(o.stats && typeof o.stats==='object')? o.stats : null;
  }
  if(!P.stats) P.stats={totalQ:0, correct:0, totalTime:0, attempts:{}};
  if(!P.stats.attempts) P.stats.attempts={};
  if(!P.name || !P.stats.totalQ){
    var raw6=localStorage.getItem('aidAcademyV6');
    if(raw6){
      var o6=JSON.parse(raw6);
      if(o6 && typeof o6==='object'){
        if(!P.name) P.name=o6.name||'';
        if(!P.stats.totalQ && o6.stats && typeof o6.stats==='object'){
          P.stats.totalQ=o6.stats.totalQ||0;
          P.stats.correct=o6.stats.correct||0;
          P.stats.totalTime=o6.stats.totalTime||0;
          P.stats.attempts=o6.stats.attempts||{};
        }
      }
    }
  }
}catch(e){}
function saveP(){ try{ localStorage.setItem(PKEY, JSON.stringify(P)); }catch(e){} }

/* Lifetime statistics — called after every finished run */
function recordStats(lid, score, total, time){
  if(!P.stats) P.stats={totalQ:0, correct:0, totalTime:0, attempts:{}};
  P.stats.totalQ+=total;
  P.stats.correct+=score;
  P.stats.totalTime+=time;
  if(lid){
    if(!P.stats.attempts[lid]) P.stats.attempts[lid]={tries:0, best:0};
    P.stats.attempts[lid].tries++;
    if(score>P.stats.attempts[lid].best) P.stats.attempts[lid].best=score;
  }
  saveP();
}

/* ---- Mistake review bank (persists across sessions) ---- */
var WRONG_KEY='aidWrongV7';
function loadWrongBank(){
  try{
    var raw=lsGet(WRONG_KEY);
    if(!raw) return [];
    var arr=JSON.parse(raw);
    return (arr && arr.length!==undefined)? arr : [];
  }catch(e){ return []; }
}
function saveWrongBank(bank){
  try{ lsSet(WRONG_KEY, JSON.stringify(bank.slice(0,80))); }catch(e){}
}
function addToWrongBank(q, lid){
  try{
    if(!q || !q.text) return;
    var bank=loadWrongBank(), i;
    for(i=0;i<bank.length;i++){ if(bank[i].q && bank[i].q.text===q.text) return; }
    bank.push({ q:q, lid:lid||'', t:Date.now() });
    if(bank.length>80) bank=bank.slice(bank.length-80);
    saveWrongBank(bank);
  }catch(e){}
}
function removeFromWrongBank(q){
  try{
    if(!q || !q.text) return;
    var bank=loadWrongBank(), out=[], i;
    for(i=0;i<bank.length;i++){ if(bank[i].q && bank[i].q.text===q.text) continue; out.push(bank[i]); }
    saveWrongBank(out);
  }catch(e){}
}

/* ---- Session rescue (refresh / accidental exit) ---- */
var SESS_KEY='aidSessionV7';
function saveSession(){
  try{
    if(CURSCREEN!=='scr-quiz' || !QZ.lesson){ lsDel(SESS_KEY); return; }
    var data={
      t:'lesson',
      teacher:P.teacher,
      lid: (QZ.review || !QZ.lesson.id)? '' : QZ.lesson.id,
      review: !!QZ.review,
      reviewFixed: QZ.reviewFixed||0,
      qs: QZ.qs,
      i: QZ.answered? (QZ.i+1) : QZ.i,
      score: QZ.score,
      mistakes: QZ.mistakes,
      times: QZ.times,
      breakIdx: QZ.breakIdx,
      elapsed: Timer.elapsed(),
      saved: Date.now()
    };
    if(data.i>data.qs.length) data.i=data.qs.length;
    lsSet(SESS_KEY, JSON.stringify(data));
  }catch(e){}
}
function loadSession(){
  try{
    var raw=lsGet(SESS_KEY);
    if(!raw) return null;
    var d=JSON.parse(raw);
    if(!d || !d.t || !d.qs || !d.qs.length) return null;
    if(Date.now()-(d.saved||0) > 86400000){ lsDel(SESS_KEY); return null; }
    if(d.teacher!==P.teacher){ lsDel(SESS_KEY); return null; }
    if(d.i>d.qs.length){ lsDel(SESS_KEY); return null; }
    return d;
  }catch(e){ return null; }
}
function clearSession(){ lsDel(SESS_KEY); }

/* ---------------- Score webhook ---------------- */
var SCORE_WEBHOOK='https://script.google.com/macros/s/AKfycbzCxaazPm07ytgMgYht-oDnMjzlYALSyiMQgY1mURBR6ccCLGGwIXgXRPGHKgs-iK0N/exec';
function sendScoreToSheet(d){
  try{
    if(!SCORE_WEBHOOK) return;
    fetch(SCORE_WEBHOOK,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({
        name:d.name||'Unknown',
        teacher:d.teacher||'',
        lesson:d.lesson||'',
        score:d.score||0,
        total:d.total||0,
        time:d.time||'',
        rank:d.rank||''
      })
    });
  }catch(e){}
}

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
   CASIO CALCULATOR — x AND y, SHIFT+SOLVE, decimal entry
   S⇄D sits right next to the x bracket: ALPHA + ) = x, ALPHA + S⇄D = y
================================================================ */
var CZ = { expr:'', cur:0, base:'input', shift:false, alpha:false, xval:'',
           yval:'', xnum:null, needY:false,
           lastX:null, lastRes:null, mem:null, msg:null, errMsg:'', solved:false,
           forbidden:{0:1,1:1} };
var czEl=null;

var CZK = [
  {id:'SHIFT', t:'SHIFT', c:'k-shift'},
  {id:'ALPHA', t:'ALPHA', c:'k-alpha'},
  {id:'REPLAY'},
  {id:'MODE', t:'MODE', c:'k-fn'},
  {id:'ON', t:'ON', c:'k-fn'},
  {id:'CALC', t:'CALC', c:'k-fn k-calc', yellow:'SOLVE'},
  {id:'SQRT', t:'\u221a', c:'k-fn', mth:1},
  {id:'X2', t:'x\u00b2', c:'k-fn', mth:1},
  {id:'POW', t:'x\u02b8', c:'k-fn', mth:1},
  {id:'LOG', t:'log', c:'k-fn', mth:1},
  {id:'LN', t:'ln', c:'k-fn', mth:1},
  {id:'LP', t:'(', c:'k-fn', mth:1},
  {id:'RP', t:')', c:'k-fn', red:'x', mth:1},
  {id:'SD', t:'S\u21c4D', c:'k-fn', red:'y'},
  {id:'ANS', t:'Ans', c:'k-fn', mth:1},
  {id:'7', c:'num'},{id:'8', c:'num'},{id:'9', c:'num'},
  {id:'DEL', t:'DEL', c:'k-fn'},
  {id:'AC', t:'AC', c:'k-fn k-ac'},
  {id:'4', c:'num'},{id:'5', c:'num'},{id:'6', c:'num'},
  {id:'MUL', t:'\u00d7', c:'k-op', mth:1},{id:'DIV', t:'\u00f7', c:'k-op', mth:1},
  {id:'1', c:'num'},{id:'2', c:'num'},{id:'3', c:'num'},
  {id:'ADD', t:'+', c:'k-op'},{id:'SUB', t:'\u2212', c:'k-op', mth:1},
  {id:'0', c:'num'},{id:'.', t:'.', c:'num'},
  {id:'EXP', t:'\u00d710\u02e3', c:'k-fn k-exp', mth:1},
  {id:'RCL', t:'RCL', c:'k-fn', yellow:'STO'},
  {id:'=', t:'=', c:'k-eq'}
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
  if(isFinite(v) && Math.floor(v)===v) return String(v).replace('-','\u2212');
  return String(parseFloat((Math.round(v*1e9)/1e9).toPrecision(10))).replace('-','\u2212');
}
function czInsert(txt){
  if(CZ.base==='result'){ CZ.expr=''; CZ.cur=0; CZ.base='input'; CZ.msg=null; }
  if(CZ.base!=='input') return;
  CZ.expr = CZ.expr.slice(0,CZ.cur)+txt+CZ.expr.slice(CZ.cur);
  CZ.cur += txt.length; CZ.msg=null;
  CZ.solved=false;
}
function czInsertOp(op){
  if(CZ.base==='result'){ CZ.expr='Ans'; CZ.cur=3; CZ.base='input'; CZ.solved=false; }
  if(CZ.base!=='input') return;
  if(CZ.cur===0){ if(op==='\u2212') czInsert(op); return; }
  var prev=CZ.expr.charAt(CZ.cur-1);
  var prev2=CZ.cur>1? CZ.expr.charAt(CZ.cur-2) : '';
  if(prev==='+'||prev==='\u2212'){
    if(op==='\u2212' && (prev2==='\u00d7'||prev2==='\u00f7')){ czInsert(op); }
    else{ CZ.expr=CZ.expr.slice(0,CZ.cur-1)+op+CZ.expr.slice(CZ.cur); }
  } else czInsert(op);
}
function czRunSolve(){
  var s=CZ.expr;
  if(!s){ CZ.base='error'; CZ.errMsg='Type the expression first'; AudioFX.bad(); czRender(); return; }
  var eq=s.indexOf('=');
  var lhs, rhs;
  if(eq>=0){ lhs=s.slice(0,eq); rhs=s.slice(eq+1); }
  else{ lhs=s; rhs='0'; }
  function f(x){
    var a=calcEval(lhs,x,0), b=calcEval(rhs,x,0);
    if(a===null||b===null) return null;
    return a-b;
  }
  var f0=f(0), f1=f(1);
  if(f0===null||f1===null){ CZ.base='error'; CZ.errMsg='Syntax ERROR'; AudioFX.bad(); czRender(); return; }
  var f2=f(2), fm=f(-1);
  var linear=(f2!==null && fm!==null && Math.abs(f2-(2*f1-f0))<1e-9 && Math.abs(fm-(2*f0-f1))<1e-9);
  var root=null;
  if(linear){
    var a=f1-f0, b=f0;
    if(Math.abs(a)<1e-12){ CZ.base='error'; CZ.errMsg='No solution'; AudioFX.bad(); czRender(); return; }
    root=-b/a;
  }else{
    var seeds=[0,1,-1,5,-5,10,-10,100,-100], si, it;
    for(si=0; si<seeds.length && root===null; si++){
      var x=seeds[si], ok=false;
      for(it=0; it<120; it++){
        var fx=f(x); if(fx===null) break;
        var h=1e-5*(Math.abs(x)>1? Math.abs(x):1);
        var df=(f(x+h)-f(x-h))/(2*h);
        if(!isFinite(df)||Math.abs(df)<1e-12) break;
        var nx=x-fx/df;
        if(!isFinite(nx)) break;
        if(Math.abs(nx-x)<1e-10){ x=nx; ok=true; break; }
        x=nx;
      }
      if(ok && f(x)!==null && Math.abs(f(x))<1e-6) root=x;
    }
    if(root===null){ CZ.base='error'; CZ.errMsg='Can\u2019t solve'; AudioFX.bad(); czRender(); return; }
  }
  var r2=Math.round(root);
  if(Math.abs(root-r2)<1e-9) root=r2;
  CZ.base='result'; CZ.solved=true;
  CZ.lastX=root; CZ.lastRes=root;
  AudioFX.ding();
  czRender();
}
function czEquals(){
  CZ.solved=false;
  if(CZ.base==='solveAsk'){ czRunSolve(); return; }
  if(CZ.base==='askX'){
    var v=parseFloat(CZ.xval);
    if(isNaN(v)){ CZ.base='error'; CZ.errMsg='X? Enter a value'; czRender(); AudioFX.bad(); return; }
    if(CZ.forbidden[v]!==undefined){
      CZ.msg='Pick another X';
      toast('Never use 0, 1, or a number from the question as the value of X \u2014 pick a fresh number.');
      AudioFX.bad(); czRender(); return;
    }
    if(CZ.needY){
      CZ.xnum=v;
      CZ.base='askY';
      CZ.yval='';
      czRender();
      return;
    }
    var r=calcEval(CZ.expr, v, CZ.lastRes);
    if(r===null){ CZ.base='error'; CZ.errMsg=calcErr; AudioFX.bad(); }
    else{ CZ.base='result'; CZ.lastX=v; CZ.lastRes=r; AudioFX.ding(); }
    czRender();
  }else if(CZ.base==='askY'){
    var y=parseFloat(CZ.yval);
    if(isNaN(y)){ CZ.base='error'; CZ.errMsg='Y? Enter a value'; czRender(); AudioFX.bad(); return; }
    if(CZ.forbidden[y]!==undefined || (CZ.xnum!==null && y===CZ.xnum)){
      CZ.msg='Pick another Y';
      if(CZ.xnum!==null && y===CZ.xnum){
        toast('Give y a different value than x \u2014 two letters need two different numbers.');
      }else{
        toast('Never use 0, 1, or a number from the question as the value of Y \u2014 pick a fresh number.');
      }
      AudioFX.bad(); czRender(); return;
    }
    var r2=calcEval(CZ.expr, CZ.xnum, CZ.lastRes, y);
    if(r2===null){ CZ.base='error'; CZ.errMsg=calcErr; AudioFX.bad(); }
    else{ CZ.base='result'; CZ.lastX=CZ.xnum; CZ.lastRes=r2; AudioFX.ding(); }
    CZ.xnum=null; CZ.needY=false;
    czRender();
  }else if(CZ.base==='input'){
    if(CZ.expr.indexOf('X')>=0 || CZ.expr.indexOf('x')>=0 || CZ.expr.indexOf('Y')>=0 || CZ.expr.indexOf('y')>=0){ CZ.msg='Press CALC to set the values'; czRender(); return; }
    if(!CZ.expr) return;
    var r3=calcEval(CZ.expr, null, CZ.lastRes);
    if(r3===null){ CZ.base='error'; CZ.errMsg=calcErr; AudioFX.bad(); }
    else{ CZ.base='result'; CZ.lastRes=r3; AudioFX.ding(); }
    czRender();
  }
}
function czReset(full){
  CZ.expr=''; CZ.cur=0; CZ.base='input'; CZ.xval=''; CZ.yval=''; CZ.xnum=null; CZ.needY=false;
  CZ.msg=null; CZ.errMsg='';
  CZ.shift=false; CZ.alpha=false; CZ.solved=false;
  if(full){ CZ.lastRes=null; CZ.lastX=null; CZ.mem=null; }
  czRender();
}
function czPress(id){
  if(CZ.base==='error'){
    if(id==='AC'||id==='ON'){ czReset(id==='ON'); return; }
    if(id==='DEL'||id==='left'||id==='right'){ CZ.base='input'; CZ.errMsg=''; }
    else{ CZ.expr=''; CZ.cur=0; CZ.xval=''; CZ.yval=''; CZ.xnum=null; CZ.needY=false; CZ.base='input'; CZ.errMsg=''; }
  }
  var isDigit = /^[0-9]$/.test(id) || id==='.';
  switch(id){
    case 'SHIFT': if(CZ.base!=='askX' && CZ.base!=='askY' && CZ.base!=='solveAsk'){ CZ.shift=!CZ.shift; CZ.alpha=false; } break;
    case 'ALPHA': if(CZ.base!=='askX' && CZ.base!=='askY' && CZ.base!=='solveAsk'){ CZ.alpha=!CZ.alpha; CZ.shift=false; } break;
    case 'ON': czReset(true); return;
    case 'AC':
      if(CZ.base==='solveAsk' || CZ.base==='askX' || CZ.base==='askY'){ CZ.base='input'; CZ.xval=''; CZ.yval=''; CZ.xnum=null; CZ.needY=false; CZ.msg=null; CZ.solved=false; break; }
      CZ.expr=''; CZ.cur=0; CZ.xval=''; CZ.yval=''; CZ.xnum=null; CZ.needY=false; CZ.msg=null; CZ.base='input'; CZ.solved=false; break;
    case 'DEL':
      if(CZ.base==='askX'){ CZ.xval=CZ.xval.slice(0,-1); }
      else if(CZ.base==='askY'){ CZ.yval=CZ.yval.slice(0,-1); }
      else if(CZ.base==='solveAsk'){ CZ.base='input'; }
      else{
        if(CZ.base==='result'){ CZ.base='input'; CZ.cur=CZ.expr.length; CZ.solved=false; }
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
      if(CZ.shift){
        CZ.shift=false;
        if(!CZ.expr){ CZ.msg='Type the expression first'; break; }
        CZ.base='solveAsk';
        break;
      }
      if(!CZ.expr){ CZ.msg='Type the expression first'; break; }
      var hasX=(CZ.expr.indexOf('X')>=0 || CZ.expr.indexOf('x')>=0);
      var hasY=(CZ.expr.indexOf('Y')>=0 || CZ.expr.indexOf('y')>=0);
      if(hasX){
        CZ.base='askX'; CZ.xval=''; CZ.yval=''; CZ.xnum=null; CZ.needY=hasY;
        CZ.shift=false; CZ.alpha=false;
      }else if(hasY){
        CZ.base='askY'; CZ.yval=''; CZ.xnum=null; CZ.needY=false;
        CZ.shift=false; CZ.alpha=false;
      }else czEquals();
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
    case 'SUB':
      if(CZ.base==='askX'){
        if(CZ.xval.charAt(0)==='-') CZ.xval=CZ.xval.slice(1);
        else if(CZ.xval!=='') CZ.xval='-'+CZ.xval;
        else CZ.xval='-';
        break;
      }
      if(CZ.base==='askY'){
        if(CZ.yval.charAt(0)==='-') CZ.yval=CZ.yval.slice(1);
        else if(CZ.yval!=='') CZ.yval='-'+CZ.yval;
        else CZ.yval='-';
        break;
      }
      czInsertOp('\u2212'); break;
    case 'LP': czInsert('('); break;
    case 'RP':
      if(CZ.alpha){ CZ.alpha=false; czInsert('X'); }
      else czInsert(')');
      break;
    case 'SD':
      if(CZ.alpha){ CZ.alpha=false; czInsert('Y'); }
      else{ CZ.msg='S\u21c4D'; }
      break;
    case '=': czEquals(); break;
    default:
      if(isDigit){
        if(CZ.base==='askX'){ if(!(id==='.' && CZ.xval.indexOf('.')>=0)) CZ.xval+=id; }
        else if(CZ.base==='askY'){ if(!(id==='.' && CZ.yval.indexOf('.')>=0)) CZ.yval+=id; }
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
  $('#indX').classList.toggle('on', CZ.base==='askX' || CZ.base==='askY' || CZ.base==='solveAsk');
  var l1=$('#czLine1'), l2=$('#czLine2');
  function pr(p){ return p.replace(/x/g,'<i>x</i>').replace(/y/g,'<i>y</i>'); }
  var pretty=CZ.expr.replace(/X/g,'x').replace(/Y/g,'y');
  if(CZ.base==='askX'){
    l1.innerHTML=pr(pretty);
    l2.className='cz-line2';
    l2.innerHTML='X? '+CZ.xval.replace('-','\u2212')+'<span class="cz-cursor"></span>';
  }else if(CZ.base==='askY'){
    l1.innerHTML=pr(pretty);
    l2.className='cz-line2';
    l2.innerHTML='Y? '+CZ.yval.replace('-','\u2212')+'<span class="cz-cursor"></span>';
  }else if(CZ.base==='solveAsk'){
    l1.innerHTML=pr(pretty);
    l2.className='cz-line2';
    l2.textContent='SOLVE for X?';
  }else if(CZ.base==='result'){
    l1.innerHTML=pr(pretty);
    l2.className='cz-line2';
    l2.textContent=CZ.solved? ('X = '+czFmt(CZ.lastRes)) : czFmt(CZ.lastRes);
  }else if(CZ.base==='error'){
    l1.innerHTML=pr(pretty);
    l2.className='cz-line2';
    l2.textContent=CZ.errMsg;
  }else{
    var a=pretty.slice(0,CZ.cur), b=pretty.slice(CZ.cur);
    l1.innerHTML=pr(a)+'<span class="cz-cursor"></span>'+pr(b);
    if(CZ.msg){ l2.className='cz-line2 small'; l2.textContent=CZ.msg; }
    else{ l2.className='cz-line2'; l2.textContent='\u00a0'; }
  }
}
/* Coach line under the calculator — adapts to the question + forbidden numbers */
function czSetQuestion(q){
  CZ.forbidden={0:1,1:1};
  var el=$('#czAvoid');
  if(!el) return;
  if(q && q.kind==='equiv'){
    var i;
    if(q.exnums){
      for(i=0;i<q.exnums.length;i++){ CZ.forbidden[q.exnums[i]]=1; }
    }
    var avoid='0, 1'+((q.exnums && q.exnums.length)? ', '+q.exnums.slice(0,8).join(', ') : '');
    el.style.display='';
    if(q.twoVar){
      el.innerHTML='Type it \u00b7 <b>CALC</b> \u00b7 fresh <b>x and y \u2014 different values, avoid '+avoid+'</b> \u00b7 <b>=</b> keep the answer \u00b7 test every choice with the <b>same pair</b>';
    }else{
      el.innerHTML='Type it \u00b7 <b>CALC</b> \u00b7 pick a <b>fresh x \u2014 avoid '+avoid+'</b> \u00b7 <b>=</b> keep the answer \u00b7 test every choice at the <b>same x</b>';
    }
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
    if(e.key==='y'||e.key==='Y'){
      e.preventDefault();
      if(CZ.base==='result'){ CZ.expr=''; CZ.cur=0; CZ.base='input'; }
      if(CZ.base==='input'){ CZ.expr=CZ.expr.slice(0,CZ.cur)+'Y'+CZ.expr.slice(CZ.cur); CZ.cur++; }
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
/* ---------------- Hub (with free-trial locking, stats & review) ---------------- */
var LOCKBTN='<button class="btn ghost" disabled><svg class="lockic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></button>';
function renderHub(){
  setEmblem();
  var L=getLessons();
  var full=hasFullAccess();
  $('#hubHello').innerHTML='<span class="emb-xs">'+(EMBLEMS[P.teacher]||'')+'</span>Welcome, '+P.name;
  $('#hubTitle').textContent=TEACHER_META[P.teacher].name+' \u2014 Factor or Not Factor';
  var doneCount=0, i;
  for(i=0;i<L.length;i++){ if(!L[i].master && P.completed[L[i].id]) doneCount++; }
  var masterOpen=(doneCount>=5 && full);
  var html=L.map(function(les, idx){
    var c=P.completed[les.id], act, meta, lockLine=false;
    var freeLesson=(idx===0);
    var n=(les.master||les.exam)? 30:20;
    if(les.master){
      if(!full){
        act=LOCKBTN;
        meta='Locked \u2014 full version + five completed levels';
        lockLine=true;
      }else if(masterOpen){
        act='<button class="btn primary" data-start="'+les.id+'">Enter the Master</button>';
        meta=c? ('Completed \u00b7 best '+c.score+'/30 \u00b7 '+fmtTime(c.time)+' \u00b7 '+c.rank) : 'Unlocked \u2014 30 mixed questions await';
      }else{
        act=LOCKBTN;
        meta='Locked \u2014 finish any five levels ('+Math.min(doneCount,5)+'/5 done)';
        lockLine=true;
      }
    }else{
      if(full || freeLesson){
        act='<button class="btn '+(c? 'ghost':'primary')+'" data-start="'+les.id+'">'+(c? 'Review':'Start')+'</button>';
        meta=c? ('Completed \u00b7 best '+c.score+'/'+n+' \u00b7 '+fmtTime(c.time)+' \u00b7 '+c.rank)
              : (freeLesson? 'Free trial level \u00b7 '+n+' questions \u00b7 game breaks every 5'
              : (les.exam? '30 questions \u00b7 real exam order \u00b7 no hints, no breaks'
              : n+' questions \u00b7 game breaks every 5'));
      }else{
        act=LOCKBTN;
        meta='Locked \u2014 the full version code unlocks this level';
        lockLine=true;
      }
    }
    return '<div class="lrow">'+
      '<div class="lnum">'+les.num+'</div>'+
      '<div class="linfo"><h3>'+les.title+'</h3><p>'+les.desc+'</p>'+
      '<div class="lmeta '+(lockLine?'lockline':'')+'">'+meta+'</div></div>'+
      '<div class="lact">'+act+'</div></div>';
  }).join('');
  if(full){
    html+='<div class="lrow"><div class="gemb">'+EMBLEMS.ghost+'</div>'+
      '<div class="linfo"><h3>Ghost Mode \u2014 Vertical Duel</h3><p>Two students stand face-to-face: the screen splits top and bottom, each half rotated toward its own player. 2 minutes per question \u2014 a first correct lock leaves the rival only 10 seconds. No calculator, no hints.</p>'+
      '<div class="lmeta">2 duelists \u00b7 rotated halves \u00b7 champion certificate by Mr. Akram</div></div>'+
      '<div class="lact"><button class="btn primary" id="btnGhost" type="button">Enter Ghost Mode</button></div></div>';
  }else{
    html+='<div class="lrow"><div class="gemb">'+EMBLEMS.ghost+'</div>'+
      '<div class="linfo"><h3>Ghost Mode \u2014 Vertical Duel</h3><p>Two students, one device, live scores and a champion certificate.</p>'+
      '<div class="lmeta lockline">Locked \u2014 full version only</div></div>'+
      '<div class="lact">'+LOCKBTN+'</div></div>';
  }
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
  /* Statistics + Unlock buttons (created once, beside Change name) */
  var hb=$('#btnRename');
  if(hb){
    var sb=document.getElementById('btnStats');
    if(!sb){
      sb=document.createElement('button');
      sb.id='btnStats'; sb.type='button'; sb.className='btn ghost small';
      sb.textContent='My Statistics';
      hb.parentElement.appendChild(sb);
      sb.onclick=function(){ AudioFX.tick(); renderStats(); show('scr-stats'); };
    }
    var ub=document.getElementById('btnUnlock');
    if(!ub){
      ub=document.createElement('button');
      ub.id='btnUnlock'; ub.type='button'; ub.className='btn primary small';
      ub.textContent='Unlock Full Version';
      hb.parentElement.appendChild(ub);
      ub.onclick=function(){ AudioFX.tick(); openUnlockModal(); };
    }
    ub.style.display=full? 'none':'';
  }
  /* Mistake review pill */
  var bank=loadWrongBank();
  $('#hubProgress').innerHTML= full
    ? 'Master progress: <b>'+Math.min(doneCount,5)+' / 5</b> levels completed'+(masterOpen? ' \u2014 the Master is open!':' \u2014 keep going!')
    : 'Free trial: <b>Level 1</b> is open \u00b7 enter your access code to unlock everything';
  if(bank.length){
    $('#hubProgress').innerHTML+='<button class="rev-pill" id="btnReviewBank" type="button" style="margin-top:.8rem">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg>'+
      bank.length+' mistake'+(bank.length===1?'':'s')+' waiting \u00b7 Review them now</button>';
    $('#btnReviewBank').onclick=function(){
      AudioFX.tick();
      startReview(loadWrongBank().map(function(e){ return e.q; }), 'Mistake Review');
    };
  }
}

/* ---------------- Statistics Center (built once, on demand) ---------------- */
function ensureStatsScreen(){
  var s=document.getElementById('scr-stats');
  if(s) return s;
  s=document.createElement('section');
  s.id='scr-stats'; s.className='screen';
  s.innerHTML=
    '<div class="wrap">'+
      '<div class="hub-head">'+
        '<div><div class="eyebrow">Your Progress</div><h1>Statistics Center</h1></div>'+
        '<button class="btn ghost small" id="btnStatsBack" type="button">\u2190&nbsp; All Lessons</button>'+
      '</div>'+
      '<div class="st-hero" id="stHero"></div>'+
      '<div class="card"><h2>Level Performance</h2><div id="stLevels"></div></div>'+
      '<div class="stats-foot" id="stFoot"></div>'+
    '</div>';
  document.querySelector('main').appendChild(s);
  document.getElementById('btnStatsBack').onclick=function(){ AudioFX.tick(); renderHub(); show('scr-hub'); };
  return s;
}
function renderStats(){
  ensureStatsScreen();
  var L=getLessons();
  var st=P.stats||{totalQ:0,correct:0,totalTime:0,attempts:{}};
  var acc=st.totalQ? Math.round(st.correct/st.totalQ*100) : 0;
  var doneCount=0, i;
  for(i=0;i<L.length;i++){ if(P.completed[L[i].id]) doneCount++; }
  var bank=loadWrongBank();
  $('#stHero').innerHTML=
    '<div class="st-big"><div class="v">'+doneCount+'/'+L.length+'</div><div class="l">Lessons Completed</div></div>'+
    '<div class="st-big"><div class="v">'+st.totalQ+'</div><div class="l">Questions Answered</div></div>'+
    '<div class="st-big"><div class="v">'+acc+'%</div><div class="l">Overall Accuracy</div></div>'+
    '<div class="st-big"><div class="v">'+fmtTime(st.totalTime)+'</div><div class="l">Total Study Time</div></div>';
  var rows='';
  for(i=0;i<L.length;i++){
    var les=L[i];
    var c=P.completed[les.id];
    var at=(st.attempts && st.attempts[les.id])? st.attempts[les.id] : null;
    var n=(les.master||les.exam)? 30:20;
    var pct=c? Math.round(c.score/n*100) : 0;
    var smallTxt;
    if(c) smallTxt='Best '+c.score+'/'+n+' \u00b7 '+fmtTime(c.time)+' \u00b7 '+c.rank+(at? ' \u00b7 '+at.tries+' attempt'+(at.tries===1?'':'s'):'');
    else if(les.master) smallTxt='Locked \u2014 finish five levels + full version';
    else smallTxt='Not attempted yet';
    rows+='<div class="st-row">'+
      '<span class="st-num">'+les.num+'</span>'+
      '<span class="st-info"><b>'+les.title+'</b>'+
      '<div class="st-bar"><i style="width:'+pct+'%"></i></div>'+
      '<small'+(c? '':' class="st-locked"')+'>'+smallTxt+'</small></span>'+
      '<span class="st-score">'+(c? c.score+'/'+n : '\u2014')+'<small>Best Score</small></span>'+
    '</div>';
  }
  $('#stLevels').innerHTML=rows;
  var foot='';
  if(bank.length){
    foot+='<button class="rev-pill" id="btnReviewBank2" type="button">'+
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg>'+
      bank.length+' mistake'+(bank.length===1?'':'s')+' in your review bank \u00b7 Review now</button>';
  }
  foot+='<button class="btn ghost small" id="btnStatsBack2" type="button">\u2190&nbsp; All Lessons</button>';
  $('#stFoot').innerHTML=foot;
  var rb2=document.getElementById('btnReviewBank2');
  if(rb2){
    rb2.onclick=function(){
      AudioFX.tick();
      startReview(loadWrongBank().map(function(e){ return e.q; }), 'Mistake Review');
    };
  }
  document.getElementById('btnStatsBack2').onclick=function(){ AudioFX.tick(); renderHub(); show('scr-hub'); };
}
/* ---------------- Intro (worked examples) ---------------- */
var introLesson=null;
function eqWorkedHTML(w){
  var twoV=!!w.twoVar;
  var vals=(twoV? 'x = '+w.demo.x+' and y = '+w.demo.y : 'x = '+w.demo.x);
  var head='<div class="worked-q">Q \u00b7 '+(w.prompt||PROMPT_EQ)+'<br><span class="wq">'+mathHTML(w.q)+'</span></div>';
  var S=[];
  var avoid='0, 1'+((w.exnums && w.exnums.length)? ', '+w.exnums.slice(0,8).join(', ') : '');
  S.push('<b>Type the expression on the calculator:</b> <span class="mth">'+mathHTML(w.q)+'</span> \u2014 press <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>'+(twoV? ' and <b>ALPHA</b> then <span class="mth">S\u21c4D</span> for <i class="vx">y</i>' : '')+', then press <b>CALC</b>.');
  S.push('Choose fresh value'+(twoV? 's':'')+' \u2014 never 0, 1, or any number in the question (avoid: <b>'+avoid+'</b>). Here we pick '+vals+'.');
  S.push('Press <b>=</b> \u2014 the screen shows <b>'+fmtNum(w.demo.orig)+'</b>. Keep that answer in your head.');
  var rows=(w.choices||[]).map(function(c){
    var isAns=!!c.ok;
    return '<div class="wch '+(isAns?'ok':'no')+'"><span class="t">'+mathHTML(c.ex)+'</span>'+
      '<span class="v">at '+vals+' \u2192 '+fmtNum(c.v)+(c.w? ' \u2014 '+c.w : '')+'</span>'+
      '<span class="verdict">'+(isAns? '\u2713 the answer':'\u2717 not it')+'</span></div>';
  }).join('');
  S.push('Type each choice, press <b>CALC</b>, enter the <b>same value'+(twoV? 's':'')+'</b>, press <b>=</b>:<div class="wch-table">'+rows+'</div>');
  S.push('<b>Answer: <span class="mth">'+mathHTML(w.ans)+'</span></b> \u2014 the only choice that reproduces the original answer'+(twoV? ' at the same pair of values':'')+'.');
  return head+'<div class="steps">'+S.map(function(s, i2){
    return '<div class="step"><span class="step-n">'+(i2+1)+'</span><div class="step-body">'+s+'</div></div>';
  }).join('')+'</div>';
}
function renderIntro(L){
  introLesson=L;
  $('#introChip').textContent= L.exam? 'Exam Simulation' : L.master? 'Master Challenge' : 'Lesson '+L.num;
  $('#introTitle').innerHTML=L.title;
  $('#introDesc').innerHTML=L.desc;
  $('#skillList').innerHTML=L.skills.map(function(s){ return '<li>'+s+'</li>'; }).join('');
  var steps=(L.steps && L.steps.length)? L.steps : METHOD_STEPS;
  $('#methodList').innerHTML=steps.map(function(s){ return '<li>'+s+'</li>'; }).join('');
  var w=L.worked;
  $('#workedBox').innerHTML=(w && w.kind==='equiv')? eqWorkedHTML(w) : '';
  czSetQuestion(null);
  $('#btnStartLesson').textContent= L.exam? 'Start Exam \u2014 30 Questions' : L.master? 'Start Master \u2014 30 Questions' : 'Start Lesson \u2014 20 Questions';
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
var QZ={ lesson:null, qs:[], i:0, score:0, mistakes:[], answered:false, hintShown:0, breakIdx:0,
         times:[], qT0:0, review:false, reviewTotal:0, reviewFixed:0, wrongQs:[] };
var PRAISE=['Excellent!','Perfect!','Brilliant!','Great job!','Well done!','Fantastic!'];
var ENCOURAGE=['Good try \u2014 let\u2019s see why.','Almost! Check the steps below.','Not quite, but the next one is yours!','Keep going \u2014 mistakes build champions.'];

function answeredCount(){ return QZ.i + (QZ.answered?1:0); }
function updateStopBtn(){
  var b=$('#btnStop'); if(!b) return;
  b.style.display=(answeredCount()>=10)? '' : 'none';
}
function balancedSeq(n){
  var s=[];
  while(s.length<n){ var sh=shuffle([0,1,2,3]); for(var i=0;i<sh.length && s.length<n;i++) s.push(sh[i]); }
  return s;
}
function rebalance(q, pos){
  var ci=q.correctIdx;
  if(ci===pos || !q.choices || pos>=q.choices.length) return;
  var tc=q.choices[ci];
  q.choices[ci]=q.choices[pos]; q.choices[pos]=tc;
  q.correctIdx=pos;
}
function buildQuestions(lesson, seq){
  var n = (lesson.master||lesson.exam)? 30:20, out=[], seen={}, guard=0;
  while(out.length<n && guard++<900){
    var q=lesson.gen(out.length/n);
    if(!q) continue;
    var key=q.text+(q.divi||'')+(q.kq? 'K'+q.kPos : '');
    if(seen[key]) continue;
    seen[key]=1;
    rebalance(q, seq[out.length]);
    out.push(q);
  }
  return out;
}
function resumeSession(d){
  if(d.review){
    QZ.lesson={ id:'review', num:'\u21ba', title:'Mistake Review', desc:'', review:true, gen:null };
    QZ.review=true;
    QZ.reviewTotal=d.qs.length;
    QZ.reviewFixed=d.reviewFixed||0;
  }else{
    var L2=getLessons(), found=null, i;
    for(i=0;i<L2.length;i++){ if(L2[i].id===d.lid){ found=L2[i]; break; } }
    if(!found){ clearSession(); toast('That lesson is no longer available.'); return; }
    QZ.lesson=found;
    QZ.review=false; QZ.reviewTotal=0; QZ.reviewFixed=0;
  }
  QZ.qs=d.qs;
  QZ.i=Math.min(d.i, d.qs.length);
  QZ.score=d.score||0;
  QZ.mistakes=d.mistakes||[];
  QZ.times=d.times||[];
  QZ.breakIdx=d.breakIdx||0;
  QZ.wrongQs=[];
  QZ.answered=false; QZ.hintShown=0;
  if(QZ.i>=QZ.qs.length){ clearSession(); finishLesson(false); return; }
  $('#tbLesson').innerHTML=TEACHER_META[P.teacher].name+' \u00b7 '+QZ.lesson.title;
  $('#qLessonChip').textContent= QZ.review? 'Mistake Review' : QZ.lesson.exam? 'Exam Simulation' : QZ.lesson.master? 'Master Challenge':'Lesson '+QZ.lesson.num;
  var total=QZ.qs.length;
  var ticks=$('#qTicks'); ticks.innerHTML='';
  if(!QZ.lesson.exam){
    for(var k=5;k<total;k+=5){
      var t=document.createElement('span'); t.className='q-tick';
      t.style.left=(k/total*100)+'%'; ticks.appendChild(t);
    }
  }
  show('scr-quiz');
  Timer.start();
  Timer.acc=(d.elapsed||0)*1000;
  Timer.on=true; Timer.t0=Date.now();
  Timer.ui();
  renderQ();
  toast('Session restored \u2014 welcome back!');
}
function startLesson(L){
  if(!L) return;
  QZ.lesson=L;
  QZ.review=false; QZ.reviewTotal=0; QZ.reviewFixed=0;
  var n=(L.master||L.exam)? 30:20;
  QZ.qs=buildQuestions(L, balancedSeq(n));
  if(!QZ.qs.length){ toast('Could not build the questions \u2014 try again.'); return; }
  QZ.i=0; QZ.score=0; QZ.mistakes=[]; QZ.wrongQs=[]; QZ.times=[];
  QZ.breakIdx=0;
  $('#tbLesson').innerHTML=TEACHER_META[P.teacher].name+' \u00b7 '+L.title;
  $('#qLessonChip').textContent= L.exam? 'Exam Simulation' : L.master? 'Master Challenge':'Lesson '+L.num;
  var total=QZ.qs.length;
  var ticks=$('#qTicks'); ticks.innerHTML='';
  if(!L.exam){
    for(var k=5;k<total;k+=5){
      var t=document.createElement('span'); t.className='q-tick';
      t.style.left=(k/total*100)+'%'; ticks.appendChild(t);
    }
  }
  show('scr-quiz'); Timer.start(); renderQ();
}
function startReview(questions, label){
  if(!questions || !questions.length){ toast('No mistakes to review \u2014 well done!'); return; }
  var qs=shuffle(questions).slice(0,20);
  QZ.lesson={ id:'review', num:'\u21ba', title:label||'Mistake Review', desc:'', review:true, gen:null };
  QZ.review=true;
  QZ.reviewTotal=qs.length;
  QZ.reviewFixed=0;
  QZ.qs=qs;
  QZ.i=0; QZ.score=0; QZ.mistakes=[]; QZ.wrongQs=[]; QZ.times=[];
  QZ.breakIdx=0;
  $('#tbLesson').innerHTML='Mistake Review \u00b7 '+P.name;
  $('#qLessonChip').textContent='Mistake Review';
  var total=qs.length;
  var ticks=$('#qTicks'); ticks.innerHTML='';
  for(var k=5;k<total;k+=5){
    var t=document.createElement('span'); t.className='q-tick';
    t.style.left=(k/total*100)+'%'; ticks.appendChild(t);
  }
  show('scr-quiz'); Timer.start(); renderQ();
  toast('Review mode: '+total+' questions \u2014 answer correctly to remove them from your bank!');
}

/* ---------------- Render one question ---------------- */
function renderQ(){
  var q=QZ.qs[QZ.i], total=QZ.qs.length;
  if(!q) return;
  QZ.qT0=Timer.elapsed();
  $('#qNum').textContent='Question '+(QZ.i+1)+' of '+total;
  $('#qFill').style.width=((QZ.i+1)/total*100)+'%';
  var promptTxt='Find the equivalent'+(q.twoVar? ' \u00b7 x and y':'');
  var exprHtml=
    '<div style="font-size:.55em; color:var(--muted); margin-bottom:.3rem; letter-spacing:.04em">'+(q.prompt||PROMPT_EQ)+'</div>'+
    mathHTML(q.text);
  $('#qPrompt').textContent=promptTxt;
  $('#qExpr').innerHTML=exprHtml;
  czSetQuestion(q);
  var letters=['A','B','C','D'];
  $('#qOpts').innerHTML=q.choices.map(function(c,i){
    var label=(c.ex!==undefined)? mathHTML(c.ex) : mathHTML(lin(c.a,c.b));
    return '<button class="opt" type="button" data-i="'+i+'"><span class="key">'+letters[i]+'</span><span>'+label+'</span></button>';
  }).join('');
  var btns=$$('#qOpts .opt');
  btns.forEach(function(b){ b.onclick=function(){ answer(parseInt(b.getAttribute('data-i'),10)); }; });
  QZ.answered=false; QZ.hintShown=0;
  $('#btnHint').style.display=(QZ.lesson && QZ.lesson.exam)? 'none':'';
  $('#hintCount').textContent='2'; $('#btnHint').disabled=false;
  $('#hintBox').hidden=true; $('#hintBox').innerHTML='';
  $('#feedback').hidden=true; $('#feedback').innerHTML='';
  updateStopBtn();
  saveSession();
}

/* ---------------- Answer + feedback ---------------- */
function answer(idx){
  if(QZ.answered) return;
  QZ.answered=true;
  var q=QZ.qs[QZ.i], ok=(idx===q.correctIdx), chosen=q.choices[idx];
  var dur=Math.max(0, Timer.elapsed()-QZ.qT0);
  QZ.times[QZ.i]=dur;
  var opts=$$('#qOpts .opt');
  opts.forEach(function(b,i){
    b.disabled=true;
    if(i===q.correctIdx) b.classList.add('correct');
    else if(i===idx) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  var chosenLabel=(chosen.ex!==undefined)? chosen.ex : lin(chosen.a,chosen.b);
  var correctObj=q.choices[q.correctIdx];
  var correctLabel=(correctObj.ex!==undefined)? correctObj.ex : lin(correctObj.a,correctObj.b);
  var qLabel='Equivalent to '+q.text;
  if(ok){
    QZ.score++;
    if(QZ.review){ QZ.reviewFixed++; removeFromWrongBank(q); }
  }else{
    QZ.mistakes.push({ num:QZ.i+1, text:qLabel, tag:q.tag,
      chosen:chosenLabel, correct:correctLabel, time:dur });
    if(!QZ.review){
      QZ.wrongQs.push(q);
      addToWrongBank(q, QZ.lesson? QZ.lesson.id : '');
    }
  }
  var fb=$('#feedback'); fb.hidden=false; fb.className='feedback '+(ok?'good':'bad');
  var ico=ok
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var last=(QZ.i+1>=QZ.qs.length);
  var nextLbl= last? (QZ.review? 'Finish Review \u00b7 See My Report' : 'Finish Lesson \u00b7 See My Results') : 'Next Question \u2192';
  var valDesc=q.twoVar? ('x = '+q.demo.x+' and y = '+q.demo.y) : ('x = '+q.demo.x);
  var goodLine='Correct \u2014 <span class="mth">'+mathHTML(correctLabel)+'</span> is the equivalent expression.';
  var proofLine='Calculator proof: at '+valDesc+', the original gave '+fmtNum(q.demo.orig)+' and this choice gave exactly the same answer.';
  if(QZ.review && ok){ proofLine+=' Removed from your mistake bank.'; }
  var html='<div class="fb-head">'+ico+' '+(ok? pick(PRAISE):pick(ENCOURAGE))+'</div>'+
    '<div class="fb-sub">'+(ok
      ? goodLine+'</div><div class="fb-proof">'+proofLine+'</div>'
      : 'The correct answer is <span class="mth">'+mathHTML(correctLabel)+'</span>. Here is the full solution, exactly as the calculator does it:</div>');
  if(!ok) html+=correctionHTML(q);
  html+='<button class="btn primary" id="btnNext" type="button">'+nextLbl+'</button>';
  fb.innerHTML=html;
  $('#btnNext').onclick=nextQ;
  try{ fb.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){ fb.scrollIntoView(); }
  updateStopBtn();
  saveSession();
  if(ok) AudioFX.good(); else AudioFX.bad();
}

/* ---------------- Full correction ---------------- */
function correctionHTML(q){
  var twoV=!!q.twoVar;
  var valDesc=twoV? ('x = '+q.demo.x+' and y = '+q.demo.y) : ('x = '+q.demo.x);
  var avoid='0, 1'+((q.exnums && q.exnums.length)? ', '+q.exnums.slice(0,8).join(', ') : '');
  var S=[];
  S.push('<b>Type the given expression on the calculator:</b> <span class="mth">'+mathHTML(q.text)+'</span> \u2014 <b>ALPHA</b> then <span class="mth">)</span> for <i class="vx">x</i>'+(twoV? ' and <b>ALPHA</b> then <span class="mth">S\u21c4D</span> for <i class="vx">y</i>' : '')+', then press <b>CALC</b>.');
  S.push('Choose fresh value'+(twoV? 's':'')+' \u2014 never 0, 1, or a question number (avoid: <b>'+avoid+'</b>). Press <b>=</b> \u2014 keep the answer in your head.');
  var rows=q.choices.map(function(c,i){
    var okk=(i===q.correctIdx);
    var v=q.demo.vals[i];
    var same=(Math.abs(v-q.demo.orig)<0.001);
    return '<div class="wch '+(okk?'ok':'no')+'"><span class="t">'+mathHTML(c.ex)+'</span>'+
      '<span class="v">at '+valDesc+' \u2192 '+fmtNum(v)+(same? ' \u2014 matches the original':' \u2014 does not match')+'</span>'+
      '<span class="verdict">'+(okk? '\u2713 the answer':'\u2717 not it')+'</span></div>';
  }).join('');
  S.push('Type each choice, press <b>CALC</b>, enter the <b>same value'+(twoV? 's':'')+'</b>, press <b>=</b> \u2014 compare the screen numbers:<div class="wch-table">'+rows+'</div>');
  S.push('<b>Answer: <span class="mth">'+mathHTML(q.choices[q.correctIdx].ex)+'</span></b> \u2014 the only choice that returns the original answer'+(twoV? ' at the same pair of values':'')+'.');
  return '<div class="steps">'+S.map(function(s,i2){
    return '<div class="step"><span class="step-n">'+(i2+1)+'</span><div class="step-body">'+s+'</div></div>';
  }).join('')+'</div>';
}

function nextQ(){
  QZ.i++;
  if(QZ.i>=QZ.qs.length){ finishLesson(false); return; }
  if(QZ.i%5===0 && QZ.lesson && !QZ.lesson.exam){ startBreak(); return; }
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
   GAMES — auto-start, auto-return (never blocks a lesson)
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
 { name:'Shape Catcher', desc:'Catch only the requested shape with the crate. 30 seconds!', run:catchGame },
 { name:'Rocket Dodge', desc:'Pilot the rocket and dodge the asteroids. 30 seconds!', run:rocketGame },
 { name:'Memory Match', desc:'Match the 8 pairs of mathematical symbols.', run:memoryGame },
 { name:'Penalty Shootout', desc:'Drag the ball back, aim, release. Five shots!', run:shootGame },
 { name:'Fruit Slice', desc:'Swipe to slice the flying fruits. 30 seconds!', run:fruitGame },
 { name:'Bubble Rush', desc:'Tap the bubbles before they vanish. 22 seconds!', run:popGame },
 { name:'Quick Calc', desc:'Fast mental multiplication and division. 45 seconds!', run:quickCalcGame }
];
function startBreak(){
  Timer.pause();
  var g=GAMES[QZ.breakIdx%GAMES.length]; QZ.breakIdx++;
  $('#gameTitle').textContent=g.name;
  $('#gameHud').textContent='';
  var ov=$('#gameOverlay'); ov.classList.add('on');
  $('#gOvTitle').textContent=g.name;
  $('#gOvText').innerHTML=g.desc+' <span style="color:#a6997e">(starts in 2 seconds \u2014 skip anytime)</span>';
  var btn=$('#gOvBtn'); btn.textContent='Play now';
  var sk=$('#gFloatSkip');
  var autoT=setTimeout(leaveGame, 45000);
  function leaveGame(){
    clearTimeout(autoT);
    stopGameLoop();
    if(sk) sk.style.display='none';
    ov.classList.remove('on');
    Timer.resume(); show('scr-quiz'); renderQ();
  }
  if(sk){ sk.style.display=''; sk.onclick=leaveGame; }
  var runT=setTimeout(beginGame, 2000);
  function beginGame(){
    clearTimeout(runT);
    ov.classList.remove('on'); AudioFX.ensure();
    g.run(function(res){
      ov.classList.add('on');
      $('#gOvTitle').textContent='Great break!';
      $('#gOvText').innerHTML=res;
      var b=$('#gOvBtn'); b.textContent='Continue';
      b.onclick=leaveGame;
      clearTimeout(autoT);
      autoT=setTimeout(leaveGame, 5000);
    });
  }
  btn.onclick=beginGame;
  show('scr-game');
  toast('Break! Auto-continues \u2014 or tap Skip.');
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
    cx.fillStyle='#ecc87e'; cx.beginPath(); cx.arc(0,-29,9,0,Math.PI*2); cx.fill();
    cx.strokeStyle='#b08348'; cx.lineWidth=5;
    cx.beginPath(); cx.moveTo(-12,-10); cx.lineTo(-22,keeper.dive? -30 : -6);
    cx.moveTo(12,-10); cx.lineTo(22,keeper.dive? -30 : -6); cx.stroke();
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
    cx.restore();
    if(aiming && phase==='aim'){
      var pw=Math.min(1, Math.hypot(aim.x-ball.x,aim.y-ball.y)/300);
      cx.strokeStyle='rgba(236,200,126,.85)'; cx.lineWidth=3; cx.setLineDash([10,8]);
      cx.beginPath(); cx.moveTo(ball.x,ball.y); cx.lineTo(aim.x,aim.y); cx.stroke(); cx.setLineDash([]);
      cx.strokeStyle='#ecc87e'; cx.lineWidth=2.5;
      cx.beginPath(); cx.arc(aim.x,aim.y,15,0,Math.PI*2); cx.stroke();
      cx.strokeStyle='rgba(207,127,101,.9)'; cx.lineWidth=5; cx.lineCap='round';
      cx.beginPath(); cx.arc(ball.x,ball.y,25,-Math.PI/2,-Math.PI/2+pw*2*Math.PI); cx.stroke();
    }
    cx.fillStyle='#e7dcc3'; cx.font='600 22px STIX Two Text'; cx.textAlign='left';
    cx.fillText('Shot '+Math.min(shots+1,5)+'/5  \u00b7  Goals '+goals, 26, 42);
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
      if(resT<=0){
        if(shots>=5){
          stopGameLoop();
          onEnd('You scored <b>'+goals+' / 5</b> goals. Now, back to algebra!');
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
      onEnd('You popped <b>'+score+'</b> bubbles. Reflexes sharpened \u2014 let\u2019s solve!');
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
      onEnd('Quick math: <b>'+score+'</b> points with a best streak of <b>\u00d7'+bestStreak+'</b>. Brain warmed up!');
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
  clearSession();
  var L=QZ.lesson;
  var total= early? answeredCount() : QZ.qs.length;
  if(total<1) return;
  var time=Timer.elapsed(), errors=QZ.mistakes.length;
  if(QZ.review){
    recordStats(null, QZ.score, total, time);
    sendScoreToSheet({
      name:P.name,
      teacher:TEACHER_META[P.teacher].name,
      lesson:'Mistake Review \u2014 '+QZ.reviewTotal+' questions',
      score:QZ.score,
      total:total,
      time:fmtTime(time),
      rank:'Review'
    });
    renderResults(L,{total:total,time:time,errors:errors,review:true});
    show('scr-results');
    AudioFX.fanfare();
    toast('Review complete \u2014 '+QZ.reviewFixed+' of '+QZ.reviewTotal+' fixed!');
    return;
  }
  var place=placeOf(errors);
  lastLesson=L;
  var prev=P.completed[L.id];
  if(!prev || QZ.score>prev.score || (QZ.score===prev.score && time<prev.time)){
    P.completed[L.id]={score:QZ.score, errors:errors, time:time, rank:place.rank, total:total}; saveP();
  }
  recordStats(L.id, QZ.score, total, time);
  sendScoreToSheet({
    name:P.name,
    teacher:TEACHER_META[P.teacher].name,
    lesson:(L.master? 'Master' : L.exam? 'Exam Simulation' : 'Lesson '+L.num)+' \u2014 '+String(L.title),
    score:QZ.score,
    total:total,
    time:fmtTime(time),
    rank:place.rank
  });
  renderResults(L,{total:total,time:time,errors:errors,place:place,early:early});
  show('scr-results');
  AudioFX.fanfare();
  if((L.master||L.exam) && !prev) toast((L.master? 'MASTER CHALLENGE':'EXAM SIMULATION')+' COMPLETE \u2014 legendary!');
}
function renderResults(L,r){
  var tm=TEACHER_META[P.teacher];
  var tN=0, tSum=0, tMax=0, tMin=Infinity, t;
  for(t=0;t<QZ.times.length;t++){
    var tv=QZ.times[t];
    if(tv===undefined || tv===null) continue;
    tN++; tSum+=tv;
    if(tv>tMax) tMax=tv;
    if(tv<tMin) tMin=tv;
  }
  var avg=tN? Math.round(tSum/tN) : 0;
  var timeChips='';
  if(tN>1){
    timeChips='<div class="qtime-grid">'+
      '<div class="qtime-chip">Avg per question <b>'+fmtTime(avg)+'</b></div>'+
      '<div class="qtime-chip">Fastest <b>'+fmtTime(tMin)+'</b></div>'+
      '<div class="qtime-chip">Slowest <b>'+fmtTime(tMax)+'</b></div>'+
    '</div>';
  }
  if(r.review){
    var fixRatio=QZ.reviewTotal? QZ.reviewFixed/QZ.reviewTotal : 0;
    var tier=fixRatio>=1? 'gold' : fixRatio>=.7? 'silver' : 'bronze';
    var remaining=loadWrongBank().length;
    $('#resChip').textContent='Mistake Review';
    $('#resTitle').textContent='Review Report';
    $('#resMedal').innerHTML=medalSVG(tier);
    $('#resPraise').innerHTML='<span class="fix-pill">\u2713 '+QZ.reviewFixed+' of '+QZ.reviewTotal+' fixed</span>'+
      ' \u00b7 '+(remaining? remaining+' question'+(remaining===1?'':'s')+' still waiting in your bank.' : 'Your mistake bank is empty \u2014 outstanding!');
    $('#perfectBox').innerHTML=(r.errors===0)? '<div class="perfect">ALL REVIEW QUESTIONS FIXED \u2014 ZERO MISTAKES</div>':'';
    $('#resStats').innerHTML=
      '<div class="stat"><div class="v">'+QZ.score+'/'+r.total+'</div><div class="l">Score</div></div>'+
      '<div class="stat"><div class="v">'+fmtTime(r.time)+'</div><div class="l">Time</div></div>'+
      '<div class="stat"><div class="v">'+r.errors+'</div><div class="l">Still Wrong</div></div>'+
      '<div class="stat"><div class="v">'+fmtTime(avg)+'</div><div class="l">Avg / Question</div></div>';
    $('#ruleLine').innerHTML=timeChips+'Answered correctly = removed from your mistake bank \u00b7 wrong again = it stays for the next review.';
    $('#leaderCard').style.display='none';
    $('#certCard').parentElement.style.display='none';
    $('#btnPrint').style.display='none';
    $('#btnRetry').textContent='Review Remaining Mistakes';
    $('#btnRetry').onclick=function(){
      var bank=loadWrongBank().map(function(e){ return e.q; });
      if(!bank.length){ toast('Your mistake bank is empty \u2014 well done!'); return; }
      AudioFX.tick(); startReview(bank, 'Mistake Review');
    };
  }else{
    $('#resChip').textContent= L.exam? (r.early? 'Exam \u2014 Ended Early':'Exam Simulation Complete') : L.master? (r.early? 'Master \u2014 Ended Early':'Master Challenge Complete') : (r.early? 'Lesson Ended Early':'Lesson Complete');
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
    $('#ruleLine').innerHTML=timeChips+'Placement rule: <b>0\u20132 mistakes</b> \u2192 1st &nbsp;\u00b7&nbsp; <b>3\u20134</b> \u2192 2nd &nbsp;\u00b7&nbsp; <b>5\u20136</b> \u2192 3rd &nbsp;\u00b7&nbsp; <b>7\u20138</b> \u2192 4th &nbsp;\u00b7&nbsp; <b>9\u201310</b> \u2192 5th';
    $('#leaderCard').style.display='';
    $('#certCard').parentElement.style.display='';
    $('#btnPrint').style.display='';
    $('#btnRetry').textContent='Retry Lesson';
    $('#btnRetry').onclick=function(){ startLesson(lastLesson); };
  }
  $('#mistakesList').innerHTML=QZ.mistakes.length? QZ.mistakes.map(function(m){
    return '<div class="mrow"><span class="mnum">Q'+m.num+'</span>'+
      (m.tag? '<span class="mtag">'+m.tag+'</span>':'')+
      '<span class="mq">'+mathHTML(m.text)+'</span>'+
      '<span class="mans you">you chose '+mathHTML(m.chosen)+'</span>'+
      '<span class="mans ok">correct: '+mathHTML(m.correct)+'</span>'+
      ((m.time!==undefined)? '<span class="mtime'+(tN && m.time>=avg? ' slow':'')+'">'+fmtTime(m.time)+'</span>':'')+
    '</div>';
  }).join('')
  : '<p class="muted">Nothing to report \u2014 you made zero mistakes. Every single answer was correct!</p>';
  if(!r.review){
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
  }
  var rowEl=$('#btnPrint').parentElement;
  var rb=document.getElementById('btnRevNow');
  if(!r.review && QZ.wrongQs && QZ.wrongQs.length){
    if(!rb){
      rb=document.createElement('button');
      rb.id='btnRevNow'; rb.type='button'; rb.className='btn ghost big';
      rowEl.insertBefore(rb, $('#btnRetry'));
    }
    rb.style.display='';
    rb.textContent='Review My Mistakes ('+QZ.wrongQs.length+')';
    rb.onclick=function(){ AudioFX.tick(); startReview(QZ.wrongQs.slice(), 'Mistake Review'); };
  }else if(rb){ rb.style.display='none'; }
  if(!r.review){
    $('#certName').textContent=P.name;
    $('#certLesson').textContent=(L.master? 'The Master Challenge \u2014 ' : L.exam? 'The EST & SAT Exam Simulation \u2014 ' : 'Lesson '+L.num+' \u2014 ')+String(L.title).replace(/&amp;/g,'&')+' \u00b7 '+tm.name;
    $('#certStats').textContent='Score '+QZ.score+'/'+r.total+'  \u00b7  Time '+fmtTime(r.time)+'  \u00b7  '+r.place.rank;
    $('#certDate').textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    $('#sigEmb').innerHTML=EMBLEMS[P.teacher]||'';
    $('#sigName').textContent=tm.name;
    $('#sigRole').textContent=tm.role;
  }
}
/* ---------------- Emblems & teacher meta ---------------- */
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
    '<g>'+CMP_MAIN+'</g><g transform="rotate(90 32 32)">'+CMP_MAIN+'</g>'+
    '<g transform="rotate(180 32 32)">'+CMP_MAIN+'</g><g transform="rotate(270 32 32)">'+CMP_MAIN+'</g>'+
    '<g transform="rotate(45 32 32)">'+CMP_DIA+'</g><g transform="rotate(135 32 32)">'+CMP_DIA+'</g>'+
    '<g transform="rotate(225 32 32)">'+CMP_DIA+'</g><g transform="rotate(315 32 32)">'+CMP_DIA+'</g>'+
    '<circle cx="32" cy="32" r="2.6" fill="#ecc87e" stroke="#8a6a2a" stroke-width="1"/></svg>',
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
  akram:{ name:'Mr. Akram', role:'Founder & Designer' },
  mohamed:{ name:'Mr. Mohamed', role:'EST & SAT Coach' }
};

/* ================================================================
   GHOST MODE — vertical duel (full version only) — expression battles
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
var duelGen=function(){
  return pick([genEE1,genEE2,genEE2,genEE3,genEE3,genEE4,genEE4,genEE4,genME1,genME2,genME2,genME3,genME3])();
};
var DUEL={active:false,total:10,qi:0,qs:[],p:null,afterT:null,qT0:0,qInt:null,QT:120,qt:120,grace:false,graceP:-1};
function buildDuelQuestions(n){
  var out=[], seen={}, guard=0;
  while(out.length<n && guard++<600){
    var q=duelGen();
    if(!q || !q.choices || q.choices.length<4) continue;
    if(q.twoVar) continue;
    var key=q.text;
    if(seen[key]) continue;
    seen[key]=1;
    out.push(q);
  }
  return out;
}
function duelExprFor(q){
  return '<div style="font-size:.5em; color:rgba(231,220,195,.75); margin-bottom:.15rem">Which is equivalent to:</div>'+mathHTML(q.text);
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
  var duelExpr=duelExprFor(q);
  $('#dvTExpr').innerHTML=duelExpr;
  $('#dvBExpr').innerHTML=duelExpr;
  DUEL.p[0].answered=false; DUEL.p[1].answered=false;
  DUEL.p[0].ok=false; DUEL.p[1].ok=false;
  DUEL.p[0].choice=-1; DUEL.p[1].choice=-1;
  renderDVSide(0,q); renderDVSide(1,q);
  $('#duelTurn').textContent='2 minutes \u00b7 first correct takes the point';
  DUEL.qT0=performance.now();
  duelStartTimer();
}
function renderDVSide(pi,q){
  var L=['A','B','C','D'];
  var order=(pi===0)? [3,2,1,0] : [0,1,2,3];
  var box=$('#dv'+(pi===0?'T':'B')+'Opts');
  box.innerHTML=order.map(function(i){
    var lab=(q.choices[i].ex!==undefined)? mathHTML(q.choices[i].ex) : mathHTML(lin(q.choices[i].a,q.choices[i].b));
    return '<button class="dv-opt" type="button" data-i="'+i+'"><span class="k">'+L[i]+'</span><span>'+lab+'</span></button>';
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
  var btns=$$('#dv'+(pi===0?'T':'B')+'Opts .dv-opt');
  btns.forEach(function(b){ b.disabled=true; b.classList.add('dim'); });
  var st=$('#dv'+(pi===0?'T':'B')+'Stat');
  st.textContent='Locked in '+(ms/1000).toFixed(1)+'s';
  st.className='dv-stat';
  AudioFX.tick();
  var other=1-pi;
  if(DUEL.p[other].answered){ duelRoundDone(1400); return; }
  if(ok){
    DUEL.grace=true; DUEL.graceP=other;
    DUEL.QT=10; DUEL.qt=10;
    var ost=$('#dv'+(other===0?'T':'B')+'Stat');
    ost.textContent='Rival locked it! 10 seconds\u2026';
    ost.className='dv-stat';
    duelStartTimer();
  }
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
  ranked.forEach(function(p){
    sendScoreToSheet({
      name:p.name,
      teacher:'Ghost Duel',
      lesson:'Duel \u2014 '+p.total+' questions',
      score:p.score,
      total:p.total,
      time:fmtTime(p.time),
      rank:(p===w? 'Champion' : 'Rival')
    });
  });
  $('#grMedal').innerHTML=medalSVG('gold');
  $('#grTitle').textContent='Duel Complete';
  $('#grPraise').textContent=w.name+' wins '+w.score+'\u2013'+l.score+' against '+l.name+'. The champion answered everything in a total of '+fmtTime(w.time)+'.';
  $('#grChampEmb').innerHTML=EMBLEMS.ghost;
  $('#grChampName').textContent=w.name;
  var avgQ=w.total? Math.round(w.time/w.total) : 0;
  $('#grChampStats').textContent='Score '+w.score+'/'+w.total+' \u00b7 '+w.errors+' wrong \u00b7 avg '+fmtTime(avgQ)+' per answer';
  var tiers=['gold','silver','bronze','iron'];
  $('#gmTable').innerHTML=ranked.map(function(p,i){
    var sm=medalSVG(tiers[i]||'iron').replace('class="medal"','class="medal sm"');
    return '<div class="lrow2"><span class="lpos">'+(i+1)+'</span><span class="lname">'+p.name+(i===0?' \u2014 champion':'')+'</span>'+
      '<span class="lstat">'+p.score+'/'+p.total+' correct \u00b7 '+p.errors+' wrong \u00b7 answer time '+fmtTime(p.time)+'</span>'+sm+'</div>';
  }).join('');
  $('#gcName').textContent=w.name;
  $('#gcStats').textContent='Ghost Mode Champion \u00b7 Score '+w.score+'/'+w.total+' \u00b7 Total answer time '+fmtTime(w.time);
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
/* Session rescue modal — offered once, right after entering the hub */
function ensureResumeModal(){
  var m=document.getElementById('resumeModal');
  if(m) return m;
  var back=document.createElement('div');
  back.id='resumeModal'; back.className='stop-back';
  var card=document.createElement('div');
  card.className='stop-card';
  card.innerHTML='<div class="eyebrow">Welcome Back</div>'+
    '<h2 style="margin-bottom:0">Unfinished lesson found</h2>'+
    '<div class="mini-stats" id="rsStats"></div>'+
    '<p class="muted" style="font-size:.85rem; line-height:1.6">You left a lesson in progress \u2014 your score, your answers and your timer are all safe. Resume exactly where you stopped, or discard and start fresh.</p>'+
    '<div class="row center" style="margin-top:1.2rem">'+
    '<button class="btn primary" id="rsResume" type="button">Resume Lesson</button>'+
    '<button class="btn ghost" id="rsDiscard" type="button">Discard</button></div>';
  back.appendChild(card);
  document.body.appendChild(back);
  return back;
}
function checkSessionRescue(){
  var d=loadSession();
  if(!d) return;
  var m=ensureResumeModal();
  var pct=d.qs.length? Math.round((d.i/d.qs.length)*100) : 0;
  document.getElementById('rsStats').innerHTML=
    '<div class="mini"><div class="v">'+Math.min(d.i+1,d.qs.length)+'/'+d.qs.length+'</div><div class="l">Question</div></div>'+
    '<div class="mini"><div class="v" style="color:var(--good)">'+(d.score||0)+'</div><div class="l">Correct</div></div>'+
    '<div class="mini"><div class="v">'+((d.elapsed||0)? fmtTime(d.elapsed) : '00:00')+'</div><div class="l">Time</div></div>'+
    '<div class="mini"><div class="v">'+pct+'%</div><div class="l">Done</div></div>';
  document.getElementById('rsResume').onclick=function(){
    m.classList.remove('on');
    AudioFX.tick();
    resumeSession(d);
  };
  document.getElementById('rsDiscard').onclick=function(){
    m.classList.remove('on');
    clearSession();
    AudioFX.tick();
    toast('Session discarded \u2014 fresh start.');
  };
  m.classList.add('on');
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
  injectCodeField();

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
      if(P.name){ renderHub(); show('scr-hub'); checkSessionRescue(); }
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
    var codeEl=document.getElementById('aidCode');
    var msgEl=document.getElementById('aidCodeMsg');
    var code=(codeEl && codeEl.value)? codeEl.value.trim().toUpperCase() : '';
    if(code!==''){
      if(!isCodeValid(code)){
        if(msgEl){ msgEl.textContent='Wrong access code \u2014 leave it empty to start the free first level.'; msgEl.style.color='var(--bad)'; }
        AudioFX.bad();
        return;
      }
      setFullAccess();
      if(msgEl){ msgEl.textContent='Full version unlocked!'; msgEl.style.color='var(--good)'; }
    }
    P.name=v; saveP(); renderHub(); show('scr-hub');
    toast(hasFullAccess()? ('Welcome, '+v+' \u2014 full version!') : ('Welcome, '+v+' \u2014 Level 1 is free to try.'));
    checkSessionRescue();
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
    clearSession();
    toast('Lesson exited \u2014 this run was not saved.');
    renderHub(); show('scr-hub');
  };
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
  $('#btnRetry').onclick=function(){ if(lastLesson) startLesson(lastLesson); };
  $('#btnHub').onclick=function(){ renderHub(); show('scr-hub'); };

  window.addEventListener('keydown', function(e){
    var ae=document.activeElement;
    if(ae && (ae.tagName==='INPUT' || ae.id==='casio' || (czEl && czEl.contains(ae)))) return;
    if($('#stopModal').classList.contains('on')) return;
    if(document.getElementById('unlockModal') && document.getElementById('unlockModal').classList.contains('on')) return;
    if(document.getElementById('resumeModal') && document.getElementById('resumeModal').classList.contains('on')) return;
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
/* Hide the floating WhatsApp button during duels and games */
(function(){
  var w=document.getElementById('waFloat');
  if(!w) return;
  setInterval(function(){
    var d=document.getElementById('scr-ghost-duel');
    var g=document.getElementById('scr-game');
    var hide=(d && d.classList.contains('on')) || (g && g.classList.contains('on'));
    w.style.display=hide? 'none':'';
  }, 700);
})();