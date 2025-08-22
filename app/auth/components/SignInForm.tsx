'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000); 
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
      <form onSubmit={handleSignIn} className="space-y-6">
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
            placeholder="Enter your password"
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--ds-radius-md)] bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] font-semibold py-3 hover:bg-[var(--ds-accent-purple)]/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
} 