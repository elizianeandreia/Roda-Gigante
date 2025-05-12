var roda = document.getElementById("roda");
var btnIniciar = document.getElementById("iniciar");
var btnPausar = document.getElementById("pausar");
var btnTrocarCores = document.getElementById("trocarCores");
var cabines = document.querySelectorAll(".cabine");
var animando = true;
btnIniciar.addEventListener("click", function () {
    roda.style.animationPlayState = "running";
    cabines.forEach(function (c) { return c.style.animationPlayState = "running"; });
    animando = true;
});
btnPausar.addEventListener("click", function () {
    roda.style.animationPlayState = "paused";
    cabines.forEach(function (c) { return c.style.animationPlayState = "paused"; });
    animando = false;
});
btnTrocarCores.addEventListener("click", function () {
    var cores = ["red", "green", "blue", "orange", "cyan", "pink"];
    cabines.forEach(function (cabine, i) {
        cabine.style.backgroundColor = cores[i % cores.length];
    });
});
