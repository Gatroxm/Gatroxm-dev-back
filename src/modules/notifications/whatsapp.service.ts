/**
 * Notificaciones al recibir un mensaje del formulario de contacto.
 *
 * Reglas:
 *  - Nunca lanza errores: un fallo al notificar no debe romper el formulario.
 *  - Si no hay proveedor configurado se omite en silencio (solo log debug).
 *  - No registra credenciales en los logs.
 *
 * Proveedores soportados (variable WHATSAPP_PROVIDER):
 *  - callmebot: requiere WHATSAPP_PHONE + WHATSAPP_API_KEY
 *  - ultramsg:  requiere WHATSAPP_PHONE + ULTRAMSG_INSTANCE + ULTRAMSG_TOKEN
 *  - telegram:  requiere TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID
 */
import { logger } from '../../shared/logger';

export type NotifyProvider = 'callmebot' | 'ultramsg' | 'telegram' | 'none';

export interface NotifyConfig {
  provider: NotifyProvider;
  phone: string;
  apiKey: string;
  ultraMsgInstance: string;
  ultraMsgToken: string;
  telegramBotToken: string;
  telegramChatId: string;
}

export interface ContactNotification {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

const MAX_MESSAGE_CHARS = 500;
const REQUEST_TIMEOUT_MS = 8000;

function emptyConfig(): NotifyConfig {
  return {
    provider: 'none',
    phone: '',
    apiKey: '',
    ultraMsgInstance: '',
    ultraMsgToken: '',
    telegramBotToken: '',
    telegramChatId: '',
  };
}

/** Arma el texto de la notificación, recortando mensajes muy largos. */
export function buildContactText(payload: ContactNotification): string {
  const subject = payload.subject?.trim() || '(sin asunto)';
  const body = payload.message.trim();
  const clipped =
    body.length > MAX_MESSAGE_CHARS ? `${body.slice(0, MAX_MESSAGE_CHARS).trimEnd()}…` : body;

  return [
    '📩 Nuevo mensaje en GatroxM.dev',
    '',
    `👤 ${payload.name.trim()}`,
    `✉️ ${payload.email.trim()}`,
    `📝 ${subject}`,
    '',
    clipped,
  ].join('\n');
}

/** Lee la configuración de las variables de entorno y valida que esté completa. */
export function resolveNotifyConfig(source: NodeJS.ProcessEnv = process.env): NotifyConfig {
  const config = emptyConfig();
  const provider = (source.WHATSAPP_PROVIDER ?? '').trim().toLowerCase();

  config.phone = (source.WHATSAPP_PHONE ?? '').trim();
  config.apiKey = (source.WHATSAPP_API_KEY ?? '').trim();
  config.ultraMsgInstance = (source.ULTRAMSG_INSTANCE ?? '').trim();
  config.ultraMsgToken = (source.ULTRAMSG_TOKEN ?? '').trim();
  config.telegramBotToken = (source.TELEGRAM_BOT_TOKEN ?? '').trim();
  config.telegramChatId = (source.TELEGRAM_CHAT_ID ?? '').trim();

  if (provider === 'callmebot' && config.phone && config.apiKey) {
    config.provider = 'callmebot';
  } else if (provider === 'ultramsg' && config.phone && config.ultraMsgInstance && config.ultraMsgToken) {
    config.provider = 'ultramsg';
  } else if (provider === 'telegram' && config.telegramBotToken && config.telegramChatId) {
    config.provider = 'telegram';
  }

  return config;
}

async function sendWithCallMeBot(config: NotifyConfig, text: string, fetchImpl: typeof fetch): Promise<void> {
  const params = new URLSearchParams({
    phone: config.phone,
    text,
    apikey: config.apiKey,
  });
  const response = await fetchImpl(`https://api.callmebot.com/whatsapp.php?${params.toString()}`);
  if (!response.ok) throw new Error(`CallMeBot respondió ${response.status}`);
}

async function sendWithUltraMsg(config: NotifyConfig, text: string, fetchImpl: typeof fetch): Promise<void> {
  const response = await fetchImpl(
    `https://api.ultramsg.com/${encodeURIComponent(config.ultraMsgInstance)}/messages/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: config.ultraMsgToken,
        to: config.phone,
        body: text,
      }).toString(),
    },
  );
  if (!response.ok) throw new Error(`UltraMsg respondió ${response.status}`);
}

async function sendWithTelegram(config: NotifyConfig, text: string, fetchImpl: typeof fetch): Promise<void> {
  const response = await fetchImpl(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text,
        disable_web_page_preview: true,
      }),
    },
  );
  if (!response.ok) throw new Error(`Telegram respondió ${response.status}`);
}

/**
 * Envía la notificación del mensaje de contacto.
 * Devuelve true si se envió y false si se omitió o falló. Nunca lanza.
 */
export async function sendContactNotification(
  payload: ContactNotification,
  config: NotifyConfig = resolveNotifyConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (config.provider === 'none') {
    logger.debug('Notificación de contacto omitida: no hay proveedor configurado');
    return false;
  }

  const text = buildContactText(payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    if (config.provider === 'callmebot') {
      await sendWithCallMeBot(config, text, fetchImpl);
    } else if (config.provider === 'ultramsg') {
      await sendWithUltraMsg(config, text, fetchImpl);
    } else {
      await sendWithTelegram(config, text, fetchImpl);
    }
    logger.info(`Notificación de contacto enviada por ${config.provider}`);
    return true;
  } catch (error) {
    logger.warn(`No se pudo enviar la notificación de contacto por ${config.provider}`, error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
