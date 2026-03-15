'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, QrCode } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir.')
    .email('Gecerli bir e-posta adresi giriniz.'),
  password: z
    .string()
    .min(1, 'Sifre gereklidir.')
    .min(6, 'Sifre en az 6 karakter olmalidir.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const inputClasses = cn(
  'w-full rounded-lg border bg-white/5 pl-11 pr-4 py-3 text-sm text-text-main placeholder-text-muted backdrop-blur-sm',
  'transition-all duration-300',
  'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function QRMenuGirisPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error('Giris basarisiz.', {
          description: error.message === 'Invalid login credentials'
            ? 'E-posta veya sifre hatali.'
            : error.message,
        });
        return;
      }

      toast.success('Giris basarili!', {
        description: 'Dashboard\'a yonlendiriliyorsunuz...',
      });
      router.push('/qr-menu/dashboard');
    } catch {
      toast.error('Baglanti hatasi.', {
        description: 'Sunucuya ulasilamadi. Lutfen tekrar deneyiniz.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/MySite/auth/callback`,
        },
      });

      if (error) {
        toast.error('Google ile giris basarisiz.', {
          description: error.message,
        });
        setIsGoogleLoading(false);
      }
    } catch {
      toast.error('Baglanti hatasi.', {
        description: 'Google ile giris yapilamadi. Lutfen tekrar deneyiniz.',
      });
      setIsGoogleLoading(false);
    }
  };

  const isLoading = isSubmitting || isGoogleLoading;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark px-4 py-12">
      {/* Gradient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-orange/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/5 blur-[100px]" />
      </div>

      {/* Login Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-glass backdrop-blur-xl sm:p-10">
          {/* Logo & Title */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-orange to-accent-purple">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text-main">
              QR Menu Paneli
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Restoran yonetim panelinize giris yapin
            </p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-main">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  {...register('email')}
                  disabled={isLoading}
                  className={cn(
                    inputClasses,
                    errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  )}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-main">
                Sifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 6 karakter"
                  autoComplete="current-password"
                  {...register('password')}
                  disabled={isLoading}
                  className={cn(
                    inputClasses,
                    'pr-11',
                    errors.password ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  )}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-main"
                  aria-label={showPassword ? 'Sifreyi gizle' : 'Sifreyi goster'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Sifremi Unuttum Link */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <Link
                href="/qr-menu/sifremi-unuttum"
                className="text-sm text-accent-orange transition-colors hover:text-accent-orange/80"
              >
                Sifremi Unuttum
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'relative flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold',
                  'bg-accent-orange text-white',
                  'transition-all duration-300',
                  'hover:shadow-glow-orange',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                whileHover={!isLoading ? { scale: 1.02 } : undefined}
                whileTap={!isLoading ? { scale: 0.98 } : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Giris yapiliyor...
                  </>
                ) : (
                  <>
                    Giris Yap
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-text-muted">veya</span>
            <div className="h-px flex-1 bg-white/10" />
          </motion.div>

          {/* Google OAuth Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={cn(
                'flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium',
                'bg-white/5 text-text-main backdrop-blur-sm',
                'transition-all duration-300',
                'hover:border-white/20 hover:bg-white/10',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              whileHover={!isLoading ? { scale: 1.02 } : undefined}
              whileTap={!isLoading ? { scale: 0.98 } : undefined}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Google ile Giris Yap
            </motion.button>
          </motion.div>

          {/* Register Link */}
          <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-text-muted">
            Hesabiniz yok mu?{' '}
            <Link
              href="/qr-menu/kayit"
              className="font-medium text-accent-orange transition-colors hover:text-accent-orange/80"
            >
              Ucretsiz Kayit Olun
            </Link>
          </motion.p>
        </div>

        {/* Back to Home */}
        <motion.div variants={itemVariants} className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-text-muted transition-colors hover:text-text-main"
          >
            ← Ana Sayfaya Don
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
