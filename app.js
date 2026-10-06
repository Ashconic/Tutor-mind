const lessonModal = document.querySelector('#lesson-modal');
const tutorModal = document.querySelector('#tutor-modal');
const totalXp = document.querySelector('#total-xp');
const feedback = document.querySelector('#answer-feedback');
const topics = ['All', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Arithmetic'];
const lessons = [
  ['Linear equations', 'Algebra', 3, 50, 'Solve for unknowns using inverse operations.', true],
  ['Quadratic patterns', 'Algebra', 4, 60, 'Recognize and factor common quadratic forms.', false],
  ['Angles in motion', 'Geometry', 2, 40, 'Use angle relationships to map a shape.', false],
  ['Area and perimeter', 'Geometry', 3, 45, 'Measure the world with reliable formulas.', true],
  ['Limits, intuitively', 'Calculus', 5, 80, 'See what a function approaches before it arrives.', false],
  ['Probability basics', 'Statistics', 2, 35, 'Make better predictions from simple events.', false],
  ['Fractions to decimals', 'Arithmetic', 1, 30, 'Move between representations with confidence.', false]
];
const defaultState = { username: 'Alex Smith', email: 'student1@mathlingo.com', xp: 1240, streak: 7, completed: 2, loggedIn: true };
const state = JSON.parse(localStorage.getItem('mathlingo-state') || JSON.stringify(defaultState));

function saveState() {
  localStorage.setItem('mathlingo-state', JSON.stringify(state));
  if (state.email) {
    localStorage.setItem(`mathlingo-state-${state.email.toLowerCase()}`, JSON.stringify(state));
  }
}
function openModal(modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }
function closeModal(modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
function initials() { return (state.username || 'Student').split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase(); }
function updateIdentity() {
  document.querySelectorAll('.avatar, .top-avatar').forEach((node) => { node.textContent = initials(); });
  document.querySelector('.profile-mini strong').textContent = state.username;
  document.querySelector('.profile-mini span').textContent = `Level ${Math.floor(state.xp / 100) + 1} learner`;
  document.querySelector('#side-streak').textContent = `${state.streak} day streak`;
  totalXp.textContent = state.xp.toLocaleString();
  document.querySelector('.welcome-row h1').innerHTML = `Good morning, ${(state.username || 'Student').split(' ')[0]} <span>✦</span>`;
}

function renderFeatureView(view) {
  let feature = document.querySelector('#feature-view');
  if (!feature) { feature = document.createElement('div'); feature.id = 'feature-view'; document.querySelector('.page-content').appendChild(feature); }
  document.querySelectorAll('#dashboard > *:not(#feature-view)').forEach((section) => section.classList.toggle('view-hidden', view !== 'dashboard'));
  feature.classList.toggle('view-hidden', view === 'dashboard');
  if (view === 'learn') renderLearn(feature);
  if (view === 'analytics') renderAnalytics(feature);
  if (view === 'profile') renderProfile(feature);
}

function renderLearn(container) {
  container.innerHTML = `<div class="feature-header"><div><p class="eyebrow">LEARNING LIBRARY</p><h1>Choose your next win</h1><p class="lede">Your path adapts as your confidence grows.</p></div><button class="primary-button" id="daily-challenge">Daily challenge <b>→</b></button></div><div class="topic-tabs">${topics.map((topic, index) => `<button class="topic-tab ${index === 0 ? 'active' : ''}" data-topic="${topic}">${topic}</button>`).join('')}</div><div class="lesson-grid" id="lesson-grid"></div>`;
  const grid = container.querySelector('#lesson-grid');
  function showLessons(topic = 'All') { grid.innerHTML = lessons.filter((lesson) => topic === 'All' || lesson[1] === topic).map((lesson, index) => `<article class="lesson-card"><div class="lesson-card-top"><span class="topic-chip ${lesson[1].toLowerCase()}">${lesson[1]}</span><span class="lesson-xp">+${lesson[3]} XP</span></div><h3>${lesson[0]}</h3><p>${lesson[4]}</p><div class="lesson-meta"><span>${'●'.repeat(lesson[2])}${'○'.repeat(5 - lesson[2])} difficulty</span><button class="round-arrow start-lesson" data-lesson="${index}">${lesson[5] ? '✓' : '→'}</button></div></article>`).join(''); attachLessonActions(); }
  showLessons();
  container.querySelectorAll('.topic-tab').forEach((tab) => tab.addEventListener('click', () => { container.querySelectorAll('.topic-tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); showLessons(tab.dataset.topic); }));
  container.querySelector('#daily-challenge').addEventListener('click', () => { openModal(lessonModal); });
}

function attachLessonActions() { document.querySelectorAll('.start-lesson').forEach((button) => button.addEventListener('click', () => openModal(lessonModal))); }
function renderAnalytics(container) {
  container.innerHTML = `<div class="feature-header"><div><p class="eyebrow">INSIGHTS</p><h1>Make progress visible</h1><p class="lede">Small patterns become powerful when you can see them.</p></div><button class="outline-button compact" id="export-progress">Export progress</button></div><div class="analytics-grid"><section class="panel analytics-wide"><div class="panel-heading"><div><p class="eyebrow">PERFORMANCE OVERVIEW</p><h2>Steady upward rhythm</h2></div><span class="trend up">+18% this month</span></div><div class="analytics-bars">${[42, 56, 48, 70, 63, 82, 76, 94].map((height, index) => `<div><i style="height:${height}%"></i><small>${['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'Now'][index]}</small></div>`).join('')}</div></section><section class="panel"><p class="eyebrow">TOPIC MASTERY</p><h2>Where you shine</h2><div class="mastery-list"><div><span>Algebra</span><b>74%</b><i><em style="width:74%"></em></i></div><div><span>Geometry</span><b>42%</b><i><em style="width:42%"></em></i></div><div><span>Statistics</span><b>31%</b><i><em style="width:31%"></em></i></div></div></section><section class="panel"><p class="eyebrow">TIME SPENT</p><h2>This week</h2><div class="donut"><strong>2h 46m</strong><span>focused learning</span></div><div class="legend"><span><i class="algebra"></i>Algebra 48%</span><span><i class="geometry"></i>Geometry 27%</span><span><i class="calculus"></i>Other 25%</span></div></section></div>`;
  container.querySelector('#export-progress').addEventListener('click', exportProgress);
}
function renderProfile(container) {
  const level = Math.floor(state.xp / 100) + 1;
  const levelProgress = state.xp % 100;
  container.innerHTML = `<div class="feature-header"><div><p class="eyebrow">YOUR PROFILE</p><h1>Keep becoming</h1><p class="lede">Your learning identity, momentum, and next goals.</p></div><div style="display:flex;gap:8px"><button class="outline-button compact" id="export-progress">Export progress</button><button class="outline-button compact" id="logout-button">Log out</button></div></div>
  <div class="profile-grid">
    <section class="panel profile-hero" style="background:linear-gradient(125deg,#1f201e 0%,#2f302d 60%,#3e322b 100%);color:#fffdf8;border-radius:10px;padding:24px;">
      <div class="large-avatar" style="background:#d8c6a7;color:#35342d;">${initials()}</div>
      <div style="flex:1">
        <h2 style="color:#fff;margin:0 0 4px">${state.username}</h2>
        <p style="color:#d0cec7;margin:0 0 8px">${state.email}</p>
        <span class="pill" style="background:rgba(246,200,87,0.18);color:#f6c857;border:1px solid rgba(246,200,87,0.4)">LEVEL ${level} · CURIOUS BUILDER</span>
      </div>
      <div style="min-width:180px;text-align:right">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#d0cec7;margin-bottom:6px"><span>LEVEL PROGRESS</span><strong style="color:#f6c857">${levelProgress}%</strong></div>
        <div style="background:rgba(255,255,255,0.12);height:7px;border-radius:4px;overflow:hidden"><div style="background:#f6c857;width:${levelProgress}%;height:100%"></div></div>
        <span style="font-size:9px;color:#d0cec7;display:block;margin-top:6px">${100 - levelProgress} XP to Level ${level + 1}</span>
      </div>
      <button class="text-button" id="edit-profile" style="color:#f6c857;margin-left:10px">Edit profile →</button>
    </section>
    <section class="panel"><p class="eyebrow">CONSISTENCY</p><div class="profile-numbers"><div><strong>${state.streak} <small style="font-size:12px;color:var(--muted)">days</small></strong><span>Active streak</span></div><div><strong>142</strong><span>Problems solved</span></div><div><strong>14h 20m</strong><span>Focus time</span></div></div></section>
    <section class="panel"><p class="eyebrow">LEARNING RHYTHM</p><h2 style="font-size:16px;margin:0 0 12px">28-Day Consistency Heatmap</h2><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">${Array.from({length:28}).map((_,i)=>`<div style="height:20px;border-radius:3px;background:${i===27?'#ec735e':i%4===0?'#fae8e2':i%3===0?'#f4c3b5':'#ea8e79'};display:grid;place-items:center;font-size:8px;font-weight:700;color:${i%3===0&&i%4!==0||i===27?'#fff':'#20211f'}">${(i+1)%7===0?'S':(i+1)%7===1?'M':(i+1)%7===2?'T':(i+1)%7===3?'W':(i+1)%7===4?'T':(i+1)%7===5?'F':'S'}</div>`).join('')}</div></section>
    <section class="panel badges-panel"><div class="panel-heading"><div><p class="eyebrow">ACHIEVEMENTS</p><h2>Trophy showcase</h2></div><span class="trend up">6 of 8 unlocked</span></div><div class="badge-grid"><div class="badge-item earned">🔥<strong>7-Day Inferno</strong><small>Silver Tier</small></div><div class="badge-item earned">✦<strong>First Discovery</strong><small>Bronze Tier</small></div><div class="badge-item earned">📐<strong>Algebra Ace</strong><small>Gold Tier</small></div><div class="badge-item earned">✧<strong>Precision Master</strong><small>Silver Tier</small></div></div></section>
  </div>`;
  container.querySelector('#logout-button').addEventListener('click', () => { state.loggedIn = false; saveState(); openModal(document.querySelector('#auth-modal')); });
  container.querySelector('#edit-profile').addEventListener('click', () => openModal(document.querySelector('#profile-modal')));
  container.querySelector('#export-progress').addEventListener('click', exportProgress);
}
function exportProgress() { const csv = `Metric,Value\nUsername,${state.username}\nTotal XP,${state.xp}\nStreak,${state.streak}\nLessons completed,${state.completed}`; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'mathlingo-progress.csv'; link.click(); URL.revokeObjectURL(link.href); }

function addFeatureControls() {
  const nav = document.querySelector('.nav-list');
  nav.insertAdjacentHTML('beforeend', '<a class="nav-item" href="#learn" data-view="learn"><span class="nav-icon">▣</span>Learn</a><a class="nav-item" href="#analytics" data-view="analytics"><span class="nav-icon">▥</span>Analytics</a><a class="nav-item" href="#profile" data-view="profile"><span class="nav-icon">◉</span>Profile</a>');
  document.querySelector('.top-actions').insertAdjacentHTML('beforeend', '<button class="outline-button auth-button" id="auth-button">Account</button>');
  document.querySelectorAll('.nav-item[data-view]').forEach((item) => item.addEventListener('click', (event) => { event.preventDefault(); document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.remove('active')); item.classList.add('active'); renderFeatureView(item.dataset.view); document.querySelector('.breadcrumb strong').textContent = item.textContent.trim(); }));
  document.querySelector('#auth-button').addEventListener('click', () => openModal(document.querySelector('#profile-modal')));
}

function setupAuth() {
  document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="auth-modal" aria-hidden="true"><section class="modal auth-modal"><p class="eyebrow">WELCOME TO MATHLINGO</p><h2>Learn in your flow.</h2><form id="auth-form"><label>Personal Email Address<input id="auth-email-input" required type="email" placeholder="student@gmail.com" value="${state.email || 'student1@mathlingo.com'}"></label><label>Password<input required type="password" value="Student@123"></label><p class="form-note">Your learning progress and XP are safely saved to your personal email.</p><button class="primary-button" type="submit">Start learning <b>→</b></button></form></section></div><div class="modal-backdrop" id="profile-modal" aria-hidden="true"><section class="modal auth-modal"><button class="modal-close" data-close="profile-modal" aria-label="Close">×</button><p class="eyebrow">PROFILE SETTINGS</p><h2>Update your details</h2><form id="profile-form"><label>Display name<input required value="${state.username}"></label><label>Email<input required type="email" value="${state.email}"></label><button class="primary-button" type="submit">Save changes <b>✓</b></button></form></section></div>`);
  document.querySelector('#auth-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const emailVal = document.querySelector('#auth-email-input').value.trim().toLowerCase();
    const saved = JSON.parse(localStorage.getItem(`mathlingo-state-${emailVal}`) || 'null');
    if (saved) {
      Object.assign(state, saved);
    } else {
      state.username = emailVal === 'student1@mathlingo.com' ? 'Alex Smith' : emailVal.split('@')[0];
      state.email = emailVal;
      state.xp = emailVal === 'student1@mathlingo.com' ? 1240 : 0;
      state.streak = emailVal === 'student1@mathlingo.com' ? 7 : 1;
      state.completed = emailVal === 'student1@mathlingo.com' ? 2 : 0;
    }
    state.loggedIn = true;
    saveState();
    updateIdentity();
    closeModal(document.querySelector('#auth-modal'));
  });
  document.querySelector('#profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = event.target.querySelectorAll('input');
    state.username = fields[0].value;
    state.email = fields[1].value;
    saveState();
    updateIdentity();
    closeModal(document.querySelector('#profile-modal'));
    renderFeatureView('profile');
  });
}

document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeModal(document.querySelector(`#${button.dataset.close}`))));
document.querySelector('#continue-button').addEventListener('click', () => openModal(lessonModal));
document.querySelector('#lesson-button').addEventListener('click', () => openModal(lessonModal));
document.querySelector('#open-tutor').addEventListener('click', () => openModal(tutorModal));
document.querySelector('#tutor-card-button').addEventListener('click', () => openModal(tutorModal));
document.querySelectorAll('.suggestion').forEach((button) => button.addEventListener('click', () => { openModal(tutorModal); document.querySelector('#chat-input').value = button.textContent.replace('→', '').trim(); }));
document.querySelector('#modal-tutor').addEventListener('click', () => { closeModal(lessonModal); openModal(tutorModal); });
document.querySelectorAll('.answers button').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.answers button').forEach((answer) => answer.classList.remove('selected', 'correct')); button.classList.add('selected'); if (button.dataset.answer === '5') { button.classList.add('correct'); feedback.textContent = 'Correct. Subtract 4, then divide by 2.'; feedback.classList.remove('wrong'); state.xp += 50; saveState(); updateIdentity(); } else { feedback.textContent = 'Almost. First undo the +4 on both sides.'; feedback.classList.add('wrong'); } }));
document.querySelector('#chat-form').addEventListener('submit', (event) => { event.preventDefault(); const input = document.querySelector('#chat-input'); const value = input.value.trim(); if (!value) return; const history = document.querySelector('.chat-history'); const userBubble = document.createElement('div'); userBubble.className = 'chat-bubble user'; userBubble.textContent = value; history.appendChild(userBubble); input.value = ''; setTimeout(() => { const botBubble = document.createElement('div'); botBubble.className = 'chat-bubble bot'; botBubble.textContent = 'Start by naming the operation that would undo the last step. You are closer than you think.'; history.appendChild(botBubble); }, 250); });
document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(backdrop); }));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(closeModal); });
addFeatureControls(); setupAuth(); updateIdentity(); renderFeatureView('dashboard');
