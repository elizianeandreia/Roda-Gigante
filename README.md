# Rescue Ride 🎡

Um jogo arcade interativo construído com HTML, CSS e JavaScript puro. O objetivo é resgatar heróis presos em uma roda-gigante antes que o tempo acabe, evitando os vilões e buscando a maior pontuação possível.

## Funcionalidades

- **Jogabilidade Arcade:** Clique nos heróis para ganhar pontos e evite os vilões.
- **Sistema de Combos:** Resgates consecutivos multiplicam sua pontuação (até x5).
- **Recorde Salvo:** Sua maior pontuação é salva no navegador (LocalStorage).
- **Dificuldades:** Escolha entre Fácil, Normal e Difícil, alterando vidas e tempo.
- **Power-ups:** Colete itens especiais que aparecem aleatoriamente (Tempo, Vida, Escudo).
- **Pausa Real:** O botão de pausa congela o tempo e a roda, exibindo um menu.
- **Efeitos e Sons:** Partículas de impacto, áudio sintetizado (via Web Audio API) e vibração no celular.
- **Atalhos de Teclado:** Pressione `Espaço` para pausar/despausar e `R` para reiniciar.

## Tecnologias Utilizadas

- HTML5
- CSS3 (Variáveis, animações, Keyframes)
- JavaScript (Vanilla, manipulação de DOM, Web Audio API)
- SVG (Para os personagens, garantindo nitidez em qualquer tela)

## Como Jogar

1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Escolha a dificuldade e clique em "Começar".
3. Clique nos escudos (heróis) para resgatá-los e nos itens brilhantes para ganhar bônus.
4. Evite as caveiras (vilões).
5. Resgate todos os heróis antes que a barra de tempo chegue a zero.

## Estrutura do Projeto

```text
Rescue_Ride/
├── index.html
├── estilo.css
├── script.js
└── README.md
