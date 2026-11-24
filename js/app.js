// =====================
// КОНФИГУРАЦИЯ СЛАЙДОВ
// =====================
// Поменяйте пути, если файлы называются иначе.
const slides = [
  { src: 'images/slide-0.svg', title: 'Титульный слайд' },
  { src: 'images/slide-1.svg', title: 'Навык и группа' },
  { src: 'images/slide-2.svg', title: 'Задание и материалы' },
  { src: 'images/slide-3.svg', title: 'Адаптация под группу' },
  { src: 'images/slide-4.svg', title: 'Фрагмент занятия' },
  { src: 'images/slide-5.svg', title: 'Проверка результата' },
  { src: 'images/slide-6.svg', title: 'Запасной вариант и итог' },
  { src: 'images/slide-7.svg', title: 'Материалы для проверки' },
];

// =====================
// DOM
// =====================
const carouselInner = document.getElementById('carouselInner');
const carouselIndicators = document.getElementById('carouselIndicators');
const slideCounter = document.getElementById('slideCounter');
const slideTitle = document.getElementById('slideTitle');

const carouselEl = document.getElementById('slideCarousel');
const carousel = new bootstrap.Carousel(carouselEl, {
  interval: false,
  wrap: true,
  touch: true,
});

const openFullscreenBtn = document.getElementById('openFullscreenBtn');
const toggleAutoplayBtn = document.getElementById('toggleAutoplayBtn');

const fsOverlay = document.getElementById('fsOverlay');
const fsImage = document.getElementById('fsImage');
const fsCounter = document.getElementById('fsCounter');
const fsCloseBtn = document.getElementById('fsCloseBtn');
const fsPrevBtn = document.getElementById('fsPrevBtn');
const fsNextBtn = document.getElementById('fsNextBtn');

let currentIndex = 0;
let autoplayTimer = null;
let autoplayOn = false;

// =====================
// РЕНДЕР КАРУСЕЛИ
// =====================
function buildCarousel() {
  slides.forEach((slide, i) => {
    // Слайд
    const item = document.createElement('div');
    item.className = 'carousel-item' + (i === 0 ? ' active' : '');
    item.innerHTML = `
      <img src="${slide.src}" alt="${slide.title}" loading="lazy">
    `;
    // Клик по слайду → полный экран
    item.querySelector('img').addEventListener('click', () => openFullscreen(i));
    carouselInner.appendChild(item);

    // Индикатор
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.dataset.bsTarget = '#slideCarousel';
    indicator.dataset.bsSlideTo = String(i);
    indicator.setAttribute('aria-label', `Слайд ${i + 1}: ${slide.title}`);
    if (i === 0) indicator.classList.add('active');
    carouselIndicators.appendChild(indicator);
  });

  updateMeta(0);
}

function updateMeta(index) {
  currentIndex = index;
  slideCounter.textContent = `${index + 1} / ${slides.length}`;
  slideTitle.textContent = slides[index].title;

  // Синхронизация индикаторов
  const indicators = carouselIndicators.querySelectorAll('button');
  indicators.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

// Событие Bootstrap карусели
carouselEl.addEventListener('slid.bs.carousel', (e) => {
  updateMeta(e.to);
});

// =====================
// FULLSCREEN
// =====================
function openFullscreen(index) {
  currentIndex = index;
  renderFullscreen();
  fsOverlay.classList.add('is-open');
  fsOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  stopAutoplay();
}

function closeFullscreen() {
  fsOverlay.classList.remove('is-open');
  fsOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderFullscreen() {
  const slide = slides[currentIndex];
  fsImage.src = slide.src;
  fsImage.alt = slide.title;
  fsCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
}

function fsNext() {
  currentIndex = (currentIndex + 1) % slides.length;
  renderFullscreen();
}

function fsPrev() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  renderFullscreen();
}

// Кнопки оверлея
fsCloseBtn.addEventListener('click', closeFullscreen);
fsNextBtn.addEventListener('click', fsNext);
fsPrevBtn.addEventListener('click', fsPrev);

// Клик по фону оверлея (не по картинке) — закрыть
fsOverlay.addEventListener('click', (e) => {
  if (e.target === fsOverlay) closeFullscreen();
});

// Клавиатура
document.addEventListener('keydown', (e) => {
  const isOpen = fsOverlay.classList.contains('is-open');

  if (isOpen) {
    if (e.key === 'Escape') closeFullscreen();
    if (e.key === 'ArrowRight') fsNext();
    if (e.key === 'ArrowLeft') fsPrev();
  } else {
    // Листание карусели с клавиатуры
    if (e.key === 'ArrowRight') carousel.next();
    if (e.key === 'ArrowLeft') carousel.prev();
  }
});

// Свайпы на мобильном в оверлее
let touchStartX = 0;
let touchEndX = 0;

fsOverlay.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

fsOverlay.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const delta = touchEndX - touchStartX;
  if (Math.abs(delta) < 50) return;
  if (delta < 0) fsNext();
  else fsPrev();
}, { passive: true });

// =====================
// АВТОПРОКРУТКА
// =====================
function startAutoplay() {
  stopAutoplay();
  autoplayOn = true;
  toggleAutoplayBtn.textContent = 'Автопрокрутка: вкл';
  autoplayTimer = setInterval(() => carousel.next(), 6000);
}

function stopAutoplay() {
  autoplayOn = false;
  toggleAutoplayBtn.textContent = 'Автопрокрутка: выкл';
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

toggleAutoplayBtn.addEventListener('click', () => {
  if (autoplayOn) stopAutoplay();
  else startAutoplay();
});

// Останавливаем автопрокрутку, когда вкладка скрыта
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay();
});

// =====================
// СТАРТ
// =====================
buildCarousel();

// Кнопка «Открыть на весь экран» — открывает текущий слайд
openFullscreenBtn.addEventListener('click', () => {
  openFullscreen(currentIndex);
});