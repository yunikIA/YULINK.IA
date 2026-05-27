/* =============================================
   yulink.IA — JavaScript principal
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     TOGGLE DE TEMA (claro / oscuro)
     ========================================== */
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Aplicar tema guardado si existe
  const savedTheme = localStorage.getItem('yulink-theme') || 'dark';
  html.dataset.theme = savedTheme;
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const isDark = html.dataset.theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    html.dataset.theme = newTheme;
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('yulink-theme', newTheme);
  });


  /* ==========================================
     CHAT FLOTANTE — YULI
     ========================================== */
  const yuniBtn      = document.getElementById('yuniBtn');
  const chatPanel    = document.getElementById('chatPanel');
  const chatClose    = document.getElementById('chatClose');
  const yuniBubble   = document.getElementById('yuniBubble');
  const chatMessages = document.getElementById('chatMessages');
  const chatOpts     = document.getElementById('chatOpts');
  const chatInput    = document.getElementById('chatInput');
  const chatSend     = document.getElementById('chatSend');

  // Respuestas rápidas — editá acá para personalizar
  const responses = {
    '¿Qué es yulink.IA?':
      'yulink.IA es una empresa de automatización inteligente. Creamos soluciones con IA para que tu negocio trabaje solo. 🚀',
    'Ver servicios':
      'Ofrecemos chatbots, automatización de procesos, análisis de datos, integraciones API y consultoría IA. ¡Todo para escalar tu negocio!',
    'Contactar':
      'Podés escribirnos a info@yulink.ai o seguirnos en @yulink_ia. ¡Respondemos rápido! ⚡',
  };

  // Agregar mensaje al chat
  function addMsg(text, type) {
    const m = document.createElement('div');
    m.className = `msg ${type}`;
    m.textContent = text;
    chatMessages.appendChild(m);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Abrir / cerrar panel
  yuniBtn.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    yuniBubble.style.display = 'none';
  });

  chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
  });

  // Opciones rápidas
  chatOpts.addEventListener('click', e => {
    const opt = e.target.closest('.chat-opt');
    if (!opt) return;
    const msg = opt.dataset.msg;
    addMsg(msg, 'user');
    setTimeout(() => {
      addMsg(responses[msg] || '¡Claro! Pronto te respondo.', 'bot');
    }, 600);
  });

  // Enviar mensaje manual
  function sendChat() {
    const val = chatInput.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    chatInput.value = '';
    setTimeout(() => {
      addMsg('¡Gracias por tu mensaje! En breve alguien del equipo de yulink.IA te contactará. 🤝', 'bot');
    }, 700);
  }

  chatSend.addEventListener('click', sendChat);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
  });

  // Ocultar burbuja después de 6 segundos
  setTimeout(() => {
    yuniBubble.style.transition = 'opacity 0.5s';
    yuniBubble.style.opacity = '0';
    setTimeout(() => {
      yuniBubble.style.display = 'none';
    }, 500);
  }, 6000);

});
