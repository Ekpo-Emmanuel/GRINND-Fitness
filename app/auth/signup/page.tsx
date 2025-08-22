import Link from 'next/link';
import SignUpForm from '../components/SignUpForm';
import Logo from '@/components/logo';

export const metadata = {
  title: 'Sign Up | GRND',
  description: 'Create a new GRND account',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Logo className="text-3xl mb-6 text-[var(--ds-text-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--ds-text-primary)] mb-2">
            Create your account
          </h1>
          <p className="text-[var(--ds-text-secondary)]">
            Start your fitness journey with GRND
          </p>
        </div>
        
        {/* Sign Up Form */}
        <SignUpForm />
        
        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-[var(--ds-text-muted)]">
            Already have an account?{" "}
            <Link 
              href="/auth/signin" 
              className="font-medium text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 