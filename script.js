const revealItems = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const canvas = document.getElementById("motionField");
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let points = [];
let rafId = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const pointCount = Math.max(22, Math.floor((width * height) / 52000));
  points = Array.from({ length: pointCount }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    base: Math.random() * Math.PI * 2,
    speed: 0.0018 + Math.random() * 0.0026,
    amp: 16 + Math.random() * 44,
    color: index % 3 === 0 ? "63, 224, 207" : index % 3 === 1 ? "247, 166, 59" : "214, 88, 168"
  }));
}

function draw(time) {
  context.clearRect(0, 0, width, height);

  points.forEach((point, index) => {
    const pulse = Math.sin(time * point.speed + point.base);
    const x = point.x + Math.cos(point.base + pulse) * point.amp;
    const y = point.y + Math.sin(point.base - pulse) * point.amp;

    context.beginPath();
    context.arc(x, y, 1.4, 0, Math.PI * 2);
    context.fillStyle = `rgba(${point.color}, 0.52)`;
    context.fill();

    for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
      const next = points[nextIndex];
      const nx = next.x + Math.cos(next.base + Math.sin(time * next.speed)) * next.amp;
      const ny = next.y + Math.sin(next.base - Math.sin(time * next.speed)) * next.amp;
      const distance = Math.hypot(x - nx, y - ny);

      if (distance < 150) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(nx, ny);
        context.strokeStyle = `rgba(${point.color}, ${0.12 * (1 - distance / 150)})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }
  });

  rafId = requestAnimationFrame(draw);
}

function startMotion() {
  cancelAnimationFrame(rafId);
  resizeCanvas();

  if (!reducedMotion.matches) {
    rafId = requestAnimationFrame(draw);
  }
}

window.addEventListener("resize", resizeCanvas);
reducedMotion.addEventListener("change", startMotion);
startMotion();
