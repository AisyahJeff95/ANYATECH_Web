// ANYATECH Interactive Scripts

function initMainScript() {
  // Elements
  const header = document.querySelector('.header');
  const searchBtn = document.getElementById('searchBtn');
  const searchModalBackdrop = document.getElementById('searchModalBackdrop');
  const searchInput = document.getElementById('searchInput');
  const searchResultsList = document.getElementById('searchResultsList');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.querySelector('.nav-menu');

  // Header background transition on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Search Modal Functions
  const openSearchModal = () => {
    searchModalBackdrop.classList.add('active');
    setTimeout(() => searchInput.focus(), 150);
  };

  const closeSearchModal = () => {
    searchModalBackdrop.classList.remove('active');
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', openSearchModal);
  }

  if (searchModalBackdrop) {
    searchModalBackdrop.addEventListener('click', (e) => {
      if (e.target === searchModalBackdrop) {
        closeSearchModal();
      }
    });
  }

  // Keyboard shortcut Cmd/Ctrl + K or Escape to open/close search
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchModalBackdrop && searchModalBackdrop.classList.contains('active')) {
        closeSearchModal();
      } else if (searchModalBackdrop) {
        openSearchModal();
      }
    }
    if (e.key === 'Escape' && searchModalBackdrop && searchModalBackdrop.classList.contains('active')) {
      closeSearchModal();
    }
  });

  // Dynamic Search Filter Demo
  const searchData = [
    { title: 'Quantum Neural Systems', desc: 'Anya Tech hardware-accelerated deep learning algorithms.', category: 'Tech' },
    { title: 'Autonomous Micro-Services', desc: 'Anya Cloud zero-latency distributed architecture.', category: 'Tech' },
    { title: 'Biomimetic AI Research', desc: 'Anya Lab frontier exploration into neuro-inspired models.', category: 'Lab' },
    { title: 'Open-Source Physics Engine', desc: 'Anya Lab community simulation toolkit.', category: 'Lab' },
    { title: 'About ANYATECH Vision', desc: 'Our mission in solving computational impossibilities.', category: 'About' },
    { title: 'Leadership & Engineering Team', desc: 'Meet the minds building the future at ANYATECH.', category: 'About' }
  ];

  if (searchInput && searchResultsList) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      searchResultsList.innerHTML = '';

      if (query === '') {
        renderDefaultSearchResults();
        return;
      }

      const filtered = searchData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.desc.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        searchResultsList.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            No results found for "${query}"
          </div>
        `;
        return;
      }

      filtered.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'search-result-item';
        itemEl.innerHTML = `
          <div class="dropdown-icon" style="width: 32px; height: 32px; font-size: 0.75rem; font-weight: 700;">
            ${item.category}
          </div>
          <div class="search-result-text">
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
          </div>
        `;
        itemEl.addEventListener('click', () => {
          alert(`Navigating to: ${item.title}`);
          closeSearchModal();
        });
        searchResultsList.appendChild(itemEl);
      });
    });
  }

  function renderDefaultSearchResults() {
    if (!searchResultsList) return;
    searchResultsList.innerHTML = '';
    searchData.slice(0, 3).forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'search-result-item';
      itemEl.innerHTML = `
        <div class="dropdown-icon" style="width: 32px; height: 32px; font-size: 0.75rem; font-weight: 700;">
          ${item.category}
        </div>
        <div class="search-result-text">
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      `;
      itemEl.addEventListener('click', () => {
        alert(`Navigating to: ${item.title}`);
        closeSearchModal();
      });
      searchResultsList.appendChild(itemEl);
    });
  }

  renderDefaultSearchResults();

  // Mobile Menu & Dropdown Toggles
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown-menu');
    if (link && dropdown) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          const isActive = item.classList.contains('active');
          if (!isActive) {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        }
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMainScript);
} else {
  initMainScript();
}
