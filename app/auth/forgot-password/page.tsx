import ForgotPasswordForm from '../components/ForgotPasswordForm';
import Logo from '@/components/logo';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password | GRND',
  description: 'Reset your GRND account password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Logo className="text-3xl mb-6 text-[var(--ds-text-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--ds-text-primary)] mb-2">
            Reset your password
          </h1>
          <p className="text-[var(--ds-text-secondary)]">
            Enter your email and we&apos;ll send you instructions to reset your password
          </p>
        </div>
        
        {/* Forgot Password Form */}
        <ForgotPasswordForm />
        
        {/* Footer Links */}
        <div className="text-center">
          <Link 
            href="/auth/signin" 
            className="text-sm font-medium text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 