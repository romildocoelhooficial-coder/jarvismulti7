import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Palette } from '../../constants/theme';

export interface UserSession {
  id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'operador';
  status: 'ativo' | 'inativo';
}

interface AuthModalProps {
  palette: Palette;
  onLoginSuccess: (user: UserSession, storage: string) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  palette,
  onLoginSuccess,
  onClose,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login' ? { email, senha } : { nome, email, senha };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Erro ao processar autenticação');
      }

      setSuccessMsg(`Autenticado com sucesso! Carregando painel...`);
      setTimeout(() => {
        onLoginSuccess(data.user, data.storage || 'local');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha de comunicação');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setEmail('romildocoelhooficial@gmail.com');
    setSenha('Romildo2009@');
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: `${palette.PANEL2}fa`,
          borderColor: palette.BORDER_B,
          boxShadow: `0 12px 40px rgba(0,0,0,0.8), 0 0 20px ${palette.PRI}33`,
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: palette.BORDER }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" style={{ color: palette.PRI }} />
            <div>
              <h3 className="font-bold text-sm tracking-widest uppercase font-mono" style={{ color: palette.WHITE }}>
                CONTROLE DE ACESSO // MARK LVI
              </h3>
              <p className="text-[10px] text-muted-foreground font-mono">Autenticação de Operadores e Administrador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b text-xs font-mono select-none" style={{ borderColor: palette.BORDER }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 text-center font-bold tracking-wider transition-all ${
              tab === 'login' ? 'border-b-2 text-white bg-black/40' : 'text-muted-foreground hover:text-white'
            }`}
            style={{ borderColor: tab === 'login' ? palette.PRI : 'transparent', color: tab === 'login' ? palette.PRI : undefined }}
          >
            ENTRAR (LOGIN)
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2.5 text-center font-bold tracking-wider transition-all ${
              tab === 'register' ? 'border-b-2 text-white bg-black/40' : 'text-muted-foreground hover:text-white'
            }`}
            style={{ borderColor: tab === 'register' ? palette.PRI : 'transparent', color: tab === 'register' ? palette.PRI : undefined }}
          >
            NOVO CADASTRO
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          {errorMsg && (
            <div className="p-2.5 rounded-lg border border-red-500/40 bg-red-950/30 text-red-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Nome Completo do Operador
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Romildo Coelho"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border bg-black/50 text-xs outline-none focus:border-cyan-400"
                  style={{ borderColor: palette.BORDER, color: palette.WHITE }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@jarvis.ai"
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-black/50 text-xs outline-none focus:border-cyan-400"
                style={{ borderColor: palette.BORDER, color: palette.WHITE }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-black/50 text-xs outline-none focus:border-cyan-400"
                style={{ borderColor: palette.BORDER, color: palette.WHITE }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
            style={{
              backgroundColor: palette.PRI,
              color: '#000',
            }}
          >
            <span>{loading ? 'AUTENTICANDO...' : tab === 'login' ? 'ACESSAR PAINEL' : 'CONCLUIR CADASTRO'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Admin fill button */}
          <div className="pt-2 border-t flex flex-col gap-1.5" style={{ borderColor: palette.BORDER }}>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="text-[10px] text-muted-foreground hover:text-cyan-400 text-center transition-colors font-mono"
            >
              Preencher credenciais do Administrador (Romildo)
            </button>
          </div>
        </form>

        {/* Footer Database Banner */}
        <div className="px-4 py-2.5 border-t bg-black/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground" style={{ borderColor: palette.BORDER }}>
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Banco: emribeir_jarvismulti</span>
          </span>
          <span className="text-emerald-400">ONLINE / OFFLINE HYBRID</span>
        </div>
      </div>
    </div>
  );
};
