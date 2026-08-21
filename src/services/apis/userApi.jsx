import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import Cookies from "js-cookie";

const getBaseUrl = () => {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5134/api';
    }
    return import.meta.env.VITE_API_BASE_URL || 'https://api.edusaz.com/api';
};

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: getBaseUrl(),
        prepareHeaders: (headers) => {
            const token = Cookies.get('userToken');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/Auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        registerUser: builder.mutation({
            query: (userData) => ({
                url: '/Auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        getUniversities: builder.query({
            query: (lang = 'en') => `/Universities?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        getLanguages: builder.query({
            query: () => `/Languages`,
            transformResponse: (response) => response.data,
        }),
        getUniversityById: builder.query({
            query: ({ id, lang = 'en' }) => `/Universities/${id}?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        createUniversity: builder.mutation({
            query: (universityData) => ({
                url: '/Universities',
                method: 'POST',
                body: universityData,
            }),
        }),
        getMyUniversity: builder.query({
            query: () => `/Universities/my`,
            transformResponse: (response) => response.data,
        }),
        updateUniversity: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/Universities/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
        getPrograms: builder.query({
            query: (params = 'en') => {
                if (typeof params === 'string') return `/Programs?lang=${params}`;
                const { lang = 'en', countryId, field, search, universityId } = params || {};
                let url = `/Programs?lang=${lang}`;
                if (countryId && countryId !== 'All') url += `&countryId=${countryId}`;
                if (field) url += `&field=${encodeURIComponent(field)}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                if (universityId) url += `&universityId=${universityId}`;
                return url;
            },
            transformResponse: (response) => response.data,
        }),
        createProgram: builder.mutation({
            query: (programData) => ({
                url: '/Programs',
                method: 'POST',
                body: programData,
            }),
        }),
        getCountries: builder.query({
            query: (lang = 'en') => `/Countries?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        getCountryById: builder.query({
            query: ({ idOrCode, lang = 'en' }) => `/Countries/${idOrCode}?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        getUniversitiesByCountry: builder.query({
            query: ({ countryId, lang = 'en' }) => `/Countries/${countryId}/universities?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        getScholarships: builder.query({
            query: (params = 'en') => {
                if (typeof params === 'string') return `/Scholarships?lang=${params}`;
                const { lang = 'en', countryId, universityId } = params || {};
                let url = `/Scholarships?lang=${lang}`;
                if (countryId) url += `&countryId=${countryId}`;
                if (universityId) url += `&universityId=${universityId}`;
                return url;
            },
            transformResponse: (response) => response.data,
        }),
        getScholarshipById: builder.query({
            query: ({ id, lang = 'en' }) => `/Scholarships/${id}?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        createScholarship: builder.mutation({
            query: (body) => ({
                url: '/Scholarships',
                method: 'POST',
                body,
            }),
        }),
        updateScholarship: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/Scholarships/${id}`,
                method: 'PUT',
                body,
            }),
        }),
        deleteScholarship: builder.mutation({
            query: (id) => ({
                url: `/Scholarships/${id}`,
                method: 'DELETE',
            }),
        }),
        checkEligibility: builder.mutation({
            query: (body) => ({
                url: '/Scholarships/check-eligibility',
                method: 'POST',
                body,
            }),
        }),
        subscribeNotification: builder.mutation({
            query: (body) => ({
                url: '/Scholarships/subscribe-notification',
                method: 'POST',
                body,
            }),
        }),
        createPartnershipApplication: builder.mutation({
            query: (body) => ({
                url: '/Partnerships',
                method: 'POST',
                body,
            }),
        }),
        getUserProfile: builder.query({
            query: (email) => `/Auth/profile?email=${encodeURIComponent(email || '')}`,
            transformResponse: (response) => response.data,
            providesTags: ['UserProfile'],
        }),
        updateUserProfile: builder.mutation({
            query: ({ email, ...body }) => ({
                url: `/Auth/profile?email=${encodeURIComponent(email || '')}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['UserProfile'],
        }),
        getAnalytics: builder.query({
            query: (universityId = 'my') => `/Analytics/university/${universityId}`,
            transformResponse: (response) => response.data,
        }),
        getStudentLeads: builder.query({
            query: (universityId = '') => `/StudentLeads?universityId=${universityId}`,
            transformResponse: (response) => response.data,
        }),
        createStudentApplication: builder.mutation({
            query: (data) => ({
                url: '/StudentLeads',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => response.data,
        }),
        updateStudentLeadStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/StudentLeads/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
        }),
        getCampaigns: builder.query({
            query: (params = 'en') => {
                if (typeof params === 'string') return `/Campaigns?lang=${params}`;
                const { lang = 'en', universityId } = params || {};
                let url = `/Campaigns?lang=${lang}`;
                if (universityId) url += `&universityId=${universityId}`;
                return url;
            },
            transformResponse: (response) => response.data,
        }),
        createCampaign: builder.mutation({
            query: (campaignData) => ({
                url: '/Campaigns',
                method: 'POST',
                body: campaignData,
            }),
            transformResponse: (response) => response.data,
        }),
        updateCampaign: builder.mutation({
            query: ({ id, ...campaignData }) => ({
                url: `/Campaigns/${id}`,
                method: 'PUT',
                body: campaignData,
            }),
            transformResponse: (response) => response.data,
        }),
        deleteCampaign: builder.mutation({
            query: (id) => ({
                url: `/Campaigns/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response) => response.data,
        }),
        getTeamMembers: builder.query({
            query: (universityId) => universityId ? `/TeamMembers?universityId=${universityId}` : '/TeamMembers',
            transformResponse: (response) => response.data,
        }),
        createTeamMember: builder.mutation({
            query: (teamData) => ({
                url: '/TeamMembers',
                method: 'POST',
                body: teamData,
            }),
            transformResponse: (response) => response.data,
        }),
        updateTeamMember: builder.mutation({
            query: ({ id, ...teamData }) => ({
                url: `/TeamMembers/${id}`,
                method: 'PUT',
                body: teamData,
            }),
            transformResponse: (response) => response.data,
        }),
        deleteTeamMember: builder.mutation({
            query: (id) => ({
                url: `/TeamMembers/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response) => response.data,
        }),

        // ── Admin User Management ────────────────────────────────────────────
        getUsers: builder.query({
            query: (role) => {
                let url = '/Auth/users';
                if (role) url += `?role=${role}`;
                return url;
            },
            transformResponse: (response) => response.data,
            providesTags: ['Users'],
        }),
        adminCreateUser: builder.mutation({
            query: (userData) => ({
                url: '/Auth/admin-create',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Users'],
        }),
        adminUpdateUser: builder.mutation({
            query: ({ id, ...userData }) => ({
                url: `/Auth/users/${id}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['Users'],
        }),
        adminDeleteUser: builder.mutation({
            query: (id) => ({
                url: `/Auth/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),

        // ── Instructor Profile ───────────────────────────────────────────────
        getInstructorProfile: builder.query({
            query: (email) => `/Instructors/profile?email=${encodeURIComponent(email || '')}`,
            transformResponse: (response) => response.data,
            providesTags: ['InstructorProfile'],
        }),
        updateInstructorProfile: builder.mutation({
            query: ({ email, ...body }) => ({
                url: `/Instructors/profile?email=${encodeURIComponent(email || '')}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['InstructorProfile'],
        }),

        // ── Instructor Courses ───────────────────────────────────────────────
        getMyCourses: builder.query({
            query: (email) => `/Instructors/my-courses?email=${encodeURIComponent(email || '')}`,
            transformResponse: (response) => response.data,
            providesTags: ['MyCourses'],
        }),
        getInstructorCourseById: builder.query({
            query: (id) => `/Instructors/courses/${id}`,
            transformResponse: (response) => response.data,
        }),
        createCourse: builder.mutation({
            query: ({ email, ...body }) => ({
                url: `/Instructors/courses?email=${encodeURIComponent(email || '')}`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['MyCourses'],
        }),
        updateCourse: builder.mutation({
            query: ({ id, email, ...body }) => ({
                url: `/Instructors/courses/${id}?email=${encodeURIComponent(email || '')}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['MyCourses'],
        }),
        deleteCourse: builder.mutation({
            query: ({ id, email }) => ({
                url: `/Instructors/courses/${id}?email=${encodeURIComponent(email || '')}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['MyCourses'],
        }),
        publishCourse: builder.mutation({
            query: ({ id, email, publish }) => ({
                url: `/Instructors/courses/${id}/publish?email=${encodeURIComponent(email || '')}&publish=${publish}`,
                method: 'PUT',
            }),
            invalidatesTags: ['MyCourses'],
        }),

        // ── Analytics & Students ─────────────────────────────────────────────
        getInstructorAnalytics: builder.query({
            query: (email) => `/Instructors/analytics?email=${encodeURIComponent(email || '')}`,
            transformResponse: (response) => response.data,
        }),
        getCourseStudents: builder.query({
            query: ({ courseId, email }) =>
                `/Instructors/courses/${courseId}/students?email=${encodeURIComponent(email || '')}`,
            transformResponse: (response) => response.data,
        }),

        // ── Public Courses ───────────────────────────────────────────────────
        getPublishedCourses: builder.query({
            query: ({ lang, category, search } = {}) => {
                let url = `/Courses`;
                const params = [];
                if (lang) params.push(`lang=${lang}`);
                if (category) params.push(`category=${encodeURIComponent(category)}`);
                if (search) params.push(`search=${encodeURIComponent(search)}`);
                if (params.length) url += '?' + params.join('&');
                return url;
            },
            transformResponse: (response) => response.data,
        }),
        getPublishedCourseById: builder.query({
            query: ({ id, lang = 'en' }) => `/Courses/${id}?lang=${lang}`,
            transformResponse: (response) => response.data,
        }),
        // Hidden Talents & Ideas
        submitHiddenTalent: builder.mutation({
            query: (body) => ({
                url: '/HiddenTalents/submit',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['HiddenTalents'],
        }),
        uploadTalentFile: builder.mutation({
            query: (formData) => ({
                url: '/HiddenTalents/upload',
                method: 'POST',
                body: formData,
            }),
        }),
        getHiddenTalents: builder.query({
            query: ({ status, search } = {}) => {
                const params = new URLSearchParams();
                if (status) params.append('status', status);
                if (search) params.append('search', search);
                const qs = params.toString();
                return `/HiddenTalents${qs ? `?${qs}` : ''}`;
            },
            transformResponse: (response) => response.data,
            providesTags: ['HiddenTalents'],
        }),
        getHiddenTalentById: builder.query({
            query: (id) => `/HiddenTalents/${id}`,
            transformResponse: (response) => response.data,
            providesTags: ['HiddenTalents'],
        }),
        updateHiddenTalentStatus: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/HiddenTalents/${id}/status`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['HiddenTalents'],
        }),
        deleteHiddenTalent: builder.mutation({
            query: (id) => ({
                url: `/HiddenTalents/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['HiddenTalents'],
        }),
    }),
})

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useGetUniversitiesQuery,
    useGetUniversityByIdQuery,
    useGetLanguagesQuery,
    useCreateUniversityMutation,
    useGetMyUniversityQuery,
    useUpdateUniversityMutation,
    useGetProgramsQuery,
    useCreateProgramMutation,
    useGetCountriesQuery,
    useGetCountryByIdQuery,
    useGetUniversitiesByCountryQuery,
    useGetScholarshipsQuery,
    useGetScholarshipByIdQuery,
    useCreateScholarshipMutation,
    useUpdateScholarshipMutation,
    useDeleteScholarshipMutation,
    useGetCampaignsQuery,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useDeleteCampaignMutation,
    useGetTeamMembersQuery,
    useCreateTeamMemberMutation,
    useUpdateTeamMemberMutation,
    useDeleteTeamMemberMutation,
    useCheckEligibilityMutation,
    useSubscribeNotificationMutation,
    useCreatePartnershipApplicationMutation,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGetAnalyticsQuery,
    useGetStudentLeadsQuery,
    useCreateStudentApplicationMutation,
    useUpdateStudentLeadStatusMutation,
    // Admin Users
    useGetUsersQuery,
    useAdminCreateUserMutation,
    useAdminUpdateUserMutation,
    useAdminDeleteUserMutation,
    useGetInstructorProfileQuery,
    useUpdateInstructorProfileMutation,
    useGetMyCoursesQuery,
    useGetInstructorCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    usePublishCourseMutation,
    useGetInstructorAnalyticsQuery,
    useGetCourseStudentsQuery,
    useGetPublishedCoursesQuery,
    useGetPublishedCourseByIdQuery,
    // Hidden Talents
    useSubmitHiddenTalentMutation,
    useUploadTalentFileMutation,
    useGetHiddenTalentsQuery,
    useGetHiddenTalentByIdQuery,
    useUpdateHiddenTalentStatusMutation,
    useDeleteHiddenTalentMutation,
} = userApi;