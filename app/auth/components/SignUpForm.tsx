'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email for the confirmation link');
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
      <form onSubmit={handleSignUp} className="space-y-6">
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
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-[var(--ds-text-primary)]">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[var(--ds-radius-md)] border-[var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[var(--ds-text-primary)] placeholder:text-[var(--ds-text-muted)] focus:border-[var(--ds-accent-purple)]"
            placeholder="Create a password (min. 6 characters)"
            required
            minLength={6}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--ds-text-primary)]">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-[var(--ds-radius-md)] border-[var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[var(--ds-text-primary)] placeholder:text-[var(--ds-text-muted)] focus:border-[var(--ds-accent-purple)]"
            placeholder="Confirm your password"
            required
            minLength={6}
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--ds-radius-md)] bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] font-semibold py-3 hover:bg-[var(--ds-accent-purple)]/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-[var(--ds-text-muted)]">
            By signing up, you agree to our{" "}
            <Link href="#terms" className="font-medium text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#privacy-policy" className="font-medium text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
} 