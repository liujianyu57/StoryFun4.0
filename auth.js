// ============================================================
//  Story.fun - 模拟登录/注册系统（纯内容社区版）
// ============================================================

// ============================================================
//  用户数据（模拟登录）
// ============================================================
const PRIVY_MOCK_USER = {
  id: 'user_storyfun_001',
  name: '故事玩家',
  bio: '在 Story.fun 上创作与观看 AI 短剧。创作者、收藏家、梦想家。',
  email: 'demo@story.fun',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  isLoggedIn: false,
  // 登录方式：'email' | null
  authMethod: null
};

// ============================================================
//  状态管理 — 从 localStorage 恢复登录态
// ============================================================
function loadUserFromStorage() {
  try {
    const saved = localStorage.getItem('storyfun_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isLoggedIn) return parsed;
    }
  } catch (e) {}
  return null;
}

function saveUserToStorage(user) {
  try {
    localStorage.setItem('storyfun_user', JSON.stringify(user));
  } catch (e) {}
}

function clearUserFromStorage() {
  try {
    localStorage.removeItem('storyfun_user');
  } catch (e) {}
}

const storedUser = loadUserFromStorage();
let currentUser = storedUser ? { ...PRIVY_MOCK_USER, ...storedUser } : { ...PRIVY_MOCK_USER, isLoggedIn: true };

// ============================================================
//  DOM 就绪后初始化
// ============================================================
function initAuth() {
  injectAuthStyles();
  const containers = document.querySelectorAll('.auth-container');
  containers.forEach(container => {
    renderAuthUI(container);
  });
}

// ============================================================
//  注入全局样式（仅保留内容社区所需）
// ============================================================
function injectAuthStyles() {
  if (document.getElementById('authStyles')) return;
  const css = `
  /* ===== Login Modal Styles (shared across all pages) ===== */
  .auth-modal-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); opacity: 0; visibility: hidden; transition: all 0.3s ease; }
  .auth-modal-overlay.active { opacity: 1; visibility: visible; }
  .auth-modal { background: var(--surface, #ffffff); border-radius: 28px; width: 100%; max-width: 420px; box-shadow: 0 40px 80px rgba(27,45,71,0.2); overflow: hidden; transform: scale(0.95) translateY(10px); transition: transform 0.3s ease; }
  .auth-modal-overlay.active .auth-modal { transform: scale(1) translateY(0); }
  .auth-modal-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,0.04); cursor: pointer; display: grid; place-items: center; font-size: 1.1rem; color: var(--text-muted, #5e6f83); transition: all 0.2s; z-index: 1; }
  .auth-modal-close:hover { background: rgba(0,0,0,0.08); color: var(--text, #13202e); }
  .auth-modal-header { text-align: center; padding: 36px 28px 20px; position: relative; }
  .auth-modal-logo { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--accent, #000000), #000000); display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 1.3rem; margin: 0 auto 16px; box-shadow: 0 4px 16px rgba(0, 0, 0,0.3); }
  .auth-modal-header h2 { margin: 0 0 6px; font-size: 1.4rem; color: var(--text, #13202e); }
  .auth-modal-header p { margin: 0; color: var(--text-muted, #5e6f83); font-size: 0.92rem; }
  .auth-modal-body { padding: 8px 28px 32px; display: flex; flex-direction: column; gap: 12px; }
  .auth-social-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; border-radius:999px; border: 1px solid var(--border, #deeaf7); background: var(--surface, #ffffff); color: var(--text, #13202e); font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
  .auth-social-btn:hover { border-color: var(--accent, #000000); background: var(--accent-soft, rgba(0, 0, 0, 0.12)); }
  .auth-social-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-modal-tos { text-align: center; color: var(--text-muted, #5e6f83); font-size: 0.82rem; line-height: 1.6; margin: 4px 0 0; }
  .auth-modal-tos a { color: var(--accent, #000000); text-decoration: none; }
  .auth-modal-tos a:hover { text-decoration: underline; }

  /* ===== Auth Login Button ===== */
  .auth-login-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:999px;border:1px solid var(--border,#deeaf7);background:var(--surface,#fff);color:var(--text,#13202e);font-size:0.88rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
  .auth-login-btn:hover{border-color:var(--accent,#000000);color:var(--accent,#000000);background:rgba(0, 0, 0,.08)}
  .auth-login-btn .auth-login-icon{font-size:1rem}

  /* ===== Auth Dropdown Styles ===== */
  .auth-user-menu{position:relative;display:inline-block}
  .auth-avatar-trigger{width:36px;height:36px;border-radius:50%;overflow:hidden;cursor:pointer;border:1.5px solid rgba(0,0,0,.08);flex-shrink:0;transition:border-color .15s;background:#f0f2f5}
  .auth-avatar-trigger:hover{border-color:#000000}
  .auth-avatar-trigger img{width:100%;height:100%;object-fit:cover;display:block}

  .auth-dropdown{position:absolute;right:0;top:64px;width:300px;background:#fff;border-radius:16px;padding:18px;box-shadow:0 18px 40px rgba(22,33,51,0.08);border:1px solid rgba(22,33,51,0.04);opacity:0;transform:translateY(-8px);pointer-events:none;transition:all 220ms ease;z-index:9999}
  .auth-dropdown.active{opacity:1;transform:translateY(0);pointer-events:auto}

  .auth-dropdown-top{display:flex;cursor:pointer;gap:12px;align-items:center;padding-bottom:12px}
  .auth-dropdown-top-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0}
  .auth-dropdown-top-left{flex-shrink:0}
  .auth-dropdown-top-right{min-width:0}
  .auth-dropdown-main{font-weight:700;font-size:16px;color:#0b1720;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .auth-dropdown-sub{color:#8b98a6;margin-top:4px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

  .auth-dropdown-divider{height:1px;background:#eef2f4;margin:8px 0;border-radius:1px}
  .auth-dropdown-item{display:flex;align-items:center;gap:10px;padding:12px 6px;color:#0b1720;text-decoration:none;font-size:14px;font-weight:500}
  .auth-dropdown-item:hover{opacity:.7}
  .auth-dropdown-item span{font-size:18px}
  .auth-dropdown-logout{color:#0b1720}

  /* ===== Logout Confirm ===== */
  .logout-confirm-overlay{position:fixed;inset:0;z-index:10002;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(15,23,42,0.4);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:all .3s ease}
  .logout-confirm-overlay.active{opacity:1;visibility:visible}
  .logout-confirm-card{background:#fff;border-radius:20px;width:100%;max-width:320px;padding:24px;text-align:center;box-shadow:0 20px 60px rgba(27,45,71,0.2);transform:scale(.95) translateY(10px);transition:transform .3s ease}
  .logout-confirm-overlay.active .logout-confirm-card{transform:scale(1) translateY(0)}
  .logout-confirm-icon{font-size:40px;margin-bottom:12px}
  .logout-confirm-title{font-size:17px;font-weight:700;color:#13202e;margin-bottom:6px}
  .logout-confirm-desc{font-size:14px;color:#5e6f83;margin-bottom:24px}
  .logout-confirm-actions{display:flex;gap:12px}
  .logout-confirm-actions button{flex:1;padding:12px;border-radius:999px;border:none;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
  .logout-confirm-actions .btn-cancel{background:rgba(0,0,0,.06);color:#13202e}
  .logout-confirm-actions .btn-cancel:active{background:rgba(0,0,0,.12)}
  .logout-confirm-actions .btn-confirm{background:#f45b69;color:#fff}
  .logout-confirm-actions .btn-confirm:active{background:#d94355}
  `;

  const style = document.createElement('style');
  style.id = 'authStyles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

// ============================================================
//  渲染登录/用户菜单
// ============================================================
function renderAuthUI(container) {
  if (currentUser.isLoggedIn) {
    const isEmail = currentUser.authMethod === 'email';
    var displayName = currentUser.name || (isEmail ? currentUser.email : 'User');
    var subLabel = isEmail ? (currentUser.email || '') : '';
    container.innerHTML = `
      <div class="auth-user-menu">
        <div class="auth-avatar-trigger" onclick="toggleDropdown(event)">
          <img src="${currentUser.avatar}" alt="${currentUser.name}" />
        </div>
        <div class="auth-dropdown" id="authDropdown">
          <div class="auth-dropdown-top" onclick="openProfileCenter()">
            <div class="auth-dropdown-top-left">
              <img class="auth-dropdown-top-avatar" src="${currentUser.avatar}" alt="${currentUser.name}" />
            </div>
            <div class="auth-dropdown-top-right">
              <div class="auth-dropdown-main">${displayName}</div>
              <div class="auth-dropdown-sub">${subLabel}</div>
            </div>
          </div>

          <div class="auth-dropdown-divider"></div>
             <a class="auth-dropdown-item" href="assets.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            我的资产
          </a>
             <a class="auth-dropdown-item" href="narrator.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            创作管理
          </a>
          <a class="auth-dropdown-item" href="watch-history.html">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M3 12s4-8 9-8 9 8 9 8-4 8-9 8-9-8-9-8z"/><circle cx="12" cy="12" r="3"/></svg>
            观看历史
          </a>
          <a class="auth-dropdown-item auth-dropdown-logout" href="#" onclick="handleLogout()">

            <span>🚪</span> Logout
          </a>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="auth-login-btn" onclick="openLoginModal()">
        <span class="auth-login-icon">🔑</span>
        登录 / 注册
      </button>
    `;
  }
}

// ============================================================
//  登录弹窗
// ============================================================
function openLoginModal() {
  // 移除已存在的弹窗
  const existing = document.getElementById('authLoginModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'auth-modal-overlay';
  modal.id = 'authLoginModal';
  modal.innerHTML = `
    <div class="auth-modal">
      <button class="auth-modal-close" onclick="closeLoginModal()">✕</button>
      <div class="auth-modal-header">
        <div class="auth-modal-logo">AI</div>
        <h2>欢迎来到 Story.fun</h2>
        <p>登录你的账号，开启 AI 短剧之旅</p>
      </div>
      <div class="auth-modal-body">
        <button class="auth-social-btn auth-social-email" onclick="mockLogin('email')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          使用邮箱登录
        </button>
        <p class="auth-modal-tos">
          继续即表示同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  // 触发动画
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  const modal = document.getElementById('authLoginModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// ============================================================
//  模拟钱包直连（替代登录弹窗；无 Privy）
// ============================================================
function simulateWalletConnect() {
  currentUser.isLoggedIn = true;
  currentUser.authMethod = 'wallet';
  currentUser.name = '故事玩家';
  currentUser.avatar = PRIVY_MOCK_USER.avatar;
  saveUserToStorage(currentUser);
  const containers = document.querySelectorAll('.auth-container');
  containers.forEach(container => { renderAuthUI(container); });
  closeLoginModal();
  if (typeof showToast === 'function') showToast('✅ 已连接模拟钱包', '🔗');
  document.dispatchEvent(new CustomEvent('auth-ready'));
}

// ============================================================
//  模拟登录
// ============================================================
function mockLogin(method) {
  const methodNames = {
    google: 'Google',
    twitter: 'X (Twitter)',
    email: '邮箱'
  };

  // 显示加载状态
  const modal = document.getElementById('authLoginModal');
  if (modal) {
    const btns = modal.querySelectorAll('button');
    btns.forEach(b => b.disabled = true);
  }

  setTimeout(() => {
    // 登录成功
    currentUser.isLoggedIn = true;
    // 记录登录方式
    currentUser.authMethod = method;
    currentUser.name = '故事玩家';
    currentUser.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
    // 邮箱登录：带出示例邮箱（可按需替换）
    if (method === 'email') {
      currentUser.email = currentUser.email || 'user@example.com';
    }

    // 保存登录态到 localStorage
    saveUserToStorage(currentUser);

    // 关闭弹窗
    closeLoginModal();

    // 重新渲染所有 auth-container
    const containers = document.querySelectorAll('.auth-container');
    containers.forEach(container => {
      renderAuthUI(container);
    });

    // 显示成功提示
    showToast(`✅ 已通过 ${methodNames[method] || '邮箱'} 登录成功`, '🎉');

    // 触发 auth-ready 事件，通知其他页面更新
    document.dispatchEvent(new CustomEvent('auth-ready'));
  }, 800);
}

// ============================================================
//  退出登录
// ============================================================
function showLogoutConfirm() {
  var existing = document.getElementById('logoutConfirmOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'logout-confirm-overlay';
  overlay.id = 'logoutConfirmOverlay';
  overlay.innerHTML = '<div class="logout-confirm-card">'
    + '<div class="logout-confirm-icon">🚪</div>'
    + '<div class="logout-confirm-title">退出登录</div>'
    + '<div class="logout-confirm-desc">确定要退出登录吗？</div>'
    + '<div class="logout-confirm-actions">'
    + '<button class="btn-cancel" id="logoutCancelBtn">取消</button>'
    + '<button class="btn-confirm" id="logoutConfirmBtn">确定</button>'
    + '</div></div>';
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function() { overlay.classList.add('active'); });

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeLogoutConfirm();
  });
  document.getElementById('logoutCancelBtn').addEventListener('click', closeLogoutConfirm);
  document.getElementById('logoutConfirmBtn').addEventListener('click', function() {
    closeLogoutConfirm();
    doLogout();
  });
}

function closeLogoutConfirm() {
  var overlay = document.getElementById('logoutConfirmOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(function() { overlay.remove(); document.body.style.overflow = ''; }, 300);
  }
}

function doLogout() {
  currentUser.isLoggedIn = false;
  currentUser.authMethod = null;
  clearUserFromStorage();
  closeDropdown();
  var containers = document.querySelectorAll(".auth-container");
  containers.forEach(function(container){ renderAuthUI(container); });
  showToast('👋 已退出登录', '👋');
  document.dispatchEvent(new CustomEvent('auth-ready'));
}

function handleLogout() {
  closeDropdown();
  showLogoutConfirm();
}

// ============================================================
//  下拉菜单
// ============================================================
function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('authDropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
  }
}

function closeDropdown() {
  const dropdown = document.getElementById('authDropdown');
  if (dropdown) {
    dropdown.classList.remove('active');
  }
}

// 点击外部关闭下拉菜单
document.addEventListener('click', function(e){
  const dropdown = document.getElementById('authDropdown');
  if (dropdown && dropdown.classList.contains('active')) {
    const userMenu = dropdown.closest('.auth-user-menu');
    if (userMenu && !userMenu.contains(e.target)) {
      closeDropdown();
    }
  }
});

// ============================================================
//  个人中心
// ============================================================
function openProfileCenter() {
  closeDropdown();
  window.location.href = 'profile-center.html';
}

// ============================================================
//  Toast 提示（页面可复用）
// ============================================================
function showToast(msg, icon) {

  // 尝试使用页面已有的 toast 系统
  const existingToast = document.getElementById('toastNotification');
  if (existingToast) {
    const msgEl = document.getElementById('toastMessage');
    const iconEl = existingToast.querySelector('.toast-icon');
    if (msgEl) msgEl.textContent = msg;
    if (iconEl && icon) iconEl.textContent = icon;
    existingToast.classList.add('show');
    clearTimeout(window._authToastTimer);
    window._authToastTimer = setTimeout(() => {
      existingToast.classList.remove('show');
    }, 3000);
    return;
  }

  // 如果没有 toast 系统，创建一个临时的
  let toast = document.getElementById('authTempToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'authTempToast';
    toast.style.cssText = `
      position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-100px);
      z-index: 99999; background: rgba(26, 35, 47, 0.95); backdrop-filter: blur(8px);
      color: #fff; padding: 16px 24px; border-radius: 16px; font-size: 0.92rem;
      line-height: 1.6; box-shadow: 0 12px 40px rgba(27, 45, 71, 0.25);
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      opacity: 0; pointer-events: none; max-width: 420px; text-align: center; font-weight: 500;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = (icon || '💡') + ' ' + msg;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });
  clearTimeout(window._authToastTimer);
  window._authToastTimer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-100px)';
    toast.style.opacity = '0';
  }, 3000);
}

// ============================================================
//  初始化（确保 auth-container 渲染）
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

// ============================================================
//  模拟钱包直连：任何“登录”入口不再弹 Privy/邮箱，直接连接模拟钱包
// ============================================================
window.openLoginModal = function () {
  if (!currentUser || !currentUser.isLoggedIn) simulateWalletConnect();
};
