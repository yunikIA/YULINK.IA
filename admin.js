/* =============================================
   yulink.IA — Admin Panel
   ============================================= */

const loginScreen       = document.getElementById('loginScreen');
const unauthorizedScreen = document.getElementById('unauthorizedScreen');
const dashboardScreen   = document.getElementById('dashboardScreen');
const adminEmailDisplay = document.getElementById('adminEmailDisplay');

const btnGoogleLogin    = document.getElementById('btnGoogleLogin');
const loginError        = document.getElementById('loginError');

let currentUser = null;

// =============================
// ON AUTH STATE CHANGED
// =============================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const isAdmin = await checkIsAdmin(user.email);
    if (isAdmin) {
      showDashboard(user);
    } else {
      showUnauthorized(user);
    }
  } else {
    showLogin();
  }
});

// =============================
// LOGIN CON GOOGLE
// =============================
btnGoogleLogin.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => {
    loginError.textContent = err.message;
  });
});

// =============================
// CHECKEAR SI ES ADMIN
// =============================
async function checkIsAdmin(email) {
  try {
    const doc = await db.collection('admins').doc(email).get();
    return doc.exists;
  } catch {
    return false;
  }
}

// =============================
// MOSTRAR PANTALLAS
// =============================
function showLogin() {
  loginScreen.style.display       = 'flex';
  unauthorizedScreen.style.display = 'none';
  dashboardScreen.style.display   = 'none';
}

function showUnauthorized(user) {
  loginScreen.style.display       = 'none';
  unauthorizedScreen.style.display = 'flex';
  dashboardScreen.style.display   = 'none';
}

function showDashboard(user) {
  loginScreen.style.display       = 'none';
  unauthorizedScreen.style.display = 'none';
  dashboardScreen.style.display   = 'block';
  adminEmailDisplay.textContent   = user.email;
  loadContactData();
  loadAdmins();
}

// =============================
// LOGOUT
// =============================
function logout() {
  auth.signOut();
}

// =============================
// TABS
// =============================
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.add('active');
  });
});

// =============================
// CONTACTO — CARGAR
// =============================
async function loadContactData() {
  try {
    const doc = await db.collection('contact').doc('main').get();
    if (doc.exists) {
      const d = doc.data();
      document.getElementById('fieldEmail').value     = d.email     || '';
      document.getElementById('fieldPhone').value     = d.phone     || '';
      document.getElementById('fieldWhatsapp').value  = d.whatsapp  || '';
      document.getElementById('fieldInstagram').value = d.instagram || '';
      document.getElementById('fieldLinkedin').value  = d.linkedin  || '';
      document.getElementById('fieldAddress').value   = d.address   || '';
    }
  } catch (err) {
    showToast('contactToast', 'Error al cargar: ' + err.message, 'error');
  }
}

// =============================
// CONTACTO — GUARDAR
// =============================
document.getElementById('btnSaveContact').addEventListener('click', async () => {
  const data = {
    email:     document.getElementById('fieldEmail').value.trim(),
    phone:     document.getElementById('fieldPhone').value.trim(),
    whatsapp:  document.getElementById('fieldWhatsapp').value.trim(),
    instagram: document.getElementById('fieldInstagram').value.trim(),
    linkedin:  document.getElementById('fieldLinkedin').value.trim(),
    address:   document.getElementById('fieldAddress').value.trim()
  };

  try {
    await db.collection('contact').doc('main').set(data);
    showToast('contactToast', '✅ Datos guardados correctamente', 'success');
  } catch (err) {
    showToast('contactToast', 'Error al guardar: ' + err.message, 'error');
  }
});

// =============================
// ADMINS — CARGAR LISTA
// =============================
let adminsCache = [];

async function loadAdmins() {
  try {
    const snapshot = await db.collection('admins').get();
    adminsCache = [];
    const list = document.getElementById('adminsList');
    list.innerHTML = '';

    snapshot.forEach(doc => {
      adminsCache.push(doc.id);
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${doc.id}</span>
        <button class="remove-btn" data-email="${doc.id}">Eliminar</button>
      `;
      list.appendChild(li);
    });

    // Event listeners a botones eliminar
    list.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeAdmin(btn.dataset.email));
    });
  } catch (err) {
    showToast('adminsToast', 'Error al cargar admins: ' + err.message, 'error');
  }
}

// =============================
// ADMINS — AGREGAR
// =============================
document.getElementById('btnAddAdmin').addEventListener('click', async () => {
  const email = document.getElementById('fieldNewAdmin').value.trim().toLowerCase();
  if (!email) return;

  try {
    await db.collection('admins').doc(email).set({ role: 'admin' });
    document.getElementById('fieldNewAdmin').value = '';
    showToast('adminsToast', `✅ ${email} agregado como admin`, 'success');
    loadAdmins();
  } catch (err) {
    showToast('adminsToast', 'Error: ' + err.message, 'error');
  }
});

document.getElementById('fieldNewAdmin').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnAddAdmin').click();
});

// =============================
// ADMINS — ELIMINAR
// =============================
async function removeAdmin(email) {
  if (email === currentUser.email) {
    showToast('adminsToast', '⚠️ No podés eliminarte a vos mismo', 'error');
    return;
  }
  if (!confirm(`¿Eliminar a ${email}?`)) return;

  try {
    await db.collection('admins').doc(email).delete();
    showToast('adminsToast', `🗑️ ${email} eliminado`, 'success');
    loadAdmins();
  } catch (err) {
    showToast('adminsToast', 'Error: ' + err.message, 'error');
  }
}

// =============================
// TOAST HELPER
// =============================
function showToast(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'admin-toast ' + (type || '');
  setTimeout(() => { el.textContent = ''; el.className = 'admin-toast'; }, 4000);
}
