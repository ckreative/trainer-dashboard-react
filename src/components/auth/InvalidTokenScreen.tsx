import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';

interface InvalidTokenScreenProps {
  onRequestNewLink: () => void;
  onBackToLogin: () => void;
}

export function InvalidTokenScreen({
  onRequestNewLink,
  onBackToLogin,
}: InvalidTokenScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Invalid reset link</CardTitle>
          <CardDescription className="text-center">
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Password reset links expire after a certain period for security reasons.
            You can request a new reset link to continue.
          </p>

          <div className="space-y-2 pt-2">
            <Button onClick={onRequestNewLink} className="w-full">
              Request new reset link
            </Button>
            <Button onClick={onBackToLogin} variant="outline" className="w-full">
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
