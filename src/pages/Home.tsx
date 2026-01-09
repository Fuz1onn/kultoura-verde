import FeaturedInstructors from "@/components/sections/FeaturedInstructors";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import WhyKultouraVerde from "@/components/sections/WhyKultouraVerde";
import ContactUs from "@/components/sections/ContactUs";
import FinalCTA from "@/components/sections/FinalCTA";

const Home = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Services />
      <FeaturedInstructors />
      <WhyKultouraVerde />
      <ContactUs />
      <FinalCTA />
    </>
  );
};

export default Home;
