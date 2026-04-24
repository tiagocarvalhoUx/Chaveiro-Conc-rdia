// ─── Chaveiro Concórdia — Screens A: Splash · Intro · Auth · Home ────────────

// ── Shared UI primitives ──────────────────────────────────────────────────────

function KeyLogo({ size = 80, animate = false }) {
  const [rot, setRot] = React.useState(0);
  React.useEffect(() => {
    if (!animate) return;
    let t = 0;
    const id = setInterval(() => { t += 3; setRot(Math.sin(t * 0.05) * 12); }, 50);
    return () => clearInterval(id);
  }, [animate]);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ transform: `rotate(${rot}deg)`, transition: 'transform 0.1s ease', display: 'block' }}>
      {/* Key ring */}
      <circle cx="35" cy="35" r="20" fill="none" stroke={BRAND.dark} strokeWidth="9"/>
      <circle cx="35" cy="35" r="11" fill={BRAND.dark}/>
      <circle cx="35" cy="35" r="5" fill="#FFD700" opacity="0.6"/>
      {/* Key shaft */}
      <rect x="50" y="31" width="40" height="8" rx="4" fill={BRAND.dark}/>
      {/* Teeth */}
      <rect x="62" y="39" width="6" height="9" rx="2" fill={BRAND.dark}/>
      <rect x="74" y="39" width="6" height="13" rx="2" fill={BRAND.dark}/>
      <rect x="82" y="39" width="6" height="7" rx="2" fill={BRAND.dark}/>
    </svg>
  );
}

function KeyLogoWhite({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx="35" cy="35" r="20" fill="none" stroke="white" strokeWidth="9"/>
      <circle cx="35" cy="35" r="11" fill="white"/>
      <circle cx="35" cy="35" r="5" fill={BRAND.primary} opacity="0.7"/>
      <rect x="50" y="31" width="40" height="8" rx="4" fill="white"/>
      <rect x="62" y="39" width="6" height="9" rx="2" fill="white"/>
      <rect x="74" y="39" width="6" height="13" rx="2" fill="white"/>
      <rect x="82" y="39" width="6" height="7" rx="2" fill="white"/>
    </svg>
  );
}

function GlassCard({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: BRAND.card,
      border: `1px solid ${BRAND.cardBorder}`,
      borderRadius: 16,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      ...style,
    }}>{children}</div>
  );
}

function YellowBtn({ children, onClick, style = {}, small = false }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: pressed ? '#e6c200' : BRAND.primary,
        color: BRAND.dark, border: 'none', borderRadius: 14,
        fontWeight: 700, fontSize: small ? 14 : 16,
        padding: small ? '10px 20px' : '16px 24px',
        width: style.width || '100%', cursor: 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 0.15s ease', fontFamily: 'inherit',
        letterSpacing: 0.3, ...style,
      }}>{children}</button>
  );
}

function GhostBtn({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: 'white', border: `1.5px solid ${BRAND.cardBorder}`,
      borderRadius: 14, fontWeight: 600, fontSize: 15,
      padding: '14px 24px', width: '100%', cursor: 'pointer',
      fontFamily: 'inherit', ...style,
    }}>{children}</button>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, icon }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: focused ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${focused ? BRAND.primary : BRAND.cardBorder}`,
        borderRadius: 12, padding: '0 14px', transition: 'all 0.2s',
      }}>
        {icon && <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontSize: 15, padding: '13px 0', fontFamily: 'inherit',
          }}/>
      </div>
    </div>
  );
}

function EmergencyFAB({ onPress }) {
  const [pulse, setPulse] = React.useState(false);
  React.useEffect(() => { const id = setInterval(() => setPulse(p => !p), 1200); return () => clearInterval(id); }, []);
  return (
    <div onClick={onPress} style={{
      position: 'absolute', bottom: 90, right: 16, zIndex: 100,
      width: 52, height: 52, borderRadius: 26,
      background: '#25D366', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 20px rgba(37,211,102,${pulse ? 0.7 : 0.4})`,
      transform: pulse ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.6s ease',
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.124 1.528 5.857L0 24l6.336-1.505A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.671-.502-5.207-1.378l-.373-.224-3.882.923.967-3.77-.243-.393A9.939 9.939 0 012 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
      </svg>
    </div>
  );
}

function BottomNav({ active, onNav }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Início' },
    { id: 'catalog', icon: '🔑', label: 'Serviços' },
    { id: 'schedule', icon: '📅', label: 'Agendar' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 74, background: 'rgba(20,20,20,0.96)',
      borderTop: `1px solid ${BRAND.cardBorder}`,
      backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center',
      zIndex: 50,
    }}>
      {tabs.map(t => (
        <div key={t.id} onClick={() => onNav(t.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 3, cursor: 'pointer', paddingTop: 8,
        }}>
          <span style={{ fontSize: 22, opacity: active === t.id ? 1 : 0.4,
            filter: active === t.id ? 'none' : 'grayscale(1)',
            transform: active === t.id ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 0.2s' }}>{t.icon}</span>
          <span style={{
            fontSize: 10, fontWeight: active === t.id ? 700 : 500,
            color: active === t.id ? BRAND.primary : BRAND.textMuted,
            transition: 'all 0.2s',
          }}>{t.label}</span>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: 2, background: BRAND.primary, marginTop: 1 }}/>}
        </div>
      ))}
    </div>
  );
}

function PhoneBadge() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(204,0,0,0.15)', border: '1px solid rgba(204,0,0,0.3)',
      borderRadius: 20, padding: '4px 12px', alignSelf: 'center',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: BRAND.danger, animation: 'pulse 1s infinite' }}/>
      <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>24h {BRAND.phone}</span>
    </div>
  );
}

// ── Screen 0 — Splash ─────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [opacity, setOpacity] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setOpacity(1), 100);
    const t2 = setTimeout(() => { setOpacity(0); setTimeout(onDone, 500); }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRAND.primary,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, opacity, transition: 'opacity 0.5s ease',
    }}>
      <KeyLogo size={90}/>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.dark, letterSpacing: -0.5 }}>Chaveiro</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: BRAND.dark, letterSpacing: -0.5 }}>Concórdia</div>
      </div>
    </div>
  );
}

// ── Screen 1 — Intro ──────────────────────────────────────────────────────────
function IntroScreen({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [phoneScale, setPhoneScale] = React.useState(1);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 900);
    const t3 = setTimeout(() => setStep(3), 1600);
    const t4 = setTimeout(onDone, 3200);

    const pulse = setInterval(() => setPhoneScale(s => s === 1 ? 1.08 : 1), 700);
    return () => { [t1,t2,t3,t4].forEach(clearTimeout); clearInterval(pulse); };
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRAND.primary,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 20, padding: '0 30px', overflow: 'hidden',
    }}>
      {/* Mascot */}
      <div style={{
        opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.8)',
        transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <KeyLogo size={110} animate={true}/>
          {/* Shine spark */}
          <div style={{
            position: 'absolute', top: -4, right: -4, fontSize: 22,
            animation: 'spin 3s linear infinite',
          }}>✨</div>
        </div>
      </div>

      {/* Brand name */}
      <div style={{
        textAlign: 'center',
        opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease',
      }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.dark, letterSpacing: -1 }}>Chaveiro</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.dark, letterSpacing: -1 }}>Concórdia</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark, opacity: 0.7, marginTop: 6, letterSpacing: 2 }}>
          Automóveis • Empresa • Residência
        </div>
      </div>

      {/* Phone number */}
      <div style={{
        opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          background: BRAND.dark, borderRadius: 24, padding: '10px 22px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: BRAND.danger,
            transform: `scale(${phoneScale})`, transition: 'transform 0.3s ease' }}/>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>
            24h — {BRAND.phone}
          </span>
        </div>
      </div>

      {/* Skip hint */}
      <div onClick={onDone} style={{
        position: 'absolute', bottom: 50, color: BRAND.dark, opacity: 0.5,
        fontSize: 13, cursor: 'pointer', fontWeight: 600,
      }}>Toque para continuar</div>
    </div>
  );
}

// ── Screen 2 — Auth ───────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const validate = () => {
    if (!email.includes('@')) return 'E-mail inválido';
    if (password.length < 6) return 'Senha deve ter ao menos 6 caracteres';
    if (mode === 'register' && name.trim().length < 2) return 'Informe seu nome completo';
    return '';
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ name: name || email.split('@')[0], email }); }, 1200);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRAND.darker,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header wave */}
      <div style={{ background: BRAND.primary, padding: '32px 28px 48px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <KeyLogo size={36}/>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.dark }}>Chaveiro Concórdia</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.dark, opacity: 0.6, letterSpacing: 1 }}>Automóveis • Empresa • Residência</div>
          </div>
        </div>
        {/* Wave bottom */}
        <svg style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }} viewBox="0 0 390 36" preserveAspectRatio="none" height="36">
          <path d="M0,20 Q97,0 195,18 Q293,36 390,16 L390,36 L0,36Z" fill={BRAND.darker}/>
        </svg>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '24px 24px 20px', overflow: 'auto' }}>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
        </h2>
        <p style={{ color: BRAND.textMuted, fontSize: 13, marginBottom: 24 }}>
          {mode === 'login' ? 'Bem-vindo de volta! Acesse seus pedidos.' : 'Cadastre-se e solicite serviços com facilidade.'}
        </p>

        {mode === 'register' && (
          <Input label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" icon="👤"/>
        )}
        <Input label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seuemail@exemplo.com" icon="✉️"/>
        <Input label="Senha" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒"/>

        {error && (
          <div style={{
            background: 'rgba(204,0,0,0.15)', border: '1px solid rgba(204,0,0,0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            color: '#ff6b6b', fontSize: 13, fontWeight: 500,
          }}>{error}</div>
        )}

        <YellowBtn onClick={handleSubmit} style={{ marginTop: 8 }}>
          {loading ? '⏳ Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
        </YellowBtn>

        <div style={{ textAlign: 'center', marginTop: 20, color: BRAND.textMuted, fontSize: 13 }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: BRAND.primary, fontWeight: 700, cursor: 'pointer' }}>
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 30, paddingTop: 20, borderTop: `1px solid ${BRAND.cardBorder}` }}>
          <div style={{ color: BRAND.textMuted, fontSize: 12, marginBottom: 6 }}>Emergência 24h</div>
          <a href={`tel:${BRAND.phone}`} style={{ color: BRAND.danger, fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            📞 {BRAND.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Screen 3 — Home ───────────────────────────────────────────────────────────
function HomeScreen({ user, onNav, onEmergency }) {
  const [greeting] = React.useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  const quickActions = [
    { icon: '🔑', label: 'Serviços', nav: 'catalog', color: '#FFD700' },
    { icon: '📅', label: 'Agendar', nav: 'schedule', color: '#4ECDC4' },
    { icon: '💬', label: 'Orçamento', nav: 'budget', color: '#FF6B35' },
    { icon: '📦', label: 'Pedidos', nav: 'status', color: '#A78BFA' },
    { icon: '⭐', label: 'Avaliar', nav: 'reviews', color: '#FCD34D' },
    { icon: '📞', label: 'Contato', nav: 'contact', color: '#CC0000' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRAND.dark,
      display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
    }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.dark} 0%, #2a2200 100%)`,
        padding: '20px 20px 28px', position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: BRAND.textMuted, fontSize: 13, fontWeight: 500 }}>{greeting},</div>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>{user?.name || 'Cliente'} 👋</div>
          </div>
          <div onClick={() => onNav('profile')} style={{ cursor: 'pointer' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 22,
              background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: BRAND.dark,
            }}>{(user?.name || 'C')[0].toUpperCase()}</div>
          </div>
        </div>

        {/* 24h badge */}
        <div style={{ marginTop: 14 }}>
          <PhoneBadge/>
        </div>

        {/* Featured card */}
        <GlassCard style={{ marginTop: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'rgba(255,215,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <KeyLogoWhite size={32}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Atendimento 24 horas</div>
            <div style={{ color: BRAND.textMuted, fontSize: 12, marginTop: 2 }}>Chaveiro em Araçatuba/SP — chegamos rápido</div>
          </div>
          <div onClick={() => onNav('contact')} style={{
            background: BRAND.primary, borderRadius: 10, padding: '8px 12px',
            color: BRAND.dark, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>Chamar</div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>O que você precisa?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {quickActions.map(a => (
            <GlassCard key={a.nav} onClick={() => onNav(a.nav)} style={{
              padding: '16px 8px', textAlign: 'center', cursor: 'pointer',
              transition: 'transform 0.15s',
            }}>
              <div style={{
                fontSize: 26, marginBottom: 6, width: 46, height: 46, borderRadius: 12,
                background: `${a.color}18`, margin: '0 auto 8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{a.icon}</div>
              <div style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{a.label}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Recent order */}
      <div style={{ padding: '20px 20px 100px' }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Último pedido</div>
        <GlassCard onClick={() => onNav('status')} style={{ padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{ORDERS[0].service}</div>
              <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 2 }}>{ORDERS[0].date} às {ORDERS[0].time}</div>
            </div>
            <div style={{
              background: `${STATUS_INFO[ORDERS[0].status].color}22`,
              border: `1px solid ${STATUS_INFO[ORDERS[0].status].color}44`,
              borderRadius: 20, padding: '4px 10px',
              color: STATUS_INFO[ORDERS[0].status].color, fontSize: 11, fontWeight: 700,
            }}>{STATUS_INFO[ORDERS[0].status].label}</div>
          </div>
          <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: 4, borderRadius: 2, background: STATUS_INFO[ORDERS[0].status].color,
              width: `${(STATUS_INFO[ORDERS[0].status].step / 4) * 100}%`, transition: 'width 1s ease',
            }}/>
          </div>
        </GlassCard>
      </div>

      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

Object.assign(window, {
  KeyLogo, KeyLogoWhite, GlassCard, YellowBtn, GhostBtn, Input,
  EmergencyFAB, BottomNav, PhoneBadge,
  SplashScreen, IntroScreen, AuthScreen, HomeScreen,
});
