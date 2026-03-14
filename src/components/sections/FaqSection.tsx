'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'DevSpark Yazilim hangi hizmetleri sunuyor?',
    answer:
      'DevSpark Yazilim olarak QR Menu Sistemleri, Kurumsal Web Siteleri, E-Ticaret Cozumleri ve Ozel Yazilim Gelistirme hizmetleri sunuyoruz. Her projede isletmenizin benzersiz ihtiyaclarina yonelik ozellestirilmis cozumler uretiyoruz.',
  },
  {
    id: 'faq-2',
    question: 'Bir web sitesi projesi ne kadar surede tamamlanir?',
    answer:
      'Proje sureleri kapsamina gore degisiklik gosterir. Basit bir kurumsal web sitesi 2-4 hafta, e-ticaret platformu 4-8 hafta, ozel yazilim projeleri ise 8-16 hafta arasinda tamamlanmaktadir. Proje baslangicinda detayli bir zaman cizelgesi paylasiyoruz.',
  },
  {
    id: 'faq-3',
    question: 'QR Menu sistemi nasil calisir?',
    answer:
      'QR Menu sistemimiz ile restoraniniza ozel dijital menu olusturuyoruz. Musterileriniz masadaki QR kodu telefonlariyla okutarak menuye aninda ulasir. Fiyat ve urun guncellemelerini yonetim panelinden saniyeler icinde yapabilirsiniz. Coklu dil destegi ve gorsel zenginlestirme ozellikleri de mevcuttur.',
  },
  {
    id: 'faq-4',
    question: 'Proje sonrasi teknik destek sagliyor musunuz?',
    answer:
      'Evet, tum projelerimizde teslim sonrasi ucretsiz teknik destek suresi sunuyoruz. Baslangic paketinde 1 ay, Profesyonel pakette 3 ay ve Kurumsal pakette 12 aya kadar oncelikli destek hizmeti veriyoruz. Destek sureniz dolduktan sonra da uygun fiyatli bakim paketlerimizle yaninizdayiz.',
  },
  {
    id: 'faq-5',
    question: 'Web sitesi fiyatlari neye gore belirleniyor?',
    answer:
      'Fiyatlandirmamiz projenin kapsamina, sayfa sayisina, ozel tasarim gereksinimlerine, entegrasyon ihtiyaclarina ve ek ozelliklere gore sekillenir. Her proje icin ucretsiz kesfif gorusmesi yaparak ihtiyaciniza en uygun teklifi hazirliyoruz. Fiyatlandirma sayfamizdaki paketlerimizi inceleyebilirsiniz.',
  },
  {
    id: 'faq-6',
    question: 'SEO (Arama Motoru Optimizasyonu) hizmeti veriyor musunuz?',
    answer:
      'Tum web sitesi projelerimiz temel SEO optimizasyonu ile teslim edilir. Bu, sayfa hizi optimizasyonu, meta etiketleri, responsive tasarim, yapısal veri (Schema markup) ve teknik SEO ayarlarini kapsar. Ileri seviye SEO ve icerik stratejisi icin ayrica danismanlik hizmeti sunuyoruz.',
  },
  {
    id: 'faq-7',
    question: 'E-ticaret sitemde hangi odeme yontemlerini kullanabilirim?',
    answer:
      'E-ticaret cozumlerimiz Turkiye\'nin onde gelen odeme altyapilariyla (iyzico, PayTR, Stripe) entegre calisir. Kredi karti, banka karti, havale/EFT ve kapida odeme seceneklerini destekliyoruz. Taksit secenekleri ve 3D Secure guvenlik altyapisi da standart olarak dahildir.',
  },
  {
    id: 'faq-8',
    question: 'Mevcut web sitemi yenileyebilir misiniz?',
    answer:
      'Evet, mevcut web sitenizi modern teknolojilerle yeniden tasarlayabilir ve gelistirebiliriz. Mevcut iceriginizi koruyarak, daha hizli, mobil uyumlu ve kullanici dostu bir siteye donusturuyoruz. Ayrica SEO puaninizi koruyacak sekilde yonlendirme ve goc planlamasi yapiyoruz.',
  },
  {
    id: 'faq-9',
    question: 'Hosting ve domain hizmeti sunuyor musunuz?',
    answer:
      'Web sitesi projelerinde hosting ve domain yonetimi konusunda rehberlik sagliyoruz. Projenizin ihtiyaclarina uygun hosting cozumu oneriyoruz. Tercih ettiginiz saglayici uzerinde kurulum ve yapilandirma islemlerini sizin adiniza gerceklestiriyoruz. Vercel, AWS ve Turkiye merkezli hosting secenekleriyle calisiyoruz.',
  },
  {
    id: 'faq-10',
    question: 'Projeye nasil basliyoruz?',
    answer:
      'Surec, ucretsiz bir kesfif gorusmesiyle baslar. Ihtiyaclarinizi anladiktan sonra size ozel bir teklif hazirliyoruz. Teklifin onaylanmasinin ardindan tasarim asamasina gecilir. Tasarim onayindan sonra gelistirme surecine baslanir ve duzenli olarak ilerleme raporlari paylasiyoruz. Son asama test ve teslimdir.',
  },
];

function AccordionContent({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-hidden"
        >
          <div className="pb-5 pt-2 text-sm leading-relaxed text-text-muted sm:text-base">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<string>('');

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-accent-purple/3 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-blue/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="SSS"
          title="Sikca Sorulan Sorular"
          subtitle="Merak ettiginiz sorularin yanitlarini buradan bulabilirsiniz. Daha fazla bilgi icin bizimle iletisime gecmekten cekinmeyin."
          gradientTitle
          parallax
          align="center"
        />

        {/* FAQ Accordion */}
        <Accordion.Root
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
        >
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {faqItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Accordion.Item
                  value={item.id}
                  className={cn(
                    'rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300',
                    openItem === item.id &&
                      'border-accent-orange/30 bg-white/[0.07] shadow-[0_0_20px_rgba(255,107,43,0.08)]'
                  )}
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5">
                      <span className="font-display text-sm font-semibold text-text-main transition-colors duration-300 group-hover:text-accent-orange sm:text-base">
                        {item.question}
                      </span>
                      <motion.div
                        animate={{
                          rotate: openItem === item.id ? 180 : 0,
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-text-muted transition-colors duration-300 group-hover:text-accent-orange" />
                      </motion.div>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <div className="px-5 sm:px-6">
                    <AccordionContent isOpen={openItem === item.id}>
                      {item.answer}
                    </AccordionContent>
                  </div>
                </Accordion.Item>
              </motion.div>
            ))}
          </motion.div>
        </Accordion.Root>
      </div>
    </section>
  );
}
