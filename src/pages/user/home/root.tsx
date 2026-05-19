import { useEffect, useRef, useState } from "react";
// import Navbar from "../../components/Navbar";
// import api from "../../api/axios";

import Navbar from "../../../components/Navbar";
import api from "../../../api/axios";


import { Input, Dropdown, Button, Card, Tag, Empty, Spin, Badge, Tooltip, notification } from "antd";
import {
    DownOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    ShoppingCartOutlined,
    HeartOutlined,
    HeartFilled,
    EyeOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const CATEGORY_COLORS: Record<string, string> = {
    CORE: "blue",
    ELECTRONICS: "purple",
    FASHION: "magenta",
    HOME_APPLIANCE: "orange",
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
    const [category, setCategory] = useState("all");
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const hasMounted = useRef(false);
    const navigate = useNavigate();

    const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

    const [cartLoading, setCartLoading] = useState<string | null>(null);



    // This page is only shown to logged-in users — no auth checks needed

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

    //   const handleAddToCart = (product: any) => console.log("Add to cart:", product);

    const handleAddToCart = async (product: any) => {
        try {
            const payload = {
                productId: product.id,
                quantity: 1,
            };

            setCartLoading(product.id);

            const response = await api.post("/user/cart", payload);

            console.log(response.data);
            fetchProducts(search, category); // Refresh products to update stock

            notification.success({
                message: "Added to Cart",
                description: `${product.name} has been added to your cart.`,
                placement: "topRight",
            });

        } catch (error) {
            console.log(error);
        } finally {
            setCartLoading(null);
        }
    };


    //   const handleViewProduct = (product: any) =>  <SingleProduct id={product.id} />;


    const handleViewProduct = (product: any) => {
        navigate(`/product/${product.id}`);
    };

    // const handleWishlist = (product: any) => {
    //     const id = product.id || product._id;
    //     setWishlist((prev) => {
    //         const next = new Set(prev);
    //         next.has(id) ? next.delete(id) : next.add(id);
    //         return next;
    //     });
    //     console.log("Wishlist toggled:", product);
    // };



    const handleWishlist = async (product: any) => {
        try {
            const id = product.id || product._id;

            setWishlistLoading(id);

            const payload = {
                productId: id,
            };

            await api.post("/user/wishlist", payload);

            setWishlist((prev) => {
                const next = new Set(prev);
                next.add(id);
                return next;
            });

            notification.success({
                message: "Wishlist Updated",
                description: `${product.name} added to wishlist.`,
                placement: "topRight",
            });

            fetchProducts(search, category);

        } catch (error: any) {
            console.log(error);

            notification.error({
                message: "Wishlist Failed",
                description:
                    error?.response?.data?.message ||
                    "Something went wrong.",
                placement: "topRight",
            });

        } finally {
            setWishlistLoading(null);
        }
    };


    const items: MenuProps["items"] = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
        label,
        key,
    }));

    //   const carouselImages = ["/v1.jfif", "/v2.jfif", "/v3.jfif", "/v4.jfif"];

    return (
        <div className="min-h-screen" style={{ background: "#f5f6fa" }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-3 md:px-8 py-6">

                {/* Carousel
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
        </div> */}

                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 rounded-2xl shadow-sm" style={{ background: "#fff" }}>
                    <Search
                        prefix={<ShoppingOutlined style={{ color: "#6366f1" }} />}
                        placeholder="Search products..."
                        allowClear
                        size="large"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Dropdown menu={{ items, onClick: (e) => setCategory(e.key) }} trigger={["click"]}>
                        <Button
                            size="large"
                            icon={<AppstoreOutlined />}
                            style={{ borderRadius: 10, minWidth: 180, fontWeight: 600, background: "#6366f1", color: "#fff", border: "none" }}
                        >
                            {CATEGORY_LABELS[category]} <DownOutlined />
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
                    <div className="flex flex-col items-center justify-center py-24 rounded-2xl shadow-sm" style={{ background: "#fff" }}>
                        <Empty description={<span style={{ color: "#888", fontSize: 15 }}>No products found{search ? ` for "${search}"` : ""}</span>} />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product, index) => {
                            const id = product.id || product._id || String(index);
                            // const isWishlisted = wishlist.has(id);

                            return (
                                <Card
                                    key={id}
                                    hoverable
                                    cover={
                                        <div className="relative group">
                                            {product.thumbnail ? (
                                                <div className="h-44 overflow-hidden bg-gray-50">
                                                    <img
                                                        src={product.thumbnail}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-44 flex items-center justify-center" style={{ background: "#f0f0ff" }}>
                                                    <ShoppingOutlined style={{ fontSize: 40, color: "#c7c7f7" }} />
                                                </div>
                                            )}

                                            {/* Wishlist Heart — top right of image
                                            <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                                                <button
                                                    onClick={() => handleWishlist(product)}
                                                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                                                    style={{ background: "#fff", border: "none", cursor: "pointer", zIndex: 1 }}
                                                >
                                                    {isWishlisted
                                                        ? <HeartFilled style={{ color: "#ef4444", fontSize: 15 }} />
                                                        : <HeartOutlined style={{ color: "#aaa", fontSize: 15 }} />
                                                    }
                                                </button>
                                            </Tooltip> */}

                                            {/* Wishlist Heart — top right of image */}
                                            <Tooltip
                                                title={
                                                    product.is_wishlist || wishlist.has(product.id)
                                                        ? "Already in Wishlist"
                                                        : "Add to Wishlist"
                                                }
                                            >
                                                <button
                                                    onClick={() => handleWishlist(product)}
                                                    disabled={
                                                        wishlistLoading === product.id ||
                                                        product.is_wishlist
                                                    }
                                                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200"
                                                    style={{
                                                        background: "#fff",
                                                        border: "none",
                                                        cursor:
                                                            product.is_wishlist
                                                                ? "not-allowed"
                                                                : "pointer",
                                                        zIndex: 1,
                                                        opacity:
                                                            wishlistLoading === product.id
                                                                ? 0.7
                                                                : 1,
                                                    }}
                                                >
                                                    {wishlistLoading === product.id ? (
                                                        <Spin size="small" />
                                                    ) : product.is_wishlist ||
                                                        wishlist.has(product.id) ? (
                                                        <HeartFilled
                                                            style={{
                                                                color: "#ef4444",
                                                                fontSize: 15,
                                                            }}
                                                        />
                                                    ) : (
                                                        <HeartOutlined
                                                            style={{
                                                                color: "#aaa",
                                                                fontSize: 15,
                                                            }}
                                                        />
                                                    )}
                                                </button>
                                            </Tooltip>
                                        </div>
                                    }
                                    style={{
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        border: "1px solid #ebebf5",
                                        boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
                                    }}
                                    styles={{ body: { padding: "12px 14px" } }}
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

                                    {/* Name */}
                                    <p className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: "#1a1a2e", minHeight: 36 }}>
                                        {product.name || "Unnamed Product"}
                                    </p>

                                    {/* Description
                                    {product.description && (
                                        <p className="text-xs line-clamp-2 mb-2" style={{ color: "#888" }}>
                                            {product.description}
                                        </p>
                                    )} */}

                                    {/* Price + Stock */}
                                    <div className="flex items-center justify-between mt-1 mb-3">
                                        <span className="font-bold text-base" style={{ color: "#6366f1" }}>
                                            {product.price !== undefined ? `₹${Number(product.price).toLocaleString("en-IN")}` : "—"}
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

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            block
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewProduct(product)}
                                            style={{
                                                borderRadius: 8,
                                                border: "1.5px solid #6366f1",
                                                color: "#6366f1",
                                                fontWeight: 600,
                                                fontSize: 12,
                                                background: "#fff",
                                            }}
                                        >
                                            View Product
                                        </Button>
                                        {/* <Button
                                            block
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock === 0}
                                            loading={cartLoading === product.id}
                                            style={{
                                                borderRadius: 8,
                                                background: product.stock === 0 ? "#e5e7eb" : "#6366f1",
                                                color: product.stock === 0 ? "#9ca3af" : "#fff",
                                                border: "none",
                                                fontWeight: 600,
                                                fontSize: 12,
                                            }}
                                        >
                                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                                        </Button> */}
                                        <Button
                                            block
                                            icon={<ShoppingCartOutlined />}
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock === 0 || product.is_cart}
                                            loading={cartLoading === product.id}
                                            style={{
                                                borderRadius: 8,
                                                background:
                                                    product.stock === 0
                                                        ? "#e5e7eb"
                                                        : product.is_cart
                                                            ? "#10b981"
                                                            : "#6366f1",
                                                color:
                                                    product.stock === 0
                                                        ? "#9ca3af"
                                                        : "#fff",
                                                border: "none",
                                                fontWeight: 600,
                                                fontSize: 12,
                                            }}
                                        >
                                            {product.stock === 0
                                                ? "Out of Stock"
                                                : product.is_cart
                                                    ? "Already in Cart"
                                                    : "Add to Cart"}
                                        </Button>

                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Root;