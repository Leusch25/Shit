/**
 * Authentication Page
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Separator } from '../components/ui/Separator';
import { Gamepad2, Loader2, Mail, Lock, User, Eye, EyeOff, GitBranch, Globe, MessageCircle } from 'lucide-react';

export function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, signInWithOAuth, loading: authLoading } = useAuth();

  const initialMode = searchParams.get('mode') || 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode as 'signin' | 'signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', confirmPassword: '', username: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(signUpData.username)) {
      setError('Username must be 3-20 characters, alphanumeric and underscore only');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.username, signUpData.displayName);
      if (error) {
        setError(error.message);
      } else {
        navigate('/?welcome=true');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google' | 'discord') => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) setError(error.message);
    } catch (err) {
      setError('OAuth sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-foreground mb-4">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-green">
              <Gamepad2 className="h-6 w-6 text-primary-foreground" />
            </span>
            <span className="gradient-text">RetroPlay</span>
          </Link>
          <p className="text-muted-foreground">
            {mode === 'signin' ? 'Welcome back to your retro gaming library' : 'Create your free account to start playing'}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              {mode === 'signin' ? 'Enter your credentials to access your library' : 'Join thousands of retro gamers'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
                className="w-full gap-2"
              >
                <GitBranch className="h-4 w-4" />
                Continue with GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="w-full gap-2"
              >
                <Globe className="h-4 w-4" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('discord')}
                disabled={loading}
                className="w-full gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Continue with Discord
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Email/Password Form */}
            <Tabs value={mode} onValueChange={setMode} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-[38px]"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <Input
                    label="Display Name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData((prev) => ({ ...prev, displayName: e.target.value }))}
                    required
                    autoComplete="name"
                  />
                  <Input
                    label="Username"
                    type="text"
                    placeholder="johndoe"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    autoComplete="username"
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-[38px]"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    By creating an account, you agree to our{' '}
                    <a href="/terms" className="underline hover:text-primary">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
                  </p>
                  <Button type="submit" className="w-full" disabled={loading} icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Need to import Link and AlertCircle
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';