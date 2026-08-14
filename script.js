(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.page-progress span');
  const hero = document.querySelector('.hero');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 820px)');
  const parallaxLayers = [...document.querySelectorAll('[data-speed]')];
  const process = document.querySelector('[data-process]');
  const story = document.querySelector('[data-story]');
  const depthScenes = [...document.querySelectorAll('.depth-scene')];
  let ticking = false;

  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const arrowSvg = (direction) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('flow-arrow', `flow-arrow-${direction}`);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 12h14M13 6l6 6-6 6');
    svg.append(path);
    return svg;
  };

  const isArrowOnly = (value) => /^[\u2190-\u21ff\u27f0-\u27ff]+$/.test(value.trim());

  document.querySelectorAll('.button, .header-cta, .mobile-menu-cta, .next-orbit').forEach((button) => {
    button.classList.add('flow-button');
    button.removeAttribute('data-magnetic');
    button.style.removeProperty('transform');

    let label = [...button.children].find((child) => {
      if (child.matches('svg, i')) return false;
      const value = child.textContent.trim();
      return value && !isArrowOnly(value);
    });

    const looseText = [...button.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      .map((node) => node.textContent.trim())
      .join(' ');

    if (!label || looseText) {
      if (looseText) {
        [...button.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
          .forEach((node) => node.remove());
      }
      if (!label) {
        label = document.createElement('span');
        label.textContent = looseText;
        button.prepend(label);
      }
    }
    label.classList.add('flow-label');

    let rightArrow = [...button.children].find((child) => {
      if (child === label) return false;
      return child.matches('svg, i') || isArrowOnly(child.textContent);
    });
    if (!rightArrow) {
      rightArrow = arrowSvg('right');
      button.append(rightArrow);
    } else {
      rightArrow.classList.add('flow-arrow', 'flow-arrow-right');
      rightArrow.setAttribute('aria-hidden', 'true');
    }

    const fill = document.createElement('span');
    fill.className = 'flow-fill';
    fill.setAttribute('aria-hidden', 'true');
    button.prepend(fill);
    button.insertBefore(arrowSvg('left'), label);
  });

  function updateScrollEffects() {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    progress.style.transform = `scaleX(${clamp(scrollY / maxScroll, 0, 1)})`;
    header.classList.toggle('scrolled', scrollY > 24);

    if (!reduceMotion.matches && !compactViewport.matches) {
      parallaxLayers.forEach((layer) => {
        const rect = layer.parentElement.getBoundingClientRect();
        if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
          const speed = Number(layer.dataset.speed || 0);
          const offset = (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * speed;
          layer.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
        }
      });
    }

    if (process) {
      const rect = process.getBoundingClientRect();
      const start = window.innerHeight * 0.72;
      const span = Math.max(rect.height + window.innerHeight * 0.15, 1);
      const value = clamp((start - rect.top) / span, 0, 1);
      process.style.setProperty('--process-progress', value.toFixed(3));
    }

    if (story) {
      const rect = story.getBoundingClientRect();
      const start = window.innerHeight * 0.68;
      const span = Math.max(rect.height - window.innerHeight * 0.35, 1);
      const value = clamp((start - rect.top) / span, 0, 1);
      story.style.setProperty('--story-progress', value.toFixed(3));
    }

    if (!reduceMotion.matches && !compactViewport.matches) {
      depthScenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom > -120 && rect.top < window.innerHeight + 120) {
          const lift = clamp((window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * 0.035, -24, 24);
          scene.style.setProperty('--lift', `${lift.toFixed(2)}px`);
        }
      });
    }

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollEffects);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  updateScrollEffects();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -4% 0px' });

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  if (hero && window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      hero.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  const innerHero = document.querySelector('.inner-hero');
  if (innerHero && window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
    innerHero.addEventListener('pointermove', (event) => {
      const rect = innerHero.getBoundingClientRect();
      innerHero.style.setProperty('--scene-x', `${event.clientX - rect.left}px`);
      innerHero.style.setProperty('--scene-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  }

  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.toggleAttribute('inert', !open);
    mobileMenu.classList.toggle('open', open);
    body.classList.toggle('menu-open', open);
    if (open) {
      requestAnimationFrame(() => mobileMenu.querySelector('a')?.focus());
    }
  }

  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      document.querySelectorAll('details[open]').forEach((openDetails) => {
        if (openDetails !== details) openDetails.removeAttribute('open');
      });
    });
  });

  const testimonialCards = [...document.querySelectorAll('[data-testimonial-card]')];
  testimonialCards.forEach((card) => {
    const video = card.querySelector('[data-testimonial-video]');
    const playButton = card.querySelector('[data-video-play]');
    if (!video || !playButton) return;

    const resetVideo = () => {
      video.pause();
      video.controls = false;
      card.classList.remove('is-playing');
      if (video.ended) {
        video.currentTime = 0;
        video.load();
      }
    };

    playButton.addEventListener('click', () => {
      testimonialCards.forEach((otherCard) => {
        if (otherCard === card) return;
        const otherVideo = otherCard.querySelector('[data-testimonial-video]');
        if (!otherVideo) return;
        otherVideo.pause();
        otherVideo.currentTime = 0;
        otherVideo.controls = false;
        otherCard.classList.remove('is-playing');
      });

      video.controls = true;
      card.classList.add('is-playing');
      video.play().catch(() => {
        video.controls = false;
        card.classList.remove('is-playing');
      });
    });

    video.addEventListener('ended', resetVideo);
  });

  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
    document.querySelectorAll('[data-magnetic]').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = 'translate3d(0, 0, 0)';
      });
    });

    document.querySelectorAll('[data-tilt]').forEach((element) => {
      let tiltFrame = 0;
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const strength = Number(element.dataset.tiltStrength || 5);
        const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        cancelAnimationFrame(tiltFrame);
        tiltFrame = requestAnimationFrame(() => {
          element.classList.add('is-interacting');
          element.style.setProperty('--ry', `${((px - 0.5) * strength * 2).toFixed(2)}deg`);
          element.style.setProperty('--rx', `${((0.5 - py) * strength * 2).toFixed(2)}deg`);
          element.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
          element.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        });
      }, { passive: true });

      element.addEventListener('pointerleave', () => {
        cancelAnimationFrame(tiltFrame);
        element.classList.remove('is-interacting');
        element.style.setProperty('--ry', '0deg');
        element.style.setProperty('--rx', '0deg');
      });
    });

    document.querySelectorAll('.process-step').forEach((step) => {
      let stepFrame = 0;
      step.addEventListener('pointermove', (event) => {
        const rect = step.getBoundingClientRect();
        cancelAnimationFrame(stepFrame);
        stepFrame = requestAnimationFrame(() => {
          step.style.setProperty('--step-x', `${event.clientX - rect.left}px`);
          step.style.setProperty('--step-y', `${event.clientY - rect.top}px`);
        });
      }, { passive: true });
      step.addEventListener('pointerleave', () => {
        cancelAnimationFrame(stepFrame);
        step.style.removeProperty('--step-x');
        step.style.removeProperty('--step-y');
      });
    });
  }

  const processSteps = [...document.querySelectorAll('.process-step')];
  if (processSteps.length && 'IntersectionObserver' in window) {
    const activeStepObserver = new IntersectionObserver((entries) => {
      const visibleStep = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visibleStep) return;
      processSteps.forEach((step) => step.classList.toggle('is-current', step === visibleStep.target));
    }, { threshold: [0.35, 0.55, 0.75], rootMargin: '-18% 0px -32% 0px' });
    processSteps.forEach((step) => activeStepObserver.observe(step));
  } else if (processSteps.length) {
    processSteps[0].classList.add('is-current');
  }

  const valueCarousel = document.querySelector('[data-value-carousel]');
  if (valueCarousel && compactViewport.matches) {
    const viewport = valueCarousel.querySelector('[data-value-viewport]');
    const cards = [...valueCarousel.querySelectorAll('[data-value-card]')];
    valueCarousel.classList.add('is-mobile-story');
    viewport.removeAttribute('tabindex');
    viewport.setAttribute('aria-roledescription', 'sequência vertical');
    viewport.setAttribute('aria-label', 'Etapas da jornada de negociação. Role para avançar.');

    cards.forEach((card, index) => {
      card.style.removeProperty('transform');
      card.style.removeProperty('z-index');
      card.style.removeProperty('--card-opacity');
      card.removeAttribute('aria-current');
      card.setAttribute('aria-label', `${index + 1} de ${cards.length}: ${card.dataset.cardTitle}`);
    });

    if ('IntersectionObserver' in window && !reduceMotion.matches) {
      const mobileCardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-mobile-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: .42, rootMargin: '0px 0px -8% 0px' });
      cards.forEach((card) => mobileCardObserver.observe(card));
    } else {
      cards.forEach((card) => card.classList.add('is-mobile-visible'));
    }
  } else if (valueCarousel) {
    const viewport = valueCarousel.querySelector('[data-value-viewport]');
    const cards = [...valueCarousel.querySelectorAll('[data-value-card]')];
    const dots = [...valueCarousel.querySelectorAll('[data-value-dot]')];
    const toggle = valueCarousel.querySelector('[data-value-toggle]');
    const previous = valueCarousel.querySelector('[data-value-prev]');
    const next = valueCarousel.querySelector('[data-value-next]');
    const count = valueCarousel.querySelector('[data-value-count]');
    const title = valueCarousel.querySelector('[data-value-title]');
    const total = cards.length;
    const fullTurn = Math.PI * 2;
    const step = fullTurn / total;
    let position = 0;
    let target = 0;
    let frame = 0;
    let lastTime = performance.now();
    let activeIndex = -1;
    let isVisible = false;
    let isDragging = false;
    let dragX = 0;
    let viewportWidth = viewport.clientWidth;
    let cardWidth = cards[0].getBoundingClientRect().width;
    let autoTimer = 0;
    let autoPaused = false;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const modulo = (value, size) => ((value % size) + size) % size;

    const updateMetrics = () => {
      viewportWidth = viewport.clientWidth;
      cardWidth = cards[0].getBoundingClientRect().width;
    };

    const updateActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      cards.forEach((card, cardIndex) => {
        if (cardIndex === index) card.setAttribute('aria-current', 'true');
        else card.removeAttribute('aria-current');
      });
      dots.forEach((dot, dotIndex) => dot.setAttribute('aria-pressed', String(dotIndex === index)));
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      title.textContent = cards[index].dataset.cardTitle;
    };

    const requestCarouselFrame = () => {
      if (!frame) frame = requestAnimationFrame(renderCarousel);
    };

    const scheduleAuto = () => {
      window.clearTimeout(autoTimer);
      if (reduceMotion.matches || !isVisible || document.hidden || isDragging || autoPaused) return;
      autoTimer = window.setTimeout(() => {
        target = Math.round(target) + 1;
        requestCarouselFrame();
        scheduleAuto();
      }, 5000);
    };

    const goBy = (amount) => {
      target = Math.round(target) + amount;
      requestCarouselFrame();
      scheduleAuto();
    };

    const goTo = (index) => {
      const base = Math.round(target);
      const current = modulo(base, total);
      let distance = index - current;
      if (distance > total / 2) distance -= total;
      if (distance < -total / 2) distance += total;
      target = base + distance;
      requestCarouselFrame();
      scheduleAuto();
    };

    function renderCarousel(time) {
      frame = 0;
      const deltaTime = Math.min(Math.max(time - lastTime, 0), 40);
      lastTime = time;
      const smoothing = reduceMotion.matches ? 1 : 1 - Math.exp(-deltaTime * .009);
      position += (target - position) * smoothing;
      pointer.x += (pointer.targetX - pointer.x) * (reduceMotion.matches ? 1 : .09);
      pointer.y += (pointer.targetY - pointer.y) * (reduceMotion.matches ? 1 : .09);

      const xRadius = Math.min(viewportWidth * .39, 555);
      const zRadius = Math.min(Math.max(viewportWidth * .18, 145), 285);
      const selected = modulo(Math.round(position), total);

      cards.forEach((card, index) => {
        let offset = index - position;
        while (offset > total / 2) offset -= total;
        while (offset < -total / 2) offset += total;

        const angle = offset * step;
        const depth = Math.cos(angle);
        const frontFactor = Math.pow((depth + 1) / 2, 1.35);
        const x = Math.sin(angle) * xRadius;
        const y = Math.sin(angle * 2) * Math.min(viewportWidth * .012, 16);
        const z = depth * zRadius;
        const rotation = angle * 180 / Math.PI;
        const scale = .76 + frontFactor * .24;
        card.style.setProperty('--card-opacity', String(.16 + frontFactor * .84));
        card.style.zIndex = String(Math.round((depth + 1) * 100));
        card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px) rotateY(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

        const volume = card.firstElementChild;
        const isSelected = index === selected && !reduceMotion.matches;
        volume.style.setProperty('--tilt-x', `${isSelected ? (-pointer.y * 5).toFixed(2) : 0}deg`);
        volume.style.setProperty('--tilt-y', `${isSelected ? (pointer.x * 6).toFixed(2) : 0}deg`);
        volume.style.setProperty('--shine-x', `${(50 + pointer.x * 27).toFixed(1)}%`);
        volume.style.setProperty('--shine-y', `${(38 + pointer.y * 24).toFixed(1)}%`);
      });

      updateActive(selected);
      const positionMoving = Math.abs(target - position) > .0005;
      const pointerMoving = Math.abs(pointer.targetX - pointer.x) > .002 || Math.abs(pointer.targetY - pointer.y) > .002;
      if (isVisible && (positionMoving || pointerMoving || isDragging)) requestCarouselFrame();
    }

    previous.addEventListener('click', () => goBy(-1));
    next.addEventListener('click', () => goBy(1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
    toggle.addEventListener('click', () => {
      autoPaused = !autoPaused;
      toggle.setAttribute('aria-pressed', String(autoPaused));
      toggle.setAttribute('aria-label', autoPaused ? 'Retomar rotação automática' : 'Pausar rotação automática');
      toggle.querySelector('span').textContent = autoPaused ? '▶' : 'Ⅱ';
      if (autoPaused) window.clearTimeout(autoTimer);
      else scheduleAuto();
    });

    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goBy(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goBy(1); }
    });

    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      isDragging = true;
      dragX = event.clientX;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
      window.clearTimeout(autoTimer);
      requestCarouselFrame();
    });

    viewport.addEventListener('pointermove', (event) => {
      const rect = viewport.getBoundingClientRect();
      pointer.targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      pointer.targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);

      if (isDragging) {
        const movement = event.clientX - dragX;
        dragX = event.clientX;
        target -= movement / Math.max(cardWidth * .72, 180);
        position += (target - position) * .55;
      }
      requestCarouselFrame();
    }, { passive: true });

    const finishDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      target = Math.round(target);
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      requestCarouselFrame();
      scheduleAuto();
    };
    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);
    viewport.addEventListener('pointerleave', () => {
      if (!isDragging) {
        pointer.targetX = 0;
        pointer.targetY = 0;
        requestCarouselFrame();
      }
    });

    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible) {
          updateMetrics();
          requestCarouselFrame();
          scheduleAuto();
        } else {
          window.clearTimeout(autoTimer);
        }
      }, { threshold: .15 });
      visibilityObserver.observe(valueCarousel);
    } else {
      isVisible = true;
      scheduleAuto();
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => { updateMetrics(); requestCarouselFrame(); }).observe(viewport);
    } else {
      window.addEventListener('resize', () => { updateMetrics(); requestCarouselFrame(); }, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearTimeout(autoTimer);
      else { requestCarouselFrame(); scheduleAuto(); }
    });
    const handleMotionPreference = () => { requestCarouselFrame(); scheduleAuto(); };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', handleMotionPreference);
    else reduceMotion.addListener(handleMotionPreference);
    updateActive(0);
    requestCarouselFrame();
  }

  const faqLibrary = document.querySelector('[data-faq-library]');
  if (faqLibrary) {
    const search = document.querySelector('#faq-search');
    const filterButtons = [...document.querySelectorAll('[data-faq-filter]')];
    const questions = [...faqLibrary.querySelectorAll('details[data-category]')];
    const count = document.querySelector('[data-faq-count]');
    const empty = document.querySelector('[data-faq-empty]');
    let activeCategory = 'all';

    const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const applyFaqFilters = () => {
      const term = normalize(search.value);
      let visible = 0;
      questions.forEach((question) => {
        const matchesCategory = activeCategory === 'all' || question.dataset.category === activeCategory;
        const searchable = normalize(`${question.dataset.search || ''} ${question.textContent}`);
        const matchesTerm = !term || searchable.includes(term);
        const show = matchesCategory && matchesTerm;
        question.hidden = !show;
        if (!show) question.removeAttribute('open');
        if (show) visible += 1;
      });
      count.textContent = String(visible);
      empty.hidden = visible !== 0;
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.faqFilter;
        filterButtons.forEach((item) => {
          const selected = item === button;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        applyFaqFilters();
      });
    });
    search.addEventListener('input', applyFaqFilters);
  }

  const partnerForm = document.querySelector('[data-partner-form]');
  if (partnerForm) {
    document.querySelectorAll('.header-cta, .mobile-menu-cta').forEach((entryCta) => {
      entryCta.setAttribute('href', '#seja-parceiro');
      entryCta.removeAttribute('target');
      entryCta.removeAttribute('rel');
    });
    const status = partnerForm.querySelector('[data-form-status]');
    const fields = [...partnerForm.querySelectorAll('input:not([type="checkbox"]), select, textarea')];
    const consent = partnerForm.querySelector('input[name="consent"]');
    const phone = partnerForm.querySelector('input[name="whatsapp"]');

    const errorFor = (field) => partnerForm.querySelector(`[data-error-for="${field.id}"]`);
    const setFieldError = (field, message = '') => {
      field.setAttribute('aria-invalid', String(Boolean(message)));
      const error = errorFor(field);
      if (error) error.textContent = message;
      return !message;
    };

    const validateField = (field) => {
      const value = field.value.trim();
      if (field.required && !value) return setFieldError(field, 'Preencha este campo para continuar.');
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return setFieldError(field, 'Informe um e-mail válido.');
      }
      if (field.name === 'whatsapp' && value) {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) return setFieldError(field, 'Informe um WhatsApp com DDD.');
      }
      if (field.minLength > 0 && value && value.length < field.minLength) {
        return setFieldError(field, `Use pelo menos ${field.minLength} caracteres.`);
      }
      return setFieldError(field);
    };

    const formatBrazilianPhone = (value) => {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 2) return digits ? `(${digits}` : '';
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    phone.addEventListener('input', () => {
      phone.value = formatBrazilianPhone(phone.value);
      if (phone.getAttribute('aria-invalid') === 'true') validateField(phone);
    });

    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
      field.addEventListener('change', () => validateField(field));
    });

    consent.addEventListener('change', () => {
      consent.closest('.form-consent').classList.toggle('has-error', !consent.checked);
    });

    partnerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fieldsAreValid = fields.map(validateField).every(Boolean);
      const consentIsValid = consent.checked;
      consent.closest('.form-consent').classList.toggle('has-error', !consentIsValid);

      if (!fieldsAreValid || !consentIsValid) {
        status.classList.remove('is-success');
        status.textContent = 'Revise os campos indicados antes de enviar.';
        const firstInvalid = partnerForm.querySelector('[aria-invalid="true"], .form-consent.has-error input');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const data = new FormData(partnerForm);
      const optionalRegistration = String(data.get('registration') || '').trim() || 'Não informado';
      const message = [
        'Olá! Quero ser parceiro da Legacy Ativos Judiciais.',
        '',
        '*APRESENTAÇÃO DO PARCEIRO*',
        `Nome: ${data.get('name')}`,
        `Perfil: ${data.get('profile')}`,
        `OAB/Empresa: ${optionalRegistration}`,
        `WhatsApp: ${data.get('whatsapp')}`,
        `E-mail: ${data.get('email')}`,
        `Localização: ${data.get('city')} - ${data.get('state')}`,
        `Oportunidade: ${data.get('opportunity')}`,
        '',
        '*SOBRE A ATUAÇÃO*',
        String(data.get('message')).trim()
      ].join('\n');

      status.classList.add('is-success');
      status.textContent = 'Dados validados. Abrindo sua apresentação no WhatsApp…';
      const link = document.createElement('a');
      link.href = `https://wa.me/5511948179546?text=${encodeURIComponent(message)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.append(link);
      link.click();
      link.remove();
    });
  }

  const transitionLayer = document.querySelector('.page-transition');
  if (transitionLayer && !reduceMotion.matches) {
    document.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || url.hash || !url.pathname.endsWith('.html')) return;
        if (url.href === window.location.href) return;
        event.preventDefault();
        body.classList.add('is-leaving');
        window.setTimeout(() => { window.location.href = url.href; }, 470);
      });
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
