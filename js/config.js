/**
 * J&R Barbearia - Configuração Global
 */
const CONFIG = {
  // Configuração Supabase Oficial (Conectada)
  SUPABASE_URL: (localStorage.getItem('JR_SUPABASE_URL') || '').trim() || 'https://cujfmrliqxwocvjfaspa.supabase.co',
  SUPABASE_ANON_KEY: (localStorage.getItem('JR_SUPABASE_ANON_KEY') || '').trim() || 'sb_publishable_gaWuq5Kzhqo7TNLDf41Oww_I39hFiE8',

  // Horários de Funcionamento da Barbearia
  SCHEDULE: {
    OPEN_DAYS: [2, 3, 4, 5, 6], // 0: Dom (Fechado), 1: Seg (Fechado), 2: Ter, 3: Qua, 4: Qui, 5: Sex, 6: Sáb
    START_TIME: '09:00',
    END_TIME: '17:30',
    SLOT_DURATION_MINUTES: 30,
    ALL_SLOTS: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]
  },

  // Número oficial de confirmação do WhatsApp da Barbearia J&R
  WHATSAPP_CONFIRMATION_PHONE: '32984561005',
  WHATSAPP_CONFIRMATION_PHONE_FORMATTED: '(32) 98456-1005',

  // Dados Padrão de Barbeiros
  DEFAULT_BARBERS: [
    {
      id: 'juliano',
      nome: 'Juliano',
      login: 'juliano',
      senha: 'juliano123',
      preco_cabelo: 35.00,
      preco_barba: 20.00,
      telefone: '(32) 98456-1005',
      bio: 'Especialista em degradês modernos, visagismo e cortes clássicos com acabamento refinado.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'robert',
      nome: 'Robert',
      login: 'robert',
      senha: 'robert123',
      preco_cabelo: 35.00,
      preco_barba: 20.00,
      telefone: '(32) 98456-1005',
      bio: 'Mestre na navalha tradicional, toalha quente, alinhamento milimétrico de barba e tratamentos.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    }
  ],

  // Serviços Oferecidos
  DEFAULT_SERVICES: [
    {
      id: 'cabelo',
      nome: 'Corte de Cabelo',
      duracao_min: 30,
      descricao: 'Corte completo, tesoura e navalha, finalização impecável.'
    },
    {
      id: 'barba',
      nome: 'Apenas Barba',
      duracao_min: 30,
      descricao: 'Barboterapia clássica com toalha quente e lâmina de precisão.'
    },
    {
      id: 'cabelo_barba',
      nome: 'Cabelo e Barba',
      duracao_min: 30,
      descricao: 'Combo completo para renovar o visual por completo.'
    }
  ],

  // Paleta de Cores Oficial
  COLORS: {
    bgDark: '#191d0e',
    secDeep: '#044000',
    accent: '#008894',
    textLight: '#eae5d8',
    ctaHighlight: '#A8EB12'
  }
};

window.JR_CONFIG = CONFIG;
