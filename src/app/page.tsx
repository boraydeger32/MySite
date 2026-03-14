import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import TeamSection from '@/components/sections/TeamSection';
import BlogPreviewSection from '@/components/sections/BlogPreviewSection';
import PricingSection from '@/components/sections/PricingSection';
import FaqSection from '@/components/sections/FaqSection';
import CtaSection from '@/components/sections/CtaSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <HowItWorksSection />
      <PortfolioSection />
      <TestimonialsSection />
      <TeamSection />
      <BlogPreviewSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
