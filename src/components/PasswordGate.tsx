/**
 * PasswordGate — simple client-side access control.
 *
 * Requires VITE_APP_PASSWORD to be set as an environment variable.
 * - In Netlify: set it in Site Configuration → Environment Variables.
 * - In local dev: create a .env.local file with VITE_APP_PASSWORD=test.
 *
 * If VITE_APP_PASSWORD is empty or undefined, the gate is skipped entirely,
 * allowing local development without any configuration.
 *
 * The unlock state is stored in sessionStorage so it survives page refreshes
 * within the same tab but is cleared when the tab is closed.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'uplift-unlocked';
const EXPECTED = import.meta.env.VITE_APP_PASSWORD ?? '';

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true',
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  // Skip gate entirely if no password configured (local dev)
  if (EXPECTED === '') {
    return <>{children}</>;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === EXPECTED) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
    } else {
      setError(true);
      setValue('');
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
        <h1 className="text-2xl font-bold text-gray-900">Uplift Compare</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <input
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Enter password"
            autoFocus
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="text-sm text-red-600">Incorrect password</p>
          )}
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}
