import { useEffect, useRef, useState } from "react";
// import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import { Input, Dropdown, Button, Carousel, Card, Tag, Empty, Spin, Badge } from "antd";
import { DownOutlined, ShoppingOutlined, AppstoreOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const CATEGORY_COLORS: Record<string, string> = {
  CORE: "blue",
  ELECTRONICS: "purple",
  FASHION: "magenta",
  HOME_APPLIANCE: "orange",
  all: "default",
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Categories",
  CORE: "Core",
  ELECTRONICS: "Electronics",
  FASHION: "Fashion",
  HOME_APPLIANCE: "Home Appliance",
};

const Root = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const hasMounted = useRef(false);
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  // Replace with your real auth check (e.g. token from localStorage or context)
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLoginClick = () => navigate("/login");

  const fetchProducts = async (searchValue = "", categoryValue = "all") => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 10 };
      if (searchValue) params.search = searchValue;
      if (categoryValue && categoryValue !== "all") params.category = categoryValue;
      const response = await api.get("/user/products", { params });
      setProducts(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchProducts();
      return;
    }
    const debounce = setTimeout(() => fetchProducts(search, category), 500);
    return () => clearTimeout(debounce);
  }, [search, category]);

  const items: MenuProps["items"] = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    label,
    key,
  }));

  const handleMenuClick: MenuProps["onClick"] = (e) => setCategory(e.key);

  const carouselImages = ["/v1.jfif", "/v2.jfif", "/v3.jfif", "/v4.jfif"];

  return (
    <div className="min-h-screen" style={{ background: "#f5f6fa" }}>
      {/* <Navbar /> */}

      <div className="max-w-7xl mx-auto px-3 md:px-8 py-6">

        {/* Login Banner — shown only when not logged in */}
        {!isLoggedIn && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 px-5 py-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <UserOutlined style={{ color: "#fff", fontSize: 18 }} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm md:text-base m-0">
                  Sign in to shop & place orders
                </p>
                <p className="text-white text-xs m-0" style={{ opacity: 0.8 }}>
                  Get access to exclusive deals and track your orders
                </p>
              </div>
            </div>
            <Button
              size="large"
              icon={<LockOutlined />}
              onClick={handleLoginClick}
              style={{
                background: "#fff",
                color: "#6366f1",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                minWidth: 120,
                flexShrink: 0,
              }}
            >
              Login
            </Button>
          </div>
        )}

        {/* Carousel */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-md">
          <Carousel autoplay effect="fade">
            {carouselImages.map((image, index) => (
              <div key={index}>
                <div className="h-[180px] md:h-[380px] overflow-hidden">
                  <img src={image} alt={`banner-${index}`} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Search + Filter Bar */}
        <div
          className="flex flex-col md:flex-row gap-3 mb-8 p-4 rounded-2xl shadow-sm"
          style={{ background: "#fff" }}
        >
          <Search
            prefix={<ShoppingOutlined style={{ color: "#6366f1" }} />}
            placeholder="Search products..."
            allowClear
            size="large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
            style={{ borderRadius: 10 }}
          />
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <Button
              size="large"
              icon={<AppstoreOutlined />}
              style={{
                borderRadius: 10,
                minWidth: 180,
                fontWeight: 600,
                background: "#6366f1",
                color: "#fff",
                border: "none",
              }}
            >
              {CATEGORY_LABELS[category]}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        {/* Results count */}
        {!loading && products.length > 0 && (
          <p className="text-sm mb-4" style={{ color: "#888" }}>
            Showing <strong style={{ color: "#6366f1" }}>{products.length}</strong> product{products.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Spin size="large" />
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-2xl shadow-sm"
            style={{ background: "#fff" }}
          >
            <Empty
              description={
                <span style={{ color: "#888", fontSize: 15 }}>
                  No products found{search ? ` for "${search}"` : ""}
                </span>
              }
            />
            {(search || category !== "all") && (
              <Button
                className="mt-4"
                onClick={() => { setSearch(""); setCategory("all"); }}
                style={{ borderRadius: 8, color: "#6366f1", borderColor: "#6366f1" }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <Card
                key={product._id || product.id || index}
                hoverable
                cover={
                  product.thumbnail ? (
                    <div className="h-44 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-44 flex items-center justify-center"
                      style={{ background: "#f0f0ff" }}
                    >
                      <ShoppingOutlined style={{ fontSize: 40, color: "#c7c7f7" }} />
                    </div>
                  )
                }
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #ebebf5",
                  boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
                }}
                bodyStyle={{ padding: "12px 14px" }}
              >
                {/* Category Tag */}
                {product.category && (
                  <Tag
                    color={CATEGORY_COLORS[product.category] || "default"}
                    style={{ borderRadius: 6, fontSize: 10, marginBottom: 6 }}
                  >
                    {product.category}
                  </Tag>
                )}

                {/* Product Name */}
                <p
                  className="font-semibold text-sm leading-snug mb-1 line-clamp-2"
                  style={{ color: "#1a1a2e", minHeight: 36 }}
                >
                  {product.name || "Unnamed Product"}
                </p>

                {/* Description */}
                {/* {product.description && (
                  <p
                    className="text-xs line-clamp-2 mb-2"
                    style={{ color: "#888" }}
                  >
                    {product.description}
                  </p>
                )} */}

                {/* Price + Stock */}
                <div className="flex items-center justify-between mt-2">
                  <span
                    className="font-bold text-base"
                    style={{ color: "#6366f1" }}
                  >
                    {product.price !== undefined
                      ? `₹${Number(product.price).toLocaleString("en-IN")}`
                      : "—"}
                  </span>

                  {product.stock !== undefined && (
                    <Badge
                      count={product.stock > 0 ? "In Stock" : "Out of Stock"}
                      style={{
                        backgroundColor: product.stock > 0 ? "#22c55e" : "#ef4444",
                        fontSize: 10,
                        borderRadius: 6,
                        padding: "0 6px",
                        fontWeight: 500,
                      }}
                    />
                  )}
                </div>

                {/* Login CTA on card */}
                {!isLoggedIn && (
                  <Button
                    block
                    onClick={handleLoginClick}
                    style={{
                      marginTop: 10,
                      borderRadius: 8,
                      background: "#6366f1",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                    icon={<LockOutlined />}
                  >
                    Login to Order
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Root;