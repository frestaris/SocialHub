import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import FeaturedCreators from "./FeaturedCreators";
import TrendingNow from "./TrendingNow";

const HomePage = () => {
  return (
    <div style={{ overflowX: "hidden" }}>
      <Hero />
      <HowItWorks />
      <FeaturedCreators />
      <TrendingNow />
    </div>
  );
};

export default HomePage;
