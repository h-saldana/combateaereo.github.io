const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let enemigos = [];
let tiempoSpawn = 0;
let explosiones = [];
let score = 0;
let tiempo = 60; // segundos
let intervaloTiempo;



function crearEnemigo() {
    const size = 40;
    enemigos.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        velocidadY: 2,
        velocidadX: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5)
    });
}

function colision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + 5 > b.x &&
        a.y < b.y + b.height &&
        a.y + 15 > b.y
    );
}

const imgAvion = new Image();
imgAvion.src = "assets/img/airplane-svgrepo-com.svg"; // Cambia la ruta a la imagen del avión

const imgEnemigo = new Image();
imgEnemigo.src = "assets/img/airplane-black-shape-svgrepo-com.svg"; // Cambia por tu imagen real


let avion = { x: canvas.width / 2, y: canvas.height - 50, width: 50, height: 50 };
let balas = [];

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") avion.x -= 20;
    if (event.key === "ArrowRight") avion.x += 20;
    if(event.key === "ArrowUp") avion.y -= 20;
    if(event.key === "ArrowDown") avion.y += 20;
    if (event.key === " ") disparar();
});

function disparar() {
    balas.push({ x: avion.x + avion.width / 2, y: avion.y, velocidadY: -5 });
}


// Mandos para mobile:
// Movimiento
document.getElementById("btnUp").addEventListener("touchstart", () => avion.y -=20);
// document.getElementById("btnUp").addEventListener("touchend", () => avion.y +=20);

document.getElementById("btnDown").addEventListener("touchstart", () => avion.y +=20);
// document.getElementById("btnDown").addEventListener("touchend", () => avion.y -=20);

document.getElementById("btnLeft").addEventListener("touchstart", () => avion.x -=20);
// document.getElementById("btnLeft").addEventListener("touchend", () => avion.x +=20);

document.getElementById("btnRight").addEventListener("touchstart", () => avion.x +=20);
// document.getElementById("btnRight").addEventListener("touchend", () => avion.x -=20);

// Disparo
document.getElementById("btnShoot").addEventListener("touchstart", () => disparar());


let juegoIniciado = false;

document.addEventListener("keydown", (event) => {
    // 👉 1. INICIAR EL JUEGO (popup inicial)
    if (!juegoIniciado 
        // && document.getElementById("popup").style.display !== "none"
        // && event.key === "Enter") 
        
        && window.getComputedStyle(document.getElementById("popup")).display !== "none"
        && event.key === "Enter"){
        document.getElementById("popup").style.display = "none";
        juegoIniciado = true;

         // ⏱️ Iniciar cuenta regresiva
        intervaloTiempo = setInterval(() => {
            tiempo--;
            if (tiempo <= 0) {
                tiempo = 0;
                gameOver();
            }
        }, 1000);

        actualizar(); // iniciar el juego recién aquí
    }

    // 👉 2. REINICIAR EL JUEGO (popup GAME OVER)
    if (!juegoIniciado 
        // && document.getElementById("gameOverPopup").style.display == "flex"
        // && event.key === "Enter") {
        && window.getComputedStyle(document.getElementById("gameOverPopup")).display === "flex"
        && event.key === "Enter") {
        location.reload();
    }
});



function actualizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Mostrar puntaje
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Puntos: " + score, 20, 40);
        // Mostrar tiempo
    ctx.fillText("Tiempo: " + tiempo, 20, 70);


    // Dibujar avión
    ctx.drawImage(imgAvion, avion.x, avion.y, avion.width, avion.height);

    // --- BALAS ---
    ctx.fillStyle = "red";
    balas.forEach((bala, iBala) => {
        bala.y += bala.velocidadY;
        ctx.fillRect(bala.x, bala.y, 5, 15);

        if (bala.y < 0) balas.splice(iBala, 1);
    });

    // --- ENEMIGOS ---
    tiempoSpawn++;
    if (tiempoSpawn > 60) { // cada 1 segundo aprox
        crearEnemigo();
        tiempoSpawn = 0;
    }

    enemigos.forEach((enemigo, iEnemigo) => {
        enemigo.y += enemigo.velocidadY;

        enemigo.x += enemigo.velocidadX;

        // Rebote lateral
        if (enemigo.x <= 0 || enemigo.x + enemigo.width >= canvas.width) {
            enemigo.velocidadX *= -1;
        }

        // ctx.fillRect(enemigo.x, enemigo.y, enemigo.width, enemigo.height);
        ctx.drawImage(imgEnemigo, enemigo.x, enemigo.y, enemigo.width, enemigo.height);
        // Eliminar enemigos que salen de pantalla
        if (enemigo.y > canvas.height) enemigos.splice(iEnemigo, 1);

        // Colisión con balas
        balas.forEach((bala, iBala) => {
            if (colision(bala, enemigo)) {
                explosiones.push({
                    x: enemigo.x,
                    y: enemigo.y,
                    frame: 0
                    
                });

                score +=100; // sumar puntos.

                enemigos.splice(iEnemigo, 1);
                balas.splice(iBala, 1);
            }
        });
        

        explosiones.forEach((exp, i) => {
            ctx.fillStyle = `rgba(255, ${100 + exp.frame * 10}, 0, ${1 - exp.frame / 10})`;
            ctx.beginPath();
            ctx.arc(exp.x + 20, exp.y + 20, exp.frame * 4, 0, Math.PI * 2);
            ctx.fill();

            exp.frame++;
            if (exp.frame > 10) explosiones.splice(i, 1);
        });


    });

    requestAnimationFrame(actualizar);
}

function gameOver() {
    clearInterval(intervaloTiempo);

    // Mostrar popup
    document.getElementById("gameOverPopup").style.display = "flex";
    document.getElementById("finalScore").textContent = score;

    // Detener el juego
    juegoIniciado = false;
}



// actualizar();