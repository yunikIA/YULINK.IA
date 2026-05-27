document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     THEME TOGGLE
     ========================================== */
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

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
     CARGAR DATOS DESDE FIRESTORE
     ========================================== */
  let contactData = {};

  db.collection('contact').doc('main').onSnapshot((doc) => {
    if (doc.exists) {
      contactData = doc.data();
      renderContact(contactData);
    }
  }, (err) => {
    console.warn('Firestore no disponible, usando datos default', err);
  });

  function renderContact(d) {
    const qs = (selector) => document.querySelector(selector);
    const setVal = (id, val) => {
      const el = qs('#' + id + ' .contact-value');
      if (el) el.textContent = val;
    };
    const setHref = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('href', val);
    };

    if (d.email) {
      setVal('contactEmail', d.email);
      setHref('contactEmail', 'mailto:' + d.email);
    }
    if (d.phone) {
      setVal('contactPhone', d.phone);
      setHref('contactPhone', 'tel:' + d.phone.replace(/[^+\d]/g, ''));
    }
    if (d.whatsapp) {
      const wa = d.whatsapp.replace(/[^+\d]/g, '');
      setHref('contactWhatsapp', 'https://wa.me/' + wa + '?text=Hola%20yulink.IA');
    }
    if (d.instagram) {
      const ig = d.instagram.replace('@', '');
      setVal('contactInstagram', d.instagram.startsWith('@') ? d.instagram : '@' + d.instagram);
      setHref('contactInstagram', 'https://instagram.com/' + ig);
    }
    if (d.linkedin) {
      const li = d.linkedin.startsWith('http') ? d.linkedin : 'https://' + d.linkedin;
      setVal('contactLinkedin', d.linkedin);
      setHref('contactLinkedin', li);
    }
    if (d.address) {
      setVal('contactAddress', d.address);
    }

    // Footer
    const footerLinks = document.getElementById('footerLinks');
    if (footerLinks) {
      footerLinks.innerHTML = '';
      if (d.email) {
        const a = document.createElement('a');
        a.href = 'mailto:' + d.email;
        a.textContent = d.email;
        footerLinks.appendChild(a);
      }
      if (d.instagram) {
        const a = document.createElement('a');
        const ig = d.instagram.replace('@', '');
        a.href = 'https://instagram.com/' + ig;
        a.textContent = d.instagram.startsWith('@') ? d.instagram : '@' + d.instagram;
        footerLinks.appendChild(a);
      }
    }
  }

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

  const responses = {
    '¿Qué es yulink.IA?':
      'yulink.IA es una empresa de automatización inteligente. Creamos soluciones con IA para que tu negocio trabaje solo. 🚀',
    'Ver servicios':
      'Ofrecemos chatbots, automatización de procesos, análisis de datos, integraciones API y consultoría IA. ¡Todo para escalar tu negocio!',
    'Contactar':
      'Podés escribirnos a info@yulink.ai o seguirnos en @yulink_ia. ¡Respondemos rápido! ⚡',
  };

  function addMsg(text, type, html) {
    const m = document.createElement('div');
    m.className = 'msg ' + type;
    if (html) {
      m.innerHTML = text;
    } else {
      m.textContent = text;
    }
    chatMessages.appendChild(m);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  yuniBtn.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    yuniBubble.style.display = 'none';
  });

  chatClose.addEventListener('click', () => {
    chatPanel.classList.remove('open');
  });

  // ===========================
  // WHATSAPP SMART DETECTION
  // ===========================
  const waKeywords = [
    'contactar', 'hablar', 'whatsapp', 'teléfono', 'telefono',
    'humano', 'ayuda real', 'persona', 'soporte', 'asesor',
    'hablar con alguien', 'quiero hablar', 'atención', 'contacto'
  ];

  function shouldOfferWhatsApp(msg) {
    const lower = msg.toLowerCase();
    return waKeywords.some(kw => lower.includes(kw));
  }

  function offerWhatsApp(waNumber) {
    const num = (waNumber || '').replace(/[^+\d]/g, '') || '5491123456789';
    const url = 'https://wa.me/' + num + '?text=Hola%20yulink.IA%20-%20vengo%20del%20chat';
    const btnHtml = `
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
        <span>¿Querés hablar con alguien? Chateá directo por WhatsApp 👇</span>
        <a href="${url}" target="_blank" style="
          display:inline-flex;align-items:center;gap:8px;
          background:#25D366;color:#fff;padding:10px 18px;
          border-radius:10px;text-decoration:none;font-weight:500;
          font-size:0.9rem;align-self:flex-start;
        ">💬 Chatear por WhatsApp</a>
      </div>
    `;
    addMsg(btnHtml, 'bot', true);
  }

  // Opciones rápidas
  chatOpts.addEventListener('click', e => {
    const opt = e.target.closest('.chat-opt');
    if (!opt) return;
    const msg = opt.dataset.msg;
    addMsg(msg, 'user');
    setTimeout(() => {
      if (msg === 'Contactar' || shouldOfferWhatsApp(msg)) {
        addMsg(responses[msg] || '¡Claro! Ahora te conectamos.', 'bot');
        setTimeout(() => offerWhatsApp(contactData.whatsapp), 600);
      } else {
        addMsg(responses[msg] || '¡Claro! Pronto te respondo.', 'bot');
      }
    }, 600);
  });

  // Enviar mensaje manual
  function sendChat() {
    const val = chatInput.value.trim();
    if (!val) return;
    addMsg(val, 'user');
    chatInput.value = '';

    setTimeout(() => {
      if (shouldOfferWhatsApp(val)) {
        addMsg('¡Gracias por tu mensaje! Por cualquier consulta, podés hablarnos directo por WhatsApp. 🤝', 'bot');
        setTimeout(() => offerWhatsApp(contactData.whatsapp), 600);
      } else {
        const fallback = '¡Gracias por tu mensaje! En breve alguien del equipo de yulink.IA te contactará. 🤝';
        addMsg(fallback, 'bot');
      }
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
