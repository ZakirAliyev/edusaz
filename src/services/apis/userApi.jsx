import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import Cookies from "js-cookie";

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5134/api',
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
        createUniversity: builder.mutation({
            query: (universityData) => ({
                url: '/Universities',
                method: 'POST',
                body: universityData,
            }),
        }),
    }),
})

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useGetUniversitiesQuery,
    useGetLanguagesQuery,
    useCreateUniversityMutation
} = userApi;