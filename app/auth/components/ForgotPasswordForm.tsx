'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset instructions sent to your email');
        setEmail(''); // Clear the form
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-[var(--ds-surface)] rounded-[var(--ds-radius-xl)] border border-[var(--ds-border)] p-8">
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[var(--ds-text-primary)]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[var(--ds-radius-md)] border-[var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[var(--ds-text-primary)] placeholder:text-[var(--ds-text-muted)] focus:border-[var(--ds-accent-purple)]"
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--ds-radius-md)] bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] font-semibold py-3 hover:bg-[var(--ds-accent-purple)]/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending instructions...' : 'Send Reset Instructions'}
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-[var(--ds-text-muted)]">
            We&apos;ll send you an email with a link to reset your password
          </p>
        </div>
      </form>
    </div>
  );
} 