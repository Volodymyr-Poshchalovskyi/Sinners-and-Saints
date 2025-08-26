/**
 * @file Головний скрипт для сайту.
 * @description Ініціалізує всі інтерактивні елементи: прелоадер, логіку скролу,
 * відеоплеєри, вкладки та інші компоненти інтерфейсу.
 * @author Your Name/Company
 * @version 2.0.0
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
      this.positionPreloader(); 
      this.startFirstVideo();
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
      // **ЗМІНА: Тепер шукаємо всі прелоадери**
      this.elements.introPreloaders = document.querySelectorAll('.intro-preloader');
      this.elements.fullscreenSections = document.querySelectorAll(
        '.video-block-fullscreen'
      );
    },

    bindEvents() {
      // Код для обробників подій (якщо є)
    },
      
    /**
     * Динамічно позиціонує прелоадери точно під хедером.
     */
   positionPreloader() {
        if (this.elements.header && this.elements.introPreloaders.length) {
            const headerHeight = this.elements.header.offsetHeight;
            this.elements.introPreloaders.forEach(preloader => {
                // ЗМІНА: Додаємо 15px до висоти хедера для верхнього відступу
                preloader.style.top = `${headerHeight + 15}px`;
                // ЗМІНА: Віднімаємо 30px (15px зверху + 15px знизу) від загальної висоти
                preloader.style.height = `calc(100vh - ${headerHeight}px - 30px)`;
            });
        }
    },

    /**
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
     * Керує анімацією прелоадерів.
     */
    /**
     * Керує анімацією прелоадерів.
     */
    /**
     * Керує анімацією прелоадерів.
     */
    initPreloader() {
      const leftPreloader = document.querySelector('.intro-preloader--left');
      const rightPreloader = document.querySelector('.intro-preloader--right');
      const allPreloaders = this.elements.introPreloaders;

      if (!allPreloaders.length) {
        this.onPreloaderFinish();
        return;
      }

      this.elements.body.classList.add('preloader-active');
      
      // =========================================================
      // **ОНОВЛЕНИЙ КОД**
      // Запускаємо таймер на 5 секунд, після якого хедер стане прозорим
      setTimeout(() => {
        this.elements.header.classList.add('header--transparent');
      }, 5000);
      // =========================================================
      
      // Анімація тайтлу (тільки для лівого банера)
      if (leftPreloader) {
        const titleWords = leftPreloader.querySelectorAll('.intro-preloader__title .word');
        const TARGET_DURATION = 2500;
        const WORD_FADE_IN_DURATION = 600;
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
      }
      
      // Анімація підпису (тільки для правого банера)
      if (rightPreloader) {
        const typewriterElement = rightPreloader.querySelector('.anim-typewriter');
        if (typewriterElement) {
            const originalText = typewriterElement.textContent.trim();
            const POST_ANIMATION_DELAY = 3000;

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
                typewriterElement.classList.add('done-typing');
                setTimeout(() => {
                    allPreloaders.forEach(p => p.classList.add('is-done'));
                }, POST_ANIMATION_DELAY);
                }
            };
            typeChar();
            }, startDelay);
        }
      }

      // Обробник зникнення для обох банерів
      let isFinished = false;
      allPreloaders.forEach(preloader => {
        preloader.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform' && !isFinished) {
                isFinished = true; // Запобігаємо подвійному спрацюванню
                this.onPreloaderFinish();
                allPreloaders.forEach(p => p.remove());
            }
        });
      });
    },

      

    onPreloaderFinish() {
      this.elements.body.classList.remove('preloader-active');
      this.initScrollDependentLogic();
      this.initVideoObserver();
    },

    initScrollDependentLogic() {
      if (this.elements.body.classList.contains('page-hybrids')) {
        this.setupHybridsPageScroll();
      }
    },

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

    initTabs() {
      this.setupTabSystem('.studio-tab', '.tab-panel');
      this.setupTabSystem('.login-tab', '.tab-content');
    },

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