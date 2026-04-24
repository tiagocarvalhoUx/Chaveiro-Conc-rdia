// ─── Chaveiro Concórdia — Screens C: Contato · Perfil · Avaliações ───────────

// ── Screen 8 — Contato & Emergência ──────────────────────────────────────────
function ContactScreen({ onBack, onEmergency }) {
  const contacts = [
    { icon: '📱', label: 'WhatsApp 24h', value: BRAND.phone, color: '#25D366', action: () => window.open(`https://wa.me/5518991020078`, '_blank') },
    { icon: '📞', label: 'Ligação direta', value: BRAND.phone, color: '#4ECDC4', action: () => window.open(`tel:${BRAND.phone}`, '_self') },
    { icon: '📍', label: 'Endereço', value: 'Araçatuba / SP', color: BRAND.primary, action: () => window.open('https://maps.google.com/?q=Araçatuba+SP', '_blank') },
  ];

  const services24 = [
    { icon: '🚗', text: 'Abertura de veículo' },
    { icon: '🏠', text: 'Abertura de residência' },
    { icon: '🏢', text: 'Emergência empresarial' },
    { icon: '🔑', text: 'Chave quebrada na fechadura' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Contato & Emergência" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 90px' }}>

        {/* Emergency hero */}
        <div style={{
          background: `linear-gradient(135deg, rgba(204,0,0,0.25) 0%, rgba(204,0,0,0.08) 100%)`,
          border: '1.5px solid rgba(204,0,0,0.4)', borderRadius: 18, padding: '20px 18px',
          marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🚨</div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Emergência Chaveiro</div>
          <div style={{ color: BRAND.textMuted, fontSize: 13, marginBottom: 16 }}>Atendimento 24 horas — 7 dias por semana</div>
          <div onClick={() => window.open(`https://wa.me/5518991020078`, '_blank')} style={{
            background: '#25D366', borderRadius: 14, padding: '14px 24px',
            color: 'white', fontWeight: 800, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.124 1.528 5.857L0 24l6.336-1.505A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.671-.502-5.207-1.378l-.373-.224-3.882.923.967-3.77-.243-.393A9.939 9.939 0 012 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
            </svg>
            Chamar no WhatsApp
          </div>
        </div>

        {/* Contact options */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Formas de contato</div>
          {contacts.map(c => (
            <GlassCard key={c.label} onClick={c.action} style={{
              padding: '14px 16px', marginBottom: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${c.color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 13, marginTop: 2, fontWeight: 600 }}>{c.value}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke={BRAND.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </GlassCard>
          ))}
        </div>

        {/* Services 24h */}
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Atendemos 24h para:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {services24.map(s => (
              <GlassCard key={s.text} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{s.text}</span>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Location */}
        <GlassCard style={{ marginTop: 16, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>📍</span>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Área de atendimento</div>
            <div style={{ color: BRAND.textMuted, fontSize: 12, marginTop: 2 }}>Araçatuba e região — SP</div>
          </div>
        </GlassCard>
      </div>
      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

// ── Screen 9 — Perfil ─────────────────────────────────────────────────────────
function ProfileScreen({ user, onBack, onLogout, onEmergency }) {
  const [editName, setEditName] = React.useState(false);
  const [name, setName] = React.useState(user?.name || 'Cliente');
  const [phone, setPhone] = React.useState('(18) 99000-0000');

  const stats = [
    { label: 'Serviços', value: '3' },
    { label: 'Concluídos', value: '1' },
    { label: 'Avaliações', value: '1' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Meu Perfil" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 100px' }}>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 40,
            background: BRAND.primary, margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, fontWeight: 900, color: BRAND.dark,
            border: `3px solid rgba(255,215,0,0.3)`,
          }}>{name[0].toUpperCase()}</div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{name}</div>
          <div style={{ color: BRAND.textMuted, fontSize: 13, marginTop: 2 }}>{user?.email || 'cliente@email.com'}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <GlassCard key={s.label} style={{ flex: 1, padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ color: BRAND.primary, fontWeight: 800, fontSize: 22 }}>{s.value}</div>
              <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Edit profile */}
        <GlassCard style={{ padding: '16px 16px', marginBottom: 14 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Dados pessoais</div>
          <Input label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" icon="👤"/>
          <Input label="Telefone" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" icon="📱"/>
          <Input label="E-mail" value={user?.email || ''} onChange={() => {}} placeholder="seuemail@exemplo.com" icon="✉️"/>
          <YellowBtn onClick={() => {}} small style={{ marginTop: 4 }}>Salvar alterações</YellowBtn>
        </GlassCard>

        {/* History */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Histórico de serviços</div>
          {ORDERS.map(o => (
            <GlassCard key={o.id} style={{ padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{o.service}</div>
                <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 2 }}>{o.date} • {o.price}</div>
              </div>
              <div style={{
                background: `${STATUS_INFO[o.status].color}22`,
                borderRadius: 12, padding: '3px 8px',
                color: STATUS_INFO[o.status].color, fontSize: 10, fontWeight: 700,
              }}>{STATUS_INFO[o.status].label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Logout */}
        <div onClick={onLogout} style={{
          background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.25)',
          borderRadius: 14, padding: '14px', textAlign: 'center',
          color: '#ff6b6b', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>Sair da conta</div>
      </div>
      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

// ── Screen 10 — Avaliações ────────────────────────────────────────────────────
function ReviewsScreen({ onBack, preOrder, onEmergency }) {
  const eligible = ORDERS.filter(o => o.status === 'concluido');
  const [target, setTarget] = React.useState(preOrder || eligible[0] || null);
  const [stars, setStars] = React.useState(0);
  const [hovered, setHovered] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const aspects = ['Pontualidade', 'Qualidade', 'Atendimento', 'Preço justo'];
  const [selected, setSelected] = React.useState([]);

  const submit = () => {
    if (!stars) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  };

  if (sent) return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
      <div style={{ fontSize: 64 }}>🙏</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Obrigado pela avaliação!</div>
        <div style={{ color: BRAND.textMuted, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Sua opinião nos ajuda a melhorar o serviço para todos os clientes.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ fontSize: 32, color: i < stars ? '#FFD700' : 'rgba(255,255,255,0.2)' }}>★</span>
        ))}
      </div>
      <YellowBtn onClick={onBack}>Voltar ao início</YellowBtn>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Avaliar Serviço" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 100px' }}>

        {/* No eligible */}
        {eligible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Nenhum serviço concluído</div>
            <div style={{ color: BRAND.textMuted, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              A avaliação estará disponível após a conclusão de um serviço.
            </div>
          </div>
        )}

        {eligible.length > 0 && (
          <>
            {/* Order selector */}
            {eligible.length > 1 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Selecione o pedido</div>
                {eligible.map(o => (
                  <div key={o.id} onClick={() => { setTarget(o); setStars(0); setComment(''); setSelected([]); }} style={{ marginBottom: 6, cursor: 'pointer' }}>
                    <GlassCard style={{
                      padding: '10px 14px',
                      border: target?.id === o.id ? `1.5px solid ${BRAND.primary}` : `1px solid ${BRAND.cardBorder}`,
                    }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{o.service}</div>
                      <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 2 }}>{o.date} • {o.price}</div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            )}

            {target && (
              <>
                {/* Stars */}
                <GlassCard style={{ padding: '20px 16px', marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Como foi o atendimento?</div>
                  <div style={{ color: BRAND.textMuted, fontSize: 12, marginBottom: 18 }}>{target.service}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i}
                        onClick={() => setStars(i + 1)}
                        onMouseEnter={() => setHovered(i + 1)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                          fontSize: 40, cursor: 'pointer',
                          color: i < (hovered || stars) ? '#FFD700' : 'rgba(255,255,255,0.2)',
                          transition: 'all 0.1s',
                          transform: i < (hovered || stars) ? 'scale(1.15)' : 'scale(1)',
                        }}>★</span>
                    ))}
                  </div>
                  <div style={{ color: BRAND.textSub, fontSize: 13, fontWeight: 600, minHeight: 20 }}>
                    {stars === 1 && 'Muito ruim 😔'}
                    {stars === 2 && 'Ruim 😕'}
                    {stars === 3 && 'Regular 😐'}
                    {stars === 4 && 'Bom 😊'}
                    {stars === 5 && 'Excelente! 🤩'}
                  </div>
                </GlassCard>

                {/* Aspects */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>O que se destacou?</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {aspects.map(a => {
                      const on = selected.includes(a);
                      return (
                        <div key={a} onClick={() => setSelected(on ? selected.filter(x => x !== a) : [...selected, a])} style={{
                          padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                          background: on ? BRAND.primary : 'rgba(255,255,255,0.06)',
                          border: `1.5px solid ${on ? BRAND.primary : BRAND.cardBorder}`,
                          color: on ? BRAND.dark : 'white', fontSize: 13, fontWeight: on ? 700 : 500,
                          transition: 'all 0.2s',
                        }}>{a}</div>
                      );
                    })}
                  </div>
                </div>

                {/* Comment */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Comentário (opcional)</div>
                  <textarea value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Conte sua experiência com o serviço..."
                    style={{
                      width: '100%', minHeight: 90, background: 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${BRAND.cardBorder}`, borderRadius: 12,
                      color: 'white', fontSize: 14, padding: '12px 14px',
                      fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box',
                    }}/>
                </div>

                <YellowBtn onClick={submit}>
                  {loading ? '⏳ Enviando...' : '⭐ Enviar avaliação'}
                </YellowBtn>
              </>
            )}
          </>
        )}
      </div>
      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

Object.assign(window, { ContactScreen, ProfileScreen, ReviewsScreen });
