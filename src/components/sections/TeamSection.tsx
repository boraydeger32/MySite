'use client';

import { motion } from 'framer-motion';
import { FaLinkedinIn, FaGithub, FaTwitter } from 'react-icons/fa';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter';
  url: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  gradient: string;
  initials: string;
  socials: SocialLink[];
}

const teamMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Bora Aydeger',
    role: 'Kurucu & CEO',
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

export default function TeamSection() {
  return (
    <section
      id="team"
      className="relative overflow-hidden bg-bg-dark py-20 sm:py-24 lg:py-32"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-blue/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-purple/3 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          tag="Ekip"
          title="Ekibimiz"
          subtitle="Deneyimli ve tutkulu ekibimiz, projelerinizi hayata gecirmek icin burada. Her biri alaninda uzman profesyonellerden olusan guclu bir takimiz."
          gradientTitle
          parallax
          align="center"
        />

        {/* Team Grid */}
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
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-accent-orange/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.1)]"
            >
              {/* Avatar Placeholder */}
              <div className="relative mx-auto mb-5 h-24 w-24 sm:h-28 sm:w-28">
                {/* Gradient Circle */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-full bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100',
                    member.gradient
                  )}
                />
                {/* Initials */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full">
                  <span className="font-display text-xl font-bold text-white sm:text-2xl">
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
                <h3 className="mb-1 font-display text-lg font-semibold text-text-main">
                  {member.name}
                </h3>
                <p className="text-sm text-text-muted">{member.role}</p>
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
      </div>
    </section>
  );
}
