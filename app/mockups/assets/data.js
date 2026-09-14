/* Signal — shared mock data */

const STYLE_PROFILES = [
  {
    id:'sp-01', name:'Contrarian Operator', source:'linkedin.com/in/jordan-metz', platform:'linkedin',
    posts:34, updated:'2 days ago',
    traits:{ tone:82, structure:64, hooks:90, vocabulary:58, rhythm:70 },
    tone:'Direct, a little combative, allergic to hedging. Opens with a claim most of the audience quietly disagrees with, then dismantles it in plain language.',
    hook:'Contrarian claim',
    vocab:['unpopular opinion','here\'s the thing','nobody wants to hear this','let\'s be honest','the real reason'],
    pillars:['Hiring & talent','Startup operations','Career advice'],
  },
  {
    id:'sp-02', name:'Warm Educator', source:'linkedin.com/in/priya-shah', platform:'linkedin',
    posts:51, updated:'5 days ago',
    traits:{ tone:40, structure:88, hooks:55, vocabulary:72, rhythm:66 },
    tone:'Encouraging and structured, like a mentor talking you through a framework. Uses numbered breakdowns and closes with a reflective question.',
    hook:'Numbered framework',
    vocab:['here\'s what I learned','a simple framework','3 things that changed my approach','let that sink in'],
    pillars:['Product management','Career growth','Leadership'],
  },
  {
    id:'sp-03', name:'Data Storyteller', source:'linkedin.com/in/theo-lindqvist', platform:'linkedin',
    posts:28, updated:'1 week ago',
    traits:{ tone:55, structure:76, hooks:62, vocabulary:80, rhythm:48 },
    tone:'Analytical but conversational — leads with a surprising number, then explains the human story behind it.',
    hook:'Surprising statistic',
    vocab:['the data says','we ran the numbers','turns out','here\'s what surprised us'],
    pillars:['Marketing analytics','Growth','SaaS metrics'],
  },
  {
    id:'sp-04', name:'Founder Diary', source:'linkedin.com/in/asha-brennan', platform:'linkedin',
    posts:63, updated:'3 days ago',
    traits:{ tone:70, structure:50, hooks:74, vocabulary:65, rhythm:82 },
    tone:'Personal, unpolished, present-tense storytelling. Short punchy lines, vulnerable admissions, momentum-driven pacing.',
    hook:'In-the-moment story',
    vocab:['real talk','we almost didn\'t ship this','I was wrong about','here\'s the messy version'],
    pillars:['Startup journey','Fundraising','Team culture'],
  },
  {
    id:'sp-05', name:'Systems Thinker', source:'linkedin.com/in/kenji-osei', platform:'linkedin',
    posts:39, updated:'2 weeks ago',
    traits:{ tone:35, structure:92, hooks:48, vocabulary:60, rhythm:40 },
    tone:'Calm, methodical, almost academic — builds an argument in clearly separated stages with a takeaway line at the end.',
    hook:'Framing question',
    vocab:['consider this','the mental model I use','it comes down to','in practice, this means'],
    pillars:['Engineering leadership','Systems design','Productivity'],
  },
  {
    id:'sp-06', name:'Punchy Contrarian Jr.', source:'linkedin.com/in/nora-vance', platform:'linkedin',
    posts:19, updated:'yesterday',
    traits:{ tone:75, structure:45, hooks:85, vocabulary:50, rhythm:78 },
    tone:'Short sentences, bold declarations, built for the scroll. Rarely more than four lines per idea.',
    hook:'One-line declaration',
    vocab:['stop doing this','hot take','said no one ever','plot twist'],
    pillars:['Sales','Personal brand'],
  },
  {
    id:'sp-07', name:'Thread Builder', source:'x.com/kenji_ships', platform:'x',
    posts:47, updated:'4 days ago',
    traits:{ tone:60, structure:85, hooks:80, vocabulary:55, rhythm:72 },
    tone:'Punchy numbered threads that open with a bold claim and unpack it one tweet at a time, each line able to stand alone.',
    hook:'Numbered thread opener',
    vocab:['1/','here\'s the thread','a quick breakdown','tl;dr'],
    pillars:['Build in public','Product decisions'],
  },
  {
    id:'sp-08', name:'Technical Deep-Diver', source:'blog.acme.io/engineering', platform:'blog',
    posts:22, updated:'1 week ago',
    traits:{ tone:30, structure:90, hooks:40, vocabulary:78, rhythm:35 },
    tone:'Long-form, precise and example-driven — opens with the problem, walks through the investigation, and ends with a concrete takeaway.',
    hook:'Problem statement opener',
    vocab:['the root cause was','here\'s the trade-off','in production, this meant','the fix was simpler than expected'],
    pillars:['Engineering','Architecture','Case studies'],
  },
];

const PROJECTS = [
  {
    id:'pr-01', title:'Q4 Thought Leadership', platform:'linkedin',
    description:'Position our CEO as a credible voice on the future of async, remote-first engineering teams.',
    pillars:['Remote work','Engineering culture','Leadership'],
    styleProfiles:['sp-01','sp-05'],
    counts:{ draft:4, review:2, ready:1, scheduled:3, published:8 },
    updated:'Updated 2h ago',
  },
  {
    id:'pr-02', title:'Product Launch — Pulse 2.0', platform:'linkedin',
    description:'Announce and sustain momentum for the Pulse 2.0 analytics launch across three weeks.',
    pillars:['Product updates','Customer stories','Metrics'],
    styleProfiles:['sp-03'],
    counts:{ draft:2, review:3, ready:2, scheduled:5, published:1 },
    updated:'Updated yesterday',
  },
  {
    id:'pr-03', title:'Founder Story Arc', platform:'linkedin',
    description:'Serialized, personal storytelling around the company\'s first 18 months for founder-led growth.',
    pillars:['Startup journey','Fundraising','Team culture'],
    styleProfiles:['sp-04'],
    counts:{ draft:6, review:1, ready:0, scheduled:2, published:12 },
    updated:'Updated 3 days ago',
  },
  {
    id:'pr-04', title:'Hiring Season Push', platform:'linkedin',
    description:'Sharp, opinionated posts to attract senior engineering candidates during the Q3 hiring push.',
    pillars:['Hiring & talent','Engineering culture'],
    styleProfiles:['sp-01','sp-06'],
    counts:{ draft:1, review:0, ready:3, scheduled:1, published:6 },
    updated:'Updated 5 days ago',
  },
  {
    id:'pr-05', title:'Build in Public — X threads', platform:'x',
    description:'Daily and weekly X threads chronicling product decisions and metrics for an engaged founder audience.',
    pillars:['Build in public','Product decisions','Metrics'],
    styleProfiles:['sp-07'],
    counts:{ draft:3, review:1, ready:2, scheduled:4, published:5 },
    updated:'Updated 6h ago',
  },
  {
    id:'pr-06', title:'Engineering Blog — Deep Dives', platform:'blog',
    description:'Long-form technical articles for the company blog that establish engineering credibility and support SEO.',
    pillars:['Engineering','Architecture','Case studies'],
    styleProfiles:['sp-08'],
    counts:{ draft:2, review:1, ready:0, scheduled:1, published:4 },
    updated:'Updated yesterday',
  },
];

// Organisations (workspaces) — a user can act inside their personal account
// or a separate, single-owner Organisation with its own brand assets and
// connected channels. No multi-user membership or billing in v1.
const WORKSPACES = [
  { id:'ws-acme', kind:'organisation', name:'Acme Inc' },
  { id:'ws-personal', kind:'personal', name:'Mira Kessler' },
];

function initials(name){
  return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
}

function getActiveWorkspace(){
  const id = (typeof localStorage!=='undefined' && localStorage.getItem('signal_workspace')) || WORKSPACES[0].id;
  return WORKSPACES.find(w => w.id === id) || WORKSPACES[0];
}

function setActiveWorkspace(id){
  if(typeof localStorage!=='undefined') localStorage.setItem('signal_workspace', id);
}

const ACTIVITY = [
  { type:'schedule', text:'Scheduled a 7-part X thread for <b>Build in Public — X threads</b>', time:'8 min ago' },
  { type:'generate', text:'Generated 6 new drafts for <b>Q4 Thought Leadership</b> using Contrarian Operator', time:'12 min ago' },
  { type:'review', text:'Blog draft <i>"A practical guide to feature flags at scale"</i> moved to Pending Review in <b>Engineering Blog — Deep Dives</b>', time:'40 min ago' },
  { type:'analysis', text:'Finished analyzing 40 posts from <b>linkedin.com/in/nora-vance</b> — Style DNA ready', time:'1h ago' },
  { type:'publish', text:'Post <i>"The best engineers I\'ve hired all had this one habit"</i> published', time:'3h ago' },
  { type:'review', text:'2 drafts moved to Pending Review in <b>Product Launch — Pulse 2.0</b>', time:'6h ago' },
  { type:'schedule', text:'Scheduled 3 posts for next week in <b>Founder Story Arc</b>', time:'yesterday' },
  { type:'automation', text:'Automation "Monday Momentum" ran — 3 drafts created', time:'2 days ago' },
];

function styleProfileById(id){
  return STYLE_PROFILES.find(s => s.id === id);
}

function platformGlyph(platform){
  const map = { linkedin:['in','pg-linkedin'], x:['X','pg-x'], blog:['B','pg-blog'], instagram:['ig','pg-instagram'], facebook:['f','pg-facebook'] };
  const [label, cls] = map[platform] || map.linkedin;
  return `<span class="platform-glyph ${cls}">${label}</span>`;
}

function workflowBar(counts){
  const stages = [
    ['draft', counts.draft, 'var(--text-3)'],
    ['review', counts.review, 'var(--coral)'],
    ['ready', counts.ready, 'var(--violet)'],
    ['scheduled', counts.scheduled, 'var(--brass)'],
    ['published', counts.published, 'var(--teal)'],
  ];
  const total = stages.reduce((s,[,v])=>s+v,0) || 1;
  return `<div style="display:flex; height:6px; border-radius:99px; overflow:hidden; background:var(--surface-2);">
    ${stages.map(([name,val,color]) => val ? `<div title="${name}: ${val}" style="width:${(val/total)*100}%; background:${color};"></div>` : '').join('')}
  </div>`;
}

function renderProjectCard(p){
  const profiles = p.styleProfiles.map(styleProfileById).filter(Boolean);
  const totalPosts = Object.values(p.counts).reduce((a,b)=>a+b,0);
  const runCount = GENERATION_RUNS.filter(r => r.project === p.id).length;
  return `
    <a class="card card-pad" href="project-detail.html?id=${p.id}" style="display:block;">
      <div class="flex items-center justify-between mb-12">
        ${platformGlyph(p.platform)}
        <span class="text-xs text-muted">${p.updated}</span>
      </div>
      <div class="card-title mb-8" style="font-size:16px;">${p.title}</div>
      <p class="text-sm text-muted" style="line-height:1.5; margin-bottom:12px;">${p.description}</p>
      <div class="flex gap-6" style="flex-wrap:wrap; margin-bottom:14px;">
        ${p.pillars.map(pl => `<span class="tag">${pl}</span>`).join('')}
      </div>
      <div class="flex items-center gap-8 mb-12">
        ${profiles.map(sp => `<span class="dna-badge"><span class="strand" data-strand data-traits='${JSON.stringify(sp.traits)}'></span>${sp.name}</span>`).join('')}
      </div>
      ${workflowBar(p.counts)}
      <div class="flex items-center justify-between mt-8">
        <span class="text-xs text-muted">${totalPosts} posts · ${runCount} generation${runCount===1?'':'s'}</span>
        <span class="text-xs text-muted">${p.counts.scheduled} scheduled</span>
      </div>
    </a>
  `;
}

const ACTIVITY_ICON = {
  generate:'✦', analysis:'◎', publish:'▲', review:'◐', schedule:'▤', automation:'⟳'
};

const GENERATED_POSTS = [
  { id:'g1', run:'r1', project:'pr-01', styleProfile:'sp-01', status:'draft', title:'The real reason your best hires leave in year one', body:'Unpopular opinion: exit interviews are the least honest data your company collects. Here\'s what actually predicts a resignation, six months before it happens...', hook:'Contrarian claim', updated:'2h ago' },
  { id:'g2', run:'r2', project:'pr-01', styleProfile:'sp-05', status:'review', title:'What we got wrong about async standups', body:'Consider this: the mental model most teams use for async work is just synchronous work with worse latency. Here\'s the model I use instead...', hook:'Framing question', updated:'4h ago' },
  { id:'g3', run:'r1', project:'pr-01', styleProfile:'sp-01', status:'ready', title:'Stop hiring for "10x engineers." Hire for this instead.', body:'Nobody wants to hear this, but the 10x engineer myth has cost more teams velocity than it\'s ever created. Here\'s the trait that actually compounds...', hook:'Contrarian claim', updated:'yesterday' },
  { id:'g4', run:'r2', project:'pr-01', styleProfile:'sp-05', status:'scheduled', title:'How we cut onboarding time from 3 weeks to 4 days', body:'In practice, this means rethinking what "ready to ship" means for a new hire. Three changes, in order of impact...', hook:'Framing question', updated:'2 days ago' },
  { id:'g5', run:'r3', project:'pr-02', styleProfile:'sp-03', status:'review', title:'Pulse 2.0: the metric that finally made sense to our CFO', body:'The data says most dashboards optimize for the person building them, not the person reading them. Here\'s what we changed...', hook:'Surprising statistic', updated:'5h ago' },
  { id:'g6', run:'r3', project:'pr-02', styleProfile:'sp-03', status:'scheduled', title:'Customers keep asking for this Pulse 2.0 feature. Here\'s why we said no.', body:'We ran the numbers on the most requested feature of the year. Turns out saying no was the right call — here\'s the reasoning...', hook:'Surprising statistic', updated:'1 day ago' },
  { id:'g7', run:'r4', project:'pr-03', styleProfile:'sp-04', status:'draft', title:'Month 14: the round we almost didn\'t close', body:'Real talk: we had eleven days of runway when the term sheet finally came through. Here\'s the messy version of how we got there...', hook:'In-the-moment story', updated:'1h ago' },
  { id:'g8', run:'r4', project:'pr-03', styleProfile:'sp-04', status:'published', title:'Week 3 of building in public: the pricing page rewrite', body:'We almost didn\'t ship this. Three rewrites, one very honest Slack thread, and a pricing page that finally makes sense...', hook:'In-the-moment story', updated:'3 days ago' },
  { id:'g9', run:'r5', project:'pr-04', styleProfile:'sp-06', status:'ready', title:'The interview question that predicts retention better than any other', body:'Hot take: "where do you see yourself in 5 years" is a wasted question. Ask this instead...', hook:'One-line declaration', updated:'6h ago' },
  { id:'g10', run:'r6', project:'pr-04', styleProfile:'sp-01', status:'published', title:'Unpopular opinion: your culture deck is not your culture', body:'Let\'s be honest — nobody has ever quit a job because the values weren\'t laminated. Here\'s what actually keeps people...', hook:'Contrarian claim', updated:'4 days ago' },
  { id:'g11', run:'r7', project:'pr-05', styleProfile:'sp-07', status:'draft', title:'Thread: the pricing page rewrite, in 7 posts', body:'1/ We rewrote our pricing page for the third time this year. Here\'s the messy version of why the first two attempts failed...', hook:'Numbered thread opener', updated:'3h ago' },
  { id:'g12', run:'r7', project:'pr-05', styleProfile:'sp-07', status:'scheduled', title:'Thread: what breaks first when you 10x signups', body:'1/ Everyone warns you about scaling infra. Nobody warns you about scaling support. Here\'s what broke first...', hook:'Numbered thread opener', updated:'1 day ago' },
  { id:'g13', run:'r8', project:'pr-06', styleProfile:'sp-08', status:'draft', title:'How we cut our p95 API latency by 60% without a rewrite', body:'The root cause was never the algorithm — it was three sequential calls that could run in parallel. Here\'s how we found it, and the two other changes that mattered most...', hook:'Problem statement opener', updated:'5h ago' },
  { id:'g14', run:'r8', project:'pr-06', styleProfile:'sp-08', status:'review', title:'A practical guide to feature flags at scale', body:'In production, this meant treating feature flags as a first-class part of the architecture, not an afterthought bolted onto CI. Here\'s the system we landed on...', hook:'Problem statement opener', updated:'2 days ago' },
];

// A generation is one AI Generation run within a project: a batch of posts
// created together from the same project context and a chosen Style DNA.
const GENERATION_RUNS = [
  { id:'r1', project:'pr-01', styleProfile:'sp-01', createdAt:'Sep 12', label:'Batch #4' },
  { id:'r2', project:'pr-01', styleProfile:'sp-05', createdAt:'Sep 10', label:'Batch #3' },
  { id:'r3', project:'pr-02', styleProfile:'sp-03', createdAt:'Sep 11', label:'Batch #2' },
  { id:'r4', project:'pr-03', styleProfile:'sp-04', createdAt:'Sep 13', label:'Batch #6' },
  { id:'r5', project:'pr-04', styleProfile:'sp-06', createdAt:'Sep 9', label:'Batch #3' },
  { id:'r6', project:'pr-04', styleProfile:'sp-01', createdAt:'Sep 6', label:'Batch #2' },
  { id:'r7', project:'pr-05', styleProfile:'sp-07', createdAt:'Sep 13', label:'Batch #2' },
  { id:'r8', project:'pr-06', styleProfile:'sp-08', createdAt:'Sep 12', label:'Batch #3' },
];

const AUTOMATIONS = [
  { id:'a1', name:'Monday Momentum', project:'pr-01', style:'sp-01', schedule:'Every Monday at 9:00 AM', count:3, output:'draft', active:true, lastRun:'Mon, Sep 8 · 3 drafts created', nextRun:'Mon, Sep 15' },
  { id:'a2', name:'Pulse launch drip', project:'pr-02', style:'sp-03', schedule:'Mon & Thu at 8:30 AM', count:2, output:'review', active:true, lastRun:'Thu, Sep 11 · 2 drafts created', nextRun:'Mon, Sep 15' },
  { id:'a3', name:'Founder weekly recap', project:'pr-03', style:'sp-04', schedule:'Every Friday at 4:00 PM', count:1, output:'draft', active:false, lastRun:'Fri, Aug 29 · 1 draft created', nextRun:'Paused' },
  { id:'a4', name:'Hiring push — daily hot takes', project:'pr-04', style:'sp-06', schedule:'Weekdays at 7:00 AM', count:1, output:'publish', active:true, lastRun:'Today · 1 post published', nextRun:'Tomorrow, 7:00 AM' },
];

function projectById(id){ return PROJECTS.find(p => p.id === id); }
function postsForProject(id){ return GENERATED_POSTS.filter(g => g.project === id); }
function runsForProject(id){ return GENERATION_RUNS.filter(r => r.project === id).sort((a,b)=> b.createdAt.localeCompare(a.createdAt)); }
function postsForRun(runId){ return GENERATED_POSTS.filter(g => g.run === runId); }
function runById(id){ return GENERATION_RUNS.find(r => r.id === id); }

function renderActivityItem(a){
  return `
    <li class="flex gap-12" style="padding:11px 0; border-bottom:1px solid var(--line);">
      <span style="width:26px;height:26px;border-radius:50%;background:var(--surface-2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px;flex:none;color:var(--brass-ink);">${ACTIVITY_ICON[a.type]||'•'}</span>
      <span style="font-size:13px; line-height:1.5;">${a.text}<br><span class="text-xs text-muted">${a.time}</span></span>
    </li>
  `;
}
