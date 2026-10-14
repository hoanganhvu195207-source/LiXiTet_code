document.addEventListener('DOMContentLoaded', () => {
    initFanDisplay();
    setupModal();
    setupRevealUI();
    setupMenu();
});

let fanImages = [];
let fanContainer = null;
const frontImages = [
    'style/img/front_1.jpg',
    'style/img/front_2.jpg',
    'style/img/front_3.jpg',
    'style/img/front_4.jpg',
    'style/img/front_5.jpg'
];

const backImages = [
    'style/img/back_1.jpg',
    'style/img/back_2.jpg',
    'style/img/back_3.jpg',
    'style/img/back_4.jpg',
    'style/img/back_5.jpg'
];

const moneyList = [
    {
        src: 'style/img/money/5k.jpg',
        amount: '5.000 VNĐ',
        wish: 'Chúc bạn năm mới tiền vào như nước, vạn sự hanh thông, luôn rạng rỡ tiếng cười!'
    },
    {
        src: 'style/img/money/10k.jpg',
        amount: '10.000 VNĐ',
        wish: 'Chúc bạn một năm mới bình an, sức khỏe dồi dào, học hành tấn tới, vạn sự cát tường!'
    },
    {
        src: 'style/img/money/20k.jpg',
        amount: '20.000 VNĐ',
        wish: 'Chúc bạn đong cho đầy hạnh phúc, gói cho trọn lộc tài, giữ cho mãi an khang!'
    },
    {
        src: 'style/img/money/50k.jpg',
        amount: '50.000 VNĐ',
        wish: 'Chúc bạn phát tài phát lộc, thăng quan tiến chức, tình duyên phơi phới, vạn điều may mắn!'
    },
    {
        src: 'style/img/money/100k.jpg',
        amount: '100.000 VNĐ',
        wish: 'Đại cát đại lợi! Chúc bạn cả năm tiền bạc rủng rỉnh, tỷ sự như mơ, triệu điều bất ngờ!'
    }
];

// Weighted Probabilities: 5k(10%), 10k(10%), 20k(30%), 50k(30%), 100k(20%)
let probabilities = [10, 10, 30, 30, 20];

let currentMoneyIdx = 0;
let fireworksInterval = null;
let currentSelectedCard = null;

// ==========================================
// Web Audio API Sound Effects (Crisp & Smooth)
// ==========================================
const AudioFx = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    playPick() {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    },
    playFlip() {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(540, now + 0.25);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {}
    },
    playFanfare() {
        try {
            this.init();
            if (!this.ctx) return;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const now = this.ctx.currentTime + (idx * 0.08);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.45);
            });
        } catch (e) {}
    }
};

function getWeightedRandomMoneyIdx() {
    const random = Math.random() * 100;
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] <= 0) continue;
        cumulative += probabilities[i];
        if (random < cumulative) {
            return i;
        }
    }
    for (let i = probabilities.length - 1; i >= 0; i--) {
        if (probabilities[i] > 0) return i;
    }
    return 0;
}

// ==========================================
// Fan Display Generation & Smooth Selection
// ==========================================
function initFanDisplay() {
    fanContainer = document.createElement('div');
    fanContainer.className = 'fan-container';
    fanContainer.id = 'fan-container';
    document.body.appendChild(fanContainer);

    const count = 10;
    createCards(fanContainer, count, 95);
}

function createCards(container, count, spreadAngle) {
    container.innerHTML = '';
    fanImages = [];

    const step = count > 1 ? spreadAngle / (count - 1) : 0;
    const startAngle = -(spreadAngle / 2);

    for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        const imgIdx = Math.floor(Math.random() * frontImages.length);
        const moneyIdx = getWeightedRandomMoneyIdx();

        img.src = frontImages[imgIdx];
        img.dataset.imgIdx = imgIdx;
        img.dataset.moneyIdx = moneyIdx;
        img.className = 'fan-image';
        img.alt = 'Phong bao Lì Xì';

        const angle = startAngle + (i * step);
        img.style.setProperty('--fan-angle', `${angle}deg`);
        img.style.zIndex = i;

        container.appendChild(img);
        fanImages.push({ element: img, currentZ: i });

        img.addEventListener('click', () => {
            if (container.classList.contains('has-picked')) return;
            AudioFx.playPick();

            container.classList.add('has-picked');
            img.classList.add('selected');

            setTimeout(() => {
                openCardModal(img.src, img.dataset.imgIdx, img.dataset.moneyIdx, img);
            }, 360);
        });

        // Staggered smooth entrance
        setTimeout(() => {
            img.classList.add('loaded');
        }, 40 * i);
    }
}

// ==========================================
// Card Modal & Smooth Interactive Pull
// ==========================================
let pullProgress = 0;
let pullAnimationId = null;
let isHolding = false;
let startTouchY = null;

function setupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'card-modal';

    modal.innerHTML = `
        <div class="modal-content-wrapper">
            <div class="flip-card" id="modal-flip-card">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <img id="modal-front-img" src="" alt="Mặt trước bao lì xì">
                        <div class="shine-overlay"></div>
                    </div>
                    <!-- Money banknote tucked inside the envelope -->
                    <img id="modal-money-img" class="money-img" src="" alt="Tiền lì xì">
                    <div class="flip-card-back">
                        <img id="modal-back-img" src="" alt="Mặt sau bao lì xì">
                        <div class="shine-overlay"></div>
                    </div>
                </div>
            </div>

            <div class="pull-instruction" id="pull-instruction">
                <div class="pull-arrow"><i class="fa-solid fa-angles-up"></i></div>
                <div class="instruction-text">Ấn giữ hoặc vuốt lên để rút lì xì</div>
                <div class="hold-progress-bar">
                    <div class="hold-progress-fill" id="hold-progress-fill"></div>
                </div>
                <div class="close-modal-hint" id="close-modal-hint">Nhấp ra ngoài để đóng</div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'close-modal-hint') {
            closeCardModal();
        }
    });

    const flipCard = modal.querySelector('.flip-card');
    const moneyImg = modal.querySelector('#modal-money-img');
    const backEnv = modal.querySelector('.flip-card-back');
    const progressFill = modal.querySelector('#hold-progress-fill');

    function updatePullVisuals(p) {
        pullProgress = Math.max(0, Math.min(1, p));
        progressFill.style.width = `${pullProgress * 100}%`;

        // Smooth continuous displacement:
        // Envelope glides down 65px while the money emerges upward 130px
        const envOffset = pullProgress * 65;
        const moneyOffset = -(pullProgress * 130);
        const moneyScale = 1 + (pullProgress * 0.08);

        backEnv.style.setProperty('--env-offset', `${envOffset}px`);
        moneyImg.style.setProperty('--money-offset', `${moneyOffset}px`);
        moneyImg.style.setProperty('--money-scale', moneyScale);
    }

    function stepPullProgress() {
        if (!isHolding) return;
        // Smoothly reach 100% in ~1.1 seconds (60fps)
        pullProgress += 0.016;
        updatePullVisuals(pullProgress);

        if (pullProgress >= 1) {
            isHolding = false;
            cancelAnimationFrame(pullAnimationId);
            AudioFx.playFanfare();
            if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
            triggerFinalReveal();
        } else {
            pullAnimationId = requestAnimationFrame(stepPullProgress);
        }
    }

    function smoothDecayProgress() {
        if (isHolding || pullProgress <= 0) return;
        pullProgress -= 0.04;
        if (pullProgress < 0) pullProgress = 0;
        updatePullVisuals(pullProgress);

        if (pullProgress > 0) {
            requestAnimationFrame(smoothDecayProgress);
        }
    }

    const startPull = (e) => {
        if (!flipCard.classList.contains('flipped')) return;
        isHolding = true;
        cancelAnimationFrame(pullAnimationId);
        if (e.touches && e.touches[0]) {
            startTouchY = e.touches[0].clientY;
        } else if (e.clientY) {
            startTouchY = e.clientY;
        }
        pullAnimationId = requestAnimationFrame(stepPullProgress);
    };

    const handleMove = (e) => {
        if (!isHolding || startTouchY === null) return;
        const currentY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
        const deltaY = startTouchY - currentY; // Upward drag is positive
        if (deltaY > 15) {
            const dragProgress = Math.min(1, deltaY / 120);
            if (dragProgress > pullProgress) {
                updatePullVisuals(dragProgress);
                if (dragProgress >= 1) {
                    isHolding = false;
                    cancelAnimationFrame(pullAnimationId);
                    AudioFx.playFanfare();
                    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
                    triggerFinalReveal();
                }
            }
        }
    };

    const endPull = () => {
        if (!isHolding) return;
        isHolding = false;
        startTouchY = null;
        cancelAnimationFrame(pullAnimationId);
        if (pullProgress < 1) {
            requestAnimationFrame(smoothDecayProgress);
        }
    };

    // Desktop Mouse Events
    flipCard.addEventListener('mousedown', startPull);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', endPull);

    // Mobile Touch Events
    flipCard.addEventListener('touchstart', (e) => {
        startPull(e);
    }, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', endPull);
    window.addEventListener('touchcancel', endPull);
}

function openCardModal(frontSrc, imgIdx, moneyIdx, cardElement) {
    const modal = document.getElementById('card-modal');
    const frontImg = document.getElementById('modal-front-img');
    const backImg = document.getElementById('modal-back-img');
    const moneyImg = document.getElementById('modal-money-img');
    const flipCard = document.getElementById('modal-flip-card');
    const backEnv = modal.querySelector('.flip-card-back');
    const progressFill = document.getElementById('hold-progress-fill');

    currentSelectedCard = cardElement;
    currentMoneyIdx = parseInt(moneyIdx);

    frontImg.src = frontSrc;
    backImg.src = backImages[imgIdx];
    moneyImg.src = moneyList[currentMoneyIdx].src;

    // Reset pull state
    pullProgress = 0;
    isHolding = false;
    progressFill.style.width = '0%';
    backEnv.style.setProperty('--env-offset', '0px');
    moneyImg.style.setProperty('--money-offset', '0px');
    moneyImg.style.setProperty('--money-scale', '1');

    flipCard.classList.remove('flipped');
    modal.classList.add('active');

    // Smooth Flip after 550ms
    setTimeout(() => {
        if (modal.classList.contains('active')) {
            flipCard.classList.add('flipped');
            AudioFx.playFlip();
        }
    }, 550);
}

function closeCardModal() {
    const modal = document.getElementById('card-modal');
    modal.classList.remove('active');

    if (fanContainer) {
        fanContainer.classList.remove('has-picked');
    }

    if (currentSelectedCard) {
        setTimeout(() => {
            currentSelectedCard.classList.remove('selected');
            currentSelectedCard = null;
        }, 400);
    }
}

// ==========================================
// Final Grand Reveal UI
// ==========================================
function setupRevealUI() {
    const revealContainer = document.createElement('div');
    revealContainer.className = 'reveal-container';
    revealContainer.id = 'reveal-container';

    revealContainer.innerHTML = `
        <div class="close-reveal-btn" id="close-reveal-x" title="Đóng">&times;</div>
        <div class="reveal-card-wrapper">
            <span class="reveal-badge">🧧 LỘC XUÂN NHƯ Ý 🧧</span>
            <h2 class="reveal-title">Chúc Mừng Năm Mới!</h2>
            <div class="reveal-money-wrapper">
                <img class="revealed-money" id="final-money-img" src="" alt="Tiền Lì Xì">
            </div>
            <div class="reveal-amount" id="reveal-amount">0 VNĐ</div>
            <p class="reveal-wishes" id="reveal-wishes">Vạn sự như ý - Tấn tài tấn lộc!</p>
            <div class="reveal-actions">
                <button class="btn-tet" id="btn-pick-again">
                    <i class="fa-solid fa-rotate-right me-2"></i>Bốc Tiếp Bao Khác
                </button>
                <button class="btn-tet btn-secondary-tet" id="btn-close-reveal">
                    Đóng
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(revealContainer);

    const closeAll = () => {
        revealContainer.classList.remove('active');
        if (fireworksInterval) {
            clearInterval(fireworksInterval);
            fireworksInterval = null;
        }
        closeCardModal();
    };

    revealContainer.querySelector('#close-reveal-x').addEventListener('click', closeAll);
    revealContainer.querySelector('#btn-close-reveal').addEventListener('click', closeAll);

    // Pick again resets the fan and randomizes cards
    revealContainer.querySelector('#btn-pick-again').addEventListener('click', () => {
        revealContainer.classList.remove('active');
        if (fireworksInterval) {
            clearInterval(fireworksInterval);
            fireworksInterval = null;
        }
        closeCardModal();

        // Re-randomize fan cards smoothly
        setTimeout(() => {
            if (fanContainer) {
                createCards(fanContainer, 10, 95);
            }
        }, 450);
    });
}

function triggerFinalReveal() {
    const revealContainer = document.getElementById('reveal-container');
    const finalImg = document.getElementById('final-money-img');
    const amountEl = document.getElementById('reveal-amount');
    const wishesEl = document.getElementById('reveal-wishes');

    const item = moneyList[currentMoneyIdx] || moneyList[0];
    finalImg.src = item.src;
    amountEl.textContent = item.amount;
    wishesEl.textContent = item.wish;

    revealContainer.classList.add('active');

    // Continuous Colorful Fireworks & Confetti
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 4000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    if (fireworksInterval) clearInterval(fireworksInterval);

    fireworksInterval = setInterval(function () {
        const particleCount = 28;
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 }
        }));
    }, 280);

    // Initial festive burst
    confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 4000
    });

    if (currentSelectedCard) {
        currentSelectedCard.dataset.moneyIdx = getWeightedRandomMoneyIdx();
    }
}

// ==========================================
// Secret Menu & Audio Control
// ==========================================
function setupMenu() {
    const menuContainer = document.getElementById('menu-container');
    const menuTrigger = document.getElementById('menu-trigger');
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');

    // Long Press logic for "Bắt"
    let longPressTimer;
    const LONG_PRESS_DURATION = 2000;

    const startLongPress = () => {
        longPressTimer = setTimeout(() => {
            showRandomMoneyInMenu();
            menuTrigger.classList.remove('holding');
        }, LONG_PRESS_DURATION);
        menuTrigger.classList.add('holding');
    };

    const cancelLongPress = () => {
        clearTimeout(longPressTimer);
        menuTrigger.classList.remove('holding');
    };

    // Desktop
    menuTrigger.addEventListener('mousedown', startLongPress);
    menuTrigger.addEventListener('mouseup', cancelLongPress);
    menuTrigger.addEventListener('mouseleave', cancelLongPress);

    // Mobile
    menuTrigger.addEventListener('touchstart', (e) => {
        startLongPress(e);
    });
    menuTrigger.addEventListener('touchend', cancelLongPress);
    menuTrigger.addEventListener('touchcancel', cancelLongPress);
    menuTrigger.addEventListener('contextmenu', (e) => e.preventDefault());

    // Menu Toggle
    menuTrigger.addEventListener('click', () => {
        menuContainer.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContainer.contains(e.target)) {
            menuContainer.classList.remove('active');
        }
    });

    // Music Toggle
    let isPlaying = false;
    bgMusic.currentTime = 15;
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioFx.init();
        const icon = musicToggle.querySelector('i');

        if (isPlaying) {
            bgMusic.pause();
            icon.className = 'fa-solid fa-volume-xmark';
            isPlaying = false;
        } else {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    icon.className = 'fa-solid fa-volume-high';
                    isPlaying = true;
                }).catch(error => {
                    console.log("Audio autoplay prevented by browser:", error);
                    icon.className = 'fa-solid fa-volume-xmark';
                    isPlaying = false;
                });
            }
        }
    });
}

function showRandomMoneyInMenu() {
    const menuOptions = document.getElementById('menu-options');
    let moneyItem = document.getElementById('menu-random-money');

    if (!moneyItem) {
        moneyItem = document.createElement('div');
        moneyItem.id = 'menu-random-money';
        moneyItem.className = 'menu-item money-reveal';
        menuOptions.appendChild(moneyItem);
    }

    const randomIdx = Math.floor(Math.random() * moneyList.length);
    const item = moneyList[randomIdx];

    moneyItem.innerHTML = `<img src="${item.src}" alt="${item.amount}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;

    document.getElementById('menu-container').classList.add('active');

    confetti({
        particleCount: 50,
        spread: 40,
        origin: { x: 0.1, y: 0.1 },
        zIndex: 3500
    });
}
