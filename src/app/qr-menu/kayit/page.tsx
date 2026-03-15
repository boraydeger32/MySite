'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  QrCode,
  User,
  Phone,
  Store,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const registerSchema = z
  .object({
    restaurantName: z
      .string()
      .min(1, 'Restoran adi zorunludur.')
      .min(2, 'Restoran adi en az 2 karakter olmalidir.'),
    fullName: z
      .string()
      .min(1, 'Ad soyad zorunludur.')
      .min(2, 'Ad soyad en az 2 karakter olmalidir.'),
    email: z
      .string()
      .min(1, 'E-posta adresi gereklidir.')
      .email('Gecerli bir e-posta adresi giriniz.'),
    phone: z
      .string()
      .optional(),
    password: z
      .string()
      .min(1, 'Sifre gereklidir.')
      .min(6, 'Sifre en az 6 karakter olmalidir.'),
    passwordConfirm: z
      .string()
      .min(1, 'Sifre tekrari gereklidir.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Sifreler eslesmiyor.',
    path: ['passwordConfirm'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

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
      staggerChildren: 0.08,
      delayChildren: 0.15,
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

export default function QRMenuKayitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      restaurantName: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone || '',
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error('Bu e-posta adresi zaten kayitli.', {
            description: 'Lutfen giris yapin veya baska bir e-posta deneyin.',
          });
        } else {
          toast.error('Kayit basarisiz.', {
            description: signUpError.message,
          });
        }
        return;
      }

      const userId = authData.user?.id;

      if (userId) {
        // 2. Create restaurant record
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            name: data.restaurantName,
            owner_id: userId,
            slug: data.restaurantName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim(),
          })
          .select()
          .single();

        if (restaurantError) {
          toast.error('Restoran olusturulamadi.', {
            description: 'Lutfen daha sonra tekrar deneyiniz.',
          });
          return;
        }

        // 3. Create user_profile record
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone || null,
            restaurant_id: restaurant.id,
            role: 'owner',
          });

        if (profileError) {
          toast.error('Profil olusturulamadi.', {
            description: 'Lutfen daha sonra tekrar deneyiniz.',
          });
          return;
        }
      }

      toast.success('Kayit basarili!', {
        description: 'E-posta adresinizi dogrulayin ve giris yapin.',
      });
      router.push('/qr-menu/giris');
    } catch {
      toast.error('Baglanti hatasi.', {
        description: 'Sunucuya ulasilamadi. Lutfen tekrar deneyiniz.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark px-4 py-12">
      {/* Gradient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-orange/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/5 blur-[100px]" />
      </div>

      {/* Registration Card */}
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
              QR Menu Kayit
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Restoraniniz icin ucretsiz hesap olusturun
            </p>
          </motion.div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Restoran Adi */}
            <motion.div variants={itemVariants}>
              <label htmlFor="restaurantName" className="mb-1.5 block text-sm font-medium text-text-main">
                Restoran Adi <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="restaurantName"
                  type="text"
                  placeholder="Restoran adiniz"
                  autoComplete="organization"
                  {...register('restaurantName')}
                  disabled={isSubmitting}
                  className={cn(
                    inputClasses,
                    errors.restaurantName ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  )}
                  aria-invalid={!!errors.restaurantName}
                />
              </div>
              {errors.restaurantName && (
                <p className="mt-1.5 text-xs text-red-400" role="alert">
                  {errors.restaurantName.message}
                </p>
              )}
            </motion.div>

            {/* Ad Soyad */}
            <motion.div variants={itemVariants}>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text-main">
                Ad Soyad <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Adiniz ve soyadiniz"
                  autoComplete="name"
                  {...register('fullName')}
                  disabled={isSubmitting}
                  className={cn(
                    inputClasses,
                    errors.fullName ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  )}
                  aria-invalid={!!errors.fullName}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-400" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-main">
                E-posta <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
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

            {/* Telefon */}
            <motion.div variants={itemVariants}>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text-main">
                Telefon <span className="text-text-muted text-xs">(Opsiyonel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+90 (5XX) XXX XX XX"
                  autoComplete="tel"
                  {...register('phone')}
                  disabled={isSubmitting}
                  className={cn(
                    inputClasses,
                    errors.phone ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  )}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-400" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </motion.div>

            {/* Sifre */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-main">
                Sifre <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 6 karakter"
                  autoComplete="new-password"
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

            {/* Sifre Tekrar */}
            <motion.div variants={itemVariants}>
              <label htmlFor="passwordConfirm" className="mb-1.5 block text-sm font-medium text-text-main">
                Sifre Tekrar <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Sifrenizi tekrar giriniz"
                  autoComplete="new-password"
                  {...register('passwordConfirm')}
                  disabled={isSubmitting}
                  className={cn(
                    inputClasses,
                    'pr-11',
                    errors.passwordConfirm ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  )}
                  aria-invalid={!!errors.passwordConfirm}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-main"
                  aria-label={showPasswordConfirm ? 'Sifreyi gizle' : 'Sifreyi goster'}
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1.5 text-xs text-red-400" role="alert">
                  {errors.passwordConfirm.message}
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
                  'bg-accent-orange text-white',
                  'transition-all duration-300',
                  'hover:shadow-glow-orange',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kayit yapiliyor...
                  </>
                ) : (
                  <>
                    Kayit Ol
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-text-muted">
            Zaten hesabiniz var mi?{' '}
            <Link
              href="/qr-menu/giris"
              className="font-medium text-accent-orange transition-colors hover:text-accent-orange/80"
            >
              Giris Yapin
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
