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
import SuperAdminPage from "../pages/UserPages/SuperAdminPage/index.jsx";
import InstructorPortalPage from "../pages/UserPages/InstructorPortalPage/index.jsx";
import SuperAdminSignInPage from "../pages/UserPages/SuperAdminSignInPage/index.jsx";

import CoursesPage from "../pages/UserPages/CoursesPage/index.jsx";
import CourseDetailPage from "../pages/UserPages/CourseDetailPage/index.jsx";
import UserProfilePage from "../pages/UserPages/UserProfilePage/index.jsx";
import HiddenTalentsPage from "../pages/UserPages/HiddenTalentsPage/index.jsx";

import Cookies from "js-cookie";
import PrivateRoute from "../components/Common/PrivateRoute.jsx";

const SuperAdminRoute = () => {
    const token = Cookies.get('userToken');
    const role = (localStorage.getItem('userRole') || '').toLowerCase();

    if (!token || role !== 'superadmin') {
        return <SuperAdminSignInPage />;
    }

    return <SuperAdminPage />;
};

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
                path: 'profile',
                element: <PrivateRoute allowedRoles={['student', 'Student']}><UserProfilePage/></PrivateRoute>
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
                path: 'courses',
                element: <CoursesPage/>
            },
            {
                path: 'courses/:id',
                element: <CourseDetailPage/>
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
            },
            {
                path: 'talents',
                element: <HiddenTalentsPage/>
            },
            {
                path: 'gizli-bacariqlar',
                element: <HiddenTalentsPage/>
            }
        ]
    },
    {
        path: '/university-portal',
        element: <PrivateRoute allowedRoles={['universityadmin', 'UniversityAdmin']}><UniversityPortalPage/></PrivateRoute>
    },
    {
        path: '/portal',
        element: <PrivateRoute allowedRoles={['universityadmin', 'UniversityAdmin']}><UniversityPortalPage/></PrivateRoute>
    },
    {
        path: '/superadmin',
        element: <SuperAdminRoute />
    },
    {
        path: '/superadmin/login',
        element: <SuperAdminSignInPage/>
    },
    {
        path: '/instructor-portal',
        element: <PrivateRoute allowedRoles={['instructor', 'Instructor', 'teacher', 'Teacher', 'coursecenter', 'CourseCenter']}><InstructorPortalPage/></PrivateRoute>
    },
    {
        path: '/instructor/courses',
        element: <PrivateRoute allowedRoles={['instructor', 'Instructor', 'teacher', 'Teacher', 'coursecenter', 'CourseCenter']}><InstructorPortalPage/></PrivateRoute>
    }
];