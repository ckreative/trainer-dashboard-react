import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '../../services/auth';

interface LoginScreenProps {
  onForgotPassword: () => void;
  onSignUp?: () => void;
}

export function LoginScreen({ onForgotPassword, onSignUp }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors) {
        setErrors(
          Object.entries(apiError.errors).reduce((acc, [key, messages]) => {
            acc[key] = messages[0];
            return acc;
          }, {} as Record<string, string>)
        );
      } else {
        toast.error(apiError.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info('Google sign in is not available yet');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full" style={{ maxWidth: '420px' }}>
        {/* Logo/Brand Area */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div
            className="inline-flex items-center justify-center rounded-xl bg-primary"
            style={{ width: '56px', height: '56px', marginBottom: '1rem' }}
          >
            <Mail className="text-primary-foreground" style={{ width: '28px', height: '28px' }} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Sign in to your account
          </h1>
          {onSignUp && (
            <p className="text-muted-foreground" style={{ fontSize: '1rem' }}>
              Don't have an account?{" "}
              <button
                onClick={onSignUp}
                className="text-foreground font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>

        {/* Sign in form */}
        <div
          className="bg-card border border-border rounded-xl"
          style={{ padding: '2rem' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={isLoading}
                  className="text-sm text-foreground font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                aria-invalid={!!errors.password}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <Separator />
            <span
              className="absolute left-1/2 top-1/2 bg-card px-3 text-sm text-muted-foreground italic"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              or
            </span>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" style={{ marginRight: '0.5rem' }} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground" style={{ marginTop: '1.5rem' }}>
          By signing in, you agree to our{" "}
          <a href="#" className="hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
