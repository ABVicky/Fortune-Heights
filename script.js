document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================
     1. STICKY NAVBAR SCROLL TRANSITION
     ========================================== */
  const header = document.getElementById("main-header");
  
  function checkScroll() {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", checkScroll);
  // Run on page load in case of direct refresh/hash navigation
  checkScroll();



  /* ==========================================
     3. ROBOT CHECKBOX & FORM SUBMISSIONS
     ========================================== */
  const leadForms = document.querySelectorAll(".lead-form");

  leadForms.forEach(form => {
    const robotCheckbox = form.querySelector(".robot-checkbox");
    const submitBtn = form.querySelector(".btn-form-submit");
    const successMsg = form.parentElement.querySelector(".success-message");

    // Enable/disable submit button based on checkbox status
    robotCheckbox.addEventListener("change", () => {
      submitBtn.disabled = !robotCheckbox.checked;
    });

    // Handle form submissions
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Double check robot checkbox
      if (!robotCheckbox.checked) return;

      // Hide form and show success message
      form.classList.add("hidden");
      successMsg.classList.remove("hidden");

      // Reset form and restore view after 4 seconds (matching React behavior)
      setTimeout(() => {
        form.reset();
        submitBtn.disabled = true;
        successMsg.classList.add("hidden");
        form.classList.remove("hidden");
        
        // Close modal if form was submitted inside the modal
        const modalElement = document.getElementById("contact-modal");
        if (modalElement && form.closest("#contact-modal")) {
          modalElement.classList.add("hidden");
          document.body.classList.remove("modal-open");
        }
      }, 4000);
    });
  });

  /* ==========================================
     4. AMENITIES & TESTIMONIALS CAROUSELS
     ========================================== */
  const setupCarousel = (gridSelector, prevSelector, nextSelector, defaultGap = 16, intervalMs = 4000) => {
    const grid = document.querySelector(gridSelector);
    const prevBtn = document.querySelector(prevSelector);
    const nextBtn = document.querySelector(nextSelector);

    if (!grid || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
      const card = grid.querySelector(".amenity-card, .testimonial-card");
      if (card) {
        const style = window.getComputedStyle(grid);
        const gap = parseInt(style.gap) || defaultGap;
        return card.offsetWidth + gap;
      }
      return 300;
    };

    // Manual navigation click handlers
    nextBtn.addEventListener("click", () => {
      grid.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth"
      });
      resetAutoScroll();
    });

    prevBtn.addEventListener("click", () => {
      grid.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth"
      });
      resetAutoScroll();
    });

    // Disable/opacity toggle for boundary states
    const toggleButtonsState = () => {
      const scrollLeft = grid.scrollLeft;
      const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
      
      prevBtn.style.opacity = scrollLeft <= 5 ? "0.5" : "1";
      prevBtn.style.pointerEvents = scrollLeft <= 5 ? "none" : "auto";
      
      nextBtn.style.opacity = scrollLeft >= maxScrollLeft - 5 ? "0.5" : "1";
      nextBtn.style.pointerEvents = scrollLeft >= maxScrollLeft - 5 ? "none" : "auto";
    };

    grid.addEventListener("scroll", toggleButtonsState);
    setTimeout(toggleButtonsState, 100);
    window.addEventListener("resize", toggleButtonsState);

    // Auto scroll timer logic
    let timer = null;
    let isPaused = false;

    const startAutoScroll = () => {
      stopAutoScroll();
      timer = setInterval(() => {
        if (isPaused) return;
        
        const scrollLeft = grid.scrollLeft;
        const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
        
        if (scrollLeft >= maxScrollLeft - 10) {
          grid.scrollTo({
            left: 0,
            behavior: "smooth"
          });
        } else {
          grid.scrollBy({
            left: getScrollAmount(),
            behavior: "smooth"
          });
        }
      }, intervalMs);
    };

    const stopAutoScroll = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const resetAutoScroll = () => {
      stopAutoScroll();
      startAutoScroll();
    };

    // Pause auto scroll on hover/touch interactions
    const pauseElements = [grid, prevBtn, nextBtn];
    pauseElements.forEach(el => {
      el.addEventListener("mouseenter", () => { isPaused = true; });
      el.addEventListener("mouseleave", () => { isPaused = false; });
    });

    grid.addEventListener("touchstart", () => { isPaused = true; }, { passive: true });
    grid.addEventListener("touchend", () => {
      setTimeout(() => { isPaused = false; }, 1000);
    }, { passive: true });

    startAutoScroll();
  };

  // Setup both carousels
  setupCarousel(".amenities-grid", ".btn-carousel-prev", ".btn-carousel-next", 16, 4000);
  setupCarousel(".testimonials-grid", ".btn-testimonial-prev", ".btn-testimonial-next", 24, 5000);

  /* ==========================================
     5. CONTACT MODAL POPUP TRIGGER
     ========================================== */
  const contactModal = document.getElementById("contact-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const contactTriggers = document.querySelectorAll('a[href="#contact"]');

  if (contactModal && modalCloseBtn) {
    const openModal = (e) => {
      e.preventDefault();
      contactModal.classList.remove("hidden");
      document.body.classList.add("modal-open");
      
      // Auto focus on the first input inside the modal
      const firstInput = contactModal.querySelector(".form-input");
      if (firstInput) setTimeout(() => firstInput.focus(), 150);
    };

    const closeModal = () => {
      contactModal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    };

    // Attach click listeners to all buttons redirecting to #contact
    contactTriggers.forEach(trigger => {
      trigger.addEventListener("click", openModal);
    });

    modalCloseBtn.addEventListener("click", closeModal);

    // Close on overlay clicking
    contactModal.addEventListener("click", (e) => {
      if (e.target === contactModal) {
        closeModal();
      }
    });

    // Close on Escape press
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !contactModal.classList.contains("hidden")) {
        closeModal();
      }
    });
  }
});
