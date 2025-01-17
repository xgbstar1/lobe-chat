import { getLLMConfig } from '@/config/llm';
import { JWTPayload } from '@/const/auth';
import { INBOX_SESSION_ID } from '@/const/session';
import {
  LOBE_CHAT_OBSERVATION_ID,
  LOBE_CHAT_TRACE_ID,
  TracePayload,
  TraceTagMap,
} from '@/const/trace';
import { AgentRuntime, ChatStreamPayload, ModelProvider } from '@/libs/agent-runtime';
import { TraceClient } from '@/libs/traces';

import apiKeyManager from './apiKeyManager';

export interface AgentChatOptions {
  enableTrace?: boolean;
  provider: string;
  trace?: TracePayload;
}

/**
 * Retrieves the options object from environment and apikeymanager
 * based on the provider and payload.
 *
 * @param provider - The model provider.
 * @param payload - The JWT payload.
 * @returns The options object.
 */
const getLlmOptionsFromPayload = (provider: string, payload: JWTPayload) => {
  switch (provider) {
    default: // Use Openai options as default
    case ModelProvider.OpenAI: {
      const { OPENAI_API_KEY } = getLLMConfig();

      const openaiApiKey = payload?.apiKey || OPENAI_API_KEY;
      const baseURL = payload?.endpoint || process.env.OPENAI_PROXY_URL;
      const apiKey = apiKeyManager.pick(openaiApiKey);

      return { apiKey, baseURL };
    }
    case ModelProvider.Azure: {
      const { AZURE_API_KEY, AZURE_API_VERSION, AZURE_ENDPOINT } = getLLMConfig();
      const apiKey = apiKeyManager.pick(payload?.apiKey || AZURE_API_KEY);
      const endpoint = payload?.endpoint || AZURE_ENDPOINT;
      const apiVersion = payload?.azureApiVersion || AZURE_API_VERSION;
      return {
        apiVersion,
        apikey: apiKey,
        endpoint,
      };
    }
    case ModelProvider.ZhiPu: {
      const { ZHIPU_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || ZHIPU_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Google: {
      const { GOOGLE_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || GOOGLE_API_KEY);
      const baseURL = payload?.endpoint || process.env.GOOGLE_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.Moonshot: {
      const { MOONSHOT_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || MOONSHOT_API_KEY);
      const baseURL = payload?.endpoint || process.env.MOONSHOT_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.Bedrock: {
      const { AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SESSION_TOKEN } =
        getLLMConfig();
      let accessKeyId: string | undefined = AWS_ACCESS_KEY_ID;
      let accessKeySecret: string | undefined = AWS_SECRET_ACCESS_KEY;
      let region = AWS_REGION;
      let sessionToken: string | undefined = AWS_SESSION_TOKEN;
      // if the payload has the api key, use user
      if (payload.apiKey) {
        accessKeyId = payload?.awsAccessKeyId;
        accessKeySecret = payload?.awsSecretAccessKey;
        sessionToken = payload?.awsSessionToken;
        region = payload?.awsRegion;
      }
      return { accessKeyId, accessKeySecret, region, sessionToken };
    }
    case ModelProvider.Ollama: {
      const baseURL = payload?.endpoint || process.env.OLLAMA_PROXY_URL;
      return { baseURL };
    }
    case ModelProvider.Perplexity: {
      const { PERPLEXITY_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || PERPLEXITY_API_KEY);
      const baseURL = payload?.endpoint || process.env.PERPLEXITY_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.Anthropic: {
      const { ANTHROPIC_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || ANTHROPIC_API_KEY);
      const baseURL = payload?.endpoint || process.env.ANTHROPIC_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.Minimax: {
      const { MINIMAX_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || MINIMAX_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Mistral: {
      const { MISTRAL_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || MISTRAL_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Groq: {
      const { GROQ_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || GROQ_API_KEY);
      const baseURL = payload?.endpoint || process.env.GROQ_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.Github: {
      const { GITHUB_TOKEN } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || GITHUB_TOKEN);

      return { apiKey };
    }
    case ModelProvider.OpenRouter: {
      const { OPENROUTER_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || OPENROUTER_API_KEY);

      return { apiKey };
    }
    case ModelProvider.DeepSeek: {
      const { DEEPSEEK_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || DEEPSEEK_API_KEY);

      return { apiKey };
    }
    case ModelProvider.TogetherAI: {
      const { TOGETHERAI_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || TOGETHERAI_API_KEY);

      return { apiKey };
    }
    case ModelProvider.FireworksAI: {
      const { FIREWORKSAI_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || FIREWORKSAI_API_KEY);

      return { apiKey };
    }
    case ModelProvider.ZeroOne: {
      const { ZEROONE_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || ZEROONE_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Qwen: {
      const { QWEN_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || QWEN_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Stepfun: {
      const { STEPFUN_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || STEPFUN_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Novita: {
      const { NOVITA_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || NOVITA_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Baichuan: {
      const { BAICHUAN_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || BAICHUAN_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Taichu: {
      const { TAICHU_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || TAICHU_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Cloudflare: {
      const { CLOUDFLARE_API_KEY, CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || CLOUDFLARE_API_KEY);
      const baseURLOrAccountID =
        payload.apiKey && payload.cloudflareBaseURLOrAccountID
          ? payload.cloudflareBaseURLOrAccountID
          : CLOUDFLARE_BASE_URL_OR_ACCOUNT_ID;

      return { apiKey, baseURLOrAccountID };
    }
    case ModelProvider.Ai360: {
      const { AI360_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || AI360_API_KEY);

      return { apiKey };
    }
    case ModelProvider.SiliconCloud: {
      const { SILICONCLOUD_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || SILICONCLOUD_API_KEY);
      const baseURL = payload?.endpoint || process.env.SILICONCLOUD_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.GiteeAI: {
      const { GITEE_AI_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || GITEE_AI_API_KEY);

      return { apiKey };
    }

    case ModelProvider.HuggingFace: {
      const { HUGGINGFACE_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || HUGGINGFACE_API_KEY);
      const baseURL = payload?.endpoint || process.env.HUGGINGFACE_PROXY_URL;

      return { apiKey, baseURL };
    }

    case ModelProvider.Upstage: {
      const { UPSTAGE_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || UPSTAGE_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Spark: {
      const { SPARK_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || SPARK_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Ai21: {
      const { AI21_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || AI21_API_KEY);

      return { apiKey };
    }
    case ModelProvider.Hunyuan: {
      const { HUNYUAN_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || HUNYUAN_API_KEY);

      return { apiKey };
    }
    case ModelProvider.SenseNova: {
      const { SENSENOVA_ACCESS_KEY_ID, SENSENOVA_ACCESS_KEY_SECRET } = getLLMConfig();

      const sensenovaAccessKeyID = apiKeyManager.pick(
        payload?.sensenovaAccessKeyID || SENSENOVA_ACCESS_KEY_ID,
      );
      const sensenovaAccessKeySecret = apiKeyManager.pick(
        payload?.sensenovaAccessKeySecret || SENSENOVA_ACCESS_KEY_SECRET,
      );

      const apiKey = sensenovaAccessKeyID + ':' + sensenovaAccessKeySecret;

      return { apiKey };
    }
    case ModelProvider.XAI: {
      const { XAI_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || XAI_API_KEY);
      const baseURL = payload?.endpoint || process.env.XAI_PROXY_URL;

      return { apiKey, baseURL };
    }
    case ModelProvider.InternLM: {
      const { INTERNLM_API_KEY } = getLLMConfig();

      const apiKey = apiKeyManager.pick(payload?.apiKey || INTERNLM_API_KEY);

      return { apiKey };
    }
  }
};

/**
 * Initializes the agent runtime with the user payload in backend
 * @param provider - The provider name.
 * @param payload - The JWT payload.
 * @param params
 * @returns A promise that resolves when the agent runtime is initialized.
 */
export const initAgentRuntimeWithUserPayload = (
  provider: string,
  payload: JWTPayload,
  params: any = {},
) => {
  return AgentRuntime.initializeWithProviderOptions(provider, {
    [provider]: { ...getLlmOptionsFromPayload(provider, payload), ...params },
  });
};

export const createTraceOptions = (
  payload: ChatStreamPayload,
  { trace: tracePayload, provider }: AgentChatOptions,
) => {
  const { messages, model, tools, ...parameters } = payload;
  // create a trace to monitor the completion
  const traceClient = new TraceClient();
  const trace = traceClient.createTrace({
    id: tracePayload?.traceId,
    input: messages,
    metadata: { provider },
    name: tracePayload?.traceName,
    sessionId: `${tracePayload?.sessionId || INBOX_SESSION_ID}@${tracePayload?.topicId || 'start'}`,
    tags: tracePayload?.tags,
    userId: tracePayload?.userId,
  });

  const generation = trace?.generation({
    input: messages,
    metadata: { provider },
    model,
    modelParameters: parameters as any,
    name: `Chat Completion (${provider})`,
    startTime: new Date(),
  });

  return {
    callback: {
      experimental_onToolCall: async () => {
        trace?.update({
          tags: [...(tracePayload?.tags || []), TraceTagMap.ToolsCall],
        });
      },

      onCompletion: async (completion: string) => {
        generation?.update({
          endTime: new Date(),
          metadata: { provider, tools },
          output: completion,
        });

        trace?.update({ output: completion });
      },

      onFinal: async () => {
        await traceClient.shutdownAsync();
      },

      onStart: () => {
        generation?.update({ completionStartTime: new Date() });
      },
    },
    headers: {
      [LOBE_CHAT_OBSERVATION_ID]: generation?.id,
      [LOBE_CHAT_TRACE_ID]: trace?.id,
    },
  };
};
