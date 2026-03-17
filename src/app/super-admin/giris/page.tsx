'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
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
  'focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/50',
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

export default function SuperAdminGirisPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { data: authData, error } = await supabase.auth.signInWithPassword({
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

      // Verify user has super_admin role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'super_admin') {
        await supabase.auth.signOut();
        toast.error('Erisim engellendi.', {
          description: 'Bu panele erisim yetkiniz bulunmamaktadir.',
        });
        return;
      }

      toast.success('Giris basarili!', {
        description: 'Admin paneline yonlendiriliyorsunuz...',
      });
      router.push('/super-admin/dashboard');
    } catch (err) {
      toast.error('Baglanti hatasi.', {
        description: err instanceof Error ? err.message : 'Sunucuya ulasilamadi. Lutfen tekrar deneyiniz.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark px-4 py-12">
      {/* Gradient Background - Blue theme */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-blue/10 blur-[120px]" />
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text-main">
              Super Admin Paneli
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Platform yonetim paneline giris yapin
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
                  placeholder="admin@platform.com"
                  autoComplete="email"
                  {...register('email')}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'relative flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold',
                  'bg-accent-blue text-white',
                  'transition-all duration-300',
                  'hover:shadow-glow-blue',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
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

          {/* Security Notice */}
          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-lg border border-accent-blue/20 bg-accent-blue/5 p-3"
          >
            <p className="text-center text-xs text-text-muted">
              <Shield className="mr-1 inline-block h-3.5 w-3.5 text-accent-blue" />
              Bu panel sadece yetkili yoneticiler icindir.
              Tum giris denemeleri kayit altina alinmaktadir.
            </p>
          </motion.div>
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
