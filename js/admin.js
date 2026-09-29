/**
 * J&R Barbearia - Módulo Administrativo do Barbeiro (/admin)
 * Acesso individual para Juliano e Robert com isolamento estrito de dados e métricas.
 */
class JRAdminManager {
  constructor() {
    this.currentBarber = null;
    this.currentPeriod = 'mes';
    this.currentGroupBy = 'dia';
    this.currentMetric = 'cortes'; // 'cortes' ou 'faturamento'
    this.selectedAgendaDate = '';
    this.activeTab = 'dashboard'; // 'dashboard', 'agenda', 'precos', 'clientes'
  }

  async init() {
    this.checkSession();
    this.bindEvents();
  }

  checkSession() {
    const saved = sessionStorage.getItem('JR_LOGGED_BARBER');
    if (saved) {
      try {
        this.currentBarber = JSON.parse(saved);
        this.renderAdminView();
      } catch (e) {
        this.logout();
      }
    } else {
      this.renderLoginView();
    }
  }

  bindEvents() {
    // Formulário de Login
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Botões de Credenciais Rápidas (Teste)
    document.querySelectorAll('.quick-login-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = btn.getAttribute('data-user');
        const p = btn.getAttribute('data-pass');
        document.getElementById('adminUsername').value = u;
        document.getElementById('adminPassword').value = p;
        this.handleLogin();
      });
    });

    // Botão de Logout
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Tabs do Painel Admin
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        this.switchAdminTab(tab);
      });
    });

    // Filtros de Período do Dashboard
    document.querySelectorAll('.period-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPeriod = btn.getAttribute('data-period');
        this.loadDashboardData();
      });
    });

    // Filtros de Agrupamento do Gráfico (Dia, Semana, Mês, Ano)
    document.querySelectorAll('.chart-group-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-group-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentGroupBy = btn.getAttribute('data-group');
        this.refreshChartOnly();
      });
    });

    // Métrica do Gráfico (Volume vs Faturamento)
    document.querySelectorAll('.chart-metric-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-metric-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMetric = btn.getAttribute('data-metric');
        this.refreshChartOnly();
      });
    });

    // Salvar Preços do Barbeiro
    const pricesForm = document.getElementById('barberPricesForm');
    if (pricesForm) {
      pricesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePrices();
      });
    }

    // Simulador de Preços (input dinâmico)
    const simCabelo = document.getElementById('simPrecoCabelo');
    const simBarba = document.getElementById('simPrecoBarba');
    if (simCabelo && simBarba) {
      simCabelo.addEventListener('input', () => this.calculatePriceSimulation());
      simBarba.addEventListener('input', () => this.calculatePriceSimulation());
    }

    // Data da Agenda Diária
    const agendaDateInput = document.getElementById('adminAgendaDate');
    if (agendaDateInput) {
      agendaDateInput.addEventListener('change', () => {
        this.selectedAgendaDate = agendaDateInput.value;
        this.loadDailyAgenda();
      });
    }

    // Modal de Novo Agendamento Manual
    const manualBtn = document.getElementById('openManualAppointmentBtn');
    if (manualBtn) {
      manualBtn.addEventListener('click', () => this.openManualAppointmentModal());
    }

    const manualForm = document.getElementById('manualAppointmentForm');
    if (manualForm) {
      manualForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleManualAppointmentSubmit();
      });
    }
  }

  async handleLogin() {
    const user = (document.getElementById('adminUsername').value || '').trim().toLowerCase();
    const pass = (document.getElementById('adminPassword').value || '').trim();

    if (!user || !pass) {
      window.JR_APP.toast('Preencha usuário e senha.', 'warning');
      return;
    }

    const barbers = await window.JR_DB.getBarbers();
    const found = barbers.find(b => b.login.toLowerCase() === user && b.senha === pass);

    if (found) {
      this.currentBarber = found;
      sessionStorage.setItem('JR_LOGGED_BARBER', JSON.stringify(found));
      window.JR_APP.toast(`Bem-vindo, ${found.nome}!`, 'success');
      this.renderAdminView();
    } else {
      window.JR_APP.toast('Credenciais inválidas. Verifique seu login e senha.', 'error');
    }
  }

  logout() {
    this.currentBarber = null;
    sessionStorage.removeItem('JR_LOGGED_BARBER');
    this.renderLoginView();
    window.JR_APP.toast('Sessão encerrada.', 'info');
  }

  renderLoginView() {
    document.getElementById('adminLoginSection')?.classList.remove('hidden');
    document.getElementById('adminDashboardSection')?.classList.add('hidden');
  }

  async renderAdminView() {
    document.getElementById('adminLoginSection')?.classList.add('hidden');
    document.getElementById('adminDashboardSection')?.classList.remove('hidden');

    // Header do Barbeiro
    document.getElementById('adminCurrentBarberName').textContent = this.currentBarber.nome;
    document.getElementById('adminBarberAvatar').src = this.currentBarber.avatar || './assets/icon.svg';

    // Inicializa a data da agenda para a data atual
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.selectedAgendaDate = todayStr;
    const agendaInput = document.getElementById('adminAgendaDate');
    if (agendaInput) agendaInput.value = todayStr;

    // Preenche campos de preço
    this.populatePriceForm();

    // Carrega dados iniciais
    await this.loadDashboardData();
    await this.loadDailyAgenda();
    await this.loadTopClients();
  }

  switchAdminTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      if (pane.id === `tabPane_${tabName}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });

    if (tabName === 'dashboard') {
      this.loadDashboardData();
    } else if (tabName === 'agenda') {
      this.loadDailyAgenda();
    } else if (tabName === 'clientes') {
      this.loadTopClients();
    } else if (tabName === 'precos') {
      this.populatePriceForm();
    }
  }

  // ==========================================
  // DASHBOARD & RELATÓRIOS
  // ==========================================
  async loadDashboardData() {
    if (!this.currentBarber) return;

    try {
      const data = await window.JR_DB.getBarberDashboardData(this.currentBarber.id, this.currentPeriod);

      // Atualiza Cards de KPIs
      document.getElementById('metricFaturamentoRealizado').textContent = `R$ ${data.totalFaturamento.toFixed(2).replace('.', ',')}`;
      document.getElementById('metricFaturamentoPrevisto').textContent = `R$ ${(data.totalFaturamento + data.faturamentoPrevisto).toFixed(2).replace('.', ',')}`;
      document.getElementById('metricTotalCortes').textContent = data.totalCortes;
      document.getElementById('metricTicketMedio').textContent = `R$ ${data.ticketMedio.toFixed(2).replace('.', ',')}`;
      document.getElementById('metricTaxaConclusao').textContent = `${data.taxaConclusao}%`;

      // Atualiza Gráfico
      this.dashboardAppointments = data.appointments;
      this.refreshChartOnly();
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      window.JR_APP.toast('Erro ao atualizar métricas do painel.', 'error');
    }
  }

  refreshChartOnly() {
    if (!this.dashboardAppointments) return;
    window.JR_CHARTS.renderChart(
      this.dashboardAppointments,
      this.currentGroupBy,
      this.currentMetric
    );
  }

  // ==========================================
  // CONFIGURAÇÃO DE PREÇOS & SIMULADOR
  // ==========================================
  async populatePriceForm() {
    const barber = await window.JR_DB.getBarberById(this.currentBarber.id);
    if (!barber) return;

    this.currentBarber = barber;
    const inputCabelo = document.getElementById('inputPrecoCabelo');
    const inputBarba = document.getElementById('inputPrecoBarba');
    const simCabelo = document.getElementById('simPrecoCabelo');
    const simBarba = document.getElementById('simPrecoBarba');

    if (inputCabelo) inputCabelo.value = Number(barber.preco_cabelo).toFixed(2);
    if (inputBarba) inputBarba.value = Number(barber.preco_barba).toFixed(2);
    if (simCabelo) simCabelo.value = Number(barber.preco_cabelo).toFixed(2);
    if (simBarba) simBarba.value = Number(barber.preco_barba).toFixed(2);

    this.calculatePriceSimulation();
  }

  async savePrices() {
    const precoCabelo = parseFloat(document.getElementById('inputPrecoCabelo').value);
    const precoBarba = parseFloat(document.getElementById('inputPrecoBarba').value);

    if (isNaN(precoCabelo) || isNaN(precoBarba) || precoCabelo <= 0 || precoBarba <= 0) {
      window.JR_APP.toast('Por favor, informe valores válidos para os serviços.', 'warning');
      return;
    }

    try {
      await window.JR_DB.updateBarberPrices(this.currentBarber.id, precoCabelo, precoBarba);
      this.currentBarber.preco_cabelo = precoCabelo;
      this.currentBarber.preco_barba = precoBarba;
      sessionStorage.setItem('JR_LOGGED_BARBER', JSON.stringify(this.currentBarber));

      // Atualiza também a interface pública
      window.JR_BOOKING.loadBarbersAndServices();

      window.JR_APP.toast('Preços atualizados com sucesso!', 'success');
      this.calculatePriceSimulation();
    } catch (err) {
      console.error(err);
      window.JR_APP.toast('Erro ao salvar preços.', 'error');
    }
  }

  async calculatePriceSimulation() {
    const simCabelo = parseFloat(document.getElementById('simPrecoCabelo')?.value) || 0;
    const simBarba = parseFloat(document.getElementById('simPrecoBarba')?.value) || 0;
    const simCombo = simCabelo + simBarba;

    const simDisplayCombo = document.getElementById('simPrecoComboDisplay');
    if (simDisplayCombo) {
      simDisplayCombo.textContent = `R$ ${simCombo.toFixed(2).replace('.', ',')}`;
    }

    // Calcula faturamento estimado do mês atual com a nova tabela de preços
    const appointments = await window.JR_DB.getAppointments({ barbeiro_id: this.currentBarber.id });
    const now = new Date();
    const thisMonthApts = appointments.filter(a => {
      const [y, m] = a.data.split('-').map(Number);
      return y === now.getFullYear() && m === (now.getMonth() + 1) && a.status !== 'cancelado';
    });

    let simulatedRevenue = 0;
    let actualRevenue = 0;

    thisMonthApts.forEach(apt => {
      actualRevenue += Number(apt.valor_cobrado || 0);
      if (apt.servico === 'cabelo') simulatedRevenue += simCabelo;
      else if (apt.servico === 'barba') simulatedRevenue += simBarba;
      else if (apt.servico === 'cabelo_barba') simulatedRevenue += simCombo;
      else simulatedRevenue += simCabelo;
    });

    const diff = simulatedRevenue - actualRevenue;
    const percentDiff = actualRevenue > 0 ? ((diff / actualRevenue) * 100).toFixed(1) : '0';

    const simResultEl = document.getElementById('simEstimatedRevenue');
    if (simResultEl) {
      simResultEl.innerHTML = `
        <div class="simulation-metric">
          <span class="label">Faturamento Simulado (Mês Atual):</span>
          <span class="value highlight">R$ ${simulatedRevenue.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="simulation-metric diff ${diff >= 0 ? 'positive' : 'negative'}">
          <span class="label">Impacto no Faturamento:</span>
          <span class="value">${diff >= 0 ? '+' : ''}R$ ${diff.toFixed(2).replace('.', ',')} (${diff >= 0 ? '+' : ''}${percentDiff}%)</span>
        </div>
      `;
    }
  }

  // ==========================================
  // TOP 10 CLIENTES (RANKING)
  // ==========================================
  async loadTopClients() {
    if (!this.currentBarber) return;

    const listContainer = document.getElementById('topClientsContainer');
    if (!listContainer) return;

    listContainer.innerHTML = `<div class="loading-state"><div class="spinner"></div> Carregando ranking...</div>`;

    const topList = await window.JR_DB.getTopClients(this.currentBarber.id, 10);

    if (topList.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">Nenhum cliente registrado para este barbeiro ainda.</div>`;
      return;
    }

    listContainer.innerHTML = `
      <div class="table-responsive">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Visitas</th>
              <th>Total Gerado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${topList.map((cli, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
              const cleanPhone = cli.telefone.replace(/\D/g, '');
              const msgWa = encodeURIComponent(`Olá, ${cli.nome}! Aqui é o barbeiro ${this.currentBarber.nome} da Barbearia J&R. Passando para agradecer sua preferência de sempre!`);
              return `
                <tr>
                  <td class="col-rank">${medal}</td>
                  <td class="col-name"><strong>${cli.nome}</strong></td>
                  <td class="col-phone">${cli.telefone}</td>
                  <td class="col-visits"><span class="badge-visits">${cli.totalVisitas} cortes</span></td>
                  <td class="col-value"><strong>R$ ${cli.valorTotal.toFixed(2).replace('.', ',')}</strong></td>
                  <td class="col-actions">
                    <a href="https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${msgWa}" target="_blank" class="action-btn-wa" title="Chamar no WhatsApp">
                      📱 WhatsApp
                    </a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================
  // AGENDA DIÁRIA
  // ==========================================
  async loadDailyAgenda() {
    if (!this.currentBarber) return;

    const container = document.getElementById('dailyAgendaList');
    if (!container) return;

    container.innerHTML = `<div class="loading-state"><div class="spinner"></div> Carregando agenda...</div>`;

    const appointments = await window.JR_DB.getAppointments({
      barbeiro_id: this.currentBarber.id,
      data: this.selectedAgendaDate
    });

    if (appointments.length === 0) {
      container.innerHTML = `
        <div class="empty-agenda">
          <span class="empty-icon">📅</span>
          <p>Nenhum agendamento para este dia.</p>
          <button type="button" class="btn-secondary" onclick="window.JR_ADMIN.openManualAppointmentModal()">+ Adicionar Agendamento Manual</button>
        </div>
      `;
      return;
    }

    const serviceNames = {
      cabelo: 'Corte de Cabelo',
      barba: 'Apenas Barba',
      cabelo_barba: 'Cabelo e Barba'
    };

    container.innerHTML = appointments.map(apt => {
      const srvName = serviceNames[apt.servico] || apt.servico;
      const cleanPhone = apt.cliente_telefone.replace(/\D/g, '');
      const isConcluido = apt.status === 'concluido';
      const isCancelado = apt.status === 'cancelado';

      return `
        <div class="agenda-item status-${apt.status}">
          <div class="agenda-time-box">
            <span class="agenda-hour">${apt.horario.slice(0, 5)}</span>
            <span class="agenda-status-pill ${apt.status}">${apt.status.toUpperCase()}</span>
          </div>

          <div class="agenda-details">
            <div class="client-title">${apt.cliente_nome}</div>
            <div class="service-subtitle">${srvName} • <strong>R$ ${Number(apt.valor_cobrado).toFixed(2).replace('.', ',')}</strong></div>
            <div class="client-phone-wrap">
              <span>📞 ${apt.cliente_telefone}</span>
              <a href="https://api.whatsapp.com/send?phone=55${cleanPhone}&text=Ol%C3%A1%20${encodeURIComponent(apt.cliente_nome)},%20sou%20o%20${encodeURIComponent(this.currentBarber.nome)}%20da%20Barbearia%20J%26R." target="_blank" class="link-wa-tiny">Conversar</a>
            </div>
          </div>

          <div class="agenda-actions">
            ${!isConcluido && !isCancelado ? `
              <button class="btn-action-concluir" onclick="window.JR_ADMIN.changeStatus('${apt.id}', 'concluido')">
                ✓ Concluir
              </button>
              <button class="btn-action-cancelar" onclick="window.JR_ADMIN.changeStatus('${apt.id}', 'cancelado')">
                ✕ Cancelar
              </button>
            ` : ''}
            ${isConcluido ? `
              <span class="concluded-tag">Atendimento Realizado</span>
              <button class="btn-action-reopen" onclick="window.JR_ADMIN.changeStatus('${apt.id}', 'agendado')">Reabrir</button>
            ` : ''}
            ${isCancelado ? `
              <span class="cancelled-tag">Cancelado</span>
              <button class="btn-action-reopen" onclick="window.JR_ADMIN.changeStatus('${apt.id}', 'agendado')">Reativar</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  async changeStatus(aptId, newStatus) {
    try {
      await window.JR_DB.updateAppointmentStatus(aptId, newStatus);
      window.JR_APP.toast(`Status atualizado para: ${newStatus}`, 'success');
      this.loadDailyAgenda();
      this.loadDashboardData();
    } catch (err) {
      console.error(err);
      window.JR_APP.toast('Erro ao atualizar status.', 'error');
    }
  }

  // Agendamento manual pelo Barbeiro
  openManualAppointmentModal() {
    const modal = document.getElementById('manualAppointmentModal');
    if (!modal) return;

    document.getElementById('manualDate').value = this.selectedAgendaDate;
    this.populateManualSlots();
    modal.classList.add('active');
  }

  async populateManualSlots() {
    const dateVal = document.getElementById('manualDate')?.value || this.selectedAgendaDate;
    const select = document.getElementById('manualHorario');
    if (!select) return;

    const booked = await window.JR_DB.getBookedSlots(this.currentBarber.id, dateVal);
    const allSlots = window.JR_CONFIG.SCHEDULE.ALL_SLOTS;

    select.innerHTML = allSlots.map(s => {
      const isBooked = booked.includes(s);
      return `<option value="${s}" ${isBooked ? 'disabled' : ''}>${s} ${isBooked ? '(Ocupado)' : '(Livre)'}</option>`;
    }).join('');
  }

  async handleManualAppointmentSubmit() {
    const nome = document.getElementById('manualNome').value.trim();
    const tel = document.getElementById('manualTelefone').value.trim();
    const servico = document.getElementById('manualServico').value;
    const data = document.getElementById('manualDate').value;
    const horario = document.getElementById('manualHorario').value;

    if (!nome || !tel || !data || !horario) {
      window.JR_APP.toast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    let valor = 35.00;
    if (servico === 'cabelo') valor = this.currentBarber.preco_cabelo;
    else if (servico === 'barba') valor = this.currentBarber.preco_barba;
    else if (servico === 'cabelo_barba') valor = Number(this.currentBarber.preco_cabelo) + Number(this.currentBarber.preco_barba);

    try {
      await window.JR_DB.createAppointment({
        cliente_nome: nome,
        cliente_telefone: tel,
        barbeiro_id: this.currentBarber.id,
        servico,
        data,
        horario,
        valor_cobrado: valor
      });

      window.JR_APP.toast('Agendamento inserido com sucesso!', 'success');
      document.getElementById('manualAppointmentModal').classList.remove('active');
      this.loadDailyAgenda();
      this.loadDashboardData();
    } catch (err) {
      window.JR_APP.toast(err.message, 'error');
    }
  }
}

window.JR_ADMIN = new JRAdminManager();
