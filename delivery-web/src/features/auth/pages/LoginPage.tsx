import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';

import {
  useAuthStore,
  type AuthState,
} from '../store/auth.store';
import styles from './LoginPage.module.css';

const passwordRules = ['8 a 16 caracteres', '1 letra maiúscula', '1 número', '1 caractere especial'];

export function LoginPage() {
  const login = useAuthStore((state: AuthState) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = login(email, password);
      if (!result.success) {
        setErrorMessage(result.message ?? 'Falha ao autenticar.');
        return;
      }
      setErrorMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <article className={styles.hero}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Acesso da plataforma</p>
            <h1 className={styles.title}>Entre para acompanhar seu pedido.</h1>
            <p className={styles.subtitle}>
              Faça login com suas credenciais para acessar a área correspondente ao seu perfil.
            </p>

            <div className={styles.bulletRow}>
              {passwordRules.map((rule) => (
                <span key={rule} className={styles.ruleChip}>
                  {rule}
                </span>
              ))}
            </div>
          </div>

          <aside className={styles.infoCard}>
            <span className={styles.infoLabel}>Acesso seguro</span>
            <strong className={styles.infoValue}>Dados sensíveis são restritos ao perfil admin.</strong>
            <p className={styles.infoText}>
              O perfil de cliente não exibe informações confidenciais de operação como pedidos internos e webhooks.
            </p>
          </aside>
        </article>

        <article className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <h2 className={styles.formTitle}>Login</h2>
              <p className={styles.formHint}>Use email válido e senha forte para entrar.</p>
            </div>
            <span className={styles.badge}>Acesso padrão</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                placeholder="seu-email@dominio.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Senha</label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                maxLength={16}
              />
            </div>

            <div className={styles.rulesBox}>
              <span className={styles.rulesTitle}>Regras da senha</span>
              <p className={styles.rulesText}>
                A senha precisa ter de 8 a 16 caracteres, incluir uma letra maiúscula, um número e um caractere especial.
              </p>
            </div>

            {errorMessage ? <div className={styles.errorBox}>{errorMessage}</div> : null}

            <button className={styles.button} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Validando...' : 'Entrar'}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
