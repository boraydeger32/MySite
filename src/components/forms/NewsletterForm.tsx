'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir.')
    .email('Gecerli bir e-posta adresi giriniz.'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Basariyla abone oldunuz!', {
          description: 'En guncel iceriklerimiz e-posta adresinize gonderilecek.',
        });
        reset();
      } else {
        toast.error('Bir hata olustu.', {
          description: result.message || 'Lutfen tekrar deneyiniz.',
        });
      }
    } catch {
      toast.error('Baglanti hatasi.', {
        description: 'Sunucuya ulasilamadi. Lutfen tekrar deneyiniz.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <input
            type="email"
            placeholder="E-posta adresiniz"
            {...register('email')}
            disabled={isSubmitting}
            className={cn(
              'w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-text-main placeholder-text-muted backdrop-blur-sm',
              'transition-all duration-300',
              'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.email
                ? 'border-red-500/50'
                : 'border-white/10 hover:border-white/20'
            )}
            aria-label="E-posta adresi"
            aria-invalid={!!errors.email}
          />
        </div>
        <GlowButton
          type="submit"
          variant="solid"
          size="sm"
          disabled={isSubmitting}
          aria-label="Bulten aboneligi"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Abone Ol</span>
        </GlowButton>
      </div>
      {errors.email && (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
