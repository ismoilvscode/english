// Admin panel — танҳо барои ADMIN_ID
function initAdminPanel() {
  if (!IS_ADMIN) return;

  // Гирифтани рӯйхати корбарон (localStorage demo)
  const users = store.get('allUsers', {});

  // Ҳисобкунӣ
  const totalUsers = Object.keys(users).length || 1;
  const premiumUsers = Object.values(users).filter(u => u.premium?.active).length;

  document.getElementById('adminTotalUsers').textContent = totalUsers;
  document.getElementById('adminPremiumUsers').textContent = premiumUsers;

  // Тугмаҳои тест
  document.querySelectorAll('[data-admin-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.adminAction;
      if (action === 'give-premium') {
        const plan = document.getElementById('adminPlanSelect').value;
        approvePremium(user.id, plan);
      }
      if (action === 'reset-progress') {
        if (confirm('Ҳамаи пешрафтро нест кунед?')) {
          progress = { completedLessons: [], testScores: {}, streak: 0, lastVisit: null };
          store.set('progress', progress);
          renderAll();
          showToast('Пешрафт нест шуд');
        }
      }
      if (action === 'reset-premium') {
        premium = { active: false, plan: null, startedAt: null, expiresAt: null, paymentStatus: 'none' };
        store.set('premium', premium);
        updatePremiumUI();
        renderProfile();
        showToast('Premium нест шуд');
      }
      if (action === 'unlock-all') {
        progress.completedLessons = LESSONS.map(l => l.id);
        store.set('progress', progress);
        renderAll();
        showToast('Ҳамаи дарсҳо кушода шуданд');
      }
    });
  });
}

window.addEventListener('load', () => setTimeout(initAdminPanel, 2000));