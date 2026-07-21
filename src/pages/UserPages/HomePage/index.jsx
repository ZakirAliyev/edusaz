import Hero from "../../../components/UserComponents/Hero/index.jsx";
import HowItWorks from "../../../components/UserComponents/HowItWorks/index.jsx";
import TopDestinations from "../../../components/UserComponents/TopDestinations/index.jsx";
import MatchedUniversities from "../../../components/UserComponents/MatchedUniversities/index.jsx";
import AiAdvisor from "../../../components/UserComponents/AiAdvisor/index.jsx";
import ForUniversities from "../../../components/UserComponents/ForUniversities/index.jsx";

function HomePage() {
    return (
        <section id={"homePage"}>
            <Hero/>
            <HowItWorks/>
            <TopDestinations/>
            <MatchedUniversities/>
            <AiAdvisor/>
            <ForUniversities/>
        </section>
    );
}

export default HomePage;