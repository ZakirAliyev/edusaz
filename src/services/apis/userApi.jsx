import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import Cookies from "js-cookie";

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api.edusaz.com/api',
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
    useUpdateStudentLeadStatusMutation,
} = userApi;