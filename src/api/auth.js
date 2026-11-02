/*
 * Auth: session check, login/signup/logout, email and OTP verification, password reset, unblock requests.
 * Every function returns the response body; errors propagate unchanged (read err.response in the caller).
 */
import axiosClient from "./axiosClient";

/** @typedef {import("./axiosClient").RequestConfig} RequestConfig */

/**
 * Returns the logged-in user from the auth cookie.
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user?: object }>}
 */
export const getCurrentUser = async (config) => (await axiosClient.get("/auth/me", config)).data;

/**
 * Logs in with email and password; the server sets the auth cookie.
 * @param {{ email: string, password: string }} credentials
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user: object }>}
 */
export const login = async (credentials, config) => (await axiosClient.post("/login", credentials, config)).data;

/**
 * Creates an account; the user then verifies their email with an OTP.
 * @param {object} details signup form fields
 * @param {RequestConfig} [config]
 * @returns {Promise<{ email?: string }>}
 */
export const signup = async (details, config) => (await axiosClient.post("/signup", details, config)).data;

/**
 * Ends the session (server side too) and clears the auth cookies.
 * @param {object} [body] request body (some callers send `{}`, some nothing)
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const logout = async (body, config) => (await axiosClient.post("/auth/logout", body, config)).data;

/**
 * Verifies an email address from the link sent by email.
 * @param {string} token verification token from the link
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user?: object }>}
 */
export const verifyEmail = async (token, config) =>
    (await axiosClient.get("/auth/verify-email", { ...config, params: { token } })).data;

/**
 * Verifies the signup OTP; the server logs the user in on success.
 * @param {{ email: string, otp: string }} payload
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user?: object }>}
 */
export const verifyOtp = async (payload, config) => (await axiosClient.post("/auth/verify-otp", payload, config)).data;

/**
 * Sets a new password using the OTP sent by {@link forgotPassword}.
 * @param {{ email: string, otp: string, newPassword: string }} payload
 * @param {RequestConfig} [config]
 * @returns {Promise<{ user?: object }>}
 */
export const resetPassword = async (payload, config) =>
    (await axiosClient.post("/auth/reset-password", payload, config)).data;

/**
 * Emails a password-reset OTP.
 * @param {string} email
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message?: string }>}
 */
export const forgotPassword = async (email, config) =>
    (await axiosClient.post("/auth/forgot-password", { email }, config)).data;

/**
 * Sends the email verification code again.
 * @param {string} email
 * @param {RequestConfig} [config]
 * @returns {Promise<{ message?: string }>}
 */
export const resendVerification = async (email, config) =>
    (await axiosClient.post("/auth/resend-verification", { email }, config)).data;

/**
 * Asks the admins to unblock a blocked account.
 * @param {{ email: string, message: string }} request
 * @param {RequestConfig} [config]
 * @returns {Promise<object>}
 */
export const requestUnblock = async (request, config) =>
    (await axiosClient.post("/auth/unblock-request", request, config)).data;
