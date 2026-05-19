import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import api from "../../../api/axios";
import {
  Table, Image, Spin, Empty, Button, Modal,
  Form, Input, InputNumber, notification, Divider,
} from "antd";
import type { TableProps } from "antd";
import {
  ArrowLeftOutlined, ShoppingCartOutlined, ThunderboltOutlined,
  EnvironmentOutlined, DeleteOutlined, ReloadOutlined,
} from "@ant-design/icons";

declare global {
  interface Window { Razorpay: any; }
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnail: string;
    stock: number;
    isActive: boolean;
  };
}

interface Summary {
  totalItems: number;
  totalAmount: number;
  itemCount: number;
}

export default function Cart() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [addressModal, setAddressModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
    }
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/cart");
      setItems(res.data.data.items);
      setSummary(res.data.data.summary);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (cartItemId: string) => {
    try {
      setRemovingId(cartItemId);
      await api.delete(`/user/cart/${cartItemId}`);
      setItems((prev) => prev.filter((i) => i.id !== cartItemId));
      notification.success({ message: "Item removed from cart", placement: "topRight" });
      fetchCart();
    } catch {
      notification.error({ message: "Failed to remove item", placement: "topRight" });
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuantityChange = async (cartItemId: string, quantity: number) => {
    try {
      setUpdatingId(cartItemId);
      await api.patch(`/user/cart/${cartItemId}`, { quantity });
      setItems((prev) =>
        prev.map((i) => i.id === cartItemId ? { ...i, quantity } : i)
      );
      fetchCart();
    } catch {
      notification.error({ message: "Failed to update quantity", placement: "topRight" });
    } finally {
      setUpdatingId(null);
    }
  };

  // Place order → address modal
  const handlePlaceOrder = () => setAddressModal(true);

  // Confirm address → create order → open Razorpay
  const handleConfirmOrder = async (values: any) => {
    try {
      setOrderLoading(true);

      const orderItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      const orderRes = await api.post("/user/payment/create-order", {
        items: orderItems,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
      });

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data.data;

      setAddressModal(false);

      const options = {
        key: keyId,
        amount,
        currency,
        name: "MyApp",
        description: `${summary?.itemCount} item(s)`,
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await api.post("/user/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,

              "from_cart": true
            });
            notification.success({
              message: "Payment Successful 🎉",
              description: "Your order has been placed successfully!",
              placement: "topRight",
            });
            navigate("/orders");
          } catch {
            notification.error({
              message: "Verification Failed",
              description: "Payment received but verification failed. Contact support.",
              placement: "topRight",
            });
          }
        },

        prefill: { name: values.fullName, contact: values.phoneNumber },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => notification.warning({
            message: "Payment Cancelled",
            description: "You closed the payment window.",
            placement: "topRight",
          }),
        },
      };

      new window.Razorpay(options).open();
    } catch (err: any) {
      notification.error({
        message: "Order Failed",
        description: err?.response?.data?.message || "Something went wrong. Try again.",
        placement: "topRight",
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const columns: TableProps<CartItem>["columns"] = [
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Image
            src={record.product.thumbnail}
            alt={record.product.name}
            width={52}
            height={52}
            style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #ebebf5" }}
            preview={{ mask: "View" }}
          />
          <div>
            <p className="m-0 font-semibold text-sm" style={{ color: "#1a1a2e" }}>
              {record.product.name}
            </p>
            <p className="m-0 text-xs" style={{ color: "#aaa" }}>
              {record.product.isActive ? "In Stock" : "Unavailable"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Unit Price",
      key: "price",
      width: 120,
      render: (_, record) => (
        <span className="font-semibold text-sm" style={{ color: "#555" }}>
          ₹{Number(record.product.price).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Unit Price",
      key: "price",
      width: 120,
      render: (_, record) => (
        <span className="font-semibold text-sm" style={{ color: "#555" }}>
          {Number(record.quantity).toLocaleString("en-IN")}
        </span>
      ),
    },
    // {
    //   title: "Quantity",
    //   key: "quantity",
    //   width: 140,
    //   render: (_, record) => (
    //     <InputNumber
    //       min={1}
    //       max={record.product.stock}
    //       defaultValue={record.quantity}
    //       size="middle"
    //       disabled={updatingId === record.id}
    //       onChange={(val) => {
    //         if (val && val !== record.quantity) {
    //           handleQuantityChange(record.id, val);
    //         }
    //       }}
    //       style={{ width: 90, borderRadius: 8 }}
    //     />
    //   ),
    // },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 130,
      render: (_, record) => (
        <span className="font-bold text-sm" style={{ color: "#6366f1" }}>
          ₹{Number(record.product.price * record.quantity).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          loading={removingId === record.id}
          onClick={() => handleRemove(record.id)}
          style={{ color: "#ef4444" }}
          danger
        />
      ),
    },
  ];

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="min-h-screen" style={{ background: "#f5f6fa" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "#fff", border: "1px solid #ebebf5", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <ArrowLeftOutlined style={{ color: "#6366f1", fontSize: 15 }} />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold m-0" style={{ color: "#1a1a2e" }}>My Cart</h2>
            <p className="text-sm m-0 mt-0.5" style={{ color: "#888" }}>
              {summary ? `${summary.itemCount} item${summary.itemCount !== 1 ? "s" : ""} in your cart` : "Loading..."}
            </p>
          </div>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchCart}
            style={{ borderRadius: 10, border: "1px solid #ebebf5", color: "#6366f1", fontWeight: 600 }}
          >
            Refresh
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-36">
            <Spin size="large" />
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ background: "#fff", border: "1px solid #ebebf5" }}>
            <Empty
              image={<ShoppingCartOutlined style={{ fontSize: 64, color: "#c7c7f7" }} />}
              imageStyle={{ height: 80 }}
              description={<span style={{ color: "#888" }}>Your cart is empty</span>}
            >
              <Button
                onClick={() => navigate("/home")}
                style={{ borderRadius: 10, background: "#6366f1", color: "#fff", border: "none", fontWeight: 600 }}
              >
                Browse Products
              </Button>
            </Empty>
          </div>
        )}

        {/* Table + Summary */}
        {!loading && items.length > 0 && (
          <>
            {/* Cart Table */}
            <div className="rounded-2xl overflow-hidden shadow-sm mb-4" style={{ background: "#fff", border: "1px solid #ebebf5" }}>
              <Table<CartItem>
                columns={columns}
                dataSource={items.map((i) => ({ ...i, key: i.id }))}
                pagination={false}
                scroll={{ x: 600 }}
                style={{ borderRadius: 0 }}
              />
            </div>

            {/* Summary + Place Order */}
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ background: "#fff", border: "1px solid #ebebf5" }}
            >
              <p className="text-base font-bold m-0 mb-3" style={{ color: "#1a1a2e" }}>Order Summary</p>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm" style={{ color: "#888" }}>
                  <span>Total Items</span>
                  <span style={{ color: "#555" }}>{summary?.totalItems}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: "#888" }}>
                  <span>Unique Products</span>
                  <span style={{ color: "#555" }}>{summary?.itemCount}</span>
                </div>
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold" style={{ color: "#1a1a2e" }}>Total Amount</span>
                <span className="text-2xl font-black" style={{ color: "#6366f1" }}>
                  ₹{Number(summary?.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>

              <Button
                block
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={handlePlaceOrder}
                style={{
                  borderRadius: 12,
                  fontWeight: 700,
                  height: 50,
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  color: "#fff",
                  fontSize: 15,
                  boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                }}
              >
                Place Order · ₹{Number(summary?.totalAmount).toLocaleString("en-IN")}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Address Modal */}
      <Modal
        open={addressModal}
        onCancel={() => { setAddressModal(false); form.resetFields(); }}
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <EnvironmentOutlined style={{ color: "#6366f1" }} />
            <span className="font-bold text-base" style={{ color: "#1a1a2e" }}>Delivery Details</span>
          </div>
        }
        width={480}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={handleConfirmOrder} requiredMark={false}>

          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item name="fullName" label={<span className="text-xs font-semibold text-gray-500">Full Name</span>}
              rules={[{ required: true, message: "Required" }]}>
              <Input size="large" placeholder="Arjun Kumar" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item name="phoneNumber" label={<span className="text-xs font-semibold text-gray-500">Phone Number</span>}
              rules={[{ required: true, message: "Required" }, { pattern: /^[6-9]\d{9}$/, message: "Invalid number" }]}>
              <Input size="large" placeholder="9876543210" maxLength={10} style={{ borderRadius: 8 }} />
            </Form.Item>
          </div>

          <Form.Item name="address" label={<span className="text-xs font-semibold text-gray-500">Address</span>}
            rules={[{ required: true, message: "Required" }]}>
            <Input.TextArea rows={2} placeholder="House no, Street, Area" style={{ borderRadius: 8 }} />
          </Form.Item>

          <div className="grid grid-cols-3 gap-x-3">
            <Form.Item name="city" label={<span className="text-xs font-semibold text-gray-500">City</span>}
              rules={[{ required: true, message: "Required" }]}>
              <Input size="large" placeholder="Hosur" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item name="state" label={<span className="text-xs font-semibold text-gray-500">State</span>}
              rules={[{ required: true, message: "Required" }]}>
              <Input size="large" placeholder="Tamil Nadu" style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item name="pincode" label={<span className="text-xs font-semibold text-gray-500">Pincode</span>}
              rules={[{ required: true, message: "Required" }, { pattern: /^\d{6}$/, message: "6 digits" }]}>
              <Input size="large" placeholder="635109" maxLength={6} style={{ borderRadius: 8 }} />
            </Form.Item>
          </div>

          {/* Cart Summary in Modal */}
          <div className="rounded-xl mb-4 overflow-hidden" style={{ border: "1px solid #ebebf5" }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2"
                style={{ borderBottom: i < items.length - 1 ? "1px solid #f5f5f5" : "none", background: "#f8f8ff" }}
              >
                <div className="flex items-center gap-2">
                  <img src={item.product.thumbnail} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <p className="m-0 text-xs font-semibold" style={{ color: "#1a1a2e" }}>{item.product.name}</p>
                    <p className="m-0 text-xs" style={{ color: "#aaa" }}>Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-bold" style={{ color: "#6366f1" }}>
                  ₹{Number(item.product.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            <div className="flex justify-between px-3 py-2" style={{ background: "#fff" }}>
              <span className="text-sm font-bold" style={{ color: "#1a1a2e" }}>Total</span>
              <span className="text-sm font-black" style={{ color: "#6366f1" }}>
                ₹{Number(summary?.totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Button
            htmlType="submit"
            block size="large"
            loading={orderLoading}
            icon={<ThunderboltOutlined />}
            style={{
              borderRadius: 10, fontWeight: 700, height: 46, border: "none",
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
            }}
          >
            Proceed to Pay ₹{Number(summary?.totalAmount).toLocaleString("en-IN")}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}