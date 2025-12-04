import { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { InvalidTokenScreen } from './InvalidTokenScreen';

type AuthView = 'login' | 'forgot-password' | 'reset-password' | 'invalid-token';

interface AuthContainerProps {
  initialView?: AuthView;
  resetToken?: string;
}

export function AuthContainer({ initialView = 'login', resetToken }: AuthContainerProps) {
  const [view, setView] = useState<AuthView>(initialView);

  if (view === 'reset-password' && resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onSuccess={() => setView('login')}
        onInvalidToken={() => setView('invalid-token')}
      />
    );
  }

  if (view === 'invalid-token') {
    return (
      <InvalidTokenScreen
        onRequestNewLink={() => setView('forgot-password')}
        onBackToLogin={() => setView('login')}
      />
    );
  }

  if (view === 'forgot-password') {
    return <ForgotPasswordScreen onBackToLogin={() => setView('login')} />;
  }

  return <LoginScreen onForgotPassword={() => setView('forgot-password')} />;
}
