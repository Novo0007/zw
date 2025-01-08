const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resultDiv = document.getElementById("result");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const closePopup = document.getElementById("closePopup");
const spinSound = document.getElementById("spinSound");
const congratsSound = document.getElementById("congratsSound");
const historyDiv = document.getElementById("history");

const options = [
  "₹1", "₹3", "₹5", "₹7", "₹6", "₹9", "₹10", 
  "₹1", "₹3", "₹5", "₹7", "₹6", "₹9", "₹10",  // More common options
    // Even more common options
  "₹19", "₹29", "₹99",  // Rare options
  "Better luck next time", "+1 Spin", "₹-10"
];

const numOptions = options.length;
const arcSize = (2 * Math.PI) / numOptions;
let currentAngle = 0;
let isSpinning = false;
let spinVelocity = 0;

// Fetch history from localStorage
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("spinHistory")) || [];
  historyDiv.innerHTML = "<h2>Spin History</h2>";
  history.forEach(entry => {
    const div = document.createElement("div");
    div.textContent = `You won: ${entry}`;
    historyDiv.appendChild(div);
  });
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numOptions; i++) {
    const startAngle = currentAngle + i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle, false);
    ctx.closePath();

    ctx.fillStyle = i % 2 === 0 ? "#ff5e57" : "#ffd700";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(options[i], canvas.width / 2 - 20, 10);
    ctx.restore();
  }

  drawArrow();
}

function drawArrow() {
  const arrowHeight = 20;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(currentAngle);
  ctx.beginPath();
  ctx.moveTo(0 - 10, -canvas.height / 2);
  ctx.lineTo(0 + 10, -canvas.height / 2);
  ctx.lineTo(0, -canvas.height / 2 - arrowHeight);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

function spinWheel() {
  if (isSpinning) return;

  isSpinning = true;
  spinVelocity = Math.random() * 10 + 20;
  let deceleration = 0.97;

  spinSound.play();

  const spin = setInterval(() => {
    spinVelocity *= deceleration;
    currentAngle += spinVelocity * Math.PI / 180;

    drawWheel();

    if (spinVelocity < 0.1) {
      clearInterval(spin);
      isSpinning = false;
      spinSound.pause();
      spinSound.currentTime = 0;

      const selectedIndex = Math.floor((numOptions - (currentAngle % (2 * Math.PI)) / arcSize) % numOptions);
      const result = options[selectedIndex];

      popupMessage.textContent = `You won: ${result}`;
      congratsSound.play();
      popup.classList.remove("hidden");

      // Update history and localStorage
      const history = JSON.parse(localStorage.getItem("spinHistory")) || [];
      history.push(result);
      localStorage.setItem("spinHistory", JSON.stringify(history));

      loadHistory();

      // Vibration and animation based on result
      if (result.includes("₹")) {
        const amount = parseInt(result.replace("₹", ""), 10);
        if (amount >= 29) { // Big win (₹29, ₹99)
          if (Math.random() < 0.01) {
            navigator.vibrate([500, 100, 500, 1000, 500]); // Strong vibration for big win
          } else {
            navigator.vibrate([200, 100, 200]); // Light vibration for regular win
          }
        } else {
          navigator.vibrate([200, 100, 200]); // Light vibration for regular win
        }
      }
    }
  }, 16);
}

spinButton.addEventListener("click", spinWheel);
closePopup.addEventListener("click", () => popup.classList.add("hidden"));

loadHistory();
drawWheel();
