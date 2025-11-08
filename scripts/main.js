/* === Intro Messages === */
const MESSAGES = [
  "Happy Anniversary 💖",
  "ขอบคุณที่อยู่ด้วยกันนะ",
  "ครั้งนี้… เค้าไม่มีอะไรจะให้ที่รัก",
  "เค้าเลยตั้งใจทำสิ่งนี้ให้ที่รัก หวังว่าที่รักจะชอบนะคั้บ 😊",
  "พร้อมแล้ว… ไปดูความทรงจำของเรากันคั้บ!",
];

const HOLD = 1400, // เวลาค้างข้อความแต่ละอัน (ms)
  FADE = 700, // เวลา fade เข้า/ออก
  GAP = 400; // เวลาพักระหว่างข้อความ

const elIntro = document.querySelector(".intro");
const elText = document.querySelector(".intro__text");
const elMain = document.querySelector(".container");
const audio = document.getElementById("bgm");
const cta = document.querySelector(".audio-cta");
const volumeUI = document.querySelector(".volume-control");
const slider = document.getElementById("volumeSlider");
const icon = document.getElementById("volumeIcon");

/* -----------------------------
   🎵 PLAYLIST (เล่นต่อเนื่อง)
------------------------------ */
const PLAYLIST = [
  "music/สมดุลรัก.mp3",
  "music/น้อย qiw guitar.mp3",
  // เพิ่มเพลงต่อ ๆ ไปได้เลย
];
let trackIndex = 0;

function loadTrack(i) {
  if (!audio) return;
  trackIndex = (i + PLAYLIST.length) % PLAYLIST.length;
  audio.src = PLAYLIST[trackIndex];
  audio.load();
}

function fadeAudio(elem, to = 1, ms = 600) {
  const steps = Math.max(1, Math.floor(ms / 50));
  const from = elem.volume;
  let n = 0;
  return new Promise((res) => {
    const iv = setInterval(() => {
      n++;
      elem.volume = from + (to - from) * (n / steps);
      if (n >= steps) {
        clearInterval(iv);
        elem.volume = to;
        res();
      }
    }, 50);
  });
}

if (audio) {
  loadTrack(0);
  if (slider) audio.volume = parseFloat(slider.value || 1);
  audio.addEventListener("ended", async () => {
    loadTrack(trackIndex + 1);
    try {
      await audio.play();
    } catch {
      cta && (cta.hidden = false);
    }
  });
}

/* === ฟังก์ชันเล่นเพลงแบบเฟดอิน === */
async function fadeInAudio(
  duration = 3000,
  targetVol = parseFloat(slider?.value ?? "1")
) {
  if (!audio) return;
  audio.volume = 0;
  const step = targetVol / (duration / 50);
  const fade = setInterval(() => {
    if (audio.volume < targetVol) {
      audio.volume = Math.min(audio.volume + step, targetVol);
    } else {
      clearInterval(fade);
    }
  }, 50);
}

/* === พยายามเล่นเพลง (autoplay-friendly) === */
async function tryPlayAudio() {
  if (!audio) return false;
  try {
    if (!audio.src) loadTrack(0);
    audio.muted = true; // เริ่มแบบเงียบ (ผ่าน autoplay policy)
    audio.currentTime = 0;
    await audio.play();
    audio.muted = false; // ปลด mute หลังเริ่มได้แล้ว
    await fadeInAudio(); // ค่อย ๆ ขึ้นเสียง
    cta.hidden = true;
    volumeUI.hidden = false;
    return true;
  } catch {
    cta.hidden = false;
    return false;
  }
}

/* === อัปเดตไอคอนระดับเสียง === */
function updateIcon(vol) {
  icon && (icon.textContent = vol === 0 ? "🔈" : "🔊");
}

/* === Event ปรับเสียง === */
slider?.addEventListener("input", (e) => {
  const vol = parseFloat(e.target.value);
  if (audio) audio.volume = vol;
  updateIcon(vol);
});

/* === ถ้ามีการคลิกที่ใดบนหน้าจอ → เล่นเพลง (เผื่อมือถือยังบล็อก) === */
window.addEventListener(
  "pointerdown",
  async () => {
    if (audio.paused) await tryPlayAudio();
  },
  { once: true, capture: true }
);

/* === Intro Sequence === */
const showMsg = async () => {
  for (const msg of MESSAGES) {
    elText.textContent = msg;
    elText.classList.remove("is-out");
    elText.classList.add("is-in");
    await new Promise((r) => setTimeout(r, FADE + HOLD));

    elText.classList.remove("is-in");
    elText.classList.add("is-out");
    await new Promise((r) => setTimeout(r, FADE + GAP));
  }

  // หลังจบ intro → แสดงเนื้อหา + เล่นเพลงอัตโนมัติ
  elIntro.classList.add("is-done");
  elMain.classList.remove("is-hidden");
  elMain.classList.add("is-reveal");

  const ok = await tryPlayAudio();
  if (!ok) {
    // ถ้ายังบล็อกอยู่ → รอผู้ใช้แตะหน้าจอ (มี listener อยู่แล้ว)
    console.log("Autoplay blocked, waiting for user gesture...");
  }
};

document.addEventListener("DOMContentLoaded", showMsg);

/* === Memories Section: Fade-in on Scroll === */
const memorySections = document.querySelectorAll(".memory");

function showMemoriesOnScroll() {
  const trigger = window.innerHeight * 0.85;
  memorySections.forEach((mem) => {
    const top = mem.getBoundingClientRect().top;
    if (top < trigger) mem.classList.add("show");
  });
}

window.addEventListener("scroll", showMemoriesOnScroll);
showMemoriesOnScroll();

/* === Floating Hearts Following Cursor (Playful) === */
const heartsContainer = document.querySelector(".hearts");
let lastSpawn = 0;

window.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastSpawn < 80) return;
  lastSpawn = now;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = ["💖", "💘", "💝", "💕"][Math.floor(Math.random() * 4)];
  heartsContainer.appendChild(heart);

  const size = Math.random() * 1.2 + 0.6;
  const offsetX = Math.random() * 20 - 10;
  const offsetY = Math.random() * 20 - 10;

  heart.style.fontSize = `${size}rem`;
  heart.style.left = `${e.clientX + offsetX}px`;
  heart.style.top = `${e.clientY + offsetY}px`;

  setTimeout(() => heart.remove(), 1800);
});

/* === Carousel Logic (Scoped) === */
(() => {
  const viewport = document.querySelector(".carousel .viewport");
  const track = document.querySelector(".carousel .track");
  const slides = Array.from(document.querySelectorAll(".carousel .slide"));
  const prevBtn = document.querySelector(".carousel .prev");
  const nextBtn = document.querySelector(".carousel .next");
  const dotsBox = document.querySelector(".gallery .dots");

  if (!viewport || !track || !slides.length) return;

  // สร้าง dots ตามจำนวนสไลด์
  dotsBox.innerHTML = "";
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    if (i === 0) b.setAttribute("aria-current", "true");
    dotsBox.appendChild(b);
    b.addEventListener("click", () => goTo(i));
    return b;
  });

  let index = 0;
  function update() {
    dots.forEach((d, i) =>
      i === index
        ? d.setAttribute("aria-current", "true")
        : d.removeAttribute("aria-current")
    );
    // เลื่อนไปยังสไลด์เป้าหมาย
    track.style.transform = `translateX(${-index * viewport.clientWidth}px)`;
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }
  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  // ปุ่ม ◀ ▶
  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  // รีคอมพิวต์เมื่อรีไซส์ (กันภาพยืด)
  window.addEventListener("resize", update);

  // คีย์บอร์ด
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // แตะ-ปัด (มือถือ)
  let startX = null,
    locked = false;
  viewport.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      locked = false;
    },
    { passive: true }
  );
  viewport.addEventListener(
    "touchmove",
    (e) => {
      if (startX === null || locked) return;
      const dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        // สัมผัสยาวพอ
        locked = true;
        dx < 0 ? next() : prev();
        startX = null;
      }
    },
    { passive: true }
  );
  viewport.addEventListener("touchend", () => {
    startX = null;
  });

  // อัปเดตครั้งแรก
  track.style.willChange = "transform";
  update();
})();

/* === Heart Pop ❤️ + Flash 💡 === */
(() => {
  const track = document.querySelector(".carousel .track");
  const flash = document.querySelector(".carousel .flash");
  const slides = document.querySelectorAll(".carousel .slide img");

  if (!track || !flash) return;

  // 💡 Flash ตอนเปลี่ยนสไลด์
  const triggerFlash = () => {
    flash.classList.add("active");
    setTimeout(() => flash.classList.remove("active"), 300);
  };

  // Hook เข้ากับปุ่มเลื่อน (prev/next)
  const prevBtn = document.querySelector(".carousel .prev");
  const nextBtn = document.querySelector(".carousel .next");
  prevBtn?.addEventListener("click", triggerFlash);
  nextBtn?.addEventListener("click", triggerFlash);

  // ❤️ Heart pop ตอนคลิกรูป
  slides.forEach((img) => {
    img.addEventListener("click", (e) => {
      const heart = document.createElement("div");
      heart.className = "heart-pop";
      heart.textContent = ["💖", "💘", "💕", "💓"][
        Math.floor(Math.random() * 4)
      ];

      // ตำแหน่งหัวใจตรงกับคลิก
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;

      img.parentElement.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    });
  });
})();

/* === 💌 Love Letter Typing Effect === */
(() => {
  const textEl = document.getElementById("letterText");
  const signEl = document.querySelector(".signature");
  if (!textEl) return;

  const message = `
ถึงแฟนสุดน่ารักของเค้า 💕



ตลอดเวลาที่เราอยู่ด้วยกัน มันมีทั้งวันดีและวันที่เหนื่อย
แต่ทุกครั้งที่ได้เจอเธอ ได้คุยกับเธอ เค้าก็รู้ว่า...ทุกอย่างมันคุ้มแล้ว

ขอบคุณที่ยังอยู่ตรงนี้ ไม่ว่าจะในวันที่หัวเราะ
หรือวันที่น้ำตาไหล เค้าจะจำไว้เสมอว่า...เราเคยยิ้มไปด้วยกัน ❤️
  `;

  let index = 0;

  function type() {
    if (index < message.length) {
      textEl.textContent += message.charAt(index);
      index++;
      setTimeout(type, 40); // ความเร็วพิมพ์ (ms)
    } else {
      signEl.style.opacity = 1; // แสดงลายเซ็นหลังพิมพ์จบ
    }
  }

  // trigger เมื่อ scroll ถึง section
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          type();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  observer.observe(document.querySelector(".love-letter"));
})();

/* === 💘 Mini Game: Who’s More Likely To === */
(() => {
  const questions = [
    "ใครชอบส่งReelsบ่อยกว่า 😆",
    "ใครชอบชวนกินของอร่อยก่อน 🍰",
    "ใครพูดคำว่า ‘คิดถึง’ ก่อน 💭",
    "ใครร้องเพลงเพี้ยนสุด 🎤",
    "ใครขี้อ้อนกว่า 🐶",
    "ใครหัวเราะเสียงดังสุด 🤣",
    "ใครเป็นคนแพ้ก่อนเวลาเถียงกัน 😜",
    "ใครชอบถ่ายรูปมากกว่า 📸",
    "ใครเป็นคนบอกรักก่อน 💞",
    "ใครชอบนอนกอดมากกว่า 💤",
    "ใครชอบนอนดึกกว่า 🌙",
  ];

  const questionBox = document.getElementById("questionBox");
  const resultBox = document.getElementById("resultBox");
  const meBtn = document.getElementById("meBtn");
  const youBtn = document.getElementById("youBtn");
  const startBtn = document.getElementById("startBtn");
  const container = document.querySelector(".game-container");

  let current = 0;

  function nextQuestion() {
    if (current < questions.length) {
      questionBox.textContent = questions[current];
      resultBox.classList.add("hidden");
    } else {
      endGame();
    }
  }

  function burstHeart(x, y, emoji) {
    const heart = document.createElement("div");
    heart.className = "burst-heart";
    heart.textContent = emoji;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 600);
  }

  function choose(side, event) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    burstHeart(x, y, side === "me" ? "💖" : "💞");
    resultBox.textContent = side === "me" ? "😳" : "💘";
    resultBox.classList.remove("hidden");
    resultBox.classList.add("show");
    current++;
    setTimeout(nextQuestion, 1200);
  }

  function startGame() {
    current = 0;
    container.classList.remove("is-idle");
    startBtn.style.display = "none";
    meBtn.disabled = false;
    youBtn.disabled = false;
    nextQuestion();
  }

  function endGame() {
    questionBox.textContent = "เรารู้จักกันดีจริง ๆ นะ 💗";
    resultBox.textContent = "ขอบคุณที่เล่นด้วยกัน เค้ารักเธอนะ 🥹💞";
    resultBox.classList.remove("hidden");
    meBtn.disabled = true;
    youBtn.disabled = true;
    container.classList.add("is-idle");
    startBtn.textContent = "เล่นอีกครั้ง 💫";
    startBtn.style.display = "inline-block";
  }

  meBtn.addEventListener("click", (e) => choose("me", e));
  youBtn.addEventListener("click", (e) => choose("you", e));
  startBtn.addEventListener("click", startGame);
})();

/* === Bottom section controls === */
(() => {
  const replay = document.getElementById("replaySong");
  const toTop = document.getElementById("toTop");

  // ฟังเพลงอีกครั้ง (รีสตาร์ตเพลย์ลิสต์ตั้งแต่เพลงแรก)
  replay?.addEventListener("click", async () => {
    if (!audio) return;
    loadTrack(0);
    audio.currentTime = 0;
    const ok = await tryPlayAudio();
    if (!ok) cta && (cta.hidden = false);
  });

  toTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
})();
