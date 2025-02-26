"use client";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../lib/store/hook";
import {
  sendOtp,
  verifyOtp,
  verifyOtpAndRegister,
} from "../../lib/store/features/auth-slice";
import { RootState } from "@/lib/store/store";
import { useRouter } from "next/navigation";

const AuthPage = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: RootState) => state.auth);

  const [isOtpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      name: "",
      userName: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      userName: Yup.string().required("Username is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: () => handleSendOtp(),
  });

  const handleSendOtp = () => {
    dispatch(sendOtp(formik.values.email));
    setOtpModalOpen(true);
  };

  const handleVerifyOtp = () => {
    dispatch(verifyOtp({ email: formik.values.email, otp })).then((result) => {
      if (verifyOtp.fulfilled.match(result)) {
        dispatch(verifyOtpAndRegister(formik.values));
        setOtpModalOpen(false);
        router.push("/login");
      }
    });
  };

  return (
    <div className="flex flex-col text-black w-full items-center p-6">
      <h1 className="text-2xl mb-4">Register with OTP</h1>
      <form onSubmit={formik.handleSubmit} className="flex flex-col w-1/3">
        <input
          className="border p-2 mb-2 "
          placeholder="Name"
          {...formik.getFieldProps("name")}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-red-500">{formik.errors.name}</p>
        )}

        <input
          className="border p-2 mb-2"
          placeholder="Username"
          {...formik.getFieldProps("userName")}
        />
        {formik.touched.userName && formik.errors.userName && (
          <p className="text-red-500">{formik.errors.userName}</p>
        )}

        <input
          className="border p-2 mb-2"
          placeholder="Email"
          {...formik.getFieldProps("email")}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500">{formik.errors.email}</p>
        )}

        <input
          className="border p-2 mb-2"
          placeholder="Password"
          type="password"
          {...formik.getFieldProps("password")}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500">{formik.errors.password}</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white p-2"
          disabled={loading}
        >
          Get OTP
        </button>
      </form>

      {isOtpModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl mb-4">Enter OTP</h2>
            <input
              className="border p-2 mb-2"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="bg-purple-500 text-white p-2 mr-2"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              Verify & Register
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <button
              className="bg-gray-500 text-white p-2"
              onClick={() => setOtpModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default AuthPage;
