'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Send, ChevronDown, Check } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(1, 'Ad Soyad zorunludur.'),
  email: z.string().min(1, 'E-posta adresi gereklidir.').email('Gecerli bir e-posta adresi giriniz.'),
  phone: z.string().optional(),
  service: z.string().min(1, 'Lütfen bir hizmet seciniz.'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalidir.'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const services = [
  { value: 'qr-menu', label: 'QR Menu Sistemi' },
  { value: 'kurumsal-web', label: 'Kurumsal Web Sitesi' },
  { value: 'e-ticaret', label: 'E-Ticaret Cozumleri' },
  { value: 'yazilim', label: 'Ozel Yazilim Gelistirme' },
  { value: 'diger', label: 'Diger' },
];

const inputClasses = cn(
  'w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-text-main placeholder-text-muted backdrop-blur-sm',
  'transition-all duration-300',
  'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Mesajiniz basariyla gonderildi!', {
          description: 'En kisa surede sizinle iletisime gececegiz.',
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Ad Soyad */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-main">
          Ad Soyad <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="Adiniz ve soyadiniz"
          {...register('name')}
          disabled={isSubmitting}
          className={cn(
            inputClasses,
            errors.name ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
          )}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-main">
          E-posta <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="ornek@email.com"
          {...register('email')}
          disabled={isSubmitting}
          className={cn(
            inputClasses,
            errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
          )}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Telefon */}
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text-main">
          Telefon <span className="text-text-muted text-xs">(Opsiyonel)</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="+90 (5XX) XXX XX XX"
          {...register('phone')}
          disabled={isSubmitting}
          className={cn(
            inputClasses,
            errors.phone ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
          )}
        />
        {errors.phone && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Hizmet Sec - Radix Select with Controller */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-main">
          Hizmet Seciniz <span className="text-red-400">*</span>
        </label>
        <Controller
          name="service"
          control={control}
          render={({ field }) => (
            <Select.Root
              value={field.value}
              onValueChange={field.onChange}
              disabled={isSubmitting}
            >
              <Select.Trigger
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border bg-white/5 px-4 py-3 text-sm backdrop-blur-sm',
                  'transition-all duration-300',
                  'focus:border-accent-orange focus:outline-none focus:ring-1 focus:ring-accent-orange/50',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'data-[placeholder]:text-text-muted',
                  errors.service ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                )}
                aria-label="Hizmet seciniz"
              >
                <Select.Value placeholder="Bir hizmet seciniz" />
                <Select.Icon>
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content
                  className="z-50 overflow-hidden rounded-lg border border-white/10 bg-bg-mid shadow-xl backdrop-blur-xl"
                  position="popper"
                  sideOffset={4}
                >
                  <Select.Viewport className="p-1">
                    {services.map((service) => (
                      <Select.Item
                        key={service.value}
                        value={service.value}
                        className={cn(
                          'relative flex cursor-pointer select-none items-center rounded-md px-8 py-2.5 text-sm text-text-main outline-none',
                          'transition-colors duration-150',
                          'data-[highlighted]:bg-accent-orange/10 data-[highlighted]:text-accent-orange',
                          'focus:bg-accent-orange/10 focus:text-accent-orange'
                        )}
                      >
                        <Select.ItemIndicator className="absolute left-2 flex items-center">
                          <Check className="h-4 w-4 text-accent-orange" />
                        </Select.ItemIndicator>
                        <Select.ItemText>{service.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
        {errors.service && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {errors.service.message}
          </p>
        )}
      </div>

      {/* Mesaj */}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text-main">
          Mesajiniz <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Projeniz hakkinda bize bilgi verin..."
          {...register('message')}
          disabled={isSubmitting}
          className={cn(
            inputClasses,
            'resize-none',
            errors.message ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
          )}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-400" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <GlowButton
        type="submit"
        variant="solid"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
        aria-label="Mesaj gonder"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Gonderiliyor...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Mesaj Gonder
          </>
        )}
      </GlowButton>
    </form>
  );
}
