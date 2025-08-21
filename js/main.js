/**
 * @file Головний скрипт для сайту.
 * @description Ініціалізує всі інтерактивні елементи: прелоадер, логіку скролу,
 * відеоплеєри, вкладки та інші компоненти інтерфейсу.
 * @author Your Name/Company
 * @version 1.1.0
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
      this.initNavIndicator(); // Ініціалізуємо анімацію навігації
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
    },

    /**
     * Прив'язує всі основні обробники подій до елементів.
     */
    bindEvents() {
      this.elements.muteButtons.forEach((button) => {
        // Використовуємо стрілкову функцію, щоб зберегти контекст `this`
        button.addEventListener('click', (e) => this.handleMuteToggle(e));
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

      // --- Анімація заголовка (без змін) ---
      const titleWords = preloader.querySelectorAll(
        '.intro-preloader__title .word'
      );
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

      // --- ПОКРАЩЕНА ЛОГІКА ДРУКАРСЬКОЇ МАШИНКИ ---
      const typewriterElement = preloader.querySelector('.anim-typewriter');
      if (typewriterElement) {
        const originalText = typewriterElement.textContent.trim();
        typewriterElement.textContent = ''; // Очищуємо для старту

        let charIndex = 0;
        const typingSpeed = 40;
        const startDelay = 100;

        setTimeout(() => {
          const typeChar = () => {
            if (charIndex < originalText.length) {
              typewriterElement.textContent = originalText.substring(
                0,
                charIndex + 1
              );
              charIndex++;
              setTimeout(typeChar, typingSpeed);
            } else {
              typewriterElement.classList.add('typing-done');
            }
          };
          typeChar();
        }, startDelay);
      }

      // --- Ховаємо прелоадер (без змін) ---
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
     * Виконується після зникнення прелоадера.
     */
    onPreloaderFinish() {
      this.elements.body.classList.remove('preloader-active');
      this.initScrollDependentLogic();
      this.initVideoObserver();

      const firstVideo = document.querySelector(
        '.video-block-fullscreen .video-preview'
      );
      if (firstVideo) {
        firstVideo.muted = true; // Важливо для автозапуску
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
    },

    /**
     * Налаштовує специфічну логіку скролу для сторінки "Hybrids".
     */
    setupHybridsPageScroll() {
      const sections = document.querySelectorAll(
        '.video-block-fullscreen, .video-block-hybrid'
      );
      const progressElements = this.createProgressBar(sections.length);

      const onScroll = () => {
        const currentScroll = window.scrollY;
        const isScrollingDown = currentScroll > this.state.lastScrollTop;

        this.updateProgressBar(sections, progressElements);

        if (this.elements.header) {
          const shouldHide = currentScroll > 200 && isScrollingDown;
          this.elements.header.classList.toggle('header--hidden', shouldHide);
        }

        this.state.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },

    /**
     * Створює та додає на сторінку елементи прогрес-бару.
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

      // Логіка кліку по прогрес-бару
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
     */
    updateProgressBar(sections, progressElements) {
      if (!progressElements || sections.length === 0) return;

      let activeIndex = -1;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
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
        progressElements.indicator.textContent = `${activeIndex + 1} / ${
          sections.length
        }`;
      }
    },

    // ==========================================================================
    // VIDEO & INTERSECTION OBSERVER
    // ==========================================================================

    /**
     * Ініціалізує Intersection Observer для автовідтворення відео.
     */
    initVideoObserver() {
      const playOnlyThis = (videoEl) => {
        if (!videoEl) return;
        document.querySelectorAll('video').forEach((v) => {
          if (v !== videoEl) v.pause();
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
        { threshold: 0.75 }
      );

      this.elements.fullscreenSections.forEach((section) => {
        const video = section.querySelector('video');
        if (video) {
          video.muted = true;
          video.playsInline = true;
          video.preload = 'auto';
          observer.observe(section);
        }
      });
    },

    // ==========================================================================
    // UI COMPONENTS LOGIC
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
            p.classList.toggle('active', p.id === targetPanelId);
          });
        });
      });
    },

    /**
     * Обробляє клік на кнопку ввімкнення/вимкнення звуку.
     */
    handleMuteToggle(event) {
      const button = event.currentTarget;
      const video = button
        .closest('.video-block, .video-block-fullscreen')
        ?.querySelector('video');

      if (video) {
        video.muted = !video.muted;
        button.innerHTML = video.muted
          ? '🔈' // Іконка "без звуку"
          : '🔊'; // Іконка "зі звуком"
      }
    },

    /**
     * Ініціалізує анімацію індикатора в навігації.
     */
    initNavIndicator() {
      const nav = document.querySelector('.nav');
      if (!nav) return;

      const navLinks = nav.querySelectorAll('ul a');
      const indicator = nav.querySelector('.nav-indicator');

      if (!navLinks.length || !indicator) return;

      navLinks.forEach((link) => {
        link.addEventListener('mouseenter', (e) => {
          const target = e.currentTarget;
          indicator.style.left = `${target.offsetLeft}px`;
          indicator.style.width = `${target.offsetWidth}px`;
          indicator.classList.add('active');
        });
      });

      nav.addEventListener('mouseleave', () => {
        indicator.classList.remove('active');
      });
    },
  };

  App.init();
});