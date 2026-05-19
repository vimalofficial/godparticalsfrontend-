import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import api from "../../../api/axios";
import { Table, Tag, Image, Spin, Empty, Input, Button } from "antd";

const { Search } = Input;
import type { TableProps } from "antd";
import {
  ShoppingOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

interface Order {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "DELIVERED";
  razorpayOrderId: string;
  createdAt: string;
  product: {
    name: string;
    thumbnail: string;
    slug: string;
  };
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PAID:      { color: "success",    label: "Paid" },
  PENDING:   { color: "warning",    label: "Pending" },
  FAILED:    { color: "error",      label: "Failed" },
  CANCELLED: { color: "default",    label: "Cancelled" },
  DELIVERED: { color: "processing", label: "Delivered" },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.fullName.toLowerCase().includes(q) ||
      o.product.name.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.razorpayOrderId.toLowerCase().includes(q) ||
      o.paymentStatus.toLowerCase().includes(q)
    );
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("user/payment/orders");
      setOrders(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: TableProps<Order>["columns"] = [
    {
      title: "Product",
      key: "product",
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Image
            src={record.product.thumbnail}
            alt={record.product.name}
            width={48}
            height={48}
            style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #ebebf5" }}
            preview={{ mask: "View" }}
          />
          <div>
            <p className="m-0 font-semibold text-sm" style={{ color: "#1a1a2e" }}>
              {record.product.name}
            </p>
            <p className="m-0 text-xs" style={{ color: "#aaa" }}>
              Qty: {record.quantity}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-sm font-medium" style={{ color: "#1a1a2e" }}>
            <UserOutlined style={{ color: "#6366f1", fontSize: 12 }} />
            {record.fullName}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "#888" }}>
            <PhoneOutlined style={{ fontSize: 11 }} />
            {record.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      title: "Delivery Address",
      key: "address",
      width: 220,
      render: (_, record) => (
        <div className="flex items-start gap-1">
          <EnvironmentOutlined style={{ color: "#6366f1", fontSize: 12, marginTop: 2 }} />
          <span className="text-xs" style={{ color: "#555", lineHeight: 1.6 }}>
            {record.address}, {record.city},<br />
            {record.state} — {record.pincode}
          </span>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      width: 110,
      render: (_, record) => (
        <span className="font-bold text-sm" style={{ color: "#6366f1" }}>
          ₹{Number(record.totalAmount).toLocaleString("en-IN")}
        </span>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Status",
      key: "paymentStatus",
      width: 120,
      filters: Object.entries(STATUS_CONFIG).map(([key, val]) => ({
        text: val.label,
        value: key,
      })),
      onFilter: (value, record) => record.paymentStatus === value,
      render: (_, record) => {
        const cfg = STATUS_CONFIG[record.paymentStatus] || { color: "default", label: record.paymentStatus };
        return (
          <Tag color={cfg.color} style={{ borderRadius: 6, fontWeight: 600, fontSize: 11 }}>
            {cfg.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Order ID",
      key: "razorpayOrderId",
      width: 180,
      render: (_, record) => (
        <span className="text-xs font-mono" style={{ color: "#888" }}>
          {record.razorpayOrderId}
        </span>
      ),
    },
    {
      title: "Date",
      key: "createdAt",
      width: 120,
      render: (_, record) => (
        <span className="text-xs" style={{ color: "#888" }}>
          {new Date(record.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
      sorter: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      defaultSortOrder: "ascend",
    },
  ];

  const paidCount = orders.filter((o) => o.paymentStatus === "PAID").length;
  const pendingCount = orders.filter((o) => o.paymentStatus === "PENDING").length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen" style={{ background: "#f5f6fa" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "#fff", border: "1px solid #ebebf5", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <ArrowLeftOutlined style={{ color: "#6366f1", fontSize: 15 }} />
          </button>
          <div>
            <h2 className="text-2xl font-bold m-0" style={{ color: "#1a1a2e" }}>My Orders</h2>
            <p className="text-sm m-0 mt-0.5" style={{ color: "#888" }}>Track all your purchases and payment status</p>
          </div>
        </div>

        {/* Search + Refresh */}
        <div className="flex items-center gap-3 mb-6">
          <Search
            placeholder="Search by name, product, city, order ID or status..."
            allowClear
            size="large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: 10, maxWidth: 480 }}
          />
          <Button
            size="large"
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => { setSearch(""); fetchOrders(); }}
            style={{ borderRadius: 10, border: "1px solid #ebebf5", color: "#6366f1", fontWeight: 600 }}
          >
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Orders", value: orders.length, color: "#6366f1", bg: "#f0f0ff" },
              { label: "Paid", value: paidCount, color: "#22c55e", bg: "#f0fff4" },
              { label: "Total Spent", value: `₹${Number(totalSpent).toLocaleString("en-IN")}`, color: "#f59e0b", bg: "#fffbeb" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                style={{ background: "#fff", border: "1px solid #ebebf5" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <ShoppingOutlined style={{ color: stat.color, fontSize: 18 }} />
                </div>
                <div>
                  <p className="m-0 text-xs" style={{ color: "#aaa" }}>{stat.label}</p>
                  <p className="m-0 font-bold text-lg" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: "1px solid #ebebf5" }}>
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Spin size="large" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-24">
              <Empty description={<span style={{ color: "#888" }}>No orders found</span>} />
            </div>
          ) : (
            <Table<Order>
              columns={columns}
              dataSource={filtered.map((o) => ({ ...o, key: o.id }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => (
                  <span style={{ color: "#888", fontSize: 13 }}>
                    {total} order{total !== 1 ? "s" : ""}
                  </span>
                ),
              }}
              scroll={{ x: 1000 }}
              rowClassName={(record) =>
                record.paymentStatus === "PENDING" ? "bg-yellow-50" : ""
              }
              style={{ borderRadius: 0 }}
            />
          )}
        </div>

        {/* Pending notice */}
        {!loading && pendingCount > 0 && (
          <div
            className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}
          >
            <span>⚠️</span>
            <span>
              You have <strong>{pendingCount}</strong> pending order{pendingCount > 1 ? "s" : ""}.
              These payments may not have been completed.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}