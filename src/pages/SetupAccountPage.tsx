import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService, ApiError } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface InvitationData {
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: string;
}

type PageState = 'loading' | 'valid' | 'error';

export function SetupAccountPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setPageState('error');
        setErrorMessage('Invalid invitation link');
        return;
      }

      try {
        const data = await authService.validateInvitation(token);
        setInvitation({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          expiresAt: data.expiresAt,
        });
        setPageState('valid');
      } catch (error) {
        const apiError = error as { error?: string; message?: string };
        setErrorCode(apiError.error || 'UNKNOWN');
        setErrorMessage(apiError.message || 'This invitation is invalid');
        setPageState('error');
      }
    }

    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.acceptInvitation(token!, password, passwordConfirmation);
      toast.success('Account created successfully! Welcome to the platform.');
      await refreshUser();
      navigate('/event-types');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors) {
        setFieldErrors(
          Object.entries(apiError.errors).reduce((acc, [key, messages]) => {
            acc[key] = messages[0];
            return acc;
          }, {} as Record<string, string>)
        );
      } else {
        toast.error(apiError.message || 'Failed to create account');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900"></div>
          <p className="text-sm text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="w-full" style={{ maxWidth: '420px' }}>
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div
              className="inline-flex items-center justify-center rounded-xl bg-destructive"
              style={{ width: '56px', height: '56px', marginBottom: '1rem' }}
            >
              <AlertCircle className="text-destructive-foreground" style={{ width: '28px', height: '28px' }} />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {errorCode === 'EXPIRED' ? 'Invitation Expired' :
               errorCode === 'ALREADY_ACCEPTED' ? 'Already Accepted' :
               errorCode === 'NOT_FOUND' ? 'Invitation Not Found' :
               'Invalid Invitation'}
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: '1rem' }}>
              {errorMessage}
            </p>
          </div>

          <div
            className="bg-card border border-border rounded-xl text-center"
            style={{ padding: '2rem' }}
          >
            {errorCode === 'ALREADY_ACCEPTED' ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  This invitation has already been used. You can log in with your credentials.
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Please contact your administrator to request a new invitation.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full" style={{ maxWidth: '420px' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div
            className="inline-flex items-center justify-center rounded-xl bg-primary"
            style={{ width: '56px', height: '56px', marginBottom: '1rem' }}
          >
            <UserPlus className="text-primary-foreground" style={{ width: '28px', height: '28px' }} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Complete Your Account Setup
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '1rem' }}>
            Welcome, {invitation?.firstName}! Set your password to get started.
          </p>
        </div>

        {/* Setup Form */}
        <div
          className="bg-card border border-border rounded-xl"
          style={{ padding: '2rem' }}
        >
          {/* Pre-filled info */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Invitation verified</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Name:</strong> {invitation?.firstName} {invitation?.lastName}</p>
              <p><strong>Email:</strong> {invitation?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Password field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.password}
                autoComplete="new-password"
                minLength={8}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password_confirmation">
                Confirm Password
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Confirm your password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.password_confirmation}
                autoComplete="new-password"
              />
              {fieldErrors.password_confirmation && (
                <p className="text-sm text-destructive">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Complete Setup'}
            </Button>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground" style={{ marginTop: '1.5rem' }}>
          By creating an account, you agree to our{" "}
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
