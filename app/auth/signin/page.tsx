import SignInForm from '../components/SignInForm';
import Logo from '@/components/logo';
import Link from 'next/link';

export const metadata = {
  title: 'Sign In | GRND',
  description: 'Sign in to your GRND account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Logo className="text-3xl mb-6 text-[var(--ds-text-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--ds-text-primary)] mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--ds-text-secondary)]">
            Sign in to continue your fitness journey
          </p>
        </div>
        
        {/* Sign In Form */}
        <SignInForm />
        
        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-[var(--ds-text-muted)]">
            Don&apos;t have an account?{" "}
            <Link 
              href="/auth/signup" 
              className="font-medium text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
          <Link 
            href="/auth/forgot-password" 
            className="text-sm font-medium text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
} 