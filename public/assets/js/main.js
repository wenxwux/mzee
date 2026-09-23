const page = document.getElementById('page');
const button = document.getElementById('toggle');
const icon = document.getElementById('icon');
const toast = document.getElementById('toast');
const portrait = document.getElementById('portrait');
const prank = document.getElementById('prank');
const charm = document.getElementById('charm');
const messages = [
  '系统提示：学长帅气值超出仪表盘范围。',
  '检测到一位成都帅哥正在被围观 👀',
  '学长别紧张，这只是个非常严肃的研究。',
  '今日桃花运：正在加载……加载失败，请本人努力。',
  '报告！学长的自信心目前运行良好。',
  '友情提示：有人正在偷偷截图。'
];
let paused = false;
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}
button.addEventListener('click', () => {
  paused = !paused;
  page.classList.toggle('paused', paused);
  button.setAttribute('aria-label', paused ? '继续旋转' : '暂停旋转');
  icon.innerHTML = paused
    ? '<path d="M5 3.5v9l7-4.5z"/>'
    : '<path d="M5 3h2v10H5zm4 0h2v10H9z"/>';
  showToast(paused ? '学长暂时下线，别急，他一会儿就回来。' : '学长重新上线了，保持冷静。');
});
function openProfile() {
  showToast('档案已打开：成都籍 · 有点自恋 · 当前魅力值 ' + charm.textContent + ' 分。');
  charm.textContent = (97 + Math.random() * 3).toFixed(1);
  document.querySelector('.art-wrap').classList.add('celebrate');
  setTimeout(() => document.querySelector('.art-wrap').classList.remove('celebrate'), 850);
}
portrait.addEventListener('click', openProfile);
portrait.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProfile(); }
});
prank.addEventListener('click', () => {
  const rect = prank.getBoundingClientRect();
  const moveX = (Math.random() - 0.5) * Math.min(120, window.innerWidth * 0.28);
  const moveY = (Math.random() - 0.5) * 54;
  prank.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${(Math.random() - 0.5) * 12}deg)`;
  showToast(messages[Math.floor(Math.random() * messages.length)]);
  if (Math.random() > 0.55) {
    const bubble = document.createElement('span');
    bubble.className = 'float-emoji';
    bubble.textContent = ['😂', '✨', '👀', '💅'][Math.floor(Math.random() * 4)];
    bubble.style.left = `${rect.left + rect.width / 2}px`;
    bubble.style.top = `${rect.top}px`;
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1200);
  }
});
let idleTimer;
function scheduleNudge() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!document.hidden && !toast.classList.contains('visible')) {
      showToast(messages[Math.floor(Math.random() * messages.length)]);
    }
    scheduleNudge();
  }, 18000 + Math.random() * 12000);
}
scheduleNudge();
