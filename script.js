// =========================================================
//         MAI'S WORLD - GAME & PORTFOLIO SCRIPT (FIXED)
// =========================================================

// --- KHAI BÁO BIẾN TOÀN CỤC ---
const avatar = document.querySelector(".avatar");
const musicBtn = document.getElementById("music-btn");
const particleContainer = document.getElementById("particles");
const buildings = document.querySelectorAll(".building");
const hero = document.getElementById("hero");
const worldSection = document.getElementById("world");

let musicOn = false;
let isScrollingToAbout = false; // Biến cờ chặn xung đột camera khi cuộn trang
const music = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3");
music.loop = true;
music.volume = 0.1;

// Điều chỉnh tốc độ để nhân vật di chuyển đằm và đồng bộ với camera
const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    speed: 5, 
    vx: 0,
    vy: 0
};
const keys = {};
let nearbyBuilding = null; // Lưu tòa nhà hoặc hộp đang đứng gần

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// =========================================================
//     LOADING SCREEN
// =========================================================
window.addEventListener("load", () => {
    const loading = document.getElementById("loading-screen");
    const progress = document.querySelector(".progress");
    let width = 0;

    function hideLoadingScreen() {
        if (loading && loading.style.display !== "none") {
            loading.style.opacity = "0";
            setTimeout(() => { 
                loading.style.display = "none"; 
            }, 600);
        }
    }

    let interval = setInterval(() => {
        width += 5; 
        if (progress) progress.style.width = width + "%";

        if (width >= 100) {
            clearInterval(interval);
            hideLoadingScreen();
        }
    }, 20);

    setTimeout(() => {
        clearInterval(interval);
        if (progress) progress.style.width = "100%";
        hideLoadingScreen();
    }, 3000); 
});

// =========================================================
//     BACKGROUND MUSIC (ĐỒNG BỘ HIỂN THỊ GIAO DIỆN)
// =========================================================
function updateMusicButtonUI() {
    if (!musicBtn) return;
    if (musicOn) {
        musicBtn.innerHTML = "🎵 Music: ON";
        musicBtn.classList.add("playing"); 
    } else {
        musicBtn.innerHTML = "🔇 Music: OFF";
        musicBtn.classList.remove("playing");
    }
}

if (musicBtn) {
    updateMusicButtonUI();

    musicBtn.addEventListener("click", (e) => {
        e.stopPropagation(); 
        musicOn = !musicOn;
        if (musicOn) { 
            music.play()
                .then(() => updateMusicButtonUI())
                .catch(() => {
                    musicOn = false;
                    updateMusicButtonUI();
                }); 
        } else { 
            music.pause(); 
            updateMusicButtonUI();
        }
    });
}

// =========================================================
//     LOGIC CHO CÁC NÚT BẤM (BUTTONS)
// =========================================================
const startBtn = document.getElementById("startBtn");
if (startBtn) {
    startBtn.addEventListener("click", () => {
        if (!musicOn) {
            musicOn = true;
            music.play()
                .then(() => updateMusicButtonUI())
                .catch(err => console.log("Trình duyệt chặn âm thanh:", err));
        }
        if (worldSection) worldSection.scrollIntoView({ behavior: "smooth" });
    });
}

// =========================================================
//  SỬA LỖI: HÀM CUỘN TRANG ABOUT ME KHÔNG BỊ XUNG ĐỘT CSS VÀ HIỂN THỊ AVATAR
// =========================================================
function openAbout() {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
        // 1. Bật cờ khóa điều khiển vuốt/chuột ngay lập tức
        isScrollingToAbout = true; 
        
        // 2. Đưa tọa độ mục tiêu của nhân vật về vị trí trung tâm hợp lý trên khung nhìn (fixed viewport)
        // Tránh gán bằng targetPosition lớn của trục Y gốc khiến nhân vật văng khỏi màn hình
        player.x = window.innerWidth / 2 - 30;
        player.y = window.innerHeight / 2 - 30;

        // 3. Cuộn trang mượt mà bằng phương thức chuẩn của trình duyệt
        aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });

        // 4. Mở khóa điều khiển sau khi quá trình cuộn kết thúc (~1 giây)
        setTimeout(() => {
            isScrollingToAbout = false;
        }, 1000);
    }
}

// Giữ nguyên các hàm chuyển hướng trang
function openRobot() { window.location.href = "robot.html"; }
function openAdventure() { window.location.href = "adventure.html"; }
function openAI() { window.location.href = "ai.html"; }
function openAwards() { window.location.href = "awards.html"; }

window.openAbout = openAbout;
window.openRobot = openRobot;
window.openAdventure = openAdventure;
window.openAI = openAI;
window.openAwards = openAwards;

// =========================================================
//     EFFECT PARTICLES
// =========================================================
function createParticle() {
    if (!particleContainer) return;
    const p = document.createElement("div");
    p.classList.add("sparkle");
    p.style.left = Math.random() * window.innerWidth + "px";
    p.style.top = Math.random() * window.innerHeight + "px";
    p.style.animationDuration = (Math.random() * 3 + 2) + "s";
    particleContainer.appendChild(p);
    setTimeout(() => { p.remove(); }, 4000);
}
if (particleContainer) { setInterval(createParticle, 200); }

// =========================================================
//      HỆ THỐNG ĐIỀU KHIỂN KÉP (BÀN PHÍM + CHUỘT)
// =========================================================

document.addEventListener("keydown", (e) => { 
    if (isScrollingToAbout) return; // Khóa phím khi đang tự động cuộn
    keys[e.key.toLowerCase()] = true; 

    if (!musicOn) {
        musicOn = true;
        music.play()
            .then(() => updateMusicButtonUI())
            .catch(() => { musicOn = false; });
    }
});
document.addEventListener("keyup", (e) => { keys[e.key.toLowerCase()] = false; });

function updatePlayer() {
    // Nếu đang cuộn tự động, tạm dừng cập nhật vị trí bằng bàn phím
    if (!isScrollingToAbout) {
        player.vx = 0;
        player.vy = 0;

        if (keys["w"] || keys["arrowup"]) player.vy = -player.speed;
        if (keys["s"] || keys["arrowdown"]) player.vy = player.speed;
        if (keys["a"] || keys["arrowleft"]) player.vx = -player.speed;
        if (keys["d"] || keys["arrowright"]) player.vx = player.speed;

        player.x += player.vx;
        player.y += player.vy;

        player.x = Math.max(0, Math.min(window.innerWidth - 60, player.x));
        player.y = Math.max(0, Math.min(window.innerHeight - 60, player.y));
    }

    requestAnimationFrame(updatePlayer);
}
updatePlayer();

document.addEventListener("mousemove", (e) => {
    // Nếu đang trong trạng thái tự cuộn tới About Me thì bỏ qua hoàn toàn di chuyển chuột
    if (isScrollingToAbout) return;

    player.x = e.clientX - 30; 
    player.y = e.clientY - 30;

    player.x = Math.max(0, Math.min(window.innerWidth - 60, player.x));
    player.y = Math.max(0, Math.min(window.innerHeight - 60, player.y));
});

// =========================================================
//    ĐỒNG BỘ CAMERA & NHÂN VẬT MƯỢT MÀ
// =========================================================
let renderX = window.innerWidth / 2;
let renderY = window.innerHeight / 2;

function updateCameraAndPlayer() {
    // Lerp liên tục hoạt động giúp nhân vật di chuyển trượt mượt mà kể cả khi cuộn tự động
    renderX = lerp(renderX, player.x, 0.08);
    renderY = lerp(renderY, player.y, 0.08);

    if (avatar) {
        avatar.style.position = "fixed";
        avatar.style.left = renderX + "px";
        avatar.style.top = renderY + "px";
        avatar.style.zIndex = "999";
    }
    requestAnimationFrame(updateCameraAndPlayer);
}
updateCameraAndPlayer();

// =========================================================
//    KIỂM TRA ĐỨNG GẦN TÒA NHÀ HOẶC HỘP BOX MỚI
// =========================================================
const hint = document.createElement("div");
hint.style.position = "fixed";
hint.style.bottom = "40px";
hint.style.left = "50%";
hint.style.transform = "translateX(-50%)";
hint.style.padding = "12px 24px";
hint.style.background = "rgba(0,0,0,0.7)";
hint.style.color = "white";
hint.style.borderRadius = "20px";
hint.style.fontSize = "18px";
hint.style.display = "none";
hint.style.zIndex = "9999";
hint.innerHTML = "Nhấn <b>Space (Phím Cách)</b> để mở";
document.body.appendChild(hint);

function checkProximity() {
    nearbyBuilding = null;
    const targets = document.querySelectorAll(".building, .interactive-box, .pastel-box");

    targets.forEach((b) => {
        const rect = b.getBoundingClientRect();
        const bx = rect.left + rect.width / 2;
        const by = rect.top + rect.height / 2;
        
        // Tính toán khoảng cách dựa trên tọa độ thực tế của phần tử trên khung hình (Viewport)
        const dist = Math.sqrt(Math.pow(bx - renderX, 2) + Math.pow(by - renderY, 2));

        if (dist < 180) {
            nearbyBuilding = b;
            b.style.transform = "scale(1.03)";
            b.style.borderColor = "#ff7666"; 
            b.style.boxShadow = "0 0 20px rgba(255, 118, 102, 0.3)";
        } else {
            b.style.transform = "";
            b.style.boxShadow = "";
            b.style.borderColor = "";
        }
    });

    if (nearbyBuilding) {
        hint.style.display = "block";
    } else {
        hint.style.display = "none";
    }

    requestAnimationFrame(checkProximity);
}
checkProximity();

// =========================================================
//  LẮNG NGHE PHÍM SPACE ĐỂ MỞ HỘP HOẶC CHUYỂN TRANG
// =========================================================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && nearbyBuilding) {
        e.preventDefault(); 

        if (nearbyBuilding.classList.contains('interactive-box') || nearbyBuilding.classList.contains('pastel-box')) {
            const isOpen = nearbyBuilding.classList.contains('active');
            
            document.querySelectorAll('.interactive-box, .pastel-box').forEach(box => {
                box.classList.remove('active');
            });
            
            if (!isOpen) {
                nearbyBuilding.classList.add('active');
            }
        } else {
            const buildingId = nearbyBuilding.id;
            if (buildingId === "box-ai" || buildingId === "ai-building") {
                openAI();
            } else if (buildingId === "box-robotics" || buildingId === "robot-building") {
                openRobot();
            } else if (buildingId === "box-game" || buildingId === "game-building") {
                openAdventure();
            } else {
                nearbyBuilding.click(); 
            }
        }
    }
});

// =========================================================
//         FOOTSTEP EFFECT
// =========================================================
let stepTimer = 0;
function stepEffect() {
    if (!avatar) return;
    if ((player.vx !== 0 || player.vy !== 0) && !isScrollingToAbout) {
        stepTimer += 0.3;
        avatar.style.transform = `scale(${1 + Math.sin(stepTimer) * 0.08})`;
    } else {
        avatar.style.transform = "scale(1)";
    }
    requestAnimationFrame(stepEffect);
}
stepEffect();