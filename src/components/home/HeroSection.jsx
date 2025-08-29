import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import HeroActions from './HeroActions';
import HeroDetails from './HeroDetails';
import SponsorPerformerSection from '../sponsor-perfomer/Sponsor-performer-section';

function HeroSection({ user }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <HeroBackground />
        <HeroContent />
        
      </section>

      <HeroActions user={user} />
      <SponsorPerformerSection />

      <HeroDetails />
    </>
  );
}

export default HeroSection;