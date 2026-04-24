// ─── Chaveiro Concórdia — Data & Constants ───────────────────────────────────

const BRAND = {
  primary: '#FFD700',
  danger: '#CC0000',
  dark: '#1A1A1A',
  darker: '#111111',
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.10)',
  textMuted: 'rgba(255,255,255,0.45)',
  textSub: 'rgba(255,255,255,0.65)',
  phone: '(18) 99102-0078',
  whatsapp: 'https://wa.me/5518991020078',
};

const SERVICES = [
  {
    id: 1, category: 'automovel', icon: '🚗', name: 'Cópia de Chave Automotiva',
    desc: 'Cópia com chip transponder para todos os modelos', price: 'R$ 80–350', time: '30–60 min',
  },
  {
    id: 2, category: 'automovel', icon: '🚗', name: 'Abertura de Veículo',
    desc: 'Abertura sem danos para qualquer modelo', price: 'R$ 150–300', time: '20–40 min',
  },
  {
    id: 3, category: 'automovel', icon: '🚗', name: 'Codificação de Telecomando',
    desc: 'Programação de controle remoto original ou paralelo', price: 'R$ 120–400', time: '40–90 min',
  },
  {
    id: 4, category: 'empresa', icon: '🏢', name: 'Fechadura de Alta Segurança',
    desc: 'Instalação de fechaduras para empresas e condomínios', price: 'R$ 200–800', time: '1–2h',
  },
  {
    id: 5, category: 'empresa', icon: '🏢', name: 'Controle de Acesso',
    desc: 'Sistemas eletrônicos de entrada com cartão ou biometria', price: 'R$ 500–2.000', time: '2–4h',
  },
  {
    id: 6, category: 'residencia', icon: '🏠', name: 'Abertura de Porta Residencial',
    desc: 'Abertura de portas com ou sem chave, sem danos', price: 'R$ 100–200', time: '15–30 min',
  },
  {
    id: 7, category: 'residencia', icon: '🏠', name: 'Troca de Segredo',
    desc: 'Reconfiguração de fechadura para nova chave', price: 'R$ 60–150', time: '20–45 min',
  },
  {
    id: 8, category: 'residencia', icon: '🏠', name: 'Instalação de Fechadura Digital',
    desc: 'Fechadura inteligente com senha, biometria ou app', price: 'R$ 300–1.200', time: '1–2h',
  },
];

const CATEGORIES = [
  { id: 'automovel', label: 'Automóveis', icon: '🚗', color: '#FFD700' },
  { id: 'empresa',   label: 'Empresa',    icon: '🏢', color: '#FF6B35' },
  { id: 'residencia', label: 'Residência', icon: '🏠', color: '#4ECDC4' },
];

const ORDERS = [
  {
    id: 'PED-001', service: 'Cópia de Chave Automotiva', date: '24/04/2026',
    time: '14:30', status: 'concluido', price: 'R$ 180,00', rated: false,
  },
  {
    id: 'PED-002', service: 'Abertura de Porta Residencial', date: '26/04/2026',
    time: '09:00', status: 'agendado', price: 'R$ 150,00', rated: false,
  },
  {
    id: 'PED-003', service: 'Fechadura de Alta Segurança', date: '27/04/2026',
    time: '15:00', status: 'em_andamento', price: 'R$ 450,00', rated: false,
  },
];

const STATUS_INFO = {
  agendado:      { label: 'Agendado',       color: '#FFD700', step: 1 },
  confirmado:    { label: 'Confirmado',      color: '#4ECDC4', step: 2 },
  em_andamento:  { label: 'Em andamento',   color: '#FF6B35', step: 3 },
  concluido:     { label: 'Concluído',       color: '#51CF66', step: 4 },
  cancelado:     { label: 'Cancelado',       color: '#CC0000', step: 0 },
};

const TIMES = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','20:00','22:00'];

Object.assign(window, { BRAND, SERVICES, CATEGORIES, ORDERS, STATUS_INFO, TIMES });
