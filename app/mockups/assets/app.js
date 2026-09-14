/* Signal — shared interaction helpers */

function openOverlay(id){ document.getElementById(id)?.classList.add('is-open'); }
function closeOverlay(id){ document.getElementById(id)?.classList.remove('is-open'); }

function openDrawer(overlayId, drawerId){
  document.getElementById(overlayId)?.classList.add('is-open');
  document.getElementById(drawerId)?.classList.add('is-open');
}
function closeDrawer(overlayId, drawerId){
  document.getElementById(overlayId)?.classList.remove('is-open');
  document.getElementById(drawerId)?.classList.remove('is-open');
}

// Generic tab switcher: any element with [data-tabs] groups buttons with
// [data-tab-target] that toggle sibling panels matching [data-tab-panel].
function initTabs(){
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const buttons = group.querySelectorAll('[data-tab-target]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab-target');
        const scope = document.getElementById(group.getAttribute('data-tabs')) || document;
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        scope.querySelectorAll('[data-tab-panel]').forEach(panel => {
          panel.style.display = panel.getAttribute('data-tab-panel') === target ? '' : 'none';
        });
      });
    });
  });
}

// Renders a Style DNA strand into any element with [data-strand] using the
// element's data-traits (JSON: {tone,structure,hooks,vocabulary,rhythm}).
function renderStrands(){
  document.querySelectorAll('[data-strand]').forEach(el => {
    const raw = el.getAttribute('data-traits');
    if(!raw) return;
    let traits;
    try{ traits = JSON.parse(raw); } catch(e){ return; }
    const order = ['tone','structure','hooks','vocabulary','rhythm'];
    const total = order.reduce((s,k)=> s + (traits[k]||0), 0) || 1;
    el.innerHTML = order.map(k => {
      const val = traits[k] || 0;
      const pct = Math.max(6, (val/total)*100);
      return `<div class="strand-seg" data-trait="${k}" style="width:${pct}%" title="${k}: ${val}"></div>`;
    }).join('');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderStrands();

  // close overlays on backdrop click or escape
  document.querySelectorAll('.overlay').forEach(ov => {
    ov.addEventListener('click', e => { if(e.target === ov) ov.classList.remove('is-open'); });
  });
  document.querySelectorAll('.drawer-overlay').forEach(ov => {
    ov.addEventListener('click', () => {
      ov.classList.remove('is-open');
      document.querySelectorAll('.drawer.is-open').forEach(d => d.classList.remove('is-open'));
    });
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.overlay.is-open').forEach(ov => ov.classList.remove('is-open'));
      document.querySelectorAll('.drawer.is-open').forEach(d => d.classList.remove('is-open'));
      document.querySelectorAll('.drawer-overlay.is-open').forEach(d => d.classList.remove('is-open'));
    }
  });
});
