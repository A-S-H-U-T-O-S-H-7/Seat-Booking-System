import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import HeroActions from './HeroActions';
import HeroDetails from './HeroDetails';

function HeroSection({ user }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <HeroBackground />
        <HeroContent />
        
      </section>

      <HeroActions user={user} />

      <HeroDetails />
    </>
  );
}

export default HeroSection;