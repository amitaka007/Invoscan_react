'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { choosePassword, forgotPassword } from "@/api/forgotPassword";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [password, setPassword] = useState('');
    const [showOTPField, setShowOTPField] = useState(false);
    const doResetPassword = async (e) => {
        e.preventDefault();
        if (otp) {
            try {
                let otpResponse = await choosePassword({ email, otp, password });
                router.push('/')
            } catch (error) {
                console.log(error)
            }
        } else {
            try {
                let response = await forgotPassword({ email });
                setShowOTPField(true);
            } catch (error) {
                console.log(error);
            }
        }
    }
    return (
        <div className="container-xxl">
            <div className="authentication-wrapper authentication-basic container-p-y">
                <div className="authentication-inner">
                    <div className="card">
                        <div className="card-body">
                            <div className="app-brand justify-content-center">
                                <a className="app-brand-link gap-2">
                                    <span className="app-brand-logo">
                                        <img src="/INVO.svg" />
                                    </span>
                                </a>
                            </div>
                            <h4 className="text-center mb-3">Forgot Password</h4>

                            <form id="formAuthentication" method="POST" onSubmit={(e) => { doResetPassword(e) }} className="mb-3">
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email or Username</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        onChange={(e) => { setEmail(e.target.value) }}
                                        id="email"
                                        name="email"
                                        value={email}
                                        required
                                        placeholder="Enter your email or username"
                                        autoFocus />
                                </div>
                                {
                                    showOTPField ?
                                        <>
                                            <div className="mb-3">
                                                <label htmlFor="otp" className="form-label">OTP</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(e) => { setOTP(e.target.value) }}
                                                    id="otp"
                                                    name="otp"
                                                    value={otp}
                                                    required
                                                    placeholder="Enter OTP Code"
                                                    autoFocus />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="password" className="form-label">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    onChange={(e) => { setPassword(e.target.value) }}
                                                    id="password"
                                                    name="password"
                                                    required
                                                    placeholder="Enter your password"
                                                    autoFocus />
                                            </div>
                                        </>
                                        : null
                                }
                                <div className="mb-3">
                                    {
                                        showOTPField ?
                                            <button className="btn btn-green d-grid w-100" type="submit">Update</button>
                                            :
                                            <button className="btn btn-green d-grid w-100" type="submit">Send Reset Link</button>
                                    }
                                </div>
                            </form>
                            <div className="text-center">
                                <Link href="/" className="d-flex align-items-center justify-content-center">
                                    <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
