const rodaElement = document.getElementById("roda") as HTMLElement;
const btnIniciarElement = document.getElementById("iniciar")!;
const btnPausarElement = document.getElementById("pausar")!;
const btnTrocarCoresElement = document.getElementById("trocarCores")!;
const cabinesElements = document.querySelectorAll(".cabine");

animando = true;

btnIniciarElement.addEventListener("click", () => {
  rodaElement.style.animationPlayState = "running";
  cabinesElements.forEach(c => (c as HTMLElement).style.animationPlayState = "running");
  animando = true;
});

btnPausarElement.addEventListener("click", () => {
  rodaElement.style.animationPlayState = "paused";
  cabinesElements.forEach(c => (c as HTMLElement).style.animationPlayState = "paused");
  animando = false;
});

btnTrocarCoresElement.addEventListener("click", () => {
  const cores = ["red", "green", "blue", "orange", "cyan", "pink"];
  cabinesElements.forEach((cabine, i) => {
    (cabine as HTMLElement).style.backgroundColor = cores[i % cores.length];
  });
});
