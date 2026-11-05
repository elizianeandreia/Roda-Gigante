var svgHeroi = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 C35 10 25 20 25 35 C25 45 35 55 50 55 C65 55 75 45 75 35 C75 20 65 10 50 10 Z" fill="#fcd34d"/><path d="M25 35 C20 15 40 5 50 15 C60 5 80 15 75 35 C70 25 60 20 50 20 C40 20 30 25 25 35 Z" fill="#047857"/><circle cx="40" cy="35" r="5" fill="#0f172a"/><circle cx="60" cy="35" r="5" fill="#0f172a"/><path d="M45 45 Q50 50 55 45" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/><path d="M30 55 L20 90 L80 90 L70 55 Z" fill="#10b981"/><path d="M35 55 L50 70 L65 55 Z" fill="#ecfdf5"/><rect x="45" y="65" width="10" height="20" rx="3" fill="#fcd34d"/><path d="M65 55 L85 35 L80 30 L60 50 Z" fill="#fcd34d"/><path d="M15 55 L5 35 L10 30 L20 50 Z" fill="#fcd34d"/></svg>`;
var svgVilao = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 C30 10 20 30 20 50 C20 70 30 90 50 90 C70 90 80 70 80 50 C80 30 70 10 50 10 Z" fill="#1e293b"/><path d="M20 50 C10 20 30 5 50 15 C70 5 90 20 80 50 C75 40 65 30 50 30 C35 30 25 40 20 50 Z" fill="#991b1b"/><circle cx="40" cy="45" r="7" fill="#ef4444"/><circle cx="60" cy="45" r="7" fill="#ef4444"/><path d="M40 45 L60 45" stroke="#ef4444" stroke-width="3"/><path d="M35 60 L50 75 L65 60 Z" fill="#0f172a"/><path d="M30 50 L15 80 L35 75 Z" fill="#0f172a"/><path d="M70 50 L85 80 L65 75 Z" fill="#0f172a"/><path d="M65 50 L85 40 L80 35 L60 45 Z" fill="#64748b"/><path d="M35 50 L15 40 L20 35 L40 45 Z" fill="#64748b"/></svg>`;

var powerUps = {
  tempo: { icon: '⏱️', color: 'powerup', action: function() { tempoRestante += 3000; mostrarFeedback(roda, '+3s', 'positivo'); } },
  vida: { icon: '❤️', color: 'powerup', action: function() { vidas++; mostrarFeedback(roda, '+1 Vida', 'positivo'); } },
  escudo: { icon: '🛡️', color: 'powerup', action: function() { escudoAtivo = true; mostrarFeedback(roda, 'Escudo!', 'positivo'); } }
};

var config = {
  facil: { vidas: 5, tempo: 10000, numHerois: 3, numViloes: 1 },
  normal: { vidas: 3, tempo: 8000, numHerois: 4, numViloes: 2 },
  dificil: { vidas: 2, tempo: 6000, numHerois: 4, numViloes: 3 }
};
var dificuldade = 'normal';

var cabinesData = [];
var pontos = 0, vidas = 3, nivel = 1, resgatados = 0, combo = 1;
var jogando = false, pausado = false, rodadaTimer = null;
var tempoRestante = 0, duracaoRodada = 8000;
var recorde = parseInt(localStorage.getItem('rescue_ride_record') || '0');
var escudoAtivo = false;
var somAtivo = true;
var isMobile = window.innerWidth < 768;

var roda = document.getElementById('roda');
var container = document.getElementById('game-container');
var elPontos = document.getElementById('pontos');
var elVidas = document.getElementById('vidas');
var elNivel = document.getElementById('nivel');
var elCombo = document.getElementById('combo');
var elRecorde = document.getElementById('recorde');
var timerContainer = document.getElementById('timerContainer');
var timerBar = document.getElementById('timerBar');
var modalInicio = document.getElementById('modalInicio');
var modalGameOver = document.getElementById('modalGameOver');
var modalPausa = document.getElementById('modalPausa');

var audioCtx = null;
var musicaTimer = null;
var musicaIndex = 0;
var notasMusica = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00, 261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63];

function getAudioCtx() {
  if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  return audioCtx;
}

function iniciarMusicaFundo() {
  if (!somAtivo) return;
  pararMusicaFundo();
  var ctx = getAudioCtx();
  musicaIndex = 0;
  
  function tocarProximaNota() {
    if (!jogando || pausado || !somAtivo) return;
    var freq = notasMusica[musicaIndex];
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    musicaIndex = (musicaIndex + 1) % notasMusica.length;
    musicaTimer = setTimeout(tocarProximaNota, 300);
  }
  tocarProximaNota();
}

function pararMusicaFundo() {
  if (musicaTimer) clearTimeout(musicaTimer);
}

function criarCabines() {
  var existentes = roda.querySelectorAll('.cabine');
  for (var i = 0; i < existentes.length; i++) { existentes[i].remove(); }
  cabinesData = [];
  var posicoes = [
    { right: '-11%', top: '50%' }, { right: '16%', top: '91%' }, { right: '62%', top: '91%' },
    { left: '-11%', top: '50%' }, { left: '16%', top: '6%' }, { right: '16%', top: '6%' }
  ];
  for (var i = 0; i < posicoes.length; i++) {
    (function(index) {
      var pos = posicoes[index];
      var cabine = document.createElement('div');
      cabine.className = 'cabine';
      cabine.dataset.index = String(index);
      Object.keys(pos).forEach(function(prop) { cabine.style[prop] = pos[prop]; });
      cabine.addEventListener('click', function() { handleCliqueCabine(index); });
      roda.appendChild(cabine);
      cabinesData.push({ elemento: cabine, tipo: null, resgatada: false });
    })(i);
  }
}

function distribuirPersonagens() {
  var c = config[dificuldade];
  var total = cabinesData.length;
  var numHerois = Math.max(2, c.numHerois + Math.floor(nivel / 3));
  var numViloes = Math.min(total - numHerois, c.numViloes + Math.floor(nivel / 2));
  var personagens = [];
  
  for (var i = 0; i < numHerois; i++) { personagens.push({ tipo: 'heroi' }); }
  for (var i = 0; i < numViloes; i++) { personagens.push({ tipo: 'vilao' }); }
  
  if (Math.random() < 0.3 && nivel > 1) {
    var pKeys = Object.keys(powerUps);
    var randomP = pKeys[Math.floor(Math.random() * pKeys.length)];
    personagens[Math.floor(Math.random() * personagens.length)] = { tipo: 'powerup', pType: randomP };
  }

  for (var i = personagens.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = personagens[i]; personagens[i] = personagens[j]; personagens[j] = tmp;
  }

  for (var i = 0; i < cabinesData.length; i++) {
    var cabine = cabinesData[i];
    cabine.resgatada = false;
    cabine.elemento.className = 'cabine';
    cabine.elemento.innerHTML = '';
    
    if (i < personagens.length) {
      var p = personagens[i];
      cabine.tipo = p.tipo;
      if (p.tipo === 'heroi') {
        cabine.elemento.innerHTML = svgHeroi;
        cabine.elemento.classList.add('heroi');
      } else if (p.tipo === 'vilao') {
        cabine.elemento.innerHTML = svgVilao;
        cabine.elemento.classList.add('vilao');
      } else if (p.tipo === 'powerup') {
        cabine.elemento.innerHTML = powerUps[p.pType].icon;
        cabine.elemento.classList.add('powerup');
        cabine.pType = p.pType;
      }
    } else {
      cabine.tipo = null;
    }
  }
}

function criarParticulas(x, y, cor) {
  if (isMobile) return;
  for (var i = 0; i < 8; i++) {
    var p = document.createElement('div');
    p.className = 'particle ' + cor;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    var angulo = Math.random() * Math.PI * 2;
    var velocidade = 30 + Math.random() * 60;
    p.style.setProperty('--tx', (Math.cos(angulo) * velocidade) + 'px');
    p.style.setProperty('--ty', (Math.sin(angulo) * velocidade) + 'px');
    document.body.appendChild(p);
    (function(el) { setTimeout(function() { el.remove(); }, 600); })(p);
  }
}

function handleCliqueCabine(index) {
  if (!jogando || pausado) return;
  var cabine = cabinesData[index];
  if (cabine.resgatada || !cabine.tipo) return;
  
  var rect = cabine.elemento.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;

  if (cabine.tipo === 'heroi') {
    var bonus = 10 * nivel * combo;
    pontos += bonus; resgatados++; combo++;
    if (combo > 5) combo = 5;
    if (combo === 5) container.classList.add('combo-max');
    cabine.resgatada = true;
    cabine.elemento.classList.add('resgatada');
    mostrarFeedback(cabine.elemento, '+' + bonus, 'positivo');
    criarParticulas(cx, cy, 'verde');
    tocarSom('acerto');
  } else if (cabine.tipo === 'vilao') {
    if (escudoAtivo) {
      escudoAtivo = false;
      mostrarFeedback(cabine.elemento, 'Escudo!', 'positivo');
      tocarSom('acerto');
    } else {
      vidas--; combo = 1; container.classList.remove('combo-max');
      cabine.elemento.classList.add('errada');
      (function(el) { setTimeout(function() { el.classList.remove('errada'); }, 400); })(cabine.elemento);
      mostrarFeedback(cabine.elemento, '-1', 'negativo');
      criarParticulas(cx, cy, 'vermelha');
      tocarSom('erro');
      if (navigator.vibrate) navigator.vibrate(100);
      if (vidas <= 0) { gameOver(); return; }
    }
  } else if (cabine.tipo === 'powerup') {
    powerUps[cabine.pType].action();
    cabine.resgatada = true;
    cabine.elemento.classList.add('resgatada');
    criarParticulas(cx, cy, 'verde');
  }
  atualizarHUD(); verificarFimRodada();
}

function mostrarFeedback(elemento, texto, tipo) {
  var feedback = document.createElement('div');
  feedback.className = 'feedback ' + tipo;
  feedback.textContent = texto;
  var rect = elemento.getBoundingClientRect();
  feedback.style.left = (rect.left + rect.width / 2) + 'px';
  feedback.style.top = rect.top + 'px';
  document.body.appendChild(feedback);
  setTimeout(function() { feedback.remove(); }, 1000);
}

function verificarFimRodada() {
  var restantes = cabinesData.filter(function(c) { return (c.tipo === 'heroi' || c.tipo === 'powerup') && !c.resgatada; });
  if (restantes.length === 0 && jogando && !pausado) {
    var bonus = 50 * nivel; 
    pontos += bonus;
    mostrarFeedback(roda, '+' + bonus, 'positivo'); 
    tocarSom('bonus');
    if (rodadaTimer) clearInterval(rodadaTimer);
    
    setTimeout(function() {
      if (jogando) proximaRodada();
    }, 800);
  }
}

function proximaRodada() {
  nivel++; 
  combo = 1;
  container.classList.remove('combo-max');
  duracaoRodada = Math.max(4000, config[dificuldade].tempo - (nivel - 1) * 500);
  atualizarVelocidadeRoda(); 
  distribuirPersonagens(); 
  iniciarTimerRodada(); 
  atualizarHUD();
}

function iniciarTimerRodada() {
  if (rodadaTimer) clearInterval(rodadaTimer);
  tempoRestante = duracaoRodada; 
  timerContainer.style.display = 'block'; 
  timerBar.style.width = '100%';
  timerBar.classList.remove('warning');
  
  rodadaTimer = setInterval(function() {
    if (pausado) return;
    tempoRestante -= 100;
    var pct = Math.max(0, (tempoRestante / duracaoRodada) * 100);
    timerBar.style.width = pct + '%';
    
    if (pct <= 25) timerBar.classList.add('warning');
    else timerBar.classList.remove('warning');

    if (tempoRestante <= 0) {
      clearInterval(rodadaTimer); 
      combo = 1;
      container.classList.remove('combo-max');
      var perdidos = cabinesData.filter(function(c) { return c.tipo === 'heroi' && !c.resgatada; }).length;
      if (perdidos > 0) {
        vidas -= perdidos; 
        mostrarFeedback(roda, '-' + perdidos, 'negativo'); 
        tocarSom('erro');
        if (vidas <= 0) { atualizarHUD(); gameOver(); return; }
      }
      atualizarHUD(); 
      proximaRodada();
    }
  }, 100);
}

function atualizarVelocidadeRoda() {
  var dur = Math.max(3, 8 - (nivel - 1) * 0.5);
  roda.style.animationDuration = dur + 's';
  for (var i = 0; i < cabinesData.length; i++) { cabinesData[i].elemento.style.animationDuration = dur + 's'; }
}

function atualizarHUD() {
  elPontos.textContent = String(pontos);
  elVidas.textContent = String(Math.max(0, vidas));
  elNivel.textContent = String(nivel);
  elCombo.textContent = 'x' + combo;
  elRecorde.textContent = String(recorde);
  
  if (combo > 1) {
    elCombo.style.color = '#fbbf24'; elCombo.style.textShadow = '0 0 15px rgba(251, 191, 36, 0.8)';
  } else {
    elCombo.style.color = '#60a5fa'; elCombo.style.textShadow = '0 0 15px rgba(96, 165, 250, 0.6)';
  }
}

function pausarJogo() {
  if (!jogando || pausado) return;
  pausado = true;
  roda.classList.remove('jogando');
  modalPausa.classList.remove('oculto');
  pararMusicaFundo();
}

function despausarJogo() {
  if (!jogando || !pausado) return;
  pausado = false;
  if (!jogando) return; 
  roda.classList.add('jogando');
  modalPausa.classList.add('oculto');
  iniciarMusicaFundo();
}

function gameOver() {
  jogando = false; pausado = false;
  if (rodadaTimer) clearInterval(rodadaTimer);
  pararMusicaFundo();
  roda.classList.remove('jogando'); 
  container.classList.remove('combo-max');
  timerContainer.style.display = 'none';
  modalPausa.classList.add('oculto');
  
  if (pontos > recorde) {
    recorde = pontos;
    localStorage.setItem('rescue_ride_record', recorde);
  }
  
  document.getElementById('finalPontos').textContent = String(pontos);
  document.getElementById('finalNivel').textContent = String(nivel);
  document.getElementById('finalRecorde').textContent = String(recorde);
  modalGameOver.classList.remove('oculto');
}

function iniciarJogo() {
  jogando = true; pausado = false;
  combo = 1; 
  roda.classList.add('jogando');
  timerContainer.style.display = 'block'; 
  distribuirPersonagens(); 
  iniciarTimerRodada(); 
  atualizarHUD();
  iniciarMusicaFundo();
}

function reiniciarJogo() {
  pontos = 0; vidas = config[dificuldade].vidas; nivel = 1; resgatados = 0; combo = 1; 
  duracaoRodada = config[dificuldade].tempo;
  escudoAtivo = false;
  atualizarVelocidadeRoda(); atualizarHUD();
  modalGameOver.classList.add('oculto'); modalInicio.classList.add('oculto'); modalPausa.classList.add('oculto');
  criarCabines(); iniciarJogo();
}

function tocarSom(tipo) {
  if (!somAtivo) return;
  try {
    var ctx = getAudioCtx(); 
    var osc = ctx.createOscillator(); 
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (tipo === 'acerto') {
      osc.frequency.value = 523; gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (tipo === 'erro') {
      osc.frequency.value = 150; osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } else if (tipo === 'bonus') {
      osc.frequency.value = 880; gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {}
}

document.querySelectorAll('.diff-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.diff-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    dificuldade = btn.dataset.diff;
  });
});

document.getElementById('iniciar').addEventListener('click', function() { 
  if (!jogando) { reiniciarJogo(); } 
  else if (pausado) { despausarJogo(); } 
  else { pausarJogo(); } 
});

document.getElementById('pausar').addEventListener('click', pausarJogo);
document.getElementById('btnDespausar').addEventListener('click', despausarJogo);

document.getElementById('reiniciar').addEventListener('click', reiniciarJogo);
document.getElementById('jogarNovamente').addEventListener('click', reiniciarJogo);

document.getElementById('comecarJogo').addEventListener('click', function() {
  modalInicio.classList.add('oculto');
  reiniciarJogo();
});

document.getElementById('toggle-som').addEventListener('click', function() {
  somAtivo = !somAtivo;
  this.style.opacity = somAtivo ? '1' : '0.4';
  if (somAtivo && jogando && !pausado) {
    iniciarMusicaFundo();
  } else {
    pararMusicaFundo();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (jogando) { pausado ? despausarJogo() : pausarJogo(); }
  }
  if (e.key === 'r' || e.key === 'R') {
    if (jogando) reiniciarJogo();
  }
});

criarCabines();
atualizarHUD();
modalGameOver.classList.add('oculto');
modalPausa.classList.add('oculto');