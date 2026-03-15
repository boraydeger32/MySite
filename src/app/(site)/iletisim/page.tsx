import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Phone, Mail, MapPin, Clock, ArrowRight, Zap } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '@/components/ui/ScrollReveal';
import GlowButton from '@/components/ui/GlowButton';
import ContactForm from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Iletisim',
  description:
    'DevSpark Yazilim ile iletisime gecin. Projeleriniz icin ucretsiz danismanlik alin. Telefon, e-posta veya iletisim formu ile bize ulasin.',
  openGraph: {
    title: 'Iletisim | DevSpark Yazilim',
    description:
      'Projeleriniz hakkinda konusmak icin bize ulasin. Ucretsiz danismanlik ve teklif icin iletisim formunu doldurun.',
    url: 'https://devspark.com.tr/iletisim',
  },
};

interface ContactInfoItem {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  href?: string;
  gradient: string;
}

const contactInfo: ContactInfoItem[] = [
  {
    icon: Phone,
    title: 'Telefon',
    value: '+90 (212) 000 00 00',
    description: 'Pazartesi - Cuma, 09:00 - 18:00',
    href: 'tel:+902120000000',
    gradient: 'from-accent-orange to-accent-purple',
  },
  {
    icon: Mail,
    title: 'E-posta',
    value: 'info@devspark.com.tr',
    description: '24 saat icinde donüs yapiyoruz',
    href: 'mailto:info@devspark.com.tr',
    gradient: 'from-accent-blue to-accent-purple',
  },
  {
    icon: MapPin,
    title: 'Adres',
    value: 'Maslak Mah. Buyukdere Cad.',
    description: 'No:123 Sariyer/Istanbul',
    href: 'https://maps.google.com/?q=Maslak+Istanbul',
    gradient: 'from-accent-purple to-accent-orange',
  },
  {
    icon: Clock,
    title: 'Calisma Saatleri',
    value: 'Pazartesi - Cuma',
    description: '09:00 - 18:00',
    gradient: 'from-accent-orange to-accent-blue',
  },
];

export default function IletisimPage() {
  return (
    <div className="bg-bg-dark">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pb-28">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 via-bg-dark to-accent-purple/10" />
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-orange/8 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-purple/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {/* Badge */}
              <span className="mb-6 inline-block rounded-full border border-accent-orange/30 bg-accent-orange/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-orange">
                Iletisim
              </span>

              {/* Title */}
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight text-text-main sm:text-5xl lg:text-6xl">
                Bizimle{' '}
                <span className="bg-gradient-to-r from-accent-orange via-accent-purple to-accent-blue bg-clip-text text-transparent">
                  Iletisime
                </span>{' '}
                Gecin
              </h1>

              {/* Subtitle */}
              <p className="mb-8 text-lg leading-relaxed text-text-muted sm:text-xl">
                Projeniz hakkinda konusmak, fiyat teklifi almak veya sadece merhaba demek icin
                bize ulasin. Size en kisa surede donüs yapacagiz.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content: Form + Info */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-blue/3 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Contact Form */}
            <ScrollReveal direction="left">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
                <h2 className="mb-2 font-display text-2xl font-bold text-text-main sm:text-3xl">
                  Bize Yazin
                </h2>
                <p className="mb-8 text-base text-text-muted">
                  Formu doldurarak bize mesaj gonderebilirsiniz. Tum alanlari eksiksiz doldurmaniz
                  iletisim surecini hizlandiracaktir.
                </p>
                <ContactForm />
              </div>
            </ScrollReveal>

            {/* Right Column - Info Cards + Map */}
            <div className="space-y-8">
              {/* Info Cards */}
              <ScrollReveal stagger={0.1} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {contactInfo.map((info) => (
                  <ScrollRevealItem key={info.title}>
                    <div className="group relative h-full rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]">
                      {/* Gradient accent top bar */}
                      <div
                        className={`absolute left-0 top-0 h-1 w-full rounded-t-xl bg-gradient-to-r ${info.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                      />

                      {/* Icon */}
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-orange/20 to-accent-purple/20">
                        <info.icon className="h-5 w-5 text-accent-orange" />
                      </div>

                      {/* Content */}
                      <h3 className="mb-1 font-display text-sm font-semibold uppercase tracking-wide text-text-muted">
                        {info.title}
                      </h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-base font-medium text-text-main transition-colors hover:text-accent-orange"
                          target={info.href.startsWith('http') ? '_blank' : undefined}
                          rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-base font-medium text-text-main">{info.value}</p>
                      )}
                      <p className="mt-0.5 text-sm text-text-muted">{info.description}</p>
                    </div>
                  </ScrollRevealItem>
                ))}
              </ScrollReveal>

              {/* Google Maps */}
              <ScrollReveal delay={0.3}>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.5349614685583!2d29.01723!3d41.10891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab5e3a5555555%3A0x5555555555555555!2sMaslak%2C%20B%C3%BCy%C3%BCkdere%20Cd.%2C%2034398%20Sar%C4%B1yer%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="DevSpark Yazilim Ofis Konumu - Maslak, Istanbul"
                    className="w-full"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-accent-orange/5 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="mb-6 font-display text-3xl font-bold text-text-main sm:text-4xl lg:text-5xl">
              Projenizi{' '}
              <span className="bg-gradient-to-r from-accent-orange to-accent-purple bg-clip-text text-transparent">
                Hayata Gecirelim
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Dijital donüsüm yolculugunuzda size rehberlik etmek icin haziriz.
              Hizmetlerimizi inceleyin veya hemen bir teklif alin.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <GlowButton href="/hizmetler" variant="solid" size="lg">
                <Zap className="h-5 w-5" />
                Hizmetlerimiz
              </GlowButton>
              <GlowButton href="/referanslar" variant="glass" size="lg">
                <ArrowRight className="h-5 w-5" />
                Referanslarimiz
              </GlowButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
