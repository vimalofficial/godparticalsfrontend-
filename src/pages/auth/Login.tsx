import { useState } from "react";

import {
  Form,
  Input,
  Button,
  Card,
  message,
} from "antd";

import api from "../../api/axios";




import { useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [showOtpField, setShowOtpField] =
    useState(false);

  // Send OTP
  const handleSendOtp = async () => {

    try {

      setLoading(true);

      const response = await api.post(
        "/user/onboard/send-otp",
        {
          email,
        }
      );

      if (response.data.success) {

        message.success(
          response.data.data.message
        );

        setShowOtpField(true);
      }

    } catch (error: any) {

      if (
        error.response &&
        error.response.status === 401
      ) {

        message.error(
          error.response.data.message
        );

      } else {

        message.error(
          "Something went wrong"
        );
      }

    } finally {

      setLoading(false);

    }
  };

  // Verify OTP
  const handleVerifyOtp = async (
    values: any
  ) => {

    try {

      setOtpLoading(true);

      const response = await api.post(
        "/user/onboard/verify-otp",
        {
          email,
          otp: values.otp,
        }
      );

      if (response.data.success) {

        const data =
          response.data.data;

        // Save in localStorage
        localStorage.setItem(
          "accessToken",
          data.accessToken
        );

        localStorage.setItem(
          "refreshToken",
          data.refreshToken
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Success Message
        message.success(
          "Login Successful"
        );

        // Redirect
        navigate("/home");

      }

    } catch (error: any) {

      if (error.response) {

        message.error(
          error.response.data.message
        );

      } else {

        message.error(
          "Something went wrong"
        );
      }

    } finally {

      setOtpLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <Card className="w-full max-w-md shadow-xl rounded-2xl">

        {/* Brand Image */}
        <div className="flex justify-center mb-6">

          <img
            src="/brandicon.jfif"
            alt="brand"
            className="w-24 h-24 rounded-full object-cover"
          />

        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        {/* Form */}
        <Form
          layout="vertical"
          onFinish={handleVerifyOtp}
        >

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message:
                  "Please enter email",
              },
            ]}
          >

            <Input
              size="large"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </Form.Item>

          {/* Send OTP Button */}
          {!showOtpField && (

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>

          )}

          {/* OTP Field */}
          {showOtpField && (
            <>

              <Form.Item
                label="OTP"
                name="otp"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter OTP",
                  },
                  {
                    len: 6,
                    message:
                      "OTP must be exactly 6 digits",
                  },
                ]}
              >

                <Input
                  size="large"
                  placeholder="Enter OTP"
                  maxLength={6}
                />

              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={otpLoading}
              >
                Verify OTP
              </Button>

            </>
          )}

        </Form>

      </Card>

    </div>
  );
};

export default Login;