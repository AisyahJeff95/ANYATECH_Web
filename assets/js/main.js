/* ==========================================================================
   ANYA TECH — Shared UI Interactions
   Header frosted scroll & smart hide, mobile overlay, carousels, filters,
   architecture tabs, FAQ accordions, careers role accordions, contact modal.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     1. Header Scroll Glass & Smart Auto-Hide
     ------------------------------------------------------------------------ */
  const topnav = document.querySelector('.topnav');
  const scrollCue = document.getElementById('scrollCue');
  let lastY = window.scrollY;

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (topnav) {
        topnav.classList.toggle('is-scrolled', y > 16);
        if (y > 220 && y > lastY + 6) {
          topnav.classList.add('is-hidden');
        } else if (y < lastY - 4 || y <= 100) {
          topnav.classList.remove('is-hidden');
        }
      }
      if (scrollCue) {
        scrollCue.classList.toggle('is-faded', y > 60);
      }
      lastY = y;
    },
    { passive: true }
  );

  /* ------------------------------------------------------------------------
     2. Mobile Fullscreen Drawer Toggle
     ------------------------------------------------------------------------ */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. Horizontal Snap Carousels (Solutions & Research)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-carousel]').forEach((shell) => {
    const track = shell.querySelector('.carousel-track');
    const prev = shell.querySelector('[data-carousel-prev]');
    const next = shell.querySelector('[data-carousel-next]');
    if (!track) return;

    const step = () => Math.min(320, track.clientWidth * 0.85);
    if (prev) {
      prev.addEventListener('click', () => {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      });
    }
    if (next) {
      next.addEventListener('click', () => {
        track.scrollBy({ left: step(), behavior: 'smooth' });
      });
    }
  });

  /* ------------------------------------------------------------------------
     4. Filter Tabs (Homepage Solutions & Careers Open Roles)
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const targetSelector = group.getAttribute('data-filter-group');
    const items = document.querySelectorAll(targetSelector);
    const tabs = group.querySelectorAll('.filter-tab');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');
        tabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        items.forEach((item) => {
          const cat = item.getAttribute('data-category') || '';
          const match = filter === 'all' || cat.split(',').includes(filter);
          item.classList.toggle('is-hidden-card', !match);
          item.classList.toggle('is-hidden-role', !match);
        });
      });
    });
  });

  /* ------------------------------------------------------------------------
     5. Products Page Architecture Tabs
     ------------------------------------------------------------------------ */
  const archTabs = document.querySelectorAll('[data-arch-tab]');
  const archPanels = document.querySelectorAll('[data-arch-panel]');
  if (archTabs.length) {
    archTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-arch-tab');
        archTabs.forEach((b) => b.classList.toggle('is-active', b === btn));
        archPanels.forEach((p) =>
          p.classList.toggle('is-active', p.getAttribute('data-arch-panel') === id)
        );
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. FAQ & Role Accordions
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.querySelectorAll('.role-row__head').forEach((head) => {
    head.addEventListener('click', () => {
      const row = head.closest('.role-row');
      const isOpen = row.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(isOpen));
      const toggleLabel = head.querySelector('.role-row__toggle');
      if (toggleLabel) {
        toggleLabel.textContent = isOpen ? 'Close −' : 'Details +';
      }
    });
  });

  /* ------------------------------------------------------------------------
     7. Contact / Team Inquiry Modal
     ------------------------------------------------------------------------ */
  const modal = document.getElementById('contactModal');
  const modalTopic = document.getElementById('contactTopic');
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  function openModal(topic) {
    if (!modal) return;
    if (topic && modalTopic) {
      for (const opt of modalTopic.options) {
        if (opt.value === topic) {
          modalTopic.value = topic;
          break;
        }
      }
    }
    if (formStatus) formStatus.classList.remove('is-visible');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-contact]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.getAttribute('data-open-contact'));
    });
  });

  if (modal) {
    modal.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value.trim() || 'there';
      const email = document.getElementById('contactEmail')?.value.trim() || '';
      const topic = modalTopic?.value || 'General Inquiry';
      const message = document.getElementById('contactMessage')?.value.trim() || '';

      const subject = encodeURIComponent(`[Anya Tech] ${topic} — ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`
      );
      const targetEmail =
        topic === 'Careers & Roles' ? 'careers@anyatechnology.com' : 'hello@anyatechnology.com';

      formStatus.innerHTML = `Thank you, <strong>${name}</strong>. Your inquiry is ready — <a class="inline-link" href="mailto:${targetEmail}?subject=${subject}&body=${body}">open in your mail client (${targetEmail})</a> or copy <strong>${targetEmail}</strong> directly.`;
      formStatus.classList.add('is-visible');
      contactForm.reset();
    });
  }
});
