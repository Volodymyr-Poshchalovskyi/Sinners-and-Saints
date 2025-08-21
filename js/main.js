/**

* @file Головний скрипт для сайту.

* @description Ініціалізує всі інтерактивні елементи: прелоадер, логіку скролу,

* відеоплеєри, вкладки та інші компоненти інтерфейсу.

* @author Your Name/Company

* @version 1.0.0

*/

document.addEventListener('DOMContentLoaded', () => {
  /**

* @namespace App

* @description Головний об'єкт, що містить всю логіку сайту.

*/

  const App = {
    /**

* @property {object} elements - Кешовані DOM-елементи для швидкого доступу.

*/

    elements: {},

    /**

* @property {object} state - Стан додатку, наприклад, позиція скролу.

*/

    state: {
      lastScrollTop: 0,
    },

    /**

* Ініціалізує додаток: кешує елементи та запускає обробники.

*/

    init() {
      this.cacheDomElements();

      this.initPreloader();

      this.initTabs();

      this.bindEvents();
    },

    /**

* Знаходить та зберігає посилання на всі необхідні DOM-елементи.

*/

    cacheDomElements() {
      this.elements.body = document.body;

      this.elements.header = document.querySelector('.header');

      this.elements.navContainer = document.querySelector('.nav-container');

      this.elements.introPreloader = document.querySelector('.intro-preloader');

      this.elements.fullscreenSections = document.querySelectorAll(
        '.video-block-fullscreen'
      );

      this.elements.muteButtons = document.querySelectorAll('.mute-toggle');

      // Додайте інші елементи сюди, якщо потрібно
    },

    /**

* Прив'язує всі основні обробники подій до елементів.

*/

    bindEvents() {
      this.elements.muteButtons.forEach((button) => {
        button.addEventListener('click', this.handleMuteToggle);
      });
    },

    // ==========================================================================

    // PRELOADER LOGIC

    // ==========================================================================

    /**

* Керує анімацією та зникненням прелоадера.

*/

    initPreloader() {
  const preloader = this.elements.introPreloader;

  if (!preloader) {
    this.onPreloaderFinish();
    return;
  }

  this.elements.body.classList.add('preloader-active');

  // --- Анімація заголовка (залишається без змін) ---
  const titleWords = preloader.querySelectorAll('.intro-preloader__title .word');
  const TARGET_DURATION = 2500;
  const WORD_FADE_IN_DURATION = 600;
  const POST_ANIMATION_DELAY = 10000;

  const calculateDelay = (collection) => {
    const increment =
      collection.length > 1
        ? (TARGET_DURATION - WORD_FADE_IN_DURATION) / (collection.length - 1)
        : 0;
    collection.forEach((word, index) => {
      word.style.animationDelay = `${index * increment}ms`;
    });
  };

  calculateDelay(titleWords);

  // --- НОВА ЛОГІКА ДРУКАРСЬКОЇ МАШИНКИ ---
  const typewriterElement = preloader.querySelector('.anim-typewriter');
  if (typewriterElement) {
    const originalText = typewriterElement.textContent.trim();
    typewriterElement.textContent = ''; // Очищуємо текст перед початком

    let charIndex = 0;
    const typingSpeed = 40; // Швидкість друкування (мс на символ)
    const startDelay = 100; // Затримка перед початком друкування (0.1с)

    setTimeout(() => {
      const typeChar = () => {
      if (charIndex < originalText.length) {
        typewriterElement.textContent = originalText.substring(0, charIndex + 1) + '|'; // Додаємо курсор після кожного символу
        charIndex++;
        setTimeout(typeChar, typingSpeed);
      } else {
        // Коли друкування завершено, видаляємо курсор та додаємо клас
        typewriterElement.textContent = originalText;
        typewriterElement.classList.add('typing-done');
      }
    };
    typeChar(); // Запускаємо процес // Запускаємо процес
    }, startDelay);
  }

  // --- Ховаємо прелоадер (логіка залишається без змін) ---
  setTimeout(() => {
    preloader.classList.add('is-done');
  }, TARGET_DURATION + POST_ANIMATION_DELAY);

  preloader.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'transform') {
      this.onPreloaderFinish();
      preloader.remove();
    }
  });
},

    /**

* Виконується після зникнення прелоадера (або одразу, якщо його немає).

*/

    onPreloaderFinish() {
  this.elements.body.classList.remove('preloader-active');
  this.initScrollDependentLogic();
  this.initVideoObserver();

  // Автоматично запускаємо перше відео після прелоадера
  const firstVideo = document.querySelector(
    '.video-block-fullscreen .video-preview' // <-- Тепер шукає перше відео у будь-якому блоці fullscreen
  );

  if (firstVideo) {
    firstVideo
      .play()
      .catch((error) => console.log('Autoplay was prevented:', error));
  }
},

    // ==========================================================================

    // SCROLL-DEPENDENT LOGIC

    // ==========================================================================

    /**

* Ініціалізує всю логіку, яка залежить від прокрутки сторінки.

*/

    initScrollDependentLogic() {
      if (this.elements.body.classList.contains('page-hybrids')) {
        this.setupHybridsPageScroll();
      }

      // Тут можна додати 'else if' для інших сторінок
    },

    /**

* Налаштовує специфічну логіку скролу для сторінки "Hybrids".

*/

    setupHybridsPageScroll() {
    const sections = document.querySelectorAll(".video-block-fullscreen, .video-block-hybrid");
    const progressElements = this.createProgressBar(sections.length);

    const onScroll = () => {
        const currentScroll = window.scrollY;

        // 1. Оновлення прогрес-бару
        this.updateProgressBar(sections, progressElements);

        // 2. Логіка ховання/показу хедера
        const scrollThreshold = 200;
        const isScrollingDown = currentScroll > this.state.lastScrollTop;

        if (this.elements.header) {
            const shouldHide = currentScroll > scrollThreshold && isScrollingDown;
            
            // Тепер керуємо лише хедером, а навігація рухатиметься разом з ним
            this.elements.header.classList.toggle("header--hidden", shouldHide);
        }

        this.state.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Початковий виклик для правильного стану
},

    /**

* Створює та додає на сторінку елементи прогрес-бару.

* @param {number} totalSections - Загальна кількість секцій.

* @returns {object|null} Об'єкт з елементами прогрес-бару або null.

*/

    createProgressBar(totalSections) {
      if (totalSections <= 0) return null;

      const container = document.createElement('div');

      container.className = 'video-progress';

      const bar = document.createElement('div');

      bar.className = 'video-progress-bar';

      const indicator = document.createElement('div');

      indicator.className = 'video-progress-indicator';

      indicator.textContent = `1 / ${totalSections}`;

      container.append(bar, indicator);

      this.elements.body.appendChild(container);

      container.addEventListener('click', (e) => {
        const rect = container.getBoundingClientRect();

        const clickY = e.clientY - rect.top;

        const percentage = clickY / rect.height;

        const targetIndex = Math.floor(percentage * totalSections);

        const sections = document.querySelectorAll(
          '.video-block-fullscreen, .video-block-hybrid'
        );

        if (sections[targetIndex]) {
          window.scrollTo({
            top: sections[targetIndex].offsetTop,
            behavior: 'smooth',
          });
        }
      });

      return { bar, indicator };
    },

    /**

* Оновлює стан прогрес-бару на основі видимої секції.

* @param {NodeListOf<Element>} sections - Колекція секцій.

* @param {object} progressElements - Елементи прогрес-бару.

*/

    updateProgressBar(sections, progressElements) {
      if (!progressElements || sections.length === 0) return;

      let activeIndex = -1;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();

        // Секція вважається активною, якщо її центр знаходиться в центрі екрану

        if (
          rect.top <= window.innerHeight * 0.5 &&
          rect.bottom >= window.innerHeight * 0.5
        ) {
          activeIndex = index;
        }
      });

      if (activeIndex !== -1) {
        const progress = ((activeIndex + 1) / sections.length) * 100;

        progressElements.bar.style.height = `${progress}%`;

        progressElements.indicator.textContent = `${activeIndex + 1} / ${sections.length}`;
      }
    },

    // ==========================================================================

    // VIDEO & INTERSECTION OBSERVER

    // ==========================================================================

    /**

* Ініціалізує Intersection Observer для автовідтворення відео у viewport.

*/

    initVideoObserver() {
      const playOnlyThis = (videoEl) => {
        if (!videoEl) return;

        this.elements.fullscreenSections.forEach((section) => {
          const v = section.querySelector('video');

          if (v && v !== videoEl) v.pause();
        });

        videoEl
          .play()
          .catch((error) => console.log('Autoplay was prevented:', error));
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (this.elements.body.classList.contains('preloader-active')) return;

          entries.forEach((entry) => {
            const video = entry.target.querySelector('video');

            if (video) {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
                playOnlyThis(video);
              } else {
                video.pause();
              }
            }
          });
        },
        { root: null, threshold: [0.0, 0.75, 1.0] }
      );

      this.elements.fullscreenSections.forEach((section) => {
        const video = section.querySelector('video');

        if (video) {
          // Налаштування для кращої продуктивності та сумісності

          video.muted = true;

          video.playsInline = true;

          video.preload = 'auto';

          observer.observe(section);
        }
      });
    },

    // ==========================================================================

    // UI COMPONENTS LOGIC (TABS, BUTTONS)

    // ==========================================================================

    /**

* Ініціалізує функціонал вкладок (табів).

*/

    initTabs() {
      this.setupTabSystem('.studio-tab', '.tab-panel');

      this.setupTabSystem('.login-tab', '.tab-content');
    },

    /**

* Універсальна функція для налаштування системи вкладок.

* @param {string} tabSelector - CSS-селектор для кнопок-вкладок.

* @param {string} panelSelector - CSS-селектор для панелей контенту.

*/

    setupTabSystem(tabSelector, panelSelector) {
      const tabs = document.querySelectorAll(tabSelector);

      const panels = document.querySelectorAll(panelSelector);

      if (tabs.length === 0) return;

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const targetPanelId = tab.dataset.tab;

          tabs.forEach((t) => t.classList.remove('active'));

          tab.classList.add('active');

          panels.forEach((p) => {
            // Для login-вкладок id панелей мають суфікс "-content"

            const panelId = p.id.replace('-content', '');

            p.classList.toggle('active', panelId === targetPanelId);
          });
        });
      });
    },

    /**

* Обробляє клік на кнопку ввімкнення/вимкнення звуку.

* @param {Event} event - Подія кліку.

*/

    handleMuteToggle(event) {
      const button = event.currentTarget;

      const video = button
        .closest('.video-block, .video-block-fullscreen')
        ?.querySelector('.video-preview, video');

      if (video) {
        video.muted = !video.muted;

        button.innerHTML = video.muted
          ? '<svg viewBox="0 0 24 24"><path d="M12 3.99L7.83 8.16H4v7.68h3.83L12 20.01v-16.02zM12 1.48L6.48 7.01H2v10h4.48L12 22.52V1.48zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.21c2.83.82 5 3.54 5 6.34s-2.17 5.52-5 6.34v.21c3.38-.88 6-3.96 6-7.55s-2.62-6.67-6-7.55z"/></svg>'
          : '<svg viewBox="0 0 24 24"><path d="M3.63 3.63c-.39.39-.39 1.02 0 1.41L7.29 8.7 7 9H4v6h3l3.29 3.29c.63.63 1.71.18 1.71-.71V13.3l4.95 4.95c-.37.26-.79.46-1.25.58v1.01c.71-.21 1.38-.56 1.99-1.01l3.08 3.08c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.63-1.09 1-2.34 1-3.87 0-4.28-2.99-7.86-7-8.77v1.06c2.9.86 5 3.54 5 6.66zM10 15.17L7.83 13H5v-2h2.83l.88-.88L10 11.41v3.76zM14 8.25v-1.1c.46.12.89.31 1.28.55l-1.28 1.28v-.73z"/></svg>';
      }
    },
  };

  // Запускаємо додаток

  App.init();
});
