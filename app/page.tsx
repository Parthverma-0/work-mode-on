import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { MarqueeSection } from '@/components/marquee'
import { ScrollStack } from '@/components/scroll-stack'
import { FeaturesBento } from '@/components/features-bento'
import { StatsTestimonials } from '@/components/stats-testimonials'
// import { Pricing } from '@/components/pricing'
import { FinalCTA, Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <Hero />
      <MarqueeSection />
      <ScrollStack />
      <FeaturesBento />
      <StatsTestimonials />
      {/* <Pricing /> */}
      <FinalCTA />
      <Footer />
    </main>
  )
}
