/**
 * @file Головний скрипт для сайту.
 * @description Ініціалізує всі інтерактивні елементи: прелоадер, логіку скролу,
 * відеоплеєри, вкладки та інші компоненти інтерфейсу.
 * @author Your Name/Company
 * @version 1.2.0
 */

document.addEventListener('DOMContentLoaded', () => {
  /**
   * @namespace App
   * @description Головний об'єкт, що містить всю логіку сайту.
   */
  const App = {
    elements: {},
    state: {
      lastScrollTop: 0,
    },

    /**
     * Ініціалізує додаток.
     */
    init() {
      this.cacheDomElements();
      this.startFirstVideo(); // **ЗМІНА: Запускаємо відео одразу**
      this.initPreloader();
      this.initTabs();
      this.initNavIndicator();
      this.bindEvents();
    },

    /**
     * Кешує DOM-елементи.
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
     * Прив'язує обробники подій.
     */
    bindEvents() {
        // Кнопки звуку більше не існують, тому цей код можна видалити або залишити, якщо вони повернуться
        // this.elements.muteButtons.forEach((button) => {
        //   button.addEventListener('click', (e) => this.handleMuteToggle(e));
        // });
    },
      
    /**
     * **НОВА ФУНКЦІЯ**
     * Знаходить перше відео і намагається його відтворити.
     */
    startFirstVideo() {
        const firstVideo = document.querySelector('#first-video-block .video-preview');
        if (firstVideo) {
            firstVideo.muted = true;
            firstVideo.playsInline = true;
            firstVideo.play().catch(error => {
                console.log("Autoplay was prevented by the browser:", error);
            });
        }
    },

    /**
     * Керує анімацією прелоадера.
     */
    /**
     * Керує анімацією прелоадера.
     */
    /**
     * Керує анімацією прелоадера.
     */
    /**
     * Керує анімацією прелоадера.
     */
    /**
     * Керує анімацією прелоадера.
     */
    initPreloader() {
      const preloader = this.elements.introPreloader;
      if (!preloader) {
        this.onPreloaderFinish();
        return;
      }

      this.elements.body.classList.add('preloader-active');

      const titleWords = preloader.querySelectorAll('.intro-preloader__title .word');
      const TARGET_DURATION = 2500;
      const WORD_FADE_IN_DURATION = 600;
      
      // ===================================================================
      // **ОСЬ ЦЕЙ РЯДОК ПОТРІБНО ЗМІНИТИ**
      // Встановлюємо затримку в 3 секунди (3000 мілісекунд)
      const POST_ANIMATION_DELAY = 3000; 
      // ===================================================================

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

      const typewriterElement = preloader.querySelector('.anim-typewriter');
      if (typewriterElement) {
        const originalText = typewriterElement.textContent.trim();

        const measurer = typewriterElement.cloneNode(true);
        measurer.style.visibility = 'hidden';
        measurer.style.position = 'absolute';
        measurer.style.height = 'auto';
        measurer.style.width = typewriterElement.offsetWidth + 'px';
        measurer.textContent = originalText;
        
        document.body.appendChild(measurer);
        const finalHeight = measurer.offsetHeight;
        document.body.removeChild(measurer);

        typewriterElement.style.minHeight = `${finalHeight}px`;
        
        typewriterElement.textContent = '';

        let charIndex = 0;
        const typingSpeed = 40;
        const startDelay = 100;

        setTimeout(() => {
          const typeChar = () => {
            if (charIndex < originalText.length) {
              typewriterElement.textContent = originalText.substring(0, charIndex + 1);
              charIndex++;
              setTimeout(typeChar, typingSpeed);
            } else {
              typewriterElement.classList.add('typing-done');
              // Тепер цей таймер буде використовувати правильну затримку в 3 секунди
              setTimeout(() => {
                preloader.classList.add('is-done');
              }, POST_ANIMATION_DELAY);
            }
          };
          typeChar();
        }, startDelay);
      }

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
      // **ЗМІНА: Логіку запуску першого відео звідси видалено**
    },

    /**
     * Ініціалізує логіку, що залежить від скролу.
     */
    initScrollDependentLogic() {
      if (this.elements.body.classList.contains('page-hybrids')) {
        this.setupHybridsPageScroll();
      }
    },

    /**
     * Налаштовує логіку скролу для сторінки "Hybrids".
     */
    setupHybridsPageScroll() {
      const sections = document.querySelectorAll('.video-block-fullscreen, .video-block-hybrid');
      const progressElements = this.createProgressBar(sections.length);

      const onScroll = () => {
        const currentScroll = window.scrollY;
        const isScrollingDown = currentScroll > this.state.lastScrollTop;
        this.updateProgressBar(sections, progressElements);
        if (this.elements.navContainer) {
          const shouldHide = currentScroll > 200 && isScrollingDown;
          this.elements.navContainer.classList.toggle('hidden', shouldHide);
        }
        this.state.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },

    /**
     * Створює прогрес-бар.
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
        const sections = document.querySelectorAll('.video-block-fullscreen, .video-block-hybrid');
        if (sections[targetIndex]) {
          window.scrollTo({ top: sections[targetIndex].offsetTop, behavior: 'smooth' });
        }
      });
      return { bar, indicator };
    },

    /**
     * Оновлює прогрес-бар.
     */
    updateProgressBar(sections, progressElements) {
      if (!progressElements || sections.length === 0) return;
      let activeIndex = -1;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          activeIndex = index;
        }
      });
      if (activeIndex !== -1) {
        const progress = ((activeIndex + 1) / sections.length) * 100;
        progressElements.bar.style.height = `${progress}%`;
        progressElements.indicator.textContent = `${activeIndex + 1} / ${sections.length}`;
      }
    },

    /**
     * Ініціалізує Intersection Observer для відео.
     */
    initVideoObserver() {
      const playOnlyThis = (videoEl) => {
        if (!videoEl) return;
        document.querySelectorAll('video').forEach((v) => {
          if (v !== videoEl) v.pause();
        });
        videoEl.play().catch((error) => console.log('Autoplay was prevented:', error));
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

    /**
     * Ініціалізує функціонал вкладок.
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