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
];

const ACTIVITY = [
  { type:'generate', text:'Generated 6 new drafts for <b>Q4 Thought Leadership</b> using Contrarian Operator', time:'12 min ago' },
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
  const map = { linkedin:['in','pg-linkedin'], x:['X','pg-x'], instagram:['ig','pg-instagram'], facebook:['f','pg-facebook'] };
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

const SOURCE_POSTS = [
  { id:'s1', date:'2026-09-10', snippet:'Unpopular opinion: most "culture fit" interviews are just a nicer way of saying "hires people like me." Here\'s what to ask instead.', likes:1284, comments:96, reposts:41, engagement:6.8 },
  { id:'s2', date:'2026-09-06', snippet:'We rejected a candidate for being "too senior." Then watched a competitor hire them and ship in 6 weeks what took us 6 months. Lesson learned.', likes:2210, comments:154, reposts:88, engagement:9.1 },
  { id:'s3', date:'2026-08-29', snippet:'Nobody wants to hear this, but your onboarding doc is not a substitute for a manager who shows up on day one.', likes:876, comments:52, reposts:19, engagement:4.4 },
  { id:'s4', date:'2026-08-22', snippet:'The real reason your best engineer is quiet in meetings has nothing to do with confidence.', likes:1590, comments:112, reposts:37, engagement:7.2 },
  { id:'s5', date:'2026-08-15', snippet:'Let\'s be honest: most "unlimited PTO" policies exist so companies don\'t have to pay out unused vacation. Here\'s how to tell the difference.', likes:3040, comments:201, reposts:120, engagement:11.4 },
  { id:'s6', date:'2026-08-08', snippet:'Here\'s the thing about 10x engineers — they\'re not writing 10x more code. They\'re asking 10x better questions before writing any.', likes:1988, comments:143, reposts:64, engagement:8.6 },
  { id:'s7', date:'2026-08-01', snippet:'I used to think flat organizations were the future. Three companies later, I think they\'re a slow-motion trust exercise with no safety net.', likes:1122, comments:80, reposts:28, engagement:5.9 },
  { id:'s8', date:'2026-07-24', snippet:'Your job posting says "fast-paced environment." Candidates read that as "chronically understaffed." Same thing, different framing.', likes:2650, comments:176, reposts:95, engagement:10.2 },
];

const CALENDAR_POSTS = [
  { day:2, title:'The real reason your best hires leave in year one', platform:'linkedin', status:'scheduled', project:'Q4 Thought Leadership' },
  { day:4, title:'What we got wrong about async standups', platform:'linkedin', status:'scheduled', project:'Q4 Thought Leadership' },
  { day:5, title:'Pulse 2.0: the metric that finally made sense to our CFO', platform:'linkedin', status:'published', project:'Product Launch — Pulse 2.0' },
  { day:9, title:'Week 3 of building in public: the pricing page rewrite', platform:'linkedin', status:'scheduled', project:'Founder Story Arc' },
  { day:11, title:'Unpopular opinion: your culture deck is not your culture', platform:'linkedin', status:'draft', project:'Hiring Season Push' },
  { day:12, title:'How we cut onboarding time from 3 weeks to 4 days', platform:'linkedin', status:'scheduled', project:'Q4 Thought Leadership' },
  { day:16, title:'The interview question that predicts retention better than any other', platform:'linkedin', status:'ready', project:'Hiring Season Push' },
  { day:18, title:'Customers keep asking for this Pulse 2.0 feature. Here\'s why we said no.', platform:'linkedin', status:'scheduled', project:'Product Launch — Pulse 2.0' },
  { day:22, title:'Month 14: the round we almost didn\'t close', platform:'linkedin', status:'draft', project:'Founder Story Arc' },
  { day:25, title:'Stop hiring for "10x engineers." Hire for this instead.', platform:'linkedin', status:'scheduled', project:'Hiring Season Push' },
];

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
