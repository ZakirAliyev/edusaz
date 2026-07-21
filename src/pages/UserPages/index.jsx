import {Outlet} from "react-router-dom";
import Navbar from "../../components/UserComponents/Navbar/index.jsx";
import Footer from "../../components/UserComponents/Footer/index.jsx";

function MainPage() {
    return (
        <>
            <Navbar/>
            <Outlet/>
            <Footer/>
        </>
    );
}

export default MainPage;