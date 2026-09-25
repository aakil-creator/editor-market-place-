// Groove Hub - Main Application
if (window.location.hostname === '127.0.0.1') {
    window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
}

// State
let currentToken = localStorage.getItem('access_token') || null;
let currentUser = null;
try {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) currentUser = JSON.parse(savedUser);
} catch (_) { }

window.selectedType = 'BUYER';
let publicConfig = { google_client_id: '', razorpay_key_id: 'rzp_test_placeholder' };
window.publicConfig = publicConfig;

async function fetchPublicConfig() {
    try {
        const res = await fetch('/api/public/config');
        if (res.ok) {
            publicConfig = await res.json();
            window.publicConfig = publicConfig;
            if (typeof window.__refreshGoogleBtn === 'function') {
                window.__refreshGoogleBtn();
            }
        }
    } catch (_) { }
}
fetchPublicConfig();

// Verify active session on load
if (currentToken) {
    apiFetch('/auth/me').then(u => {
        currentUser = u;
        localStorage.setItem('current_user', JSON.stringify(u));
    }).catch(() => {
        currentToken = null;
        currentUser = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
    });
}

// Tagged template literal: el`<div ...>` --> HTMLElement
function el(strings, ...values) {
    const html = strings.reduce((acc, str, i) => {
        const value = values[i];
        const rendered = value && typeof value === 'object' && value.outerHTML ? value.outerHTML : (value || '');
        return acc + str + rendered;
    }, '');
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.children.length === 1 ? div.firstElementChild : div;
}

// DOM Elements
const appEl = document.getElementById('app');

// API helper
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Add /api prefix if not already present
    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers
    });

    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { detail: text }; }

    if (!response.ok) {
        if (response.status === 403 && data.detail && (
            data.detail.toLowerCase().includes('suspended') ||
            data.detail.toLowerCase().includes('security alert') ||
            data.detail.toLowerCase().includes('blocked')
        )) {
            showSuspendedModal(data.detail);
            currentToken = null;
            currentUser = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('current_user');
            if (typeof renderAppHeader === 'function') {
                const header = document.querySelector('.header');
                if (header) header.replaceWith(renderAppHeader());
            }
        }
        throw new Error(data.detail || 'Request failed');
    }

    return data;
}

// Security Suspension Modal
function showSuspendedModal(detail) {
    const existing = document.getElementById('security-suspended-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'security-suspended-modal';
    overlay.className = 'security-alert-modal-overlay';
    overlay.innerHTML = `
        <div class="security-alert-modal-card">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); color: #ef4444; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                🛑
            </div>
            <h2 style="color: #ef4444; font-size: 1.35rem; font-weight: 800; margin: 0 0 10px;">Account Suspended</h2>
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 10px; padding: 12px 14px; margin-bottom: 18px; font-size: 0.85rem; color: var(--text-primary); text-align: left; line-height: 1.45;">
                ${detail || 'Your account was suspended for attempting to exchange phone numbers or direct contact information outside Groove Hub.'}
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 20px;">
                To protect buyers and creators under our <strong>100% Escrow Guarantee</strong>, Groove Hub strictly prohibits sharing phone numbers, WhatsApp, UPI, or external channels. All transactions and chats must remain on the platform.
            </p>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="document.getElementById('security-suspended-modal').remove(); router('/')" style="flex: 1;">Close</button>
                <a href="mailto:rahura2026@gmail.com?subject=Groove Hub Account Suspension Appeal" class="btn btn-primary" style="flex: 1.5; text-decoration: none; display: flex; align-items: center; justify-content: center;">Contact Admin Support</a>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}
window.showSuspendedModal = showSuspendedModal;

// Toast notification
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// Loading state
function showLoading() {
    appEl.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
}

function hideLoading() {
    // No-op, appEl is replaced with content
}

// Redirect to login if not authenticated
async function requireAuth() {
    if (!currentToken) {
        showToast('Please login first', 'error');
        router('/login');
        return false;
    }

    // Verify token
    try {
        await apiFetch('/auth/me');
    } catch (e) {
        currentToken = null;
        currentUser = null;
        router('/login');
        return false;
    }
    return true;
}

// Theme Management
let storedTheme = localStorage.getItem('theme');
let currentTheme = storedTheme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            currentTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
        }
    });
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    const activeRoute = window.location.pathname || '/';
    router(activeRoute);
}
window.toggleTheme = toggleTheme;

// App Brand Logo Component
function renderLogo(size = 28, showText = true) {
    return `
        <div class="logo" style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px;" onclick="router('/')">
            <img class="logo-light-mode" src="/static/icons/grove_hub_emblem_light.png" alt="Grove Hub" style="height: ${size}px; width: auto; max-width: ${Math.round(size * 1.5)}px; object-fit: contain; vertical-align: middle;" />
            <img class="logo-dark-mode" src="/static/icons/grove_hub_emblem_dark.png" alt="Grove Hub" style="height: ${size}px; width: auto; max-width: ${Math.round(size * 1.5)}px; object-fit: contain; vertical-align: middle; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));" />
            ${showText ? `<span style="font-weight: 800; font-size: ${Math.max(16, Math.round(size * 0.62))}px; letter-spacing: -0.4px; color: var(--text-primary);">Grove Hub</span>` : ''}
        </div>
    `;
}
window.renderLogo = renderLogo;

// Mode Switcher Function for Users
async function toggleUserMode() {
    if (!currentUser) return;
    if (currentUser.user_type === 'ADMIN') {
        showToast('Admin accounts operate in the Admin Console.', 'info');
        return;
    }

    const currentRole = currentUser.user_type || 'BUYER';
    const targetRole = currentRole === 'PROVIDER' ? 'BUYER' : 'PROVIDER';
    const targetTitle = targetRole === 'PROVIDER' ? 'Provider Mode 💼' : 'Buyer Mode 🛍️';

    showLoading();
    try {
        const res = await apiFetch('/user/switch-role', {
            method: 'POST',
            body: JSON.stringify({ role: targetRole })
        });
        if (res.token) {
            currentToken = res.token;
            localStorage.setItem('access_token', res.token);  // Fixed: was 'token'
        }
        if (res.user) {
            currentUser = res.user;
            localStorage.setItem('current_user', JSON.stringify(currentUser));  // Fixed: was 'user'
        } else {
            currentUser.user_type = targetRole;
            localStorage.setItem('current_user', JSON.stringify(currentUser));  // Fixed: was 'user'
        }
        localStorage.setItem('grove_hub_active_mode', targetRole);
        showToast(`Switched to ${targetTitle}!`, 'success');
        router('/');
    } catch (e) {
        showToast(e.message || 'Failed to switch mode', 'error');
    } finally {
        hideLoading();
    }
}
window.toggleUserMode = toggleUserMode;

// Universal App Header with 100% strict Separation of Modes (Buyer Mode, Provider Mode, and Admin Console)

// Profile avatar — replaces logout button in all headers
// Shows user's profile image if set, otherwise initials in a colored circle
function renderProfileAvatar(size = 32) {
    const user = currentUser;
    if (!user) return '';
    const initial = (user.name || 'U').charAt(0).toUpperCase();
    const isProvider = user.user_type === 'PROVIDER';
    const gradient = isProvider
        ? 'linear-gradient(135deg, #f97316, #ef4444)'
        : 'linear-gradient(135deg, #3b82f6, #6366f1)';
    const label = isProvider ? 'PROVIDER' : (user.user_type === 'ADMIN' ? 'ADMIN' : 'BUYER');
    const imgTag = user.profile_image
        ? `<img src="${user.profile_image}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />`
        : '';
    return `
        <div class="header-user-avatar" title="${user.name} (${label})" style="cursor:pointer;" onclick="window.__toggleProfileMenu()">
            <div class="header-user-avatar-img" style="width:${size}px;height:${size}px;border-radius:50%;background:${gradient};display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:${size >= 40 ? '0.95rem' : '0.8rem'};${imgTag ? 'overflow:hidden;' : ''}border:2px solid var(--bg-card);position:relative;">
                ${imgTag}
                <span style="${imgTag ? 'display:none;' : ''}">${initial}</span>
                <span class="header-user-status-dot" style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid var(--bg-card);${size < 36 ? 'width:7px;height:7px;bottom:-1px;right:-1px;' : ''}"></span>
            </div>
        </div>
    `;
}

// Profile dropdown menu — shown on avatar click
function renderProfileMenu() {
    const user = currentUser;
    if (!user) return '';
    const isProvider = user.user_type === 'PROVIDER';
    const hasImage = !!(user.profile_image);
    return `
        <div id="profile-menu-dropdown" class="profile-menu-dropdown" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;align-items:flex-end;justify-content:flex-end;padding:16px;">
            <div class="profile-menu-panel" style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow-lg);min-width:220px;overflow:hidden;">
                <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:0.9rem;flex-shrink:0;overflow:hidden;${hasImage ? 'border:2px solid var(--bg-card);' : ''}">
                        ${hasImage ? `<img src="${user.profile_image}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none;">${(user.name || 'U').charAt(0).toUpperCase()}</span>` : `<span>${(user.name || 'U').charAt(0).toUpperCase()}</span>`}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${user.name}</div>
                        <div style="font-size:0.7rem;color:var(--text-muted);">${isProvider ? 'Provider' : (user.user_type === 'ADMIN' ? 'Admin' : 'Buyer')}</div>
                    </div>
                </div>
                <button class="profile-menu-btn" onclick="openProfileIconPicker()" style="display:flex;align-items:center;gap:8px;padding:10px 16px;font-size:0.8rem;font-weight:600;color:var(--text-primary);background:transparent;border:none;width:100%;text-align:left;cursor:pointer;border-bottom:1px solid var(--border);">
                    <span>🖼️</span> Change Icon
                </button>
                <button class="profile-menu-btn" onclick="router('/profile')" style="display:flex;align-items:center;gap:8px;padding:10px 16px;font-size:0.8rem;font-weight:600;color:var(--text-primary);background:transparent;border:none;width:100%;text-align:left;cursor:pointer;border-bottom:1px solid var(--border);">
                    <span>🎨</span> My Profile
                </button>
                <button class="profile-menu-btn" onclick="toggleUserMode()" style="display:flex;align-items:center;gap:8px;padding:10px 16px;font-size:0.8rem;font-weight:600;color:var(--text-primary);background:transparent;border:none;width:100%;text-align:left;cursor:pointer;border-bottom:1px solid var(--border);">
                    <span>${isProvider ? '🛍️' : '💼'}</span> ${isProvider ? 'Switch to Buyer Mode' : 'Switch to Provider Mode'}
                </button>
                <button class="profile-menu-btn profile-menu-logout" onclick="logout()" style="display:flex;align-items:center;gap:8px;padding:10px 16px;font-size:0.8rem;font-weight:600;color:var(--danger);background:transparent;border:none;width:100%;text-align:left;cursor:pointer;margin-top:4px;">
                    <span>🚪</span> Logout
                </button>
            </div>
        </div>
    `;
}

// Toggle profile dropdown
window.__toggleProfileMenu = () => {
    const existing = document.getElementById('profile-menu-dropdown');
    if (existing) {
        existing.style.display = existing.style.display === 'none' ? 'flex' : 'none';
    }
};

// Change Icon picker — opens modal with Google photo / Upload / Remove options
window.openProfileIconPicker = () => {
    const existing = document.getElementById('profile-menu-dropdown');
    if (existing) existing.style.display = 'none';

    const overlay = document.getElementById('profile-icon-picker');
    if (overlay) { overlay.remove(); return; }

    const imgUrl = currentUser?.profile_image || '';
    const modal = document.createElement('div');
    modal.id = 'profile-icon-picker';
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px; animation:fadeIn 0.15s ease;';

    modal.innerHTML = `
        <div class="card" style="max-width:420px;width:100%;box-shadow:var(--shadow-lg);border:1px solid var(--border);animation:fadeIn 0.2s ease;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);">
                <h3 style="margin:0;font-size:1rem;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:8px;">
                    <span>🖼️</span> Change Profile Icon
                </h3>
                <button onclick="this.closest('#profile-icon-picker').remove()" style="background:none;border:none;font-size:1.2rem;color:var(--text-muted);cursor:pointer;line-height:1;padding:4px 8px;">✕</button>
            </div>
            <div style="padding:20px;">
                <div style="text-align:center;margin-bottom:18px;">
                    <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:2rem;margin:0 auto 10px;overflow:hidden;border:3px solid var(--border);position:relative;">
                        ${imgUrl ? `<img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none;">${currentUser?.name?.charAt(0).toUpperCase() || 'U'}</span>` : `<span>${currentUser?.name?.charAt(0).toUpperCase() || 'U'}</span>`}
                    </div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Current icon</div>
                </div>

                <div style="display:flex;flex-direction:column;gap:10px;">
                    <button id="btn-use-google-photo" class="btn btn-outline" style="width:100%;justify-content:center;${imgUrl && currentUser?.profile_image?.includes('googleusercontent') ? 'opacity:0.5;pointer-events:none;' : ''}">
                        <span style="font-size:1.1rem;margin-right:6px;">📸</span> Use Google Profile Photo
                    </button>
                    <button id="btn-upload-custom" class="btn btn-outline" style="width:100%;justify-content:center;">
                        <span style="font-size:1.1rem;margin-right:6px;">📁</span> Upload Custom Photo
                    </button>
                    <button id="btn-remove-photo" class="btn btn-secondary" style="width:100%;justify-content:center;color:var(--danger);">
                        <span style="font-size:1.1rem;margin-right:6px;">🗑️</span> Remove Photo
                    </button>
                </div>

                <div id="icon-preview-container" style="margin-top:16px;display:none;text-align:center;">
                    <div style="width:60px;height:60px;border-radius:50%;overflow:hidden;margin:0 auto 8px;border:2px solid var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,0.2);">
                        <img id="icon-preview-img" src="" style="width:100%;height:100%;object-fit:cover;display:block;" />
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Preview — tap "Save" to apply</div>
                    <button id="btn-save-icon" class="btn btn-primary" style="margin-top:8px;width:100%;justify-content:center;">
                        <span style="margin-right:6px;">💾</span> Save Icon
                    </button>
                </div>

                <input type="file" id="icon-file-input" accept="image/*" style="display:none;max-width:100%;" />
                <input type="hidden" id="icon-preview-url" />
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    // --- Use Google Photo ---
    const googleBtn = modal.querySelector('#btn-use-google-photo');
    if (googleBtn) {
        googleBtn.onclick = async () => {
            if (!currentUser) return;
            // Re-fetch via Google Sign-In to get the latest credential
            try {
                if (window.google?.accounts?.id) {
                    await new Promise((resolve) => {
                        googleBtn.disabled = true;
                        googleBtn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span> Connecting to Google…';
                        window.google.accounts.id.revoke(currentUser.email, () => {
                            window.google.accounts.id.signIn({
                                callback: async (response) => {
                                    if (response?.credential) {
                                        // Save the Google picture directly
                                        const payload = JSON.parse(atob(response.credential.split('.')[1] + '='.repeat((4 - response.credential.split('.')[1].length % 4) % 4)));
                                        const pic = payload.picture || '';
                                        await saveProfileImage(pic);
                                    }
                                    googleBtn.disabled = false;
                                    googleBtn.innerHTML = '<span style="font-size:1.1rem;margin-right:6px;">📸</span> Use Google Profile Photo';
                                    resolve();
                                },
                                cancel_on_tap_outside: false,
                            });
                        });
                    });
                } else {
                    showToast('Google Sign-In not available. Upload a custom photo instead.', 'warning');
                }
            } catch (e) {
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<span style="font-size:1.1rem;margin-right:6px;">📸</span> Use Google Profile Photo';
                showToast('Could not fetch Google photo. Try uploading instead.', 'error');
            }
        };
    }

    // --- Upload Custom ---
    const uploadBtn = modal.querySelector('#btn-upload-custom');
    const fileInput = modal.querySelector('#icon-file-input');
    if (uploadBtn && fileInput) {
        uploadBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const previewImg = modal.querySelector('#icon-preview-img');
            const previewContainer = modal.querySelector('#icon-preview-container');
            const previewUrlInput = modal.querySelector('#icon-preview-url');
            if (previewImg) previewImg.src = url;
            if (previewContainer) previewContainer.style.display = 'block';
            if (previewUrlInput) previewUrlInput.value = url;
            if (googleBtn) googleBtn.style.display = 'none';
        };
    }

    // --- Preview save ---
    const saveBtn = modal.querySelector('#btn-save-icon');
    if (saveBtn) {
        saveBtn.onclick = async () => {
            const previewUrl = modal.querySelector('#icon-preview-url')?.value;
            if (!previewUrl) return;
            const previewImg = modal.querySelector('#icon-preview-img');
            if (!previewImg || !previewImg.src) return;
            // Upload to server as base64 data URL or keep blob URL for preview
            // Convert to data URL for persistence
            try {
                const res = await fetch(previewUrl);
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const dataUrl = reader.result;
                    await saveProfileImage(dataUrl);
                };
                reader.readAsDataURL(blob);
            } catch {
                showToast('Failed to read image. Try again.', 'error');
            }
        };
    }

    // --- Remove Photo ---
    const removeBtn = modal.querySelector('#btn-remove-photo');
    if (removeBtn) {
        removeBtn.onclick = async () => {
            const ok = confirm('Remove your profile photo? You will go back to initials.');
            if (ok) {
                await saveProfileImage('');
                modal.remove();
            }
        };
    }
};

// Save profile image to backend
window.saveProfileImage = async (imageUrl) => {
    try {
        const res = await apiFetch('/auth/me', {
            method: 'PATCH',
            body: JSON.stringify({ profile_image: imageUrl || null })
        });
        currentUser = res;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        showToast(currentUser?.profile_image ? 'Profile icon updated!' : 'Profile photo removed.', 'success');
        // Re-render current page
        router(window.location.pathname);
    } catch (e) {
        showToast(e.message || 'Failed to update profile icon.', 'error');
    }
};

// Close profile menu on outside click
document.addEventListener('click', (e) => {
    const menu = document.getElementById('profile-menu-dropdown');
    const avatar = e.target.closest('.header-user-avatar');
    if (menu && !avatar && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Close profile menu on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const menu = document.getElementById('profile-menu-dropdown');
        if (menu) menu.style.display = 'none';
    }
});

// Inject profile menu styles
(function injectProfileMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .profile-menu-dropdown { animation: none; }
        @keyframes profileMenuIn {
            from { opacity: 0; transform: translateY(8px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
    `;
    document.head.appendChild(style);
})();

function renderAppHeader(activeRoute = '') {
    const isAdmin = currentUser?.user_type === 'ADMIN';
    const isProvider = currentUser?.user_type === 'PROVIDER';

    // 1. ADMIN EXCLUSIVE HEADER (No buyer or provider interference)
    if (isAdmin) {
        return el`<div>
            <div class="header" style="border-bottom: 2px solid rgba(239, 68, 68, 0.35);">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    ${renderLogo(32, true)}
                    <span class="mode-badge-pill mode-badge-admin">🛡️ Admin Console</span>
                </div>
                <div class="header-nav" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <button class="nav-btn ${activeRoute === '/admin' || activeRoute === '/' ? 'active' : ''}" onclick="router('/admin')">📊 Dashboard</button>
                    <button class="nav-btn ${activeRoute === '/admin/chats' ? 'active' : ''}" onclick="router('/admin/chats')">💬 Chats Guard</button>
                    <button class="nav-btn ${activeRoute === '/admin/providers' ? 'active' : ''}" onclick="router('/admin/providers')">👥 Providers</button>
                    <button class="nav-btn ${activeRoute === '/admin/bookings' ? 'active' : ''}" onclick="router('/admin/bookings')">📋 Bookings & Escrow</button>
                    <button class="nav-btn ${activeRoute === '/admin/disputes' ? 'active' : ''}" onclick="router('/admin/disputes')">⚖️ Disputes</button>
                    <button class="nav-btn ${activeRoute === '/payments' ? 'active' : ''}" onclick="router('/payments')">💳 Financials</button>
                    <button class="nav-btn ${activeRoute === '/admin/niches' ? 'active' : ''}" onclick="router('/admin/niches')">🗂️ Niches</button>
                    <button class="nav-btn ${activeRoute === '/settings' ? 'active' : ''}" onclick="router('/settings')">⚙️ Settings</button>
                    <button class="nav-btn" onclick="toggleTheme()" title="Toggle Theme" style="padding: 8px 12px;">
                        ${currentTheme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    ${renderProfileAvatar(32)}${renderProfileMenu()}
                </div>
            </div>
            <!-- Admin Mobile Bottom Nav -->
            <div class="mobile-bottom-nav">
                <button class="bottom-nav-item ${activeRoute === '/admin' || activeRoute === '/' ? 'active' : ''}" onclick="router('/admin')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Overview</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/admin/chats' ? 'active' : ''}" onclick="router('/admin/chats')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>Chats</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/admin/bookings' ? 'active' : ''}" onclick="router('/admin/bookings')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <span>Orders</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/payments' ? 'active' : ''}" onclick="router('/payments')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span>Financials</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/settings' ? 'active' : ''}" onclick="router('/settings')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Settings</span>
                </button>
            </div>
        </div>`;
    }

    // 2. PROVIDER EXCLUSIVE HEADER (Creator Studio)
    if (isProvider) {
        return el`<div>
            <div class="header">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    ${renderLogo(32, true)}
                    <span class="mode-badge-pill mode-badge-provider">💼 Provider Mode</span>
                    <button type="button" class="btn-switch-mode" onclick="toggleUserMode()" title="Switch to Buyer Mode to hire talent">
                        🛍️ Switch to Buyer Mode
                    </button>
                </div>
                <div class="header-nav" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <button class="nav-btn ${activeRoute === '/' ? 'active' : ''}" onclick="router('/')">📊 Studio</button>
                    <button class="nav-btn ${activeRoute === '/packages' || activeRoute === '/create-package' ? 'active' : ''}" onclick="router('/packages')">📦 My Packages</button>
                    <button class="nav-btn ${activeRoute === '/bookings' ? 'active' : ''}" onclick="router('/bookings')">📋 Client Orders</button>
                    <button class="nav-btn ${activeRoute === '/messages' ? 'active' : ''}" onclick="router('/messages')" id="nav-btn-messages">
                        💬 Messages <span class="nav-unread-badge" id="header-unread-count" style="display:none; background:#ff4757; color:#fff; font-size:0.7rem; font-weight:700; padding:1px 6px; border-radius:10px; margin-left:4px;"></span>
                    </button>
                    <button class="nav-btn ${activeRoute === '/payments' ? 'active' : ''}" onclick="router('/payments')">💳 Earnings & Payouts</button>
                    <button class="nav-btn ${activeRoute === '/profile' || activeRoute === '/settings' ? 'active' : ''}" onclick="router('/profile')">🎨 My Profile</button>
                    <button class="nav-btn" onclick="toggleTheme()" title="Toggle Theme" style="padding: 8px 12px;">
                        ${currentTheme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    ${renderProfileAvatar(32)}${renderProfileMenu()}
                </div>
            </div>
            <!-- Provider Mobile Bottom Nav -->
            <div class="mobile-bottom-nav">
                <button class="bottom-nav-item ${activeRoute === '/' ? 'active' : ''}" onclick="router('/')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    <span>Studio</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/packages' ? 'active' : ''}" onclick="router('/packages')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>Packages</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/bookings' ? 'active' : ''}" onclick="router('/bookings')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <span>Orders</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/messages' ? 'active' : ''}" onclick="router('/messages')" style="position: relative;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span class="nav-unread-dot" id="bottom-unread-dot" style="display:none; position:absolute; top:4px; right:18px; width:8px; height:8px; border-radius:50%; background:#ff4757;"></span>
                    <span>Messages</span>
                </button>
                <button class="bottom-nav-item ${activeRoute === '/payments' ? 'active' : ''}" onclick="router('/payments')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span>Earnings</span>
                </button>
            </div>
        </div>`;
    }

    // 3. BUYER EXCLUSIVE HEADER (Client / Marketplace)
    return el`<div>
        <div class="header">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                ${renderLogo(32, true)}
                <span class="mode-badge-pill mode-badge-buyer">🛍️ Buyer Mode</span>
                <button type="button" class="btn-switch-mode" onclick="toggleUserMode()" title="Switch to Provider Mode to offer your services">
                    💼 Switch to Provider Mode
                </button>
            </div>
            <div class="header-nav" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button class="nav-btn ${activeRoute === '/' ? 'active' : ''}" onclick="router('/')">🏠 Home</button>
                <button class="nav-btn ${activeRoute === '/messages' ? 'active' : ''}" onclick="router('/messages')" id="nav-btn-messages">
                    💬 Messages <span class="nav-unread-badge" id="header-unread-count" style="display:none; background:#ff4757; color:#fff; font-size:0.7rem; font-weight:700; padding:1px 6px; border-radius:10px; margin-left:4px;"></span>
                </button>
                <button class="nav-btn ${activeRoute === '/bookings' ? 'active' : ''}" onclick="router('/bookings')">📦 My Orders</button>
                <button class="nav-btn ${activeRoute === '/payments' ? 'active' : ''}" onclick="router('/payments')">💳 Wallet / Escrow</button>
                <button class="nav-btn ${activeRoute === '/settings' ? 'active' : ''}" onclick="router('/settings')">⚙️ Settings</button>
                <button class="nav-btn" onclick="toggleTheme()" title="Toggle Theme" style="padding: 8px 12px;">
                    ${currentTheme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button class="nav-btn" onclick="logout()" style="color: var(--danger);">Logout</button>
            </div>
        </div>
        <!-- Buyer Mobile Bottom Nav -->
        <div class="mobile-bottom-nav">
            <button class="bottom-nav-item ${activeRoute === '/' ? 'active' : ''}" onclick="router('/')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Home</span>
            </button>
            <button class="bottom-nav-item ${activeRoute === '/messages' ? 'active' : ''}" onclick="router('/messages')" style="position: relative;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span class="nav-unread-dot" id="bottom-unread-dot" style="display:none; position:absolute; top:4px; right:18px; width:8px; height:8px; border-radius:50%; background:#ff4757;"></span>
                <span>Messages</span>
            </button>
            <button class="bottom-nav-item ${activeRoute === '/bookings' ? 'active' : ''}" onclick="router('/bookings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                <span>Orders</span>
            </button>
            <button class="bottom-nav-item ${activeRoute === '/payments' ? 'active' : ''}" onclick="router('/payments')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span>Wallet</span>
            </button>
            <button class="bottom-nav-item ${activeRoute === '/settings' ? 'active' : ''}" onclick="router('/settings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>Account</span>
            </button>
        </div>
    </div>`;
}
window.renderAppHeader = renderAppHeader;

function escapeJs(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}
window.escapeJs = escapeJs;

function openPreBookingChat(providerId, providerName) {
    if (!currentToken) {
        showToast('Please log in to chat with creators', 'info');
        sessionStorage.setItem('redirect_after_login', `/messages?user_id=${providerId}`);
        router('/login');
        return;
    }
    window.__selectedChatUserId = providerId;
    window.__selectedChatUserName = providerName || 'Creator';
    router('/messages');
}
window.openPreBookingChat = openPreBookingChat;
window.openProviderChatModal = openPreBookingChat;

function getCategoryPeekIconSvg(niche, size = 38) {
    if (niche === 'editors_animators' || niche === 'editors') {
        return `<svg class="peek-svg peek-svg-clapper" style="width: ${size}px; height: ${size}px;" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="20" width="32" height="21" rx="4" fill="#6c5ce7" stroke="#4c3fb5" stroke-width="1.5"/>
            <rect x="8" y="20" width="32" height="7" fill="#221d3b"/>
            <path d="M14 20 L18 27 M22 20 L26 27 M30 20 L34 27 M38 20 L40 23.5" stroke="#e0e7ff" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="13" y1="32" x2="23" y2="32" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" stroke-linecap="round"/>
            <line x1="13" y1="36" x2="35" y2="36" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5" stroke-linecap="round"/>
            <g class="clapper-stick-group">
                <rect x="6" y="11" width="34" height="7.5" rx="2.5" fill="#221d3b" stroke="#4c3fb5" stroke-width="1.5"/>
                <path d="M11 11.5 L15 18 M19 11.5 L23 18 M27 11.5 L31 18 M35 11.5 L39 18" stroke="#e0e7ff" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="9" cy="14.5" r="2.2" fill="#c7d2fe" stroke="#4c3fb5" stroke-width="1"/>
            </g>
        </svg>`;
    } else if (niche === 'tutors') {
        return `<svg class="peek-svg peek-svg-tutor" style="width: ${size}px; height: ${size}px;" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 22C8 14.268 15.163 8 24 8C32.837 8 40 14.268 40 22C40 29.732 32.837 36 24 36C21.6 36 19.33 35.53 17.3 34.7L10 38L11.8 32.1C9.46 29.35 8 25.86 8 22Z" fill="#059669" stroke="#065f46" stroke-width="1.5"/>
            <g class="tutor-wave-group">
                <path class="wave-1" d="M16 22C16 18.5 19 16 24 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                <path class="wave-2" d="M19 22C19 19.8 21 18.2 24 18.2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                <path class="wave-3" d="M18 25C18 27.5 20.5 29.5 24 29.5C26.5 29.5 28.5 28.3 29.3 26.5" stroke="#a7f3d0" stroke-width="2" stroke-linecap="round"/>
                <circle cx="30" cy="26.5" r="2" fill="#ecfdf5"/>
            </g>
        </svg>`;
    } else if (niche === 'writers') {
        return `<svg class="peek-svg peek-svg-writer" style="width: ${size}px; height: ${size}px;" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="22" height="30" rx="3" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
            <line x1="13" y1="17" x2="22" y2="17" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
            <line x1="13" y1="23" x2="25" y2="23" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="13" y1="29" x2="20" y2="29" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>
            <path class="writer-ink-trail" d="M13 34 C16 32, 19 36, 23 34" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
            <g class="writer-pen-group">
                <path d="M38 8L41 11L28 27L23 28L24 23L38 8Z" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
                <path d="M23 28L26 25L24 23L23 28Z" fill="#f8fafc"/>
                <circle cx="34" cy="14" r="1" fill="#ffffff"/>
            </g>
        </svg>`;
    } else if (niche === 'express') {
        return `<svg class="peek-svg peek-svg-express" style="width: ${size}px; height: ${size}px;" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.35)" stroke-width="1.2"/>
            <g class="express-pulse-group">
                <path d="M26 8L15 24H25L22 40L33 24H23L26 8Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="24" cy="24" r="2.5" fill="#ffffff"/>
            </g>
        </svg>`;
    } else {
        return `<svg class="peek-svg peek-svg-all" style="width: ${size}px; height: ${size}px;" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" fill="rgba(245, 158, 11, 0.12)" stroke="rgba(245, 158, 11, 0.3)" stroke-width="1"/>
            <g class="star-sparkle-group">
                <path d="M24 6 C24 16, 24 16, 34 24 C24 24, 24 24, 24 34 C24 24, 24 24, 14 24 C24 16, 24 16, 24 6 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
                <circle cx="24" cy="24" r="3" fill="#ffffff"/>
                <circle cx="13" cy="13" r="1.5" fill="#fde68a"/>
                <circle cx="35" cy="14" r="1.8" fill="#fde68a"/>
            <circle cx="33" cy="33" r="1.2" fill="#fde68a"/>
        </g>
    </svg>`;
    }
}
function getTypeIconSvg(typeId, fallbackIcon = '✨', size = 32) {
    if (!typeId) {
        return `<svg class="type-svg type-svg-all" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="15" fill="rgba(245, 158, 11, 0.15)"/>
            <path class="anim-sparkle" d="M18 4L21 14L31 17L21 20L18 30L15 20L5 17L15 14Z" fill="#f59e0b"/>
            <circle cx="18" cy="17" r="2.5" fill="#fff"/>
        </svg>`;
    }
    if (typeId === 'youtube') {
        return `<svg class="type-svg type-svg-youtube" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect x="3" y="6" width="30" height="24" rx="7" fill="#ef4444"/>
            <path class="anim-yt-play" d="M14 12L24 18L14 24Z" fill="#ffffff"/>
            <circle class="anim-pulse-dot" cx="28" cy="10" r="2" fill="#fecaca"/>
        </svg>`;
    }
    if (typeId === 'ads_social') {
        return `<svg class="type-svg type-svg-social" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <defs>
                <linearGradient id="gradSocial" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ec4899"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
            </defs>
            <rect x="8" y="4" width="20" height="28" rx="5" fill="url(#gradSocial)"/>
            <rect x="10" y="7" width="16" height="20" rx="3" fill="#0f172a"/>
            <path class="anim-heart" d="M18 13C16.5 11 13 12.5 13 15C13 18 18 21 18 21C18 21 23 18 23 15C23 12.5 19.5 11 18 13Z" fill="#ec4899"/>
            <circle cx="18" cy="29" r="1.5" fill="#e2e8f0"/>
        </svg>`;
    }
    if (typeId === 'gaming') {
        return `<svg class="type-svg type-svg-gaming" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <path d="M7 13C7 10 10 9 18 9C26 9 29 10 29 13L31 23C31.5 25.5 29 27.5 27 26L23 23H13L9 26C7 27.5 4.5 25.5 5 23L7 13Z" fill="#6366f1" stroke="#4338ca" stroke-width="1.5"/>
            <path class="anim-dpad" d="M10 16H14M12 14V18" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round"/>
            <circle class="anim-btn-1" cx="22" cy="15" r="1.5" fill="#f43f5e"/>
            <circle class="anim-btn-2" cx="25" cy="17" r="1.5" fill="#10b981"/>
        </svg>`;
    }
    if (typeId === 'animations') {
        return `<svg class="type-svg type-svg-anim" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L30 11V25L18 32L6 25V11L18 4Z" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.2"/>
            <path d="M18 4L18 18L30 11" stroke="#c4b5fd" stroke-width="1.2"/>
            <path d="M18 18L6 11" stroke="#c4b5fd" stroke-width="1.2"/>
            <path d="M18 18L18 32" stroke="#4c1d95" stroke-width="1.2"/>
            <circle class="anim-orbit" cx="24" cy="8" r="2.5" fill="#fbbf24"/>
        </svg>`;
    }
    if (typeId === 'motion_graphics') {
        return `<svg class="type-svg type-svg-motion" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <ellipse cx="18" cy="18" rx="14" ry="6" stroke="#38bdf8" stroke-width="1.5" transform="rotate(-25 18 18)" class="anim-ring-1"/>
            <ellipse cx="18" cy="18" rx="14" ry="6" stroke="#f43f5e" stroke-width="1.5" transform="rotate(35 18 18)" class="anim-ring-2"/>
            <circle cx="18" cy="18" r="4.5" fill="#38bdf8"/>
            <circle cx="18" cy="18" r="2" fill="#fff"/>
        </svg>`;
    }
    if (typeId === 'music') {
        return `<svg class="type-svg type-svg-music" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect class="eq-bar-1" x="7" y="16" width="3.5" height="12" rx="1.75" fill="#a855f7"/>
            <rect class="eq-bar-2" x="13" y="10" width="3.5" height="18" rx="1.75" fill="#ec4899"/>
            <rect class="eq-bar-3" x="19" y="6" width="3.5" height="22" rx="1.75" fill="#3b82f6"/>
            <rect class="eq-bar-4" x="25" y="13" width="3.5" height="15" rx="1.75" fill="#10b981"/>
        </svg>`;
    }
    if (typeId === 'corporate') {
        return `<svg class="type-svg type-svg-corp" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect x="6" y="12" width="11" height="18" rx="2" fill="#334155" stroke="#475569" stroke-width="1"/>
            <rect x="19" y="6" width="11" height="24" rx="2" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.2"/>
            <line x1="10" y1="16" x2="13" y2="16" stroke="#94a3b8" stroke-width="1.5"/>
            <line x1="10" y1="20" x2="13" y2="20" stroke="#94a3b8" stroke-width="1.5"/>
            <line x1="23" y1="10" x2="26" y2="10" stroke="#38bdf8" stroke-width="1.5"/>
            <line x1="23" y1="14" x2="26" y2="14" stroke="#38bdf8" stroke-width="1.5"/>
            <line x1="23" y1="18" x2="26" y2="18" stroke="#38bdf8" stroke-width="1.5"/>
            <path class="anim-arrow" d="M12 28L20 18L26 22L32 14" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
    if (typeId === 'ielts') {
        return `<svg class="type-svg type-svg-ielts" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="14" fill="#059669" stroke="#047857" stroke-width="1.2"/>
            <circle cx="18" cy="18" r="9" fill="#10b981"/>
            <circle cx="18" cy="18" r="4.5" fill="#ffffff"/>
            <path d="M18 6V11M18 25V30M6 18H11M25 18H30" stroke="#a7f3d0" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
    }
    if (typeId === 'accent') {
        return `<svg class="type-svg type-svg-accent" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect x="13" y="6" width="10" height="16" rx="5" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.2"/>
            <path d="M9 16C9 21 13 25 18 25C23 25 27 21 27 16" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
            <line x1="18" y1="25" x2="18" y2="30" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
            <line x1="13" y1="30" x2="23" y2="30" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
    }
    if (typeId === 'business') {
        return `<svg class="type-svg type-svg-business" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect x="6" y="12" width="24" height="18" rx="4" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
            <path d="M13 12V9C13 7.5 14.5 6 16 6H20C21.5 6 23 7.5 23 9V12" stroke="#fef3c7" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="6" y1="18" x2="30" y2="18" stroke="#78350f" stroke-width="1.5"/>
            <circle cx="18" cy="18" r="2.5" fill="#ffffff" stroke="#78350f" stroke-width="1"/>
        </svg>`;
    }
    if (typeId === 'speaking') {
        return `<svg class="type-svg type-svg-speaking" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <path d="M7 16C7 10 11 7 18 7C25 7 29 10 29 16C29 21 25 24 19 24L12 28L13 23.5C9 22 7 19.5 7 16Z" fill="#10b981" stroke="#047857" stroke-width="1.2"/>
            <circle cx="13" cy="15.5" r="1.5" fill="#ffffff"/>
            <circle cx="18" cy="15.5" r="1.5" fill="#ffffff"/>
            <circle cx="23" cy="15.5" r="1.5" fill="#ffffff"/>
        </svg>`;
    }
    if (typeId === 'script') {
        return `<svg class="type-svg type-svg-script" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect x="7" y="6" width="22" height="24" rx="3" fill="#6366f1" stroke="#4338ca" stroke-width="1.2"/>
            <line x1="12" y1="12" x2="24" y2="12" stroke="#e0e7ff" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="17" x2="24" y2="17" stroke="#c7d2fe" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="22" x2="19" y2="22" stroke="#c7d2fe" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="25" cy="24" r="3" fill="#fbbf24"/>
        </svg>`;
    }
    if (typeId === 'copy') {
        return `<svg class="type-svg type-svg-copy" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <path d="M20 4L8 19H18L16 32L28 17H18L20 4Z" fill="#ec4899" stroke="#be185d" stroke-width="1.2" stroke-linejoin="round"/>
            <circle cx="18" cy="18" r="2" fill="#ffffff"/>
        </svg>`;
    }
    if (typeId === 'seo') {
        return `<svg class="type-svg type-svg-seo" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <circle cx="16" cy="16" r="9" stroke="#0ea5e9" stroke-width="2"/>
            <line x1="23" y1="23" x2="30" y2="30" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M12 18L15 14L18 16L21 12" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`;
    }
    if (typeId === 'email') {
        return `<svg class="type-svg type-svg-email" style="width: ${size}px; height: ${size}px;" viewBox="0 0 36 36" fill="none">
            <rect x="5" y="8" width="26" height="20" rx="3" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.2"/>
            <path d="M5 10L18 19L31 10" stroke="#f5f3ff" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="28" cy="12" r="2" fill="#34d399"/>
        </svg>`;
    }
    return `<span style="font-size: ${Math.round(size * 0.7)}px; line-height: 1;">${fallbackIcon}</span>`;
}
window.getTypeIconSvg = getTypeIconSvg;
window.getCategoryPeekIconSvg = getCategoryPeekIconSvg;

window.__initSliderMouseDrag = (sliderEl) => {
    if (!sliderEl || sliderEl.__mouseDragInit) return;
    sliderEl.__mouseDragInit = true;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasMoved = false;

    sliderEl.addEventListener('mousedown', (e) => {
        isDown = true;
        hasMoved = false;
        sliderEl.classList.add('grabbing');
        startX = e.pageX - sliderEl.offsetLeft;
        scrollLeft = sliderEl.scrollLeft;
    });

    sliderEl.addEventListener('mouseleave', () => {
        isDown = false;
        sliderEl.classList.remove('grabbing');
    });

    sliderEl.addEventListener('mouseup', () => {
        isDown = false;
        sliderEl.classList.remove('grabbing');
    });

    sliderEl.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderEl.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 4) {
            hasMoved = true;
        }
        sliderEl.scrollLeft = scrollLeft - walk;
    });

    sliderEl.addEventListener('click', (e) => {
        if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
            hasMoved = false;
        }
    }, true);
};

async function updateUnreadCountBadge() {
    if (!currentToken) return;
    try {
        const res = await apiFetch('/messages/unread-count');
        const count = res.unread_count || 0;
        const topBadge = document.getElementById('header-unread-count');
        if (topBadge) {
            if (count > 0) {
                topBadge.textContent = count > 99 ? '99+' : count;
                topBadge.style.display = 'inline-block';
            } else {
                topBadge.style.display = 'none';
            }
        }
        const bottomDot = document.getElementById('bottom-unread-dot');
        if (bottomDot) {
            bottomDot.style.display = count > 0 ? 'block' : 'none';
        }
    } catch (_) {}
}
window.updateUnreadCountBadge = updateUnreadCountBadge;
setInterval(updateUnreadCountBadge, 12000);
setTimeout(updateUnreadCountBadge, 2000);

// Router
function router(path) {
    // 1. If admin is logged in, enforce exclusive Admin Console experience (no buyer/provider interference)
    if (currentToken && currentUser?.user_type === 'ADMIN') {
        const buyerProviderOnlyRoutes = ['/', '/welcome', '/providers', '/create-package', '/create-booking', '/packages'];
        if (buyerProviderOnlyRoutes.includes(path)) {
            path = '/admin';
        } else if (path === '/messages') {
            path = '/admin/chats';
        } else if (path === '/bookings') {
            path = '/admin/bookings';
        }
    }

    const routes = {
        '/': (currentToken ? ProvidersList : Landing),
        '/welcome': (currentToken ? (currentUser?.user_type === 'ADMIN' ? AdminDashboard : WelcomePage) : Login),
        '/login': Login,
        '/register': Register,
        '/profile': (currentToken ? Settings : Login),
        '/settings': (currentToken ? Settings : Login),
        '/payments': (currentToken ? PaymentsPortal : Login),
        '/packages': (currentToken ? MyPackages : Landing),
        '/create-package': (currentToken ? CreatePackage : Login),
        '/bookings': (currentToken ? BookingsList : Login),
        '/create-booking': (currentToken ? CreateBooking : Login),
        '/messages': (currentToken ? MessagesInbox : Login),
        '/admin': (currentToken ? AdminDashboard : Login),
        '/admin/providers': (currentToken ? AdminProviders : Login),
        '/admin/bookings': (currentToken ? AdminBookings : Login),
        '/admin/disputes': (currentToken ? AdminDisputes : Login),
        '/admin/chats': (currentToken ? AdminChatsView : Login),
        '/groove-chat': (currentToken ? GrooveChat : Login),
        '/privacy': PrivacyPolicy,
        '/terms': TermsOfService,
        '/forgot-password': ForgotPassword,
        '/reset-password': ResetPasswordPage,
        '/verify-email': VerifyEmailPage,
        '/logout': LogoutPage,
    };

    const component = routes[path] || NotFound;
    if (window.location.pathname !== path) history.pushState({}, '', path);
    render(component);
}
window.router = router;

function wireForms(root) {
    const form = root?.querySelector?.('form');
    if (!form) return;
    const handlers = {
        'handleLogin(event)': window.handleLogin,
        'handleRegister(event)': window.handleRegister,
        'handleProfileSave(event)': window.handleProfileSave,
        'handleSubmit(event)': window.handleSubmit
    };
    const inline = form.getAttribute('onsubmit');
    const handler = handlers[inline];
    if (handler) {
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', handler);
    }
}

function render(component) {
    appEl.innerHTML = '';
    const content = component();
    if (content) { appEl.appendChild(content); wireForms(content); }
    else appEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
}

window.render = render;

function mount(content) {
    appEl.innerHTML = '';
    if (content) { appEl.appendChild(content); wireForms(content); }
}

// =============== GLOBAL SOCIAL AUTH ===============

// Google Sign-In using the real Google Identity Services (GIS) library.
// The library (https://accounts.google.com/gsi/client) is loaded in index.html.
// When the user clicks "Continue with Google", Google shows its own account
// picker / login page. On success, Google returns a verified ID token that the
// backend already verifies via oauth2.googleapis.com/tokeninfo.
//
// Apple Sign-In keeps its existing modal flow (Apple has no equivalent JS popup).
// If no Google client ID is configured, falls back to the modal email flow.

async function handleGoogleSignIn(initialRole = null, credential = null) {
    const role = initialRole || window.selectedType || 'BUYER';

    // 1. If credential is provided (e.g. from Google GIS callback):
    if (credential) {
        const btn = document.querySelector('#btn-auth-google');
        const origBtnHtml = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;vertical-align:middle;"></span> Verifying with Google…';
        }

        try {
            const res = await apiFetch('/auth/google', {
                method: 'POST',
                body: JSON.stringify({
                    provider: 'google',
                    token: credential,
                    user_type: role,
                }),
            });
            currentToken = res.access_token;
            localStorage.setItem('access_token', currentToken);
            currentUser = await apiFetch('/auth/me');
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            showToast(`Signed in with Google as ${currentUser.name}!`, 'success');
            if (currentUser?.user_type === 'ADMIN') {
                router('/admin');
            } else {
                router('/');
            }
            return;
        } catch (err) {
            if (btn) { btn.disabled = false; btn.innerHTML = origBtnHtml; }
            console.error('Google token verification failed:', err);
            showToast(err.message || 'Google Sign-In failed. Please try again.', 'error');
            handleSocialLoginFallback('google', role);
            return;
        }
    }

    // 2. If no credential yet and GIS is available with client_id:
    const clientId = window.publicConfig?.google_client_id;
    if (typeof window.google !== 'undefined' && window.google?.accounts?.id && clientId) {
        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (gisResponse) => {
                    const cred = gisResponse?.credential || gisResponse;
                    if (cred && typeof cred === 'string') {
                        handleGoogleSignIn(role, cred);
                    } else {
                        handleSocialLoginFallback('google', role);
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            // Note: google.accounts.id.signIn does not exist in standard GIS SDK; 15_000 ms timeout safeguard
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
                    handleSocialLoginFallback('google', role);
                }
            });

            setTimeout(() => {
                if (!document.getElementById('social-login-modal') && !currentToken) {
                    handleSocialLoginFallback('google', role);
                }
            }, 800);
            return;
        } catch (e) {
            console.warn('GIS One Tap prompt note:', e);
        }
    }

    // 3. Fallback: Open sleek Google sign-in dialog immediately
    return handleSocialLoginFallback('google', role);
}

// Modal fallback for Google/Apple sign-in when GIS is unavailable or no client ID
async function handleSocialLoginFallback(provider, initialRole = null) {
    const providerName = provider === 'google' ? 'Google' : 'Apple';
    const role = initialRole || window.selectedType || 'BUYER';
    let chosenRole = role;

    // Remove any existing modal
    const existing = document.getElementById('social-login-modal');
    if (existing) existing.remove();

    // Display sleek account selection dialog
    const overlay = document.createElement('div');
    overlay.id = 'social-login-modal';
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;';

    overlay.innerHTML = `
        <div class="card" style="max-width: 440px; width: 100%; box-shadow: var(--shadow-lg); border: 1px solid var(--border); animation: fadeIn 0.2s ease;">
            <div class="card-header" style="border-bottom: 1px solid var(--border); padding: 18px 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${provider === 'google' ? `
                        <svg width="22" height="22" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z"/>
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                        </svg>` : `
                        <svg width="20" height="20" viewBox="0 0 170 170" fill="currentColor">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.6-7.79-11.7-14.24-6.3-9.91-11.25-20.98-14.85-33.2-3.6-12.22-5.4-23.77-5.4-34.65 0-14.73 3.65-26.96 10.96-36.68 7.3-9.73 16.48-14.71 27.53-14.96 4.9.12 10.37 1.33 16.4 3.63 6.03 2.3 9.94 3.52 11.73 3.66 2.01-.27 6.02-1.57 12.03-3.9 6.01-2.33 11.37-3.4 16.07-3.21 11.19.74 20.37 4.96 27.55 12.65-9.87 5.99-14.67 14.36-14.41 25.1.26 8.35 3.38 15.35 9.36 21 5.98 5.66 13.06 8.89 21.23 9.69-2.26 6.8-4.99 13.79-8.19 20.97zM119.22 31.84c0-7.23 2.61-13.9 7.82-20.02 5.22-6.12 11.59-9.86 19.11-11.22.13 1.06.2 2.06.2 3 0 7.34-2.73 14.19-8.18 20.55-5.46 6.36-11.96 10.09-19.51 11.19-.27-1.19-.44-2.36-.44-3.5z"/>
                        </svg>`}
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0;">Sign in with ${providerName}</h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Choose an account to continue to Groove Hub</div>
                    </div>
                </div>
                <button type="button" id="close-social-modal" style="background:transparent; border:none; color:var(--text-muted); font-size:1.25rem; cursor:pointer; padding: 4px 8px;">✕</button>
            </div>
            <div class="card-body" style="padding: 20px;">
                <div id="social-modal-error"></div>
                <form id="social-auth-form" onsubmit="return false;">
                    <div class="form-group">
                        <label class="form-label">${providerName} Email Address</label>
                        <input type="email" class="form-input" id="social-email" placeholder="name@${provider === 'google' ? 'gmail.com' : 'icloud.com'}" value="" required autofocus>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" id="social-name" placeholder="Your full name" value="" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Account Role</label>
                        <div class="tabs" style="margin-top: 6px;">
                            <button type="button" class="tab ${role === 'BUYER' ? 'active' : ''}" id="social-role-buyer">🎯 Buyer (Hire Talent)</button>
                            <button type="button" class="tab ${role === 'PROVIDER' ? 'active' : ''}" id="social-role-provider">🎨 Provider (Offer Services)</button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 22px;">
                        <button type="submit" class="btn btn-primary" id="social-submit-btn" style="flex: 1; justify-content: center; padding: 12px; font-weight: 700;">
                            Continue with ${providerName}
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancel-social-modal" style="width: auto; padding: 12px 18px;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const buyerBtn = overlay.querySelector('#social-role-buyer');
    const provBtn = overlay.querySelector('#social-role-provider');
    if (buyerBtn && provBtn) {
        buyerBtn.onclick = () => { chosenRole = 'BUYER'; window.selectedType = 'BUYER'; buyerBtn.classList.add('active'); provBtn.classList.remove('active'); };
        provBtn.onclick = () => { chosenRole = 'PROVIDER'; window.selectedType = 'PROVIDER'; provBtn.classList.add('active'); buyerBtn.classList.remove('active'); };
    }

    const close = () => overlay.remove();
    overlay.querySelector('#close-social-modal').onclick = close;
    overlay.querySelector('#cancel-social-modal').onclick = close;

    const socialForm = overlay.querySelector('#social-auth-form');
    socialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (overlay.querySelector('#social-email')?.value || '').trim();
        const name = (overlay.querySelector('#social-name')?.value || '').trim();
        const sBtn = overlay.querySelector('#social-submit-btn');
        const errBox = overlay.querySelector('#social-modal-error');
        if (errBox) errBox.innerHTML = '';

        if (!email || !name) {
            if (errBox) {
                errBox.innerHTML = `<div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-size: 0.85rem;">⚠️ Please enter both your email and full name.</div>`;
            }
            return;
        }

        const origText = sBtn.innerHTML;
        sBtn.disabled = true;
        sBtn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;vertical-align:middle;"></span> Connecting...`;

        try {
            const res = await apiFetch(`/auth/${provider}`, {
                method: 'POST',
                body: JSON.stringify({
                    provider,
                    email,
                    name,
                    user_type: chosenRole
                })
            });
            currentToken = res.access_token;
            localStorage.setItem('access_token', currentToken);
            currentUser = await apiFetch('/auth/me');
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            close();
            showToast(`Signed in with ${providerName} as ${currentUser.name}!`, 'success');
            if (currentUser?.user_type === 'ADMIN') {
                router('/admin');
            } else {
                router('/');
            }
        } catch (err) {
            sBtn.disabled = false;
            sBtn.innerHTML = origText;
            if (errBox) {
                errBox.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-size: 0.85rem;">
                        ⚠️ ${err.message || `Failed to sign in with ${providerName}`}
                    </div>
                `;
            }
        }
    });
}

function handleSocialLogin(provider, initialRole = null) {
    if (provider === 'google') {
        return handleGoogleSignIn(initialRole);
    }
    return handleSocialLoginFallback(provider, initialRole);
}
window.handleSocialLogin = handleSocialLogin;

// =============== AUTH PORTAL (SIGN IN & REGISTER) ===============

let authPortalActiveTab = 'login'; // 'login' or 'register'

function AuthPortal(initialTab = 'login') {
    authPortalActiveTab = initialTab;

    const view = el`<div class="main" style="padding: 24px 16px;">
        <div class="card" style="max-width: 440px; margin: 20px auto 40px; box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
            <div class="card-header" style="display: flex; flex-direction: column; align-items: center; padding: 24px 20px 16px; border-bottom: 1px solid var(--border);">
                <img class="logo-light-mode" src="/static/icons/grove_hub_logo_light.png" alt="Grove Hub" style="height: 68px; width: auto; max-width: 230px; object-fit: contain; margin-bottom: 6px; cursor: pointer;" onclick="router('/')" />
                <img class="logo-dark-mode" src="/static/icons/grove_hub_logo_dark.png" alt="Grove Hub" style="height: 68px; width: auto; max-width: 230px; object-fit: contain; margin-bottom: 6px; cursor: pointer; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));" onclick="router('/')" />
                <!-- Auth Tabs -->
                <div class="tabs" style="width: 100%; margin-top: 18px; display: flex;">
                    <button type="button" class="tab ${authPortalActiveTab === 'login' ? 'active' : ''}" id="auth-tab-login" style="flex: 1; text-align: center; font-weight: 700;">
                        Sign In
                    </button>
                    <button type="button" class="tab ${authPortalActiveTab === 'register' ? 'active' : ''}" id="auth-tab-register" style="flex: 1; text-align: center; font-weight: 700;">
                        Create Account
                    </button>
                </div>
            </div>

            <div class="card-body" style="padding: 24px 20px;">
                <!-- Social Sign In Options -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
                    <button type="button" class="btn-social btn-google" id="btn-auth-google" style="margin: 0;">

                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z"/>
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                        </svg>
                        <span id="label-google-btn">Continue with Google</span>
                    </button>
                    <button type="button" class="btn-social btn-apple" id="btn-auth-apple" style="margin: 0;">
                        <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.6-7.79-11.7-14.24-6.3-9.91-11.25-20.98-14.85-33.2-3.6-12.22-5.4-23.77-5.4-34.65 0-14.73 3.65-26.96 10.96-36.68 7.3-9.73 16.48-14.71 27.53-14.96 4.9.12 10.37 1.33 16.4 3.63 6.03 2.3 9.94 3.52 11.73 3.66 2.01-.27 6.02-1.57 12.03-3.9 6.01-2.33 11.37-3.4 16.07-3.21 11.19.74 20.37 4.96 27.55 12.65-9.87 5.99-14.67 14.36-14.41 25.1.26 8.35 3.38 15.35 9.36 21 5.98 5.66 13.06 8.89 21.23 9.69-2.26 6.8-4.99 13.79-8.19 20.97zM119.22 31.84c0-7.23 2.61-13.9 7.82-20.02 5.22-6.12 11.59-9.86 19.11-11.22.13 1.06.2 2.06.2 3 0 7.34-2.73 14.19-8.18 20.55-5.46 6.36-11.96 10.09-19.51 11.19-.27-1.19-.44-2.36-.44-3.5z"/>
                        </svg>
                        <span id="label-apple-btn">Continue with Apple</span>
                    </button>
                </div>

                <div class="social-divider"><span>or with email & phone</span></div>

                <!-- SIGN IN FORM -->
                <div id="auth-panel-login" style="display: ${authPortalActiveTab === 'login' ? 'block' : 'none'};">
                    <div id="login-error-container"></div>
                    <form id="login-form" onsubmit="return false;">
                        <div class="form-group">
                            <label class="form-label">Phone Number or Email</label>
                            <input type="text" class="form-input" id="login-phone" placeholder="Phone number or email address" required autocomplete="username">
                        </div>
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label class="form-label" style="margin: 0;">Password</label>
                                <button type="button" id="toggle-login-password" style="background: none; border: none; font-size: 0.75rem; color: var(--accent); cursor: pointer; padding: 0;">Show</button>
                            </div>
                            <input type="password" class="form-input" id="login-password" placeholder="Enter password" required autocomplete="current-password" style="margin-top: 6px;">
                        </div>
                        <button type="submit" class="btn btn-primary" id="login-submit-btn" style="width: 100%; padding: 13px; font-weight: 700; font-size: 1rem; justify-content: center; margin-top: 8px;">
                            Sign In
                        </button>
                        <div style="text-align: center; margin-top: 14px;">
                            <button type="button" onclick="router('/forgot-password')" style="background: none; border: none; padding: 0; font-size: 0.85rem; color: var(--accent); text-decoration: none; font-weight: 600; cursor: pointer;">Forgot Password?</button>
                        </div>
                    </form>


                </div>

                <!-- REGISTER FORM -->
                <div id="auth-panel-register" style="display: ${authPortalActiveTab === 'register' ? 'block' : 'none'};">
                    <div id="reg-error-container"></div>
                    <form id="register-form" onsubmit="return false;">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-input" id="reg-name" placeholder="John Doe" required autocomplete="name">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="display:flex;align-items:center;gap:6px;">Username <span style="color:var(--danger);font-size:0.75rem;">*required</span></label>
                            <div style="position:relative;">
                                <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.9rem;pointer-events:none;">@</span>
                                <input type="text" class="form-input" id="reg-username" placeholder="your_unique_username" required autocomplete="username" style="padding-left:26px;" maxlength="30">
                            </div>
                            <div id="reg-username-hint" style="font-size:0.75rem;margin-top:4px;color:var(--text-muted);">3–30 characters. Letters, numbers, underscores only. Must be unique and different from your name.</div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Phone Number</label>
                                <input type="tel" class="form-input" id="reg-phone" placeholder="Your phone number" required autocomplete="tel">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="form-input" id="reg-email" placeholder="name@example.com" required autocomplete="email">
                            </div>
                        </div>
                        <div class="form-group">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <label class="form-label" style="margin: 0;">Password</label>
                                <button type="button" id="toggle-reg-password" style="background: none; border: none; font-size: 0.75rem; color: var(--accent); cursor: pointer; padding: 0;">Show</button>
                            </div>
                            <input type="password" class="form-input" id="reg-password" placeholder="Create strong password" required autocomplete="new-password" style="margin-top: 6px;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">I want to:</label>
                            <div class="tabs" style="margin-top: 8px;">
                                <button type="button" class="tab ${(window.selectedType || 'BUYER') === 'BUYER' ? 'active' : ''}" id="reg-tab-buyer">
                                    🎯 Hire Talent (Buyer)
                                </button>
                                <button type="button" class="tab ${(window.selectedType || 'BUYER') === 'PROVIDER' ? 'active' : ''}" id="reg-tab-prov">
                                    🎨 Offer Services (Creator)
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" id="reg-submit-btn" style="width: 100%; padding: 13px; font-weight: 700; font-size: 1rem; justify-content: center; margin-top: 8px;">
                            Create Account
                        </button>
                        <div style="text-align: center; margin-top: 14px;">
                            <button type="button" onclick="router('/login')" style="background: none; border: none; padding: 0; font-size: 0.85rem; color: var(--accent); text-decoration: none; font-weight: 600; cursor: pointer;">Already have an account? Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;

    // Elements
    const tabLogin = view.querySelector('#auth-tab-login');
    const tabRegister = view.querySelector('#auth-tab-register');
    const panelLogin = view.querySelector('#auth-panel-login');
    const panelRegister = view.querySelector('#auth-panel-register');
    const labelGoogle = view.querySelector('#label-google-btn');
    const labelApple = view.querySelector('#label-apple-btn');
    const btnGoogle = view.querySelector('#btn-auth-google');
    const btnApple = view.querySelector('#btn-auth-apple');

    // Switch tab function
    const switchTab = (tab) => {
        authPortalActiveTab = tab;
        if (tab === 'login') {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            panelLogin.style.display = 'block';
            panelRegister.style.display = 'none';
            if (labelGoogle) labelGoogle.textContent = 'Continue with Google';
            if (labelApple) labelApple.textContent = 'Continue with Apple';
            if (window.location.pathname !== '/login') history.pushState({}, '', '/login');
        } else {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            panelRegister.style.display = 'block';
            panelLogin.style.display = 'none';
            if (labelGoogle) labelGoogle.textContent = 'Sign up with Google';
            if (labelApple) labelApple.textContent = 'Sign up with Apple';
            if (window.location.pathname !== '/register') history.pushState({}, '', '/register');
        }
        renderGoogleBtnIfReady();
    };

    tabLogin.onclick = () => switchTab('login');
    tabRegister.onclick = () => switchTab('register');

    // Social buttons — Google uses renderButton() when GIS is available and configured
    const renderGoogleBtnIfReady = () => {
        let googleBtn = view.querySelector('#btn-auth-google');
        if (!googleBtn) return;
        const clientId = window.publicConfig?.google_client_id;

        if (window.google?.accounts?.id && clientId) {
            const parent = googleBtn.parentNode;
            const containerWidth = parent ? Math.max(220, Math.min(400, Math.floor(parent.clientWidth || parent.offsetWidth || 340))) : 340;

            // renderButton works best on clean div containers without button styling
            if (googleBtn.tagName === 'BUTTON') {
                const div = document.createElement('div');
                div.id = googleBtn.id;
                div.className = 'gis-btn-container';
                div.style.cssText = 'width: 100%; display: flex; justify-content: center; align-items: center; min-height: 44px; margin: 0; padding: 0; background: transparent; border: none; box-shadow: none;';
                parent.replaceChild(div, googleBtn);
                googleBtn = div;
            } else {
                googleBtn.className = 'gis-btn-container';
                googleBtn.style.cssText = 'width: 100%; display: flex; justify-content: center; align-items: center; min-height: 44px; margin: 0; padding: 0; background: transparent; border: none; box-shadow: none;';
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response && response.credential) {
                            handleGoogleSignIn(window.selectedType || 'BUYER', response.credential);
                        } else {
                            handleSocialLoginFallback('google', window.selectedType || 'BUYER');
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                googleBtn.innerHTML = '';
                window.google.accounts.id.renderButton(googleBtn, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: authPortalActiveTab === 'register' ? 'signup_with' : 'continue_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: containerWidth,
                });
            } catch (e) {
                console.warn('Google renderButton failed, falling back to manual sign-in:', e);
                // Note: google.accounts.id.signIn 15_000 timeout safeguard
                googleBtn.onclick = () => handleSocialLoginFallback('google', window.selectedType || 'BUYER');
            }
        } else {
            // Note: google.accounts.id.signIn 15_000 timeout safeguard
            googleBtn.onclick = () => handleSocialLoginFallback('google', window.selectedType || 'BUYER');
        }
    };

    renderGoogleBtnIfReady();
    window.__refreshGoogleBtn = renderGoogleBtnIfReady;

    if (!window.__gisPollInterval) {
        let attempts = 0;
        window.__gisPollInterval = setInterval(() => {
            attempts++;
            if (window.google?.accounts?.id && window.publicConfig?.google_client_id) {
                renderGoogleBtnIfReady();
                clearInterval(window.__gisPollInterval);
                window.__gisPollInterval = null;
            } else if (attempts >= 20) {
                clearInterval(window.__gisPollInterval);
                window.__gisPollInterval = null;
            }
        }, 500);
    }

    if (!window.__gisResizeAttached) {
        window.__gisResizeAttached = true;
        window.addEventListener('resize', () => {
            if (window.__gisResizeTimer) clearTimeout(window.__gisResizeTimer);
            window.__gisResizeTimer = setTimeout(() => {
                if (typeof window.__refreshGoogleBtn === 'function') {
                    window.__refreshGoogleBtn();
                }
            }, 250);
        }, { passive: true });
    }


    btnApple.onclick = () => handleSocialLoginFallback('apple', window.selectedType || 'BUYER');

    // Password toggles
    const toggleLoginPw = view.querySelector('#toggle-login-password');
    const loginPwInput = view.querySelector('#login-password');
    if (toggleLoginPw && loginPwInput) {
        toggleLoginPw.onclick = () => {
            if (loginPwInput.type === 'password') {
                loginPwInput.type = 'text';
                toggleLoginPw.textContent = 'Hide';
            } else {
                loginPwInput.type = 'password';
                toggleLoginPw.textContent = 'Show';
            }
        };
    }

    const toggleRegPw = view.querySelector('#toggle-reg-password');
    const regPwInput = view.querySelector('#reg-password');
    if (toggleRegPw && regPwInput) {
        toggleRegPw.onclick = () => {
            if (regPwInput.type === 'password') {
                regPwInput.type = 'text';
                toggleRegPw.textContent = 'Hide';
            } else {
                regPwInput.type = 'password';
                toggleRegPw.textContent = 'Show';
            }
        };
    }

    // Auto-suggest username from name input
    const regNameInput = view.querySelector('#reg-name');
    const regUsernameInput = view.querySelector('#reg-username');
    const regUsernameHint = view.querySelector('#reg-username-hint');

    if (regNameInput && regUsernameInput) {
        // Auto-fill username when user types their name (only if username is still empty/auto)
        let usernameTouched = false;
        regUsernameInput.addEventListener('input', () => { usernameTouched = true; });

        regNameInput.addEventListener('input', () => {
            // Re-check if username matches name (in case name was edited after username was set)
            const currentUsername = (regUsernameInput.value || '').trim();
            if (currentUsername) {
                const nameNormalized = regNameInput.value.toLowerCase().replace(/\s+/g, '_');
                if (currentUsername === nameNormalized) {
                    if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--danger);">❌ Username cannot match your name — choose something different</span>';
                } else if (currentUsername.length >= 3) {
                    clearTimeout(usernameCheckTimer);
                    usernameCheckTimer = setTimeout(async () => {
                        try {
                            const res = await fetch(`/api/providers/by-username/${encodeURIComponent(currentUsername)}`, { method: 'GET' });
                            const data = await res.json();
                            if (data && data.provider) {
                                if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--danger);">❌ @' + currentUsername + ' is already taken</span>';
                            } else {
                                if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:#10b981;">✅ @' + currentUsername + ' is available!</span>';
                            }
                        } catch {
                            if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--text-muted);">3–30 characters. Letters, numbers, underscores only.</span>';
                        }
                    }, 400);
                }
            }
        });

        // Real-time username availability check + name-match check
        let usernameCheckTimer = null;
        regUsernameInput.addEventListener('input', () => {
            clearTimeout(usernameCheckTimer);
            const val = regUsernameInput.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            regUsernameInput.value = val; // sanitize in-place

            // --- Name-match check: username cannot be the same as the name ---
            const nameField = document.getElementById('reg-name');
            if (nameField && val) {
                const nameNormalized = nameField.value.toLowerCase().replace(/\s+/g, '_');
                if (val === nameNormalized) {
                    if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--danger);">❌ Username cannot match your name — choose something different</span>';
                    return;
                }
            }

            if (!val) {
                if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--text-muted);">3–30 characters. Letters, numbers, underscores only. Must be unique and different from your name.</span>';
                return;
            }
            if (val.length < 3) {
                if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--danger);">⚠ Too short — at least 3 characters</span>';
                return;
            }
            if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--text-muted);">⏳ Checking availability...</span>';

            usernameCheckTimer = setTimeout(async () => {
                try {
                    // Use the existing providers search — if a provider with this username exists, it's taken
                    // We check by trying the public endpoint
                    const res = await fetch(`/api/providers/by-username/${encodeURIComponent(val)}`);
                    if (res.status === 200) {
                        // Found — username taken
                        if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--danger);">❌ @' + val + ' is already taken</span>';
                    } else if (res.status === 404) {
                        if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:#10b981;">✅ @' + val + ' is available!</span>';
                    } else {
                        if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--text-muted);">3–30 characters. Letters, numbers, underscores only. Must be unique and different from your name.</span>';
                    }
                } catch (_) {
                    if (regUsernameHint) regUsernameHint.innerHTML = '<span style="color:var(--text-muted);">3–30 characters. Letters, numbers, underscores only.</span>';
                }
            }, 500);
        });
    }

    // Role selection in Register
    const regTabBuyer = view.querySelector('#reg-tab-buyer');
    const regTabProv = view.querySelector('#reg-tab-prov');
    if (regTabBuyer && regTabProv) {
        regTabBuyer.onclick = () => {
            window.selectedType = 'BUYER';
            regTabBuyer.classList.add('active');
            regTabProv.classList.remove('active');
        };
        regTabProv.onclick = () => {
            window.selectedType = 'PROVIDER';
            regTabProv.classList.add('active');
            regTabBuyer.classList.remove('active');
        };
    }



    // Login Form Submit Handler
    const loginForm = view.querySelector('#login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errContainer = view.querySelector('#login-error-container');
        if (errContainer) errContainer.innerHTML = '';

        const phoneInput = (view.querySelector('#login-phone')?.value || '').trim();
        const cleanPhone = phoneInput.replace(/^\+91[\s-]*/, '').replace(/[\s-]/g, '');
        const password = view.querySelector('#login-password')?.value || '';
        const btn = view.querySelector('#login-submit-btn');

        if (!phoneInput || !password) {
            if (errContainer) {
                errContainer.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem;">
                        ⚠️ Please enter both phone/email and password.
                    </div>
                `;
            }
            return;
        }

        const origBtnHtml = btn ? btn.innerHTML : 'Sign In';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;vertical-align:middle;"></span> Signing in...`;
        }

        try {
            const data = {
                phone: cleanPhone || phoneInput,
                password: password
            };
            const result = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            currentToken = result.access_token;
            localStorage.setItem('access_token', currentToken);

            currentUser = await apiFetch('/auth/me');
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            showToast(`Welcome back, ${currentUser.name || 'User'}!`, 'success');
            if (currentUser?.user_type === 'ADMIN') {
                router('/admin');
            } else {
                router('/');
            }
        } catch (err) {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origBtnHtml;
            }
            const isCredErr = err.message && (err.message.toLowerCase().includes('credential') || err.message.toLowerCase().includes('401'));
            if (errContainer) {
                errContainer.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 12px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; line-height: 1.4;">
                        <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            <span>⚠️</span> ${isCredErr ? 'Invalid Phone/Email or Password' : (err.message || 'Login failed')}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${isCredErr ?
                        `No account found with these credentials. Don't have an account yet? <button type="button" id="btn-switch-to-reg" style="background:none;border:none;color:var(--accent);font-weight:700;text-decoration:underline;cursor:pointer;padding:0;">Create Account here</button> with these details, or use Google / Apple above.` :
                        err.message}
                        </div>
                    </div>
                `;

                const switchBtn = errContainer.querySelector('#btn-switch-to-reg');
                if (switchBtn) {
                    switchBtn.onclick = () => {
                        switchTab('register');
                        // Pre-fill email/phone and password into register inputs
                        const regEmail = view.querySelector('#reg-email');
                        const regPhone = view.querySelector('#reg-phone');
                        const regPw = view.querySelector('#reg-password');
                        if (phoneInput.includes('@')) {
                            if (regEmail) regEmail.value = phoneInput;
                        } else {
                            if (regPhone) regPhone.value = cleanPhone || phoneInput;
                        }
                        if (regPw) regPw.value = password;
                    };
                }
            }
        }
    });

    // Register Form Submit Handler
    const regForm = view.querySelector('#register-form');
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errContainer = view.querySelector('#reg-error-container');
        if (errContainer) errContainer.innerHTML = '';

        const name = (view.querySelector('#reg-name')?.value || '').trim();
        const rawUsername = (view.querySelector('#reg-username')?.value || '').trim();
        const username = rawUsername.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
        const phone = (view.querySelector('#reg-phone')?.value || '').trim();
        const email = (view.querySelector('#reg-email')?.value || '').trim();
        const password = view.querySelector('#reg-password')?.value || '';
        const role = window.selectedType || 'BUYER';
        const btn = view.querySelector('#reg-submit-btn');
        const regUsernameHint = view.querySelector('#reg-username-hint');

        if (!name || !username || !phone || !email || !password) {
            if (errContainer) {
                errContainer.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem;">
                        ⚠️ ${!username ? 'Please choose a username — it must be unique.' : 'Please fill in all fields to create your account.'}
                    </div>
                `;
            }
            if (!username) view.querySelector('#reg-username')?.focus();
            return;
        }

        if (username.length < 3) {
            if (errContainer) {
                errContainer.innerHTML = `<div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem;">⚠️ Username must be at least 3 characters.</div>`;
            }
            return;
        }

        const origText = btn ? btn.innerHTML : 'Create Account';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;vertical-align:middle;"></span> Creating Account...`;
        }

        try {
            const data = {
                name,
                username,
                phone,
                email,
                password,
                user_type: role
            };
            const result = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            currentToken = result.access_token;
            localStorage.setItem('access_token', currentToken);
            currentUser = await apiFetch('/auth/me');
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            showToast(`Account created successfully! Welcome, ${currentUser.name}!`, 'success');
            if (currentUser?.user_type === 'ADMIN') {
                router('/admin');
            } else {
                router('/');
            }
        } catch (err) {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = origText;
            }
            const isAlreadyErr = err.message && (err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('exists'));
            if (errContainer) {
                errContainer.innerHTML = `
                    <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid var(--danger, #ef4444); color: var(--danger, #ef4444); padding: 12px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; line-height: 1.4;">
                        <div style="font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                            <span>⚠️</span> Registration Failed
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            ${err.message || 'Could not create account'}.
                            ${isAlreadyErr ?
                        ` Already registered? <button type="button" id="btn-switch-to-login" style="background:none;border:none;color:var(--accent);font-weight:700;text-decoration:underline;cursor:pointer;padding:0;">Sign In here</button>` : ''}
                        </div>
                    </div>
                `;

                const switchLoginBtn = errContainer.querySelector('#btn-switch-to-login');
                if (switchLoginBtn) {
                    switchLoginBtn.onclick = () => {
                        switchTab('login');
                        const loginPhone = view.querySelector('#login-phone');
                        const loginPw = view.querySelector('#login-password');
                        if (loginPhone) loginPhone.value = email || phone;
                        if (loginPw) loginPw.value = password;
                    };
                }
            }
        }
    });

    return view;
}

function Login() {
    return AuthPortal('login');
}

function Register() {
    return AuthPortal('register');
}


// =============== LANDING & START YOUR JOURNEY ===============

function startJourney(preselectedRole = 'BUYER') {
    let chosenRole = preselectedRole;
    window.selectedType = chosenRole;

    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.72); backdrop-filter: blur(6px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;';

    overlay.innerHTML = `
        <div class="card" style="max-width: 480px; width: 100%; box-shadow: var(--shadow-lg); border: 1px solid var(--border); animation: fadeIn 0.25s ease;">
            <div class="card-header" style="border-bottom: 1px solid var(--border); padding-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(91, 52, 234, 0.1); color: #5b34ea; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🚀</div>
                    <div>
                        <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0; color: var(--text-primary);">Start Your Journey</h3>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 2px 0 0;">Choose how you want to use Groove Hub</p>
                    </div>
                </div>
                <button type="button" id="close-journey-modal" style="background:transparent; border:none; color:var(--text-muted); font-size:1.3rem; cursor:pointer; padding: 4px;">✕</button>
            </div>
            <div class="card-body" style="padding-top: 20px;">
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                    <div class="journey-role-card ${chosenRole === 'BUYER' ? 'active' : ''}" id="journey-card-buyer">
                        <div class="journey-role-icon">🎯</div>
                        <div class="journey-role-content">
                            <h4>I want to hire talent</h4>
                            <p>Find verified video editors, animators & English tutors. 100% Escrow protected with milestone approvals.</p>
                        </div>
                    </div>
                    <div class="journey-role-card ${chosenRole === 'PROVIDER' ? 'active' : ''}" id="journey-card-provider">
                        <div class="journey-role-icon">🎨</div>
                        <div class="journey-role-content">
                            <h4>I want to offer my services</h4>
                            <p>Publish service packages, deliver client projects, and keep 80% guaranteed payouts with direct UPI / Bank transfer.</p>
                        </div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button type="button" class="btn btn-primary" id="journey-proceed-btn" style="padding: 14px; font-weight: 700; font-size: 1rem; justify-content: center; background: #5b34ea;">
                        Continue as ${chosenRole === 'BUYER' ? 'Buyer (Hire Talent)' : 'Creator (Offer Services)'} -->
                    </button>
                    <div style="text-align: center; margin: 4px 0; font-size: 0.8rem; color: var(--text-muted);">or continue instantly</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <button type="button" class="btn btn-secondary btn-sm" id="journey-google-btn" style="justify-content: center; padding: 10px;">
                            <svg width="16" height="16" viewBox="0 0 18 18" style="margin-right: 6px;">
                                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z"/>
                                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                            </svg>
                            Google
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" id="journey-apple-btn" style="justify-content: center; padding: 10px;">
                            <svg width="16" height="16" viewBox="0 0 170 170" fill="currentColor" style="margin-right: 6px;">
                                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.6-7.79-11.7-14.24-6.3-9.91-11.25-20.98-14.85-33.2-3.6-12.22-5.4-23.77-5.4-34.65 0-14.73 3.65-26.96 10.96-36.68 7.3-9.73 16.48-14.71 27.53-14.96 4.9.12 10.37 1.33 16.4 3.63 6.03 2.3 9.94 3.52 11.73 3.66 2.01-.27 6.02-1.57 12.03-3.9 6.01-2.33 11.37-3.4 16.07-3.21 11.19.74 20.37 4.96 27.55 12.65-9.87 5.99-14.67 14.36-14.41 25.1.26 8.35 3.38 15.35 9.36 21 5.98 5.66 13.06 8.89 21.23 9.69-2.26 6.8-4.99 13.79-8.19 20.97zM119.22 31.84c0-7.23 2.61-13.9 7.82-20.02 5.22-6.12 11.59-9.86 19.11-11.22.13 1.06.2 2.06.2 3 0 7.34-2.73 14.19-8.18 20.55-5.46 6.36-11.96 10.09-19.51 11.19-.27-1.19-.44-2.36-.44-3.5z"/>
                            </svg>
                            Apple
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#close-journey-modal').onclick = close;

    const buyerCard = overlay.querySelector('#journey-card-buyer');
    const provCard = overlay.querySelector('#journey-card-provider');
    const proceedBtn = overlay.querySelector('#journey-proceed-btn');

    const updateSelection = (role) => {
        chosenRole = role;
        window.selectedType = role;
        if (role === 'BUYER') {
            buyerCard.classList.add('active');
            provCard.classList.remove('active');
            proceedBtn.textContent = 'Continue as Buyer (Hire Talent) -->';
        } else {
            provCard.classList.add('active');
            buyerCard.classList.remove('active');
            proceedBtn.textContent = 'Continue as Creator (Offer Services) -->';
        }
    };

    buyerCard.onclick = () => updateSelection('BUYER');
    provCard.onclick = () => updateSelection('PROVIDER');

    proceedBtn.onclick = () => {
        close();
        router('/register');
    };

    overlay.querySelector('#journey-google-btn').onclick = () => {
        close();
        handleSocialLogin('google', chosenRole);
    };

    overlay.querySelector('#journey-apple-btn').onclick = () => {
        close();
        handleSocialLogin('apple', chosenRole);
    };
}
window.startJourney = startJourney;

// =============== QUICK NAV: VIDEO EDITORS & TUTORS ===============
function goToVideoEditors() {
    router('/');
}

function goToTutors() {
    router('/');
}

// =============== WELCOME / START YOUR JOURNEY PAGE (POST-LOGIN) ===============
function WelcomePage() {
    if (!currentUser && !currentToken) {
        router('/login');
        return el`<div></div>`;
    }

    const user = currentUser || {};
    const isProvider = user.user_type === 'PROVIDER';
    const isAdmin = user.user_type === 'ADMIN';

    const roleLabel = isAdmin ? 'Admin' : isProvider ? 'Creator / Educator' : 'Client / Buyer';
    const roleEmoji = isAdmin ? '⚡' : isProvider ? '🎨' : '🎯';

    const getDestination = () => {
        if (isAdmin) return '/admin';
        if (isProvider) return '/packages';
        return '/';
    };

    const view = el`<div>
        <!-- Modern Welcome Header -->
        <header class="header" style="border-bottom: 1px solid var(--border); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: var(--bg-card);">
            <div style="display: flex; align-items: center; gap: 10px;">
                ${renderLogo(30, true)}
            </div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 6px; font-size: 0.825rem; color: var(--text-secondary);">
                    <span>Welcome back, <strong style="color: var(--text-primary);">${user.name || 'Friend'}</strong></span>
                    <span style="background: rgba(91, 52, 234, 0.12); color: #5b34ea; padding: 2px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">
                        ${roleEmoji} ${roleLabel}
                    </span>
                </div>
                <button class="btn btn-secondary btn-sm" id="welcome-skip-btn" style="padding: 6px 14px; font-size: 0.8125rem; font-weight: 600; cursor: pointer;"
                        onclick="router('/'); setTimeout(function(){ window.setProviderNiche && window.setProviderNiche(''); }, 200);">
                    Skip to App -->
                </button>
            </div>
        </header>

        <!-- Moxie-Style Hero Section -->
        <div class="hero-wrapper" style="padding-top: 40px; padding-bottom: 40px;">
            <div class="hero-grid">
                <!-- Left Column -->
                <div class="hero-left">
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(91, 52, 234, 0.08); border: 1px solid rgba(91, 52, 234, 0.2); padding: 6px 14px; border-radius: 999px; font-size: 0.8125rem; color: #5b34ea; font-weight: 700; margin-bottom: 18px; width: fit-content;">
                        <span>🚀</span> Successfully Logged In
                    </div>

                    <h1 class="hero-title" style="margin-bottom: 16px; line-height: 1.15;">
                        Stupid-good tools<br>
                        <span class="hero-title-accent">for freelancers</span>
                    </h1>

                    <p class="hero-subtitle" style="margin-bottom: 28px;">
                        We can't run your business for you, but we can make it easier.
                    </p>

                    <!-- CTAs -->
                    <div class="hero-cta-group">
                        <button class="btn-start-journey" id="btn-welcome-start" style="padding: 16px 38px; font-size: 1.1rem; cursor: pointer;">
                            Start your journey -->
                        </button>
                        <div class="hero-cta-secondary">
                            or <span class="hero-link-action" id="btn-welcome-explore">See marketplace in action</span>
                        </div>
                    </div>

                    <div class="hero-microcopy" style="margin-top: 14px;">
                        Enjoy 100% escrow protection & verified talent - <strong>no credit card required</strong>.
                    </div>

                    <!-- Role highlights mini cards -->
                    <div style="margin-top: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; max-width: 520px;">
                        <div class="mini-card mini-video" onclick="goToVideoEditors()" style="background: var(--bg-hover); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.2s var(--ease-spring), box-shadow 0.2s ease, border-color 0.2s ease;"
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px -4px rgba(99,102,241,0.2)'; this.style.borderColor='var(--accent)';"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='var(--border)';">
                            <span style="font-size: 1.3rem;">🎬</span>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.3;">
                                <strong style="color: var(--text-primary); display: block;">Video Editors</strong>
                                Reels, Shorts & Longform
                            </div>
                        </div>
                        <div class="mini-card mini-tutor" onclick="goToTutors()" style="background: var(--bg-hover); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: transform 0.2s var(--ease-spring), box-shadow 0.2s ease, border-color 0.2s ease;"
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px -4px rgba(99,102,241,0.2)'; this.style.borderColor='var(--accent)';"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='var(--border)';">
                            <span style="font-size: 1.3rem;">🗣️</span>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.3;">
                                <strong style="color: var(--text-primary); display: block;">English Coaches</strong>
                                1-on-1 Fluency & Accent
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Illustration with Floating Badges -->
                <div class="hero-right">
                    <div class="hero-illustration-wrapper">
                        <picture>
                            <source srcset="/static/images/welcome_freelancer.webp" type="image/webp">
                            <img src="/static/images/welcome_freelancer.png" alt="Freelancer working happily on laptop" class="hero-illustration-img">
                        </picture>

                        <!-- Dotted curved arc with floating badges matching Moxie screenshot -->
                        <div class="welcome-floating-badge badge-top-left">
                            <span class="badge-icon">📅</span>
                            <span class="badge-text">Bookings</span>
                        </div>
                        <div class="welcome-floating-badge badge-top-right">
                            <span class="badge-icon">🤝</span>
                            <span class="badge-text">100% Escrow</span>
                        </div>
                        <div class="welcome-floating-badge badge-mid-left">
                            <span class="badge-icon">💬</span>
                            <span class="badge-text">Live Chat</span>
                        </div>
                        <div class="welcome-floating-badge badge-mid-right">
                            <span class="badge-icon">⏱️</span>
                            <span class="badge-text">24-48h Delivery</span>
                        </div>
                        <div class="welcome-floating-badge badge-bot-right">
                            <span class="badge-icon">💰</span>
                            <span class="badge-text">Direct Payouts</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trust / Review Strip at Bottom (Matching Moxie reference) -->
            <div class="welcome-trust-strip" style="margin-top: 52px; padding-top: 28px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; gap: 2px;">
                        <span style="background: #00b67a; color: #fff; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; border-radius: 3px; font-weight: bold;">★</span>
                        <span style="background: #00b67a; color: #fff; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; border-radius: 3px; font-weight: bold;">★</span>
                        <span style="background: #00b67a; color: #fff; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; border-radius: 3px; font-weight: bold;">★</span>
                        <span style="background: #00b67a; color: #fff; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; border-radius: 3px; font-weight: bold;">★</span>
                        <span style="background: #00b67a; color: #fff; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; border-radius: 3px; font-weight: bold;">★</span>
                    </div>
                    <div>
                        <strong style="color: var(--text-primary); font-size: 0.875rem; display: block;">4.9 / 5 Rating</strong>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">from 2,400+ creators & clients</span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <span style="color: #10b981; font-size: 1.1rem; font-weight: bold;">✓</span>
                    <span>100% Escrow Protection</span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <span style="color: #6366f1; font-size: 1.1rem; font-weight: bold;">✓</span>
                    <span>Verified Video Editors & Tutors</span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <span style="color: #f59e0b; font-size: 1.1rem; font-weight: bold;">✓</span>
                    <span>Zero Upfront Risk</span>
                </div>
            </div>
        </div>
    </div>`;

    // Event handlers
    const startBtn = view.querySelector('#btn-welcome-start');
    const exploreBtn = view.querySelector('#btn-welcome-explore');
    const skipBtn = view.querySelector('#welcome-skip-btn');

    const proceed = () => {
        view.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        view.style.opacity = '0';
        view.style.transform = 'scale(0.98)';
        setTimeout(() => {
            router(getDestination());
        }, 180);
    };

    if (startBtn) startBtn.onclick = proceed;
    if (skipBtn) skipBtn.onclick = proceed;
    if (exploreBtn) exploreBtn.onclick = () => {
        view.style.transition = 'opacity 0.2s ease';
        view.style.opacity = '0';
        setTimeout(() => router('/'), 180);
    };

    return view;
}
window.WelcomePage = WelcomePage;

function Landing() {
    if (currentUser) {
        return Dashboard();
    }

    return el`<div>
        <!-- Modern SaaS Landing Navigation -->
        <header class="header" style="border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                ${renderLogo(34, true)}
            </div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <button class="nav-btn" onclick="router('/login')" style="border: none; font-weight: 600; cursor: pointer;">Sign In</button>
                <button class="btn btn-primary" onclick="startJourney()" style="padding: 10px 22px; font-weight: 700; background: #5b34ea; border: none; cursor: pointer;">
                    Start your journey
                </button>
            </div>
        </header>

        <!-- Moxie-Inspired Hero Section -->
        <div class="hero-wrapper">
            <div class="hero-grid">
                <div class="hero-left">
                    <h1 class="hero-title">
                        Stupid-good tools<br>
                        <span class="hero-title-accent">for freelancers</span>
                    </h1>
                    <p class="hero-subtitle">
                        We can't run your business for you, but we can make it easier.
                    </p>
                    <div class="hero-cta-group">
                        <button class="btn-start-journey" onclick="startJourney()">
                            Start your journey
                        </button>
                        <div class="hero-cta-secondary">
                            or <span class="hero-link-action" onclick="router('/');">Explore marketplace</span>
                        </div>
                    </div>
                    <div class="hero-microcopy">
                        Enjoy 100% escrow protection - <strong>no credit card required</strong> to explore.
                    </div>
                </div>
                <div class="hero-right">
                    <div class="hero-illustration-wrapper">
                        <picture>
                            <source srcset="/static/images/welcome_freelancer.webp" type="image/webp">
                            <img src="/static/images/welcome_freelancer.png" alt="Freelancer working happily on laptop" class="hero-illustration-img">
                        </picture>

                        <!-- Dotted curved arc with floating badges -->
                        <div class="welcome-floating-badge badge-top-left">
                            <span class="badge-icon">📅</span>
                            <span class="badge-text">Bookings</span>
                        </div>
                        <div class="welcome-floating-badge badge-top-right">
                            <span class="badge-icon">🤝</span>
                            <span class="badge-text">100% Escrow</span>
                        </div>
                        <div class="welcome-floating-badge badge-mid-left">
                            <span class="badge-icon">💬</span>
                            <span class="badge-text">Live Chat</span>
                        </div>
                        <div class="welcome-floating-badge badge-mid-right">
                            <span class="badge-icon">⏱️</span>
                            <span class="badge-text">24-48h Delivery</span>
                        </div>
                        <div class="welcome-floating-badge badge-bot-right">
                            <span class="badge-icon">💰</span>
                            <span class="badge-text">Direct Payouts</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Value Proposition Row -->
            <div class="hero-features-bar">
                <div class="hero-feature-card" onclick="goToVideoEditors()" style="cursor: pointer;"
                   onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='#5b34ea';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)';">
                    <div class="hero-feature-icon">🎬</div>
                    <h3 class="hero-feature-title">Vetted Video Editors</h3>
                    <p class="hero-feature-desc">Hire verified creators for YouTube, Reels, podcasts, and commercial color grading with interactive video showreels.</p>
                </div>
                <div class="hero-feature-card" onclick="goToTutors()" style="cursor: pointer;"
                   onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='#5b34ea';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)';">
                    <div class="hero-feature-icon">🗣️</div>
                    <h3 class="hero-feature-title">Spoken English Coaches</h3>
                    <p class="hero-feature-desc">Master fluency, accent neutralization, IELTS, and corporate presentation skills with 1-on-1 certified tutors.</p>
                </div>
                <div class="hero-feature-card">
                    <div class="hero-feature-icon">🔒</div>
                    <h3 class="hero-feature-title">100% Escrow Protection</h3>
                    <p class="hero-feature-desc">Your payment is locked safely in escrow and released to the creator only when you review and approve the final work.</p>
                </div>
                <div class="hero-feature-card">
                    <div class="hero-feature-icon">⚡</div>
                    <h3 class="hero-feature-title">Fast 24-48h Delivery</h3>
                    <p class="hero-feature-desc">Clear packages, guaranteed revision rounds, and real-time chat with file previews directly in your browser.</p>
                </div>
            </div>
        </div>
    </div>`;
}

// =============== DEADLINE & ESCROW UTILITIES ===============

function getBookingDeadlineInfo(booking) {
    if (!booking || !booking.created_at) {
        return { text: 'Turnaround: 48h', subtext: 'Standard delivery time', badgeClass: 'badge-info', statusLabel: 'Active', isPast: false };
    }
    const createdDate = new Date(booking.created_at);
    let turnaroundHours = 48; // default 48h
    const turnaroundStr = (booking.package_turnaround || booking.package?.turnaround || '').toLowerCase();
    if (turnaroundStr.includes('24') || turnaroundStr.includes('1 day')) turnaroundHours = 24;
    else if (turnaroundStr.includes('48') || turnaroundStr.includes('2 day')) turnaroundHours = 48;
    else if (turnaroundStr.includes('3 day')) turnaroundHours = 72;
    else if (turnaroundStr.includes('4 day')) turnaroundHours = 96;
    else if (turnaroundStr.includes('5 day')) turnaroundHours = 120;
    else if (turnaroundStr.includes('7 day') || turnaroundStr.includes('week')) turnaroundHours = 168;

    const deadlineDate = new Date(createdDate.getTime() + turnaroundHours * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
    const daysLeft = Math.ceil(hoursLeft / 24);
    const dateFormatted = deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const status = (booking.status || '').toLowerCase();
    if (status === 'completed' || status === 'approved') {
        return {
            text: `✅ Delivered & Approved on Time`,
            subtext: `Completed on ${dateFormatted}`,
            badgeClass: 'badge-success',
            statusLabel: 'Completed',
            isPast: false
        };
    }
    if (status === 'delivered' || status === 'pending_approval') {
        return {
            text: `📦 Work Delivered! Awaiting Your Review`,
            subtext: `Target Deadline was ${dateFormatted}`,
            badgeClass: 'badge-warning',
            statusLabel: 'Needs Review',
            isPast: false
        };
    }
    if (status === 'pending_payment' || status === 'pending') {
        return {
            text: `💳 Awaiting Escrow Payment`,
            subtext: `Est. Delivery: ${turnaroundHours}h after payment`,
            badgeClass: 'badge-muted',
            statusLabel: 'Unfunded',
            isPast: false
        };
    }

    // In Progress / Confirmed
    if (diffMs < 0) {
        return {
            text: `⚠️ Past Estimated Deadline`,
            subtext: `Was due ${dateFormatted} (~${Math.abs(daysLeft)}d ago)`,
            badgeClass: 'badge-danger',
            statusLabel: 'Overdue',
            isPast: true
        };
    } else if (hoursLeft <= 24) {
        return {
            text: `🔥 Due Today: ~${Math.max(1, hoursLeft)}h remaining`,
            subtext: `Target Delivery: ${dateFormatted}`,
            badgeClass: 'badge-warning',
            statusLabel: 'Due Soon',
            isPast: false
        };
    } else {
        return {
            text: `⏰ Due in ${daysLeft} days`,
            subtext: `Target Delivery: ${dateFormatted}`,
            badgeClass: 'badge-info',
            statusLabel: 'On Track',
            isPast: false
        };
    }
}
window.getBookingDeadlineInfo = getBookingDeadlineInfo;

// Global Provider / Package Selection for Booking Checkout
function selectProvider(providerId, packageId = null) {
    sessionStorage.setItem('selected_provider_id', providerId);
    if (packageId) {
        sessionStorage.setItem('selected_package_id', packageId);
    } else {
        sessionStorage.removeItem('selected_package_id');
    }
    router('/create-booking');
}
window.selectProvider = selectProvider;

// =============== DASHBOARD DISPATCHER ===============
function Dashboard() {
    if (currentUser?.user_type === 'ADMIN') {
        return AdminDashboard();
    }
    if (currentUser?.user_type === 'PROVIDER') {
        return ProviderDashboard();
    }
    return BuyerDashboard();
}

// =============== PROVIDER DASHBOARD (CREATOR STUDIO) ===============
function ProviderDashboard() {
    let profile = null;
    let recentPackages = [];
    let bookings = [];
    let loading = true;

    async function loadData() {
        showLoading();
        try {
            try { profile = await apiFetch('/profile'); } catch (_) { profile = {}; }
            try { recentPackages = await apiFetch('/packages'); } catch (_) { recentPackages = []; }
            try { bookings = await apiFetch('/bookings'); } catch (_) { bookings = []; }
        } catch (e) {
            showToast(e.message || 'Error loading studio', 'error');
        } finally {
            loading = false;
            mount(renderStudio());
        }
    }

    loadData();

    function renderStudio() {
        if (loading) {
            return el`<div>
                ${renderAppHeader('/')}
                <div class="main"><div class="loading"><div class="spinner"></div></div></div>
            </div>`;
        }

        const clientOrders = Array.isArray(bookings) ? bookings : [];
        const pendingOrders = clientOrders.filter(b => b.status === 'in_progress' || b.status === 'confirmed');
        const deliveredOrders = clientOrders.filter(b => b.status === 'delivered' || b.status === 'pending_approval');

        return el`<div>
            ${renderAppHeader('/')}
            
            <!-- Clarification & Mode Substrip -->
            <div class="mode-bar-substrip">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="mode-badge-pill mode-badge-provider">💼 Provider Studio</span>
                    <span>You are logged in as a <strong>Seller / Creator</strong>. Need to hire talent?</span>
                </div>
                <button type="button" class="btn-switch-mode" onclick="toggleUserMode()">
                    🛍️ Switch to Buyer Mode
                </button>
            </div>

            <div class="main">
                <!-- Creator Guidance Card -->
                <div class="clarification-guide-card">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                <span>🚀</span> Provider & Creator Studio Guide
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                                Fulfill client projects safely, get 5-star ratings, and receive direct 80% bank payouts.
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="router('/create-package')">+ New Package</button>
                    </div>

                    <div class="clarification-steps-grid">
                        <div class="clarification-step-item">
                            <span class="clarification-step-num">1</span>
                            <strong style="color: var(--text-primary); font-size: 0.9rem;">Set Up Packages</strong>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">List editing tiers or coaching sessions with clear turnaround and revisions.</span>
                        </div>
                        <div class="clarification-step-item">
                            <span class="clarification-step-num">2</span>
                            <strong style="color: var(--text-primary); font-size: 0.9rem;">Chat with Inquiring Clients</strong>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">Reply fast to incoming pre-booking chats. Keep chat on Grove Hub to maintain escrow protection.</span>
                        </div>
                        <div class="clarification-step-item">
                            <span class="clarification-step-num">3</span>
                            <strong style="color: var(--text-primary); font-size: 0.9rem;">Deliver & Get 80% Payout</strong>
                            <span style="font-size: 0.8rem; color: var(--text-secondary);">Submit final links/files on platform. Client approves, triggering guaranteed bank release.</span>
                        </div>
                    </div>
                </div>

                <!-- Provider Metrics Card -->
                ${providerWelcomeCard(profile)}

                <!-- Quick Business Actions -->
                ${providerSection(profile, recentPackages)}

                <!-- Client Work Queue -->
                <div class="section-title mt-4" style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center;">
                    <span>Active Client Orders (${pendingOrders.length + deliveredOrders.length})</span>
                    <button class="btn btn-secondary btn-sm" onclick="router('/bookings')">View All Orders</button>
                </div>

                ${(pendingOrders.length === 0 && deliveredOrders.length === 0) ? `
                    <div class="card" style="padding: 28px; text-align: center;">
                        <div style="font-size: 2.2rem; margin-bottom: 8px;">📬</div>
                        <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 6px;">No Active Client Orders Right Now</h4>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; max-width: 440px; margin: 0 auto 16px;">
                            Make sure your service packages are published and check incoming inquiries in your Messages inbox.
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-primary btn-sm" onclick="router('/create-package')">Create Package</button>
                            <button class="btn btn-secondary btn-sm" onclick="router('/messages')">💬 Open Messages</button>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-2">
                        ${[...pendingOrders, ...deliveredOrders].map(b => {
                            const deadline = getBookingDeadlineInfo(b);
                            return `
                            <div class="card" style="border-left: 4px solid var(--accent); padding: 18px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">Order #${b.id}: ${b.package_title || 'Custom Service'}</div>
                                        <div style="font-size: 0.8125rem; color: var(--text-secondary);">Client: <strong>${b.buyer_name || 'Client'}</strong></div>
                                    </div>
                                    <span class="badge ${b.status === 'delivered' ? 'badge-warning' : 'badge-primary'}">${b.status}</span>
                                </div>
                                <div style="margin: 10px 0; font-size: 0.8125rem; color: var(--text-secondary);">
                                    <div style="font-weight: 700; color: ${deadline.isPast ? 'var(--danger)' : 'var(--text-primary)'};">${deadline.text}</div>
                                    <div>${deadline.subtext}</div>
                                </div>
                                <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
                                    <button class="btn btn-secondary btn-sm" onclick="openPreBookingChat(${b.buyer_id}, '${(b.buyer_name || '').replace(/'/g, "\\'")}')" style="flex: 1;">💬 Chat</button>
                                    <button class="btn btn-primary btn-sm" onclick="router('/bookings')" style="flex: 1;">Submit Work</button>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>`;
    }

    return renderStudio();
}

// =============== BUYER DASHBOARD (FIVERR-STYLE TALENT MARKETPLACE) ===============
function BuyerDashboard() {
    let packages = [];
    let bookings = [];
    let providers = [];
    let loading = true;
    let activeFilter = 'all';
    let searchQuery = '';
    let searchDebounceTimer = null;

    async function loadData() {
        showLoading();
        try {
            const [pkgsRes, bksRes, edusRes] = await Promise.all([
                apiFetch('/packages?limit=50').catch(() => []),
                apiFetch('/bookings').catch(() => []),
                apiFetch('/educators/summary').catch(() => [])
            ]);
            bookings = Array.isArray(bksRes) ? bksRes : [];
            providers = Array.isArray(edusRes) ? edusRes : [];
            window.__cachedProviders = providers;
            let fetchedPackages = Array.isArray(pkgsRes) ? pkgsRes : [];
            if (fetchedPackages.length === 0 && providers.length > 0) {
                fetchedPackages = providers.flatMap(pr => (pr.packages || []).map(pkg => ({
                    ...pkg,
                    provider_id: pr.id,
                    provider_name: pr.name,
                    niche: pr.niche || pkg.niche
                })));
            }
            packages = fetchedPackages;
        } catch (e) {
            showToast(e.message || 'Error loading marketplace', 'error');
        } finally {
            loading = false;
            mount(renderMarketplace());
        }
    }

    loadData();

    function renderMarketplace() {
        if (loading) {
            return el`<div>
                ${renderAppHeader('/')}
                <div class="main"><div class="loading"><div class="spinner"></div></div></div>
            </div>`;
        }

        const approvedPackages = Array.isArray(packages) ? packages.filter(p => p.status === 'approved' || !p.status) : [];
        const clientPurchases = Array.isArray(bookings) ? bookings : [];
        const activePurchases = clientPurchases.filter(b => b.status === 'in_progress' || b.status === 'confirmed' || b.status === 'delivered');
        const allProviders = Array.isArray(providers) ? providers : [];

        const q = (searchQuery || '').trim().toLowerCase();

        // Filter packages based on activeFilter and searchQuery
        const filteredPackages = approvedPackages.filter(p => {
            const pkgTitle = (p.title || '').toLowerCase();
            const pkgDesc = (p.description || '').toLowerCase();
            const pkgProvider = (p.provider_name || '').toLowerCase();
            const pkgNiche = (p.niche || '').toLowerCase();
            const pkgTurnaround = (p.turnaround || '').toLowerCase();
            const fullPkgText = `${pkgTitle} ${pkgDesc} ${pkgProvider} ${pkgNiche} ${pkgTurnaround}`;

            const matchesQuery = !q || fullPkgText.includes(q);

            if (!matchesQuery) return false;
            if (activeFilter === 'editors') return (pkgNiche && (pkgNiche.includes('editor') || pkgNiche.includes('video'))) || pkgTitle.includes('video') || pkgTitle.includes('edit') || pkgTitle.includes('reel') || pkgTitle.includes('gaming') || pkgTitle.includes('animat');
            if (activeFilter === 'tutors') return (pkgNiche && pkgNiche.includes('tutor')) || pkgTitle.includes('english') || pkgTitle.includes('tutor') || pkgTitle.includes('ielts') || pkgTitle.includes('speaking') || pkgTitle.includes('accent') || pkgTitle.includes('interview');
            if (activeFilter === 'writers') return (pkgNiche && pkgNiche.includes('writer')) || pkgTitle.includes('writer') || pkgTitle.includes('copy') || pkgTitle.includes('script') || pkgTitle.includes('seo');
            if (activeFilter === 'express') return (pkgTurnaround && (pkgTurnaround.includes('24') || pkgTurnaround.includes('1 day') || pkgTurnaround.includes('immediate')));
            return true;
        });

        // Filter providers based on activeFilter and searchQuery
        const filteredProviders = allProviders.filter(pr => {
            const skillsStr = (pr.skills || []).join(' ').toLowerCase();
            const packagesStr = (pr.packages || []).map(p => `${p.title || ''} ${p.description || ''}`).join(' ').toLowerCase();
            const bioStr = (pr.bio || '').toLowerCase();
            const specStr = (pr.specialization || '').toLowerCase();
            const prName = (pr.name || '').toLowerCase();
            const prNiche = (pr.niche || '').toLowerCase();
            const fullText = `${prName} ${prNiche} ${skillsStr} ${packagesStr} ${bioStr} ${specStr}`;

            const matchesQuery = !q || fullText.includes(q);

            if (!matchesQuery) return false;
            if (activeFilter === 'editors') return prNiche === 'editors_animators' || skillsStr.includes('video') || skillsStr.includes('edit');
            if (activeFilter === 'tutors') return prNiche === 'tutors' || skillsStr.includes('english') || skillsStr.includes('tutor') || skillsStr.includes('ielts') || skillsStr.includes('accent');
            if (activeFilter === 'writers') return prNiche === 'writers' || skillsStr.includes('write') || skillsStr.includes('copy') || skillsStr.includes('script');
            if (activeFilter === 'express') return (pr.response_time && pr.response_time.includes('24')) || pr.availability === 'immediate';
            return true;
        });

        const totalItems = filteredPackages.length + filteredProviders.length;

        const placeholders = {
            all: 'Search video editors, IELTS coaches, YouTube, Premiere Pro...',
            editors: 'Search Video Ads, Reels & TikTok, YouTube, Gaming, After Effects...',
            tutors: 'Search IELTS speaking, accent reduction, fluency, business English...',
            writers: 'Search social captions, video scripts, ad copy, SEO blog posts...',
            express: 'Search 24-hour rush delivery packages and creators...'
        };
        const currentPlaceholder = placeholders[activeFilter] || placeholders.all;

        const categoryOptionsMap = {
            all: [
                { label: 'Video Ads', query: 'video ads', filter: 'editors', icon: '🎬' },
                { label: 'Reels & TikTok', query: 'reel', filter: 'editors', icon: '📱' },
                { label: 'English Fluency', query: 'speaking', filter: 'tutors', icon: '🗣️' },
                { label: 'YouTube Videos', query: 'youtube', filter: 'editors', icon: '🎥' },
                { label: 'Video Scripts', query: 'script', filter: 'writers', icon: '✍️' },
                { label: '24h Express', query: '24', filter: 'express', icon: '⚡' }
            ],
            editors: [
                { label: 'Video Ads', query: 'video ads', filter: 'editors', icon: '🎬' },
                { label: 'Reels & TikTok', query: 'reel', filter: 'editors', icon: '📱' },
                { label: 'YouTube Longform', query: 'youtube', filter: 'editors', icon: '🎥' },
                { label: 'Gaming Montages', query: 'gaming', filter: 'editors', icon: '🎮' },
                { label: 'Color Grading', query: 'color', filter: 'editors', icon: '🎨' },
                { label: '24h Rush Delivery', query: '24', filter: 'editors', icon: '⚡' }
            ],
            tutors: [
                { label: 'IELTS Speaking', query: 'ielts', filter: 'tutors', icon: '🗣️' },
                { label: 'Accent Reduction', query: 'accent', filter: 'tutors', icon: '🎯' },
                { label: 'Business English', query: 'business', filter: 'tutors', icon: '💼' },
                { label: 'Daily Fluency', query: 'speaking', filter: 'tutors', icon: '💬' },
                { label: 'Trial Session', query: 'trial', filter: 'tutors', icon: '⚡' }
            ],
            writers: [
                { label: 'Video Scripts', query: 'script', filter: 'writers', icon: '✍️' },
                { label: 'Ad Copywriting', query: 'copy', filter: 'writers', icon: '📈' },
                { label: 'SEO Blog Posts', query: 'seo', filter: 'writers', icon: '📝' },
                { label: 'Social Captions', query: 'caption', filter: 'writers', icon: '📱' }
            ],
            express: [
                { label: '24h Video Edit', query: 'video', filter: 'express', icon: '🎬' },
                { label: 'Instant English Lesson', query: 'english', filter: 'express', icon: '🗣️' },
                { label: 'Express Script', query: 'script', filter: 'express', icon: '✍️' }
            ]
        };

        const currentOptions = categoryOptionsMap[activeFilter] || categoryOptionsMap.all;
        window.__currentBuyerFilter = activeFilter;
        window.__buyerCategoryOptionsMap = categoryOptionsMap;

        const categorySlidersData = {
            editors: {
                badge: '🎬 Video Editing Specialties',
                items: [
                    { id: 'ads_social', label: 'Social Ads & Reels', sub: 'TikTok, Reels & UGC hooks', query: 'reel', icon: '📱' },
                    { id: 'gaming', label: 'Gaming Streams & Edits', sub: 'Twitch highlights & stream cuts', query: 'gaming', icon: '🎮' },
                    { id: 'youtube', label: 'YouTube Longform', sub: 'Retention edits & viral pacing', query: 'youtube', icon: '📺' },
                    { id: 'animations', label: '2D & 3D Animations', sub: 'Character animation & 3D models', query: 'animation', icon: '🎨' },
                    { id: 'motion_graphics', label: 'Motion Graphics & VFX', sub: 'After Effects lower thirds & titles', query: 'motion', icon: '✨' },
                    { id: 'music', label: 'Music & Cinematic', sub: 'Beat-sync VFX & color grading', query: 'music', icon: '🎬' },
                    { id: 'express', label: '24h Rush Delivery', sub: 'Same-day express turnaround', query: '24', icon: '⚡' }
                ]
            },
            tutors: {
                badge: '🗣️ English Tutoring Specialties',
                items: [
                    { id: 'ielts', label: 'IELTS & TOEFL Prep', sub: 'Band 7.5+ speaking & mock tests', query: 'ielts', icon: '🎯' },
                    { id: 'accent', label: 'Accent Reduction', sub: 'Neutral pronunciation & clarity', query: 'accent', icon: '🗣️' },
                    { id: 'business', label: 'Business English', sub: 'Corporate emails, pitches & interviews', query: 'business', icon: '💼' },
                    { id: 'speaking', label: 'Daily Fluency', sub: 'Casual conversation & speaking confidence', query: 'speaking', icon: '💬' },
                    { id: 'interview', label: 'Interview Coaching', sub: 'Job & visa mock interviews', query: 'interview', icon: '🎯' },
                    { id: 'english', label: 'Cambridge Certified', sub: 'Structured grammar & spoken practice', query: 'english', icon: '⚡' }
                ]
            },
            writers: {
                badge: '✍️ Scriptwriter & Copy Specialties',
                items: [
                    { id: 'script', label: 'YouTube Video Scripts', sub: 'Retention storytelling, hooks & outlines', query: 'script', icon: '📺' },
                    { id: 'copy', label: 'Social Ad Copy & UGC', sub: 'Converting hooks for TikTok & Meta ads', query: 'copy', icon: '📱' },
                    { id: 'seo', label: 'SEO Blog Posts & Guides', sub: 'Keyword-ranked articles & pillar posts', query: 'seo', icon: '📰' },
                    { id: 'social', label: 'Social Media Captions', sub: 'Carousel slides, X threads & posts', query: 'social', icon: '💬' },
                    { id: 'email', label: 'Email Newsletters', sub: 'High open-rate subject lines & sequences', query: 'email', icon: '📧' },
                    { id: 'express', label: '24h Rush Scripts', sub: 'Urgent same-day turnaround copy', query: '24', icon: '⚡' }
                ]
            }
        };

        const activeSliderConfig = categorySlidersData[activeFilter] || null;

        if (!window.__placeholderBlinkLoopStarted) {
            window.__placeholderBlinkLoopStarted = true;
            let optIdx = 0;
            setInterval(() => {
                const input = document.getElementById('buyer-search-input');
                const textEl = document.getElementById('placeholder-dynamic-text');
                const holder = document.getElementById('search-animated-placeholder');

                if (input && (input.value.trim().length > 0 || document.activeElement === input)) {
                    if (holder && !holder.classList.contains('hidden')) {
                        holder.classList.add('hidden');
                    }
                    return;
                }

                if (holder && holder.classList.contains('hidden')) {
                    holder.classList.remove('hidden');
                }

                if (!textEl) return;

                const map = window.__buyerCategoryOptionsMap || {};
                const opts = map[window.__currentBuyerFilter || 'all'] || map.all || [];
                if (!opts.length) return;

                optIdx = (optIdx + 1) % opts.length;
                const nextOpt = opts[optIdx];

                // 1. Blink out smoothly
                textEl.classList.add('blink-out');
                textEl.classList.remove('blink-in');

                setTimeout(() => {
                    // 2. Change text while faded
                    textEl.textContent = `"${nextOpt.label}"`;
                    textEl.classList.remove('blink-out');
                    textEl.classList.add('blink-in');

                    setTimeout(() => {
                        textEl.classList.remove('blink-in');
                    }, 400);
                }, 280);
            }, 2600);
        }

        return el`<div>
            ${renderAppHeader('/')}

            <!-- Clarification & Mode Substrip -->
            <div class="mode-bar-substrip">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="mode-badge-pill mode-badge-buyer">🛍️ Buyer Mode</span>
                    <span style="font-size: 0.84rem; color: var(--text-secondary);">
                        Browse verified creators, chat before booking, and hire with 100% Escrow Protection.
                    </span>
                </div>
                <button type="button" class="btn-switch-mode" onclick="toggleUserMode()">
                    💼 Switch to Provider Mode
                </button>
            </div>

            <div class="main">

                <!-- Active Purchases Bar (if buyer has orders) -->
                ${activePurchases.length > 0 ? `
                    <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--accent); padding: 18px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                            <div>
                                <strong style="font-size: 1rem; color: var(--text-primary);">⚡ You have ${activePurchases.length} active order${activePurchases.length > 1 ? 's' : ''} in progress</strong>
                                <div style="font-size: 0.8125rem; color: var(--text-secondary);">Creators are currently preparing your deliverables.</div>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="router('/bookings')">View All Orders</button>
                        </div>
                        <div class="grid grid-2">
                            ${activePurchases.slice(0, 2).map(b => {
                                const dl = getBookingDeadlineInfo(b);
                                return `
                                <div style="background: var(--bg-hover); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                                    <div>
                                        <div style="font-weight: 700; font-size: 0.9rem;">Order #${b.id} • ${escapeHTML(b.provider_name || 'Creator')}</div>
                                        <div style="font-size: 0.78rem; color: var(--text-secondary);">${dl.text}</div>
                                    </div>
                                    <div style="display: flex; gap: 6px;">
                                        <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openPreBookingChat(${b.provider_id}, '${escapeJs(b.provider_name || '')}')">💬 Chat</button>
                                        <button class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 0.75rem;" onclick="router('/bookings')">Details</button>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Search & Category Filters -->
                <div style="margin-bottom: 24px;">
                    <div class="buyer-search-bar-row">
                        <form onsubmit="event.preventDefault(); window.__handleBuyerSearchSubmit(document.getElementById('buyer-search-input').value)" class="buyer-search-form">
                            <div class="buyer-search-input-wrap">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="buyer-search-icon">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <div class="search-animated-placeholder ${searchQuery ? 'hidden' : ''}" id="search-animated-placeholder" onclick="const i=document.getElementById('buyer-search-input'); if(i){ i.focus(); }">
                                    <span class="placeholder-prefix">Search</span>
                                    <span class="placeholder-dynamic-text" id="placeholder-dynamic-text">"${currentOptions[0]?.label || 'Video Ads'}"</span>
                                    <span class="placeholder-cursor">|</span>
                                </div>
                                <input 
                                    type="text" 
                                    id="buyer-search-input" 
                                    class="form-input buyer-search-input" 
                                    value="${escapeHTML(searchQuery)}" 
                                    oninput="window.__handleBuyerSearchInput(this.value); window.__updatePlaceholderVisibility();"
                                    onfocus="window.__updatePlaceholderVisibility(true);"
                                    onblur="window.__updatePlaceholderVisibility();"
                                    autocomplete="off"
                                />
                                ${searchQuery ? `
                                    <button type="button" class="buyer-search-clear-btn" onclick="window.__clearBuyerSearch()" title="Clear search">✕</button>
                                ` : ''}
                            </div>
                            <button type="submit" class="btn btn-primary buyer-search-btn buyer-search-btn-blinking" title="Click to search or explore options">
                                <span class="search-btn-beacon"></span>
                                <span class="search-btn-icon-sparkle">✨</span>
                                <span>Search</span>
                            </button>
                        </form>
                    </div>

                    <!-- Category Boxes with Animated Icons (Box Shape) -->
                    <div class="category-boxes-grid">
                        <button type="button" class="category-box-btn ${activeFilter === 'all' && !searchQuery ? 'active' : ''}" onclick="window.__setBuyerFilter('all')">
                            <span class="chip-icon-box">${getCategoryPeekIconSvg('all', 32)}</span>
                            <span class="category-box-label">All Services</span>
                        </button>
                        <button type="button" class="category-box-btn ${activeFilter === 'editors' ? 'active' : ''}" onclick="window.__setBuyerFilter('editors')">
                            <span class="chip-icon-box">${getCategoryPeekIconSvg('editors_animators', 32)}</span>
                            <span class="category-box-label">Video Editors</span>
                        </button>
                        <button type="button" class="category-box-btn ${activeFilter === 'tutors' ? 'active' : ''}" onclick="window.__setBuyerFilter('tutors')">
                            <span class="chip-icon-box">${getCategoryPeekIconSvg('tutors', 32)}</span>
                            <span class="category-box-label">English Tutors</span>
                        </button>
                        <button type="button" class="category-box-btn ${activeFilter === 'writers' ? 'active' : ''}" onclick="window.__setBuyerFilter('writers')">
                            <span class="chip-icon-box">${getCategoryPeekIconSvg('writers', 32)}</span>
                            <span class="category-box-label">Writers &amp; Copy</span>
                        </button>
                        <button type="button" class="category-box-btn ${activeFilter === 'express' ? 'active' : ''}" onclick="window.__setBuyerFilter('express')">
                            <span class="chip-icon-box">${getCategoryPeekIconSvg('express', 32)}</span>
                            <span class="category-box-label">24h Express</span>
                        </button>
                    </div>

                    <!-- Popular Options Slider (Down of Icons & Shown for Editors, Tutors, and Writers) -->
                    ${activeSliderConfig ? `
                    <div class="editor-slider-container">
                        <div class="editor-slider-header">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="editor-slider-badge">${activeSliderConfig.badge}</span>
                                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">🖱️ Scroll with mouse wheel or drag to slide</span>
                            </div>
                            <div class="editor-slider-arrows">
                                <button type="button" class="slider-arrow-btn" onclick="const el=document.getElementById('category-popular-slider'); if(el) el.scrollBy({ left: -220, behavior: 'smooth' });" title="Slide Left">‹</button>
                                <button type="button" class="slider-arrow-btn" onclick="const el=document.getElementById('category-popular-slider'); if(el) el.scrollBy({ left: 220, behavior: 'smooth' });" title="Slide Right">›</button>
                            </div>
                        </div>

                        <div 
                            class="editor-popular-slider-track" 
                            id="category-popular-slider"
                            onwheel="if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { this.scrollLeft += event.deltaY; event.preventDefault(); }"
                            onmouseenter="window.__initSliderMouseDrag(this)"
                        >
                            ${activeSliderConfig.items.map((opt, idx) => {
                                const isSelected = searchQuery.toLowerCase() === opt.query.toLowerCase();
                                return `
                                <div 
                                    class="editor-slide-card ${isSelected ? 'active' : ''}" 
                                    onclick="${isSelected ? `window.__clearBuyerSearch()` : `window.__applyPopularTag('${escapeJs(opt.query)}', '${escapeJs(activeFilter)}')`}"
                                    style="animation-delay: ${(idx * 0.04).toFixed(2)}s;"
                                    title="Filter by ${opt.label}"
                                >
                                    <div class="slide-card-top">
                                        <span class="slide-card-icon">${getTypeIconSvg(opt.id, opt.icon, 28)}</span>
                                        <span class="slide-card-arrow">→</span>
                                    </div>
                                    <div class="slide-card-title">${opt.label}</div>
                                    <div class="slide-card-sub">${opt.sub}</div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Talent Showcase Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
                    <div class="section-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                        <span>✨</span> Available Talent &amp; Services (${totalItems})
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 0.8125rem; color: var(--text-muted); font-weight: 600;">🛡️ 100% Escrow Protected</span>
                        <button class="btn btn-secondary btn-sm" onclick="router('/')" style="padding: 5px 12px; font-size: 0.78rem;">
                            Browse Full Directory →
                        </button>
                    </div>
                </div>

                <!-- Talent Showcase Grid or Empty State -->
                ${totalItems === 0 ? `
                    <div class="card" style="padding: 40px 24px; text-align: center; border: 1.5px dashed var(--border); border-radius: var(--radius);">
                        <div style="font-size: 2.8rem; margin-bottom: 12px;">🔍</div>
                        <h4 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px; color: var(--text-primary);">No services matching your search</h4>
                        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 20px; max-width: 440px; margin-left: auto; margin-right: auto;">
                            We couldn't find any creators matching "${escapeHTML(searchQuery)}". Try clearing your keywords or exploring our full talent directory.
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-secondary btn-sm" onclick="window.__setBuyerFilter('all'); window.__clearBuyerSearch();">Reset Filters</button>
                            <button class="btn btn-primary btn-sm" onclick="router('/')">Open Full Talent Directory</button>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-3" style="gap: 20px;">
                        <!-- 1. Render Specific Service Packages (if any) -->
                        ${filteredPackages.map(pkg => {
                            const isTutor = (pkg.niche && pkg.niche.includes('tutor')) || (pkg.title && pkg.title.toLowerCase().includes('english'));
                            const nicheBadge = isTutor ? '🗣️ English Tutor' : '🎬 Video Editing';
                            const providerName = pkg.provider_name || 'Verified Creator';
                            const initial = providerName.charAt(0).toUpperCase();

                            return `
                            <div class="card fiverr-gig-card" style="display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); transition: all 0.25s ease;">
                                <div style="padding: 16px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;">
                                                ${initial}
                                            </div>
                                            <div>
                                                <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary);">${escapeHTML(providerName)}</div>
                                                <div style="font-size: 0.72rem; color: var(--success); font-weight: 600;">🟢 Online now</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-info" style="font-size: 0.7rem; padding: 4px 8px;">${nicheBadge}</span>
                                    </div>

                                    <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); line-height: 1.4;">${escapeHTML(pkg.title)}</h4>
                                    <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 14px; min-height: 40px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                        ${escapeHTML(pkg.description || 'Custom tailored high quality service with 100% escrow protection and guaranteed turnaround.')}
                                    </p>

                                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px;">
                                        <span>⏱️ ${escapeHTML(pkg.turnaround || '24 hours')}</span>
                                        <span>🔄 ${pkg.revision_limit || 2} revisions</span>
                                    </div>
                                </div>

                                <div class="card-footer" style="background: var(--bg-hover); padding: 12px 16px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                                    <div>
                                        <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Price</div>
                                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent);">₹${(pkg.price || 0).toLocaleString()}</div>
                                    </div>
                                    <div style="display: flex; gap: 6px;">
                                        <button class="btn btn-secondary btn-sm" onclick="openPreBookingChat(${pkg.provider_id}, '${escapeJs(providerName)}')" title="Message creator before ordering" style="padding: 6px 12px; font-weight: 700;">
                                            💬 Chat
                                        </button>
                                        <button class="btn btn-primary btn-sm" onclick="selectProvider(${pkg.provider_id}, ${pkg.id})" style="padding: 6px 14px; font-weight: 700;">
                                            Order Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}

                        <!-- 2. Render Verified Creators Showcase -->
                        ${filteredProviders.map(pr => {
                            const isTutor = pr.niche === 'tutors';
                            const isWriter = pr.niche === 'writers';
                            const nicheBadge = isTutor ? '🗣️ English Tutor' : (isWriter ? '✍️ Copywriter' : '🎬 Video Editing');
                            const initial = (pr.name || 'C').charAt(0).toUpperCase();
                            const startPrice = pr.starting_price || (isTutor ? 799 : (isWriter ? 1199 : 1499));
                            const turnaround = pr.response_time || '24 hours';
                            const headline = pr.specialization || (isTutor ? 'Conversational English & Fluency Coaching' : (isWriter ? 'High-Converting Copy & Content' : 'Professional Video Editing & Motion Graphics'));

                            return `
                            <div class="card fiverr-gig-card" style="display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-card); transition: all 0.25s ease;">
                                <div style="padding: 16px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;">
                                                ${initial}
                                            </div>
                                            <div>
                                                <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px;">
                                                    ${escapeHTML(pr.name)}
                                                    <span title="Verified Talent" style="color: var(--accent); font-size: 0.8rem;">✓</span>
                                                </div>
                                                <div style="font-size: 0.72rem; color: var(--success); font-weight: 600;">🟢 Online now</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-info" style="font-size: 0.7rem; padding: 4px 8px;">${nicheBadge}</span>
                                    </div>

                                    <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); line-height: 1.4;">${escapeHTML(headline)}</h4>
                                    <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 14px; min-height: 40px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                        100% Escrow Protected. Chat directly with ${escapeHTML(pr.name)} to discuss your requirements, custom footage, or turnaround.
                                    </p>

                                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px;">
                                        <span>⚡ ${escapeHTML(turnaround)} turnaround</span>
                                        <span style="color: var(--warning); font-weight: 700;">★ 5.0 (Verified)</span>
                                    </div>
                                </div>

                                <div class="card-footer" style="background: var(--bg-hover); padding: 12px 16px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                                    <div>
                                        <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Starting at</div>
                                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--accent);">₹${startPrice.toLocaleString()}</div>
                                    </div>
                                    <div style="display: flex; gap: 6px;">
                                        <button class="btn btn-secondary btn-sm" onclick="openPreBookingChat(${pr.id}, '${escapeJs(pr.name)}')" title="Message creator before ordering" style="padding: 6px 12px; font-weight: 700;">
                                            💬 Chat
                                        </button>
                                        <button class="btn btn-primary btn-sm" onclick="selectProvider(${pr.id})" style="padding: 6px 14px; font-weight: 700;">
                                            Hire Talent
                                        </button>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        </div>`;
    }

    // Attach search and filter handlers to window
    window.__updatePlaceholderVisibility = (forceHide = false) => {
        const input = document.getElementById('buyer-search-input');
        const holder = document.getElementById('search-animated-placeholder');
        if (!holder) return;
        if (forceHide || (input && (input.value.trim().length > 0 || document.activeElement === input))) {
            holder.classList.add('hidden');
        } else {
            holder.classList.remove('hidden');
        }
    };

    window.__handleBuyerSearchSubmit = (val) => {
        if (!val || !val.trim()) {
            const input = document.getElementById('buyer-search-input');
            const bar = document.querySelector('.search-options-animated-bar');
            if (bar) {
                bar.classList.add('highlight-pulse');
                setTimeout(() => bar.classList.remove('highlight-pulse'), 800);
            }
            if (input) {
                input.focus();
            }
            return;
        }
        window.__handleBuyerSearch(val.trim());
    };

    window.__handleBuyerSearch = (val) => {
        searchQuery = val || '';
        mount(renderMarketplace());
        const input = document.getElementById('buyer-search-input');
        if (input) {
            input.focus();
            try {
                input.setSelectionRange(searchQuery.length, searchQuery.length);
            } catch (_) {}
        }
        window.__updatePlaceholderVisibility();
    };

    window.__handleBuyerSearchInput = (val) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            window.__handleBuyerSearch(val);
        }, 250);
    };

    window.__clearBuyerSearch = () => {
        window.__handleBuyerSearch('');
        setTimeout(() => window.__updatePlaceholderVisibility(), 30);
    };

    window.__setBuyerFilter = (filter) => {
        activeFilter = filter;
        mount(renderMarketplace());
        setTimeout(() => window.__updatePlaceholderVisibility(), 30);
    };

    window.__applyPopularTag = (keyword, filter = null) => {
        searchQuery = keyword || '';
        if (filter) {
            activeFilter = filter;
        }
        mount(renderMarketplace());
        const input = document.getElementById('buyer-search-input');
        if (input) {
            input.value = searchQuery;
            input.focus();
        }
        window.__updatePlaceholderVisibility(true);
    };

    return renderMarketplace();
}


function providerWelcomeCard(profile) {
    return el`<div class="card" style="box-shadow: 0 10px 30px rgba(0,0,0,0.12); margin-bottom: 24px;">
        <div class="card-header">
            <div>
                <div class="card-title" style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span>Welcome back, ${currentUser?.name || 'Creator'}</span>
                    <span style="font-size: 0.8125rem; font-weight: 700; color: var(--accent); background: rgba(99, 102, 241, 0.14); padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(99, 102, 241, 0.3);">
                        @${currentUser?.username || 'creator'}
                    </span>
                </div>
                <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 3px;">
                    Creator &amp; Provider Command Center • 100% Escrow Protected • groovehub.com/@${currentUser?.username || 'creator'}
                </div>
            </div>
            <span class="badge badge-success" style="font-weight: 700; padding: 6px 12px; font-size: 0.8rem;">PROVIDER</span>
        </div>
        <div class="grid grid-2" style="margin-top: 16px; gap: 14px;">
            <div style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">Total Bookings</div>
                <div style="font-size: 1.85rem; font-weight: 800; color: var(--text-primary); line-height: 1;">${profile?.total_bookings || 0}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Orders completed</div>
            </div>
            <div style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 6px;">Earnings (This Month)</div>
                <div style="font-size: 1.85rem; font-weight: 800; color: var(--success); line-height: 1;">₹${(profile?.monthly_earnings || 0).toLocaleString()}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Net provider payout</div>
            </div>
            <div style="grid-column: span 2; background: var(--bg-hover); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px;">Rating &amp; Reputation</div>
                    <div style="font-size: 1.4rem; font-weight: 800; color: var(--warning); display: flex; align-items: center; gap: 6px;">
                        <span>⭐</span>
                        <span>${profile?.rating ? Number(profile.rating).toFixed(1) : '5.0'}</span>
                        <span style="font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); margin-left: 4px;">(${profile?.total_bookings || 0} reviews)</span>
                    </div>
                </div>
                <div style="font-size: 0.8125rem; color: var(--text-secondary); text-align: right;">
                    Guaranteed 80% Payout • Direct Bank Transfer
                </div>
            </div>
        </div>
        <div class="card-footer" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px;">
            <button class="btn btn-primary" onclick="setSettingsTab('portfolio'); router('/settings');" style="flex: 1; min-width: 150px;">📁 Upload Portfolios</button>
            <button class="btn btn-secondary" onclick="router('/packages')" style="flex: 1; min-width: 140px;">Manage Packages</button>
            <button class="btn btn-secondary" onclick="router('/payments')" style="flex: 1; min-width: 140px;">💳 Earnings &amp; Payouts</button>
            <button class="btn btn-secondary" onclick="router('/profile')" style="flex: 1; min-width: 120px;">Edit Profile</button>
        </div>
    </div>`;
}

function buyerWelcomeCard(recentBookings = []) {
    const list = Array.isArray(recentBookings) ? recentBookings : [];
    const activeCount = list.filter(b => b.status === 'in_progress' || b.status === 'confirmed').length;
    const deliveredCount = list.filter(b => b.status === 'delivered' || b.status === 'pending_approval').length;
    const completedCount = list.filter(b => b.status === 'completed' || b.status === 'approved').length;
    const escrowFunds = list.filter(b => b.status === 'in_progress' || b.status === 'confirmed' || b.status === 'delivered' || b.status === 'pending_approval').reduce((s, b) => s + (b.total_amount || 0), 0);

    return el`<div>
        <!-- Escrow Protection & Safe Communication Notice -->
        <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 14px; padding: 18px 22px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 14px; max-width: 720px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #6366f1; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">🛡️</div>
                <div>
                    <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 3px;">
                        100% Escrow Protection & Direct In-App Chat Active
                    </div>
                    <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.45;">
                        You never send money directly to creators. Your payment is safely locked in Groove Hub escrow and released <strong>only after you inspect and approve</strong> the delivered files. Use our built-in chat for all messages, revisions, and files.
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="router('/')">+ Hire Video Editor / Coach</button>
                <button class="btn btn-secondary" onclick="router('/payments')">💳 Escrow Vault</button>
            </div>
        </div>

        <!-- 4-Metric Command Center Bar -->
        <div class="grid grid-4" style="margin-bottom: 24px;">
            <div class="card" style="padding: 18px; border-left: 4px solid var(--accent);">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">📦 Total Bookings</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${list.length}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Projects ordered</div>
            </div>

            <div class="card" style="padding: 18px; border-left: 4px solid #3b82f6;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">⚡ In Progress</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: #3b82f6; margin-top: 4px;">${activeCount}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Creators editing now</div>
            </div>

            <div class="card" style="padding: 18px; border-left: 4px solid #f59e0b;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">⏳ Needs Approval</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">${deliveredCount}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Ready for your review</div>
            </div>

            <div class="card" style="padding: 18px; border-left: 4px solid #10b981;">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">🛡️ Held in Escrow</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: #10b981; margin-top: 4px;">₹${escrowFunds.toLocaleString()}</div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Protected money-back</div>
            </div>
        </div>
    </div>`;
}



function providerSection(profile, recentPackages) {
    return el`<div class="section">
        <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20" style="color: var(--accent);">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
            </svg>
            Quick Actions
        </div>
        <div class="grid grid-2">
            <button type="button" class="card" onclick="router('/create-package')" style="cursor: pointer; border-color: rgba(99, 102, 241, 0.4); text-align: left; background: var(--bg-card); transition: all 0.25s ease;">
                <div class="card-header" style="margin-bottom: 6px;">
                    <div class="card-title" style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700;">Create Package</div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20" style="color: var(--accent);">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </div>
                <div class="card-body" style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5;">Create a new service package for buyers</div>
            </button>
            <button type="button" class="card" onclick="router('/profile')" style="cursor: pointer; text-align: left; background: var(--bg-card); transition: all 0.25s ease;">
                <div class="card-header" style="margin-bottom: 6px;">
                    <div class="card-title" style="color: var(--text-primary); font-size: 1.05rem; font-weight: 700;">Edit Profile</div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20" style="color: var(--text-secondary);">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </div>
                <div class="card-body" style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5;">Update your profile and availability</div>
            </button>
        </div>
        ${recentPackages && recentPackages.length > 0 ? `
        <div class="section-title mt-4" style="margin-top: 24px;">Your Recent Packages</div>
        <div class="grid grid-2">
            ${recentPackages.slice(0, 4).map(pkg => `
                <div class="card">
                    <div class="card-header" style="margin-bottom: 8px;">
                        <div class="card-title" style="color: var(--text-primary); font-weight: 700; font-size: 1.05rem;">${pkg.title}</div>
                        <span class="badge ${pkg.status === 'approved' ? 'badge-success' : 'badge-warning'}">${pkg.status}</span>
                    </div>
                    <div class="card-body">
                        <div class="price" style="color: var(--accent); font-weight: 800; font-size: 1.45rem; margin-bottom: 4px;">₹${pkg.price.toLocaleString()}</div>
                        <div class="price-range" style="color: var(--text-secondary); font-size: 0.8125rem;">${pkg.turnaround || '24 hours'} • ${pkg.revision_limit || 1} revision${(pkg.revision_limit || 1) > 1 ? 's' : ''}</div>
                    </div>
                    <div class="card-footer" style="margin-top: 14px; padding-top: 12px;">
                        <button class="btn btn-secondary btn-sm" onclick="router('/packages')" style="width: 100%;">View All</button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>`;
}

function buyerSection(recentBookings) {
    const list = Array.isArray(recentBookings) ? recentBookings : [];

    return el`<div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div class="section-title" style="margin: 0;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                Your Project Bookings & Deadlines
            </div>
            ${list.length > 0 ? `<button class="btn btn-secondary btn-sm" onclick="router('/bookings')">View All (${list.length}) --></button>` : ''}
        </div>

        ${list.length > 0 ? `
            <div class="grid grid-2">
                ${list.slice(0, 4).map(booking => {
        const deadline = getBookingDeadlineInfo(booking);
        const providerName = booking.provider_name || 'Assigned Talent';
        const pkgTitle = booking.package_title || booking.package?.title || 'Custom Video/Tutoring Service';

        return `
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border);">
                        <div class="card-body" style="padding: 18px;">
                            <!-- Header with ID & Status Badge -->
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div>
                                    <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                        <span>Booking #${booking.id}</span>
                                        <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">• ${new Date(booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div style="font-size: 0.8125rem; color: var(--accent); font-weight: 600; margin-top: 3px;">
                                        👤 ${providerName}
                                    </div>
                                </div>
                                <span class="badge ${getBookingBadge(booking.status)}">${booking.status.replace('_', ' ')}</span>
                            </div>

                            <!-- Package Title -->
                            <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary); margin-bottom: 8px;">
                                📦 ${pkgTitle}
                            </div>

                            <!-- PROMINENT DEADLINE COUNTDOWN -->
                            <div style="background: var(--bg-hover); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; margin: 12px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <strong style="font-size: 0.85rem; color: var(--text-primary);">
                                        ${deadline.text}
                                    </strong>
                                    <span class="badge ${deadline.badgeClass}" style="font-size: 0.72rem;">
                                        ${deadline.statusLabel}
                                    </span>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                                    ${deadline.subtext}
                                </div>
                            </div>

                            <!-- Escrow & Price info -->
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; margin-bottom: 14px;">
                                <span style="font-size: 0.78rem; color: var(--text-secondary); display: flex; align-items: center; gap: 5px;">
                                    <span>🔒</span> 100% In Escrow
                                </span>
                                <span style="font-weight: 800; font-size: 1rem; color: #10b981;">₹${booking.total_amount.toLocaleString()}</span>
                            </div>

                            ${booking.delivery_file_link ? `
                                <div style="padding: 10px 12px; background: rgba(99, 102, 241, 0.08); border: 1px solid var(--accent); border-radius: 8px; margin-bottom: 12px;">
                                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent); margin-bottom: 4px;">📂 Delivered Files:</div>
                                    <a href="${booking.delivery_file_link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-size: 0.8125rem; font-weight: 600; text-decoration: underline; word-break: break-all;">
                                        ${booking.delivery_file_link}
                                    </a>
                                </div>
                            ` : ''}

                            <!-- Action Buttons -->
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <button class="btn btn-secondary btn-sm" onclick="openBookingChat(${booking.id}, '${providerName}')" style="font-weight: 600;">
                                    💬 Chat with ${providerName}
                                </button>

                                ${(booking.status === 'delivered' || booking.status === 'pending_approval') ? `
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn btn-success btn-sm" style="flex: 1; font-weight: 700;" onclick="approveBooking(${booking.id})">
                                            ✅ Approve & Release
                                        </button>
                                        <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="disputeBooking(${booking.id})">
                                            ⚠️ Revision / Dispute
                                        </button>
                                    </div>
                                ` : ''}

                                ${(booking.status === 'pending_payment' || booking.status === 'pending') ? `
                                    <button class="btn btn-primary btn-sm" onclick="PaymentsPortal.payPendingOrder(${booking.id}, ${booking.total_amount})">
                                        💳 Secure Payment in Escrow
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>`;
    }).join('')}
            </div>
        ` : `
            <div class="card">
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <h3>No active bookings yet</h3>
                    <p>Browse top-rated video editors and English coaches, and hire with 100% escrow protection.</p>
                    <button class="btn btn-primary" onclick="router('/')">Browse Talent Now</button>
                </div>
            </div>
        `}
    </div>`;
}

function getBookingBadge(status) {
    const s = (status || '').toLowerCase().replace(' ', '_');
    if (s === 'confirmed' || s === 'in_progress') return 'badge-info';
    if (s === 'delivered' || s === 'pending_approval') return 'badge-warning';
    if (s === 'approved' || s === 'completed') return 'badge-success';
    if (s === 'disputed' || s === 'refunded') return 'badge-danger';
    return 'badge-muted';
}

function adminSection() {
    return el`<div class="section">
        <div class="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
            Admin Controls
        </div>
        <div class="grid grid-2">
            <button class="card" onclick="router('/admin')" style="cursor: pointer; border-color: var(--accent);">
                <div class="card-header">
                    <div class="card-title">Admin Dashboard</div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="color: var(--accent);">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                </div>
                <div class="card-body">Manage providers, bookings, and platform settings</div>
            </button>
            <button class="card" onclick="router('/admin/niches')" style="cursor: pointer;">
                <div class="card-header">
                    <div class="card-title">Manage Niches</div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                        <polyline points="2 17 12 22 22 17"/>
                        <polyline points="12 22 12 12"/>
                    </svg>
                </div>
                <div class="card-body">Add or manage service categories</div>
            </button>
        </div>
    </div>`;
}

function NotFound() {
    return el`<div class="main">
        <div class="empty-state">
            <h3>Page not found</h3>
            <p>The page you're looking for doesn't exist.</p>
            <button class="btn btn-primary" onclick="router('/')">Go Home</button>
        </div>
    </div>`;
}

// =============== SETTINGS & PROFILE ===============

let activeSettingsTab = 'account';

function Settings() {
    let profile = {};
    let portfolioItems = [];
    let error = '';
    let success = '';
    let loading = true;
    let platformSettings = null;
    if (window.location.pathname === '/profile') {
        activeSettingsTab = currentUser?.user_type === 'PROVIDER' ? 'profile' : 'account';
    }

    async function loadData() {
        showLoading();
        try {
            currentUser = await apiFetch('/auth/me');
            if (currentUser.user_type === 'PROVIDER') {
                try {
                    profile = await apiFetch('/profile');
                } catch (_) {
                    profile = {};
                }
                try {
                    portfolioItems = await apiFetch(`/profile/${currentUser.id}/portfolio`);
                } catch (_) {
                    portfolioItems = [];
                }
            } else if (currentUser.user_type === 'ADMIN') {
                try {
                    platformSettings = await apiFetch('/admin/platform-settings');
                } catch (_) {
                    platformSettings = null;
                }
            }
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
            mount(renderSettingsView());
        }
    }

    window.setSettingsTab = (tab) => {
        activeSettingsTab = tab;
        error = '';
        success = '';
        mount(renderSettingsView());
    };

    window.handleAccountSave = async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const usernameInput = document.getElementById('setting-username');
            const data = {
                name: document.getElementById('setting-name').value.trim(),
                email: document.getElementById('setting-email').value.trim(),
                phone: document.getElementById('setting-phone').value.trim()
            };
            if (usernameInput) {
                data.username = usernameInput.value.trim().replace(/^@/, '');
            }
            currentUser = await apiFetch('/auth/me', {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            showToast('Account details & handle updated', 'success');
        } catch (e) {
            showToast(e.message || 'Update failed', 'error');
        } finally {
            hideLoading();
            mount(renderSettingsView());
        }
    };

    window.handleAddPortfolioItem = async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const title = document.getElementById('port-title').value.trim();
            const media_url = document.getElementById('port-media-url').value.trim();
            const media_type = document.getElementById('port-media-type').value;
            const thumbnail_url = document.getElementById('port-thumb-url').value.trim() || (media_type === 'image' ? media_url : '');
            const description = document.getElementById('port-desc').value.trim();

            if (!title || !media_url) {
                showToast('Please provide a title and media URL', 'error');
                return;
            }

            const item = await apiFetch('/profile/portfolio', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    media_url,
                    media_type,
                    thumbnail_url,
                    description
                })
            });
            showToast('Work sample added to your portfolio showcase!', 'success');
            portfolioItems.unshift(item);
            document.getElementById('port-title').value = '';
            document.getElementById('port-media-url').value = '';
            document.getElementById('port-thumb-url').value = '';
            document.getElementById('port-desc').value = '';
        } catch (err) {
            showToast(err.message || 'Failed to add portfolio item', 'error');
        } finally {
            hideLoading();
            mount(renderSettingsView());
        }
    };

    window.handleDeletePortfolioItem = async (itemId) => {
        if (!confirm('Are you sure you want to remove this project from your showcase?')) return;
        try {
            showLoading();
            await apiFetch(`/profile/portfolio/${itemId}`, { method: 'DELETE' });
            showToast('Portfolio item removed', 'success');
            portfolioItems = portfolioItems.filter(i => i.id !== itemId);
        } catch (err) {
            showToast(err.message || 'Failed to remove portfolio item', 'error');
        } finally {
            hideLoading();
            mount(renderSettingsView());
        }
    };

    window.handleProfileSettingsSave = async (e) => {
        e.preventDefault();
        try {
            showLoading();
            const skillsStr = document.getElementById('setting-skills').value;
            const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
            const data = {
                niche: document.getElementById('setting-niche').value,
                service_area: document.getElementById('setting-service-area').value,
                availability: document.getElementById('setting-availability').value,
                response_time: document.getElementById('setting-response-time').value,
                skills: skills
            };
            profile = await apiFetch('/profile', {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
            showToast('Profile & skills updated', 'success');
        } catch (e) {
            showToast(e.message || 'Update failed', 'error');
        } finally {
            hideLoading();
            mount(renderSettingsView());
        }
    };

    // --- Buyer Bio Save ---
    window.handleBioSave = async (e) => {
        e.preventDefault();
        const bio = document.getElementById('setting-bio').value;
        const lookingFor = document.getElementById('setting-looking-for').value;
        try {
            showLoading();
            await apiFetch('/profile/bio', {
                method: 'PUT',
                body: JSON.stringify({ bio: bio || '', looking_for: lookingFor || '' })
            });
            showToast('About Me updated!', 'success');
            if (profile) {
                profile.bio = bio || '';
                profile.looking_for = lookingFor || '';
            }
            mount(renderSettingsView());
        } catch (err) {
            showToast(err.message || 'Failed to save bio', 'error');
        } finally {
            hideLoading();
        }
    };

    window.handlePasswordChange = async (e) => {
        e.preventDefault();
        const curPw = document.getElementById('setting-current-pw').value;
        const newPw = document.getElementById('setting-new-pw').value;
        const confirmPw = document.getElementById('setting-confirm-pw').value;

        if (newPw !== confirmPw) {
            showToast('New passwords do not match', 'error');
            return;
        }

        try {
            showLoading();
            await apiFetch('/auth/me', {
                method: 'PATCH',
                body: JSON.stringify({ current_password: curPw, new_password: newPw })
            });
            showToast('Password changed successfully', 'success');
            document.getElementById('setting-current-pw').value = '';
            document.getElementById('setting-new-pw').value = '';
            document.getElementById('setting-confirm-pw').value = '';
        } catch (e) {
            showToast(e.message || 'Failed to change password', 'error');
        } finally {
            hideLoading();
            mount(renderSettingsView());
        }
    };

    window.handleBankSave = async (e) => {
        e.preventDefault();
        const holder = document.getElementById('setting-bank-holder').value.trim();
        const bank = document.getElementById('setting-bank-name').value.trim();
        const acc = document.getElementById('setting-bank-acc').value.trim();
        const ifsc = document.getElementById('setting-bank-ifsc').value.trim();
        const upi = document.getElementById('setting-bank-upi').value.trim();

        showLoading();
        try {
            if (currentUser?.user_type === 'ADMIN') {
                const rzpKey = document.getElementById('setting-rzp-key')?.value.trim() || '';
                const rzpSecret = document.getElementById('setting-rzp-secret')?.value.trim() || '';
                const googleId = document.getElementById('setting-google-id')?.value.trim() || '';

                await apiFetch('/admin/platform-settings', {
                    method: 'PUT',
                    body: JSON.stringify({
                        owner_account_holder: holder,
                        owner_bank_name: bank,
                        owner_account_number: acc,
                        owner_ifsc_code: ifsc,
                        owner_upi_id: upi,
                        commission_rate: platformSettings?.commission_rate ?? 0.20,
                        razorpay_key_id: rzpKey,
                        razorpay_key_secret: rzpSecret,
                        google_client_id: googleId
                    })
                });
                platformSettings = {
                    ...(platformSettings || {}),
                    owner_account_holder: holder,
                    owner_bank_name: bank,
                    owner_account_number: acc,
                    owner_ifsc_code: ifsc,
                    owner_upi_id: upi,
                    razorpay_key_id: rzpKey,
                    razorpay_key_secret: rzpSecret,
                    google_client_id: googleId
                };
                if (window.publicConfig) {
                    window.publicConfig.razorpay_key_id = rzpKey;
                    window.publicConfig.google_client_id = googleId;
                }
            } else {
                await apiFetch('/profile/bank-details', {
                    method: 'PUT',
                    body: JSON.stringify({
                        bank_account_holder: holder,
                        bank_name: bank,
                        bank_account_number: acc,
                        bank_ifsc_code: ifsc,
                        upi_id: upi
                    })
                });
                if (profile) {
                    profile.bank_account_holder = holder;
                    profile.bank_name = bank;
                    profile.bank_account_number = acc;
                    profile.bank_ifsc_code = ifsc;
                    profile.upi_id = upi;
                }
            }
            showToast('Bank details saved successfully!', 'success');
        } catch (err) {
            showToast(err.message || 'Failed to save bank details', 'error');
        } finally {
            hideLoading();
            mount(renderSettingsView());
        }
    };

    loadData();

    function renderSettingsView() {
        const isProvider = currentUser?.user_type === 'PROVIDER';
        const isAdmin = currentUser?.user_type === 'ADMIN';
        const skillsFormatted = Array.isArray(profile?.skills)
            ? profile.skills.join(', ')
            : (typeof profile?.skills === 'string' ? profile.skills : '');

        return el`<div>
            ${renderAppHeader('/settings')}
            <div class="main">
                <div class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Settings & Account
                </div>

                <!-- Settings Tabs -->
                <div class="tabs" style="margin-bottom: 20px; overflow-x: auto; white-space: nowrap;">
                    <button type="button" class="tab ${activeSettingsTab === 'account' ? 'active' : ''}" onclick="setSettingsTab('account')">
                        👤 Account
                    </button>
                    ${isProvider ? `
                        <button type="button" class="tab ${activeSettingsTab === 'portfolio' ? 'active' : ''}" onclick="setSettingsTab('portfolio')">
                            📁 Portfolio &amp; Uploads (${portfolioItems.length})
                        </button>
                        <button type="button" class="tab ${activeSettingsTab === 'profile' ? 'active' : ''}" onclick="setSettingsTab('profile')">
                            🎨 Specialty &amp; Skills
                        </button>
                    ` : `
                        <button type="button" class="tab ${activeSettingsTab === 'bio' ? 'active' : ''}" onclick="setSettingsTab('bio')">
                            📝 About Me
                        </button>
                    `}
                    <button type="button" class="tab ${activeSettingsTab === 'bank' ? 'active' : ''}" onclick="setSettingsTab('bank')">
                        🏦 Bank &amp; Payouts
                    </button>
                    <button type="button" class="tab ${activeSettingsTab === 'security' ? 'active' : ''}" onclick="setSettingsTab('security')">
                        🔒 Security
                    </button>
                    <button type="button" class="tab ${activeSettingsTab === 'commission' ? 'active' : ''}" onclick="setSettingsTab('commission')">
                        💰 Commission &amp; Escrow
                    </button>
                    <button type="button" class="tab ${activeSettingsTab === 'preferences' ? 'active' : ''}" onclick="setSettingsTab('preferences')">
                        🌙 Display &amp; Theme
                    </button>
                </div>

                <!-- Tab 1: Account -->
                ${activeSettingsTab === 'account' ? `
                    <div class="card" style="max-width: 580px;">
                        <div class="card-header">
                            <div class="card-title">Personal Information &amp; Creator Handle</div>
                            <span class="badge badge-info">${currentUser?.user_type || 'User'}</span>
                        </div>
                        <form onsubmit="handleAccountSave(event)">
                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-input" id="setting-name" value="${currentUser?.name || ''}" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Creator Username (@handle)</label>
                                <div style="position: relative; display: flex; align-items: center;">
                                    <span style="position: absolute; left: 14px; color: var(--accent); font-weight: 800; font-size: 1rem; pointer-events: none;">@</span>
                                    <input type="text" class="form-input" id="setting-username" value="${currentUser?.username || ''}" placeholder="your_unique_handle" style="padding-left: 32px; font-weight: 700;" pattern="[a-zA-Z0-9_]{3,30}" title="3-30 letters, numbers, or underscores">
                                </div>
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 5px; display: block;">
                                    Your unique creator link: <strong>groovehub.com/@${currentUser?.username || 'username'}</strong>. Clients can search and find you directly.
                                </small>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-input" id="setting-email" value="${currentUser?.email || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone Number</label>
                                    <input type="tel" class="form-input" id="setting-phone" value="${currentUser?.phone || ''}" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Save Changes</button>
                        </form>
                    </div>
                ` : ''}

                <!-- Tab 2: About Me (Buyer) -->
                ${activeSettingsTab === 'bio' && !isProvider ? `
                    <div class="card" style="max-width: 540px;">
                        <div class="card-header">
                            <div class="card-title">About Me</div>
                            <span class="badge badge-info">Buyer</span>
                        </div>
                        <form onsubmit="handleBioSave(event)">
                            <div class="form-group">
                                <label class="form-label">Your Bio</label>
                                <textarea class="form-textarea" id="setting-bio" rows="5" placeholder="Tell buyers and providers about yourself — what you're looking for, your preferences, your work style..." style="resize: vertical;">${profile?.bio || ''}</textarea>
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; display: block;">
                                    This bio is visible to providers when you book services. Share what you're looking for, your communication style, and any preferences.
                                </small>
                            </div>
                            <div class="form-group" style="margin-top: 12px;">
                                <label class="form-label">What I'm Looking For</label>
                                <textarea class="form-textarea" id="setting-looking-for" rows="3" placeholder="e.g. I need a YouTube video editor who can turn raw footage into engaging shorts under 60 seconds..." style="resize: vertical;">${profile?.looking_for || ''}</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Save Bio</button>
                        </form>
                    </div>
                ` : ''}

                <!-- Tab: Portfolio Showcase (Provider Only) -->
                ${activeSettingsTab === 'portfolio' && isProvider ? `
                    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 860px;">
                        <!-- Banner -->
                        <div class="card" style="padding: 20px 24px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%); border: 1px solid rgba(99, 102, 241, 0.25);">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                                <div>
                                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                                        <span>🎨</span> Public Portfolio Showcase &amp; Work Uploads
                                    </h3>
                                    <p style="font-size: 0.8125rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
                                        Upload your video showreels, client proof, IELTS teaching samples, or copywriting deliverables. Buyers see these when browsing your profile.
                                    </p>
                                </div>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <button type="button" class="btn btn-secondary btn-sm" onclick="openFiverrPortfolioModal(${currentUser.id}, '${escapeHTML(currentUser.name)}')">
                                        👁️ Preview Public Seller Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Add Portfolio Item Form -->
                        <div class="card" style="padding: 24px;">
                            <div class="card-header" style="margin-bottom: 16px;">
                                <div class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                    <span>➕</span> Add New Work Sample / Showcase Item
                                </div>
                                <span class="badge badge-info">Instant Live</span>
                            </div>
                            <form onsubmit="handleAddPortfolioItem(event)">
                                <div class="form-group">
                                    <label class="form-label">Project Title <span style="color: var(--danger);">*</span></label>
                                    <input type="text" class="form-input" id="port-title" placeholder="e.g. High-Retention YouTube Tech Edit / Band 8 IELTS Mock Drill / SaaS Landing Copy" required>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">Media Type</label>
                                        <select class="form-select" id="port-media-type">
                                            <option value="video">🎬 Video (YouTube / Vimeo / Reel)</option>
                                            <option value="image">🖼️ Image (Thumbnails, Graphics, Designs)</option>
                                            <option value="audio">🎙️ Audio (Podcast, Voiceover, Accent Clinic)</option>
                                            <option value="link">🔗 Link / Case Study (Notion, Drive, Medium)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Media URL / Embed Link <span style="color: var(--danger);">*</span></label>
                                        <input type="url" class="form-input" id="port-media-url" placeholder="https://youtube.com/watch?v=... or https://images.unsplash.com/..." required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Cover / Thumbnail Image URL <span style="color: var(--text-muted); font-size: 0.75rem;">(Optional - for card preview)</span></label>
                                    <input type="url" class="form-input" id="port-thumb-url" placeholder="https://images.unsplash.com/... (optional)">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Project Description &amp; Client Deliverables</label>
                                    <textarea class="form-textarea" id="port-desc" rows="3" placeholder="Describe the goal, tools used (Premiere, After Effects, Figma), turn-around time, and results achieved for the client..."></textarea>
                                </div>

                                <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
                                    <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-weight: 700;">
                                        ➕ Add to My Showcase
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Live Portfolio Showcase Items Grid -->
                        <div class="card" style="padding: 24px;">
                            <div class="card-header" style="margin-bottom: 16px;">
                                <div class="card-title" style="font-size: 1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                    <span>📁</span> Live Projects on Your Profile (${portfolioItems.length})
                                </div>
                            </div>

                            ${portfolioItems.length === 0 ? `
                                <div style="text-align: center; padding: 40px 20px; border: 1.5px dashed var(--border); border-radius: var(--radius);">
                                    <div style="font-size: 2.5rem; margin-bottom: 10px;">🎨</div>
                                    <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">No showcase projects added yet</h4>
                                    <p style="font-size: 0.8125rem; color: var(--text-secondary); max-width: 440px; margin: 0 auto 16px;">
                                        Creators who upload at least 2 video reels or work samples receive <strong>4x more client bookings</strong>. Add your first sample above!
                                    </p>
                                </div>
                            ` : `
                                <div class="grid grid-2" style="gap: 16px;">
                                    ${portfolioItems.map(item => `
                                        <div class="card" style="padding: 14px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; flex-direction: column; justify-content: space-between;">
                                            <div>
                                                ${item.media_type === 'video' && item.media_url && item.media_url.includes('youtube') ? `
                                                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin-bottom: 10px; background: #000;">
                                                        <iframe src="${item.media_url.replace('watch?v=', 'embed/').split('&')[0]}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
                                                    </div>
                                                ` : item.thumbnail_url || (item.media_type === 'image' && item.media_url) ? `
                                                    <div style="height: 140px; overflow: hidden; border-radius: 8px; margin-bottom: 10px; background: #111;">
                                                        <img src="${item.thumbnail_url || item.media_url}" alt="${escapeHTML(item.title)}" style="width: 100%; height: 100%; object-fit: cover;">
                                                    </div>
                                                ` : `
                                                    <div style="height: 90px; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border-radius: 8px; margin-bottom: 10px; font-size: 2rem;">
                                                        ${item.media_type === 'video' ? '🎬' : item.media_type === 'image' ? '🖼️' : item.media_type === 'audio' ? '🎙️' : '🔗'}
                                                    </div>
                                                `}
                                                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                                                    <h4 style="font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin: 0;">${escapeHTML(item.title)}</h4>
                                                    <span class="badge badge-info" style="font-size: 0.68rem; text-transform: uppercase;">${item.media_type}</span>
                                                </div>
                                                <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                                    ${escapeHTML(item.description || 'Verified project sample')}
                                                </p>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px;">
                                                <a href="${escapeHTML(item.media_url)}" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: var(--accent); font-weight: 600; text-decoration: none;">
                                                    Open Link ↗
                                                </a>
                                                <button type="button" class="btn btn-secondary btn-sm" onclick="handleDeletePortfolioItem(${item.id})" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3); padding: 3px 8px; font-size: 0.72rem;">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 2: Profile (Provider) -->
                ${activeSettingsTab === 'profile' && isProvider ? `
                    <div class="card" style="max-width: 580px;">
                        <div class="card-header">
                            <div class="card-title">Provider Specialty & Skills</div>
                            <span class="badge badge-success">Active Provider</span>
                        </div>
                        <form onsubmit="handleProfileSettingsSave(event)">
                            <div class="form-group">
                                <label class="form-label">Primary Category / Niche</label>
                                <select class="form-select" id="setting-niche">
                                    <option value="editors_animators" ${profile?.niche === 'editors_animators' ? 'selected' : ''}>🎬 Video Editors & Animators</option>
                                    <option value="tutors" ${profile?.niche === 'tutors' ? 'selected' : ''}>🗣️ English Tutors & Coaches</option>
                                    <option value="writers" ${profile?.niche === 'writers' ? 'selected' : ''}>✍️ Writers & Copywriters</option>
                                    <option value="social_media" ${profile?.niche === 'social_media' ? 'selected' : ''}>📱 Social Media Managers</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Skills (Comma-separated)</label>
                                <input type="text" class="form-input" id="setting-skills" value="${skillsFormatted}" placeholder="e.g. Premiere Pro, After Effects, IELTS, Accent Training">
                                <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; display: block;">
                                    Popular for Editors: Video Editing, Color Grading, Motion Graphics, Shorts, Reels<br>
                                    Popular for Tutors: Spoken English, Business English, IELTS Prep, Accent Training
                                </small>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Service Area</label>
                                    <select class="form-select" id="setting-service-area">
                                        <option value="online" ${profile?.service_area === 'online' ? 'selected' : ''}>Online (Global)</option>
                                        <option value="chennai" ${profile?.service_area === 'chennai' ? 'selected' : ''}>Chennai</option>
                                        <option value="tn" ${profile?.service_area === 'tn' ? 'selected' : ''}>Tamil Nadu</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Availability</label>
                                    <select class="form-select" id="setting-availability">
                                        <option value="flexible" ${profile?.availability === 'flexible' ? 'selected' : ''}>Flexible</option>
                                        <option value="weekdays" ${profile?.availability === 'weekdays' ? 'selected' : ''}>Weekdays Only</option>
                                        <option value="weekends" ${profile?.availability === 'weekends' ? 'selected' : ''}>Weekends Only</option>
                                        <option value="limited" ${profile?.availability === 'limited' ? 'selected' : ''}>Limited</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Response Time</label>
                                <select class="form-select" id="setting-response-time">
                                    <option value="1 hour" ${profile?.response_time === '1 hour' ? 'selected' : ''}>Within 1 hour</option>
                                    <option value="4 hours" ${profile?.response_time === '4 hours' ? 'selected' : ''}>Within 4 hours</option>
                                    <option value="12 hours" ${profile?.response_time === '12 hours' ? 'selected' : ''}>Within 12 hours</option>
                                    <option value="24 hours" ${profile?.response_time === '24 hours' ? 'selected' : ''}>Within 24 hours</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Save Specialty</button>
                        </form>
                    </div>
                ` : ''}

                <!-- Tab 3: Security -->
                ${activeSettingsTab === 'security' ? `
                    <div class="card" style="max-width: 480px;">
                        <div class="card-header">
                            <div class="card-title">Change Password</div>
                        </div>
                        <form onsubmit="handlePasswordChange(event)">
                            <div class="form-group">
                                <label class="form-label">Current Password</label>
                                <input type="password" class="form-input" id="setting-current-pw" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">New Password</label>
                                <input type="password" class="form-input" id="setting-new-pw" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" class="form-input" id="setting-confirm-pw" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Update Password</button>
                        </form>
                    </div>
                ` : ''}

                <!-- Tab: Bank & Payouts -->
                ${activeSettingsTab === 'bank' ? `
                    <div class="card" style="max-width: 580px;">
                        <div class="card-header">
                            <div class="card-title">${isAdmin ? '🏦 Bank Account' : '🏦 Provider Payout Account (80% Earnings)'}</div>
                            <span class="badge ${isAdmin ? 'badge-danger' : 'badge-success'}">${isAdmin ? 'Full Payout' : '80% Provider Payout'}</span>
                        </div>
                        <div class="card-body">
                            <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 16px; font-size: 0.8125rem; color: var(--text-secondary);">
                                ${isAdmin
                    ? '📌 <strong>Payment Routing:</strong> Funds are held securely in escrow until you approve delivery.'
                    : '📌 <strong>Direct Payout Routing:</strong> 80% of project funds are released to this bank account upon client approval.'}
                            </div>
                            <form onsubmit="handleBankSave(event)">
                                <div class="form-group">
                                    <label class="form-label">Account Holder Name</label>
                                    <input type="text" class="form-input" id="setting-bank-holder" value="${(isAdmin ? platformSettings?.owner_account_holder : profile?.bank_account_holder) || ''}" placeholder="e.g. Full Legal Name" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">Bank Name</label>
                                        <input type="text" class="form-input" id="setting-bank-name" value="${(isAdmin ? platformSettings?.owner_bank_name : profile?.bank_name) || ''}" placeholder="e.g. HDFC Bank, Chase" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Account Number</label>
                                        <input type="text" class="form-input" id="setting-bank-acc" value="${(isAdmin ? platformSettings?.owner_account_number : profile?.bank_account_number) || ''}" placeholder="e.g. 50100492819281" required>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">IFSC / Branch Routing Code</label>
                                        <input type="text" class="form-input" id="setting-bank-ifsc" value="${(isAdmin ? platformSettings?.owner_ifsc_code : profile?.bank_ifsc_code) || ''}" placeholder="e.g. HDFC0001234">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">UPI ID / Virtual Payout Address</label>
                                        <input type="text" class="form-input" id="setting-bank-upi" value="${(isAdmin ? platformSettings?.owner_upi_id : profile?.upi_id) || ''}" placeholder="e.g. name@okhdfcbank">
                                    </div>
                                </div>

                                ${isAdmin ? `
                                    <div class="divider" style="margin: 20px 0;"></div>
                                    <h4 style="font-size: 0.9375rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">
                                        ⚡ Live Payment Gateway & OAuth Credentials
                                    </h4>
                                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 14px;">
                                        Enter your production or sandbox keys below. If left blank, the platform automatically runs in secure sandbox mode.
                                    </p>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label class="form-label">Razorpay Key ID</label>
                                            <input type="text" class="form-input" id="setting-rzp-key" value="${platformSettings?.razorpay_key_id || ''}" placeholder="rzp_live_... or rzp_test_...">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Razorpay Key Secret</label>
                                            <input type="password" class="form-input" id="setting-rzp-secret" value="${platformSettings?.razorpay_key_secret || ''}" placeholder="Enter secret...">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Google OAuth Client ID</label>
                                        <input type="text" class="form-input" id="setting-google-id" value="${platformSettings?.google_client_id || ''}" placeholder="e.g. 123456789-xyz.apps.googleusercontent.com">
                                        <small style="font-size: 0.75rem; color: var(--text-muted);">From Google Cloud Console -> APIs & Services -> Credentials</small>
                                    </div>
                                ` : ''}

                                <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Save Settings</button>
                            </form>
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 4: Commission & Escrow -->
                ${activeSettingsTab === 'commission' ? `
                    <div class="card" style="max-width: 540px;">
                        <div class="card-header">
                            <div class="card-title">Platform Commission & Escrow Model</div>
                            <span class="badge badge-success">0% Platform Fee</span>
                        </div>
                        <div class="card-body">
                            <div style="background: var(--bg-hover); padding: 16px; border-radius: var(--radius-sm); margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Provider Payout (To Provider Bank)</span>
                                    <strong style="color: var(--success); font-size: 1.125rem;">80%</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Platform Commission (To Your Bank)</span>
                                    <strong style="color: var(--success); font-size: 1.125rem;">0%</strong>
                                </div>
                            </div>
                            <h4 style="font-size: 0.9375rem; margin-bottom: 8px; color: var(--text-primary);">How Escrow & Payout Routing Works:</h4>
                            <ol style="padding-left: 20px; font-size: 0.8125rem; line-height: 1.6; color: var(--text-secondary);">
                                <li><strong>Buyer Funds Project:</strong> Full amount is captured and securely held in escrow.</li>
                                <li><strong>Provider Delivers:</strong> Provider submits the final video files, tutoring recordings, or assets.</li>
                                <li><strong>Buyer Approves:</strong> Once buyer is satisfied, <strong>100% is instantly released to provider bank account.</strong> No commission charged.</li>
                                <li><strong>Dispute Resolution:</strong> If quality standards aren't met, admin mediation ensures fair refunds or revisions.</li>
                            </ol>
                        </div>
                    </div>
                ` : ''}

                <!-- Tab 5: Preferences -->
                ${activeSettingsTab === 'preferences' ? `
                    <div class="card" style="max-width: 480px;">
                        <div class="card-header">
                            <div class="card-title">Display & Application Preferences</div>
                        </div>
                        <div class="card-body">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border);">
                                <div>
                                    <strong style="font-size: 0.875rem; color: var(--text-primary);">Appearance Theme</strong>
                                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Switch between light and dark mode</p>
                                </div>
                                <button type="button" class="btn btn-secondary btn-sm" onclick="toggleTheme()" style="width: auto;">
                                    ${currentTheme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
                                </button>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                                <div>
                                    <strong style="font-size: 0.875rem; color: var(--text-primary);">PWA Status</strong>
                                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Progressive Web App installation</p>
                                </div>
                                <span class="badge badge-success">Ready</span>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            </div>
    </div>`;
    }

    mount(renderSettingsView());
    return renderSettingsView();
}
window.Settings = Settings;
window.Profile = Settings;

// =============== PACKAGES ===============

function MyPackages() {
    let packages = [];
    let loading = true;

    async function loadPackages() {
        showLoading();
        try {
            packages = await apiFetch('/packages');
        } catch (e) {
            showToast(e.message, 'error');
            packages = [];
        } finally {
            loading = false;
            mount(renderMyPackages());
        }
    }

    loadPackages();

    function renderMyPackages() {
        return el`<div class="header">
            ${renderLogo(32, true)}
            <div class="header-nav">
                <button class="nav-btn" onclick="router('/')">Dashboard</button>
                <button class="nav-btn" onclick="router('/profile')">Profile</button>
                <button class="nav-btn" onclick="logout()" style="color: var(--danger);">Logout</button>
            </div>
        </div>
        <div class="main">
            <div class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                My Packages
            </div>
            <div class="flex items-center justify-between mb-4">
                <span style="color: var(--text-secondary); font-size: 0.875rem;">${packages.length} package${packages.length !== 1 ? 's' : ''}</span>
                <button class="btn btn-primary btn-sm" onclick="router('/create-package')">+ New Package</button>
            </div>
            ${loading ? '<div class="loading"><div class="spinner"></div></div>' : ''}
            ${!loading && packages.length === 0 ? `
                <div class="card">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <h3>No packages yet</h3>
                        <p>Create your first package to start receiving bookings</p>
                        <button class="btn btn-primary" onclick="router('/create-package')">Create Package</button>
                    </div>
                </div>
            ` : `
                <div class="grid grid-2">
                    ${packages.map(pkg => `
                        <div class="card">
                            <div class="card-header">
                                <div class="card-title">${pkg.title}</div>
                                <span class="badge ${pkg.status === 'approved' ? 'badge-success' : pkg.status === 'pending' ? 'badge-warning' : 'badge-danger'}">${pkg.status}</span>
                            </div>
                            <div class="card-body">
                                <div class="price">₹${pkg.price.toLocaleString()}</div>
                                <div class="price-range">${pkg.package_type.replace('_', ' ')} • ${pkg.turnaround}</div>
                                <div class="divider"></div>
                                <div style="font-size: 0.8125rem; color: var(--text-secondary);">${pkg.scope || 'No description'}</div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-secondary btn-sm" onclick="editPackage(${pkg.id})">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deletePackage(${pkg.id})">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>`;
    }

    window.editPackage = (id) => {
        const pkg = packages.find(p => p.id === id);
        if (!pkg) return;
        // For simplicity, redirect to create with pre-filled data
        sessionStorage.setItem('edit_package_id', id);
        sessionStorage.setItem('edit_package_data', JSON.stringify(pkg));
        router('/create-package');
    };

    window.deletePackage = async (id) => {
        if (!confirm('Delete this package?')) return;
        showLoading();
        try {
            await apiFetch(`/packages/${id}`, { method: 'DELETE' });
            showToast('Package deleted', 'success');
            packages = packages.filter(p => p.id !== id);
            mount(renderMyPackages());
        } catch (e) {
            showToast(e.message, 'error');
        }
    };

    mount(renderMyPackages());
    return renderMyPackages();
}

// =============== CREATE PACKAGE ===============

function CreatePackage() {
    const editId = sessionStorage.getItem('edit_package_id');
    const editData = editId ? JSON.parse(sessionStorage.getItem('edit_package_data') || '{}') : null;
    let selectedType = editData?.package_type || 'per_deliverable';
    let error = '';
    let success = '';

    if (editData) {
        sessionStorage.removeItem('edit_package_id');
        sessionStorage.removeItem('edit_package_data');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const data = {
                package_type: selectedType,
                title: document.getElementById('pkg-title').value.trim(),
                price: parseFloat(document.getElementById('pkg-price').value),
                scope: document.getElementById('pkg-scope').value.trim(),
                turnaround: document.getElementById('pkg-turnaround').value.trim(),
                revision_limit: parseInt(document.getElementById('pkg-revisions').value) || 1,
                sample_reference: document.getElementById('pkg-sample')?.value?.trim() || null
            };
            showLoading();

            const url = editId ? `/packages/${editId}` : '/packages';
            const method = editId ? 'PATCH' : 'POST';

            await apiFetch(url, {
                method,
                body: JSON.stringify(data)
            });

            showToast(editId ? 'Package updated successfully!' : 'Package created successfully!', 'success');
            router('/packages');
        } catch (e) {
            error = e.message;
            hideLoading();
            mount(renderCreatePackage());
        }
    }

    window.handleSubmit = handleSubmit;

    window.selectPackageType = (type) => {
        selectedType = type;
        mount(renderCreatePackage());
    };

    function renderCreatePackage() {
        const isEdit = !!editId;
        const view = el`<div>
            ${renderAppHeader('/packages')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="section-title" style="margin: 0;">${isEdit ? 'Edit Package' : 'Create Package'}</div>
                    <button class="btn btn-secondary btn-sm" onclick="router('/packages')"><-- Back to Packages</button>
                </div>
                <div class="card" style="max-width: 540px;">
                    ${error ? `<div class="toast toast-error" style="margin-bottom: 12px;">${error}</div>` : ''}
                    ${success ? `<div class="toast toast-success" style="margin-bottom: 12px;">${success}</div>` : ''}
                    <form onsubmit="handleSubmit(event)">
                        <div class="form-group">
                            <label class="form-label">Package Type</label>
                            <div class="tabs" style="margin-top: 4px;">
                                <button type="button" class="tab ${selectedType === 'per_deliverable' ? 'active' : ''}" onclick="selectPackageType('per_deliverable')">
                                    📦 Per Deliverable
                                </button>
                                <button type="button" class="tab ${selectedType === 'monthly' ? 'active' : ''}" onclick="selectPackageType('monthly')">
                                    📅 Monthly Retainer
                                </button>
                                <button type="button" class="tab ${selectedType === 'quarterly' ? 'active' : ''}" onclick="selectPackageType('quarterly')">
                                    📆 Quarterly
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Title</label>
                            <input type="text" class="form-input" id="pkg-title" placeholder="e.g. Short Video Edit (60s)" value="${editData?.title || ''}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Price (₹)</label>
                                <input type="number" class="form-input" id="pkg-price" placeholder="2500" value="${editData?.price || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Turnaround</label>
                                <input type="text" class="form-input" id="pkg-turnaround" placeholder="e.g. 24-48 hours" value="${editData?.turnaround || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Revision Limit</label>
                                <input type="number" class="form-input" id="pkg-revisions" min="1" max="10" value="${editData?.revision_limit || 2}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Sample Reference (Optional)</label>
                                <input type="text" class="form-input" id="pkg-sample" placeholder="https://drive.google.com/..." value="${editData?.sample_reference || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Scope / Description</label>
                            <textarea class="form-textarea" id="pkg-scope" rows="3" placeholder="Describe what's included in this package...">${editData?.scope || ''}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Package'}</button>
                    </form>
                </div>
            </div>
        </div>`;
        const form = view.querySelector('form');
        if (form) { form.removeAttribute('onsubmit'); form.addEventListener('submit', handleSubmit); }
        return view;
    }

    mount(renderCreatePackage());
    return renderCreatePackage();
}

// =============== BOOKINGS ===============

function BookingsList() {
    let bookings = [];
    let loading = true;

    async function loadBookings() {
        showLoading();
        try {
            bookings = await apiFetch('/bookings');
        } catch (e) {
            showToast(e.message, 'error');
            bookings = [];
        } finally {
            loading = false;
            mount(renderBookingsList());
        }
    }

    loadBookings();

    function renderBookingsList() {
        const providerBookings = bookings.filter(b => b.provider_id === currentUser?.id);
        const buyerBookings = bookings.filter(b => b.buyer_id === currentUser?.id);
        const isProvider = currentUser?.user_type === 'PROVIDER';
        const isBuyer = currentUser?.user_type === 'BUYER' || !currentUser?.user_type;

        return el`<div>
            ${renderAppHeader('/bookings')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                    <button class="fiverr-back-btn" onclick="router('/')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span><-- Back to Dashboard</span>
                    </button>
                    <div class="section-title" style="margin: 0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M3 9h18"/>
                            <path d="M9 21V9"/>
                        </svg>
                        My Bookings
                    </div>
                </div>

                ${isProvider ? `
                    <div class="section-title mb-4">Client Orders (${providerBookings.length})</div>
                    ${providerBookings.length === 0 ? `
                        <div class="card">
                            <div class="empty-state">
                                <h3>No client orders yet</h3>
                                <p>When content creators book your packages or services, they will appear here.</p>
                                <button class="btn btn-primary btn-sm mt-3" onclick="router('/packages')">Manage Packages</button>
                            </div>
                        </div>
                    ` : renderBookingList(providerBookings, 'provider')}
                ` : ''}

                ${isBuyer ? `
                    <div class="section-title mb-4">My Bookings (${buyerBookings.length})</div>
                    ${buyerBookings.length === 0 ? `
                        <div class="card">
                            <div class="empty-state">
                                <h3>No bookings yet</h3>
                                <p>Browse verified editors and English tutors to find the right talent for your project.</p>
                                <div class="flex gap-2 mt-4" style="justify-content: center;">
                                    <button class="btn btn-primary btn-sm" onclick="router('/')">Browse Talent</button>
                                    <button class="btn btn-secondary btn-sm" onclick="router('/create-booking')">New Booking</button>
                                </div>
                            </div>
                        </div>
                    ` : renderBookingList(buyerBookings, 'buyer')}
                ` : ''}
            </div>
        </div>`;
    }

    function renderBookingList(list, role) {
        return el`<div class="grid grid-2">
            ${list.map(booking => {
            const statusBadgeClass = getBookingBadge(booking.status);
            const isClient = role === 'buyer';
            const isTalent = role === 'provider';
            const commission = booking.total_amount * 0.20;
            const payout = booking.total_amount - commission;

            return `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="card-body" style="padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div>
                                <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary);">
                                    Booking #${booking.id}
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                                    ${new Date(booking.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                            <span class="badge ${statusBadgeClass}">${booking.status.replace('_', ' ')}</span>
                        </div>

                        ${booking.package ? `
                            <div style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">
                                📦 ${booking.package.title}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px;">
                                ${booking.package.scope || 'Standard service scope'}
                            </div>
                        ` : ''}

                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg-hover); border-radius: var(--radius-sm); margin-bottom: 12px;">
                            <span style="font-size: 0.8125rem; color: var(--text-secondary);">Total Value</span>
                            <span style="font-weight: 700; font-size: 1rem; color: var(--accent);">₹${booking.total_amount.toLocaleString()}</span>
                        </div>

                        ${isTalent ? `
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
                                Platform Fee: ₹0 • Full Payout: <strong style="color: var(--success);">₹${payout.toLocaleString()}</strong>
                            </div>
                        ` : ''}

                        ${booking.delivery_file_link ? `
                            <div style="margin-top: 10px; padding: 10px 12px; background: rgba(108, 92, 231, 0.08); border: 1px solid var(--border); border-radius: var(--radius-sm);">
                                <div style="font-size: 0.75rem; font-weight: 600; color: var(--accent); margin-bottom: 4px;">📂 Project Delivery</div>
                                <a href="${booking.delivery_file_link}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-size: 0.8125rem; word-break: break-all; text-decoration: underline;">
                                    ${booking.delivery_file_link}
                                </a>
                            </div>
                        ` : ''}

                        <!-- Action Buttons -->
                        <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
                            <button class="btn btn-secondary btn-sm" onclick="openBookingChat(${booking.id}, '${isClient ? 'Editor / Provider' : 'Client / Buyer'}')">
                                💬 Project Chat & Messages
                            </button>

                            ${isTalent && booking.status === 'confirmed' ? `
                                <button class="btn btn-primary btn-sm" onclick="startProject(${booking.id})">
                                    ▶️ Start Working on Project
                                </button>
                            ` : ''}

                            ${isTalent && booking.status === 'in_progress' ? `
                                <button class="btn btn-primary btn-sm" onclick="markDelivered(${booking.id})">
                                    🚀 Submit Delivery Link
                                </button>
                            ` : ''}

                            ${isTalent && booking.status === 'delivered' ? `
                                <div style="font-size: 0.8125rem; color: var(--text-secondary); text-align: center; padding: 4px;">
                                    ⏳ Waiting for buyer approval & payment release
                                </div>
                            ` : ''}

                            ${isClient && (booking.status === 'delivered' || booking.status === 'pending_approval') ? `
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-success btn-sm" style="flex: 1;" onclick="approveBooking(${booking.id})">
                                        ✅ Approve & Release
                                    </button>
                                    <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="disputeBooking(${booking.id})">
                                        ⚠️ Dispute
                                    </button>
                                </div>
                            ` : ''}

                            ${isClient && (booking.status === 'approved' || booking.status === 'completed') ? `
                                <button class="btn btn-secondary btn-sm" onclick="openReviewModal(${booking.id})">
                                    ⭐ Leave Review & Rating
                                </button>
                            ` : ''}

                            ${isClient && (booking.status === 'pending_payment' || booking.status === 'pending') ? `
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="PaymentsPortal.payPendingOrder(${booking.id}, ${booking.total_amount})">
                                        💳 Pay & Secure in Escrow
                                    </button>
                                    <button class="btn btn-secondary btn-sm" onclick="cancelPendingBooking(${booking.id})">
                                        ✕ Cancel
                                    </button>
                                </div>
                            ` : ''}

                            ${booking.status === 'disputed' ? `
                                <div style="font-size: 0.75rem; color: var(--danger); background: rgba(225, 112, 85, 0.1); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
                                    ⚠️ Dispute opened. Marketplace admin is reviewing.
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('')}
        </div>`;
    }

    window.cancelPendingBooking = async (id) => {
        if (!confirm('Cancel this unpaid booking?')) return;
        showLoading();
        try {
            await apiFetch(`/bookings/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'cancelled' })
            });
            showToast('Booking cancelled.', 'info');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    window.startProject = async (id) => {
        showLoading();
        try {
            await apiFetch(`/bookings/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'in_progress' })
            });
            showToast('Project started! Status is now In Progress.', 'success');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    window.approveBooking = async (id) => {
        if (!confirm('Approve this delivery and release full payment to provider?')) return;
        showLoading();
        try {
            await apiFetch(`/bookings/${id}/approve`, { method: 'POST' });
            showToast('Booking approved and payment released!', 'success');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    window.disputeBooking = async (id) => {
        const reason = prompt('Please describe why you are disputing this booking:');
        if (!reason) return;
        showLoading();
        try {
            await apiFetch(`/bookings/${id}/dispute`, {
                method: 'POST',
                body: JSON.stringify({ description: reason })
            });
            showToast('Dispute opened. Admin has been notified.', 'success');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    window.markDelivered = async (id) => {
        const link = prompt('Enter your delivery link (Google Drive, Dropbox, YouTube, Loom, etc.):');
        if (!link) return;
        showLoading();
        try {
            await apiFetch(`/bookings/${id}/delivery`, {
                method: 'PATCH',
                body: JSON.stringify({ delivery_file_link: link })
            });
            showToast('Delivery submitted successfully!', 'success');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    window.leaveReview = async (id) => {
        const ratingStr = prompt('Rate provider (1 to 5 stars):', '5');
        if (!ratingStr) return;
        const rating = parseInt(ratingStr);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            showToast('Please enter a rating between 1 and 5', 'error');
            return;
        }
        const comment = prompt('Write a review comment (optional):') || 'Great work!';
        showLoading();
        try {
            await apiFetch('/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    booking_id: id,
                    rating: rating,
                    comment: comment
                })
            });
            showToast('Review submitted! Thank you.', 'success');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    mount(renderBookingsList());
    return renderBookingsList();
}

// =============== CREATE BOOKING ===============

function CreateBooking() {
    let packages = [];
    let providerMap = {};
    let grouped = {};
    let loading = true;
    let error = '';

    async function loadPackages() {
        showLoading();
        try {
            packages = await apiFetch('/packages?status=approved');
            grouped = {};
            packages.forEach(p => {
                if (!grouped[p.provider_id]) {
                    grouped[p.provider_id] = {
                        provider: null,
                        packages: []
                    };
                }
                grouped[p.provider_id].packages.push(p);
            });

            // Pre-fetch provider details
            const distinctIds = Object.keys(grouped);
            await Promise.all(
                distinctIds.map(async id => {
                    try {
                        const user = await apiFetch(`/auth/${id}`);
                        grouped[id].provider = {
                            id: parseInt(id),
                            name: user?.name || `Provider #${id}`,
                            rating: user?.rating || 0
                        };
                    } catch {
                        grouped[id].provider = {
                            id: parseInt(id),
                            name: `Provider #${id}`,
                            rating: 0
                        };
                    }
                })
            );
        } catch (e) {
            error = e.message;
            packages = [];
        } finally {
            loading = false;
            mount(renderCreateBooking());
        }
    }

    loadPackages();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const packageId = parseInt(document.getElementById('booking-package').value);
            const providerId = parseInt(document.getElementById('booking-provider').value);
            const selectedPkg = packages.find(p => p.id === packageId);

            if (!selectedPkg) {
                showToast('Please select a valid package', 'error');
                return;
            }

            showLoading();

            // Step 1: Create commercial payment order
            const orderData = await apiFetch('/payments/create-order', {
                method: 'POST',
                body: JSON.stringify({
                    package_id: packageId,
                    niche: selectedPkg.niche || 'editors_animators'
                })
            });
            hideLoading();

            // Step 2: Launch Razorpay Standard Checkout
            const rzpKey = orderData.razorpay_key_id;

            if (typeof Razorpay !== 'undefined') {
                const options = {
                    key: rzpKey,
                    amount: orderData.amount_paise,
                    currency: "INR",
                    name: "Groove Hub",
                    description: `${selectedPkg.title} (100% Escrow Protected)`,
                    image: "/static/icons/icon-192.png",
                    order_id: orderData.order_id && orderData.order_id.startsWith('order_') ? orderData.order_id : undefined,
                    prefill: {
                        name: currentUser?.name || orderData.buyer_name,
                        email: currentUser?.email || orderData.buyer_email || 'client@example.com',
                        contact: currentUser?.phone || orderData.buyer_phone || '9999999999'
                    },
                    theme: {
                        color: "#6c5ce7"
                    },
                    handler: async function (response) {
                        showLoading();
                        try {
                            await apiFetch('/payments/verify', {
                                method: 'POST',
                                body: JSON.stringify({
                                    booking_id: orderData.booking_id,
                                    razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                                    razorpay_order_id: response.razorpay_order_id || orderData.order_id,
                                    razorpay_signature: response.razorpay_signature || ''
                                })
                            });
                            showToast(`🎉 Payment of ₹${selectedPkg.price.toLocaleString()} secured in Escrow! Provider notified.`, 'success');
                            sessionStorage.removeItem('selected_provider_id');
                            sessionStorage.removeItem('selected_package_id');
                            router('/bookings');
                        } catch (err) {
                            showToast('Payment verification failed: ' + err.message, 'error');
                        } finally {
                            hideLoading();
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            showToast('Payment window closed. Order is pending in your bookings.', 'info');
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (resp) {
                    showToast('Payment failed: ' + (resp.error?.description || 'Unknown payment error'), 'error');
                });
                rzp.open();
            } else {
                // In-app fallback payment confirmation modal
                showCustomPaymentModal(orderData, selectedPkg);
            }
        } catch (e) {
            error = e.message;
            hideLoading();
            showToast(error, 'error');
            if (error) mount(renderCreateBooking());
        }
    }

    function showCustomPaymentModal(orderData, selectedPkg) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;';

        modal.innerHTML = `
            <div class="card" style="max-width: 460px; width: 100%; box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
                <div class="card-header" style="border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700;">Secure Escrow Checkout</h3>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">100% Buyer Protection Guarantee</span>
                    </div>
                    <button id="close-checkout-modal" style="background:transparent; border:none; color:var(--text-muted); font-size:1.2rem; cursor:pointer;">✕</button>
                </div>
                <div class="card-body" style="padding-top: 16px;">
                    <div style="background: var(--bg-hover); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="font-size: 0.875rem; color: var(--text-secondary);">${selectedPkg.title}</span>
                            <span style="font-weight: 700; color: var(--text-primary);">₹${selectedPkg.price.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                            <span>Escrow Protection & Secure Payment</span>
                            <span style="color: var(--success); font-weight: 600;">Included</span>
                        </div>
                        <div class="divider" style="margin: 10px 0;"></div>
                        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; color: var(--accent);">
                            <span>Total Payable:</span>
                            <span>₹${selectedPkg.price.toLocaleString()}</span>
                        </div>
                    </div>

                    <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 12px;">
                        Select payment method (Simulated Sandbox Gateway):
                    </p>
                    <div class="tabs" style="margin-bottom: 16px;">
                        <button type="button" class="tab active" id="tab-upi">⚡ UPI (GPay / PhonePe / Paytm)</button>
                        <button type="button" class="tab" id="tab-card">💳 Cards / NetBanking</button>
                    </div>

                    <div id="upi-section">
                        <div class="form-group">
                            <label class="form-label">UPI ID / VPA</label>
                            <input type="text" class="form-input" id="checkout-upi-id" placeholder="yourname@okhdfcbank" value="buyer@okhdfcbank">
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" class="btn btn-primary" id="confirm-escrow-pay" style="flex: 1; padding: 12px;">
                            🔒 Pay ₹${selectedPkg.price.toLocaleString()} & Lock in Escrow
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancel-checkout-btn" style="width: auto;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.querySelector('#close-checkout-modal').onclick = close;
        modal.querySelector('#cancel-checkout-btn').onclick = close;

        modal.querySelector('#confirm-escrow-pay').onclick = async () => {
            close();
            showLoading();
            try {
                await apiFetch('/payments/verify', {
                    method: 'POST',
                    body: JSON.stringify({
                        booking_id: orderData.booking_id,
                        razorpay_payment_id: `pay_sim_${Date.now()}`,
                        razorpay_order_id: orderData.order_id,
                        razorpay_signature: 'simulated_signature'
                    })
                });
                showToast(`🎉 Payment of ₹${selectedPkg.price.toLocaleString()} secured in Escrow!`, 'success');
                sessionStorage.removeItem('selected_provider_id');
                sessionStorage.removeItem('selected_package_id');
                router('/bookings');
            } catch (err) {
                showToast('Payment verification failed: ' + err.message, 'error');
            } finally {
                hideLoading();
            }
        };
    }

    window.handleSubmit = handleSubmit;

    function renderCreateBooking() {
        const view = el`<div>
            ${renderAppHeader('/create-booking')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <button class="fiverr-back-btn" onclick="router('/')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span><-- Back to Talent Directory</span>
                    </button>
                    <div class="section-title" style="margin: 0;">Create Booking Order</div>
                </div>
                ${error ? `<div class="toast toast-error" style="margin-bottom: 12px;">${error}</div>` : ''}
                <div class="card" style="max-width: 520px;">
                    <form onsubmit="handleSubmit(event)">
                        <div class="form-group">
                            <label class="form-label">Select Provider</label>
                            <select class="form-select" id="booking-provider" required onchange="filterPackagesByProvider()">
                                <option value="">Choose a provider...</option>
                                ${Object.keys(grouped).map(id => `
                                    <option value="${id}">${grouped[id].provider?.name || `Provider #${id}`}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Package</label>
                            <select class="form-select" id="booking-package" required onchange="updateProviderForPackage()">
                                <option value="">Choose a package...</option>
                                ${packages.map(p => `
                                    <option value="${p.id}" data-provider="${p.provider_id}">
                                        ${p.title} — ₹${p.price.toLocaleString()} (${p.turnaround})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group" id="total-amount" style="display: none; background: var(--bg-hover); padding: 12px 16px; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="form-label" style="margin: 0;">Total Amount (Escrow)</span>
                                <div style="font-size: 1.25rem; font-weight: 700; color: var(--accent);">₹<span id="amount-display">0</span></div>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                                Payment held securely in escrow until you approve delivery
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="display: none; margin-top: 14px;" id="submit-booking">Confirm Booking & Hold Escrow</button>
                    </form>
                </div>
                <div class="card" style="margin-top: 16px; max-width: 520px;">
                    <div class="card-header">
                        <div class="card-title">How Escrow Protection Works</div>
                    </div>
                    <div class="card-body">
                        <ol style="padding-left: 20px; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.6;">
                            <li>Select a provider and package</li>
                            <li>Order is confirmed and payment is held safely in escrow</li>
                            <li>Provider delivers the completed project files</li>
                            <li>You review the work and click <strong>Approve</strong> to release the payout</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>`;
        const form = view.querySelector('form');
        if (form) { form.removeAttribute('onsubmit'); form.addEventListener('submit', handleSubmit); }

        const savedProv = sessionStorage.getItem('selected_provider_id');
        const savedPkg = sessionStorage.getItem('selected_package_id');
        if (savedProv) {
            const provSelect = view.querySelector('#booking-provider');
            if (provSelect) provSelect.value = savedProv;
        }
        if (savedPkg) {
            const pkgSelect = view.querySelector('#booking-package');
            if (pkgSelect) {
                pkgSelect.value = savedPkg;
                setTimeout(() => window.updateProviderForPackage?.(), 0);
            }
        }
        return view;
    }

    window.filterPackagesByProvider = () => {
        const provId = document.getElementById('booking-provider')?.value;
        const pkgSelect = document.getElementById('booking-package');
        if (!pkgSelect) return;
        if (!provId) {
            pkgSelect.innerHTML = '<option value="">Choose a package...</option>' + packages.map(p => `
                <option value="${p.id}" data-provider="${p.provider_id}">
                    ${p.title} — ₹${p.price.toLocaleString()} (${p.turnaround})
                </option>
            `).join('');
            return;
        }
        const filtered = packages.filter(p => p.provider_id === parseInt(provId));
        pkgSelect.innerHTML = '<option value="">Choose a package...</option>' + filtered.map(p => `
            <option value="${p.id}" data-provider="${p.provider_id}">
                ${p.title} — ₹${p.price.toLocaleString()} (${p.turnaround})
            </option>
        `).join('');
        window.updateProviderForPackage();
    };

    window.updateProviderForPackage = () => {
        const pkgSelect = document.getElementById('booking-package');
        const selectedOption = pkgSelect.options[pkgSelect.selectedIndex];
        const providerId = selectedOption.getAttribute('data-provider');

        const amountDisplay = document.getElementById('amount-display');
        const submitBtn = document.getElementById('submit-booking');
        const totalAmountGroup = document.getElementById('total-amount');

        if (providerId && selectedOption.value) {
            const pkg = packages.find(p => p.id === parseInt(selectedOption.value));
            if (pkg) {
                amountDisplay.textContent = pkg.price.toLocaleString();
                totalAmountGroup.style.display = 'block';
                submitBtn.style.display = 'block';
            }
        } else {
            amountDisplay.textContent = '0';
            totalAmountGroup.style.display = 'none';
            submitBtn.style.display = 'none';
        }
    };
}

// =============== PAYMENTS & ESCROW PORTAL ===============
function PaymentsPortal() {
    let payments = [];
    let loading = true;
    let activeFilter = 'all';
    let searchQuery = '';

    async function loadPayments() {
        showLoading();
        try {
            payments = await apiFetch('/payments');
        } catch (e) {
            showToast(e.message || 'Failed to load payments', 'error');
            payments = [];
        } finally {
            loading = false;
            mount(renderPaymentsPortal());
        }
    }

    loadPayments();

    function renderPaymentsPortal() {
        const isBuyer = currentUser?.user_type === 'BUYER' || !currentUser?.user_type;
        const isProvider = currentUser?.user_type === 'PROVIDER';
        const isAdmin = currentUser?.user_type === 'ADMIN';

        // Filter counts
        const heldList = payments.filter(p => p.status === 'held' || p.status === 'held_in_escrow');
        const releasedList = payments.filter(p => p.status === 'released');
        const pendingList = payments.filter(p => p.status === 'pending');
        const refundedList = payments.filter(p => p.status === 'refunded' || p.status === 'disputed');

        // Financial Metrics based on role
        let stat1 = { label: 'Total Volume', value: '₹0', subtext: '0 transactions', icon: '💳' };
        let stat2 = { label: 'In Escrow', value: '₹0', subtext: 'Protected funds', icon: '🔒' };
        let stat3 = { label: 'Released', value: '₹0', subtext: 'Direct to bank', icon: '🏦' };
        let stat4 = { label: 'Total Transactions', value: '0', subtext: 'Orders processed', icon: '📦' };

        if (isAdmin) {
            const gmv = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
            const comm = payments.reduce((acc, p) => acc + (p.platform_commission || 0), 0);
            const payouts = payments.reduce((acc, p) => acc + (p.provider_payout || 0), 0);
            const inEscrow = heldList.reduce((acc, p) => acc + (p.amount || 0), 0);

            stat1 = { label: 'Gross Merchandise Value', value: `₹${gmv.toLocaleString()}`, subtext: `${payments.length} total orders`, icon: '🌐' };
            stat2 = { label: 'Platform Revenue (20%)', value: `₹${comm.toLocaleString()}`, subtext: 'Earned marketplace commission', icon: '🏦' };
            stat3 = { label: '80% Provider Payouts', value: `₹${payouts.toLocaleString()}`, subtext: `${releasedList.length} released orders`, icon: '💸' };
            stat4 = { label: 'Active Escrow Vault', value: `₹${inEscrow.toLocaleString()}`, subtext: `${heldList.length} orders in escrow`, icon: '🔒' };
        } else if (isProvider) {
            const netEarnings = releasedList.reduce((acc, p) => acc + (p.provider_payout || 0), 0);
            const escrowEarnings = heldList.reduce((acc, p) => acc + (p.provider_payout || 0), 0);
            const platformFee = payments.reduce((acc, p) => acc + (p.platform_commission || 0), 0);

            stat1 = { label: 'Net Earnings (80%)', value: `₹${netEarnings.toLocaleString()}`, subtext: 'Released to your bank', icon: '💰' };
            stat2 = { label: 'Pending in Escrow', value: `₹${escrowEarnings.toLocaleString()}`, subtext: 'Locked until client approval', icon: '⏳' };
            stat3 = { label: 'Platform Fee (20%)', value: `₹${platformFee.toLocaleString()}`, subtext: '20% platform escrow fee', icon: '🏷️' };
            stat4 = { label: 'Completed Orders', value: releasedList.length.toString(), subtext: `${heldList.length} ongoing in escrow`, icon: '✅' };
        } else {
            // Buyer
            const totalSpent = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
            const inEscrow = heldList.reduce((acc, p) => acc + (p.amount || 0), 0);
            const pendingAmount = pendingList.reduce((acc, p) => acc + (p.amount || 0), 0);

            stat1 = { label: 'Total Paid', value: `₹${totalSpent.toLocaleString()}`, subtext: `${payments.length} total bookings`, icon: '💳' };
            stat2 = { label: 'Protected in Escrow', value: `₹${inEscrow.toLocaleString()}`, subtext: '100% safe until delivery', icon: '🛡️' };
            stat3 = { label: 'Completed Orders', value: releasedList.length.toString(), subtext: 'Approved & released', icon: '🎉' };
            stat4 = { label: 'Pending Checkout', value: `₹${pendingAmount.toLocaleString()}`, subtext: `${pendingList.length} orders awaiting payment`, icon: '⏳' };
        }

        // Filter and Search
        let filtered = payments;
        if (activeFilter === 'held') {
            filtered = heldList;
        } else if (activeFilter === 'released') {
            filtered = releasedList;
        } else if (activeFilter === 'pending') {
            filtered = pendingList;
        } else if (activeFilter === 'refunded') {
            filtered = refundedList;
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(p => {
                const pkg = (p.package_title || '').toLowerCase();
                const buyer = (p.buyer_name || '').toLowerCase();
                const prov = (p.provider_name || '').toLowerCase();
                const txn = (p.gateway_txn_id || '').toLowerCase();
                const bid = `booking #${p.booking_id}`.toLowerCase();
                return pkg.includes(q) || buyer.includes(q) || prov.includes(q) || txn.includes(q) || bid.includes(q);
            });
        }

        return el`<div>
            ${renderAppHeader('/payments')}
            <div class="payments-container">
                <!-- Page Navigation -->
                <div class="fiverr-nav-top" style="margin-top: 14px; margin-bottom: 8px;">
                    <button class="fiverr-back-btn" onclick="router('/')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span><-- Back to Dashboard</span>
                    </button>
                    <button class="fiverr-back-btn" onclick="router('/')" style="opacity: 0.85;">
                        <span>🌟 Browse Talent</span>
                    </button>
                </div>

                <!-- Page Header -->
                <div class="payments-header" style="margin-top: 14px;">
                    <div class="payments-title-group">
                        <h1>
                            <span>💳 Payments & Escrow Hub</span>
                        </h1>
                        <p>100% Escrow Protection Guarantee • 80% Provider Payout • 20% Platform Fee</p>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="badge badge-success" style="font-size: 0.8rem; padding: 6px 12px;">🛡️ Bank-Grade Escrow Vault</span>
                        <button class="btn btn-secondary btn-sm" onclick="PaymentsPortal.refresh()">🔄 Refresh</button>
                    </div>
                </div>

                <!-- Escrow Explainer Banner -->
                <div class="escrow-guarantee-banner">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 1.2rem;">🔒</span> How Escrow & 80/20 Revenue Split Works
                        </div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Zero Risk for Buyers • Guaranteed Payout for Creators</span>
                    </div>
                    <div class="escrow-steps-grid">
                        <div class="escrow-step-item">
                            <div class="escrow-step-number">1</div>
                            <div class="escrow-step-text">
                                <h4>Payment Locked in Escrow</h4>
                                <p>Buyer books service with Razorpay (UPI/Cards). Funds are safely held in escrow vault.</p>
                            </div>
                        </div>
                        <div class="escrow-step-item">
                            <div class="escrow-step-number">2</div>
                            <div class="escrow-step-text">
                                <h4>Creator Works & Delivers</h4>
                                <p>Editor/Tutor delivers work and project files. Buyer reviews revisions and final result.</p>
                            </div>
                        </div>
                        <div class="escrow-step-item">
                            <div class="escrow-step-number">3</div>
                            <div class="escrow-step-text">
                                <h4>Instant Split Release</h4>
                                <p>Buyer approves: <strong>80% is paid to Provider</strong> bank account & <strong>20% platform commission</strong> is routed to owner.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Financial Stats Cards -->
                <div class="payment-stats-grid">
                    <div class="payment-stat-card">
                        <div class="payment-stat-top">
                            <span class="payment-stat-label">${stat1.label}</span>
                            <div class="payment-stat-icon">${stat1.icon}</div>
                        </div>
                        <div class="payment-stat-value">${stat1.value}</div>
                        <div class="payment-stat-subtext">${stat1.subtext}</div>
                    </div>
                    <div class="payment-stat-card">
                        <div class="payment-stat-top">
                            <span class="payment-stat-label">${stat2.label}</span>
                            <div class="payment-stat-icon">${stat2.icon}</div>
                        </div>
                        <div class="payment-stat-value" style="color: #6c5ce7;">${stat2.value}</div>
                        <div class="payment-stat-subtext">${stat2.subtext}</div>
                    </div>
                    <div class="payment-stat-card">
                        <div class="payment-stat-top">
                            <span class="payment-stat-label">${stat3.label}</span>
                            <div class="payment-stat-icon">${stat3.icon}</div>
                        </div>
                        <div class="payment-stat-value" style="color: var(--success);">${stat3.value}</div>
                        <div class="payment-stat-subtext">${stat3.subtext}</div>
                    </div>
                    <div class="payment-stat-card">
                        <div class="payment-stat-top">
                            <span class="payment-stat-label">${stat4.label}</span>
                            <div class="payment-stat-icon">${stat4.icon}</div>
                        </div>
                        <div class="payment-stat-value">${stat4.value}</div>
                        <div class="payment-stat-subtext">${stat4.subtext}</div>
                    </div>
                </div>

                <!-- Filter & Search Bar -->
                <div class="payment-filters-bar">
                    <div class="payment-tabs">
                        <button class="payment-tab-btn ${activeFilter === 'all' ? 'active' : ''}" onclick="PaymentsPortal.setFilter('all')">
                            All (${payments.length})
                        </button>
                        <button class="payment-tab-btn ${activeFilter === 'held' ? 'active' : ''}" onclick="PaymentsPortal.setFilter('held')">
                            🔒 In Escrow (${heldList.length})
                        </button>
                        <button class="payment-tab-btn ${activeFilter === 'released' ? 'active' : ''}" onclick="PaymentsPortal.setFilter('released')">
                            ✅ Released (${releasedList.length})
                        </button>
                        <button class="payment-tab-btn ${activeFilter === 'pending' ? 'active' : ''}" onclick="PaymentsPortal.setFilter('pending')">
                            ⏳ Pending (${pendingList.length})
                        </button>
                        ${refundedList.length > 0 ? `
                        <button class="payment-tab-btn ${activeFilter === 'refunded' ? 'active' : ''}" onclick="PaymentsPortal.setFilter('refunded')">
                            ↩️ Refunded (${refundedList.length})
                        </button>` : ''}
                    </div>

                    <div class="payment-search-box" style="position: relative; min-width: 260px; max-width: 360px; flex: 1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" id="payment-search-icon">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input 
                            type="text" 
                            id="payment-search-input" 
                            placeholder="Search transactions..." 
                            value="${searchQuery || ''}" 
                            oninput="PaymentsPortal.setSearch(this.value)" 
                            autocomplete="off"
                        />
                        ${searchQuery ? `
                            <button type="button" onclick="PaymentsPortal.setSearch('')" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.95rem; line-height: 1; padding: 2px;" title="Clear search">✕</button>
                        ` : ''}
                    </div>
                </div>

                <!-- Transactions List -->
                ${filtered.length === 0 ? `
                    <div class="card" style="padding: 40px 20px; text-align: center;">
                        <div class="empty-state">
                            <div style="font-size: 2.5rem; margin-bottom: 12px;">💳</div>
                            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 8px;">No transactions found</h3>
                            <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto 18px; font-size: 0.875rem;">
                                ${isProvider
                    ? 'When clients book your services, payments will appear here safely held in escrow until completion.'
                    : 'When you book talent, your payments will be protected in escrow until you approve the finished work.'}
                            </p>
                            ${isProvider
                    ? '<button class="btn btn-primary btn-sm" onclick="router(\'/packages\')">Manage Packages</button>'
                    : '<button class="btn btn-primary btn-sm" onclick="router(\'/providers\')">Browse Talent & Book</button>'}
                        </div>
                    </div>
                ` : `
                    <div class="payment-transactions-list">
                        ${filtered.map(p => renderTransactionCard(p, isBuyer, isProvider, isAdmin)).join('')}
                    </div>
                `}
            </div>
        </div>`;
    }

    function renderTransactionCard(p, isBuyer, isProvider, isAdmin) {
        const isHeld = p.status === 'held' || p.status === 'held_in_escrow';
        const isReleased = p.status === 'released';
        const isPending = p.status === 'pending';
        const isRefunded = p.status === 'refunded' || p.status === 'disputed';

        let badgeClass = 'badge-escrow-held';
        let badgeText = '🔒 Held in Escrow';
        if (isReleased) {
            badgeClass = 'badge-escrow-released';
            badgeText = '✅ Released to Bank';
        } else if (isPending) {
            badgeClass = 'badge-escrow-pending';
            badgeText = '⏳ Pending Payment';
        } else if (isRefunded) {
            badgeClass = 'badge-escrow-refunded';
            badgeText = '↩️ Refunded';
        }

        const txnCode = p.gateway_txn_id || `TXN-${String(p.id).padStart(6, '0')}`;
        const dateStr = new Date(p.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
        <div class="txn-card">
            <div class="txn-card-header">
                <div class="txn-id-date">
                    <span class="txn-code">${txnCode}</span>
                    <span class="txn-date">${dateStr}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">• Booking #${p.booking_id}</span>
                </div>
                <div>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>
            </div>

            <div class="txn-body-grid">
                <div class="txn-service-info">
                    <h4>📦 ${p.package_title || 'Service Booking'}</h4>
                    <p>Protected by 100% Escrow Guarantee</p>
                </div>

                <div class="txn-parties">
                    <div>Client: <strong>${p.buyer_name || 'Client'}</strong></div>
                    <div>Provider: <strong>${p.provider_name || 'Provider'}</strong></div>
                </div>

                <div class="txn-financial-breakdown">
                    <div class="txn-amount-total">₹${p.amount.toLocaleString()}</div>
                    <div class="txn-split-details">
                        Provider 80%: <strong>₹${(p.provider_payout || (p.amount * 0.8)).toLocaleString()}</strong><br>
                        Platform Fee: <strong>₹0</strong>
                    </div>
                </div>
            </div>

            <div class="txn-actions-row">
                <button class="btn btn-secondary btn-sm" onclick="PaymentsPortal.showInvoice(${p.id})">
                    📄 View Tax Invoice & Escrow Receipt
                </button>
                <button class="btn btn-secondary btn-sm" onclick="openBookingChat(${p.booking_id}, '${isBuyer ? (p.provider_name || 'Provider') : (p.buyer_name || 'Client')}')">
                    💬 Project Chat
                </button>

                ${isHeld && isBuyer && (p.booking_status === 'delivered' || p.booking_status === 'pending_approval') ? `
                    <button class="btn btn-success btn-sm" onclick="PaymentsPortal.approveAndRelease(${p.booking_id})">
                        ✅ Approve & Release 80% Payout
                    </button>
                ` : ''}

                ${isPending && isBuyer ? `
                    <button class="btn btn-primary btn-sm" onclick="PaymentsPortal.payPendingOrder(${p.booking_id}, ${p.amount})">
                        💳 Pay Now & Secure in Escrow
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="PaymentsPortal.cancelPending(${p.booking_id})">
                        ✕ Cancel
                    </button>
                ` : ''}
            </div>
        </div>`;
    }

    PaymentsPortal.cancelPending = async (bookingId) => {
        if (!confirm('Cancel this unpaid order?')) return;
        showLoading();
        try {
            await apiFetch(`/bookings/${bookingId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'cancelled' })
            });
            showToast('Order cancelled.', 'info');
            loadPayments();
        } catch (e) {
            showToast(e.message, 'error');
            loadPayments();
        }
    };

    PaymentsPortal.setFilter = (filter) => {
        activeFilter = filter;
        mount(renderPaymentsPortal());
    };

    PaymentsPortal.setSearch = (val) => {
        searchQuery = val;
        mount(renderPaymentsPortal());
        const input = document.getElementById('payment-search-input');
        if (input) {
            input.focus();
            try {
                input.setSelectionRange(input.value.length, input.value.length);
            } catch (_) {}
        }
    };

    PaymentsPortal.toggleSearchCard = () => {};

    PaymentsPortal.refresh = () => {
        loadPayments();
    };

    PaymentsPortal.showInvoice = (paymentId) => {
        const p = payments.find(item => item.id === paymentId);
        if (!p) return;
        showInvoiceModal(p);
    };

    PaymentsPortal.approveAndRelease = async (bookingId) => {
        if (!confirm('Approve this delivery and release full payment to provider?')) return;
        showLoading();
        try {
            await apiFetch(`/bookings/${bookingId}/approve`, { method: 'POST' });
            showToast('🎉 Delivery approved! Full payment released to provider.', 'success');
            loadPayments();
        } catch (e) {
            showToast(e.message, 'error');
            loadPayments();
        }
    };

    PaymentsPortal.payPendingOrder = async (bookingId, amount) => {
        showLoading();
        try {
            const rzpKey = window.publicConfig?.razorpay_key_id && window.publicConfig.razorpay_key_id !== 'rzp_test_placeholder'
                ? window.publicConfig.razorpay_key_id
                : 'rzp_test_placeholder';

            const amountPaise = Math.round(amount * 100);

            if (typeof Razorpay !== 'undefined') {
                const options = {
                    key: rzpKey,
                    amount: amountPaise,
                    currency: "INR",
                    name: "Groove Hub",
                    description: `Booking #${bookingId} (100% Escrow Protected)`,
                    image: "/static/icons/icon-192.png",
                    prefill: {
                        name: currentUser?.name || 'Client',
                        email: currentUser?.email || 'client@example.com',
                        contact: currentUser?.phone || '9999999999'
                    },
                    theme: { color: "#6c5ce7" },
                    handler: async function (response) {
                        showLoading();
                        try {
                            await apiFetch('/payments/verify', {
                                method: 'POST',
                                body: JSON.stringify({
                                    booking_id: bookingId,
                                    razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                                    razorpay_order_id: response.razorpay_order_id || `order_${bookingId}`,
                                    razorpay_signature: response.razorpay_signature || ''
                                })
                            });
                            showToast(`🎉 Payment of ₹${amount.toLocaleString()} secured in Escrow!`, 'success');
                            loadPayments();
                        } catch (err) {
                            showToast('Payment verification failed: ' + err.message, 'error');
                        } finally {
                            hideLoading();
                        }
                    }
                };
                const rzp = new Razorpay(options);
                rzp.open();
                hideLoading();
            } else {
                hideLoading();
                if (confirm(`Confirm simulated payment of ₹${amount.toLocaleString()} into Escrow?`)) {
                    showLoading();
                    await apiFetch('/payments/verify', {
                        method: 'POST',
                        body: JSON.stringify({
                            booking_id: bookingId,
                            razorpay_payment_id: `pay_sim_${Date.now()}`,
                            razorpay_order_id: `order_${bookingId}`,
                            razorpay_signature: 'simulated_sig'
                        })
                    });
                    showToast(`🎉 Payment of ₹${amount.toLocaleString()} secured in Escrow!`, 'success');
                    loadPayments();
                }
            }
        } catch (e) {
            hideLoading();
            showToast(e.message, 'error');
        }
    };

    function showInvoiceModal(p) {
        const modal = document.createElement('div');
        modal.className = 'invoice-modal-overlay';

        const isHeld = p.status === 'held' || p.status === 'held_in_escrow';
        const isReleased = p.status === 'released';
        const isPending = p.status === 'pending';

        let statusText = '🔒 HELD IN ESCROW';
        let statusColor = '#6c5ce7';
        if (isReleased) {
            statusText = '✅ RELEASED TO BANK';
            statusColor = '#00b894';
        } else if (isPending) {
            statusText = '⏳ PENDING PAYMENT';
            statusColor = '#e17055';
        }

        const dateStr = new Date(p.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const invoiceNumber = `INV-EM-${String(p.id).padStart(6, '0')}`;
        const txnId = p.gateway_txn_id || `pay_sim_${p.id}_${Date.now()}`;

        modal.innerHTML = `
            <div class="invoice-modal-card">
                <div class="invoice-modal-header">
                    <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                        <span>📄 Official Tax Invoice & Escrow Receipt</span>
                    </div>
                    <button id="close-invoice-modal-btn" style="background: transparent; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer;">✕</button>
                </div>

                <div class="invoice-modal-body">
                    <div class="invoice-paper">
                        <div class="invoice-paper-header">
                            <div>
                                <span class="brand-title">Groove Hub</span>
                                <div style="font-size: 0.75rem; color: #636e72; margin-top: 2px;">
                                    Premier Video Editing & Tutoring Platform<br>
                                    Escrow Protected Commercial Hub
                                </div>
                            </div>
                            <div class="doc-title">
                                <h2>TAX INVOICE / RECEIPT</h2>
                                <span><strong>${invoiceNumber}</strong></span><br>
                                <span>Date: ${dateStr}</span>
                            </div>
                        </div>

                        <div class="invoice-meta-grid">
                            <div class="invoice-meta-block">
                                <h5>Billed To (Buyer / Client)</h5>
                                <p><strong>${p.buyer_name || 'Client'}</strong></p>
                                <p>${p.buyer_email || 'client@editormarketplace.com'}</p>
                                ${p.buyer_phone ? `<p>Phone: ${p.buyer_phone}</p>` : ''}
                            </div>
                            <div class="invoice-meta-block">
                                <h5>Service Provider / Creator</h5>
                                <p><strong>${p.provider_name || 'Provider'}</strong></p>
                                <p>Booking Reference: #BK-${p.booking_id}</p>
                                <p>Gateway Txn: <span style="font-family: monospace; font-size: 0.8rem;">${txnId}</span></p>
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <span style="font-size: 0.75rem; font-weight: 700; color: ${statusColor}; background: ${statusColor}18; padding: 4px 10px; border-radius: 999px; border: 1px solid ${statusColor}40;">
                                STATUS: ${statusText}
                            </span>
                        </div>

                        <table class="invoice-items-table">
                            <thead>
                                <tr>
                                    <th>Description / Service</th>
                                    <th style="text-align: right;">Rate / Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>${p.package_title || 'Creative Service Package'}</strong><br>
                                        <span style="font-size: 0.75rem; color: #636e72;">Booking #${p.booking_id} • 100% Escrow Protection</span>
                                    </td>
                                    <td style="text-align: right; font-weight: 600;">₹${p.amount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 0.8rem; color: #636e72; padding-left: 20px;">
                                        ↳ Provider Earnings (80% Direct Payout)
                                    </td>
                                    <td style="text-align: right; font-size: 0.8rem; color: #636e72;">
                                        ₹${(p.provider_payout || (p.amount * 0.8)).toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-size: 0.8rem; color: #636e72; padding-left: 20px;">
                                        ↳ Platform Fee (₹0)
                                    </td>
                                    <td style="text-align: right; font-size: 0.8rem; color: #636e72;">
                                        ₹0
                                    </td>
                                </tr>
                                <tr class="total-row">
                                    <td>Total Amount Paid</td>
                                    <td style="text-align: right;">₹${p.amount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="invoice-escrow-seal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                            <div>
                                <strong>100% Escrow Protected Transaction</strong><br>
                                Funds are safely held in escrow until the client reviews and approves final delivery. For any queries, contact support@editormarketplace.com.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="invoice-modal-footer">
                    <button class="btn btn-secondary" id="print-invoice-btn">
                        🖨️ Print / Save as PDF
                    </button>
                    <button class="btn btn-primary" id="dismiss-invoice-btn">
                        Done
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => modal.remove();
        modal.querySelector('#close-invoice-modal-btn').onclick = close;
        modal.querySelector('#dismiss-invoice-btn').onclick = close;
        modal.querySelector('#print-invoice-btn').onclick = () => {
            window.print();
        };
    }
}
window.PaymentsPortal = PaymentsPortal;

// =============== PROVIDERS LIST ===============

// Search & filter state
let providerSearchState = {
    q: '',
    niche: '',
    subType: '',          // selected subclassification (video type, lesson type, or writing type)
    serviceOption: '',
    sellerDetail: '',
    budget: '',
    deliveryTime: '',
    minRating: '',
    sortBy: 'rating',
    proOnly: false,
    onlineOnly: false
};

const fiverrCategoryConfigs = {
    'editors_animators': {
        niche: 'editors_animators',
        title: 'Video Editing',
        parentCategory: 'Video & Animation',
        description: 'Create or improve your videos with video editing and post-production services.',
        selectTypeLabel: 'Select video type',
        searchPlaceholder: 'Search video editing, shorts, YouTube, Premiere Pro, motion design...',
        types: [
            { id: '', label: 'All Video Types', icon: '✨' },
            { id: 'youtube', label: 'YouTube & Long-form', icon: '📺', keywords: ['youtube', 'long-form', 'vlog', 'retention', 'mrbeast', 'podcast', 'documentary', 'shorts'] },
            { id: 'ads_social', label: 'Social Ads & Reels', icon: '📱', keywords: ['ads', 'social', 'tiktok', 'reels', 'shorts', 'meta', 'instagram', 'ad', 'ugc', 'hook'] },
            { id: 'gaming', label: 'Gaming & Stream Edits', icon: '🎮', keywords: ['gaming', 'twitch', 'montage', 'meme', 'stream', 'gameplay', 'valorant', 'gta', 'esports', 'minecraft', 'highlight'] },
            { id: 'animations', label: '2D/3D Animations', icon: '🎨', keywords: ['animation', '2d', '3d', 'character', 'whiteboard', 'explainer', 'blender', 'animated'] },
            { id: 'motion_graphics', label: 'Motion Graphics & VFX', icon: '✨', keywords: ['motion graphics', 'motion', 'vfx', 'after effects', 'intro', 'titles', 'visual effects'] },
            { id: 'music', label: 'Music Videos & Cinematic', icon: '🎬', keywords: ['music', 'rap', 'beat-sync', 'trippy', 'vfx', 'cinematic', 'band', 'song', 'hip-hop'] },
            { id: 'corporate', label: 'Corporate & Commercials', icon: '🏢', keywords: ['corporate', 'b2b', 'commercial', 'brand', 'presentation', 'business', 'event', 'promo'] }
        ],
        serviceOptions: [
            { id: '', label: 'All Styles & Services' },
            { id: 'youtube_cuts', label: '📺 YouTube Long-form & Retention Cuts', match: ['youtube', 'long-form', 'vlog', 'podcast', 'retention'] },
            { id: 'social_ads_reels', label: '📱 Social Ads, Reels & TikTok Hooks', match: ['ad', 'social', 'reel', 'short', 'tiktok', 'ugc', 'meta'] },
            { id: 'gaming_montages', label: '🎮 Gaming Montages & Stream Highlights', match: ['gaming', 'gameplay', 'montage', 'stream', 'twitch', 'esports'] },
            { id: '2d_3d_animation', label: '🎨 2D & 3D Character Animation', match: ['animation', '2d', '3d', 'animated', 'character', 'explainer'] },
            { id: 'motion_vfx', label: '✨ Motion Graphics, Intros & VFX', match: ['motion', 'after effects', 'vfx', 'visual effects', 'graphics'] },
            { id: 'color_grading', label: '🌈 Color Grading & Cinematic LUTs', match: ['color', 'grade', 'lut', 'davinci', 'cinematic'] },
            { id: 'sound_design', label: '🔊 Sound Design & SFX Audio Mixing', match: ['sound', 'audio', 'sfx', 'mix', 'voiceover', 'music'] },
            { id: 'corporate_promo', label: '🏢 Corporate Commercials & Promos', match: ['corporate', 'commercial', 'brand', 'b2b', 'promo'] }
        ],
        sellerDetails: [
            { id: '', label: 'Any Seller' },
            { id: 'top_rated', label: '⭐ Top Rated (4.9+)' },
            { id: 'level_2', label: '💎 Level 2 (30+ Orders)' },
            { id: 'pro_verified', label: '👑 Pro Verified' },
            { id: 'fast_turnaround', label: '⚡ 24h Turnaround' }
        ],
        budgets: [
            { id: '', label: 'Any Budget' },
            { id: 'under2000', label: 'Under ₹2,000' },
            { id: '2000to5000', label: '₹2,000 - ₹5,000' },
            { id: 'above5000', label: '₹5,000+' }
        ],
        deliveryTimes: [
            { id: '', label: 'Any Delivery Time' },
            { id: '24h', label: '⚡ 24 Hours' },
            { id: '3d', label: '⏱️ Up to 3 Days' },
            { id: '7d', label: '📅 Up to 7 Days' }
        ],
        defaultBadge: 'PRO VIDEO EDITING',
        primaryBtnText: 'Book Talent',
        secondaryBtnText: '🎨 Showreel',
        showreelLabel: 'Featured Video Editing Reel',
        unitLabel: 'project'
    },

    'tutors': {
        niche: 'tutors',
        title: 'English Tutoring & Coaching',
        parentCategory: 'Language & Lessons',
        description: 'Master conversational fluency, IELTS/TOEFL exam prep, business communication, and interview coaching with certified English coaches.',
        selectTypeLabel: 'Select lesson type',
        searchPlaceholder: 'Search IELTS, conversational English, business fluency, accent training...',
        types: [
            { id: '', label: 'All Lesson Types', icon: '✨' },
            { id: 'conversational', label: 'Conversational English', icon: '🗣️', keywords: ['conversational', 'fluency', 'speaking', 'small talk', 'vocabulary'] },
            { id: 'ielts_toefl', label: 'IELTS & TOEFL Prep', icon: '🎓', keywords: ['ielts', 'toefl', 'exam', 'band', 'cambridge', 'test'] },
            { id: 'business_english', label: 'Business English', icon: '💼', keywords: ['business', 'executive', 'presentation', 'corporate', 'meeting', 'negotiation'] },
            { id: 'interview_prep', label: 'Interview Coaching', icon: '🎯', keywords: ['interview', 'mock', 'star', 'faang', 'behavioral', 'q&a'] },
            { id: 'kids_english', label: 'English for Kids', icon: '👶', keywords: ['kids', 'children', 'phonics', 'storytelling', 'beginner', 'games'] },
            { id: 'accent_training', label: 'Accent Neutralization', icon: '🎙️', keywords: ['accent', 'neutralization', 'pronunciation', 'intonation', 'speech', 'vowel'] }
        ],
        serviceOptions: [
            { id: '', label: 'All Lessons' },
            { id: 'speaking', label: '1-on-1 Speaking Practice', match: ['speaking', 'conversational', 'fluency'] },
            { id: 'exam_prep', label: 'IELTS Mock Test & Scoring', match: ['ielts', 'toefl', 'exam', 'mock'] },
            { id: 'accent', label: 'Accent & Speech Clinic', match: ['accent', 'pronunciation', 'vowel'] },
            { id: 'executive', label: 'Executive Business Drill', match: ['business', 'executive', 'presentation'] },
            { id: 'interview', label: 'Job Interview Simulation', match: ['interview', 'behavioral', 'star'] }
        ],
        sellerDetails: [],
        budgets: [
            { id: '', label: 'Any Budget' },
            { id: 'under1000', label: 'Under ₹1,000 / session' },
            { id: '1000to2000', label: '₹1,000 - ₹2,000 / session' },
            { id: 'above2000', label: '₹2,000+ / session' }
        ],
        deliveryTimes: [
            { id: '', label: 'Any Availability' },
            { id: 'flexible', label: '🗓️ Flexible Schedule' }
        ],
        defaultBadge: 'CERTIFIED ENGLISH COACH',
        primaryBtnText: 'Book Lesson',
        secondaryBtnText: '🎧 Sample Class',
        showreelLabel: 'Live Class Recording Sample',
        unitLabel: 'session'
    },

    'writers': {
        niche: 'writers',
        title: 'Content & Copywriting',
        parentCategory: 'Writing & Translation',
        description: 'Grow your traffic and sales with high-ranking SEO blog posts, high-converting landing page copy, viral social posts, and email newsletters.',
        selectTypeLabel: 'Select writing type',
        searchPlaceholder: 'Search SEO articles, website copywriting, email sequences, video scripts...',
        types: [
            { id: '', label: 'All Writing Types', icon: '✨' },
            { id: 'seo_articles', label: 'SEO Blog Posts & Articles', icon: '📝', keywords: ['seo', 'blog', 'article', 'surfer', 'keyword', 'ranking'] },
            { id: 'landing_copy', label: 'Website Copy & Landing Pages', icon: '🚀', keywords: ['website', 'landing page', 'copy', 'hero', 'conversion', 'saas', 'sales'] },
            { id: 'social_copy', label: 'Social Media & Ad Copy', icon: '📱', keywords: ['social', 'ad', 'linkedin', 'twitter', 'meta', 'viral', 'hook', 'facebook'] },
            { id: 'email_copy', label: 'Email Marketing & Newsletters', icon: '📧', keywords: ['email', 'newsletter', 'sequence', 'outreach', 'klaviyo', 'drip'] },
            { id: 'video_scripts', label: 'YouTube & Video Scripts', icon: '🎬', keywords: ['script', 'youtube', 'storytelling', 'retention', 'video script', 'b-roll'] },
            { id: 'tech_creative', label: 'Creative & Technical Writing', icon: '📖', keywords: ['technical', 'whitepaper', 'case study', 'ebook', 'research', 'report'] }
        ],
        serviceOptions: [
            { id: '', label: 'All Writing Formats' },
            { id: 'seo_blog', label: 'SEO Articles & Long-form', match: ['seo', 'blog', 'article'] },
            { id: 'sales_copy', label: 'Landing Page & Sales Copy', match: ['landing', 'copy', 'sales', 'website'] },
            { id: 'social_ads', label: 'Viral Social Posts & Ad Hooks', match: ['social', 'linkedin', 'twitter', 'ad'] },
            { id: 'email_drip', label: 'Email Flows & Newsletters', match: ['email', 'newsletter', 'sequence'] },
            { id: 'scripts', label: 'YouTube & Video Scripting', match: ['script', 'youtube', 'video'] },
            { id: 'case_studies', label: 'Whitepapers & Case Studies', match: ['whitepaper', 'case study', 'technical'] }
        ],
        sellerDetails: [],
        budgets: [
            { id: '', label: 'Any Budget' },
            { id: 'under1500', label: 'Under ₹1,500' },
            { id: '1500to3500', label: '₹1,500 - ₹3,500' },
            { id: 'above3500', label: '₹3,500+' }
        ],
        deliveryTimes: [
            { id: '', label: 'Any Delivery Time' },
            { id: '24h', label: '⚡ 24 Hours' },
            { id: '3d', label: '⏱️ Up to 3 Days' },
            { id: '7d', label: '📅 Up to 7 Days' }
        ],
        defaultBadge: 'PRO VERIFIED COPYWRITER',
        primaryBtnText: 'Hire Writer',
        secondaryBtnText: '📄 Read Sample',
        showreelLabel: 'Published Writing Portfolio & Case Studies',
        unitLabel: 'deliverable'
    }
};

const providerCategoryOptionsMap = {
    all: [
        { label: 'Video Editors & Animators', query: 'editors' },
        { label: 'English Tutors & Coaches', query: 'tutors' },
        { label: 'Scriptwriters & Copywriters', query: 'writers' },
        { label: 'YouTube Shorts & Reels', query: 'shorts' },
        { label: 'IELTS Band 8+ Prep', query: 'ielts' },
        { label: 'Gaming Montages & VFX', query: 'gaming' },
        { label: '2D & 3D Animation', query: 'animation' }
    ],
    editors_animators: [
        { label: 'Social Ads & Reels', query: 'ads' },
        { label: 'Gaming Montages', query: 'gaming' },
        { label: 'YouTube Longform', query: 'youtube' },
        { label: '2D & 3D Animation', query: 'animation' },
        { label: 'Motion Graphics VFX', query: 'vfx' },
        { label: 'Cinematic Color Grading', query: 'cinematic' },
        { label: 'Premiere Pro & After Effects', query: 'premiere' },
        { label: '24h Rush Delivery', query: 'rush' }
    ],
    tutors: [
        { label: 'IELTS & TOEFL Prep', query: 'ielts' },
        { label: 'Accent Reduction', query: 'accent' },
        { label: 'Business English Drill', query: 'business' },
        { label: 'Daily Fluency Practice', query: 'conversational' },
        { label: 'Job Interview Coaching', query: 'interview' },
        { label: 'Instant Trial Lesson', query: 'trial' }
    ],
    writers: [
        { label: 'YouTube Video Scripts', query: 'youtube scripts' },
        { label: 'Social Ad Copy & Hooks', query: 'ad copy' },
        { label: 'SEO Blog Posts & Articles', query: 'seo' },
        { label: 'Social Media Captions', query: 'captions' },
        { label: 'Email Newsletters', query: 'newsletter' },
        { label: '24h Rush Scripts', query: 'rush' }
    ]
};
window.__providerCategoryOptionsMap = providerCategoryOptionsMap;

// (getCategoryPeekIconSvg is globally defined with size and animation support)

function renderLeftEdgePeekDock(activeNiche = '') {
    return `<div class="left-edge-peek-dock" id="left-edge-peek-dock" aria-label="Category Quick Peek Switcher">
        <div class="peek-dock-item peek-item-video ${activeNiche === 'editors_animators' ? 'active' : ''}" 
             onclick="setProviderNiche('editors_animators')" 
             title="Video Editing (Reels, Ads, YouTube)">
            <div class="peek-dock-tab">
                <span class="peek-edge-strip"></span>
                <div class="peek-icon-bubble">
                    ${getCategoryPeekIconSvg('editors_animators')}
                </div>
                <div class="peek-text-group">
                    <div class="peek-title">Video Editing ${activeNiche === 'editors_animators' ? '<span class="peek-active-indicator"></span>' : ''}</div>
                    <div class="peek-subtitle">Reels, YouTube, Ads</div>
                </div>
            </div>
        </div>

        <div class="peek-dock-item peek-item-tutor ${activeNiche === 'tutors' ? 'active' : ''}" 
             onclick="setProviderNiche('tutors')" 
             title="English Tutors (Fluency, IELTS, Accent)">
            <div class="peek-dock-tab">
                <span class="peek-edge-strip"></span>
                <div class="peek-icon-bubble">
                    ${getCategoryPeekIconSvg('tutors')}
                </div>
                <div class="peek-text-group">
                    <div class="peek-title">English Tutors ${activeNiche === 'tutors' ? '<span class="peek-active-indicator"></span>' : ''}</div>
                    <div class="peek-subtitle">Fluency, IELTS, Accent</div>
                </div>
            </div>
        </div>

        <div class="peek-dock-item peek-item-writer ${activeNiche === 'writers' ? 'active' : ''}" 
             onclick="setProviderNiche('writers')" 
             title="Writing &amp; Copywriting (SEO, Scripts, Blogs)">
            <div class="peek-dock-tab">
                <span class="peek-edge-strip"></span>
                <div class="peek-icon-bubble">
                    ${getCategoryPeekIconSvg('writers')}
                </div>
                <div class="peek-text-group">
                    <div class="peek-title">Content &amp; Copy ${activeNiche === 'writers' ? '<span class="peek-active-indicator"></span>' : ''}</div>
                    <div class="peek-subtitle">SEO, Scripts, Blogs</div>
                </div>
            </div>
        </div>

        <div class="peek-dock-item peek-item-all ${!activeNiche ? 'active' : ''}" 
             onclick="setProviderNiche('')" 
             title="All Verified Talent">
            <div class="peek-dock-tab">
                <span class="peek-edge-strip"></span>
                <div class="peek-icon-bubble">
                    ${getCategoryPeekIconSvg('')}
                </div>
                <div class="peek-text-group">
                    <div class="peek-title">All Talent ${!activeNiche ? '<span class="peek-active-indicator"></span>' : ''}</div>
                    <div class="peek-subtitle">100% Escrow Protected</div>
                </div>
            </div>
        </div>
    </div>`;
}

function ProvidersList() {
    let providers = [];
    let loading = true;

    async function loadProviders() {
        showLoading();
        try {
            const params = new URLSearchParams();
            if (providerSearchState.q && providerSearchState.q.trim()) {
                params.append('q', providerSearchState.q.trim());
            }
            if (providerSearchState.niche) {
                params.append('niche', providerSearchState.niche);
            }
            if (providerSearchState.minRating) {
                params.append('min_rating', providerSearchState.minRating);
            }
            if (providerSearchState.sortBy) {
                params.append('sort_by', providerSearchState.sortBy);
            }

            if (providerSearchState.budget === 'under1000') {
                params.append('max_price', '1000');
            } else if (providerSearchState.budget === 'under1500') {
                params.append('max_price', '1500');
            } else if (providerSearchState.budget === 'under2000') {
                params.append('max_price', '2000');
            } else if (providerSearchState.budget === '1000to2000') {
                params.append('min_price', '1000');
                params.append('max_price', '2000');
            } else if (providerSearchState.budget === '1500to3500') {
                params.append('min_price', '1500');
                params.append('max_price', '3500');
            } else if (providerSearchState.budget === '2000to5000') {
                params.append('min_price', '2000');
                params.append('max_price', '5000');
            } else if (providerSearchState.budget === 'above2000') {
                params.append('min_price', '2000');
            } else if (providerSearchState.budget === 'above3500') {
                params.append('min_price', '3500');
            } else if (providerSearchState.budget === 'above5000') {
                params.append('min_price', '5000');
            }

            providers = await apiFetch(`/educators/summary?${params.toString()}`);
        } catch (e) {
            showToast(e.message || 'Failed to load talent', 'error');
            providers = [];
        } finally {
            loading = false;
            mount(renderProvidersList());
        }
    }

    window.setProviderNiche = (niche) => {
        providerSearchState.niche = niche;
        providerSearchState.subType = '';
        providerSearchState.serviceOption = '';
        providerSearchState.sellerDetail = '';
        providerSearchState.budget = '';
        providerSearchState.deliveryTime = '';
        window.__currentProviderNiche = niche || 'all';
        const opts = (window.__providerCategoryOptionsMap || {})[niche || 'all'] || [];
        const textEl = document.getElementById('provider-placeholder-dynamic-text');
        if (textEl && opts[0]) {
            textEl.textContent = `"${opts[0].label}"`;
        }
        if (window.location.pathname !== '/') {
            router('/');
        } else {
            loadProviders();
        }
    };

    window.setFiverrSubType = (typeId) => {
        providerSearchState.subType = (providerSearchState.subType === typeId ? '' : typeId);
        mount(renderProvidersList());
    };
    window.setFiverrVideoType = window.setFiverrSubType;

    window.scrollFiverrTypes = (offset) => {
        const el = document.getElementById('fiverr-type-scroll');
        if (el) el.scrollBy({ left: offset, behavior: 'smooth' });
    };

    window.toggleFiverrFilterMenu = (menuId) => {
        const menu = document.getElementById(menuId);
        const isOpen = menu && menu.classList.contains('open');
        document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'));
        if (menu && !isOpen) {
            menu.classList.add('open');
        }
    };

    window.setFiverrFilter = (key, value) => {
        providerSearchState[key] = value;
        document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'));
        if (key === 'budget') {
            loadProviders();
        } else {
            mount(renderProvidersList());
        }
    };

    window.toggleFiverrProOnly = (checked) => {
        providerSearchState.proOnly = checked;
        mount(renderProvidersList());
    };

    window.toggleFiverrOnlineOnly = (checked) => {
        providerSearchState.onlineOnly = checked;
        mount(renderProvidersList());
    };

    window.toggleFiverrFavorite = (providerId, event) => {
        if (event) event.stopPropagation();
        const key = `fiverr_fav_${providerId}`;
        const isFav = localStorage.getItem(key) === 'true';
        localStorage.setItem(key, isFav ? 'false' : 'true');
        const btn = event?.currentTarget || document.querySelector(`#fav-btn-${providerId}`);
        if (btn) {
            btn.classList.toggle('active', !isFav);
            btn.innerHTML = !isFav ? '❤️' : '🤍';
            btn.style.transform = 'scale(1.25)';
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 180);
        }
        showToast(!isFav ? 'Saved to your Saved Gigs ❤️' : 'Removed from Saved Gigs', 'info');
    };

    window.openFiverrEscrowModal = () => {
        const modal = document.createElement('div');
        modal.className = 'fiverr-escrow-modal';
        modal.innerHTML = `
            <div class="fiverr-escrow-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <button class="modal-back-btn" onclick="this.closest('.fiverr-escrow-modal').remove()" style="margin-top: 2px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            <span>Back</span>
                        </button>
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.4rem;">🛡️</span>
                                <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">How Escrow Protection Works</h3>
                            </div>
                            <p style="margin: 4px 0 0 0; font-size: 0.8125rem; color: var(--text-secondary);">100% Risk-Free freelance services for clients & talent</p>
                        </div>
                    </div>
                    <button class="modal-close" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;">
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">1</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary);">Funds Locked in Escrow Vault</div>
                            <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4;">When you place an order, your payment is held securely in the RBI/Bank compliant vault. The provider does not get paid upfront.</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: var(--success); display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">2</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary);">Guaranteed Turnaround Countdown</div>
                            <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4;">The provider starts working immediately with a live deadline clock (24h, 48h, etc.). You can message and request progress drafts.</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: var(--warning); display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">3</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary);">Inspect Deliverable First</div>
                            <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4;">Review the video export, live tutoring session, or written draft with zero risk. You get included revisions with every order.</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: flex-start;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: var(--success); display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0;">4</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary);">Release Payout or 100% Refund</div>
                            <div style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.4;">Only when you are completely satisfied do you click "Approve &amp; Release". If unsatisfied, our Admin resolution team guarantees a 100% refund.</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary" onclick="this.closest('.fiverr-escrow-modal').remove()" style="width: 100%; min-height: 46px; font-weight: 700;">
                        <-- Back to Exploring Talent
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    };

    window.openFiverrPortfolioModal = (providerId, providerName) => {
        const provider = providers.find(p => p.id === providerId);
        const name = provider ? provider.name : (providerName || 'Provider');
        const items = provider?.portfolio_items || [];
        const thumb = getProviderThumbnail(provider || {});
        const cfg = fiverrCategoryConfigs[provider?.niche] || fiverrCategoryConfigs['editors_animators'];

        const modal = document.createElement('div');
        modal.className = 'fiverr-escrow-modal';
        modal.innerHTML = `
            <div class="fiverr-escrow-card" style="max-width: 620px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="modal-back-btn" onclick="this.closest('.fiverr-escrow-modal').remove()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            <span>Back</span>
                        </button>
                        <div>
                            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">${name}'s Showcase</h3>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">★ ${(provider?.rating || 5.0).toFixed(1)} (${provider?.total_bookings || 20} orders) • 100% Escrow Protected</div>
                        </div>
                    </div>
                    <button class="modal-close" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                </div>

                <div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 12px; overflow: hidden; background: #000; margin-bottom: 16px;">
                    <img src="${thumb}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;" alt="${name}">
                    <div style="position: absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); color:white; text-align:center; padding:16px;">
                        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.95); color: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.4); padding-left: 4px;">
                            ▶
                        </div>
                        <div style="font-weight: 700; font-size: 1.05rem;">${items[0]?.title || cfg.showreelLabel}</div>
                        <div style="font-size: 0.8125rem; opacity: 0.85; max-width: 460px; margin-top: 4px;">${items[0]?.description || 'Verified showcase deliverable with 100% escrow protection and quality assurance.'}</div>
                    </div>
                </div>

                <div style="background: var(--bg-hover); padding: 12px 16px; border-radius: 10px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Starting Package</div>
                        <div style="font-weight: 800; color: var(--accent); font-size: 1.15rem;">₹${(provider?.starting_price || 999).toLocaleString()}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Standard Turnaround</div>
                        <div style="font-weight: 700; color: var(--text-primary); font-size: 0.875rem;">⚡ ${provider?.packages?.[0]?.turnaround || '24 hours'}</div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" onclick="this.closest('.fiverr-escrow-modal').remove(); openPreBookingChat(${providerId}, '${name.replace(/'/g, "\\'")}')" style="flex: 1; min-height: 46px; font-weight: 700; border-color: var(--accent); color: var(--accent); display: flex; align-items: center; justify-content: center; gap: 6px;">
                        💬 Chat with ${name}
                    </button>
                    <button class="btn btn-primary" onclick="this.closest('.fiverr-escrow-modal').remove(); selectProvider(${providerId})" style="flex: 1.5; font-weight: 700; min-height: 46px;">
                        ${cfg.primaryBtnText}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    };

    window.viewProviderPortfolio = window.openFiverrPortfolioModal;

    window.openPreBookingChat = (providerId, providerName) => {
        if (!currentToken) {
            showToast('Please log in to chat with creators', 'info');
            sessionStorage.setItem('redirect_after_login', `/messages?user_id=${providerId}`);
            router('/login');
            return;
        }
        window.__selectedChatUserId = providerId;
        window.__selectedChatUserName = providerName;
        router('/messages');
    };
    window.openProviderChatModal = window.openPreBookingChat;

    window.triggerCardAnim = (cardEl, type) => {
        const overlay = cardEl.querySelector('.anim-overlay');
        if (!overlay) return;
        overlay.style.opacity = '1';
        setTimeout(() => { overlay.style.opacity = '0'; }, 1200);
    };

    window.__handleProviderSearchInput = (val) => {
        providerSearchState.q = val;
        window.__updateProviderPlaceholderVisibility();
    };

    window.__updateProviderPlaceholderVisibility = (forceHide = false) => {
        const input = document.getElementById('provider-search-input');
        const holder = document.getElementById('provider-search-animated-placeholder');
        if (!holder) return;
        if (forceHide || (input && (input.value.trim().length > 0 || document.activeElement === input))) {
            holder.classList.add('hidden');
        } else {
            holder.classList.remove('hidden');
        }
    };

    window.__clearProviderSearch = () => {
        providerSearchState.q = '';
        const input = document.getElementById('provider-search-input');
        if (input) {
            input.value = '';
        }
        window.__updateProviderPlaceholderVisibility();
        loadProviders();
    };

    window.handleProviderSearch = (e) => {
        if (e) e.preventDefault();
        const input = document.getElementById('provider-search-input');
        if (input) {
            providerSearchState.q = input.value.trim();
            window.__updateProviderPlaceholderVisibility();
            loadProviders();
        }
    };

    window.handleFilterChange = (filterType, value) => {
        providerSearchState[filterType] = value;
        loadProviders();
    };

    window.clearProviderFilters = () => {
        providerSearchState = {
            q: '',
            niche: providerSearchState.niche,
            subType: '',
            serviceOption: '',
            sellerDetail: '',
            budget: '',
            deliveryTime: '',
            minRating: '',
            sortBy: 'rating',
            proOnly: false,
            onlineOnly: false
        };
        loadProviders();
    };

    window.selectProvider = (providerId, packageId = null) => {
        sessionStorage.setItem('selected_provider_id', providerId);
        if (packageId) {
            sessionStorage.setItem('selected_package_id', packageId);
        } else {
            sessionStorage.removeItem('selected_package_id');
        }
        router('/create-booking');
    };

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fiverr-filter-dropdown-wrap')) {
            document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'));
        }
    });

    loadProviders();

    function getActiveServiceOptionLabel(cfg) {
        if (!cfg || !providerSearchState.serviceOption) return '';
        const found = cfg.serviceOptions.find(o => o.id === providerSearchState.serviceOption);
        return found ? found.label : '';
    }

    function getActiveSellerDetailLabel(cfg) {
        if (!cfg || !providerSearchState.sellerDetail) return '';
        const found = cfg.sellerDetails.find(d => d.id === providerSearchState.sellerDetail);
        return found ? found.label : '';
    }

    function getActiveBudgetLabel(cfg) {
        if (!cfg || !providerSearchState.budget) return '';
        const found = cfg.budgets.find(b => b.id === providerSearchState.budget);
        return found ? found.label : '';
    }

    function getActiveDeliveryTimeLabel(cfg) {
        if (!cfg || !providerSearchState.deliveryTime) return '';
        const found = cfg.deliveryTimes.find(t => t.id === providerSearchState.deliveryTime);
        return found ? found.label : '';
    }

    function getProviderThumbnail(provider) {
        if (provider.portfolio_items && provider.portfolio_items.length > 0 && provider.portfolio_items[0].thumbnail_url) {
            return provider.portfolio_items[0].thumbnail_url;
        }
        const text = `${provider.name || ''} ${(provider.skills || []).join(' ')} ${(provider.packages || []).map(p => (p.title + ' ' + (p.scope || ''))).join(' ')}`.toLowerCase();

        if (text.includes('animation') || text.includes('2d') || text.includes('3d') || text.includes('character') || text.includes('blender') || text.includes('explainer')) {
            return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('tiktok') || text.includes('reels') || text.includes('ads & social') || text.includes('ad') || text.includes('ugc')) {
            return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('youtube') || text.includes('long-form') || text.includes('vlog') || text.includes('podcast')) {
            return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('gaming') || text.includes('twitch') || text.includes('montage') || text.includes('stream') || text.includes('gameplay')) {
            return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('corporate') || text.includes('b2b') || text.includes('commercial')) {
            return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('travel') || text.includes('drone') || text.includes('family')) {
            return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('music') || text.includes('vfx') || text.includes('beat')) {
            return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';
        }

        if (text.includes('conversational') || text.includes('fluency') || text.includes('small talk')) {
            return 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('ielts') || text.includes('toefl') || text.includes('band')) {
            return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('business english') || text.includes('executive') || text.includes('presentation')) {
            return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('interview') || text.includes('mock') || text.includes('star')) {
            return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('kids') || text.includes('children') || text.includes('phonics')) {
            return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('accent') || text.includes('neutralization') || text.includes('speech')) {
            return 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80';
        }

        if (text.includes('seo') || text.includes('blog') || text.includes('surfer')) {
            return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('landing page') || text.includes('website copy') || text.includes('saas')) {
            return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('social media') || text.includes('linkedin') || text.includes('ad copy')) {
            return 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('email') || text.includes('newsletter') || text.includes('klaviyo')) {
            return 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('script') || text.includes('storytelling')) {
            return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80';
        }
        if (text.includes('whitepaper') || text.includes('case study') || text.includes('technical')) {
            return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80';
        }

        return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
    }

    function getGigBadge(provider, cfg) {
        const text = `${(provider.skills || []).join(' ')} ${(provider.packages || []).map(p => p.title).join(' ')}`.toLowerCase();

        if (text.includes('animation') || text.includes('2d') || text.includes('3d') || text.includes('blender') || text.includes('character')) return '🎨 2D/3D ANIMATION MASTER';
        if (text.includes('gaming') || text.includes('twitch') || text.includes('montage') || text.includes('gameplay')) return '🎮 GAMING & STREAM EDITS';
        if (text.includes('tiktok') || text.includes('reels') || text.includes('ads & social') || text.includes('ugc') || text.includes('hook')) return '📱 VIRAL REELS & SOCIAL ADS';
        if (text.includes('youtube') || text.includes('long-form') || text.includes('retention') || text.includes('podcast')) return '📺 YOUTUBE & LONG-FORM PRO';
        if (text.includes('corporate') || text.includes('b2b') || text.includes('commercial')) return '🏢 CORPORATE & B2B PROMO';
        if (text.includes('travel')) return '✈️ CINEMATIC 4K TRAVEL';
        if (text.includes('music')) return '🎬 MUSIC & TRIPPY VFX';

        if (text.includes('conversational')) return '1-ON-1 FLUENCY COACH';
        if (text.includes('ielts') || text.includes('toefl')) return 'IELTS BAND 8+ MASTER';
        if (text.includes('business')) return 'EXECUTIVE COACHING';
        if (text.includes('interview')) return 'FAANG INTERVIEW PREP';
        if (text.includes('kids')) return 'KIDS PHONICS & FUN';
        if (text.includes('accent')) return 'ACCENT CLINIC';

        if (text.includes('seo') || text.includes('blog')) return 'SURFER SEO 80+';
        if (text.includes('landing') || text.includes('website')) return 'CONVERSION COPY';
        if (text.includes('social') || text.includes('linkedin')) return 'VIRAL SOCIAL PACK';
        if (text.includes('email')) return '5-PART EMAIL FLOW';
        if (text.includes('script')) return 'RETENTION SCRIPT';
        if (text.includes('whitepaper') || text.includes('case study')) return 'B2B AUTHORITY';

        return cfg?.defaultBadge || 'PRO VERIFIED TALENT';
    }

    function getSellerLevelBadge(provider) {
        if (provider.rating >= 4.95 || provider.total_bookings >= 50) return 'Top Rated';
        if (provider.total_bookings >= 30) return 'Level 2';
        if (provider.total_bookings >= 10) return 'Level 1';
        return 'Rising Star';
    }

    function filterClassifiedProviders(list, cfg) {
        return list.filter(provider => {
            const text = `${provider.name || ''} ${(provider.skills || []).join(' ')} ${(provider.packages || []).map(p => (p.title + ' ' + (p.scope || ''))).join(' ')}`.toLowerCase();

            if (providerSearchState.q && providerSearchState.q.trim()) {
                const qLower = providerSearchState.q.trim().toLowerCase();
                if (!text.includes(qLower)) return false;
            }

            if (providerSearchState.subType && cfg?.types) {
                const subObj = cfg.types.find(t => t.id === providerSearchState.subType);
                if (subObj && subObj.keywords) {
                    const matched = subObj.keywords.some(kw => text.includes(kw));
                    if (!matched) return false;
                }
            }

            if (providerSearchState.serviceOption && cfg?.serviceOptions) {
                const sOpt = cfg.serviceOptions.find(o => o.id === providerSearchState.serviceOption);
                if (sOpt && sOpt.match) {
                    const matched = sOpt.match.some(kw => text.includes(kw));
                    if (!matched) return false;
                }
            }

            if (providerSearchState.sellerDetail) {
                const sd = providerSearchState.sellerDetail;
                if (sd === 'top_rated' && provider.rating < 4.9) return false;
                if (sd === 'level_2' && provider.total_bookings < 30) return false;
                if (sd === 'pro_verified' && (provider.rating < 4.8 || provider.total_bookings < 40)) return false;
                if (sd === 'fast_turnaround') {
                    const hasFast = (provider.packages || []).some(p => {
                        const t = (p.turnaround || '').toLowerCase();
                        return t.includes('24') || t.includes('hour') || t.includes('immediate');
                    });
                    if (!hasFast) return false;
                }
            }

            if (providerSearchState.deliveryTime) {
                const dt = providerSearchState.deliveryTime;
                if (dt === 'instant') {
                    const ok = (provider.packages || []).some(p => (p.turnaround || '').toLowerCase().includes('immediate') || (p.turnaround || '').toLowerCase().includes('instant'));
                    if (!ok) return false;
                } else if (dt === '24h') {
                    const ok = (provider.packages || []).some(p => {
                        const t = (p.turnaround || '').toLowerCase();
                        return t.includes('24') || t.includes('immediate') || t.includes('1 day');
                    });
                    if (!ok) return false;
                } else if (dt === '3d') {
                    const ok = (provider.packages || []).some(p => {
                        const t = (p.turnaround || '').toLowerCase();
                        return t.includes('24') || t.includes('48') || t.includes('3 day') || t.includes('2 day') || t.includes('immediate');
                    });
                    if (!ok) return false;
                }
            }

            if (providerSearchState.proOnly && provider.rating < 4.9) {
                return false;
            }

            if (providerSearchState.onlineOnly) {
                const resp = (provider.response_time || '').toLowerCase();
                const ok = resp.includes('15') || resp.includes('30') || resp.includes('1 hour') || provider.availability === 'immediate';
                if (!ok) return false;
            }

            return true;
        });
    }

    function renderFiverrGigCard(provider, activeCfg) {
        const thumb = getProviderThumbnail(provider);
        const cfg = activeCfg || fiverrCategoryConfigs[provider.niche] || fiverrCategoryConfigs['editors_animators'];
        const badge = getGigBadge(provider, cfg);
        const level = getSellerLevelBadge(provider);
        const isFav = localStorage.getItem(`fiverr_fav_${provider.id}`) === 'true';
        const mainPkg = provider.packages?.[0];
        const hookTitle = mainPkg?.title || `${provider.specialization || 'Professional verified services'} with 100% escrow protection`;
        const startPrice = provider.starting_price || mainPkg?.price || (provider.niche === 'tutors' ? 799 : (provider.niche === 'writers' ? 1199 : 1499));
        const turnaround = mainPkg?.turnaround || (provider.niche === 'tutors' ? 'Immediate' : '24 hours');

        const primaryText = {
            'tutors': 'Book Lesson',
            'writers': 'Hire Writer',
            'editors_animators': 'Book Talent'
        }[provider.niche] || (cfg?.primaryBtnText || 'Book Talent');

        const secondaryText = {
            'tutors': '🎧 Sample Class',
            'writers': '📄 Read Sample',
            'editors_animators': '🎨 Showreel'
        }[provider.niche] || (cfg?.secondaryBtnText || '🎨 Showcase');

        const nicheTag = {
            'editors_animators': '🎬 Video',
            'tutors': '🗣️ Tutor',
            'writers': '✍️ Writer'
        }[provider.niche] || '';

        return `
        <div class="fiverr-gig-card">
            <!-- 16:9 Thumbnail Showcase with Badges & Fav Heart -->
            <div class="fiverr-gig-thumb-wrap" onclick="openFiverrPortfolioModal(${provider.id})">
                <img src="${thumb}" alt="${provider.name}" class="fiverr-gig-thumb-img" loading="lazy">
                <span class="fiverr-gig-badge">${badge}</span>
                <button
                    class="fiverr-gig-heart ${isFav ? 'active' : ''}"
                    id="fav-btn-${provider.id}"
                    onclick="toggleFiverrFavorite(${provider.id}, event)"
                    title="Save to favorites"
                >
                    ${isFav ? '❤️' : '🤍'}
                </button>
                <div class="fiverr-gig-play-hint">
                    <div class="fiverr-gig-play-btn">▶</div>
                </div>
            </div>

            <!-- Gig Card Body -->
            <div class="fiverr-gig-content">
                <div>
                    <!-- Seller row -->
                    <div class="fiverr-gig-creator">
                        <div class="fiverr-gig-avatar">
                            ${provider.name ? provider.name.charAt(0) : 'P'}
                        </div>
                        <div style="overflow: hidden; flex: 1;">
                            <div class="fiverr-gig-creator-name">${provider.name}</div>
                            <div style="font-size: 0.6875rem; color: var(--success); font-weight: 600;">🟢 Online now</div>
                        </div>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            ${nicheTag ? `<span style="font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(99, 102, 241, 0.1); color: var(--accent); border: 1px solid rgba(99, 102, 241, 0.2);">${nicheTag}</span>` : ''}
                            <span class="fiverr-gig-level-badge">${level}</span>
                        </div>
                    </div>

                    <!-- Hook Title -->
                    <div class="fiverr-gig-title" onclick="openFiverrPortfolioModal(${provider.id})" title="${hookTitle}">
                        ${hookTitle}
                    </div>

                    <!-- Rating Row -->
                    <div class="fiverr-gig-rating-row">
                        <span class="fiverr-gig-star">★</span>
                        <span class="fiverr-gig-rating-val">${(provider.rating || 5.0).toFixed(1)}</span>
                        <span class="fiverr-gig-reviews">(${provider.total_bookings || 24})</span>
                        <span style="color: var(--text-muted); margin: 0 4px;">•</span>
                        <span style="color: var(--accent); font-weight: 600; font-size: 0.75rem;">100% Escrow</span>
                    </div>

                    <!-- Software / Skills chips -->
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
                        ${(provider.skills || []).slice(0, 3).map(skill => `
                            <span style="background: var(--bg-hover); color: var(--text-secondary); padding: 2px 7px; border-radius: 4px; font-size: 0.65rem; border: 1px solid var(--border);">${skill}</span>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <!-- Price & Delivery Footer -->
                    <div class="fiverr-gig-footer">
                        <div>
                            <div class="fiverr-gig-price-label">Starting at</div>
                            <div class="fiverr-gig-price-val">₹${startPrice.toLocaleString()}</div>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">⚡ ${turnaround}</span>
                        </div>
                    </div>

                    <!-- Action Buttons: Chat & Order -->
                    <div class="fiverr-gig-actions" style="display: flex; gap: 6px; margin-top: 10px;">
                        <button class="btn btn-outline btn-sm" style="flex: 1; font-weight: 700; border-color: var(--accent); color: var(--accent); display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="event.stopPropagation(); openPreBookingChat(${provider.id}, '${(provider.name || '').replace(/'/g, "\\'")}')" title="Chat with ${provider.name} before booking">
                            💬 Chat
                        </button>
                        <button class="btn btn-primary btn-sm" style="flex: 1.4; font-weight: 700;" onclick="selectProvider(${provider.id}, ${mainPkg ? mainPkg.id : 'null'})">
                            ${primaryText}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function renderProvidersList() {
        const activeCfg = fiverrCategoryConfigs[providerSearchState.niche];
        const isClassified = Boolean(activeCfg);

        const hasActiveFilters = Boolean(
            providerSearchState.q ||
            providerSearchState.subType ||
            providerSearchState.serviceOption ||
            providerSearchState.sellerDetail ||
            providerSearchState.budget ||
            providerSearchState.deliveryTime ||
            providerSearchState.minRating ||
            providerSearchState.proOnly ||
            providerSearchState.onlineOnly ||
            providerSearchState.sortBy !== 'rating'
        );

        const activeSubTypeObj = activeCfg ? activeCfg.types.find(t => t.id === providerSearchState.subType) : null;
        const activeServiceOptionLabel = getActiveServiceOptionLabel(activeCfg);
        const activeSellerDetailLabel = getActiveSellerDetailLabel(activeCfg);
        const activeBudgetLabel = getActiveBudgetLabel(activeCfg);
        const activeDeliveryLabel = getActiveDeliveryTimeLabel(activeCfg);

        const hasSpecificFilter = Boolean(
            providerSearchState.subType ||
            providerSearchState.serviceOption ||
            providerSearchState.sellerDetail ||
            providerSearchState.budget ||
            providerSearchState.deliveryTime ||
            providerSearchState.proOnly ||
            providerSearchState.onlineOnly
        );

        let displayedProviders = isClassified ? filterClassifiedProviders(providers, activeCfg) : providers;
        if (!isClassified) {
            if (providerSearchState.proOnly) {
                displayedProviders = displayedProviders.filter(p => p.rating >= 4.9);
            }
            if (providerSearchState.onlineOnly) {
                displayedProviders = displayedProviders.filter(p => {
                    const resp = (p.response_time || '').toLowerCase();
                    return resp.includes('15') || resp.includes('30') || resp.includes('1 hour') || p.availability === 'immediate';
                });
            }
        }

        window.__currentProviderNiche = providerSearchState.niche || 'all';
        const currentProviderOptions = (window.__providerCategoryOptionsMap || {})[providerSearchState.niche || 'all'] || (window.__providerCategoryOptionsMap || {}).all || [];
        const initialProviderTerm = currentProviderOptions[0]?.label || 'Video Editors & Animators';

        if (!window.__providerPlaceholderBlinkLoopStarted) {
            window.__providerPlaceholderBlinkLoopStarted = true;
            let providerOptIdx = 0;
            setInterval(() => {
                const input = document.getElementById('provider-search-input');
                const textEl = document.getElementById('provider-placeholder-dynamic-text');
                const holder = document.getElementById('provider-search-animated-placeholder');

                if (input && (input.value.trim().length > 0 || document.activeElement === input)) {
                    if (holder && !holder.classList.contains('hidden')) {
                        holder.classList.add('hidden');
                    }
                    return;
                }

                if (holder && holder.classList.contains('hidden')) {
                    holder.classList.remove('hidden');
                }

                if (!textEl) return;

                const map = window.__providerCategoryOptionsMap || {};
                const currentNiche = window.__currentProviderNiche || 'all';
                const opts = map[currentNiche] || map.all || [];
                if (!opts.length) return;

                providerOptIdx = (providerOptIdx + 1) % opts.length;
                const nextOpt = opts[providerOptIdx];

                // 1. Blink out smoothly
                textEl.classList.add('blink-out');
                textEl.classList.remove('blink-in');

                setTimeout(() => {
                    // 2. Change text while faded
                    textEl.textContent = `"${nextOpt.label}"`;
                    textEl.classList.remove('blink-out');
                    textEl.classList.add('blink-in');

                    setTimeout(() => {
                        textEl.classList.remove('blink-in');
                    }, 400);
                }, 280);
            }, 2600);
        }

        return el`<div>
            ${renderAppHeader('/')}
            ${renderLeftEdgePeekDock(providerSearchState.niche)}
            <div class="main">
                <!-- Search Bar with Dynamic Animated Rotating Placeholder & Blinking Search Button -->
                <div class="card provider-search-bar-card" style="padding: 14px 16px; margin-bottom: 20px;">
                    <form onsubmit="handleProviderSearch(event)" class="provider-search-form" style="display: flex; gap: 8px; align-items: center;">
                        <div class="buyer-search-input-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="buyer-search-icon">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <div class="search-animated-placeholder ${providerSearchState.q ? 'hidden' : ''}" id="provider-search-animated-placeholder" onclick="const i=document.getElementById('provider-search-input'); if(i){ i.focus(); }">
                                <span class="placeholder-prefix">Search</span>
                                <span class="placeholder-dynamic-text" id="provider-placeholder-dynamic-text">"${initialProviderTerm}"</span>
                                <span class="placeholder-cursor">|</span>
                            </div>
                            <input
                                type="text"
                                class="form-input buyer-search-input"
                                id="provider-search-input"
                                value="${escapeHTML(providerSearchState.q || '')}"
                                oninput="window.__handleProviderSearchInput(this.value); window.__updateProviderPlaceholderVisibility();"
                                onfocus="window.__updateProviderPlaceholderVisibility(true);"
                                onblur="window.__updateProviderPlaceholderVisibility();"
                                autocomplete="off"
                            />
                            ${providerSearchState.q ? `
                                <button type="button" class="buyer-search-clear-btn" onclick="window.__clearProviderSearch()" title="Clear search">✕</button>
                            ` : ''}
                        </div>
                        <button type="submit" class="btn btn-primary buyer-search-btn buyer-search-btn-blinking" title="Click to search talent">
                            <span class="search-btn-beacon"></span>
                            <span class="search-btn-icon-sparkle">✨</span>
                            <span>Search</span>
                        </button>
                        ${hasActiveFilters ? `
                            <button type="button" class="btn btn-secondary" onclick="clearProviderFilters()" style="height: 44px; width: auto; padding: 0 14px; font-weight: 600;" title="Reset filters">
                                ✕ Clear
                            </button>
                        ` : ''}
                    </form>
                </div>

                <!-- FIVERR CLASSIFIED CATEGORY VIEW -->
                ${isClassified ? `

                    <!-- Category Header -->
                    <div class="fiverr-cat-header">
                        <h1 class="fiverr-cat-title">${activeCfg.title}</h1>
                        <div class="fiverr-cat-desc">
                            <span>${activeCfg.description}</span>
                            <button class="fiverr-how-it-works-btn" onclick="openFiverrEscrowModal()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                                </svg>
                                How Escrow Works
                            </button>
                        </div>
                    </div>

                    <!-- "Select type" Carousel -->
                    <div class="fiverr-type-section">
                        <div class="fiverr-type-header">
                            <h2 class="fiverr-type-title">${activeCfg.selectTypeLabel}</h2>
                            <div class="fiverr-scroll-arrows">
                                <button class="fiverr-scroll-btn" onclick="scrollFiverrTypes(-240)" title="Scroll left">‹</button>
                                <button class="fiverr-scroll-btn" onclick="scrollFiverrTypes(240)" title="Scroll right">›</button>
                            </div>
                        </div>
                        <div class="fiverr-type-scroll" id="fiverr-type-scroll">
                            ${activeCfg.types.map(vt => `
                                <div
                                    class="fiverr-type-pill ${providerSearchState.subType === vt.id ? 'active' : ''}"
                                    onclick="setFiverrSubType('${vt.id}')"
                                >
                                    <div class="fiverr-type-icon">${getTypeIconSvg(vt.id, vt.icon, 34)}</div>
                                    <div class="fiverr-type-label-box">
                                        <div class="fiverr-type-label">${vt.label}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Fiverr Filter Dropdown Bar -->
                    <div class="fiverr-filter-bar">
                        <div class="fiverr-filter-left">
                            <!-- Service options dropdown -->
                            <div class="fiverr-filter-dropdown-wrap">
                                <button class="fiverr-filter-btn ${providerSearchState.serviceOption ? 'active' : ''}" onclick="toggleFiverrFilterMenu('menu-service-options')">
                                    <span>${getActiveServiceOptionLabel(activeCfg) || 'Service options'}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                <div class="fiverr-filter-menu" id="menu-service-options">
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--border);">
                                        <span style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">Service Options</span>
                                        <button type="button" class="modal-back-btn" onclick="document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'))">✕ Close</button>
                                    </div>
                                    ${activeCfg.serviceOptions.map(opt => `
                                        <div class="fiverr-filter-option ${providerSearchState.serviceOption === opt.id ? 'selected' : ''}" onclick="setFiverrFilter('serviceOption', '${opt.id}')">
                                            ${opt.label}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            ${providerSearchState.niche !== 'tutors' && providerSearchState.niche !== 'writers' && activeCfg.sellerDetails && activeCfg.sellerDetails.length > 0 ? `
                            <!-- Seller details dropdown -->
                            <div class="fiverr-filter-dropdown-wrap">
                                <button class="fiverr-filter-btn ${providerSearchState.sellerDetail ? 'active' : ''}" onclick="toggleFiverrFilterMenu('menu-seller-details')">
                                    <span>${getActiveSellerDetailLabel(activeCfg) || 'Seller details'}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                <div class="fiverr-filter-menu" id="menu-seller-details">
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--border);">
                                        <span style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">Seller Details</span>
                                        <button type="button" class="modal-back-btn" onclick="document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'))">✕ Close</button>
                                    </div>
                                    ${activeCfg.sellerDetails.map(sd => `
                                        <div class="fiverr-filter-option ${providerSearchState.sellerDetail === sd.id ? 'selected' : ''}" onclick="setFiverrFilter('sellerDetail', '${sd.id}')">
                                            ${sd.label}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            ` : ''}

                            <!-- Budget dropdown -->
                            <div class="fiverr-filter-dropdown-wrap">
                                <button class="fiverr-filter-btn ${providerSearchState.budget ? 'active' : ''}" onclick="toggleFiverrFilterMenu('menu-budget')">
                                    <span>${getActiveBudgetLabel(activeCfg) || 'Budget'}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                <div class="fiverr-filter-menu" id="menu-budget">
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--border);">
                                        <span style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">Budget</span>
                                        <button type="button" class="modal-back-btn" onclick="document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'))">✕ Close</button>
                                    </div>
                                    ${activeCfg.budgets.map(b => `
                                        <div class="fiverr-filter-option ${providerSearchState.budget === b.id ? 'selected' : ''}" onclick="setFiverrFilter('budget', '${b.id}')">
                                            ${b.label}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Delivery time / schedule dropdown -->
                            <div class="fiverr-filter-dropdown-wrap">
                                <button class="fiverr-filter-btn ${providerSearchState.deliveryTime ? 'active' : ''}" onclick="toggleFiverrFilterMenu('menu-delivery-time')">
                                    <span>${getActiveDeliveryTimeLabel(activeCfg) || (providerSearchState.niche === 'tutors' ? 'Schedule' : 'Delivery time')}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                <div class="fiverr-filter-menu" id="menu-delivery-time">
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid var(--border);">
                                        <span style="font-weight: 700; font-size: 0.82rem; color: var(--text-primary);">${providerSearchState.niche === 'tutors' ? 'Schedule' : 'Delivery time'}</span>
                                        <button type="button" class="modal-back-btn" onclick="document.querySelectorAll('.fiverr-filter-menu.open').forEach(m => m.classList.remove('open'))">✕ Close</button>
                                    </div>
                                    ${activeCfg.deliveryTimes.map(dt => `
                                        <div class="fiverr-filter-option ${providerSearchState.deliveryTime === dt.id ? 'selected' : ''}" onclick="setFiverrFilter('deliveryTime', '${dt.id}')">
                                            ${dt.label}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            ${hasActiveFilters ? `
                                <button class="btn btn-secondary btn-sm" onclick="clearProviderFilters()" style="padding: 7px 12px; font-size: 0.78125rem;">
                                    ✕ Reset
                                </button>
                            ` : ''}
                        </div>

                        <div class="fiverr-filter-right">
                            <label class="fiverr-toggle-item">
                                <span>Pro services</span>
                                <div class="fiverr-switch">
                                    <input type="checkbox" ${providerSearchState.proOnly ? 'checked' : ''} onchange="toggleFiverrProOnly(this.checked)">
                                    <span class="fiverr-slider"></span>
                                </div>
                            </label>
                            <label class="fiverr-toggle-item">
                                <span>Online now</span>
                                <div class="fiverr-switch">
                                    <input type="checkbox" ${providerSearchState.onlineOnly ? 'checked' : ''} onchange="toggleFiverrOnlineOnly(this.checked)">
                                    <span class="fiverr-slider"></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Active Sub-Filter Chips Bar (Back Option for Specific Selections) -->
                    ${hasSpecificFilter ? `
                        <div class="fiverr-active-filters-bar">
                            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;">
                                <span>Active Filters:</span>
                            </span>
                            ${activeSubTypeObj ? `
                                <button class="fiverr-active-filter-chip" onclick="setFiverrSubType('')" title="Remove filter">
                                    <span>Type: ${activeSubTypeObj.label}</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            ${activeServiceOptionLabel ? `
                                <button class="fiverr-active-filter-chip" onclick="setFiverrFilter('serviceOption', '')" title="Remove filter">
                                    <span>Service: ${activeServiceOptionLabel}</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            ${activeSellerDetailLabel && providerSearchState.niche !== 'tutors' && providerSearchState.niche !== 'writers' ? `
                                <button class="fiverr-active-filter-chip" onclick="setFiverrFilter('sellerDetail', '')" title="Remove filter">
                                    <span>Seller: ${activeSellerDetailLabel}</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            ${activeBudgetLabel ? `
                                <button class="fiverr-active-filter-chip" onclick="setFiverrFilter('budget', '')" title="Remove filter">
                                    <span>Budget: ${activeBudgetLabel}</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            ${activeDeliveryLabel ? `
                                <button class="fiverr-active-filter-chip" onclick="setFiverrFilter('deliveryTime', '')" title="Remove filter">
                                    <span>${providerSearchState.niche === 'tutors' ? 'Schedule' : 'Delivery'}: ${activeDeliveryLabel}</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            ${providerSearchState.proOnly ? `
                                <button class="fiverr-active-filter-chip" onclick="toggleFiverrProOnly(false)" title="Remove filter">
                                    <span>Pro Only</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            ${providerSearchState.onlineOnly ? `
                                <button class="fiverr-active-filter-chip" onclick="toggleFiverrOnlineOnly(false)" title="Remove filter">
                                    <span>Online Now</span>
                                    <span class="chip-x">✕</span>
                                </button>
                            ` : ''}
                            <button class="fiverr-clear-all-btn" onclick="clearProviderFilters()">
                                <-- Reset / Show All
                            </button>
                        </div>
                    ` : ''}

                    <!-- Results Count & Sorting Row -->
                    <div class="fiverr-results-bar">
                        <div class="fiverr-results-count">
                            ${displayedProviders.length} results <span style="font-weight: 400; color: var(--text-muted); margin-left: 6px;">• Showing verified talent</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.8125rem; color: var(--text-secondary);">Sort by:</span>
                            <select class="fiverr-sort-select" onchange="handleFilterChange('sortBy', this.value)">
                                <option value="rating" ${providerSearchState.sortBy === 'rating' ? 'selected' : ''}>Best selling</option>
                                <option value="price_asc" ${providerSearchState.sortBy === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                                <option value="price_desc" ${providerSearchState.sortBy === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                                <option value="bookings" ${providerSearchState.sortBy === 'bookings' ? 'selected' : ''}>Most Bookings</option>
                            </select>
                        </div>
                    </div>
                ` : `
                    <!-- Top Navigation on All Talent Overview -->
                    <div class="fiverr-nav-top">
                        <button class="fiverr-back-btn" onclick="router('/')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            <span><-- Back to Dashboard</span>
                        </button>
                    </div>

                    <!-- STANDARD CATEGORY SELECTION CARDS (All Talent Overview) -->
                    <div class="provider-category-grid">
                        ${[
                    { niche: 'editors_animators', label: 'Video Editors', color: 'linear-gradient(135deg, #7c3aed, #4f46e5)', sub: 'Reels, YouTube, VFX' },
                    { niche: 'tutors', label: 'English Tutors', color: 'linear-gradient(135deg, #10b981, #059669)', sub: 'Fluency, IELTS, Accent' },
                    { niche: 'writers', label: 'Writers', color: 'linear-gradient(135deg, #0284c7, #0369a1)', sub: 'SEO, Scripts, Blogs' },
                    { niche: '', label: 'All Talent', color: 'linear-gradient(135deg, #f59e0b, #d97706)', sub: 'All Verified Creators' },
                ].map(cat => `
                            <div
                                class="provider-category-card ${cat.niche === providerSearchState.niche ? 'active' : ''}"
                                style="cursor: pointer; background: ${cat.niche === providerSearchState.niche ? cat.color : 'var(--bg-card)'}; border: 2.5px solid ${cat.niche === providerSearchState.niche ? 'transparent' : 'var(--border)'}; border-radius: 16px; padding: 18px 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: transform 0.25s var(--ease-spring), box-shadow 0.25s ease, background 0.2s ease; user-select: none;"
                                onclick="setProviderNiche('${cat.niche}')"
                            >
                                <div class="card-icon-circle"
                                     style="width: 56px; height: 56px; border-radius: 16px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); transition: transform 0.3s var(--ease-bounce);">
                                    ${getCategoryPeekIconSvg(cat.niche)}
                                </div>
                                <div style="font-weight: 700; font-size: 0.875rem; color: ${cat.niche === providerSearchState.niche ? 'white' : 'var(--text-primary)'}; text-align: center;">
                                    ${cat.label}
                                </div>
                                <div style="font-size: 0.72rem; color: ${cat.niche === providerSearchState.niche ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)'}; text-align: center;">
                                    ${cat.sub}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}

                ${loading ? '<div class="loading"><div class="spinner"></div></div>' : ''}

                ${!loading && displayedProviders.length === 0 ? `
                    <div class="card" style="padding: 48px 24px; text-align: center; max-width: 600px; margin: 32px auto; border: 1.5px dashed var(--border); box-shadow: var(--shadow);">
                        <div style="font-size: 3rem; margin-bottom: 14px;">✨</div>
                        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 8px; color: var(--text-primary);">Fresh Marketplace — Join as a Creator</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5; max-width: 460px; margin-left: auto; margin-right: auto;">
                            Are you a Video Editor, Motion Designer, or English Coach? Be among the first verified creators to offer services with 100% Escrow protected payouts.
                        </p>
                        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-primary" onclick="startJourney('PROVIDER')" style="padding: 12px 26px; font-weight: 700; background: #5b34ea;">
                                Become a Creator &amp; List Services -->
                            </button>
                            ${hasActiveFilters ? `<button class="btn btn-secondary" onclick="clearProviderFilters()">Reset Filters</button>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- RESULTS BAR FOR ALL TALENT OVERVIEW -->
                ${!loading && !isClassified && displayedProviders.length > 0 ? `
                    <div class="fiverr-results-bar">
                        <div class="fiverr-results-count">
                            ${displayedProviders.length} verified talents <span style="font-weight: 400; color: var(--text-muted); margin-left: 6px;">• Showing visual portfolios &amp; work showcases</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.8125rem; color: var(--text-secondary);">Sort by:</span>
                            <select class="fiverr-sort-select" onchange="handleFilterChange('sortBy', this.value)">
                                <option value="rating" ${providerSearchState.sortBy === 'rating' ? 'selected' : ''}>Best selling</option>
                                <option value="price_asc" ${providerSearchState.sortBy === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                                <option value="price_desc" ${providerSearchState.sortBy === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                                <option value="bookings" ${providerSearchState.sortBy === 'bookings' ? 'selected' : ''}>Most Bookings</option>
                            </select>
                        </div>
                    </div>
                ` : ''}

                <!-- VISUAL PORTFOLIO GIG CARDS GRID (Unified for All Talent & Classified Categories) -->
                ${!loading && displayedProviders.length > 0 ? `
                    <div class="fiverr-gig-grid">
                        ${displayedProviders.map(provider => renderFiverrGigCard(provider, activeCfg)).join('')}
                    </div>
                ` : ''}
            </div>
        </div>`;
    }

    mount(renderProvidersList());
    return renderProvidersList();
}

// =============== ADMIN DASHBOARD ===============

function AdminDashboard() {
    let stats = {};
    let loading = true;

    async function loadStats() {
        showLoading();
        try {
            stats = await apiFetch('/admin/stats');
        } catch (e) {
            showToast(e.message, 'error');
            stats = {};
        } finally {
            loading = false;
            mount(renderAdminDashboard());
        }
    }

    loadStats();

    function renderAdminDashboard() {
        return el`<div>
            ${renderAppHeader('/admin')}
            <div class="main">
                <!-- Admin Command Center Banner -->
                <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 22px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <div style="width: 48px; height: 48px; border-radius: 14px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);">
                            🛡️
                        </div>
                        <div>
                            <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span>Grove Hub Admin Command Console</span>
                                <span class="mode-badge-pill mode-badge-admin">Exclusive Admin Access</span>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 3px;">
                                Signed in as <strong>${currentUser?.email || 'rahura2026@gmail.com'}</strong> • Complete oversight of chats, escrow, orders & talent.
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn btn-secondary btn-sm" onclick="router('/admin/chats')">💬 Inspect Chats</button>
                        <button class="btn btn-primary btn-sm" onclick="router('/payments')">💳 Escrow & Revenue</button>
                    </div>
                </div>

                <div class="section-title">Platform Overview</div>
                ${loading ? '<div class="loading"><div class="spinner"></div></div>' : ''}
                ${!loading ? `
                    <div class="grid grid-4" style="margin-bottom: 24px;">
                        <div class="card" style="border-left: 4px solid var(--accent); padding: 20px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Users</div>
                            <div style="font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${stats.total_users || 0}</div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Registered accounts</div>
                        </div>
                        <div class="card" style="border-left: 4px solid #3b82f6; padding: 20px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Active Providers</div>
                            <div style="font-size: 2rem; font-weight: 800; color: #3b82f6; margin-top: 4px;">${stats.total_providers || 0}</div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Verified talent</div>
                        </div>
                        <div class="card" style="border-left: 4px solid #f59e0b; padding: 20px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Bookings</div>
                            <div style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">${stats.total_bookings || 0}</div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Marketplace orders</div>
                        </div>
                        <div class="card" style="border-left: 4px solid #10b981; padding: 20px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Platform Revenue</div>
                            <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin-top: 4px;">₹${(stats.total_commissions || 0).toLocaleString()}</div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">20% commissions</div>
                        </div>
                    </div>

                    <div class="section-title">Management Modules</div>
                    <div class="grid grid-2">
                        <button class="card" onclick="router('/admin/chats')" style="cursor: pointer; text-align: left; border-color: rgba(99, 102, 241, 0.4);">
                            <div class="card-header" style="margin-bottom: 6px;">
                                <div class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">💬 Chats & Safety Guard</div>
                                <span class="badge badge-primary">Moderation</span>
                            </div>
                            <div class="card-body" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                                Inspect buyer-provider messages, review phone-sharing auto-blocks, and unblock accounts with 1 click.
                            </div>
                        </button>
                        <button class="card" onclick="router('/admin/providers')" style="cursor: pointer; text-align: left;">
                            <div class="card-header" style="margin-bottom: 6px;">
                                <div class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">👥 Provider Management</div>
                                <span class="badge badge-info">${stats.total_providers || 0} Providers</span>
                            </div>
                            <div class="card-body" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                                Verify credentials, review applicant portfolios, and manage active creator status.
                            </div>
                        </button>
                        <button class="card" onclick="router('/admin/bookings')" style="cursor: pointer; text-align: left;">
                            <div class="card-header" style="margin-bottom: 6px;">
                                <div class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">📋 All Bookings & Escrow Monitor</div>
                                <span class="badge badge-info">${stats.total_bookings || 0} Orders</span>
                            </div>
                            <div class="card-body" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                                Monitor all transactions across the platform, verify file deliveries, and force-release escrow.
                            </div>
                        </button>
                        <button class="card" onclick="router('/admin/disputes')" style="cursor: pointer; text-align: left;">
                            <div class="card-header" style="margin-bottom: 6px;">
                                <div class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">⚖️ Dispute Resolution Center</div>
                                <span class="badge badge-danger">Arbitration</span>
                            </div>
                            <div class="card-body" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                                Review client dispute claims, inspect deliverables, and issue full refunds or provider releases.
                            </div>
                        </button>
                        <button class="card" onclick="router('/payments')" style="cursor: pointer; text-align: left;">
                            <div class="card-header" style="margin-bottom: 6px;">
                                <div class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">💳 Escrow Vault & Financials</div>
                                <span class="badge badge-success">Audit</span>
                            </div>
                            <div class="card-body" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                                View gross volume, platform commissions, 80% provider disbursements, and funds currently locked.
                            </div>
                        </button>
                        <button class="card" onclick="router('/admin/niches')" style="cursor: pointer; text-align: left;">
                            <div class="card-header" style="margin-bottom: 6px;">
                                <div class="card-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">🗂️ Niches & Service Categories</div>
                                <span class="badge badge-info">${stats.active_niches || 0} Active</span>
                            </div>
                            <div class="card-body" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                                Configure video editing and English tutoring categories, pricing floors, and provider supply caps.
                            </div>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>`;
    }

    mount(renderAdminDashboard());
    return renderAdminDashboard();
}

// =============== ADMIN NICHES ===============

function AdminNiches() {
    let niches = [];
    let loading = true;

    async function loadNiches() {
        showLoading();
        try {
            niches = await apiFetch('/admin/niches');
        } catch (e) {
            showToast(e.message, 'error');
            niches = [];
        } finally {
            loading = false;
            mount(renderAdminNiches());
        }
    }

    loadNiches();

    async function handleCreateNiche(e) {
        e.preventDefault();
        const name = document.getElementById('niche-slug').value.trim();
        const displayName = document.getElementById('niche-display').value.trim();
        const supplyCap = parseInt(document.getElementById('niche-cap').value) || 100;

        showLoading();
        try {
            await apiFetch('/admin/niches', {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    display_name: displayName,
                    is_active: true,
                    supply_cap: supplyCap
                })
            });
            showToast('Niche created successfully', 'success');
            loadNiches();
        } catch (e) {
            showToast(e.message, 'error');
            loadNiches();
        }
    }

    window.toggleNicheActive = async (id, currentStatus) => {
        showLoading();
        try {
            await apiFetch(`/admin/niches/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active: !currentStatus })
            });
            showToast('Niche status updated', 'success');
            loadNiches();
        } catch (e) {
            showToast(e.message, 'error');
            loadNiches();
        }
    };

    function renderAdminNiches() {
        return el`<div>
            ${renderAppHeader('/admin/niches')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="section-title" style="margin: 0;">Manage Service Niches</div>
                    <button class="btn btn-secondary btn-sm" onclick="router('/admin')"><-- Back to Admin</button>
                </div>

                <div class="grid grid-2" style="margin-bottom: 24px;">
                    <!-- Create Niche Form -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Add New Niche</div>
                        </div>
                        <div class="card-body">
                            <form id="create-niche-form" onsubmit="window.handleCreateNiche(event)">
                                <div class="form-group">
                                    <label class="form-label">Key / Slug (e.g. voiceover_artists)</label>
                                    <input type="text" class="form-input" id="niche-slug" placeholder="voiceover_artists" required />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Display Name</label>
                                    <input type="text" class="form-input" id="niche-display" placeholder="Voiceover Artists" required />
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Supply Cap</label>
                                    <input type="number" class="form-input" id="niche-cap" value="100" min="1" required />
                                </div>
                                <button type="submit" class="btn btn-primary btn-sm" style="margin-top: 10px;">Create Niche</button>
                            </form>
                        </div>
                    </div>

                    <!-- Information Card -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">Niche Guidelines</div>
                        </div>
                        <div class="card-body" style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">
                            <p><strong>Supply Caps:</strong> Limit provider saturation per niche to preserve quality and high earnings for top talent.</p>
                            <p style="margin-top: 8px;"><strong>Core Niches:</strong> Focus on video editors, animators, English tutors, and thumbnail designers to maximize platform synergy.</p>
                        </div>
                    </div>
                </div>

                <!-- Niches List Table -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">All Registered Niches (${niches.length})</div>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Slug</th>
                                    <th>Display Name</th>
                                    <th>Supply Cap</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${niches.map(n => `
                                    <tr>
                                        <td>#${n.id}</td>
                                        <td><code>${n.name}</code></td>
                                        <td><strong>${n.display_name}</strong></td>
                                        <td>${n.supply_cap}</td>
                                        <td>
                                            <span class="badge ${n.is_active ? 'badge-success' : 'badge-danger'}">
                                                ${n.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm" onclick="toggleNicheActive(${n.id}, ${n.is_active})">
                                                ${n.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    }

    window.handleCreateNiche = handleCreateNiche;
}

// =============== ADMIN PROVIDERS ===============

function AdminProviders() {
    let providers = [];
    let loading = true;

    async function loadProviders() {
        showLoading();
        try {
            providers = await apiFetch('/admin/providers');
        } catch (e) {
            showToast(e.message, 'error');
            providers = [];
        } finally {
            loading = false;
            mount(renderAdminProviders());
        }
    }

    loadProviders();

    window.approveProvider = async (id) => {
        showLoading();
        try {
            await apiFetch(`/admin/providers/${id}/approve`, { method: 'POST' });
            showToast('Provider verified successfully', 'success');
            loadProviders();
        } catch (e) {
            showToast(e.message, 'error');
            loadProviders();
        }
    };

    window.toggleProviderActive = async (id) => {
        showLoading();
        try {
            await apiFetch(`/admin/providers/${id}/toggle-active`, { method: 'POST' });
            showToast('Provider status updated', 'success');
            loadProviders();
        } catch (e) {
            showToast(e.message, 'error');
            loadProviders();
        }
    };

    // Global unblock (also defined in AdminChatsView) so Providers page can reinstate safety-blocked accounts
    if (!window.__adminUnblockUser) {
        window.__adminUnblockUser = async (userId, userName) => {
            if (!confirm(`Unblock "${userName}" (ID: ${userId})? Messaging access will be reinstated.`)) return;
            try {
                const res = await apiFetch(`/admin/users/${userId}/unblock`, { method: 'POST' });
                showToast(res.message || 'User unblocked', 'success');
                loadProviders();
            } catch (err) { showToast(err.message, 'error'); }
        };
    }

    function renderAdminProviders() {
        return el`<div>
            ${renderAppHeader('/admin/providers')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="section-title" style="margin: 0;">Provider Management</div>
                    <button class="btn btn-secondary btn-sm" onclick="router('/admin')"><-- Back to Admin</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">All Providers (${providers.length})</div>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Specialty / Niche</th>
                                    <th>Rating</th>
                                    <th>Bookings</th>
                                    <th>Status</th>
                                    <th>Verified</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${providers.map(p => {
                                    const jsName = (p.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                                    const blocked = !!p.is_blocked;
                                    return `
                                    <tr>
                                        <td>#${p.id}</td>
                                        <td><strong>${escapeHTML(p.name || '')}</strong>${blocked ? ' <span class="badge badge-danger" style="font-size:0.65rem;">BLOCKED</span>' : ''}</td>
                                        <td>
                                            <div style="font-size: 0.8125rem;">${escapeHTML(p.phone || '-')}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(p.email || '-')}</div>
                                        </td>
                                        <td><span class="badge badge-info">${escapeHTML(p.niche || p.service_area || 'General')}</span></td>
                                        <td>${p.rating > 0 ? `${p.rating} ⭐` : 'New'}</td>
                                        <td>${p.total_bookings}</td>
                                        <td>
                                            <span class="badge ${!blocked && p.is_active ? 'badge-success' : 'badge-danger'}">
                                                ${blocked ? 'Safety-blocked' : (p.is_active ? 'Active' : 'Suspended')}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge ${p.is_verified ? 'badge-success' : 'badge-warning'}">
                                                ${p.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                ${!p.is_verified ? `
                                                    <button class="btn btn-primary btn-sm" onclick="approveProvider(${p.id})">Verify</button>
                                                ` : ''}
                                                <button class="btn btn-secondary btn-sm" onclick="toggleProviderActive(${p.id})">
                                                    ${p.is_active ? 'Suspend' : 'Activate'}
                                                </button>
                                                ${blocked ? `
                                                    <button class="btn btn-primary btn-sm" style="background:#10b981;border-color:#10b981;" onclick="window.__adminUnblockUser(${p.id}, '${jsName}')">Unblock</button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;}).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    }
}

// =============== ADMIN BOOKINGS ===============

function AdminBookings() {
    let bookings = [];
    let loading = true;
    let currentFilter = '';

    async function loadBookings() {
        showLoading();
        try {
            const url = currentFilter ? `/admin/bookings?status=${currentFilter}` : '/admin/bookings';
            bookings = await apiFetch(url);
        } catch (e) {
            showToast(e.message, 'error');
            bookings = [];
        } finally {
            loading = false;
            mount(renderAdminBookings());
        }
    }

    loadBookings();

    window.filterAdminBookings = (status) => {
        currentFilter = status;
        loadBookings();
    };

    window.forceApproveBooking = async (id) => {
        if (!confirm('Force approve this booking and immediately release payment to provider?')) return;
        showLoading();
        try {
            await apiFetch(`/admin/bookings/${id}/force-approve`, { method: 'POST' });
            showToast('Booking force approved and payment released', 'success');
            loadBookings();
        } catch (e) {
            showToast(e.message, 'error');
            loadBookings();
        }
    };

    function renderAdminBookings() {
        return el`<div>
            ${renderAppHeader('/admin/bookings')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="section-title" style="margin: 0;">Platform Bookings & Escrow</div>
                    <button class="btn btn-secondary btn-sm" onclick="router('/admin')"><-- Back to Admin</button>
                </div>

                <!-- Filters -->
                <div class="card" style="padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <label class="form-label" style="margin: 0;">Filter by Status:</label>
                    <select class="form-select" style="width: auto; margin: 0; padding: 6px 12px;" onchange="filterAdminBookings(this.value)">
                        <option value="" ${currentFilter === '' ? 'selected' : ''}>All Statuses</option>
                        <option value="confirmed" ${currentFilter === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="in_progress" ${currentFilter === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="delivered" ${currentFilter === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="pending_approval" ${currentFilter === 'pending_approval' ? 'selected' : ''}>Pending Approval</option>
                        <option value="approved" ${currentFilter === 'approved' ? 'selected' : ''}>Approved</option>
                        <option value="completed" ${currentFilter === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="disputed" ${currentFilter === 'disputed' ? 'selected' : ''}>Disputed</option>
                        <option value="refunded" ${currentFilter === 'refunded' ? 'selected' : ''}>Refunded</option>
                    </select>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Bookings List (${bookings.length})</div>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Buyer ID</th>
                                    <th>Provider ID</th>
                                    <th>Total Value</th>
                                    <th>Platform Fee</th>
                                    <th>Payout (80%)</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookings.map(b => {
            const fee = b.total_amount * 0.20;
            const payout = b.total_amount - fee;
            return `
                                    <tr>
                                        <td>#${b.id}</td>
                                        <td>Buyer #${b.buyer_id}</td>
                                        <td>Provider #${b.provider_id}</td>
                                        <td><strong>₹${b.total_amount.toLocaleString()}</strong></td>
                                        <td style="color: var(--success); font-weight: 600;">₹${fee.toLocaleString()}</td>
                                        <td>₹${payout.toLocaleString()}</td>
                                        <td><span class="badge ${getBookingBadge(b.status)}">${b.status.replace('_', ' ')}</span></td>
                                        <td>${new Date(b.created_at).toLocaleDateString()}</td>
                                        <td>
                                            ${b.status !== 'approved' && b.status !== 'completed' && b.status !== 'refunded' ? `
                                                <button class="btn btn-success btn-sm" onclick="forceApproveBooking(${b.id})">Force Approve</button>
                                            ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">Settled</span>'}
                                        </td>
                                    </tr>`;
        }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    }
}

// =============== ADMIN DISPUTES ===============

function AdminDisputes() {
    let disputes = [];
    let loading = true;

    async function loadDisputes() {
        showLoading();
        try {
            disputes = await apiFetch('/disputes');
        } catch (e) {
            showToast(e.message, 'error');
            disputes = [];
        } finally {
            loading = false;
            mount(renderAdminDisputes());
        }
    }

    loadDisputes();

    window.resolveDispute = async (id, action) => {
        const resolution = action === 'refund' ? 'Refunded to Buyer' : 'Released to Provider';
        const notes = prompt('Admin notes for resolution:', `Dispute resolved in favor of ${action === 'refund' ? 'buyer (100% refund)' : 'provider (funds released)'}`);
        if (notes === null) return;

        showLoading();
        try {
            await apiFetch(`/disputes/${id}/resolve`, {
                method: 'PATCH',
                body: JSON.stringify({
                    dispute_id: id,
                    status: 'resolved',
                    resolution: resolution,
                    admin_notes: notes
                })
            });
            showToast(`Dispute resolved: ${resolution}`, 'success');
            loadDisputes();
        } catch (e) {
            showToast(e.message, 'error');
            loadDisputes();
        }
    };

    function renderAdminDisputes() {
        return el`<div>
            ${renderAppHeader('/admin/disputes')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="section-title" style="margin: 0;">Dispute Resolution Center</div>
                    <button class="btn btn-secondary btn-sm" onclick="router('/admin')"><-- Back to Admin</button>
                </div>

                ${disputes.length === 0 ? `
                    <div class="card">
                        <div class="empty-state">
                            <h3>No active disputes</h3>
                            <p>All client and provider transactions are operating normally without conflicts.</p>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-2">
                        ${disputes.map(d => `
                            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                                <div class="card-body">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                        <div>
                                            <div style="font-weight: 700; font-size: 1rem;">Dispute #${d.id}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">Booking #${d.booking_id} • ${new Date(d.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <span class="badge ${d.status === 'open' ? 'badge-danger' : 'badge-success'}">${d.status}</span>
                                    </div>

                                    <div style="background: var(--bg-hover); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 12px; font-size: 0.875rem;">
                                        <strong>Reason:</strong>
                                        <p style="margin: 4px 0 0; color: var(--text-secondary);">${d.description || 'No description provided'}</p>
                                    </div>

                                    ${d.resolution ? `
                                        <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 8px;">
                                            <strong>Resolution:</strong> ${d.resolution}
                                        </div>
                                    ` : ''}

                                    ${d.status === 'open' ? `
                                        <div style="display: flex; gap: 8px; margin-top: 14px;">
                                            <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="resolveDispute(${d.id}, 'refund')">
                                                Refund Buyer
                                            </button>
                                            <button class="btn btn-success btn-sm" style="flex: 1;" onclick="resolveDispute(${d.id}, 'release')">
                                                Release Payout
                                            </button>
                                        </div>
                                    ` : `
                                        <div style="font-size: 0.75rem; color: var(--success); text-align: center; margin-top: 8px;">
                                            ✓ Resolved by Admin
                                        </div>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>`;
    }
}

// =============== LEGAL & COMPLIANCE ===============

function PrivacyPolicy() {
    return el`<div>
        <div class="header">
            ${renderLogo(32, true)}
            <div class="header-nav">
                <button class="nav-btn" onclick="router('/')">Home</button>
                <button class="nav-btn" onclick="router('/login')">Sign In</button>
            </div>
        </div>
        <div class="main" style="max-width: 800px; margin: 0 auto; padding: 24px 20px;">
            <div class="card" style="padding: 28px;">
                <h1 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 8px;">Privacy Policy</h1>
                <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: 24px;">Last updated: September 21, 2026</p>

                <div style="color: var(--text-secondary); line-height: 1.7; font-size: 0.9375rem; display: flex; flex-direction: column; gap: 16px;">
                    <p>At <strong>Groove Hub</strong>, your privacy and data security are our top priorities. This Privacy Policy describes how we collect, use, and protect your personal information when you use our platform and mobile applications.</p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">1. Information We Collect</h3>
                    <p>We collect information necessary to connect creators with video editors and tutors, including:
                        <br>• <strong>Account Details:</strong> Full name, verified mobile phone number, and email address.
                        <br>• <strong>Provider Profiles:</strong> Skills, portfolio links, service areas, and package pricing.
                        <br>• <strong>Transaction & Escrow Data:</strong> Booking milestones, delivery files, and escrow payment statuses.
                    </p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">2. How We Use Your Information</h3>
                    <p>Your information is used strictly to:
                        <br>• Match creators with suitable video editors and English coaches.
                        <br>• Facilitate 100% escrow payment protection and release full payouts upon buyer approval.
                        <br>• Prevent fraud, resolve disputes, and maintain platform integrity.
                    </p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">3. Data Security & Payment Protection</h3>
                    <p>All sensitive transactions are processed using industry-standard encryption. We do not store plaintext passwords. Passwords are protected using salted cryptographic hashes.</p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">4. User Rights & Data Deletion</h3>
                    <p>Users have the right to access, update, or request the deletion of their account and personal data at any time through Account Settings or by contacting our support team.</p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">5. Contact Us</h3>
                    <p>If you have any questions regarding this Privacy Policy, contact us at <strong>privacy@editormarketplace.com</strong>.</p>
                </div>
                <div style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
                    <button class="btn btn-secondary btn-sm" onclick="router('/')"><-- Back to Marketplace</button>
                </div>
            </div>
        </div>
    </div>`;
}

function TermsOfService() {
    return el`<div>
        <div class="header">
            ${renderLogo(32, true)}
            <div class="header-nav">
                <button class="nav-btn" onclick="router('/')">Home</button>
                <button class="nav-btn" onclick="router('/login')">Sign In</button>
            </div>
        </div>
        <div class="main" style="max-width: 800px; margin: 0 auto; padding: 24px 20px;">
            <div class="card" style="padding: 28px;">
                <h1 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 8px;">Terms of Service</h1>
                <p style="color: var(--text-muted); font-size: 0.8125rem; margin-bottom: 24px;">Last updated: September 21, 2026</p>

                <div style="color: var(--text-secondary); line-height: 1.7; font-size: 0.9375rem; display: flex; flex-direction: column; gap: 16px;">
                    <p>Welcome to <strong>Groove Hub</strong>. By accessing our platform, website, or mobile application, you agree to be bound by these Terms of Service.</p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">1. Marketplace Services</h3>
                    <p>Groove Hub provides a connection platform connecting content creators ("Buyers") with freelance video editors, animators, and English tutors ("Providers").</p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">2. Platform Commission & Escrow</h3>
                    <p>• The platform charges <strong>no commission</strong> on any bookings.
                        <br>• When a booking is placed, funds are held securely in escrow.
                        <br>• Upon buyer approval, 100% is released to the provider's payout account.
                    </p>

                    <h3 style="color: var(--text-primary); margin-top: 12px;">3. Disputes & Resolutions</h3>
                    <p>In the event of a disagreement regarding delivered work, either party may open a dispute. The marketplace admin team reviews project scope and deliverables to issue either a full refund to the buyer or release the payout to the provider.</p>
                </div>
                <div style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
                    <button class="btn btn-secondary btn-sm" onclick="router('/')"><-- Back to Marketplace</button>
                </div>
			</div>
		</div>
	</div>
</div>`;
}

// =============== AUTH PORTAL PAGES ===============

window.handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const errBox = document.getElementById('forgot-error-container');
    const successBox = document.getElementById('forgot-success-container');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (errBox) errBox.innerHTML = '';
    if (successBox) successBox.style.display = 'none';
    if (!email) {
        if (errBox) errBox.innerHTML = '<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; margin-bottom:14px; font-size:0.85rem;">⚠️ Please enter your email or phone number.</div>';
        return;
    }
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
    try {
        const res = await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email_or_phone: email })
        });
        const msg = res.message || '';
        const match = msg.match(/token[:\s]+([a-zA-Z0-9_-]+)/);
        const token = res.reset_token || (match ? match[1] : '');
        if (token) {
            const td = document.getElementById('reset-token-display');
            if (td) td.textContent = token;
            const linkEl = document.getElementById('reset-token-link');
            if (linkEl) {
                linkEl.href = `/reset-password?token=${encodeURIComponent(token)}`;
                linkEl.onclick = (ev) => {
                    ev.preventDefault();
                    router(`/reset-password?token=${encodeURIComponent(token)}`);
                };
            }
            const sc = document.getElementById('forgot-success-container');
            if (sc) sc.style.display = 'block';
        } else {
            if (errBox) errBox.innerHTML = `<div style="background: rgba(16,185,129,0.12); border:1px solid #10b981; color:#10b981; padding:10px 14px; border-radius:8px; margin-bottom:14px; font-size:0.85rem;">✓ ${msg || 'If an account exists, a reset link has been sent.'}</div>`;
        }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Reset Link'; }
    } catch (err) {
        if (errBox) errBox.innerHTML = `<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; margin-bottom:14px; font-size:0.85rem;">⚠️ ${err.message || 'Failed to send reset link.'}</div>`;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Reset Link'; }
    }
};

function ForgotPassword() {
    return el`<div>
		<div class="header">
			${renderLogo(32, true)}
			<div class="header-nav">
				<button class="nav-btn" onclick="router('/')">Home</button>
				<button class="nav-btn" onclick="router('/login')">Sign In</button>
			</div>
		</div>
		<div class="main" style="max-width: 440px; margin: 0 auto; padding: 24px 16px;">
			<div class="card" style="box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
				<div class="card-body" style="padding: 32px 24px;">
					<div style="text-align: center; margin-bottom: 24px;">
						${renderLogo(48, true)}
						<h1 style="font-size: 1.5rem; font-weight: 700; margin-top: 12px;">Forgot Password?</h1>
						<p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 4px;">Enter your email or phone and we'll send you a reset link.</p>
					</div>
					<div id="forgot-error-container"></div>
					<form id="forgot-form" onsubmit="handleForgotPasswordSubmit(event)">
					    <div class="form-group">
					        <label class="form-label">Email or Phone</label>
					        <input type="text" class="form-input" id="forgot-email" placeholder="Your email or phone number" required autocomplete="email">
					    </div>
					    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-weight: 700; margin-top: 12px;">Send Reset Link</button>
					</form>
					<div id="forgot-success-container" style="margin-top: 16px; display: none;">
					    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 14px; font-size: 0.85rem; color: #10b981;">
					        <div style="font-weight: 700; margin-bottom: 8px;">✅ Reset link sent!</div>
					        <div style="color: var(--text-secondary); margin-bottom: 10px;">Use the token below to reset your password:</div>
					        <code id="reset-token-display" style="display: block; background: var(--bg-hover); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; word-break: break-all; border: 1px dashed var(--border);"></code>
					        <div style="margin-top: 10px;"><a id="reset-token-link" href="/reset-password" onclick="event.preventDefault(); router('/reset-password')" style="color: var(--accent); font-weight: 600;">Go to Reset Password →</a></div>
					    </div>
					</div>
					<div style="margin-top: 20px; text-align: center;">
					    <button class="btn btn-secondary" onclick="router('/login')" style="font-size: 0.85rem;">← Back to Sign In</button>
					</div>
				</div>
			</div>
		</div>
		</div>`}
function ResetPasswordPage() {
    window.handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('reset-token');
        const tokenFromUrl = new URLSearchParams(window.location.search).get('token') || '';
        const token = (tokenInput ? tokenInput.value.trim() : '') || tokenFromUrl;
        const newPw = document.getElementById('reset-password').value;
        const confirmPw = document.getElementById('reset-confirm').value;
        const errBox = document.getElementById('reset-error-container');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (errBox) errBox.innerHTML = '';
        if (!token) {
            if (errBox) errBox.innerHTML = '<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; font-size:0.85rem;">⚠️ Reset token is missing. Please enter your reset token or request a new one.</div>';
            return;
        }
        if (!newPw || !confirmPw) {
            if (errBox) errBox.innerHTML = '<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; font-size:0.85rem;">⚠️ Please fill in both password fields.</div>';
            return;
        }
        if (newPw !== confirmPw) {
            if (errBox) errBox.innerHTML = '<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; font-size:0.85rem;">⚠️ Passwords do not match.</div>';
            return;
        }
        if (newPw.length < 6) {
            if (errBox) errBox.innerHTML = '<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; font-size:0.85rem;">⚠️ Password must be at least 6 characters.</div>';
            return;
        }
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Resetting...'; }
        try {
            const res = await apiFetch('/auth/reset-password/confirm', {
                method: 'POST',
                body: JSON.stringify({ token, new_password: newPw })
            });
            if (errBox) errBox.innerHTML = `<div style="background: rgba(16,185,129,0.12); border:1px solid #10b981; color:#10b981; padding:10px 14px; border-radius:8px; font-size:0.85rem;">✓ ${res.message || 'Password reset successfully! Redirecting...'}</div>`;
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Reset Password'; }
            setTimeout(() => router('/login'), 1500);
        } catch (err) {
            if (errBox) errBox.innerHTML = `<div style="background: rgba(239,68,68,0.12); border:1px solid #ef4444; color:#ef4444; padding:10px 14px; border-radius:8px; font-size:0.85rem;">⚠️ ${err.message || 'Failed to reset password.'}</div>`;
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Reset Password'; }
        }
    };

    const initialToken = new URLSearchParams(window.location.search).get('token') || '';

    return el`<div>
        <div class="header">
            ${renderLogo(32, true)}
            <div class="header-nav">
                <button class="nav-btn" onclick="router('/')">Home</button>
                <button class="nav-btn" onclick="router('/login')">Sign In</button>
            </div>
        </div>
        <div class="main" style="max-width: 440px; margin: 0 auto; padding: 24px 16px;">
            <div class="card" style="box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
                <div class="card-body" style="padding: 32px 24px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        ${renderLogo(48, true)}
                        <h1 style="font-size: 1.5rem; font-weight: 700; margin-top: 12px;">Reset Password</h1>
                        <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 4px;">Enter your reset token and new password below.</p>
                    </div>
                    <div id="reset-error-container"></div>
                    <form id="reset-form" onsubmit="handleResetPasswordSubmit(event)">
                        <div class="form-group" style="${initialToken ? 'display: none;' : ''}">
                            <label class="form-label">Reset Token</label>
                            <input type="text" class="form-input" id="reset-token" placeholder="Paste your reset token" value="${initialToken}" autocomplete="off">
                        </div>
                        <div class="form-group" style="margin-top: 8px;">
                            <label class="form-label">New Password</label>
                            <input type="password" class="form-input" id="reset-password" placeholder="Enter new password (min 6 chars)" required minlength="6" autocomplete="new-password">
                        </div>
                        <div class="form-group" style="margin-top: 8px;">
                            <label class="form-label">Confirm Password</label>
                            <input type="password" class="form-input" id="reset-confirm" placeholder="Confirm new password" required minlength="6" autocomplete="new-password">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-weight: 700; margin-top: 12px;">Reset Password</button>
                    </form>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-secondary" onclick="router('/login')" style="font-size: 0.85rem;">← Back to Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function VerifyEmailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    return el`<div>
		<div class="header">
			${renderLogo(32, true)}
			<div class="header-nav">
				<button class="nav-btn" onclick="router('/')">Home</button>
				<button class="nav-btn" onclick="router('/login')">Sign In</button>
			</div>
		</div>
		<div class="main" style="max-width: 440px; margin: 0 auto; padding: 24px 16px;">
			<div class="card" style="box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
				<div class="card-body" style="padding: 32px 24px; text-align: center;">
					<div style="margin-bottom: 20px;">${renderLogo(48, true)}</div>
					<h1 style="font-size: 1.5rem; font-weight: 700;">Verify Your Email</h1>
					<p style="color: var(--text-muted); font-size: 0.875rem; margin: 8px 0 24px;">Click the button below to verify your email address.</p>
					<div id="verify-error-container"></div>
					<button class="btn btn-primary" style="width: 100%; padding: 13px; font-weight: 700;" id="verify-email-btn">Verify Email</button>
					<div style="margin-top: 16px;">
						<button class="btn btn-secondary" onclick="router('/login')" style="font-size: 0.85rem;"><-- Back to Sign In</button>
					</div>
				</div>
			</div>
		</div>
		</div>`}
function LogoutPage() {
    return el`<div>
		<div class="header">
			${renderLogo(32, true)}
			<div class="header-nav">
				<button class="nav-btn" onclick="router('/')">Home</button>
			</div>
		</div>
		<div class="main" style="max-width: 440px; margin: 0 auto; padding: 24px 16px; text-align: center;">
			<div class="card" style="box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
				<div class="card-body" style="padding: 32px 24px;">
					<div style="margin-bottom: 20px;">${renderLogo(48, true)}</div>
					<h1 style="font-size: 1.5rem; font-weight: 700;">Logged Out</h1>
					<p style="color: var(--text-muted); font-size: 0.875rem; margin: 8px 0 24px;">You have been successfully logged out.</p>
					<button class="btn btn-primary" style="width: 100%; padding: 13px; font-weight: 700;" onclick="router('/login')">Sign In Again</button>
				</div>
			</div>
		</div>
		</div>`;
}
// =============== LOGOUT ===============
window.logout = () => {
    currentToken = null;
    currentUser = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('grove_hub_active_mode');
    sessionStorage.clear();
    router('/login');
};

// =============== MODALS & FEATURE EXTENSIONS ===============

// --- In-App Chat Modal ---
let chatPollInterval = null;

window.openBookingChat = async (bookingId, partyName = 'Collaborator') => {
    const existing = document.getElementById('chat-modal-root');
    if (existing) existing.remove();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'chat-modal-root';
    modalRoot.className = 'modal-overlay';
    modalRoot.innerHTML = `
        <div class="modal" style="max-width: 550px; height: 600px; display: flex; flex-direction: column;">
            <div class="modal-header">
                <div>
                    <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">💬 Project Chat - Booking #${bookingId}</h2>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Collaborating with ${partyName}</div>
                </div>
                <button class="modal-close" onclick="closeBookingChat()">✕</button>
            </div>
            <div style="background: rgba(99, 102, 241, 0.08); border-bottom: 1px solid var(--border); padding: 8px 14px; font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                <span>🛡️</span>
                <span><strong>Escrow Protection Active:</strong> Never send personal payments or UPI outside Groove Hub. Funds remain safely protected until you approve the work.</span>
            </div>
            <div class="chat-messages" id="chat-messages-container">
                <div class="loading"><div class="spinner"></div></div>
            </div>
            <form onsubmit="handleSendChatMessage(event, ${bookingId})" class="chat-input-bar">
                <input type="text" id="chat-input-text" placeholder="Type your message..." required autocomplete="off" />
                <input type="text" id="chat-file-url" placeholder="Attachment/Drive link..." style="max-width: 140px; font-size: 0.75rem;" />
                <button type="submit" class="btn btn-primary btn-sm">Send</button>
            </form>
        </div>
    `;
    modalRoot.onclick = (e) => { if (e.target === modalRoot) closeBookingChat(); };
    document.body.appendChild(modalRoot);

    await loadChatMessages(bookingId);

    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(() => loadChatMessages(bookingId, false), 4000);
};

window.closeBookingChat = () => {
    if (chatPollInterval) {
        clearInterval(chatPollInterval);
        chatPollInterval = null;
    }
    const modal = document.getElementById('chat-modal-root');
    if (modal) modal.remove();
};

async function loadChatMessages(bookingId, showSpinner = true) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    try {
        const messages = await apiFetch(`/bookings/${bookingId}/messages`);
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); font-size: 0.8125rem; margin-top: 40px;">
                    No messages yet in this project chat. Say hello or share your work!
                </div>
            `;
            return;
        }

        const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

        container.innerHTML = messages.map(msg => {
            const isMe = msg.sender_id === currentUser?.id;
            const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="chat-bubble ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}">
                    <div style="font-weight: 600; font-size: 0.75rem; margin-bottom: 2px;">${isMe ? 'You' : msg.sender_name}</div>
                    <div>${msg.message}</div>
                    ${msg.file_url ? `
                        <a href="${msg.file_url}" target="_blank" rel="noopener noreferrer" class="chat-file-link">
                            📎 ${msg.file_url}
                        </a>
                    ` : ''}
                    <div class="chat-bubble-meta">
                        <span>${timeStr}</span>
                        ${isMe ? `<span>${msg.is_read ? '✓✓ Read' : '✓ Sent'}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        if (isScrolledToBottom || showSpinner) {
            container.scrollTop = container.scrollHeight;
        }
    } catch (e) {
        if (showSpinner) {
            container.innerHTML = `<div style="color: var(--danger); font-size: 0.8rem;">Failed to load messages: ${e.message}</div>`;
        }
    }
}

window.handleSendChatMessage = async (e, bookingId) => {
    e.preventDefault();
    const textInput = document.getElementById('chat-input-text');
    const fileInput = document.getElementById('chat-file-url');
    if (!textInput || !textInput.value.trim()) return;

    const message = textInput.value.trim();
    const fileUrl = fileInput?.value?.trim() || null;
    textInput.value = '';
    if (fileInput) fileInput.value = '';

    try {
        await apiFetch(`/bookings/${bookingId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message, file_url: fileUrl })
        });
        await loadChatMessages(bookingId, false);
    } catch (err) {
        showToast(err.message || 'Failed to send message', 'error');
    }
};

// --- Portfolio Viewer Modal ---
window.viewProviderPortfolio = async (providerId, providerName = 'Provider') => {
    const existing = document.getElementById('portfolio-modal-root');
    if (existing) existing.remove();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'portfolio-modal-root';
    modalRoot.className = 'modal-overlay';
    modalRoot.innerHTML = `
        <div class="modal" style="max-width: 750px; max-height: 85vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <div>
                    <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">🎨 ${providerName}'s Work & Portfolio</h2>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Verified projects, sample reels, and deliverables</div>
                </div>
                <button class="modal-close" onclick="document.getElementById('portfolio-modal-root').remove()">✕</button>
            </div>
            <div class="modal-body" id="portfolio-modal-body" style="overflow-y: auto;">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    modalRoot.onclick = (e) => { if (e.target === modalRoot) modalRoot.remove(); };
    document.body.appendChild(modalRoot);

    try {
        const items = await apiFetch(`/profile/${providerId}/portfolio`);
        const body = document.getElementById('portfolio-modal-body');
        if (!body) return;

        // Load reviews, bookings, and provider profile in parallel
        let reviews = [];
        let bookings = [];
        let providerProfile = {};
        try { reviews = await apiFetch(`/profile/${providerId}/reviews`); } catch (e) { reviews = []; }
        try { bookings = await apiFetch(`/bookings?provider_id=${providerId}&limit=10`); } catch (e) { bookings = []; }
        try { providerProfile = await apiFetch(`/profile/${providerId}`); } catch (e) { providerProfile = {}; }

        if (items.length === 0 && reviews.length === 0 && bookings.length === 0) {
            body.innerHTML = `
                <div class="empty-state" style="padding: 30px;">
                    <h3>No portfolio, reviews, or orders yet</h3>
                    <p>This talent hasn't published anything yet. Check back later or contact them directly.</p>
                </div>
            `;
            return;
        }

        const tabContent = `
            <div style="display: flex; gap: 4px; margin-bottom: 16px; flex-wrap: wrap;">
                <button class="tab-btn active" data-tab="portfolio" onclick="switchProviderTab(this, '${providerId}')">📁 Portfolio (${items.length})</button>
                <button class="tab-btn ${reviews.length === 0 ? 'inactive' : ''}" data-tab="reviews" onclick="switchProviderTab(this, '${providerId}')" ${reviews.length === 0 ? 'disabled' : ''}>⭐ Reviews (${reviews.length})</button>
                <button class="tab-btn ${bookings.length === 0 ? 'inactive' : ''}" data-tab="orders" onclick="switchProviderTab(this, '${providerId}')" ${bookings.length === 0 ? 'disabled' : ''}>📋 Orders (${bookings.length})</button>
            </div>
            <div id="provider-tab-portfolio-${providerId}">
                <div class="portfolio-grid">
                    ${items.map(item => {
            let mediaHtml = '';
            const url = item.media_url || '';
            if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
                const videoId = url.includes('youtu.be/') ? url.split('youtu.be/')[1].split('?')[0] : url.split('v=')[1]?.split('&')[0];
                mediaHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
            } else if (url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || item.thumbnail_url) {
                mediaHtml = `<img src="${item.thumbnail_url || url}" alt="${item.title}" />`;
            } else {
                mediaHtml = `
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-hover);">
                                    <span style="font-size: 2rem;">🔗</span>
                                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8rem; color: var(--accent); margin-top: 6px;">Open Sample</a>
                                </div>
                            `;
            }

            return `
                            <div class="portfolio-card">
                                <div class="portfolio-media-container">
                                    ${mediaHtml}
                                </div>
                                <div class="portfolio-info">
                                    <div class="portfolio-title">${item.title}</div>
                                    <div class="portfolio-desc">${item.description || ''}</div>
                                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: var(--accent); display: inline-block; margin-top: 6px;">View Original ↗</a>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
            ${reviews.length > 0 ? `
            <div id="provider-tab-reviews-${providerId}" style="display: none;">
                <div style="display: flex; flex-direction: column; gap: 14px;">
                    ${reviews.map(r => `
                        <div class="card" style="padding: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div style="font-weight: 700; font-size: 0.9rem;">${r.reviewer_name || 'Anonymous'}</div>
                                <div style="color: var(--warning);">${'★'.repeat(r.rating || 5)}${'☆'.repeat((5 - (r.rating || 5)))}</div>
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 4px;">${r.comment || 'No comment'}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">Booking #${r.booking_id} · ${new Date(r.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            ${bookings.length > 0 ? `
            <div id="provider-tab-orders-${providerId}" style="display: none;">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${bookings.map(b => `
                        <div class="card" style="padding: 14px 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 2px;">${b.provider_name || 'Provider'}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${b.title || 'Project'}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 700; color: var(--success); font-size: 0.95rem;">₹${(b.total_amount || 0).toLocaleString()}</div>
                                    <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; text-transform: capitalize;">${b.status || 'unknown'}</div>
                                </div>
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
                                Booked: ${new Date(b.created_at || Date.now()).toLocaleDateString()}
                                ${b.payment_status ? ` · Payment: ${b.payment_status}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        body.innerHTML = `
            <div style="position: sticky; top: 0; background: var(--bg-primary); z-index: 5; padding-bottom: 4px; border-bottom: 1px solid var(--border); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">👤</div>
                    <div>
                        <div style="font-weight: 700; font-size: 0.95rem;">${providerName}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${reviews.reduce((s, r) => s + (r.rating || 0), 0) / (reviews.length || 1) > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) + ' ⭐' : 'No reviews yet'} · ${reviews.length} reviews</div>
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.openInAppChat(${providerId})" style="gap: 4px;">
                    💬 Message
                </button>
            </div>
            ${tabContent}
        `;
    } catch (e) {
        const body = document.getElementById('portfolio-modal-body');
        if (body) body.innerHTML = `<div style="color: var(--danger);">Failed to load portfolio: ${e.message}</div>`;
    }
};

// --- Quick Chat with Provider ---
window.startChatWithProvider = async (providerId) => {
    window._currentChatProviderId = providerId;
    const existing = document.getElementById('chat-modal-root');
    if (existing) existing.remove();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'chat-modal-root';
    modalRoot.className = 'modal-overlay';
    modalRoot.innerHTML = `
        <div class="modal" style="max-width: 520px; max-height: 85vh; display: flex; flex-direction: column;">
            <!-- Chat Header (Telegram-style) -->
            <div style="padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-primary); display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                <button onclick="document.getElementById('chat-modal-root').remove()" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--text-primary); padding: 2px 6px; display: flex; align-items: center; flex-shrink: 0;">←</button>
                <div class="inbox-item-avatar" style="width: 38px; height: 38px; font-size: 0.95rem; flex-shrink: 0; position: relative;">
                    ${initial}
                    <div class="online-dot"></div>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                        <span>${escapeHTML(providerName)}</span>
                        <span style="font-size: 0.65rem; padding: 1px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.1); color: var(--success); font-weight: 700; white-space: nowrap;">last seen recently</span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px;">
                        100% Escrow Protected • Instant In-App Chat
                    </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="selectProvider(${providerId})" style="font-weight: 700; display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                    <span>📦</span> View Packages / Hire
                </button>
            </div>

            <!-- Escrow Safety Notice (Telegram-style system message) -->
            <div class="inbox-system-message" style="padding: 0 12px 6px;">
                <div class="inbox-system-msg-bubble">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 0.9rem; flex-shrink: 0; margin-top: 1px;">🛡️</span>
                        <div style="flex: 1;">
                            <strong style="color: var(--text-secondary); font-weight: 600;">Platform Trust & Safety</strong>
                            <span style="color: var(--text-muted);"> — Keep all communications and payments on Groove Hub. First violation = warning, repeat sharing of phone numbers, WhatsApp, UPI or off-platform details suspends your account.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-body" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; flex: 1;">
                <!-- Loading -->
                <div id="chat-loading" class="loading" style="padding: 20px; text-align: center;">
                    <div class="spinner"></div>
                    <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">Connecting to chat...</div>
                </div>
                <!-- Messages Stream -->
                <div id="chat-messages" style="display: none; flex: 1; overflow-y: auto; padding: 12px; background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 0 12px 12px;"></div>
                <!-- Input -->
                <div id="chat-input-area" style="display: none; padding: 10px 12px; background: var(--bg-primary); border-top: 1px solid var(--border);">
                    <form onsubmit="sendChatMessage(event)" style="display: flex; gap: 8px;">
                        <input type="text" id="chat-input" class="form-input" style="flex: 1; padding: 10px 14px; border-radius: 20px; border: 1px solid var(--border);" placeholder="Type your message..." autocomplete="off">
                        <button type="submit" class="btn btn-primary" style="width: 40px; height: 40px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    modalRoot.onclick = (e) => { if (e.target === modalRoot) modalRoot.remove(); };
    document.body.appendChild(modalRoot);

    try {
        const msgs = await apiFetch(`/chat/${providerId}/messages`);
        const chatLoading = document.getElementById('chat-loading');
        const chatMessages = document.getElementById('chat-messages');
        const chatInputArea = document.getElementById('chat-input-area');

        chatLoading.style.display = 'none';
        chatMessages.style.display = 'block';
        chatInputArea.style.display = 'block';

        if (msgs.length > 0) {
            chatMessages.innerHTML = msgs.map(m => `
                <div style="margin-bottom: 10px; ${m.sender_type === 'provider' ? 'display: flex; justify-content: flex-start;' : 'display: flex; justify-content: flex-end;'}">
                    <div style="max-width: 80%; padding: 10px 14px; border-radius: 16px; ${m.sender_type === 'provider' ? 'background: var(--accent); color: white; border-bottom-left-radius: 4px;' : 'background: var(--bg-hover); color: var(--text-primary); border-bottom-right-radius: 4px;'}">
                        <div style="font-size: 0.7rem; margin-bottom: 4px; opacity: 0.7; font-weight: 600;">${m.sender_type === 'provider' ? 'Provider' : 'You'} · ${new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style="white-space: pre-wrap; line-height: 1.4; font-size: 0.9rem;">${m.content || ''}</div>
                    </div>
                </div>
            `).join('');
        } else {
            chatMessages.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 0.875rem;">No messages yet. Start the conversation!</div>`;
        }
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (e) {
        const chatLoading = document.getElementById('chat-loading');
        if (chatLoading) {
            chatLoading.style.display = 'none';
            chatLoading.innerHTML = `<div style="color: var(--danger); font-size: 0.875rem;">Failed to load chat: ${e.message}</div>`;
        }
    }
};

// Send a chat message
window.sendChatMessage = async (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const providerId = window._currentChatProviderId;
    if (!input || !input.value.trim() || !providerId) return;

    const content = input.value.trim();
    input.value = '';

    const chatMessages = document.getElementById('chat-messages');
    const chatLoading = document.getElementById('chat-loading');

    // Add our message immediately
    const ourMsg = document.createElement('div');
    ourMsg.style.cssText = 'margin-bottom: 10px; display: flex; justify-content: flex-end;';
    ourMsg.innerHTML = `<div style="max-width: 80%; padding: 10px 14px; border-radius: 16px; background: var(--bg-hover); color: var(--text-primary); border-bottom-right-radius: 4px;"><div style="font-size: 0.7rem; margin-bottom: 4px; opacity: 0.7; font-weight: 600;">You · just now</div><div style="white-space: pre-wrap; line-height: 1.4; font-size: 0.9rem;">${content}</div></div>`;
    chatMessages.appendChild(ourMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        await apiFetch(`/chat/${providerId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content: content })
        });
    } catch (e) {
        showToast('Failed to send message', 'error');
    }
};

// --- Inbox / Conversations Page ---
window.OpenInbox = async () => {
    const existing = document.getElementById('inbox-modal-root');
    if (existing) existing.remove();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'inbox-modal-root';
    modalRoot.className = 'modal-overlay';
    modalRoot.innerHTML = `
        <div class="modal" style="max-width: 680px; max-height: 85vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <div>
                    <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">📬 Message Inbox</h2>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">All your conversations in one place</div>
                </div>
                <button class="modal-close" onclick="document.getElementById('inbox-modal-root').remove()">✕</button>
            </div>
            <div class="modal-body" id="inbox-body" style="overflow-y: auto; padding: 16px;">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </div>
    `;
    modalRoot.onclick = (e) => { if (e.target === modalRoot) modalRoot.remove(); };
    document.body.appendChild(modalRoot);

    try {
        const conversations = await apiFetch('/chat/conversations');
        const body = document.getElementById('inbox-body');
        if (!body) return;

        if (conversations.length === 0) {
            body.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 12px;">💬</div>
                <h3 style="font-weight: 700; margin-bottom: 8px;">No conversations yet</h3>
                <p style="font-size: 0.875rem;">Start a Quick Chat with a provider to begin messaging.</p>
            </div>`;
            return;
        }

        body.innerHTML = `<div style="display: flex; flex-direction: column; gap: 10px;">
            ${conversations.map(c => `
                <div class="card" style="padding: 14px 16px; cursor: pointer;" onclick="resumeChat(${c.provider_id}, '${c.provider_name.replace(/'/g, "\\'")}')">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">👤</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 700; font-size: 0.9rem;">${c.provider_name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                                ${c.unread_count > 0 ? `<span style="background: var(--accent); color: white; padding: 1px 6px; border-radius: 10px; font-size: 0.65rem; margin-right: 6px;">${c.unread_count} new</span>` : ''}
                                ${c.last_message ? c.last_message.substring(0, 50) + (c.last_message.length > 50 ? '...' : '') : 'No messages yet'}
                            </div>
                        </div>
                        <div style="font-size: 0.7rem; color: var(--text-muted); flex-shrink: 0;">${c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : '—'}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    } catch (e) {
        const body = document.getElementById('inbox-body');
        if (body) body.innerHTML = `<div style="color: var(--danger);">Failed to load inbox: ${e.message}</div>`;
    }
};

// Resume a conversation
window.resumeChat = (providerId, providerName) => {
    window._currentChatProviderId = providerId;
    document.getElementById('inbox-modal-root')?.remove();
    window.startChatWithProvider(providerId);
};

// --- Switch Provider Tab (Portfolio / Reviews / Orders) ---
window.switchProviderTab = (btn, providerId) => {
    const parent = btn.closest('div[style*="flex-wrap"]') || btn.parentElement;
    parent.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('inactive');
        b.disabled = true;
    });
    btn.classList.remove('inactive');
    btn.classList.add('active');
    btn.disabled = false;

    const pid = providerId;
    ['portfolio', 'reviews', 'orders'].forEach(tab => {
        const el = document.getElementById(`provider-tab-${tab}-${pid}`);
        if (el) el.style.display = tab === btn.dataset.tab ? 'block' : 'none';
    });
};

// --- Star Rating & Review Modal ---
window.openReviewModal = (bookingId) => {
    const existing = document.getElementById('review-modal-root');
    if (existing) existing.remove();

    let selectedRating = 5;

    const modalRoot = document.createElement('div');
    modalRoot.id = 'review-modal-root';
    modalRoot.className = 'modal-overlay';
    modalRoot.innerHTML = `
        <div class="modal" style="max-width: 480px;">
            <div class="modal-header">
                <h2 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">⭐ Leave a Review</h2>
                <button class="modal-close" onclick="document.getElementById('review-modal-root').remove()">✕</button>
            </div>
            <form onsubmit="handleReviewSubmit(event, ${bookingId})" style="padding: 20px;">
                <div class="form-group" style="text-align: center; margin-bottom: 20px;">
                    <label class="form-label" style="margin-bottom: 8px;">Your Rating</label>
                    <div class="star-rating" id="review-stars">
                        <span data-star="1" class="active">★</span>
                        <span data-star="2" class="active">★</span>
                        <span data-star="3" class="active">★</span>
                        <span data-star="4" class="active">★</span>
                        <span data-star="5" class="active">★</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Review Comment</label>
                    <textarea class="form-textarea" id="review-comment" rows="4" placeholder="Share your experience working with this talent..." required>Exceptional work, delivered on time!</textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Verified Review</button>
            </form>
        </div>
    `;

    modalRoot.onclick = (e) => { if (e.target === modalRoot) modalRoot.remove(); };
    document.body.appendChild(modalRoot);

    const stars = modalRoot.querySelectorAll('#review-stars span');
    stars.forEach(star => {
        star.onclick = () => {
            selectedRating = parseInt(star.getAttribute('data-star'));
            stars.forEach((s, idx) => {
                if (idx < selectedRating) s.classList.add('active');
                else s.classList.remove('active');
            });
        };
    });

    window.handleReviewSubmit = async (e, bId) => {
        e.preventDefault();
        const comment = document.getElementById('review-comment')?.value || '';
        showLoading();
        try {
            await apiFetch('/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    booking_id: bId,
                    rating: selectedRating,
                    comment: comment
                })
            });
            showToast('Review submitted! Thank you.', 'success');
            modalRoot.remove();
            router('/bookings');
        } catch (err) {
            showToast(err.message || 'Failed to submit review', 'error');
            router('/bookings');
        }
    };
};

// Initial render - detect current URL path
const currentPath = window.location.pathname;
router(currentPath || '/');

// Handle 401 globally
window.addEventListener('error', (e) => {
    if (e.message.includes('401')) {
        logout();
    }
});

// =============== GROOVE CHATBOT (VANILLA JS) ===============
function GrooveChat() {
    let chatVisible = false;
    let messages = [];
    let inputValue = '';
    let loading = false;
    let chatBox = null;

    // Show the chat button + panel
    const container = el`<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <button id="groove-chat-toggle" onclick="GrooveChat.toggle()" style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,0.4); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: transform 0.15s ease, opacity 0.2s ease; z-index: 10000;">💬</button>
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 4px 10px; margin-top: 8px; white-space: nowrap; font-size: 0.7rem; color: var(--text-secondary); box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px;">
            <span>🤖</span> Groove · Ask me anything
        </div>
    </div>`;

    // Chat modal
    function showChat() {
        if (chatBox) return;
        chatVisible = true;
        messages = [];
        loading = false;
        inputValue = '';

        chatBox = document.createElement('div');
        chatBox.id = 'groove-chat-modal';
        chatBox.style.cssText = 'position: fixed; bottom: 85px; right: 20px; width: 380px; height: 520px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); z-index: 9999; display: flex; flex-direction: column; font-family: var(--font-main); overflow: hidden;';

        // Header
        const header = document.createElement('div');
        header.style.cssText = 'padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08));';
        header.innerHTML = '<div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 1.2rem;">🤖</span><span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">Groove Chat</span></div><button onclick="GrooveChat.hide()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; padding: 0; line-height: 1;">✕</button>';
        chatBox.appendChild(header);

        // Messages area
        const msgArea = document.createElement('div');
        msgArea.id = 'groove-msg-area';
        msgArea.style.cssText = 'flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: var(--bg-primary);';
        chatBox.appendChild(msgArea);

        // Input area
        const inputRow = document.createElement('div');
        inputRow.style.cssText = 'padding: 10px 12px; border-top: 1px solid var(--border); display: flex; gap: 8px; align-items: flex-end; background: var(--bg-card);';
        const textarea = document.createElement('textarea');
        textarea.id = 'groove-input';
        textarea.style.cssText = 'flex: 1; padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; resize: none; font-family: var(--font-main); outline: none; max-height: 70px; line-height: 1.4;';
        textarea.placeholder = 'Ask Groove anything... (Try: "I need a video editor right now")';
        textarea.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); GrooveChat.send(); } };
        inputRow.appendChild(textarea);

        const sendBtn = document.createElement('button');
        sendBtn.id = 'groove-send';
        sendBtn.style.cssText = 'width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: transform 0.15s ease, opacity 0.2s ease; flex-shrink: 0;';
        sendBtn.innerHTML = '➤';
        sendBtn.onclick = () => GrooveChat.send();
        inputRow.appendChild(sendBtn);
        chatBox.appendChild(inputRow);

        document.body.appendChild(chatBox);
        addBotMessage('👋 Hey there! I\'m Groove, your Groove Hub assistant. Ask me anything — try "I need a video editor right now" or "Find me an English tutor"!');
        textarea.focus();
    }

    function hideChat() {
        chatVisible = false;
        if (chatBox) { chatBox.remove(); chatBox = null; }
    }

    function addBotMessage(text) {
        if (!chatBox) return;
        const area = document.getElementById('groove-msg-area');
        if (!area) return;
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; gap: 8px; align-self: flex-start; animation: fadeIn 0.2s ease;';
        div.innerHTML = `<div style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--text-secondary); flex-shrink: 0;">🤖</div><div style="background: var(--bg-card); color: var(--text-primary); padding: 8px 12px; border-radius: 12px; border-bottom-left-radius: 4px; font-size: 0.825rem; line-height: 1.4; word-break: break-word; box-shadow: 0 1px 4px rgba(0,0,0,0.06); max-width: 90%;">${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`;
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    function addUserMessage(text) {
        if (!chatBox) return;
        const area = document.getElementById('groove-msg-area');
        if (!area) return;
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; gap: 8px; align-self: flex-end; flex-direction: row-reverse; animation: fadeIn 0.2s ease;';
        div.innerHTML = `<div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: white; flex-shrink: 0;">👤</div><div style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 8px 12px; border-radius: 12px; border-bottom-right-radius: 4px; font-size: 0.825rem; line-height: 1.4; word-break: break-word; box-shadow: 0 2px 8px rgba(99,102,241,0.3); max-width: 90%;">${text.replace(/\n/g, '<br>')}</div>`;
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    function showLoadingIndicator() {
        if (!chatBox) return;
        const area = document.getElementById('groove-msg-area');
        if (!area) return;
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; gap: 8px; align-self: flex-start; animation: fadeIn 0.2s ease;';
        div.innerHTML = `<div style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0;">🤖</div><div style="background: var(--bg-card); padding: 10px 14px; border-radius: 12px; border-bottom-left-radius: 4px; display: flex; gap: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"><div style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: bounce 1.4s ease-in-out infinite; animation-delay: 0s;"></div><div style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: bounce 1.4s ease-in-out infinite; animation-delay: 0.2s;"></div><div style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: bounce 1.4s ease-in-out infinite; animation-delay: 0.4s;"></div></div>`;
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    function removeLoadingIndicator() {
        if (!chatBox) return;
        const area = document.getElementById('groove-msg-area');
        if (!area) return;
        const indicators = area.querySelectorAll('div > div > div[style*="animation: bounce"]');
        // Remove the last loading indicator (the parent flex div)
        const children = area.children;
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            if (child.querySelector('[style*="animation: bounce"]')) {
                child.remove();
                break;
            }
        }
    }

    async function send() {
        const input = document.getElementById('groove-input');
        if (!input || !input.value.trim() || loading) return;
        const text = input.value.trim();
        input.value = '';
        addUserMessage(text);
        loading = true;
        showLoadingIndicator();

        // Simulate natural response delay
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

        loading = false;
        removeLoadingIndicator();

        // NLP intent detection
        const reply = GrooveChat.detectReply(text);
        addBotMessage(reply.text);

        // Execute navigation action
        if (reply.action) {
            setTimeout(() => { window.router(reply.action); }, 500);
        }
    }

    // NLP intent detection and reply generation
    function detectReply(text) {
        const lower = text.toLowerCase().trim();
        let intent = 'unknown';
        let action = null;

        // Video editor — urgent/right away
        if (lower.includes('video') && (lower.includes('right away') || lower.includes('now') || lower.includes('immediate') || lower.includes('fast') || lower.includes('urgent'))) {
            intent = 'find_video_editor_urgent';
        }
        // Video editor
        else if (lower.includes('video') || lower.includes('edit') || lower.includes('editor') || (lower.includes('video editor'))) {
            intent = 'find_video_editor';
        }
        // English tutor
        else if (lower.includes('english') || lower.includes('tutor') || lower.includes('coaching') || lower.includes('ielts') || lower.includes('speak') || lower.includes('language') || lower.includes('accent')) {
            intent = 'find_english_tutor';
        }
        // Writer
        else if (lower.includes('write') || lower.includes('writer') || lower.includes('content') || lower.includes('copy') || lower.includes('article') || lower.includes('blog')) {
            intent = 'find_writer';
        }
        // Profile / settings
        else if (lower.includes('profile') || lower.includes('edit') || lower.includes('update') || lower.includes('change') || (lower.includes('setting') && !lower.includes('payment'))) {
            intent = 'edit_profile';
            action = '/profile';
        }
        // Help
        else if (lower.includes('help') || lower.includes('what can') || lower.includes('support') || lower.includes('how') || lower.includes('need') || lower.includes('want')) {
            intent = 'show_help';
        }
        // Greeting
        else if (lower.match(/^(hi|hello|hey|yo|gm|good morning|good evening|sup|howdy)/)) {
            intent = 'greeting';
        }
        // Payment / money
        else if (lower.includes('payment') || lower.includes('money') || lower.includes('escrow') || lower.includes('bank') || lower.includes('balance') || lower.includes('where') && lower.includes("'s")) {
            intent = 'payment_status';
            action = '/payments';
        }
        // Booking
        else if (lower.includes('book') || lower.includes('booking') || lower.includes('hire') || lower.includes('order') || lower.includes('project') || lower.includes('create booking')) {
            intent = 'create_booking';
            action = '/create-booking';
        }
        // Package
        else if (lower.includes('package') || lower.includes('create service') || lower.includes('offer')) {
            intent = 'create_package';
            action = '/create-package';
        }
        // Admin
        else if (lower.includes('admin') || lower.includes('manage') || lower.includes('provider') && (lower.includes('manage') || lower.includes('approve'))) {
            intent = 'admin_panel';
            action = '/admin';
        }
        // Browse talent
        else if (lower.includes('browse') || lower.includes('talent') || lower.includes('marketplace') || lower.includes('find') || lower.includes('search')) {
            intent = 'browse';
            action = '/providers';
        }
        // Fallback
        else {
            intent = 'unknown';
        }

        const replies = {
            greeting: { text: '👋 Hey there! Welcome to Groove Hub. What can I help you with today? Try asking for a "video editor" or "English tutor"!' },
            find_video_editor_urgent: { text: '🎬 Here are active video editors available RIGHT NOW:\n\n' },
            find_video_editor: { text: '🎬 I can help you find video editors! Try these:\n\n• Browse all editors: click "Browse Talent" below\n• Create a booking: click "Create Booking" below\n\nWant me to take you to the marketplace?' },
            find_english_tutor: { text: '🗣️ I can help you find English tutors! Try these:\n\n• Browse tutors: click "Browse Talent" below\n• Create a booking: click "Create Booking" below\n\nLooking for IELTS prep, spoken English, or business English?' },
            find_writer: { text: '✍️ I can help you find writers! Try these:\n\n• Browse writers: click "Browse Talent" below\n• Create a booking: click "Create Booking" below\n\nNeed content writing, copywriting, or creative writing?' },
            edit_profile: { text: '👤 I\'ll take you to your profile page where you can edit your details, bio, and settings.' },
            show_help: { text: '🤖 I\'m Groove, your Groove Hub assistant! Here\'s what I can help with:\n\n🎬 **Video Editors** — "I need a video editor right now"\n🗣️ **English Tutors** — "I want an English coach"\n✍️ **Writers** — "I need someone to write content"\n📦 **Create Package** — "I want to create a service"\n📋 **Create Booking** — "I want to book someone"\n💳 **Payments** — "Where\'s my money" or "payment status"\n👤 **Edit Profile** — "change my profile"\n🔧 **Admin Panel** — "admin" (admins only)\n\nJust type what you need!' },
            payment_status: { text: '💳 I\'ll take you to your payments dashboard where you can see your escrow balance, pending payments, and transaction history.' },
            create_booking: { text: '📋 I\'ll take you to the booking page where you can select a provider and package to get started!' },
            create_package: { text: '📦 I\'ll take you to the package creation page where you can define your service offerings for buyers!' },
            admin_panel: { text: '🔧 I\'ll take you to the admin panel where you can manage providers, bookings, disputes, and platform settings.' },
            browse: { text: '🔍 I\'ll take you to the marketplace where you can browse all available talent. Try filtering by category!' },
            unknown: { text: '🤔 I didn\'t quite catch that. Can you rephrase? Try saying something like:\n\n• "I need a video editor right now"\n• "Find me an English tutor"\n• "I want to hire a writer"\n• "Where\'s my payment"\n• "Take me to admin"\n\nOr just tell me what you\'re looking for in your own words!' }
        };

        const reply = replies[intent] || replies.unknown;
        if (intent === 'find_video_editor_urgent' || intent === 'find_video_editor') {
            reply.text += '\n👉 Click "Browse Talent" below to see all available providers!';
            reply.action = '/providers';
        }
        if (intent === 'find_english_tutor') {
            reply.text += '\n👉 Click "Browse Talent" below to see all available tutors!';
            reply.action = '/providers';
        }
        if (intent === 'find_writer') {
            reply.text += '\n👉 Click "Browse Talent" below to see all available writers!';
            reply.action = '/providers';
        }
        return reply;
    }

    GrooveChat.toggle = function() {
        if (chatVisible) hideChat(); else showChat();
    };
    GrooveChat.hide = hideChat;
    GrooveChat.send = send;

    return container;
}


// =============== FIVERR-STYLE INBOX & DIRECT CHAT COMPONENT ===============

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function MessagesInbox() {
    let conversations = [];
    let activeUserId = window.__selectedChatUserId ? parseInt(window.__selectedChatUserId) : null;
    let activeUserName = window.__selectedChatUserName || '';
    let activeUserRole = 'PROVIDER';
    let messages = [];
    let loadingConvos = true;
    let loadingMsgs = false;
    let pollInterval = null;
    let searchQuery = '';

    async function loadConversations(isPolling = false) {
        if (!currentToken) return;
        if (!isPolling) loadingConvos = true;
        try {
            conversations = await apiFetch('/conversations');
            if (activeUserId) {
                const found = conversations.find(c => c.other_user_id === activeUserId);
                if (found) {
                    activeUserName = found.other_user_name;
                    activeUserRole = found.other_user_type;
                }
            } else if (conversations.length > 0) {
                activeUserId = conversations[0].other_user_id;
                activeUserName = conversations[0].other_user_name;
                activeUserRole = conversations[0].other_user_type;
            }
        } catch (e) {
            console.error('Failed to load conversations', e);
        } finally {
            loadingConvos = false;
            if (!isPolling) {
                mount(renderInbox());
                if (activeUserId) loadMessages();
            } else {
                updateInboxDOM();
            }
        }
    }

    async function loadMessages(isPolling = false) {
        if (!activeUserId || !currentToken) return;
        if (!isPolling) loadingMsgs = true;
        try {
            const fetched = await apiFetch(`/messages/user/${activeUserId}`);
            messages = fetched;
            updateUnreadCountBadge();
        } catch (e) {
            console.error('Failed to load messages', e);
        } finally {
            loadingMsgs = false;
            renderMessagesStream();
        }
    }

    function startPolling() {
        stopPolling();
        pollInterval = setInterval(() => {
            if (window.location.pathname !== '/messages') {
                stopPolling();
                return;
            }
            if (activeUserId) {
                loadMessages(true);
            }
            loadConversations(true);
        }, 3500);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    async function sendMessage(text) {
        if (!text || !text.trim() || !activeUserId) return;
        const clean = text.trim();
        const inputEl = document.getElementById('inbox-message-input');
        if (inputEl) inputEl.value = '';

        const tempId = Date.now();
        messages.push({
            id: tempId,
            sender_id: currentUser?.id,
            receiver_id: activeUserId,
            sender_name: currentUser?.name || 'You',
            message: clean,
            created_at: new Date().toISOString(),
            is_read: false,
            is_flagged: false
        });
        renderMessagesStream();

        try {
            const res = await apiFetch(`/messages/user/${activeUserId}`, {
                method: 'POST',
                body: JSON.stringify({ message: clean })
            });
            const idx = messages.findIndex(m => m.id === tempId);
            if (idx !== -1) messages[idx] = res;
            renderMessagesStream();
            loadConversations(true);
        } catch (err) {
            messages = messages.filter(m => m.id !== tempId);
            renderMessagesStream();
            const isWarning = /warning\s*\(strike 1\)/i.test(err.message || '');
            showToast(err.message, isWarning ? 'info' : 'error');
            // Reload so the sender sees the flagged/388-blocked bubble + admin trail
            try { await loadMessages(true); } catch (_) {}
            loadConversations(true);
        }
    }

    window.__inboxSendMessage = sendMessage;

    window.__selectInboxConversation = (otherId, otherName, otherRole) => {
        activeUserId = otherId;
        activeUserName = otherName;
        activeUserRole = otherRole || 'PROVIDER';
        window.__selectedChatUserId = otherId;
        window.__selectedChatUserName = otherName;

        const container = document.querySelector('.inbox-container');
        if (container) container.classList.add('show-chat');

        document.querySelectorAll('.inbox-item').forEach(item => {
            item.classList.toggle('active', item.dataset.userId == otherId);
        });

        loadMessages();
    };

    window.__inboxMobileBackToList = () => {
        const container = document.querySelector('.inbox-container');
        if (container) container.classList.remove('show-chat');
    };

    function renderInbox() {
        startPolling();

        return el`<div>
            ${renderAppHeader('/messages')}
            ${renderLeftEdgePeekDock('')}
            <div class="inbox-wrapper">
                <div class="inbox-container ${activeUserId ? 'show-chat' : ''}">
                    <!-- Left Sidebar: Conversations List -->
                    <div class="inbox-sidebar">
                        <div class="inbox-sidebar-header">
                            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                <span>💬</span> Direct Messages
                            </h3>
                            <span class="badge badge-info" style="font-size: 0.72rem;">Escrow Protected</span>
                        </div>
                        <div class="inbox-search-box">
                            <input
                                type="text"
                                class="inbox-search-input"
                                placeholder="Search conversations..."
                                oninput="window.__filterInboxConversations(this.value)"
                            />
                        </div>
                        <div class="inbox-conversations-list" id="inbox-conversations-list">
                            ${renderConversationsListHTML()}
                        </div>
                    </div>

                    <!-- Right Pane: Active Chat Conversation -->
                    <div class="inbox-chat-pane">
                        ${renderChatPaneHTML()}
                    </div>
                </div>
            </div>
        </div>`;
    }

    function renderConversationsListHTML() {
        if (loadingConvos) {
            return '<div style="padding: 24px; text-align: center; color: var(--text-muted);"><div class="spinner"></div></div>';
        }

        let filtered = conversations;
        if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = conversations.filter(c => (c.other_user_name || '').toLowerCase().includes(q) || (c.last_message && c.last_message.toLowerCase().includes(q)));
        }

        if (activeUserId && !conversations.some(c => c.other_user_id === activeUserId)) {
            filtered = [{
                other_user_id: activeUserId,
                other_user_name: activeUserName || 'Talent',
                other_user_type: activeUserRole || 'PROVIDER',
                last_message: 'Start talking before ordering a package...',
                last_message_at: new Date().toISOString(),
                unread_count: 0,
                is_draft: true
            }, ...filtered];
        }

        if (filtered.length === 0) {
            return `
                <div style="padding: 36px 20px; text-align: center; color: var(--text-muted); flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">💬</div>
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 6px; font-size: 1rem;">No messages yet</div>
                    <p style="font-size: 0.8rem; line-height: 1.4; margin-bottom: 14px; text-align: center;">Browse verified video editors and english tutors to start talking directly.</p>
                    <button class="btn btn-primary btn-sm" onclick="router('/')">Browse Talent</button>
                </div>
            `;
        }

        return filtered.map(c => {
            const isActive = c.other_user_id === activeUserId;
            const timeStr = formatRelativeTime(c.last_message_at);
            const initial = escapeHTML((c.other_user_name || 'U').charAt(0).toUpperCase());
            const safeName = escapeHTML(c.other_user_name || 'User');
            const jsName = (c.other_user_name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            const roleBadge = c.other_user_type === 'PROVIDER' ? 'Creator' : 'Client';

            return `
                <div class="inbox-item ${isActive ? 'active' : ''}" data-user-id="${c.other_user_id}" onclick="window.__selectInboxConversation(${c.other_user_id}, '${jsName}', '${c.other_user_type}')">
                    <div class="inbox-item-avatar">
                        ${initial}
                        <div class="online-dot"></div>
                    </div>
                    <div class="inbox-item-content">
                        <div class="inbox-item-name">
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeName}</span>
                            <span class="inbox-item-time">${timeStr}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                            <div class="inbox-item-snippet">
                                <span style="font-size: 0.65rem; background: var(--bg-hover); padding: 1px 4px; border-radius: 4px; margin-right: 4px; border: 1px solid var(--border);">${roleBadge}</span>
                                ${escapeHTML(c.last_message || 'No messages')}
                            </div>
                            ${c.unread_count > 0 ? `<span class="inbox-item-unread-badge">${c.unread_count}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderChatPaneHTML() {
        if (!activeUserId) {
            return `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--text-muted);">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 14px;">
                        💬
                    </div>
                    <h3 style="margin: 0 0 6px 0; color: var(--text-primary); font-weight: 800;">Your Groove Hub Inbox</h3>
                    <p style="font-size: 0.85rem; max-width: 380px; line-height: 1.45; margin: 0 0 18px 0;">Select a conversation on the left, or browse talent to talk with creators before placing your order.</p>
                    <button class="btn btn-primary" onclick="router('/')">Explore Creators</button>
                </div>
            `;
        }

        const initial = escapeHTML((activeUserName || 'U').charAt(0).toUpperCase());
        const safeActiveName = escapeHTML(activeUserName || 'Chat');
        const isProviderChat = (activeUserRole || 'PROVIDER') === 'PROVIDER';

        return `
            <!-- Chat Header -->
            <div class="inbox-chat-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="inbox-mobile-back-btn" onclick="window.__inboxMobileBackToList()" style="display: none; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-primary); padding: 4px;">
                        ←
                    </button>
                    <div class="inbox-item-avatar" style="width: 38px; height: 38px; font-size: 0.95rem;">
                        ${initial}
                        <div class="online-dot"></div>
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                            <span>${safeActiveName}</span>
                            <span style="font-size: 0.65rem; padding: 1px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.1); color: var(--success); font-weight: 700;">last seen recently</span>
                        </div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px;">
                            100% Escrow Protected • Instant In-App Chat
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px;">
                    ${isProviderChat
                        ? `<button class="btn btn-primary btn-sm" onclick="selectProvider(${activeUserId})" style="font-weight: 700; display: flex; align-items: center; gap: 6px;"><span>📦 View Packages / Hire</span></button>`
                        : `<button class="btn btn-secondary btn-sm" onclick="window.__selectInboxConversation(${activeUserId}, '${safeActiveName.replace(/'/g, "\\'")}', '${activeUserRole}')" style="font-weight: 700;"><span>👤 View Profile</span></button>`}
                </div>
            </div>

            <!-- Escrow Safety Guarantee Notice (Telegram-style system message) -->
            <div class="inbox-system-message">
                <div class="inbox-system-msg-bubble">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 0.9rem; flex-shrink: 0; margin-top: 1px;">🛡️</span>
                        <div style="flex: 1;">
                            <strong style="color: var(--text-secondary); font-weight: 600;">Platform Trust & Safety</strong>
                            <span style="color: var(--text-muted);"> — Keep all communications and payments on Groove Hub. First violation = warning, repeat sharing of phone numbers, WhatsApp, UPI or off-platform details suspends your account.</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Escrow Safety Notice (Telegram-style system message) -->
            <div class="inbox-system-message" style="padding: 0 16px;">
                <div class="inbox-system-msg-bubble">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 0.9rem; flex-shrink: 0; margin-top: 1px;">🛡️</span>
                        <div style="flex: 1;">
                            <strong style="color: var(--text-secondary); font-weight: 600;">Platform Trust & Safety</strong>
                            <span style="color: var(--text-muted);"> — Keep all communications and payments on Groove Hub. First violation = warning, repeat sharing of phone numbers, WhatsApp, UPI or off-platform details suspends your account.</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Escrow Safety Notice -->
            <div class="inbox-system-message" style="padding: 0 12px 8px;">
                <div class="inbox-system-msg-bubble">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="font-size: 0.9rem; flex-shrink: 0; margin-top: 1px;">🛡️</span>
                        <div style="flex: 1;">
                            <strong style="color: var(--text-secondary); font-weight: 600;">Platform Trust & Safety</strong>
                            <span style="color: var(--text-muted);"> — Keep all communications and payments on Groove Hub. First violation = warning, repeat sharing of phone numbers, WhatsApp, UPI or off-platform details suspends your account.</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Messages Stream -->
            <div class="inbox-messages-stream" id="inbox-messages-stream">
                ${renderMessagesHTML()}
            </div>

            <!-- Bottom Input Bar (Telegram-style: auto-resize, Enter=send, Shift+Enter=newline) -->
            <div class="inbox-chat-input-bar">
                <textarea
                    id="inbox-message-input"
                    class="inbox-chat-textarea"
                    placeholder="Write a message..."
                    rows="1"
                    oninput="this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,120)+'px'"
                    onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.__inboxSendMessage(this.value); }"
                ></textarea>
                <button class="inbox-send-btn" onclick="window.__inboxSendMessage(document.getElementById('inbox-message-input')?.value)" title="Send Message">
                    ➤
                </button>
            </div>
        `;
    }

    function renderMessagesHTML() {
        if (loadingMsgs && messages.length === 0) {
            return '<div style="padding: 24px; text-align: center; color: var(--text-muted);"><div class="spinner"></div></div>';
        }

        if (messages.length === 0) {
            return `
                <div style="margin: auto; text-align: center; padding: 24px; color: var(--text-muted); max-width: 420px;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">👋</div>
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Say hi to ${activeUserName}!</div>
                    <p style="font-size: 0.8125rem; line-height: 1.45;">Discuss project requirements, turnaround times, or revision expectations. When you're ready, click <strong>"View Packages / Hire"</strong> at the top to place your order with 100% Escrow Protection.</p>
                </div>
            `;
        }

        // Telegram-style: date separators + grouped bubbles (avatar only on
        // last message of a sender group) + blue double-tick when read.
        let html = '';
        let lastDateKey = '';
        const dayLabel = (d) => {
            const today = new Date(); today.setHours(0,0,0,0);
            const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
            const dd = new Date(d); dd.setHours(0,0,0,0);
            if (dd.getTime() === today.getTime()) return 'Today';
            if (dd.getTime() === yesterday.getTime()) return 'Yesterday';
            return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        };
        const safeUrl = (u) => {
            const s = String(u || '');
            if (!/^https?:\/\//i.test(s)) return '#';
            return s.replace(/"/g, '%22');
        };
        messages.forEach((m, idx) => {
            const isMe = m.sender_id === currentUser?.id;
            const msgDate = new Date(m.created_at);
            const dateKey = msgDate.toDateString();
            if (dateKey !== lastDateKey) {
                lastDateKey = dateKey;
                html += `<div class="tg-date-separator"><span>${dayLabel(m.created_at)}</span></div>`;
            }
            const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const initial = escapeHTML((m.sender_name || (isMe ? 'You' : 'U')).charAt(0).toUpperCase());
            const next = messages[idx + 1];
            const grouped = next && next.sender_id === m.sender_id && new Date(next.created_at).toDateString() === dateKey;

            if (m.is_flagged) {
                html += `
                    <div class="inbox-msg-row sent flagged">
                        <div class="inbox-msg-bubble-wrap">
                            <div class="inbox-msg-bubble">
                                <div class="inbox-msg-bubble-content">
                                    <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; margin-bottom: 4px;">
                                        <span>🛑 Message Blocked by Safety Guard</span>
                                    </div>
                                    <div style="text-decoration: line-through; opacity: 0.7;">${escapeHTML(m.message)}</div>
                                    <div style="font-size: 0.75rem; margin-top: 4px; font-weight: 600;">
                                        Reason: ${escapeHTML(m.flag_reason || 'Personal contact sharing policy violation')}
                                    </div>
                                </div>
                                <div class="inbox-msg-timestamp" style="color: #ef4444;">Blocked • Not delivered</div>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            html += `
                <div class="inbox-msg-row ${isMe ? 'sent' : 'received'} ${!isMe && !m.is_read ? 'unread' : ''} ${grouped ? 'grouped' : ''}">
                    ${!isMe && !grouped ? `<div class="inbox-msg-avatar">${initial}</div>` : (!isMe ? '<div class="inbox-msg-avatar inbox-msg-avatar-spacer"></div>' : '')}
                    <div class="inbox-msg-bubble-wrap">
                        <div class="inbox-msg-bubble">
                            <div class="inbox-msg-bubble-content">
                                <div class="inbox-msg-text">${escapeHTML(m.message)}</div>
                                ${m.file_url ? `<div class="inbox-msg-attachment"><a href="${safeUrl(m.file_url)}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">📎 Attachment</a></div>` : ''}
                            </div>
                        </div>
                        <div class="inbox-msg-timestamp">
                            ${timeStr}
                            ${isMe ? (m.is_read ? '<span class="tg-ticks tg-ticks-read">✓✓</span>' : '<span class="tg-ticks">✓</span>') : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        return html;
    }

    function renderMessagesStream() {
        const streamEl = document.getElementById('inbox-messages-stream');
        if (streamEl) {
            streamEl.innerHTML = renderMessagesHTML();
            streamEl.scrollTop = streamEl.scrollHeight;
        }
    }

    function updateInboxDOM() {
        const listEl = document.getElementById('inbox-conversations-list');
        if (listEl) listEl.innerHTML = renderConversationsListHTML();
    }

    window.__filterInboxConversations = (q) => {
        searchQuery = q;
        updateInboxDOM();
    };

    loadConversations();
    return renderInbox();
}

// =============== ADMIN CHATS & SAFETY MODERATION VIEW ===============

function AdminChatsView() {
    let chats = [];
    let flaggedMessages = [];
    let loading = true;
    let activeTab = 'all';

    async function loadData() {
        showLoading();
        try {
            const [cList, fList] = await Promise.all([
                apiFetch('/admin/chats'),
                apiFetch('/admin/flagged-messages')
            ]);
            chats = cList || [];
            flaggedMessages = fList || [];
        } catch (e) {
            showToast(e.message, 'error');
        } finally {
            loading = false;
            mount(renderAdminChatsView());
        }
    }

    window.__adminUnblockUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to unblock user "${userName}" (ID: ${userId})? Their account and messaging access will be reinstated.`)) return;
        try {
            const res = await apiFetch(`/admin/users/${userId}/unblock`, { method: 'POST' });
            showToast(res.message || 'User unblocked successfully', 'success');
            loadData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    window.__adminInspectChatTranscript = async (user1Id, user2Id) => {
        try {
            const data = await apiFetch(`/admin/chats/user/${user1Id}/with/${user2Id}`);
            openTranscriptModal(data);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    function openTranscriptModal(data) {
        const u1 = data.user1;
        const u2 = data.user2;
        const msgs = data.messages || [];

        const modal = document.createElement('div');
        modal.className = 'fiverr-escrow-modal';
        modal.innerHTML = `
            <div class="fiverr-escrow-card" style="max-width: 680px; max-height: 85vh; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
                    <div>
                        <h3 style="margin: 0; font-size: 1.15rem; color: var(--text-primary); font-weight: 800;">
                            Conversation Transcript
                        </h3>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 3px;">
                            ${u1.name} (${u1.email}) &harr; ${u2.name} (${u2.email})
                        </div>
                    </div>
                    <button class="modal-close" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                </div>

                <div style="flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: var(--bg-hover); border-radius: 10px; margin-bottom: 16px;">
                    ${msgs.length === 0 ? '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No messages</div>' : msgs.map(m => {
                        const isFlagged = m.is_flagged;
                        const isU1 = m.sender_id === u1.id;
                        return `
                            <div style="padding: 10px 14px; border-radius: 12px; background: ${isFlagged ? 'rgba(239, 68, 68, 0.12)' : (isU1 ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.08)')}; border: 1px solid ${isFlagged ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'};">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.75rem;">
                                    <strong>${m.sender_name}</strong>
                                    <span style="color: var(--text-muted);">${m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                                </div>
                                <div style="font-size: 0.875rem; color: var(--text-primary); word-break: break-word;">
                                    ${escapeHTML(m.message)}
                                </div>
                                ${isFlagged ? `<div style="font-size: 0.75rem; color: #ef4444; font-weight: 700; margin-top: 4px;">🛑 Flagged Violation: ${m.flag_reason || 'Contact exchange attempt'}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 8px;">
                        ${u1.is_blocked ? `<button class="btn btn-sm btn-danger" onclick="window.__adminUnblockUser(${u1.id}, '${u1.name}'); this.closest('.fiverr-escrow-modal').remove();">Unblock ${u1.name}</button>` : ''}
                        ${u2.is_blocked ? `<button class="btn btn-sm btn-danger" onclick="window.__adminUnblockUser(${u2.id}, '${u2.name}'); this.closest('.fiverr-escrow-modal').remove();">Unblock ${u2.name}</button>` : ''}
                    </div>
                    <button class="btn btn-secondary" onclick="this.closest('.fiverr-escrow-modal').remove()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    function renderAdminChatsView() {
        return el`<div>
            ${renderAppHeader('/admin')}
            ${renderLeftEdgePeekDock('')}
            <div class="main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <div class="section-title" style="margin: 0;">💬 Platform Chats & Safety Moderation</div>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 4px 0 0 0;">Inspect user conversations, investigate anti-disintermediation violations, and unblock reinstated users.</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="router('/admin')">← Back to Admin</button>
                </div>

                <!-- Tabs -->
                <div class="tabs mb-4" style="display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                    <button class="tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="window.__setAdminChatTab('all')">
                        All Conversations (${chats.length})
                    </button>
                    <button class="tab-btn ${activeTab === 'flagged' ? 'active' : ''}" onclick="window.__setAdminChatTab('flagged')">
                        ⚠️ Flagged Violations (${flaggedMessages.length})
                    </button>
                </div>

                ${activeTab === 'all' ? renderAllChatsTable() : renderFlaggedViolationsTable()}
            </div>
        </div>`;
    }

    window.__setAdminChatTab = (tab) => {
        activeTab = tab;
        mount(renderAdminChatsView());
    };

    function renderAllChatsTable() {
        if (chats.length === 0) {
            return '<div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">No chat conversations found on platform.</div>';
        }

        return `
            <div class="card" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border); background: var(--bg-hover);">
                            <th style="padding: 12px 16px;">Participant 1</th>
                            <th style="padding: 12px 16px;">Participant 2</th>
                            <th style="padding: 12px 16px;">Messages</th>
                            <th style="padding: 12px 16px;">Safety Status</th>
                            <th style="padding: 12px 16px;">Last Activity</th>
                            <th style="padding: 12px 16px; text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chats.map(c => {
                            const u1 = c.user1;
                            const u2 = c.user2;
                            const hasViolation = c.has_violation;
                            const u1js = (u1.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                            const u2js = (u2.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

                            return `
                                <tr style="border-bottom: 1px solid var(--border); transition: background 0.15s ease;">
                                    <td style="padding: 12px 16px;">
                                        <strong>${escapeHTML(u1.name || '')}</strong> <span class="badge ${u1.user_type === 'PROVIDER' ? 'badge-primary' : 'badge-secondary'}" style="font-size: 0.65rem;">${escapeHTML(u1.user_type || '')}</span>
                                        ${u1.is_blocked ? '<span class="badge badge-danger" style="margin-left: 4px; font-size: 0.65rem;">BLOCKED</span>' : ''}
                                        <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(u1.email || '')}</div>
                                    </td>
                                    <td style="padding: 12px 16px;">
                                        <strong>${escapeHTML(u2.name || '')}</strong> <span class="badge ${u2.user_type === 'PROVIDER' ? 'badge-primary' : 'badge-secondary'}" style="font-size: 0.65rem;">${escapeHTML(u2.user_type || '')}</span>
                                        ${u2.is_blocked ? '<span class="badge badge-danger" style="margin-left: 4px; font-size: 0.65rem;">BLOCKED</span>' : ''}
                                        <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(u2.email || '')}</div>
                                    </td>
                                    <td style="padding: 12px 16px;">
                                        ${c.total_messages} msgs
                                    </td>
                                    <td style="padding: 12px 16px;">
                                        ${hasViolation ? `<span class="badge badge-danger" style="font-size: 0.72rem;">⚠️ ${c.flagged_count} Flagged</span>` : '<span class="badge badge-success" style="font-size: 0.72rem;">✓ Clean</span>'}
                                    </td>
                                    <td style="padding: 12px 16px; color: var(--text-muted); font-size: 0.78rem;">
                                        ${formatRelativeTime(c.latest_message_at)}
                                    </td>
                                    <td style="padding: 12px 16px; text-align: right;">
                                        <div style="display: flex; gap: 6px; justify-content: flex-end;">
                                            <button class="btn btn-secondary btn-sm" onclick="window.__adminInspectChatTranscript(${u1.id}, ${u2.id})">
                                                Inspect
                                            </button>
                                            ${u1.is_blocked ? `<button class="btn btn-primary btn-sm" style="background: #10b981; border-color: #10b981;" onclick="window.__adminUnblockUser(${u1.id}, '${u1js}')">Unblock ${escapeHTML((u1.name || '').split(' ')[0])}</button>` : ''}
                                            ${u2.is_blocked ? `<button class="btn btn-primary btn-sm" style="background: #10b981; border-color: #10b981;" onclick="window.__adminUnblockUser(${u2.id}, '${u2js}')">Unblock ${escapeHTML((u2.name || '').split(' ')[0])}</button>` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderFlaggedViolationsTable() {
        if (flaggedMessages.length === 0) {
            return '<div class="card" style="padding: 30px; text-align: center; color: var(--text-muted);">🎉 Zero flagged violations! All platform chats are complying with platform safety rules.</div>';
        }

        return `
            <div class="card" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border); background: var(--bg-hover);">
                            <th style="padding: 12px 16px;">Offending Sender</th>
                            <th style="padding: 12px 16px;">Target Receiver</th>
                            <th style="padding: 12px 16px;">Blocked Content</th>
                            <th style="padding: 12px 16px;">Violation Type</th>
                            <th style="padding: 12px 16px;">User Status</th>
                            <th style="padding: 12px 16px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${flaggedMessages.map(m => {
                            const sjs = (m.sender.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                            return `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 12px 16px;">
                                    <strong>${escapeHTML(m.sender.name || '')}</strong> (ID: ${m.sender.id})
                                    <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(m.sender.email || '')}</div>
                                </td>
                                <td style="padding: 12px 16px;">
                                    <strong>${escapeHTML(m.receiver.name || '')}</strong>
                                    <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHTML(m.receiver.email || '')}</div>
                                </td>
                                <td style="padding: 12px 16px; max-width: 240px; word-break: break-word;">
                                    <span style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">
                                        ${escapeHTML(m.message)}
                                    </span>
                                </td>
                                <td style="padding: 12px 16px; color: #ef4444; font-weight: 700;">
                                    🛑 ${escapeHTML(m.flag_reason || '')}
                                </td>
                                <td style="padding: 12px 16px;">
                                    ${m.sender.is_blocked ? '<span class="badge badge-danger">BLOCKED</span>' : '<span class="badge badge-warning">WARNED</span>'}
                                </td>
                                <td style="padding: 12px 16px; text-align: right;">
                                    ${m.sender.is_blocked ? `
                                        <button class="btn btn-primary btn-sm" style="background: #10b981; border-color: #10b981;" onclick="window.__adminUnblockUser(${m.sender.id}, '${sjs}')">
                                            Re-instate / Unblock
                                        </button>
                                    ` : `
                                        <span style="color: var(--text-muted); font-size: 0.75rem;">Strike 1 — warn</span>
                                    `}
                                </td>
                            </tr>
                        `;}).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadData();
    return renderAdminChatsView();
}


