import { useState } from 'react';
import { Bot, Loader2, Lock, Mail, ShieldCheck, Sprout, TrendingUp } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (!isLogin) {
      setMessage('Cadastro criado. Verifique seu email para confirmar a conta.');
    }

    setLoading(false);
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.24),transparent_32%),linear-gradient(135deg,#020617,#0f172a_45%,#064e3b)]" />
        <div className="relative z-10">
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black">AgroGestao Pro</p>
              <p className="text-sm text-emerald-100">Enterprise farm operations</p>
            </div>
          </div>
          <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight">
            Gestao agricola inteligente, financeira e operacional em tempo real.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Uma central premium para produtividade, custos, safras, maquinas, estoque e decisoes com assistente IA.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            ['+18%', 'produtividade media'],
            ['-11%', 'custo operacional'],
            ['24/7', 'alertas e insights'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Sprout className="h-6 w-6" />
            </div>
            <p className="text-xl font-black text-slate-950">AgroGestao Pro</p>
          </div>

          <div className="mb-8">
            <p className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Plataforma SaaS agricola
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">{isLogin ? 'Entrar no painel' : 'Criar conta'}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin ? 'Acesse a operacao da fazenda com seguranca.' : 'Comece com autenticacao Supabase preservada.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Senha</span>
              <span className="relative block">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  required
                />
              </span>
            </label>

            {message && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">{message}</p>}

            <Button className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <button className="mt-6 text-sm font-semibold text-emerald-700" onClick={() => setIsLogin((value) => !value)}>
            {isLogin ? 'Nao possui conta? Cadastre-se' : 'Ja possui conta? Entrar'}
          </button>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Auth</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4 text-emerald-600" /> KPIs</span>
            <span className="flex items-center gap-1"><Bot className="h-4 w-4 text-emerald-600" /> IA</span>
          </div>
        </div>
      </section>
    </div>
  );
}
