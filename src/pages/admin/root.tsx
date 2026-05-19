import { useState } from "react";
import { Form, Input, Button, Card, notification } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);

      const response = await api.post("/admin/onboard/sign-in", {
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken, admin } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("admin", JSON.stringify(admin));

      notification.success({
        message: "Login Successful",
        description: `Welcome back, ${admin.email}`,
        placement: "topRight",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      notification.error({
        message: "Login Failed",
        description: error?.response?.data?.message || "Invalid email or password.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
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
          Admin Login
        </h1>

        {/* Form */}
        <Form layout="vertical" onFinish={handleLogin}>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input size="large" placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password size="large" placeholder="Enter password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Sign In
          </Button>

        </Form>

      </Card>

    </div>
  );
}