;(() => {
  const ROLE_KEY = 'proto_role'

  // 権限の強さ（内包）
  // RP は P と S を含む / P は S を含む
  const ROLE_RANK = {
    NONE: 0,
    S: 1,
    P: 2,
    RP: 3,
  }

  function setRole(role) {
    localStorage.setItem(ROLE_KEY, role)
  }

  function getRole() {
    return localStorage.getItem(ROLE_KEY) || 'NONE'
  }

  function clearRole() {
    localStorage.removeItem(ROLE_KEY)
  }

  function roleLabel(role) {
    if (role === 'S') return 'S サポーター'
    if (role === 'P') return 'P プロ'
    if (role === 'RP') return 'RP ロールプレイ'
    return '未選択'
  }

  // 例: role=RP required=P => true
  // 例: role=S  required=P => false
  function hasAccess(role, requiredMinRole) {
    const r = ROLE_RANK[role] ?? 0
    const m = ROLE_RANK[requiredMinRole] ?? 0
    return r >= m
  }

  function renderRoleBadge() {
    const el = document.querySelector('[data-role-badge]')
    if (!el) return
    const role = getRole()
    el.textContent = '現在の表示 ' + roleLabel(role)
  }

  function wireRoleButtons() {
    const changeBtn = document.querySelector('[data-role-change]')
    if (changeBtn) {
      changeBtn.addEventListener('click', () => {
        location.href = 'login.html'
      })
    }

    const clearBtn = document.querySelector('[data-role-clear]')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearRole()
        location.href = 'index.html'
      })
    }
  }

  // ページガード（data-require-role は「最低必要ロール」）
  // s_library: S => S/P/RPが通る
  // p_library: P => P/RPが通る
  // rp_info: RP => RPのみ通る
  function autoGuard() {
    const req = document.body.getAttribute('data-require-role')
    if (!req) return

    const role = getRole()
    const requiredMin = req.trim()
    if (!hasAccess(role, requiredMin)) {
      location.href = 'index.html'
    }
  }

  // indexなどのボタンをグレーアウト
  // data-min-role を付けたリンク/ボタンを対象にする
  function applyAccessUI() {
    const role = getRole()
    const nodes = document.querySelectorAll('[data-min-role]')
    nodes.forEach(node => {
      const minRole = (node.getAttribute('data-min-role') || '').trim()
      if (!minRole) return

      const ok = hasAccess(role, minRole)
      if (ok) {
        node.classList.remove('opacity-40', 'pointer-events-none')
        node.removeAttribute('aria-disabled')
        return
      }

      node.classList.add('opacity-40', 'pointer-events-none')
      node.setAttribute('aria-disabled', 'true')
    })
  }

  window.ProtoAuth = { setRole, getRole, clearRole, roleLabel, hasAccess }

  document.addEventListener('DOMContentLoaded', () => {
    autoGuard()
    renderRoleBadge()
    wireRoleButtons()
    applyAccessUI()
  })
})()
