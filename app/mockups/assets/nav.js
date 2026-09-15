/* Signal — shared app shell (sidebar + topbar) */

const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  dna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 3c0 4 10 4 10 8s-10 4-10 8" stroke-linecap="round"/><path d="M17 3c0 4-10 4-10 8s10 4 10 8" stroke-linecap="round"/><path d="M8 7h8M8 17h8" stroke-linecap="round"/></svg>',
  projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" /></svg>',
  generate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" stroke-linecap="round"/></svg>',
  automation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" stroke-linecap="round"/></svg>',
  org: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 21V7l8-4 8 4v14" stroke-linejoin="round"/><path d="M4 21h16M9 21v-6h6v6" stroke-linejoin="round"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
};

const NAV_SECTIONS = [
  { label:'Overview', items:[
    { id:'dashboard', label:'Dashboard', href:'index.html', icon:'dashboard' },
  ]},
  { label:'Intelligence', items:[
    { id:'profiles', label:'Style Profiles', href:'style-profiles.html', icon:'dna', badge:'8' },
  ]},
  { label:'Create', items:[
    { id:'projects', label:'Projects', href:'projects.html', icon:'projects' },
  ]},
  { label:'Automate', items:[
    { id:'automation', label:'Automation', href:'automation.html', icon:'automation' },
  ]},
  { label:'Settings', items:[
    { id:'profile', label:'My profile', href:'profile.html', icon:'profile' },
    { id:'settings', label:'Organisation', href:'settings.html', icon:'org' },
  ]},
];

function renderSidebar(activePage){
  const sections = NAV_SECTIONS.map(sec => `
    <div class="nav-group">
      <div class="nav-label">${sec.label}</div>
      ${sec.items.map(it => `
        <a class="nav-item ${it.id===activePage?'active':''}" href="${it.href}">
          ${ICONS[it.icon]}
          <span>${it.label}</span>
          ${it.badge ? `<span class="nav-badge">${it.badge}</span>` : ''}
        </a>
      `).join('')}
    </div>
  `).join('');

  const ws = getActiveWorkspace();

  return `
    <div class="brand">
      <div class="brand-mark"></div>
      <div class="brand-name">Signal<span>.</span></div>
    </div>
    ${sections}
    <div class="sidebar-foot">
      <div class="platform-pill-row" title="Connected platforms">
        <div class="mini-platform active" title="LinkedIn">in</div>
        <div class="mini-platform active" title="X">X</div>
        <div class="mini-platform active" title="Blog">B</div>
        <div class="mini-platform" title="Instagram — coming soon">ig</div>
        <div class="mini-platform" title="Facebook — coming soon">f</div>
      </div>
      <div class="ws-switcher">
        <button class="user-chip ws-trigger" id="wsTrigger" onclick="toggleWorkspaceMenu(event)">
          <div class="avatar">${initials(ws.name)}</div>
          <div style="flex:1; min-width:0; text-align:left;">
            <div class="user-chip-name">${ws.name}</div>
            <div class="user-chip-role">${ws.kind==='organisation' ? 'Organisation' : 'Personal account'}</div>
          </div>
          <svg class="ws-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M7 10l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="ws-menu" id="wsMenu">
          <div class="ws-menu-label">Workspaces</div>
          ${WORKSPACES.map(w => `
            <button class="ws-menu-item ${w.id===ws.id?'is-active':''}" onclick="selectWorkspace('${w.id}')">
              <div class="avatar-xs">${initials(w.name)}</div>
              <span>${w.name}</span>
              ${w.id===ws.id ? '<span class="ws-check">✓</span>' : ''}
            </button>
          `).join('')}
          <div class="ws-menu-divider"></div>
          <a class="ws-menu-item" href="profile.html">My profile</a>
          <a class="ws-menu-item" href="settings.html">Organisation settings</a>
          <button class="ws-menu-item" onclick="closeWorkspaceMenu(); toast('Creating additional organisations is coming soon.')">+ New organisation</button>
          <div class="ws-menu-divider"></div>
          <button class="ws-menu-item ws-menu-danger" onclick="toast('Signed out (preview only).')">Sign out</button>
        </div>
      </div>
    </div>
  `;
}

function renderTopbar(title, sub){
  return `
    <div>
      <div class="topbar-title">${title}</div>
      ${sub ? `<div class="topbar-sub">${sub}</div>` : ''}
    </div>
    <div class="topbar-spacer"></div>
    <div class="platform-switch" id="platformSwitch">
      <button class="is-active" data-platform="linkedin"><span class="dot" style="color:#0A66C2"></span>LinkedIn</button>
      <button data-platform="x"><span class="dot" style="color:#0E1013"></span>X</button>
      <button data-platform="blog"><span class="dot" style="color:#2E6B5E"></span>Blog</button>
      <button class="is-soon" data-platform="instagram">Instagram</button>
      <button class="is-soon" data-platform="facebook">Facebook</button>
    </div>
    <div class="search-box">
      ${ICONS.search}
      <input type="text" placeholder="Search projects, profiles, posts…" />
    </div>
    <button class="icon-btn" aria-label="Notifications">${ICONS.bell}<span class="ping"></span></button>
  `;
}

function initShell(){
  const body = document.body;
  const page = body.getAttribute('data-page') || '';
  const title = body.getAttribute('data-title') || '';
  const sub = body.getAttribute('data-sub') || '';

  const sidebarRoot = document.getElementById('sidebar-root');
  if(sidebarRoot) sidebarRoot.innerHTML = renderSidebar(page);

  const topbarRoot = document.getElementById('topbar-root');
  if(topbarRoot) topbarRoot.innerHTML = renderTopbar(title, sub);

  const switchEl = document.getElementById('platformSwitch');
  if(switchEl){
    switchEl.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(btn.classList.contains('is-soon')){
          toast(`${btn.textContent.trim()} support is coming soon — LinkedIn, X and Blog are live today.`);
          return;
        }
        switchEl.querySelectorAll('button').forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  }

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('wsMenu');
    const trigger = document.getElementById('wsTrigger');
    if(menu && menu.classList.contains('is-open') && !menu.contains(e.target) && trigger && !trigger.contains(e.target)){
      menu.classList.remove('is-open');
    }
  });
}

function toggleWorkspaceMenu(e){
  e.stopPropagation();
  document.getElementById('wsMenu')?.classList.toggle('is-open');
}

function closeWorkspaceMenu(){
  document.getElementById('wsMenu')?.classList.remove('is-open');
}

function selectWorkspace(id){
  const ws = WORKSPACES.find(w => w.id === id);
  if(!ws) return;
  setActiveWorkspace(id);
  const sidebarRoot = document.getElementById('sidebar-root');
  if(sidebarRoot) sidebarRoot.innerHTML = renderSidebar(document.body.getAttribute('data-page') || '');
  toast(`Switched to ${ws.name}.`);
}

function toast(message){
  let host = document.getElementById('toast-host');
  if(!host){
    host = document.createElement('div');
    host.id = 'toast-host';
    host.style.position='fixed';
    host.style.bottom='24px';
    host.style.left='50%';
    host.style.transform='translateX(-50%)';
    host.style.zIndex='999';
    host.style.display='flex';
    host.style.flexDirection='column';
    host.style.gap='8px';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.textContent = message;
  el.style.background = '#151821';
  el.style.color = '#F2F0EA';
  el.style.padding = '11px 18px';
  el.style.borderRadius = '10px';
  el.style.fontSize = '13px';
  el.style.fontWeight = '500';
  el.style.boxShadow = '0 12px 40px -8px rgba(20,18,10,0.35)';
  el.style.opacity = '0';
  el.style.transition = 'opacity .2s ease, transform .2s ease';
  el.style.transform = 'translateY(6px)';
  host.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateY(0)'; });
  setTimeout(()=>{
    el.style.opacity='0';
    setTimeout(()=>el.remove(), 200);
  }, 2600);
}

document.addEventListener('DOMContentLoaded', initShell);
