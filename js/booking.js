/**
 * J&R Barbearia - Módulo do Fluxo do Cliente (Agendamento Público)
 */
class JRBookingManager {
  constructor() {
    this.selectedBarberId = 'juliano';
    this.selectedServiceId = 'cabelo';
    this.selectedDate = '';
    this.selectedTime = '';
    this.barbersData = [];
    this.servicesData = [];
    this.bookedSlots = [];
    this.currentPendingAppointment = null;
  }

  async init() {
    await this.loadBarbersAndServices();
    this.setupPhoneMask();
    this.setupDateConstraints();
    this.bindEvents();
    this.selectDefaultDate();
    this.updateSummaryPrice();
  }

  async loadBarbersAndServices() {
    this.barbersData = await window.JR_DB.getBarbers();
    this.servicesData = await window.JR_DB.getServices();
    this.renderBarbers();
    this.renderServices();
  }

  // Renderiza os cards de Juliano e Robert com fotos e preços atuais
  renderBarbers() {
    const container = document.getElementById('barberSelectionContainer');
    if (!container) return;

    container.innerHTML = this.barbersData.map(barber => {
      const isSelected = barber.id === this.selectedBarberId;
      return `
        <div class="barber-card ${isSelected ? 'selected' : ''}" data-barber-id="${barber.id}">
          <div class="barber-avatar-wrap">
            <img src="${barber.avatar || './assets/icon.svg'}" alt="${barber.nome}" class="barber-avatar" />
            <div class="barber-status-badge">
              <span class="pulse-dot"></span> Disponível
            </div>
          </div>
          <div class="barber-info">
            <h3 class="barber-name">${barber.nome}</h3>
            <p class="barber-tag">Especialista J&R</p>
            <div class="barber-prices-pill">
              <span>Cabelo: <strong>R$ ${Number(barber.preco_cabelo).toFixed(2).replace('.', ',')}</strong></span>
              <span>Barba: <strong>R$ ${Number(barber.preco_barba).toFixed(2).replace('.', ',')}</strong></span>
            </div>
          </div>
          <div class="selection-indicator">
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      `;
    }).join('');

    // Adiciona cliques nos cards dos barbeiros
    container.querySelectorAll('.barber-card').forEach(card => {
      card.addEventListener('click', () => {
        const bId = card.getAttribute('data-barber-id');
        this.selectBarber(bId);
      });
    });
  }

  // Atualiza barbeiro selecionado e recalcula preços de serviços
  selectBarber(barberId) {
    this.selectedBarberId = barberId;
    document.querySelectorAll('.barber-card').forEach(card => {
      if (card.getAttribute('data-barber-id') === barberId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    this.renderServices();
    this.updateSummaryPrice();
    if (this.selectedDate) {
      this.refreshAvailableSlots();
    }
  }

  // Calcula preço do serviço baseado no barbeiro selecionado
  getServicePrice(serviceId) {
    const barber = this.barbersData.find(b => b.id === this.selectedBarberId) || {
      preco_cabelo: 35.00,
      preco_barba: 20.00
    };

    if (serviceId === 'cabelo') {
      return Number(barber.preco_cabelo);
    } else if (serviceId === 'barba') {
      return Number(barber.preco_barba);
    } else if (serviceId === 'cabelo_barba') {
      // Combo Cabelo + Barba
      return Number(barber.preco_cabelo) + Number(barber.preco_barba);
    }
    return 35.00;
  }

  renderServices() {
    const container = document.getElementById('serviceSelectionContainer');
    if (!container) return;

    const services = [
      { id: 'cabelo', nome: 'Corte de Cabelo', icon: '✂️', duracao: '30 min', desc: 'Fade, degradê, tesoura e acabamento impecável.' },
      { id: 'barba', nome: 'Apenas Barba', icon: '🪒', duracao: '30 min', desc: 'Barboterapia com toalha quente, navalha e hidratação.' },
      { id: 'cabelo_barba', nome: 'Cabelo e Barba', icon: '👑', duracao: '30 min', desc: 'Combo completo para renovação total do visual.' }
    ];

    container.innerHTML = services.map(srv => {
      const isSelected = srv.id === this.selectedServiceId;
      const price = this.getServicePrice(srv.id);
      return `
        <div class="service-card ${isSelected ? 'selected' : ''}" data-service-id="${srv.id}">
          <div class="service-header">
            <span class="service-icon">${srv.icon}</span>
            <div class="service-titles">
              <h4 class="service-name">${srv.nome}</h4>
              <span class="service-duration">⏱️ ${srv.duracao}</span>
            </div>
            <div class="service-price">R$ ${price.toFixed(2).replace('.', ',')}</div>
          </div>
          <p class="service-desc">${srv.desc}</p>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', () => {
        const sId = card.getAttribute('data-service-id');
        this.selectService(sId);
      });
    });
  }

  selectService(serviceId) {
    this.selectedServiceId = serviceId;
    document.querySelectorAll('.service-card').forEach(card => {
      if (card.getAttribute('data-service-id') === serviceId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
    this.updateSummaryPrice();
  }

  // Máscara dinâmica de telefone brasileiro (XX) XXXXX-XXXX
  setupPhoneMask() {
    const phoneInput = document.getElementById('clienteTelefone');
    if (!phoneInput) return;

    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);

      if (val.length <= 2) {
        e.target.value = val.length ? `(${val}` : '';
      } else if (val.length <= 6) {
        e.target.value = `(${val.slice(0, 2)}) ${val.slice(2)}`;
      } else if (val.length <= 10) {
        e.target.value = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
      } else {
        e.target.value = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`;
      }
    });
  }

  // Configura regras do calendário (Terça a Sábado, Domingo e Segunda desabilitados)
  setupDateConstraints() {
    const dateInput = document.getElementById('appointmentDate');
    if (!dateInput) return;

    const today = new Date();
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    // Mínimo hoje
    dateInput.min = formatDate(today);

    // Máximo 45 dias no futuro
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 45);
    dateInput.max = formatDate(maxDate);

    // Ao alterar data
    dateInput.addEventListener('change', () => {
      this.validateAndSetDate(dateInput.value);
    });

    // Gera lista rápida de dias da semana elegíveis
    this.renderQuickDates();
  }

  // Renderiza botões rápidos com os próximos dias úteis (Ter a Sáb)
  renderQuickDates() {
    const container = document.getElementById('quickDatesContainer');
    if (!container) return;

    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const buttons = [];

    const now = new Date();
    let count = 0;
    let daysAhead = 0;

    while (count < 6 && daysAhead < 20) {
      const d = new Date();
      d.setDate(now.getDate() + daysAhead);
      const dayOfWeek = d.getDay();

      // Regra estrita: Barbeiros atendem apenas de Terça (2) a Sábado (6)
      if (dayOfWeek !== 0 && dayOfWeek !== 1) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${dayStr}`;

        buttons.push({
          iso,
          labelDay: weekDaysShort[dayOfWeek],
          labelDate: `${dayStr} ${monthsShort[d.getMonth()]}`
        });
        count++;
      }
      daysAhead++;
    }

    container.innerHTML = buttons.map((b, idx) => `
      <button type="button" class="quick-date-btn ${idx === 0 ? 'active' : ''}" data-date="${b.iso}">
        <span class="day-name">${b.labelDay}</span>
        <span class="day-num">${b.labelDate}</span>
      </button>
    `).join('');

    container.querySelectorAll('.quick-date-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.quick-date-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dateVal = btn.getAttribute('data-date');
        const dateInput = document.getElementById('appointmentDate');
        if (dateInput) dateInput.value = dateVal;
        this.validateAndSetDate(dateVal);
      });
    });
  }

  selectDefaultDate() {
    const quickBtn = document.querySelector('.quick-date-btn.active');
    if (quickBtn) {
      const dateVal = quickBtn.getAttribute('data-date');
      const dateInput = document.getElementById('appointmentDate');
      if (dateInput) dateInput.value = dateVal;
      this.validateAndSetDate(dateVal);
    }
  }

  validateAndSetDate(dateStr) {
    if (!dateStr) return;

    const [year, month, day] = dateStr.split('-').map(Number);
    const selected = new Date(year, month - 1, day);
    const dayOfWeek = selected.getDay(); // 0 = Domingo, 1 = Segunda

    const warningEl = document.getElementById('dateClosedWarning');

    // Regra: Domingo (0) e Segunda-feira (1) Barbearia Fechada!
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      if (warningEl) {
        warningEl.classList.remove('hidden');
        warningEl.innerHTML = `
          <strong>Atenção:</strong> A barbearia J&R não abre aos ${dayOfWeek === 0 ? 'Domingos' : 'Segundas-feiras'}. 
          Nosso atendimento é de <strong>Terça a Sábado</strong>. Por favor, escolha outra data.
        `;
      }
      this.selectedDate = '';
      this.renderSlots([]);
      return;
    }

    if (warningEl) warningEl.classList.add('hidden');
    this.selectedDate = dateStr;

    // Atualiza botão rápido se coincidir
    document.querySelectorAll('.quick-date-btn').forEach(b => {
      if (b.getAttribute('data-date') === dateStr) b.classList.add('active');
      else b.classList.remove('active');
    });

    this.refreshAvailableSlots();
  }

  // Consulta horários agendados do barbeiro selecionado e renderiza slots
  async refreshAvailableSlots() {
    const slotsGrid = document.getElementById('timeSlotsGrid');
    if (!slotsGrid) return;

    if (!this.selectedDate) {
      slotsGrid.innerHTML = `<div class="select-date-prompt">Selecione uma data válida para ver os horários.</div>`;
      return;
    }

    slotsGrid.innerHTML = `<div class="loading-slots"><div class="spinner"></div> Carregando horários disponíveis...</div>`;

    try {
      this.bookedSlots = await window.JR_DB.getBookedSlots(this.selectedBarberId, this.selectedDate);
      this.renderSlots(this.bookedSlots);
    } catch (err) {
      console.error('Erro ao buscar slots:', err);
      slotsGrid.innerHTML = `<div class="text-error">Erro ao carregar horários. Tente novamente.</div>`;
    }
  }

  renderSlots(booked = []) {
    const slotsGrid = document.getElementById('timeSlotsGrid');
    if (!slotsGrid) return;

    const allSlots = window.JR_CONFIG.SCHEDULE.ALL_SLOTS;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = this.selectedDate === todayStr;
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    this.selectedTime = '';

    slotsGrid.innerHTML = allSlots.map(time => {
      const isBooked = booked.includes(time);
      const isPast = isToday && time <= currentHourMin;
      const isDisabled = isBooked || isPast;

      let statusBadge = '';
      let slotClass = 'time-slot';

      if (isBooked) {
        slotClass += ' booked';
        statusBadge = '<span class="slot-badge">Ocupado</span>';
      } else if (isPast) {
        slotClass += ' past';
        statusBadge = '<span class="slot-badge">Passou</span>';
      } else {
        slotClass += ' available';
        statusBadge = '<span class="slot-badge">Livre</span>';
      }

      return `
        <button type="button" class="${slotClass}" data-time="${time}" ${isDisabled ? 'disabled' : ''}>
          <span class="slot-time">${time}</span>
          ${statusBadge}
        </button>
      `;
    }).join('');

    slotsGrid.querySelectorAll('.time-slot.available').forEach(btn => {
      btn.addEventListener('click', () => {
        slotsGrid.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedTime = btn.getAttribute('data-time');
        this.updateSummaryPrice();
      });
    });
  }

  updateSummaryPrice() {
    const price = this.getServicePrice(this.selectedServiceId);
    const priceDisplay = document.getElementById('summaryPriceDisplay');
    if (priceDisplay) {
      priceDisplay.textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    }

    const barber = this.barbersData.find(b => b.id === this.selectedBarberId);
    const barberDisplay = document.getElementById('summaryBarberDisplay');
    if (barberDisplay && barber) {
      barberDisplay.textContent = barber.nome;
    }
  }

  bindEvents() {
    const bookingForm = document.getElementById('publicBookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Modal de Confirmação
    const confirmBtn = document.getElementById('confirmBookingFinalBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmAndSaveAppointment();
      });
    }

    const closeModals = document.querySelectorAll('.close-modal-btn');
    closeModals.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });
  }

  handleFormSubmit() {
    const nome = document.getElementById('clienteNome').value.trim();
    const telefone = document.getElementById('clienteTelefone').value.trim();

    if (!nome || nome.split(' ').length < 2) {
      window.JR_APP.toast('Por favor, informe Nome e Sobrenome.', 'warning');
      document.getElementById('clienteNome').focus();
      return;
    }

    const digitsOnly = telefone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      window.JR_APP.toast('Informe um telefone/WhatsApp válido com DDD.', 'warning');
      document.getElementById('clienteTelefone').focus();
      return;
    }

    if (!this.selectedDate) {
      window.JR_APP.toast('Selecione uma data para o corte.', 'warning');
      return;
    }

    if (!this.selectedTime) {
      window.JR_APP.toast('Selecione um horário disponível.', 'warning');
      return;
    }

    const barber = this.barbersData.find(b => b.id === this.selectedBarberId);
    const service = this.servicesData.find(s => s.id === this.selectedServiceId) || { nome: 'Corte de Cabelo' };
    const price = this.getServicePrice(this.selectedServiceId);

    // Formata a data por extenso
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    this.currentPendingAppointment = {
      cliente_nome: nome,
      cliente_telefone: telefone,
      barbeiro_id: this.selectedBarberId,
      barbeiro_nome: barber.nome,
      barbeiro_telefone: barber.telefone,
      servico: this.selectedServiceId,
      servico_nome: service.nome,
      data: this.selectedDate,
      data_formatada: dateFormatted,
      horario: this.selectedTime,
      valor_cobrado: price
    };

    // Preenche o Modal de Resumo
    document.getElementById('modalResumoBarbeiro').textContent = barber.nome;
    document.getElementById('modalResumoServico').textContent = service.nome;
    document.getElementById('modalResumoData').textContent = dateFormatted;
    document.getElementById('modalResumoHorario').textContent = `${this.selectedTime}h (30 min)`;
    document.getElementById('modalResumoValor').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
    document.getElementById('modalResumoCliente').textContent = `${nome} - ${telefone}`;

    // Abre Modal de Confirmação
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.classList.add('active');
  }

  async confirmAndSaveAppointment() {
    const btn = document.getElementById('confirmBookingFinalBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-small"></span> Agendando...`;
    }

    try {
      const saved = await window.JR_DB.createAppointment(this.currentPendingAppointment);
      this.closeAllModals();

      // Dispara tela de sucesso com links de WhatsApp e Calendário
      this.showSuccessModal(this.currentPendingAppointment, saved.id);

      // Reseta formulário e atualiza horários
      document.getElementById('clienteNome').value = '';
      document.getElementById('clienteTelefone').value = '';
      this.selectedTime = '';
      this.refreshAvailableSlots();
      window.JR_APP.toast('Agendamento realizado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      window.JR_APP.toast(err.message || 'Erro ao realizar agendamento.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `Confirmar Agendamento`;
      }
    }
  }

  showSuccessModal(apt, appointmentId) {
    const modal = document.getElementById('successModal');
    if (!modal) return;

    document.getElementById('successClientName').textContent = apt.cliente_nome.split(' ')[0];
    document.getElementById('successBarberName').textContent = apt.barbeiro_nome;
    document.getElementById('successDateTime').textContent = `${apt.data_formatada} às ${apt.horario}h`;
    document.getElementById('successServiceName').textContent = `${apt.servico_nome} (R$ ${Number(apt.valor_cobrado).toFixed(2).replace('.', ',')})`;

    // Link WhatsApp Oficial para Confirmação (32984561005)
    const whatsBtn = document.getElementById('whatsAppConfirmationBtn');
    if (whatsBtn) {
      const targetPhone = (window.JR_CONFIG?.WHATSAPP_CONFIRMATION_PHONE || '32984561005').replace(/\D/g, '');
      const msg = encodeURIComponent(
        `Olá, ${apt.barbeiro_nome}! Gostaria de confirmar meu agendamento na Barbearia J&R:\n\n` +
        `✂️ *Serviço:* ${apt.servico_nome}\n` +
        `📅 *Data:* ${apt.data_formatada || apt.data} às ${apt.horario}h\n` +
        `👤 *Cliente:* ${apt.cliente_nome}\n` +
        `📱 *Contato:* ${apt.cliente_telefone}\n` +
        `💰 *Valor:* R$ ${Number(apt.valor_cobrado).toFixed(2).replace('.', ',')}\n\n` +
        `Por favor, confirme meu horário!`
      );
      whatsBtn.href = `https://api.whatsapp.com/send?phone=55${targetPhone}&text=${msg}`;
      whatsBtn.target = '_blank';
    }

    // Link Google Calendar
    const googleCalBtn = document.getElementById('googleCalendarBtn');
    if (googleCalBtn) {
      const [y, m, d] = apt.data.split('-');
      const [h, min] = apt.horario.split(':');
      const startIso = `${y}${m}${d}T${h}${min}00`;
      
      // Duração 30 min
      const endMinute = parseInt(min, 10) + 30;
      const endH = endMinute >= 60 ? String(parseInt(h, 10) + 1).padStart(2, '0') : h;
      const endM = endMinute >= 60 ? String(endMinute - 60).padStart(2, '0') : String(endMinute).padStart(2, '0');
      const endIso = `${y}${m}${d}T${endH}${endM}00`;

      const title = encodeURIComponent(`Corte de Cabelo / Barba - J&R Barbearia (${apt.barbeiro_nome})`);
      const details = encodeURIComponent(`Agendamento com ${apt.barbeiro_nome}. Serviço: ${apt.servico_nome}. Valor: R$ ${Number(apt.valor_cobrado).toFixed(2).replace('.', ',')}.`);
      const location = encodeURIComponent(`Barbearia J&R`);

      googleCalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
      googleCalBtn.target = '_blank';
    }

    // Botão ICS (Download de arquivo para iOS e Outlook)
    const icsBtn = document.getElementById('downloadIcsBtn');
    if (icsBtn) {
      icsBtn.onclick = () => {
        this.downloadIcsFile(apt);
      };
    }

    modal.classList.add('active');
  }

  downloadIcsFile(apt) {
    const [y, m, d] = apt.data.split('-');
    const [h, min] = apt.horario.split(':');
    const startStr = `${y}${m}${d}T${h}${min}00`;

    const endMinute = parseInt(min, 10) + 30;
    const endH = endMinute >= 60 ? String(parseInt(h, 10) + 1).padStart(2, '0') : h;
    const endM = endMinute >= 60 ? String(endMinute - 60).padStart(2, '0') : String(endMinute).padStart(2, '0');
    const endStr = `${y}${m}${d}T${endH}${endM}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JR Barbearia//Agendamento//PT',
      'BEGIN:VEVENT',
      `UID:${apt.id || Date.now()}@jrbarbearia.com.br`,
      `DTSTAMP:${startStr}Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:J&R Barbearia - ${apt.servico_nome} com ${apt.barbeiro_nome}`,
      `DESCRIPTION:Atendimento com ${apt.barbeiro_nome}. Valor: R$ ${Number(apt.valor_cobrado).toFixed(2)}`,
      'LOCATION:Barbearia J&R',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agendamento-jr-${apt.data}-${apt.horario.replace(':', '')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }
}

window.JR_BOOKING = new JRBookingManager();
