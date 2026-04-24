import { Platform, Vibration } from "react-native";

/**
 * Toca uma notificação sonora + vibração quando um novo pedido chega.
 * - Web: usa Web Audio API para gerar um bip duplo agradável
 * - Mobile: vibra o dispositivo (padrão curto-longo)
 */
export function playNewOrderNotification(): void {
  if (Platform.OS === "web") {
    _playWebBeep();
  } else {
    _playMobileVibration();
  }
}

function _playWebBeep(): void {
  try {
    const AudioContextClass =
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext ?? window.AudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Primeiro bip
    _createBeep(ctx, 880, 0, 0.18);
    // Segundo bip (mais alto e logo depois)
    _createBeep(ctx, 1100, 0.22, 0.18);
  } catch {
    // Silencia erros — browser pode bloquear AudioContext sem interação do usuário
  }
}

function _createBeep(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    ctx.currentTime + startTime + duration
  );

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
}

function _playMobileVibration(): void {
  try {
    // Padrão: vibra 200ms, pausa 100ms, vibra 400ms
    Vibration.vibrate([200, 100, 400]);
  } catch {
    // Silencia erros em ambientes sem suporte a vibração
  }
}
