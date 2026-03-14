'use client';

import { motion } from 'framer-motion';
import { FaLinkedinIn, FaGithub, FaTwitter } from 'react-icons/fa';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter';
  url: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  gradient: string;
  initials: string;
  socials: SocialLink[];
}

const teamMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Bora Aydeger',
    role: 'Kurucu & CEO',
    bio: 'DevSpark Yazilim\'in kurucusu ve vizyoneri. 10 yillik yazilim sektoru deneyimiyle dijital donusum projelerine liderlik ediyor. Istanbul Teknik Universitesi Bilgisayar Muhendisligi mezunu olup, startup ekosisteminde aktif rol aliyor. Musteri odakli yaklasimi ve stratejik dusunce yapisiyla sirketin buyume yolculugunu sekillendiriyor.',
    gradient: 'from-accent-orange via-accent-purple to-accent-blue',
    initials: 'BA',
    socials: [
      { platform: 'linkedin', url: '#' },
      { platform: 'github', url: '#' },
      { platform: 'twitter', url: '#' },
    ],
  },
  {
    id: 'member-2',
    name: 'Huseyin Kaplan',
    role: 'CTO',
    bio: 'Teknoloji mimarisinden sorumlu bas muhendis. Full-stack gelistirme, bulut altyapisi ve sistem tasarimi konularinda derin uzmanligi bulunuyor. Daha once buyuk olcekli fintech projelerinde gorev yapti. Ekibin teknik gelisimini yonlendiriyor ve yeni teknolojilerin projelere entegrasyonunu sagliyor.',
    gradient: 'from-accent-blue via-accent-purple to-accent-orange',
    initials: 'HK',
    socials: [
      { platform: 'linkedin', url: '#' },
      { platform: 'github', url: '#' },
      { platform: 'twitter', url: '#' },
    ],
  },
  {
    id: 'member-3',
    name: 'Metin Bektemur',
    role: 'Proje Yoneticisi',
    bio: 'Agile ve Scrum metodolojilerinde sertifikali proje yoneticisi. Musteri iletisimi, zaman planlama ve kaynak yonetimi konularinda uzman. Buyuk olcekli projelerin zamaninda ve butce dahilinde teslim edilmesini sagliyor. Ekip motivasyonu ve verimli calisma ortami olusturma konusunda tutkulu.',
    gradient: 'from-accent-purple via-accent-orange to-accent-blue',
    initials: 'MB',
    socials: [
      { platform: 'linkedin', url: '#' },
      { platform: 'github', url: '#' },
      { platform: 'twitter', url: '#' },
    ],
  },
  {
    id: 'member-4',
    name: 'Ayse Korkmaz',
    role: 'UI/UX Tasarimci',
    bio: 'Kullanici deneyimi tasarimi ve arayuz gelistirme konusunda 7 yillik deneyime sahip. Figma, Adobe Creative Suite ve modern tasarim araclarinda uzman. Kullanici arastirmasi, prototipleme ve tasarim sistemi olusturma konularinda genis bilgi birikimine sahip. Her projede estetik ve islevseligi bir araya getiriyor.',
    gradient: 'from-accent-orange via-accent-blue to-accent-purple',
    initials: 'AK',
    socials: [
      { platform: 'linkedin', url: '#' },
      { platform: 'twitter', url: '#' },
    ],
  },
  {
    id: 'member-5',
    name: 'Emre Sahin',
    role: 'Full-Stack Gelistirici',
    bio: 'React, Next.js, Node.js ve TypeScript konularinda uzman full-stack gelistirici. Performans optimizasyonu, temiz kod yazimi ve test odakli gelistirme pratiklerini benimsemis. Acik kaynak projelere aktif katkilar sagliyor. E-ticaret ve SaaS platformlarinda genis deneyime sahip.',
    gradient: 'from-accent-blue via-accent-orange to-accent-purple',
    initials: 'ES',
    socials: [
      { platform: 'linkedin', url: '#' },
      { platform: 'github', url: '#' },
    ],
  },
  {
    id: 'member-6',
    name: 'Deniz Aksoy',
    role: 'DevOps Muhendisi',
    bio: 'CI/CD pipeline\'lari, bulut altyapisi ve konteyner orkestrasyonu konularinda uzman. AWS, Docker ve Kubernetes sertifikalarina sahip. Otomasyon ve altyapi guvenligi konularinda genis deneyim. Sistemlerin yuksek erisilebilirlik ve olceklenebilirlik ile calismasini sagliyor.',
    gradient: 'from-accent-purple via-accent-blue to-accent-orange',
    initials: 'DA',
    socials: [
      { platform: 'linkedin', url: '#' },
      { platform: 'github', url: '#' },
      { platform: 'twitter', url: '#' },
    ],
  },
];

const socialIcons: Record<string, React.ReactNode> = {
  linkedin: <FaLinkedinIn className="h-4 w-4" />,
  github: <FaGithub className="h-4 w-4" />,
  twitter: <FaTwitter className="h-4 w-4" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function TeamGrid() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
    >
      {teamMembers.map((member) => (
        <motion.article
          key={member.id}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]"
        >
          {/* Avatar Placeholder — Larger for full page */}
          <div className="relative mx-auto mb-6 h-28 w-28 sm:h-32 sm:w-32">
            {/* Gradient Circle */}
            <div
              className={cn(
                'absolute inset-0 rounded-full bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100',
                member.gradient
              )}
            />
            {/* Initials */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full">
              <span className="font-display text-2xl font-bold text-white sm:text-3xl">
                {member.initials}
              </span>
            </div>

            {/* Hover Overlay with Social Icons */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-bg-dark/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
              {member.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} ${social.platform}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-text-main transition-all duration-200 hover:bg-accent-orange hover:text-white"
                >
                  {socialIcons[social.platform]}
                </a>
              ))}
            </div>
          </div>

          {/* Member Info */}
          <div className="text-center">
            <h3 className="mb-1 font-display text-xl font-semibold text-text-main">
              {member.name}
            </h3>
            <p className="mb-4 text-sm font-medium text-accent-orange">
              {member.role}
            </p>
            <p className="text-sm leading-relaxed text-text-muted">
              {member.bio}
            </p>
          </div>

          {/* Social Links — Below bio for mobile accessibility */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {member.socials.map((social) => (
              <a
                key={`${social.platform}-bottom`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} ${social.platform}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-muted transition-all duration-200 hover:border-accent-orange/30 hover:bg-accent-orange/10 hover:text-accent-orange"
              >
                {socialIcons[social.platform]}
              </a>
            ))}
          </div>

          {/* Bottom accent line */}
          <div
            className={cn(
              'absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full',
              member.gradient
            )}
          />
        </motion.article>
      ))}
    </motion.div>
  );
}
