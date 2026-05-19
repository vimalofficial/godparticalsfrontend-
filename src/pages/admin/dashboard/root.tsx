import { useState } from "react";
import { Menu, Popconfirm, Button } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined, ShoppingCartOutlined, UserOutlined,
  TagsOutlined, DollarOutlined, LogoutOutlined,
  TrophyOutlined, CheckCircleOutlined, InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AdminItem from "./item/root";

// ── Placeholder — replace each case with your real component ─────────────────
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-64 rounded-2xl"
      style={{ background: "#f8f8ff", border: "1px solid #ebebf5" }}
    >
      <p className="text-2xl font-bold m-0" style={{ color: "#6366f1" }}>{title}</p>
      <p className="text-sm mt-2 m-0" style={{ color: "#aaa" }}>Content coming soon</p>
    </div>
  );
}

function ItemPage() {
  return (
    <AdminItem />
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  { key: "1", label: "Add Champion",    icon: <TrophyOutlined /> },
  { key: "2", label: "Check Payments",  icon: <CheckCircleOutlined /> },
  { key: "3", label: "Payments",        icon: <DollarOutlined /> },
  { key: "4", label: "Users",           icon: <UserOutlined /> },
  { key: "5", label: "Coupons",         icon: <TagsOutlined /> },
  { key: "6", label: "Orders",          icon: <ShoppingCartOutlined /> },
  { key: "7", label: "Products",        icon: <AppstoreOutlined /> },
  { key: "8", label: "Item Management", icon: <InboxOutlined /> },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeKey, setActiveKey] = useState("7");
  const navigate = useNavigate();

  const activeItem = navItems.find((i) => i.key === activeKey);

  const renderPage = () => {
    switch (activeKey) {
      case "1": return <PlaceholderPage title="Add Champion" />;
      case "2": return <PlaceholderPage title="Check Payments" />;
      case "3": return <PlaceholderPage title="Payments" />;
      case "4": return <PlaceholderPage title="Users List" />;
      case "5": return <PlaceholderPage title="Coupons" />;
      case "6": return <PlaceholderPage title="Orders" />;
      case "7": return <PlaceholderPage title="Products" />;
      case "8": return <ItemPage />;
      default:  return null;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleMenuClick = (key: string) => {
    setActiveKey(key);
  };

  const sidebarMenuItems: MenuProps["items"] = [
    {
      key: "grp",
      label: "Admin Panel",
      type: "group" as const,
      children: navItems.map((item) => ({
        key: item.key,
        label: item.label,
        icon: item.icon,
      })),
    },
  ];

  const logoutBtn = (placement: "topLeft" | "bottomRight") => (
    <Popconfirm
      title="Logout"
      description="Are you sure you want to logout?"
      onConfirm={handleLogout}
      okText="Yes, Logout"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
      placement={placement}
    >
      <Button
        icon={<LogoutOutlined />}
        style={{
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#f87171",
          borderRadius: 10,
          fontWeight: 600,
        }}
      >
        Logout
      </Button>
    </Popconfirm>
  );

  return (
    <div className="min-h-screen" style={{ background: "#f5f6fa" }}>

      {/* ── Desktop ───────────────────────────────────────────────────────── */}
      <div className="hidden md:flex min-h-screen">

        {/* Sidebar */}
        <aside
          className="flex flex-col justify-between py-6 px-3"
          style={{
            width: 240,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            position: "sticky",
            top: 0,
            height: "100vh",
            flexShrink: 0,
          }}
        >
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 px-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="font-bold text-base" style={{ color: "#fff" }}>
                Admin<span style={{ color: "#818cf8" }}>Panel</span>
              </span>
            </div>

            {/* Menu */}
            <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[activeKey]}
              onClick={(e) => handleMenuClick(e.key)}
              items={sidebarMenuItems}
              style={{ background: "transparent", border: "none" }}
            />
          </div>

          {/* Logout */}
          <div className="px-3">
            {logoutBtn("topLeft")}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold m-0" style={{ color: "#1a1a2e" }}>
              {activeItem?.label}
            </h1>
            <p className="text-sm m-0 mt-1" style={{ color: "#aaa" }}>
              Manage your {activeItem?.label?.toLowerCase()} here
            </p>
          </div>
          {renderPage()}
        </main>
      </div>

      {/* ── Mobile ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:hidden min-h-screen">

        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="font-bold text-sm" style={{ color: "#fff" }}>
              Admin<span style={{ color: "#818cf8" }}>Panel</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* <span className="text-xs font-medium" style={{ color: "#818cf8" }}>
              {activeItem?.label}
            </span> */}
            {logoutBtn("bottomRight")}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-1 pb-20 overflow-auto"> 
          <div className="mb-4">
            <h1 className="text-xl font-bold m-0" style={{ color: "#1a1a2e" }}>
              {activeItem?.label}
            </h1>
          </div>
          {renderPage()}
        </main>

        {/* Bottom Nav — scrollable icons only */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex items-center overflow-x-auto"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.3)",
            zIndex: 100,
            height: 60,
            scrollbarWidth: "none",
          }}
        >
          {navItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className="flex items-center justify-center flex-shrink-0 rounded-xl transition-all"
                style={{
                  width: 56,
                  height: 44,
                  background: isActive ? "rgba(99,102,241,0.25)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  margin: "0 4px",
                }}
              >
                <span style={{ fontSize: 20, color: isActive ? "#818cf8" : "rgba(255,255,255,0.4)" }}>
                  {item.icon}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}