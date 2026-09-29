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
import NotFoundPage from "../pages/UserPages/NotFoundPage/index.jsx";
import DestinationDetailPage from "../pages/UserPages/DestinationDetailPage/index.jsx";
import UniversityDetailPage from "../pages/UserPages/UniversityDetailPage/index.jsx";

import CoursesPage from "../pages/UserPages/CoursesPage/index.jsx";
import CourseDetailPage from "../pages/UserPages/CourseDetailPage/index.jsx";
import UserProfilePage from "../pages/UserPages/UserProfilePage/index.jsx";
import HiddenTalentsPage from "../pages/UserPages/HiddenTalentsPage/index.jsx";
import PaymentSuccessPage from "../pages/UserPages/PaymentSuccessPage/index.jsx";
import PaymentFailPage from "../pages/UserPages/PaymentFailPage/index.jsx";
import PaymentResultPage from "../pages/UserPages/PaymentResultPage/index.jsx";

import {lazy} from "react";
import {Navigate} from "react-router-dom";
import PrivateRoute from "../components/Common/PrivateRoute.jsx";

// The admin panel (and its Tailwind/shadcn styles) is code-split so public visitors never download it.
const AdminLayout = lazy(() => import("../admin/layout/AdminLayout.jsx"));
const AdminSignInPage = lazy(() => import("../admin/pages/SignInPage.jsx"));
const AdminOverviewPage = lazy(() => import("../admin/pages/OverviewPage.jsx"));
const AdminUsersPage = lazy(() => import("../admin/pages/UsersPage.jsx"));
const AdminUniversitiesPage = lazy(() => import("../admin/pages/UniversitiesPage.jsx"));
const AdminProgramsPage = lazy(() => import("../admin/pages/ProgramsPage.jsx"));
const AdminScholarshipsPage = lazy(() => import("../admin/pages/ScholarshipsPage.jsx"));
const AdminCoursesPage = lazy(() => import("../admin/pages/CoursesPage.jsx"));
const AdminCountriesPage = lazy(() => import("../admin/pages/CountriesPage.jsx"));
const AdminLanguagesPage = lazy(() => import("../admin/pages/LanguagesPage.jsx"));
const AdminTalentsPage = lazy(() => import("../admin/pages/TalentsPage.jsx"));

const InstructorLayout = lazy(() => import("../instructor/layout/InstructorLayout.jsx"));
const InstructorOverviewPage = lazy(() => import("../instructor/pages/OverviewPage.jsx"));
const InstructorCoursesPage = lazy(() => import("../instructor/pages/CoursesPage.jsx"));
const InstructorCourseEditorPage = lazy(() => import("../instructor/pages/CourseEditorPage.jsx"));
const InstructorStudentsPage = lazy(() => import("../instructor/pages/StudentsPage.jsx"));
const InstructorAnalyticsPage = lazy(() => import("../instructor/pages/AnalyticsPage.jsx"));
const InstructorProfilePage = lazy(() => import("../instructor/pages/ProfilePage.jsx"));

const UniversityLayout = lazy(() => import("../university/layout/UniversityLayout.jsx"));
const UniversityOverviewPage = lazy(() => import("../university/pages/OverviewPage.jsx"));
const UniversityProfilePage = lazy(() => import("../university/pages/ProfilePage.jsx"));
const UniversityProgramsPage = lazy(() => import("../university/pages/ProgramsPage.jsx"));
const UniversityScholarshipsPage = lazy(() => import("../university/pages/ScholarshipsPage.jsx"));
const UniversityLeadsPage = lazy(() => import("../university/pages/LeadsPage.jsx"));
const UniversityAnalyticsPage = lazy(() => import("../university/pages/AnalyticsPage.jsx"));
const UniversitySettingsPage = lazy(() => import("../university/pages/SettingsPage.jsx"));

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
            },
            {
                path: 'payment/success',
                element: <PaymentSuccessPage/>
            },
            {
                path: 'payment/fail',
                element: <PaymentFailPage/>
            },
            {
                path: 'payment/failed',
                element: <PaymentFailPage/>
            },
            {
                path: 'payment/result',
                element: <PaymentResultPage/>
            },
            {
                path: '*',
                element: <NotFoundPage/>
            }
        ]
    },
    {
        path: '/university-portal',
        element: <UniversityLayout/>,
        children: [
            {index: true, element: <UniversityOverviewPage/>},
            {path: 'profile', element: <UniversityProfilePage/>},
            {path: 'programs', element: <UniversityProgramsPage/>},
            {path: 'scholarships', element: <UniversityScholarshipsPage/>},
            {path: 'leads', element: <UniversityLeadsPage/>},
            {path: 'analytics', element: <UniversityAnalyticsPage/>},
            {path: 'settings', element: <UniversitySettingsPage/>},
            {path: '*', element: <Navigate to="/university-portal" replace/>},
        ]
    },
    {
        path: '/portal',
        element: <Navigate to="/university-portal" replace/>
    },
    {
        path: '/superadmin/login',
        element: <AdminSignInPage/>
    },
    {
        path: '/superadmin',
        element: <AdminLayout/>,
        children: [
            {index: true, element: <AdminOverviewPage/>},
            {path: 'users', element: <AdminUsersPage/>},
            {path: 'universities', element: <AdminUniversitiesPage/>},
            {path: 'programs', element: <AdminProgramsPage/>},
            {path: 'scholarships', element: <AdminScholarshipsPage/>},
            {path: 'courses', element: <AdminCoursesPage/>},
            {path: 'countries', element: <AdminCountriesPage/>},
            {path: 'languages', element: <AdminLanguagesPage/>},
            {path: 'talents', element: <AdminTalentsPage/>},
            {path: '*', element: <AdminOverviewPage/>},
        ]
    },
    {
        path: '/instructor-portal',
        element: <InstructorLayout/>,
        children: [
            {index: true, element: <InstructorOverviewPage/>},
            {path: 'courses', element: <InstructorCoursesPage/>},
            {path: 'courses/new', element: <InstructorCourseEditorPage/>},
            {path: 'courses/:id', element: <InstructorCourseEditorPage/>},
            {path: 'students', element: <InstructorStudentsPage/>},
            {path: 'analytics', element: <InstructorAnalyticsPage/>},
            {path: 'profile', element: <InstructorProfilePage/>},
            {path: '*', element: <Navigate to="/instructor-portal" replace/>},
        ]
    },
    {
        path: '/instructor/courses',
        element: <Navigate to="/instructor-portal/courses" replace/>
    }
];