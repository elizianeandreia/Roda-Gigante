

var HEROIDES = ['🦸', '🧑‍🚒', '👷', '🧑‍🎤', '👨‍🚀', '🧙', '🦹‍♀️', '👮'];
var VILAOES = ['👾', '🦹', '🧟', '👹', '💀', '🤖', '👻', '🧛'];

var cabinesData = [];
var pontos = 0;
var vidas = 3;
var nivel = 1;
var resgatados = 0;
var jogando = false;
var rodadaTimer = null;
var tempoRestante = 0;
var duracaoRodada = 8000;


var roda = document.getElementById('roda');
var btnIniciar = document.getElementById('iniciar');
var btnPausar = document.getElementById('pausar');
var btnReiniciar = document.getElementById('reiniciar');
var elPontos = document.getElementById('pontos');
var elVidas = document.getElementById('vidas');
var elNivel = document.getElementById('nivel');
var elResgatados = document.getElementById('resgatados');
var modalGameOver = document.getElementById('modalGameOver');
var modalInicio = document.getElementById('modalInicio');
var btnJogarNovamente = document.getElementById('jogarNovamente');
var btnComecar = document.getElementById('comecarJogo');
var timerContainer = document.getElementById('timerContainer');
var timerBar = document.getElementById('timerBar');


function criarCabines() {
  var existentes = roda.querySelectorAll('.cabine');
  for (var i = 0; i < existentes.length; i++) {
    existentes[i].remove();
  }

  cabinesData = [];
  var posicoes = [
    { right: '-9%', top: '50%' },
    { right: '17%', top: '93%' },
    { right: '67%', top: '93%' },
    { left: '-9%', top: '50%' },
    { left: '17%', top: '7%' },
    { right: '17%', top: '7%' }
  ];

  for (var i = 0; i < posicoes.length; i++) {
    (function(index) {
      var pos = posicoes[index];
      var cabine = document.createElement('div');
      cabine.className = 'cabine';
      cabine.dataset.index = String(index);
      Object.keys(pos).forEach(function(prop) {
        cabine.style[prop] = pos[prop];
      });
      cabine.addEventListener('click', function() {
        handleCliqueCabine(index);
      });
      roda.appendChild(cabine);
      cabinesData.push({
        elemento: cabine,
        personagem: null,
        tipo: null,
        resgatada: false
      });
    })(i);
  }
}


function distribuirPersonagens() {
  var total = cabinesData.length;
  var numHerois = Math.max(2, Math.floor(total * 0.5) + Math.floor(nivel / 3));
  var numViloes = Math.min(total - numHerois, 1 + Math.floor(nivel / 2));
  var personagens = [];

  for (var i = 0; i < numHerois; i++) {
    personagens.push({
      char: HEROIDES[Math.floor(Math.random() * HEROIDES.length)],
      tipo: 'heroi'
    });
  }
  for (var i = 0; i < numViloes; i++) {
    personagens.push({
      char: VILAOES[Math.floor(Math.random() * VILAOES.length)],
      tipo: 'vilao'
    });
  }


  for (var i = personagens.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = personagens[i];
    personagens[i] = personagens[j];
    personagens[j] = tmp;
  }

  for (var i = 0; i < cabinesData.length; i++) {
    var cabine = cabinesData[i];
    cabine.resgatada = false;
    cabine.elemento.classList.remove('resgatada', 'heroi', 'vilao', 'errada');
    if (i < personagens.length) {
      cabine.personagem = personagens[i].char;
      cabine.tipo = personagens[i].tipo;
      cabine.elemento.textContent = personagens[i].char;
      cabine.elemento.classList.add(personagens[i].tipo);
    } else {
      cabine.personagem = null;
      cabine.tipo = null;
      cabine.elemento.textContent = '';
    }
  }
}


function handleCliqueCabine(index) {
  if (!jogando) return;
  var cabine = cabinesData[index];
  if (cabine.resgatada || !cabine.tipo) return;

  if (cabine.tipo === 'heroi') {
    var bonus = 10 * nivel;
    pontos += bonus;
    resgatados++;
    cabine.resgatada = true;
    cabine.elemento.classList.add('resgatada');
    mostrarFeedback(cabine.elemento, '+' + bonus, 'positivo');
    tocarSom('acerto');
  } else if (cabine.tipo === 'vilao') {
    vidas--;
    cabine.elemento.classList.add('errada');
    (function(el) {
      setTimeout(function() {
        el.classList.remove('errada');
      }, 400);
    })(cabine.elemento);
    mostrarFeedback(cabine.elemento, '-1 ❤️', 'negativo');
    tocarSom('erro');
    if (vidas <= 0) {
      gameOver();
      return;
    }
  }
  atualizarHUD();
  verificarFimRodada();
}


function mostrarFeedback(elemento, texto, tipo) {
  var feedback = document.createElement('div');
  feedback.className = 'feedback ' + tipo;
  feedback.textContent = texto;
  var rect = elemento.getBoundingClientRect();
  feedback.style.left = (rect.left + rect.width / 2) + 'px';
  feedback.style.top = rect.top + 'px';
  document.body.appendChild(feedback);
  setTimeout(function() {
    feedback.remove();
  }, 1000);
}


function verificarFimRodada() {
  var restantes = cabinesData.filter(function(c) {
    return c.tipo === 'heroi' && !c.resgatada;
  });
  if (restantes.length === 0) {
    var bonus = 50 * nivel;
    pontos += bonus;
    mostrarFeedback(roda, '🎉 +' + bonus, 'positivo');
    tocarSom('bonus');
    proximaRodada();
  }
}


function proximaRodada() {
  nivel++;
  duracaoRodada = Math.max(4000, 8000 - (nivel - 1) * 500);
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

  rodadaTimer = setInterval(function() {
    tempoRestante -= 100;
    var pct = Math.max(0, (tempoRestante / duracaoRodada) * 100);
    timerBar.style.width = pct + '%';

    if (tempoRestante <= 0) {
      clearInterval(rodadaTimer);
      var perdidos = cabinesData.filter(function(c) {
        return c.tipo === 'heroi' && !c.resgatada;
      }).length;
      if (perdidos > 0) {
        vidas -= perdidos;
        mostrarFeedback(roda, '-' + perdidos + ' ❤️', 'negativo');
        tocarSom('erro');
        if (vidas <= 0) {
          gameOver();
          return;
        }
      }
      atualizarHUD();
      proximaRodada();
    }
  }, 100);
}


function atualizarVelocidadeRoda() {
  var dur = Math.max(3, 8 - (nivel - 1) * 0.5);
  roda.style.animationDuration = dur + 's';
  for (var i = 0; i < cabinesData.length; i++) {
    cabinesData[i].elemento.style.animationDuration = dur + 's';
  }
}


function atualizarHUD() {
  elPontos.textContent = String(pontos);
  elVidas.textContent = String(Math.max(0, vidas));
  elNivel.textContent = String(nivel);
  elResgatados.textContent = String(resgatados);
}


function gameOver() {
  jogando = false;
  if (rodadaTimer) clearInterval(rodadaTimer);
  roda.classList.remove('jogando');
  timerContainer.style.display = 'none';
  document.getElementById('finalPontos').textContent = String(pontos);
  document.getElementById('finalResgatados').textContent = String(resgatados);
  document.getElementById('finalNivel').textContent = String(nivel);
  modalGameOver.classList.remove('oculto');
}


function reiniciarJogo() {
  pontos = 0;
  vidas = 3;
  nivel = 1;
  resgatados = 0;
  duracaoRodada = 8000;
  atualizarVelocidadeRoda();
  atualizarHUD();
  modalGameOver.classList.add('oculto');
  modalInicio.classList.add('oculto');
  criarCabines();
  iniciarJogo();
}


function iniciarJogo() {
  jogando = true;
  roda.classList.add('jogando');
  timerContainer.style.display = 'block';
  distribuirPersonagens();
  iniciarTimerRodada();
  atualizarHUD();
}


var audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function tocarSom(tipo) {
  try {
    var ctx = getAudioCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (tipo === 'acerto') {
      osc.frequency.value = 523;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (tipo === 'erro') {
      osc.frequency.value = 150;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (tipo === 'bonus') {
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {}
}


btnIniciar.addEventListener('click', function() {
  if (!jogando) {
    iniciarJogo();
  } else {
    roda.classList.add('jogando');
  }
});

btnPausar.addEventListener('click', function() {
  roda.classList.remove('jogando');
});

btnReiniciar.addEventListener('click', reiniciarJogo);

btnJogarNovamente.addEventListener('click', reiniciarJogo);

btnComecar.addEventListener('click', function() {
  console.log('Botão Começar clicado!');
  modalInicio.classList.add('oculto');
  criarCabines();
  iniciarJogo();
});


criarCabines();
atualizarHUD();
modalGameOver.classList.add('oculto');