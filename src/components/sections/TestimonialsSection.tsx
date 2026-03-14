'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Ahmet Yilmaz',
    title: 'Genel Mudur',
    company: 'Lezzet Duragi Restaurant',
    quote:
      'DevSpark ekibi ile calistigimiz QR Menu projesi, restoranlarimizin dijital donusumunde buyuk bir adim oldu. Musterilerimiz artik menulere telefonlarindan kolayca erisebiliyor.',
    rating: 5,
  },
  {
    id: 'testimonial-2',
    name: 'Elif Demir',
    title: 'Pazarlama Direktoru',
    company: 'TechCorp Turkiye',
    quote:
      'Kurumsal web sitemiz sayesinde marka imajimiz tamamen yenilendi. Profesyonel tasarim ve hizli yukleme sureleri ile musterilerimizden cok olumlu geri donus aliyoruz.',
    rating: 5,
  },
  {
    id: 'testimonial-3',
    name: 'Mehmet Kaya',
    title: 'E-Ticaret Muduru',
    company: 'ModaShop Online',
    quote:
      'E-ticaret platformumuzun gelistirilmesi surecinde DevSpark\'in uzmanligi ve destegi muhtesemdi. Satislarimiz ilk ayda %40 artti.',
    rating: 5,
  },
  {
    id: 'testimonial-4',
    name: 'Zeynep Ozturk',
    title: 'Isletme Sahibi',
    company: 'Gunes Otelcilik',
    quote:
      'Otel yonetim sistemimiz DevSpark tarafindan sifirdan gelistirildi. Rezervasyon ve musteri takibi artik cok daha kolay. Kesinlikle tavsiye ediyorum.',
    rating: 5,
  },
  {
    id: 'testimonial-5',
    name: 'Can Arslan',
    title: 'Kurucu',
    company: 'BioFarm Organik',
    quote:
      'Organik urunlerimizi online satisa sunarken DevSpark\'in e-ticaret cozumu bizim icin mukemmel oldu. Kullanici dostu arayuz ve guvenli odeme sistemi ile musterilerimiz memnun.',
    rating: 5,
  },
  {
    id: 'testimonial-6',
    name: 'Selin Celik',
    title: 'IT Direktoru',
    company: 'SteelBuild Insaat',
    quote:
      'Kurumsal web sitemiz tam olarak istedigimiz gibi tasarlandi. DevSpark ekibinin iletisimi ve proje yonetimi son derece profesyoneldi. Zamanlama ve kalite beklentilerimizi asti.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-accent-purple/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-accent-orange/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Referanslar"
          title="Musteri Gorusleri"
          subtitle="Musterilerimizin deneyimlerini ve geri bildirimlerini dinleyin. Basarilarimizin en buyuk kaniti, mutlu musterilerimizdir."
          gradientTitle
          parallax
          align="center"
        />

        {/* Embla Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-[0_0_100%] min-w-0 px-3 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group relative mx-auto h-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)] sm:p-8"
                >
                  {/* Decorative large quote mark */}
                  <div className="pointer-events-none absolute -top-2 right-4 sm:right-6">
                    <Quote className="h-16 w-16 rotate-180 text-accent-orange/10 sm:h-20 sm:w-20" />
                  </div>

                  {/* Star Rating */}
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-accent-orange text-accent-orange"
                      />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <blockquote className="relative mb-6 text-sm leading-relaxed text-text-muted sm:text-base">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Customer Info */}
                  <div className="mt-auto flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-orange/40 via-accent-purple/30 to-accent-blue/20 sm:h-12 sm:w-12">
                      <span className="text-sm font-semibold text-text-main sm:text-base">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main sm:text-base">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-text-muted sm:text-sm">
                        {testimonial.title}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="mt-8 flex items-center justify-center gap-2 sm:mt-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              aria-label={`Yorum ${index + 1} e git`}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                selectedIndex === index
                  ? 'w-8 bg-accent-orange shadow-glow-sm'
                  : 'w-2.5 bg-white/20 hover:bg-white/40'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
