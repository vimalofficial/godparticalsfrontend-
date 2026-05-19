import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Avatar, Drawer, Badge, Popconfirm } from "antd";
import {
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  LoginOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const userData = localStorage.getItem("user");
  const parsedUser = userData ? JSON.parse(userData) : null;
  const userEmail = parsedUser?.email || "User";

  // Replace with real counts from your cart/wishlist context
  const cartCount = 0;
  const wishlistCount = 0;

  const handleLogout = () => {
    localStorage.clear();
    setDrawerOpen(false);
    window.location.href = "/";
  };

  const iconBtn = (onClick: () => void, icon: React.ReactNode, count: number) => (
    <Badge count={count} size="small">
      <button
        onClick={onClick}
        className="flex items-center justify-center rounded-xl transition-all"
        style={{ width: 38, height: 38, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer" }}
      >
        {icon}
      </button>
    </Badge>
  );

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        {/* <Link to="/home" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="hidden sm:block text-sm font-semibold" style={{ color: "#818cf8" }}>
            {userEmail}
          </span>
        </Link> */}


        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 no-underline">
          <div
            className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ background: "#6366f1" }}
          >
            <img
              src="/brandicon.jfif"
              alt="Brand"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="hidden sm:block text-sm font-semibold" style={{ color: "#818cf8" }}>
            {userEmail}
          </span>
        </Link>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {iconBtn(() => navigate("/wishlist"), <HeartOutlined style={{ color: "#f87171", fontSize: 17 }} />, wishlistCount)}
              {iconBtn(() => navigate("/cart"), <ShoppingCartOutlined style={{ color: "#a5b4fc", fontSize: 17 }} />, cartCount)}
              {iconBtn(() => navigate("/orders"), <HistoryOutlined style={{ color: "#f5fa9c", fontSize: 17 }} />, cartCount)}
              <Avatar size={32} icon={<UserOutlined />} style={{ background: "#6366f1" }} />
              <Popconfirm
                title="Logout"
                description="Are you sure you want to logout?"
                onConfirm={handleLogout}
                okText="Yes, Logout"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                placement="bottomRight"
              >
                <Button
                  icon={<LogoutOutlined />}
                  size="middle"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#f87171",
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Logout
                </Button>
              </Popconfirm>
            </>
          ) : (
            <Button
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
              size="middle"
              style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: 8, fontWeight: 600 }}
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile — wishlist + cart + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn && (
            <>
              {iconBtn(() => navigate("/wishlist"), <HeartOutlined style={{ color: "#f87171", fontSize: 15 }} />, wishlistCount)}
              {iconBtn(() => navigate("/cart"), <ShoppingCartOutlined style={{ color: "#a5b4fc", fontSize: 15 }} />, cartCount)}
            </>
          )}
          <button
            className="flex items-center justify-center rounded-xl"
            style={{ width: 38, height: 38, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer" }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuOutlined style={{ color: "#fff", fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="right"
        width={260}
        styles={{
          body: { padding: 0, background: "#1a1a2e" },
          header: { background: "#1a1a2e", borderBottom: "1px solid rgba(255,255,255,0.08)" },
        }}
        title={<span className="font-bold text-lg" style={{ color: "#fff" }}>My<span style={{ color: "#6366f1" }}>App</span></span>}
        closeIcon={<span style={{ color: "#fff" }}>✕</span>}
      >
        {/* User Info */}
        {isLoggedIn && (
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <Avatar size={40} icon={<UserOutlined />} style={{ background: "#6366f1" }} />
            <div>
              <p className="font-semibold text-sm m-0" style={{ color: "#fff" }}>{userEmail}</p>
              <p className="text-xs m-0" style={{ color: "rgba(255,255,255,0.45)" }}>Logged in</p>
            </div>
          </div>
        )}

        {/* Drawer Nav */}
        {isLoggedIn && (
          <div className="flex flex-col py-3">
            {[
              { label: "Wishlist", icon: <HeartOutlined style={{ color: "#f87171" }} />, path: "/wishlist" },
              { label: "Cart", icon: <ShoppingCartOutlined style={{ color: "#a5b4fc" }} />, path: "/cart" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium w-full text-left"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.75)" }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Drawer Footer */}
        <div className="px-4 py-4 absolute bottom-0 w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {isLoggedIn ? (
            <Popconfirm
              title="Logout"
              description="Are you sure you want to logout?"
              onConfirm={handleLogout}
              okText="Yes, Logout"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              placement="top"
            >
              <Button block icon={<LogoutOutlined />} size="large"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", borderRadius: 10, fontWeight: 600 }}
              >
                Logout
              </Button>
            </Popconfirm>
          ) : (
            <Button block icon={<LoginOutlined />} onClick={() => { setDrawerOpen(false); navigate("/login"); }} size="large"
              style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: 10, fontWeight: 600 }}
            >
              Login
            </Button>
          )}
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;