// ─── Chaveiro Concórdia — Screens B: Catálogo · Agendamento · Orçamento · Status ───

function ScreenHeader({ title, onBack, light = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px 12px',
      borderBottom: `1px solid ${BRAND.cardBorder}`,
    }}>
      <div onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(255,255,255,0.08)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>{title}</div>
    </div>
  );
}

// ── Screen 4 — Catálogo ───────────────────────────────────────────────────────
function CatalogScreen({ onBack, onBook, onEmergency }) {
  const [active, setActive] = React.useState('automovel');
  const [selected, setSelected] = React.useState(null);

  const filtered = SERVICES.filter(s => s.category === active);

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Catálogo de Serviços" onBack={onBack}/>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${BRAND.cardBorder}` }}>
        {CATEGORIES.map(c => (
          <div key={c.id} onClick={() => setActive(c.id)} style={{
            flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 12, cursor: 'pointer',
            background: active === c.id ? BRAND.primary : 'rgba(255,255,255,0.06)',
            transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 18 }}>{c.icon}</div>
            <div style={{
              fontSize: 10, fontWeight: 700, marginTop: 2,
              color: active === c.id ? BRAND.dark : BRAND.textSub,
            }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Services list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 90px' }}>
        {filtered.map((s, i) => (
          <div key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)}
            style={{ marginBottom: 10, cursor: 'pointer' }}>
            <GlassCard style={{
              padding: '14px 16px',
              border: selected === s.id ? `1.5px solid ${BRAND.primary}` : `1px solid ${BRAND.cardBorder}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ color: BRAND.textMuted, fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{s.desc}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <span style={{
                      background: 'rgba(255,215,0,0.12)', borderRadius: 8,
                      padding: '3px 8px', color: BRAND.primary, fontSize: 11, fontWeight: 700,
                    }}>{s.price}</span>
                    <span style={{
                      background: 'rgba(255,255,255,0.06)', borderRadius: 8,
                      padding: '3px 8px', color: BRAND.textSub, fontSize: 11,
                    }}>⏱ {s.time}</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 22, width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{s.icon}</div>
              </div>

              {selected === s.id && (
                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <YellowBtn onClick={() => onBook(s)} style={{ flex: 1 }} small>
                    📅 Agendar
                  </YellowBtn>
                  <GhostBtn onClick={() => {}} style={{ flex: 1, fontSize: 13, padding: '10px' }}>
                    💬 Orçamento
                  </GhostBtn>
                </div>
              )}
            </GlassCard>
          </div>
        ))}
      </div>

      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

// ── Screen 5 — Agendamento ────────────────────────────────────────────────────
function ScheduleScreen({ onBack, onEmergency, preService }) {
  const [step, setStep] = React.useState(0); // 0=service, 1=date/time, 2=confirm, 3=success
  const [service, setService] = React.useState(preService || null);
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [note, setNote] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const today = new Date();
  const days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i + 1);
    return { iso: d.toISOString().slice(0, 10), label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) };
  });

  const confirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1500);
  };

  if (step === 3) return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Agendado!</div>
        <div style={{ color: BRAND.textMuted, fontSize: 14, marginTop: 8 }}>
          Seu serviço foi agendado com sucesso. Você receberá uma confirmação.
        </div>
      </div>
      <GlassCard style={{ width: '100%', padding: '16px 18px' }}>
        <div style={{ color: BRAND.textMuted, fontSize: 12, marginBottom: 8 }}>Detalhes do agendamento</div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{service?.name}</div>
        <div style={{ color: BRAND.textSub, fontSize: 13, marginTop: 4 }}>
          {days.find(d => d.iso === date)?.label} às {time}
        </div>
      </GlassCard>
      <YellowBtn onClick={onBack}>Voltar ao início</YellowBtn>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Agendar Serviço" onBack={onBack}/>

      {/* Progress */}
      <div style={{ display: 'flex', padding: '12px 20px', gap: 6 }}>
        {['Serviço', 'Data & Hora', 'Confirmar'].map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 4, borderRadius: 2, background: step >= i ? BRAND.primary : 'rgba(255,255,255,0.1)', marginBottom: 4, transition: 'background 0.3s' }}/>
            <div style={{ fontSize: 10, color: step >= i ? BRAND.primary : BRAND.textMuted, fontWeight: step === i ? 700 : 500 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 20px' }}>
        {/* Step 0 — Service selection */}
        {step === 0 && (
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Qual serviço você precisa?</div>
            {SERVICES.slice(0, 6).map(s => (
              <div key={s.id} onClick={() => setService(s)} style={{ marginBottom: 8, cursor: 'pointer' }}>
                <GlassCard style={{
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  border: service?.id === s.id ? `1.5px solid ${BRAND.primary}` : `1px solid ${BRAND.cardBorder}`,
                }}>
                  <div style={{ fontSize: 22, width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ color: BRAND.primary, fontSize: 11, fontWeight: 700, marginTop: 2 }}>{s.price}</div>
                  </div>
                  {service?.id === s.id && <span style={{ color: BRAND.primary, fontSize: 20 }}>✓</span>}
                </GlassCard>
              </div>
            ))}
            <YellowBtn onClick={() => service && setStep(1)} style={{ marginTop: 14 }}>
              Continuar →
            </YellowBtn>
          </div>
        )}

        {/* Step 1 — Date & Time */}
        {step === 1 && (
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Escolha data e horário</div>

            <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Data</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
              {days.map(d => (
                <div key={d.iso} onClick={() => setDate(d.iso)} style={{
                  flexShrink: 0, padding: '8px 14px', borderRadius: 12, cursor: 'pointer',
                  background: date === d.iso ? BRAND.primary : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${date === d.iso ? BRAND.primary : BRAND.cardBorder}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ color: date === d.iso ? BRAND.dark : BRAND.textSub, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{d.label}</div>
                </div>
              ))}
            </div>

            <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Horário</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
              {TIMES.map(t => (
                <div key={t} onClick={() => setTime(t)} style={{
                  textAlign: 'center', padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                  background: time === t ? BRAND.primary : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${time === t ? BRAND.primary : BRAND.cardBorder}`,
                  color: time === t ? BRAND.dark : 'white', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.2s',
                }}>{t}</div>
              ))}
            </div>

            <Input label="Observações (opcional)" value={note} onChange={setNote} placeholder="Descreva detalhes do serviço..." icon="📝"/>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <GhostBtn onClick={() => setStep(0)} style={{ width: 'auto', padding: '14px 20px' }}>← Voltar</GhostBtn>
              <YellowBtn onClick={() => date && time && setStep(2)} style={{ flex: 1 }}>Confirmar →</YellowBtn>
            </div>
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Confirmar agendamento</div>
            <GlassCard style={{ padding: '18px 16px', marginBottom: 16 }}>
              {[
                { label: 'Serviço', value: service?.name },
                { label: 'Categoria', value: CATEGORIES.find(c => c.id === service?.category)?.label },
                { label: 'Valor estimado', value: service?.price },
                { label: 'Data', value: days.find(d => d.iso === date)?.label },
                { label: 'Horário', value: time },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${BRAND.cardBorder}` }}>
                  <span style={{ color: BRAND.textMuted, fontSize: 13 }}>{label}</span>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              {note && (
                <div>
                  <div style={{ color: BRAND.textMuted, fontSize: 12, marginBottom: 4 }}>Observações</div>
                  <div style={{ color: BRAND.textSub, fontSize: 13 }}>{note}</div>
                </div>
              )}
            </GlassCard>
            <GlassCard style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <div style={{ color: BRAND.textSub, fontSize: 12, lineHeight: 1.5 }}>
                Um profissional confirmará seu agendamento via WhatsApp em até 30 minutos.
              </div>
            </GlassCard>
            <div style={{ display: 'flex', gap: 8 }}>
              <GhostBtn onClick={() => setStep(1)} style={{ width: 'auto', padding: '14px 20px' }}>← Editar</GhostBtn>
              <YellowBtn onClick={confirm} style={{ flex: 1 }}>
                {loading ? '⏳ Enviando...' : '✅ Confirmar'}
              </YellowBtn>
            </div>
          </div>
        )}
      </div>
      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

// ── Screen 6 — Orçamento + Foto ───────────────────────────────────────────────
function BudgetScreen({ onBack, onEmergency }) {
  const [desc, setDesc] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [photo, setPhoto] = React.useState(null);
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const fileRef = React.useRef();

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setPhoto({ url, name: f.name, size: (f.size / 1024).toFixed(0) + ' KB' });
    }
  };

  const send = () => {
    if (!desc || !category) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1800);
  };

  if (sent) return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
      <div style={{ fontSize: 64 }}>📋</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>Orçamento enviado!</div>
        <div style={{ color: BRAND.textMuted, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Retornaremos via WhatsApp em até 2 horas com o orçamento detalhado.
        </div>
      </div>
      <div style={{
        background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
        borderRadius: 14, padding: '14px 18px', width: '100%', textAlign: 'center',
      }}>
        <div style={{ color: '#25D366', fontWeight: 700, fontSize: 14 }}>📱 {BRAND.phone}</div>
        <div style={{ color: BRAND.textMuted, fontSize: 12, marginTop: 4 }}>WhatsApp disponível 24h</div>
      </div>
      <YellowBtn onClick={onBack}>Voltar ao início</YellowBtn>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Solicitar Orçamento" onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 100px' }}>

        <div style={{ color: BRAND.textMuted, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
          Descreva o problema e, se quiser, envie uma foto para agilizar o orçamento.
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Categoria</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={() => setCategory(c.id)} style={{
                flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                background: category === c.id ? BRAND.primary : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${category === c.id ? BRAND.primary : BRAND.cardBorder}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 20 }}>{c.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: category === c.id ? BRAND.dark : BRAND.textSub, marginTop: 3 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Input label="Descrição do problema" value={desc} onChange={setDesc}
          placeholder="Ex: Chave quebrou na fechadura, preciso abrir e copiar..." icon="📝"/>

        {/* Photo upload */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: BRAND.textSub, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Foto (opcional)</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }}/>

          {photo ? (
            <GlassCard style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={photo.url} alt="preview" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{photo.name}</div>
                <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 2 }}>{photo.size}</div>
              </div>
              <div onClick={() => setPhoto(null)} style={{ color: BRAND.danger, fontSize: 20, cursor: 'pointer' }}>✕</div>
            </GlassCard>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{
              border: `2px dashed ${BRAND.cardBorder}`, borderRadius: 14,
              padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ color: BRAND.textSub, fontSize: 13, fontWeight: 600 }}>Toque para adicionar foto</div>
              <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 4 }}>JPG, PNG até 10MB</div>
            </div>
          )}
        </div>

        {/* Contact preference */}
        <GlassCard style={{ padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Retorno de contato</div>
          {[{ icon: '📱', label: 'WhatsApp', sub: BRAND.phone }, { icon: '📧', label: 'E-mail', sub: 'Enviado ao seu cadastro' }].map(o => (
            <div key={o.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${BRAND.cardBorder}` }}>
              <span style={{ fontSize: 20 }}>{o.icon}</span>
              <div>
                <div style={{ color: 'white', fontSize: 13 }}>{o.label}</div>
                <div style={{ color: BRAND.textMuted, fontSize: 11 }}>{o.sub}</div>
              </div>
            </div>
          ))}
        </GlassCard>

        <YellowBtn onClick={send}>
          {loading ? '⏳ Enviando...' : '📤 Enviar solicitação de orçamento'}
        </YellowBtn>
      </div>
      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

// ── Screen 7 — Status do Pedido ───────────────────────────────────────────────
function StatusScreen({ onBack, onRate, onEmergency }) {
  const [selected, setSelected] = React.useState(ORDERS[1]);
  const [tick, setTick] = React.useState(0);

  // Simula Realtime
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { key: 'agendado', label: 'Agendado', icon: '📅' },
    { key: 'confirmado', label: 'Confirmado', icon: '✅' },
    { key: 'em_andamento', label: 'Em andamento', icon: '🔧' },
    { key: 'concluido', label: 'Concluído', icon: '🎉' },
  ];
  const currentStep = STATUS_INFO[selected.status]?.step || 0;

  return (
    <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader title="Status dos Pedidos" onBack={onBack}/>

      {/* Realtime indicator */}
      <div style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: 3,
          background: '#51CF66',
          opacity: tick % 2 === 0 ? 1 : 0.4,
          transition: 'opacity 0.5s',
        }}/>
        <span style={{ color: BRAND.textMuted, fontSize: 11 }}>Atualização em tempo real</span>
      </div>

      {/* Order list */}
      <div style={{ padding: '0 16px 12px' }}>
        {ORDERS.map(o => (
          <div key={o.id} onClick={() => setSelected(o)} style={{ marginBottom: 8, cursor: 'pointer' }}>
            <GlassCard style={{
              padding: '12px 14px',
              border: selected.id === o.id ? `1.5px solid ${STATUS_INFO[o.status].color}` : `1px solid ${BRAND.cardBorder}`,
              transition: 'border 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{o.service}</div>
                  <div style={{ color: BRAND.textMuted, fontSize: 11, marginTop: 2 }}>{o.id} • {o.date}</div>
                </div>
                <div style={{
                  background: `${STATUS_INFO[o.status].color}22`,
                  borderRadius: 16, padding: '4px 10px',
                  color: STATUS_INFO[o.status].color, fontSize: 10, fontWeight: 700,
                }}>{STATUS_INFO[o.status].label}</div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 90px' }}>
        <GlassCard style={{ padding: '18px 16px', marginBottom: 14 }}>
          <div style={{ color: BRAND.textMuted, fontSize: 11, marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Progresso do pedido
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 30 }}>
            {steps.map((s, i) => {
              const done = i < currentStep;
              const active = i === currentStep - 1;
              return (
                <div key={s.key} style={{ position: 'relative', paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
                  {/* Line */}
                  {i < steps.length - 1 && (
                    <div style={{
                      position: 'absolute', left: -22, top: 20, width: 2, height: 20,
                      background: done ? STATUS_INFO[selected.status].color : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.5s',
                    }}/>
                  )}
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: -28, top: 4,
                    width: 14, height: 14, borderRadius: 7,
                    background: done || active ? STATUS_INFO[selected.status].color : 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 7, transition: 'all 0.5s',
                    boxShadow: active ? `0 0 8px ${STATUS_INFO[selected.status].color}` : 'none',
                  }}>
                    {done && <span style={{ color: 'white' }}>✓</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <div style={{
                      color: done || active ? 'white' : BRAND.textMuted,
                      fontSize: 13, fontWeight: active ? 700 : 500,
                    }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${BRAND.cardBorder}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: BRAND.textMuted, fontSize: 13 }}>Valor</span>
            <span style={{ color: BRAND.primary, fontWeight: 700, fontSize: 14 }}>{selected.price}</span>
          </div>
        </GlassCard>

        {selected.status === 'concluido' && !selected.rated && (
          <YellowBtn onClick={() => onRate(selected)}>⭐ Avaliar este serviço</YellowBtn>
        )}

        {selected.status !== 'concluido' && (
          <GlassCard style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <div style={{ color: BRAND.textSub, fontSize: 12, lineHeight: 1.5 }}>
              Acompanhe o profissional em tempo real pelo WhatsApp quando confirmarmos o atendimento.
            </div>
          </GlassCard>
        )}
      </div>

      <EmergencyFAB onPress={onEmergency}/>
    </div>
  );
}

Object.assign(window, { ScreenHeader, CatalogScreen, ScheduleScreen, BudgetScreen, StatusScreen });
