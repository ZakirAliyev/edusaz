import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../../components/UserComponents/Navbar/index.jsx";
import Footer from "../../components/UserComponents/Footer/index.jsx";
import ScrollToTop from "../../components/Common/ScrollToTop.jsx";
import { useScrollReveal } from "../../hooks/useScrollReveal.js";
import '../../locales/registerPagesTranslations';

function MainPage() {
    const { pathname } = useLocation();
    useScrollReveal();

    return (
        <>
            <ScrollToTop />
            <Navbar />
            {/* Keyed by path so each page fades in gently on navigation. */}
            <div key={pathname} className="ds-route">
                <Outlet />
            </div>
            <Footer />
        </>
    );
}

export default MainPage;
