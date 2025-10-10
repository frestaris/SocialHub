import FeaturedCreators from "./FeaturedCreators";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import TrendingPosts from "./TrendingPosts";

const HomePage = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedCreators />
      <TrendingPosts />
    </>
  );
};

export default HomePage;
