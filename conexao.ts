import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export interface UsuarioDB {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  papel: 'admin' | 'operador';
  status: 'ativo' | 'inativo';
  criado_em?: string;
}

export interface VozDB {
  id: number;
  nome: string;
  voice_id: string;
  provedor: string;
  modelo: string;
  idioma: string;
  padrao: number;
  descricao?: string;
}

export interface ProvedorConfigDB {
  id: string; // 'gemini' | 'fishaudio' | 'groq' | 'deepseek' | 'openrouter' | 'qwen' | 'huggingface'
  nome: string;
  categoria: 'llm' | 'tts';
  apiKey: string;
  modelo: string;
  baseUrl?: string;
  voiceId?: string;
  isDefault: boolean;
  descricao?: string;
}

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'emribeir_romildo',
  password: process.env.DB_PASSWORD || 'Romildo2009@',
  database: process.env.DB_NAME || 'emribeir_jarvismulti',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 4000,
};

let pool: mysql.Pool | null = null;
let isConnectedToMySQL = false;

// Memória local persistente para funcionamento 100% offline se o banco MySQL estiver inacessível
export const localVault = {
  usuarios: [
    {
      id: 1,
      nome: 'Romildo Coelho',
      email: 'romildocoelhooficial@gmail.com',
      senha_hash: hashSenha('Romildo2009@'),
      papel: 'admin' as const,
      status: 'ativo' as const,
      criado_em: new Date().toISOString(),
    },
    {
      id: 2,
      nome: 'Administrador JARVIS',
      email: 'admin@jarvis.ai',
      senha_hash: hashSenha('admin123'),
      papel: 'admin' as const,
      status: 'ativo' as const,
      criado_em: new Date().toISOString(),
    },
  ],
  vozes: [
    {
      id: 1,
      nome: 'JARVIS Oficial PT-BR',
      voice_id: '82d13948027e4be69892dd3d0104e681',
      provedor: 'fishaudio',
      modelo: 's2.1-pro-free',
      idioma: 'pt-BR',
      padrao: 1,
      descricao: 'Voz neural Fish Audio principal de alta fidelidade para todo o sistema',
    },
    {
      id: 2,
      nome: 'JARVIS Sólido Tático',
      voice_id: '3b18544a0eef4d40b9d7ef3ef30b8d5a',
      provedor: 'fishaudio',
      modelo: 's2.1-pro-free',
      idioma: 'pt-BR',
      padrao: 0,
      descricao: 'Voz alternativa de resposta rápida',
    },
  ],
  provedores: [
    {
      id: 'gemini',
      nome: 'Google Gemini (AI Studio)',
      categoria: 'llm' as const,
      apiKey: process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K-x8jhkPXJjS4Wh_itVmjQZ-4O3JiSsiRV9kJDU8pVKQ',
      modelo: 'gemini-3.8-flash',
      baseUrl: 'https://generativelanguage.googleapis.com',
      isDefault: true,
      descricao: 'Motor oficial Google AI Studio (pt-BR por padrão)',
    },
    {
      id: 'fishaudio',
      nome: 'Fish Audio Neural TTS',
      categoria: 'tts' as const,
      apiKey: process.env.FISH_AUDIO_API_KEY || 'sk-fish-0mM-qbcOsgBe2QGhEwazLk2C0_DTkCPqNKdBWqMAs24',
      modelo: 's2.1-pro-free',
      voiceId: '82d13948027e4be69892dd3d0104e681',
      baseUrl: 'https://api.fish.audio/v1/tts',
      isDefault: true,
      descricao: 'Voz neural de alta fidelidade padrão para todo o sistema',
    },
    {
      id: 'groq',
      nome: 'Groq (Ultra-Low Latency LPU)',
      categoria: 'llm' as const,
      apiKey: '',
      modelo: 'llama-3.3-70b-versatile',
      baseUrl: 'https://api.groq.com/openai/v1',
      isDefault: false,
      descricao: 'Inferência de altíssima velocidade em LPU (Llama 3.3 70B, Mixtral)',
    },
    {
      id: 'deepseek',
      nome: 'DeepSeek (V3 / R1 Reasoning)',
      categoria: 'llm' as const,
      apiKey: '',
      modelo: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com',
      isDefault: false,
      descricao: 'Modelos de raciocínio profundo e programação DeepSeek V3 e R1',
    },
    {
      id: 'openrouter',
      nome: 'OpenRouter (Multi-Model Gateway)',
      categoria: 'llm' as const,
      apiKey: '',
      modelo: 'google/gemini-2.0-flash-exp:free',
      baseUrl: 'https://openrouter.ai/api/v1',
      isDefault: false,
      descricao: 'Roteamento flexível para centenas de LLMs com chave única',
    },
    {
      id: 'qwen',
      nome: 'Qwen (Alibaba DashScope)',
      categoria: 'llm' as const,
      apiKey: '',
      modelo: 'qwen-turbo',
      baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      isDefault: false,
      descricao: 'Modelos multilíngues Qwen 2.5 de alta capacidade analítica',
    },
    {
      id: 'huggingface',
      nome: 'HuggingFace (Serverless Inference)',
      categoria: 'llm' as const,
      apiKey: '',
      modelo: 'meta-llama/Llama-3.2-3B-Instruct',
      baseUrl: 'https://router.huggingface.co/hf-inference/v1',
      isDefault: false,
      descricao: 'Acesso direto a modelos de código aberto via HuggingFace Hub',
    },
  ] as ProvedorConfigDB[],
};

export function hashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

export async function getDbConnection() {
  if (pool) return pool;
  try {
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    isConnectedToMySQL = true;
    console.log(`[MySQL] Conexão estabelecida com sucesso no banco ${dbConfig.database}!`);
    conn.release();
    return pool;
  } catch (err: any) {
    console.warn(`[MySQL] Banco remoto indisponível (${err.message}). Modo de redundância local ativado automaticamente.`);
    isConnectedToMySQL = false;
    pool = null;
    return null;
  }
}

export function isDbOnline(): boolean {
  return isConnectedToMySQL;
}
