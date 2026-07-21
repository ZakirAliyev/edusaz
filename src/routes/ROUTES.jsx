import MainPage from "../pages/UserPages/index.jsx";
import HomePage from "../pages/UserPages/HomePage/index.jsx";
import BrowseUniversitiesPage from "../pages/UserPages/BrowseUniversitiesPage/index.jsx";
import ScholarshipsPage from "../pages/UserPages/ScholarshipsPage/index.jsx";
import DestinationsPage from "../pages/UserPages/DestinationsPage/index.jsx";
import ForUniversitiesPage from "../pages/UserPages/ForUniversitiesPage/index.jsx";
import SignInPage from "../pages/UserPages/SignInPage/index.jsx";
import RegisterRolePage from "../pages/UserPages/RegisterRolePage/index.jsx";
import RegisterDetailsPage from "../pages/UserPages/RegisterDetailsPage/index.jsx";

import AiDiscoveryPage from "../pages/UserPages/AiDiscoveryPage/index.jsx";
import AiDiscoveryResultsPage from "../pages/UserPages/AiDiscoveryResultsPage/index.jsx";
import DestinationDetailPage from "../pages/UserPages/DestinationDetailPage/index.jsx";
import UniversityDetailPage from "../pages/UserPages/UniversityDetailPage/index.jsx";
import UniversityPortalPage from "../pages/UserPages/UniversityPortalPage/index.jsx";

export const ROUTES = [
    {
        path: '/',
        element: <MainPage/>,
        children: [
            {
                index: true,
                element: <HomePage/>,
            },
            {
                path: 'universities',
                element: <BrowseUniversitiesPage/>
            },
            {
                path: 'universities/:id',
                element: <UniversityDetailPage/>
            },
            {
                path: 'scholarships',
                element: <ScholarshipsPage/>
            },
            {
                path: 'destinations',
                element: <DestinationsPage/>
            },
            {
                path: 'destinations/:id',
                element: <DestinationDetailPage/>
            },
            {
                path: 'for-universities',
                element: <ForUniversitiesPage/>
            },
            {
                path: 'signin',
                element: <SignInPage/>
            },
            {
                path: 'register',
                element: <RegisterRolePage/>
            },
            {
                path: 'register/details',
                element: <RegisterDetailsPage/>
            },
            {
                path: 'ai-discovery',
                element: <AiDiscoveryPage/>
            },
            {
                path: 'ai-discovery/results',
                element: <AiDiscoveryResultsPage/>
            }
        ]
    },
    {
        path: '/university-portal',
        element: <UniversityPortalPage/>
    }
];