import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Radio, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

type LoginRole = 'responder' | 'admin';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<LoginRole>('responder');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));
    login(selectedRole);
    navigate(selectedRole === 'admin' ? '/admin' : '/responder');
  };

  const roleOptions = [
    {
      id: 'responder' as const,
      label: t('responder'),
      description: t('responderDescription'),
      icon: Radio,
    },
    {
      id: 'admin' as const,
      label: t('administrator'),
      description: t('administratorDescription'),
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="absolute left-4 top-4">
        <Button variant="ghost" asChild>
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('backToHome')}
          </Link>
        </Button>
      </div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">{t('welcomeBack')}</h1>
            <p className="text-muted-foreground">{t('signInToAccess')}</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                  selectedRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <role.icon className={cn(
                  'h-6 w-6',
                  selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div>
                  <p className="font-medium">{role.label}</p>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('passwordLabel')}</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      {t('forgotPassword')}
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('signingIn')}
                </>
              ) : (
                selectedRole === 'admin' ? t('signInAsAdministrator') : t('signInAsResponder')
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('areYouCitizen')}{' '}
            <Link to="/citizen" className="text-primary hover:underline">
              {t('goToCitizenPortal')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
