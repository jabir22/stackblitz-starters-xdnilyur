// app.js
function initApp() {
  console.log('initApp() called'); // debug: confirm init runs
  const layout = document.querySelector('.layout');
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const profileMenu = document.querySelector('.profile-menu');
  const profileName = document.querySelector('.profile-name');
  const dropdown = document.querySelector('.profile-menu .dropdown');
  const breakpoint = 900;

  if (!layout) {
    console.warn('layout element not found. make sure HTML has <div class="layout">');
    return;
  }

  // restore sidebar state
  const stored = localStorage.getItem('bh_sidebarCollapsed');
  if (stored === 'true') layout.classList.add('sidebar-collapsed');

  function isMobile() { return window.innerWidth <= breakpoint; }

  function toggleSidebar() {
    if (isMobile()) {
      layout.classList.toggle('sidebar-open');
      layout.classList.remove('sidebar-collapsed');
    } else {
      const collapsed = layout.classList.toggle('sidebar-collapsed');
      localStorage.setItem('bh_sidebarCollapsed', collapsed ? 'true' : 'false');
      layout.classList.remove('sidebar-open');
    }
  }

  function closeMobileSidebar() {
    layout.classList.remove('sidebar-open');
  }

  function toggleProfileDropdown(e) {
    e && e.stopPropagation();
    if (!dropdown) return;
    dropdown.classList.toggle('open');
  }

  function closeProfileDropdown() {
    if (dropdown && dropdown.classList.contains('open')) dropdown.classList.remove('open');
  }

  function handleEsc(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeProfileDropdown();
      closeMobileSidebar();
    }
  }

  function handleDocumentClick(e) {
    if (dropdown && !profileMenu.contains(e.target)) closeProfileDropdown();
    if (layout.classList.contains('sidebar-open')) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMobileSidebar();
      }
    }
  }

  function setActiveSidebarLink() {
    const links = document.querySelectorAll('.sidebar a');
    const current = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      const target = href.split('/').pop();
      if (target === current) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function handleProfileKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleProfileDropdown(e);
    }
  }

  // attach events
  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  if (toggleBtn) {
    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSidebar();
      }
    });
  }

  if (profileName) {
    profileName.addEventListener('click', toggleProfileDropdown);
    profileName.addEventListener('keydown', handleProfileKey);
  }

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleEsc);
  setActiveSidebarLink();

  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileSidebar();
  });
}




















// add this function in JS/app.js (beside initApp or anywhere in app.js file)
function initSidebarAccordion() {
  // Find all submenu toggles (buttons)
  const toggles = document.querySelectorAll('.submenu-toggle');

  if (!toggles || toggles.length === 0) {
    // nothing to initialize
    return;
  }

  // helper functions
  function openSubmenu(parent, submenu) {
    parent.classList.add('open');
    // set aria
    const btn = parent.querySelector('.submenu-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'true');

    // make element visible by setting display block then set maxHeight to scrollHeight
    submenu.style.display = 'block';
    // force recalc
    const sh = submenu.scrollHeight;
    submenu.style.maxHeight = sh + 'px';
  }

  function closeSubmenu(parent, submenu) {
    parent.classList.remove('open');
    const btn = parent.querySelector('.submenu-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');

    // animate to 0, then hide after transition
    submenu.style.maxHeight = submenu.scrollHeight + 'px';
    // next frame set to 0 to animate
    requestAnimationFrame(() => {
      submenu.style.maxHeight = '0px';
    });

    // when transition ends, hide (so that scrollHeight later computes correctly)
    const onEnd = function (e) {
      if (e.propertyName === 'max-height') {
        // ensure it's closed
        if (!parent.classList.contains('open')) {
          submenu.style.display = 'none';
        }
        submenu.removeEventListener('transitionend', onEnd);
      }
    };
    submenu.addEventListener('transitionend', onEnd);
  }

  // close all others (accordion behavior). If you want multiple open allowed, skip this.
  function closeOtherSubmenus(exceptParent) {
    document.querySelectorAll('.has-sub.open').forEach(p => {
      if (p !== exceptParent) {
        const sm = p.querySelector('.submenu');
        if (sm) closeSubmenu(p, sm);
      }
    });
  }

  // Initialize: ensure all submenu elements are hidden (display none + maxHeight 0)
  document.querySelectorAll('.submenu').forEach(sm => {
    sm.style.display = 'none';
    sm.style.maxHeight = '0px';
  });

  // Attach click handlers
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = btn.closest('.has-sub');
      if (!parent) return;
      const submenu = parent.querySelector('.submenu');
      if (!submenu) return;

      const isOpen = parent.classList.contains('open');

      if (isOpen) {
        // close it
        closeSubmenu(parent, submenu);
      } else {
        // close others (accordion) then open this
        closeOtherSubmenus(parent);
        openSubmenu(parent, submenu);
      }
    });

    // keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}
