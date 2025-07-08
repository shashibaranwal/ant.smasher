const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

let score = 0;
let ants = [];
const antSpeed = 2;
const antSpawnRate = 1000; // milliseconds

// Sound effect setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSmashSound() {
   
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; 
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square'; 
    oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    noiseSource.connect(noiseGain);
    oscillator.connect(oscGain);
    noiseGain.connect(audioCtx.destination);
    oscGain.connect(audioCtx.destination);

    noiseSource.start();
    oscillator.start();
    noiseSource.stop(audioCtx.currentTime + 0.1);
    oscillator.stop(audioCtx.currentTime + 0.1);
}

class Ant {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height - 30);
        this.dx = (Math.random() - 0.5) * antSpeed * 2;
        this.dy = (Math.random() - 0.5) * antSpeed * 2;
        this.size = 30;
        this.isAlive = true;
    }

    draw() {
        if (!this.isAlive) return;
        
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        const angle = Math.atan2(this.dy, this.dx);
        ctx.rotate(angle);

        ctx.fillStyle = '#3C2F2F';
        // Head
        ctx.beginPath();
        ctx.ellipse(0, -this.size / 3, this.size / 6, this.size / 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 3, this.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Abdomen
        ctx.beginPath();
        ctx.ellipse(0, this.size / 3, this.size / 4, this.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Legs (simple lines)
        ctx.strokeStyle = '#3C2F2F';
        ctx.lineWidth = 1;
        // Left legs
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 6);
        ctx.lineTo(-this.size / 4, -this.size / 3);
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.size / 4, 0);
        ctx.moveTo(0, this.size / 6);
        ctx.lineTo(-this.size / 4, this.size / 3);
        // Right legs
        ctx.moveTo(0, -this.size / 6);
        ctx.lineTo(this.size / 4, -this.size / 3);
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size / 4, 0);
        ctx.moveTo(0, this.size / 6);
        ctx.lineTo(this.size / 4, this.size / 3);
        ctx.stroke();

        ctx.restore();
    }

    update() {
        if (!this.isAlive) return;
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < 0 || this.x > canvas.width - this.size) {
            this.dx = -this.dx;
        }
        if (this.y < 0 || this.y > canvas.height - this.size) {
            this.dy = -this.dy;
        }
    }
}

function spawnAnt() {
    ants.push(new Ant());
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    ants.forEach(ant => {
        if (ant.isAlive) {
            const dist = Math.sqrt((mouseX - (ant.x + ant.size / 2)) ** 2 + (mouseY - (ant.y + ant.size / 2)) ** 2);
            if (dist < ant.size / 2) {
                ant.isAlive = false;
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                playSmashSound(); 
            }
        }
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ants = ants.filter(ant => ant.isAlive); 
    ants.forEach(ant => {
        ant.update();
        ant.draw();
    });
    requestAnimationFrame(updateGame);
}

canvas.addEventListener('click', handleClick);

setInterval(spawnAnt, antSpawnRate);

updateGame();