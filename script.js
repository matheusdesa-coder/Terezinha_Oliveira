/* ============================================================
   TEREZINHA OLIVEIRA – JavaScript
   Funcionalidades: Navbar, Calendário, Agendamento, Reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===========================
  // 1. NAVBAR – Scroll & Mobile
  // ===========================
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNav();
  });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Fecha menu ao clicar em link
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);

      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          allNavLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }

  // ===========================
  // 2. REVEAL ON SCROLL
  // ===========================
  const revealElements = document.querySelectorAll(
    '.service-card, .gallery-item, .shop-card, .contact-card'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 80 * i);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===========================
  // 3. CALENDÁRIO DE AGENDAMENTO
  // ===========================
  const WEEKDAYS_CLOSED = [0, 1]; // Dom=0, Seg=1
  const WORK_HOURS = ['09:00','09:30','10:00','10:30','11:00','11:30',
                       '13:00','13:30','14:00','14:30','15:00','15:30',
                       '16:00','16:30','17:00','17:30','18:00','18:30'];
  const SAT_HOURS   = ['09:00','09:30','10:00','10:30','11:00','11:30',
                       '13:00','13:30','14:00','14:30','15:00','15:30',
                       '16:00','16:30'];

  // Simulação de horários ocupados (dia como "YYYY-MM-DD" -> array de horas)
  const BOOKED = {
    // exemplos
  };

  let currentDate  = new Date();
  let currentYear  = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  function buildCalendar(year, month) {
    const calTitle = document.getElementById('cal-title');
    const calDays  = document.getElementById('calendar-days');
    calTitle.textContent = `${MONTHS_PT[month]} ${year}`;
    calDays.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calDays.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'cal-day';
      dayEl.textContent = d;

      const thisDate = new Date(year, month, d);
      thisDate.setHours(0,0,0,0);
      const dayOfWeek = thisDate.getDay();

      const isToday = thisDate.getTime() === today.getTime();
      const isPast  = thisDate < today;
      const isClosed = WEEKDAYS_CLOSED.includes(dayOfWeek);

      if (isToday) dayEl.classList.add('today');
      if (isPast)  dayEl.classList.add('past');
      if (isClosed) dayEl.classList.add('weekend-closed');

      if (!isPast && !isClosed) {
        dayEl.addEventListener('click', () => selectDay(d, year, month, dayEl));
      }

      calDays.appendChild(dayEl);
    }

    // Restore selected day highlight
    if (selectedDate) {
      const sd = new Date(selectedDate);
      if (sd.getFullYear() === year && sd.getMonth() === month) {
        const days = calDays.querySelectorAll('.cal-day:not(.empty)');
        const idx = sd.getDate() - 1;
        if (days[idx]) days[idx].classList.add('selected');
      }
    }
  }

  function selectDay(day, year, month, el) {
    // Remove seleção anterior
    document.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');

    const date = new Date(year, month, day);
    selectedDate = date.toISOString().split('T')[0];
    selectedTime = null;

    const weekday = date.getDay();
    const label = document.getElementById('selected-date-label');
    const WEEKDAYS_LABEL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    label.textContent = `Horários – ${WEEKDAYS_LABEL[weekday]}, ${day} de ${MONTHS_PT[month]}`;

    renderTimes(weekday);
    updateSummary();
  }

  function renderTimes(weekday) {
    const timesGrid = document.getElementById('times-grid');
    timesGrid.innerHTML = '';

    const hours = weekday === 6 ? SAT_HOURS : WORK_HOURS;
    const booked = BOOKED[selectedDate] || [];

    hours.forEach(h => {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.textContent = h;

      if (booked.includes(h)) {
        slot.classList.add('unavailable');
        slot.title = 'Horário indisponível';
      } else {
        slot.addEventListener('click', () => {
          document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
          slot.classList.add('selected');
          selectedTime = h;
          updateSummary();
        });
      }

      timesGrid.appendChild(slot);
    });
  }

  function updateSummary() {
    const summaryEl = document.getElementById('booking-summary');
    const summaryText = document.getElementById('summary-text');

    if (selectedDate && selectedTime) {
      const [y, m, d] = selectedDate.split('-');
      summaryText.innerHTML = `📅 <strong>${d}/${m}/${y}</strong> às <strong>${selectedTime}</strong>`;
      summaryEl.style.display = 'block';
    } else if (selectedDate) {
      summaryText.innerHTML = `📅 <strong>${selectedDate}</strong> — selecione um horário acima`;
      summaryEl.style.display = 'block';
    } else {
      summaryEl.style.display = 'none';
    }
  }

  // Navegação de mês
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    buildCalendar(currentYear, currentMonth);
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    buildCalendar(currentYear, currentMonth);
  });

  buildCalendar(currentYear, currentMonth);

  // ===========================
  // 4. FORMULÁRIO DE AGENDAMENTO
  // ===========================
  const bookingForm = document.getElementById('booking-form');

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('client-name').value.trim();
    const phone   = document.getElementById('client-phone').value.trim();
    const service = document.getElementById('client-service').value;
    const notes   = document.getElementById('client-notes').value.trim();

    if (!name || !phone || !service) {
      shake(bookingForm);
      showToast('Por favor, preencha os campos obrigatórios!', 'error');
      return;
    }

    if (!selectedDate) {
      showToast('Por favor, selecione uma data no calendário!', 'error');
      return;
    }

    if (!selectedTime) {
      showToast('Por favor, selecione um horário!', 'error');
      return;
    }

    const [y, m, d] = selectedDate.split('-');
    let message = `Olá Terezinha! 😊 Gostaria de agendar um horário:\n\n`;
    message += `👤 *Nome:* ${name}\n`;
    message += `📅 *Data:* ${d}/${m}/${y}\n`;
    message += `🕐 *Horário:* ${selectedTime}\n`;
    message += `💅 *Serviço:* ${service}\n`;
    if (notes) message += `📝 *Observações:* ${notes}\n`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5519998541459?text=${encoded}`, '_blank');
    showToast('Redirecionando para o WhatsApp! ✅', 'success');
  });

  // ===========================
  // 5. TOAST NOTIFICATIONS
  // ===========================
  function showToast(msg, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '100px',
      right: '24px',
      background: type === 'error' ? '#e74c3c' : (type === 'success' ? '#27ae60' : '#2a1810'),
      color: 'white',
      padding: '14px 22px',
      borderRadius: '40px',
      fontFamily: "'Inter', sans-serif",
      fontSize: '.9rem',
      fontWeight: '600',
      zIndex: '9999',
      boxShadow: '0 8px 30px rgba(0,0,0,.25)',
      animation: 'fadeUp .4s ease both',
      maxWidth: '320px',
    });

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // ===========================
  // 6. SHAKE ANIMATION
  // ===========================
  function shake(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake .4s ease';
    setTimeout(() => el.style.animation = '', 500);
  }

  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-6px)}
      80%{transform:translateX(6px)}
    }
  `;
  document.head.appendChild(shakeStyle);

  // ===========================
  // 7. GALERIA – Lightbox simples
  // ===========================
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const overlay = item.querySelector('.gallery-overlay span');
      openLightbox(img.src, img.alt, overlay ? overlay.textContent : '');
    });
  });

  function openLightbox(src, alt, caption) {
    const lb = document.createElement('div');
    Object.assign(lb.style, {
      position: 'fixed', inset: '0', zIndex: '9998',
      background: 'rgba(0,0,0,.88)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', cursor: 'zoom-out',
      animation: 'fadeUp .3s ease',
    });

    const image = document.createElement('img');
    Object.assign(image.style, {
      maxWidth: '90%', maxHeight: '80vh', borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0,0,0,.5)',
    });
    image.src = src;
    image.alt = alt;

    const cap = document.createElement('p');
    Object.assign(cap.style, {
      color: 'rgba(255,255,255,.7)', marginTop: '14px',
      fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontStyle: 'italic',
    });
    cap.textContent = caption;

    lb.appendChild(image);
    lb.appendChild(cap);
    document.body.appendChild(lb);

    lb.addEventListener('click', () => lb.remove());
    document.addEventListener('keydown', function closeKey(e) {
      if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', closeKey); }
    });
  }

  // ===========================
  // 8. MÁSCARA DE TELEFONE
  // ===========================
  const phoneInput = document.getElementById('client-phone');
  phoneInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length <= 10) {
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    e.target.value = v.replace(/-$/, '');
  });

  console.log('%c✦ Terezinha Oliveira – Site carregado com sucesso!', 
    'color: #c8856a; font-size: 16px; font-weight: bold;');
});
