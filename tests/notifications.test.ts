import { describe, expect, it, vi } from 'vitest';
import {
  buildContactText,
  resolveNotifyConfig,
  sendContactNotification,
  type ContactNotification,
} from '../src/modules/notifications/whatsapp.service';

const payload: ContactNotification = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  subject: 'Propuesta de proyecto',
  message: 'Hola, quiero hablar sobre una app con Angular.',
};

function okFetch() {
  return vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => ({
    ok: true,
    status: 200,
  })) as unknown as typeof fetch & { mock: { calls: unknown[][] } };
}

describe('buildContactText', () => {
  it('incluye nombre, correo, asunto y mensaje', () => {
    const text = buildContactText(payload);
    expect(text).toContain('Ana Pérez');
    expect(text).toContain('ana@example.com');
    expect(text).toContain('Propuesta de proyecto');
    expect(text).toContain('Angular');
    expect(text.startsWith('📩 Nuevo mensaje en GatroxM.dev')).toBe(true);
  });

  it('usa un marcador cuando no hay asunto', () => {
    expect(buildContactText({ ...payload, subject: '  ' })).toContain('(sin asunto)');
  });

  it('recorta mensajes muy largos', () => {
    const text = buildContactText({ ...payload, message: 'x'.repeat(900) });
    expect(text).toContain('…');
    expect(text.length).toBeLessThan(900);
  });
});

describe('resolveNotifyConfig', () => {
  it('activa CallMeBot solo con teléfono y API key', () => {
    expect(
      resolveNotifyConfig({ WHATSAPP_PROVIDER: 'callmebot', WHATSAPP_PHONE: '+573133976999', WHATSAPP_API_KEY: '123' } as NodeJS.ProcessEnv).provider,
    ).toBe('callmebot');

    expect(
      resolveNotifyConfig({ WHATSAPP_PROVIDER: 'callmebot', WHATSAPP_PHONE: '+573133976999' } as NodeJS.ProcessEnv).provider,
    ).toBe('none');
  });

  it('activa UltraMsg y Telegram con sus credenciales', () => {
    expect(
      resolveNotifyConfig({
        WHATSAPP_PROVIDER: 'ultramsg',
        WHATSAPP_PHONE: '+573133976999',
        ULTRAMSG_INSTANCE: 'instance1',
        ULTRAMSG_TOKEN: 'token',
      } as NodeJS.ProcessEnv).provider,
    ).toBe('ultramsg');

    expect(
      resolveNotifyConfig({
        WHATSAPP_PROVIDER: 'telegram',
        TELEGRAM_BOT_TOKEN: 'bot-token',
        TELEGRAM_CHAT_ID: '12345',
      } as NodeJS.ProcessEnv).provider,
    ).toBe('telegram');
  });

  it('queda en none si no hay variables', () => {
    expect(resolveNotifyConfig({} as NodeJS.ProcessEnv).provider).toBe('none');
  });
});

describe('sendContactNotification', () => {
  it('envía a CallMeBot con el teléfono y el texto codificados', async () => {
    const fakeFetch = okFetch();
    const sent = await sendContactNotification(
      payload,
      {
        provider: 'callmebot',
        phone: '+573133976999',
        apiKey: 'abc123',
        ultraMsgInstance: '',
        ultraMsgToken: '',
        telegramBotToken: '',
        telegramChatId: '',
      },
      fakeFetch,
    );

    expect(sent).toBe(true);
    expect(fakeFetch.mock.calls).toHaveLength(1);
    const url = String(fakeFetch.mock.calls[0][0]);
    expect(url.startsWith('https://api.callmebot.com/whatsapp.php?')).toBe(true);
    expect(url).toContain('phone=%2B573133976999');
    expect(url).toContain('apikey=abc123');
    expect(new URL(url).searchParams.get('text')).toContain('Ana Pérez');
  });

  it('envía a Telegram con chat_id y texto', async () => {
    const fakeFetch = okFetch();
    const sent = await sendContactNotification(
      payload,
      {
        provider: 'telegram',
        phone: '',
        apiKey: '',
        ultraMsgInstance: '',
        ultraMsgToken: '',
        telegramBotToken: 'bot-token',
        telegramChatId: '12345',
      },
      fakeFetch,
    );

    expect(sent).toBe(true);
    const [url, init] = fakeFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.telegram.org/botbot-token/sendMessage');
    const body = JSON.parse(String(init.body)) as { chat_id: string; text: string };
    expect(body.chat_id).toBe('12345');
    expect(body.text).toContain('ana@example.com');
  });

  it('no llama a la red si no hay proveedor', async () => {
    const fakeFetch = okFetch();
    const sent = await sendContactNotification(payload, resolveNotifyConfig({} as NodeJS.ProcessEnv), fakeFetch);
    expect(sent).toBe(false);
    expect(fakeFetch.mock.calls).toHaveLength(0);
  });

  it('devuelve false sin lanzar si el proveedor falla', async () => {
    const failing = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const sent = await sendContactNotification(
      payload,
      {
        provider: 'callmebot',
        phone: '+573133976999',
        apiKey: 'abc123',
        ultraMsgInstance: '',
        ultraMsgToken: '',
        telegramBotToken: '',
        telegramChatId: '',
      },
      failing,
    );

    expect(sent).toBe(false);
  });
});
