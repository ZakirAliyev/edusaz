import Navbar from "../../../components/UserComponents/Navbar/index.jsx";
import Hero from "../../../components/UserComponents/Hero/index.jsx";
import Footer from "../../../components/UserComponents/Footer/index.jsx";

function HomePage() {
    return (
        <section id={"homePage"}>
            <Navbar/>
            <Hero/>
            <Footer/>
        </section>
    );
}

export default HomePage;