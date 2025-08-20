document.addEventListener("DOMContentLoaded", () => {
  const navContainer = document.querySelector(".nav-container");
  const fullscreenVideo = document.getElementById("fullscreen-video");
  const videoSource = document.getElementById("video-source");
  const allVideos = Array.from(document.querySelectorAll(".video-preview"));
  const expandButtons = document.querySelectorAll(".btn-see-more");
  const muteButtons = document.querySelectorAll(".mute-toggle");
  const navLinks = document.querySelectorAll(".nav a");
  const indicator = document.querySelector(".nav-indicator");
  const navElement = document.querySelector('.nav');

  let lastScrollTop = 0;
  let currentVideoIndex = 0;
  let activeLink = null;

  // ===== VIDEO INTERSECTION OBSERVER (fullscreen only) =====
  const fullscreenSections = document.querySelectorAll(".video-block-fullscreen");

  // Make sure videos don't start before intersection logic runs
  fullscreenSections.forEach(section => {
    const v = section.querySelector("video");
    if (!v) return;
    v.autoplay = false;     // override autoplay attribute
    v.pause();
    v.muted = true;         // keeps iOS happy
    v.setAttribute("playsinline", ""); // iOS inline playback
    v.setAttribute("preload", "auto");
  });

  const playOnlyThis = (videoEl) => {
    document.querySelectorAll(".video-block-fullscreen video").forEach(v => {
      if (v !== videoEl) v.pause();
    });
    videoEl.play().catch(() => { });
  };

  const fsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const section = entry.target;
      const video = section.querySelector("video");
      if (!video) return;

      // Play when 75% or more is visible
      if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
        playOnlyThis(video);
      } else {
        video.pause();
      }
    });
  }, {
    root: null, threshold: [0.0, 0.75, 1.0] });

  fullscreenSections.forEach(section => fsObserver.observe(section));

  // ===== FULLSCREEN VIDEO FUNCTIONALITY =====
  expandButtons.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const dataSrc = btn.getAttribute("data-src");
      if (dataSrc) {
        const title = btn.getAttribute("data-title");
        const director = btn.getAttribute("data-director");
        window.location.href = `project-page.html?title=${encodeURIComponent(title)}&director=${encodeURIComponent(director)}`;
      } else {
        currentVideoIndex = index;
        playFullscreenVideo(currentVideoIndex);
      }
    });
  });

  function playFullscreenVideo(index) {
    if (fullscreenVideo && videoSource) {
      const selectedVideo = allVideos[index];
      const src = selectedVideo.querySelector("source").getAttribute("src");
      videoSource.src = src;
      fullscreenVideo.load();
      fullscreenVideo.style.display = "block";
      fullscreenVideo.muted = false;
      fullscreenVideo.play();
      fullscreenVideo.requestFullscreen?.();
    }
  }

  if (fullscreenVideo) {
    fullscreenVideo.addEventListener("ended", () => {
      currentVideoIndex++;
      if (currentVideoIndex < allVideos.length) {
        playFullscreenVideo(currentVideoIndex);
      } else {
        exitFullscreenVideo();
        currentVideoIndex = 0;
      }
    });
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && fullscreenVideo) {
      fullscreenVideo.pause();
      fullscreenVideo.style.display = "none";
    }
  });

  function exitFullscreenVideo() {
    if (fullscreenVideo && videoSource) {
      fullscreenVideo.pause();
      fullscreenVideo.removeAttribute("src");
      videoSource.removeAttribute("src");
      fullscreenVideo.load();
      fullscreenVideo.style.display = "none";
      document.exitFullscreen?.();
    }
  }

  // ===== MUTE TOGGLE =====
  muteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const video = button.parentElement.querySelector(".video-preview");
      if (!video) return;
      video.muted = !video.muted;
      button.textContent = video.muted ? "🔈" : "🔊";
    });
  });

  // ===== NAVIGATION INDICATOR FUNCTIONS =====
  function moveIndicator(link) {
    if (!link || !indicator) return;
    const linkRect = link.getBoundingClientRect();
    const navRect = link.closest('.nav').getBoundingClientRect();
    indicator.style.width = linkRect.width + 'px';
    indicator.style.left = (linkRect.left - navRect.left) + 'px';
    indicator.classList.add('active');
    activeLink = link;
  }

  function hideIndicator() {
    if (indicator) {
      indicator.classList.remove('active');
    }
    activeLink = null;
  }

  // ===== NAVIGATION HOVER HANDLERS =====
  navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      moveIndicator(link);
    });

    link.addEventListener("mouseleave", () => {
      hideIndicator();
    });
  });

  if (navElement) {
    navElement.addEventListener("mouseleave", () => {
      hideIndicator();
    });
  }

  // ===== HYBRID PAGE SPECIFIC FUNCTIONALITY =====
  if (document.body.classList.contains("page-hybrids")) {
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll(".video-block-fullscreen, .video-block-hybrid");

    if (sections.length > 0) {
      const progressContainer = document.createElement("div");
      progressContainer.className = "video-progress";

      const progressBar = document.createElement("div");
      progressBar.className = "video-progress-bar";

      const progressIndicator = document.createElement("div");
      progressIndicator.className = "video-progress-indicator";
      progressIndicator.textContent = "1 / " + sections.length;

      progressContainer.appendChild(progressBar);
      progressContainer.appendChild(progressIndicator);
      document.body.appendChild(progressContainer);

      progressContainer.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const percentage = clickY / rect.height;
        const targetIndex = Math.floor(percentage * sections.length);

        if (sections[targetIndex]) {
          const offset = sections[targetIndex].offsetTop;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      });

      function updateProgress(activeIndex) {
        const progress = ((activeIndex + 1) / sections.length) * 100;
        progressBar.style.height = progress + "%";
        progressIndicator.textContent = (activeIndex + 1) + " / " + sections.length;
      }

      function onScroll() {
        let foundActive = false;
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;
          if (isVisible && !foundActive) {
            updateProgress(index);
            foundActive = true;
          }
        });
      }

      window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (navContainer) {
          navContainer.classList.toggle("hidden", currentScroll > lastScrollTop);
        }

        if (currentScroll > 10 && currentScroll > lastScrollTop) {
          header.classList.add("logo-hidden");
        } else if (currentScroll < lastScrollTop || currentScroll <= 0) {
          header.classList.remove("logo-hidden");
        }

        lastScrollTop = currentScroll;
        onScroll();
      });

      onScroll();
    }
  }

  // ===== PROGRESS BAR FOR OTHER PAGES =====
  if (document.body.classList.contains("page-progress")) {
    const sections = document.querySelectorAll(".video-block, .video-block-fullscreen");

    if (sections.length > 1) {
      const progressContainer = document.createElement("div");
      progressContainer.className = "video-progress";

      const progressBar = document.createElement("div");
      progressBar.className = "video-progress-bar";

      const progressIndicator = document.createElement("div");
      progressIndicator.className = "video-progress-indicator";
      progressIndicator.textContent = "1 / " + sections.length;

      progressContainer.appendChild(progressBar);
      progressContainer.appendChild(progressIndicator);
      document.body.appendChild(progressContainer);

      progressContainer.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const percentage = clickY / rect.height;
        const targetIndex = Math.floor(percentage * sections.length);

        if (sections[targetIndex]) {
          const offset = sections[targetIndex].offsetTop;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      });

      function updateProgressOnly(activeIndex) {
        const progress = ((activeIndex + 1) / sections.length) * 100;
        progressBar.style.height = progress + "%";
        progressIndicator.textContent = (activeIndex + 1) + " / " + sections.length;
      }

      function onScrollProgress() {
        let foundActive = false;
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const isVisible = rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;
          if (isVisible && !foundActive) {
            updateProgressOnly(index);
            foundActive = true;
          }
        });
      }

      window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (navContainer) {
          navContainer.classList.toggle("hidden", currentScroll > lastScrollTop);
        }

        lastScrollTop = Math.max(0, currentScroll);
        onScrollProgress();
      });

      onScrollProgress();
    }
  }
});

// ===== STUDIO TABS FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.studio-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(targetTab);
      if (panel) panel.classList.add('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const loginTabs = document.querySelectorAll('.login-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  loginTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      loginTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      this.classList.add('active');

      const tabName = this.getAttribute('data-tab');
      const targetContent = document.getElementById(tabName + '-content');
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
});

// --- Intro Preloader: slide away after last word animates ---
const introPre = document.querySelector(".intro-preloader");
if (introPre) {
  const words = introPre.querySelectorAll(".word");

  const getMaxDelayMs = () => {
    let max = 0;
    words.forEach(w => {
      const d = (w.style.animationDelay || "0s").trim();
      const ms = d.endsWith("ms") ? parseFloat(d) : parseFloat(d) * 1000;
      if (!isNaN(ms)) max = Math.max(max, ms);
    });
    return max + 500;
  };

  if (words.length) {
    const lastWord = words[words.length - 1];
    let done = false;

    lastWord.addEventListener("animationend", () => {
      if (done) return;
      done = true;
      introPre.classList.add("is-done");
    }, { once: true });

    setTimeout(() => {
      if (done) return;
      done = true;
      introPre.classList.add("is-done");
    }, getMaxDelayMs());
  } else {
    introPre.classList.add("is-done");
  }

  introPre.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform") {
      introPre.remove();
    }
  });
}


