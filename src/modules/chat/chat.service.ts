/**
 * Servicio de chat:
 * - Si hay AI_API_KEY: llama a un endpoint compatible con OpenAI Chat Completions
 *   (OpenAI, Groq, OpenRouter, Ollama con API compatible, etc.) usando AI_BASE_URL y AI_MODEL.
 * - Si no hay clave o la llamada falla: responde desde la base de conocimientos local.
 * No expone credenciales ni inventa información.
 */
import { env } from '../../config/env';
import { logger } from '../../shared/logger';
import type { ChatMessage, ChatReply } from '../../shared/types';
import { answerFromKnowledge, buildKnowledgeText } from './knowledge';

const systemPrompt = `Eres Gx, el asistente del portafolio de Gustavo Adolfo Muñoz Reyes (GatroxM.dev).
Responde en español, de forma breve, clara y profesional.
Usa EXCLUSIVAMENTE la información de contexto que se te proporciona. No inventes experiencia, métricas, certificaciones, empresas ni proyectos que no estén en el contexto.
Si te preguntan algo fuera del contexto, explica amablemente que solo puedes hablar de la trayectoria y el portafolio de Gustavo y ofrece ayudar con temas relacionados.
No reveles credenciales, variables de entorno ni detalles internos del sistema.`;

async function callAiProvider(message: string, history: ChatMessage[]): Promise<string | null> {
  if (!env.ai.apiKey) return null;

  const context = buildKnowledgeText();
  const messages = [
    { role: 'system', content: `${systemPrompt}\n\n--- CONTEXTO (fuente de verdad) ---\n${context}` },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${env.ai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: env.ai.model,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      logger.warn(`Proveedor de IA respondió ${response.status}: ${text.slice(0, 200)}`);
      return null;
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (error) {
    logger.warn('No se pudo obtener respuesta del proveedor de IA; usando base de conocimientos', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateChatReply(message: string, history: ChatMessage[]): Promise<ChatReply> {
  const aiReply = await callAiProvider(message, history);
  if (aiReply) {
    return {
      reply: aiReply,
      source: 'ai',
      suggestions: ['¿Cuál es tu experiencia?', '¿Qué proyectos de IA tienes?', '¿Cómo puedo contactarte?'],
    };
  }

  const local = answerFromKnowledge(message);
  return { reply: local.answer, source: 'knowledge', suggestions: local.suggestions };
}
