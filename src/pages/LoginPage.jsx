import { useState } from 'react';
import logo from '../assets/logo.png';
import { login, AuthServiceError } from '../authService';

export default function LoginPage({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof AuthServiceError ? err.message : 'Accesso non riuscito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src={logo} alt="Tenuta Macconi" className="h-12 w-auto" />
          <h1 className="text-base font-semibold text-[var(--text-primary)]">Marketing Dashboard</h1>
        </div>

        <label htmlFor="password" className="mb-1 block text-sm text-[var(--text-secondary)]">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--brand)]"
          placeholder="Inserisci la password"
        />

        {error && <p className="mb-3 text-sm text-[var(--series-8)]">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>
    </div>
  );
}
