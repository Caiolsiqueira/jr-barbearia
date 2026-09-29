/**
 * J&R Barbearia - Camada de Dados Supabase & Mock Local Fallback
 * Suporta conexão nativa com Supabase REST API e Fallback instantâneo em LocalStorage.
 */
class JRDataProvider {
  constructor() {
    this.config = window.JR_CONFIG;
    this.supabaseUrl = this.config.SUPABASE_URL;
    this.supabaseKey = this.config.SUPABASE_ANON_KEY;
    this.storageKey = 'JR_BARBEARIA_DB_V1';

    this.initLocalStorage();
  }

  isSupabaseConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseKey && this.supabaseUrl.startsWith('http'));
  }

  setCredentials(url, key) {
    this.supabaseUrl = (url || '').trim();
    this.supabaseKey = (key || '').trim();
    localStorage.setItem('JR_SUPABASE_URL', this.supabaseUrl);
    localStorage.setItem('JR_SUPABASE_ANON_KEY', this.supabaseKey);
  }

  clearCredentials() {
    this.supabaseUrl = '';
    this.supabaseKey = '';
    localStorage.removeItem('JR_SUPABASE_URL');
    localStorage.removeItem('JR_SUPABASE_ANON_KEY');
  }

  // ==========================================
  // INICIALIZAÇÃO LOCAL (MOCK ENGINE)
  // ==========================================
  initLocalStorage() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      this.resetToSeedData();
    } else {
      try {
        const db = JSON.parse(raw);
        if (db && db.barbeiros) {
          db.barbeiros.forEach(b => {
            const def = this.config.DEFAULT_BARBERS.find(d => d.id === b.id);
            if (def && (!b.telefone || b.telefone.includes('11') || b.telefone.includes('99876'))) {
              b.telefone = def.telefone;
            }
          });
          this.saveLocalDb(db);
        }
      } catch (e) {
        console.warn('Erro ao atualizar db local:', e);
      }
    }
  }

  resetToSeedData() {
    const today = new Date();
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const addDays = (d, n) => {
      const res = new Date(d);
      res.setDate(res.getDate() + n);
      return res;
    };

    // Gera agendamentos históricos de exemplo para gráficos ricos
    const sampleAppointments = [
      // Juliano - Histórico
      {
        id: 'apt-j-1',
        cliente_nome: 'Marcos Oliveira',
        cliente_telefone: '(11) 99123-4567',
        barbeiro_id: 'juliano',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -1)),
        horario: '09:30',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -1).toISOString()
      },
      {
        id: 'apt-j-2',
        cliente_nome: 'Lucas Silveira',
        cliente_telefone: '(11) 98234-5678',
        barbeiro_id: 'juliano',
        servico: 'cabelo',
        data: formatDate(addDays(today, -1)),
        horario: '10:30',
        valor_cobrado: 35.00,
        status: 'concluido',
        created_at: addDays(today, -1).toISOString()
      },
      {
        id: 'apt-j-3',
        cliente_nome: 'Rodrigo Santos',
        cliente_telefone: '(11) 97345-6789',
        barbeiro_id: 'juliano',
        servico: 'barba',
        data: formatDate(addDays(today, -2)),
        horario: '14:00',
        valor_cobrado: 20.00,
        status: 'concluido',
        created_at: addDays(today, -2).toISOString()
      },
      {
        id: 'apt-j-4',
        cliente_nome: 'Marcos Oliveira',
        cliente_telefone: '(11) 99123-4567',
        barbeiro_id: 'juliano',
        servico: 'cabelo',
        data: formatDate(addDays(today, -12)),
        horario: '11:00',
        valor_cobrado: 35.00,
        status: 'concluido',
        created_at: addDays(today, -12).toISOString()
      },
      {
        id: 'apt-j-5',
        cliente_nome: 'Marcos Oliveira',
        cliente_telefone: '(11) 99123-4567',
        barbeiro_id: 'juliano',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -25)),
        horario: '09:00',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -25).toISOString()
      },
      {
        id: 'apt-j-6',
        cliente_nome: 'Felipe Andrade',
        cliente_telefone: '(11) 96456-7890',
        barbeiro_id: 'juliano',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -4)),
        horario: '16:00',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -4).toISOString()
      },
      {
        id: 'apt-j-7',
        cliente_nome: 'Gustavo Lima',
        cliente_telefone: '(11) 95567-8901',
        barbeiro_id: 'juliano',
        servico: 'cabelo',
        data: formatDate(addDays(today, -6)),
        horario: '15:30',
        valor_cobrado: 35.00,
        status: 'concluido',
        created_at: addDays(today, -6).toISOString()
      },
      {
        id: 'apt-j-8',
        cliente_nome: 'Lucas Silveira',
        cliente_telefone: '(11) 98234-5678',
        barbeiro_id: 'juliano',
        servico: 'cabelo',
        data: formatDate(addDays(today, -18)),
        horario: '10:00',
        valor_cobrado: 35.00,
        status: 'concluido',
        created_at: addDays(today, -18).toISOString()
      },
      {
        id: 'apt-j-9',
        cliente_nome: 'Bruno Souza',
        cliente_telefone: '(11) 94678-9012',
        barbeiro_id: 'juliano',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -38)),
        horario: '16:30',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -38).toISOString()
      },
      {
        id: 'apt-j-10',
        cliente_nome: 'Marcos Oliveira',
        cliente_telefone: '(11) 99123-4567',
        barbeiro_id: 'juliano',
        servico: 'cabelo_barba',
        data: formatDate(today),
        horario: '10:00',
        valor_cobrado: 55.00,
        status: 'agendado',
        created_at: today.toISOString()
      },
      {
        id: 'apt-j-11',
        cliente_nome: 'Daniel Costa',
        cliente_telefone: '(11) 93789-0123',
        barbeiro_id: 'juliano',
        servico: 'cabelo',
        data: formatDate(today),
        horario: '11:30',
        valor_cobrado: 35.00,
        status: 'agendado',
        created_at: today.toISOString()
      },

      // Robert - Agenda Independente
      {
        id: 'apt-r-1',
        cliente_nome: 'Thiago Mendes',
        cliente_telefone: '(11) 91901-2345',
        barbeiro_id: 'robert',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -1)),
        horario: '10:00',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -1).toISOString()
      },
      {
        id: 'apt-r-2',
        cliente_nome: 'Carlos Eduardo',
        cliente_telefone: '(11) 90012-3456',
        barbeiro_id: 'robert',
        servico: 'cabelo',
        data: formatDate(addDays(today, -2)),
        horario: '11:00',
        valor_cobrado: 35.00,
        status: 'concluido',
        created_at: addDays(today, -2).toISOString()
      },
      {
        id: 'apt-r-3',
        cliente_nome: 'Thiago Mendes',
        cliente_telefone: '(11) 91901-2345',
        barbeiro_id: 'robert',
        servico: 'barba',
        data: formatDate(addDays(today, -10)),
        horario: '15:00',
        valor_cobrado: 20.00,
        status: 'concluido',
        created_at: addDays(today, -10).toISOString()
      },
      {
        id: 'apt-r-4',
        cliente_nome: 'Thiago Mendes',
        cliente_telefone: '(11) 91901-2345',
        barbeiro_id: 'robert',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -22)),
        horario: '14:30',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -22).toISOString()
      },
      {
        id: 'apt-r-5',
        cliente_nome: 'Gabriel Nogueira',
        cliente_telefone: '(11) 98923-4567',
        barbeiro_id: 'robert',
        servico: 'cabelo',
        data: formatDate(addDays(today, -4)),
        horario: '16:00',
        valor_cobrado: 35.00,
        status: 'concluido',
        created_at: addDays(today, -4).toISOString()
      },
      {
        id: 'apt-r-6',
        cliente_nome: 'Rafael Martins',
        cliente_telefone: '(11) 97834-5678',
        barbeiro_id: 'robert',
        servico: 'cabelo_barba',
        data: formatDate(addDays(today, -7)),
        horario: '09:00',
        valor_cobrado: 55.00,
        status: 'concluido',
        created_at: addDays(today, -7).toISOString()
      },
      {
        id: 'apt-r-7',
        cliente_nome: 'Leandro Ramos',
        cliente_telefone: '(11) 95656-7890',
        barbeiro_id: 'robert',
        servico: 'barba',
        data: formatDate(today),
        horario: '09:30',
        valor_cobrado: 20.00,
        status: 'agendado',
        created_at: today.toISOString()
      },
      {
        id: 'apt-r-8',
        cliente_nome: 'Thiago Mendes',
        cliente_telefone: '(11) 91901-2345',
        barbeiro_id: 'robert',
        servico: 'cabelo_barba',
        data: formatDate(today),
        horario: '14:00',
        valor_cobrado: 55.00,
        status: 'agendado',
        created_at: today.toISOString()
      }
    ];

    const initialDb = {
      barbeiros: JSON.parse(JSON.stringify(this.config.DEFAULT_BARBERS)),
      servicos: JSON.parse(JSON.stringify(this.config.DEFAULT_SERVICES)),
      agendamentos: sampleAppointments
    };

    localStorage.setItem(this.storageKey, JSON.stringify(initialDb));
    return initialDb;
  }

  getLocalDb() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return this.resetToSeedData();
      return JSON.parse(raw);
    } catch (e) {
      console.error('Erro ao ler DB local:', e);
      return this.resetToSeedData();
    }
  }

  saveLocalDb(db) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  // ==========================================
  // OPERAÇÕES: BARBEIROS
  // ==========================================
  async getBarbers() {
    if (this.isSupabaseConfigured()) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/barbeiros?select=*`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Supabase offline ou erro na requisição. Usando banco local.', err);
      }
    }

    const db = this.getLocalDb();
    return db.barbeiros;
  }

  async getBarberById(id) {
    const barbers = await this.getBarbers();
    return barbers.find(b => b.id === id) || null;
  }

  async updateBarberPrices(barberId, precoCabelo, precoBarba) {
    const parsedCabelo = parseFloat(precoCabelo);
    const parsedBarba = parseFloat(precoBarba);

    if (isNaN(parsedCabelo) || isNaN(parsedBarba)) {
      throw new Error('Preços inválidos informados.');
    }

    // Atualiza localmente sempre
    const db = this.getLocalDb();
    const idx = db.barbeiros.findIndex(b => b.id === barberId);
    if (idx !== -1) {
      db.barbeiros[idx].preco_cabelo = parsedCabelo;
      db.barbeiros[idx].preco_barba = parsedBarba;
      this.saveLocalDb(db);
    }

    // Atualiza no Supabase se configurado
    if (this.isSupabaseConfigured()) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/barbeiros?id=eq.${barberId}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            preco_cabelo: parsedCabelo,
            preco_barba: parsedBarba
          })
        });
      } catch (err) {
        console.warn('Erro ao atualizar preços no Supabase (salvo localmente):', err);
      }
    }

    return { success: true, preco_cabelo: parsedCabelo, preco_barba: parsedBarba };
  }

  // ==========================================
  // OPERAÇÕES: SERVIÇOS
  // ==========================================
  async getServices() {
    if (this.isSupabaseConfigured()) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/servicos?select=*`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data;
        }
      } catch (err) {
        console.warn('Erro ao carregar serviços do Supabase. Usando local.', err);
      }
    }

    const db = this.getLocalDb();
    return db.servicos;
  }

  // ==========================================
  // OPERAÇÕES: AGENDAMENTOS
  // ==========================================
  async getAppointments(filter = {}) {
    let appointments = [];

    if (this.isSupabaseConfigured()) {
      try {
        let queryParams = ['select=*', 'order=data.desc,horario.asc'];
        if (filter.barbeiro_id) queryParams.push(`barbeiro_id=eq.${filter.barbeiro_id}`);
        if (filter.data) queryParams.push(`data=eq.${filter.data}`);
        if (filter.status) queryParams.push(`status=eq.${filter.status}`);

        const res = await fetch(`${this.supabaseUrl}/rest/v1/agendamentos?${queryParams.join('&')}`, {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`
          }
        });

        if (res.ok) {
          appointments = await res.json();
          return appointments;
        }
      } catch (err) {
        console.warn('Falha no Supabase ao buscar agendamentos. Usando local.', err);
      }
    }

    // Local fallback
    const db = this.getLocalDb();
    appointments = db.agendamentos || [];

    if (filter.barbeiro_id) {
      appointments = appointments.filter(a => a.barbeiro_id === filter.barbeiro_id);
    }
    if (filter.data) {
      appointments = appointments.filter(a => a.data === filter.data);
    }
    if (filter.status) {
      appointments = appointments.filter(a => a.status === filter.status);
    }

    // Ordenação
    return appointments.sort((a, b) => {
      if (a.data !== b.data) return b.data.localeCompare(a.data);
      return a.horario.localeCompare(b.horario);
    });
  }

  async getBookedSlots(barbeiro_id, dataStr) {
    const list = await this.getAppointments({
      barbeiro_id,
      data: dataStr
    });

    // Retorna lista de horários ocupados que não estejam cancelados
    return list
      .filter(a => a.status !== 'cancelado')
      .map(a => a.horario.slice(0, 5)); // normaliza para "HH:MM"
  }

  async createAppointment(appointmentData) {
    const { cliente_nome, cliente_telefone, barbeiro_id, servico, data, horario, valor_cobrado } = appointmentData;

    if (!cliente_nome || !cliente_telefone || !barbeiro_id || !servico || !data || !horario) {
      throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
    }

    // Validação estrita do horário: verificar se já está agendado para o mesmo barbeiro
    const booked = await this.getBookedSlots(barbeiro_id, data);
    const normalizedHorario = horario.slice(0, 5);

    if (booked.includes(normalizedHorario)) {
      throw new Error(`O horário ${normalizedHorario} já está reservado para este barbeiro. Por favor, escolha outro horário.`);
    }

    const newAppointment = {
      id: 'apt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      cliente_nome: cliente_nome.trim(),
      cliente_telefone: cliente_telefone.trim(),
      barbeiro_id,
      servico,
      data,
      horario: normalizedHorario,
      valor_cobrado: parseFloat(valor_cobrado),
      status: 'agendado',
      created_at: new Date().toISOString()
    };

    // Salva no Supabase se configurado
    if (this.isSupabaseConfigured()) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/agendamentos`, {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            cliente_nome: newAppointment.cliente_nome,
            cliente_telefone: newAppointment.cliente_telefone,
            barbeiro_id: newAppointment.barbeiro_id,
            servico: newAppointment.servico,
            data: newAppointment.data,
            horario: newAppointment.horario + ':00',
            valor_cobrado: newAppointment.valor_cobrado,
            status: newAppointment.status
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.message && errData.message.includes('unique')) {
            throw new Error(`Horário indisponível: este horário já foi agendado para este profissional.`);
          }
        }
      } catch (err) {
        console.warn('Erro ao inserir no Supabase (salvando localmente):', err);
      }
    }

    // Salva localmente
    const db = this.getLocalDb();
    db.agendamentos.push(newAppointment);
    this.saveLocalDb(db);

    return newAppointment;
  }

  async updateAppointmentStatus(appointmentId, newStatus) {
    if (!['agendado', 'concluido', 'cancelado'].includes(newStatus)) {
      throw new Error('Status inválido.');
    }

    const db = this.getLocalDb();
    const idx = db.agendamentos.findIndex(a => a.id === appointmentId);
    if (idx !== -1) {
      db.agendamentos[idx].status = newStatus;
      this.saveLocalDb(db);
    }

    if (this.isSupabaseConfigured()) {
      try {
        await fetch(`${this.supabaseUrl}/rest/v1/agendamentos?id=eq.${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.warn('Erro ao atualizar status no Supabase:', err);
      }
    }

    return { success: true, id: appointmentId, status: newStatus };
  }

  // ==========================================
  // RELATÓRIOS E MÉTRICAS POR BARBEIRO
  // ==========================================
  async getBarberDashboardData(barbeiroId, period = 'mes') {
    const appointments = await this.getAppointments({ barbeiro_id: barbeiroId });
    const now = new Date();

    const parseDate = (dStr) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    // Filtra pelo período
    const filtered = appointments.filter(a => {
      const aptDate = parseDate(a.data);
      const diffDays = Math.floor((now - aptDate) / (1000 * 60 * 60 * 24));

      if (period === 'hoje') {
        return aptDate.toDateString() === now.toDateString();
      } else if (period === 'semana') {
        return Math.abs(diffDays) <= 7;
      } else if (period === 'mes') {
        return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
      } else if (period === 'ano') {
        return aptDate.getFullYear() === now.getFullYear();
      } else if (period === 'todos') {
        return true;
      }
      return true;
    });

    // Faturamento: conta concluídos e agendados
    const concluidos = filtered.filter(a => a.status === 'concluido');
    const agendados = filtered.filter(a => a.status === 'agendado');
    const cancelados = filtered.filter(a => a.status === 'cancelado');

    const totalFaturamento = concluidos.reduce((acc, cur) => acc + Number(cur.valor_cobrado || 0), 0);
    const faturamentoPrevisto = agendados.reduce((acc, cur) => acc + Number(cur.valor_cobrado || 0), 0);

    const totalCortes = concluidos.length + agendados.length;
    const ticketMedio = totalCortes > 0 ? (totalFaturamento + faturamentoPrevisto) / totalCortes : 0;
    const taxaConclusao = (concluidos.length + cancelados.length) > 0
      ? (concluidos.length / (concluidos.length + cancelados.length)) * 100
      : 100;

    return {
      period,
      totalFaturamento,
      faturamentoPrevisto,
      totalCortes,
      concluidosCount: concluidos.length,
      agendadosCount: agendados.length,
      canceladosCount: cancelados.length,
      ticketMedio,
      taxaConclusao: Math.round(taxaConclusao),
      appointments: filtered
    };
  }

  async getTopClients(barbeiroId, limit = 10) {
    const appointments = await this.getAppointments({ barbeiro_id: barbeiroId });
    const clientMap = {};

    appointments.forEach(apt => {
      const key = apt.cliente_telefone || apt.cliente_nome;
      if (!clientMap[key]) {
        clientMap[key] = {
          nome: apt.cliente_nome,
          telefone: apt.cliente_telefone,
          totalVisitas: 0,
          valorTotal: 0,
          ultimoAgendamento: apt.data
        };
      }
      if (apt.status !== 'cancelado') {
        clientMap[key].totalVisitas += 1;
        clientMap[key].valorTotal += Number(apt.valor_cobrado || 0);
        if (apt.data > clientMap[key].ultimoAgendamento) {
          clientMap[key].ultimoAgendamento = apt.data;
        }
      }
    });

    const topList = Object.values(clientMap)
      .sort((a, b) => b.totalVisitas - a.totalVisitas || b.valorTotal - a.valorTotal)
      .slice(0, limit);

    return topList;
  }
}

window.JR_DB = new JRDataProvider();
