import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import api from "../../../api/axios";
import {
    Card,
    Button,
    Tag,
    Empty,
    Spin,
    notification,
    Image,
    Tooltip,
    Badge,
} from "antd";
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EyeOutlined,
    HeartFilled,
    ShoppingOutlined,
} from "@ant-design/icons";

const { Meta } = Card;

const CATEGORY_COLORS: Record<string, string> = {
    CORE: "blue",
    ELECTRONICS: "purple",
    FASHION: "magenta",
    HOME_APPLIANCE: "orange",
};

const Wishlist = () => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await api.get("/user/wishlist");
            setWishlist(res.data.data.items || []);
        } catch (err) {
            console.log(err);
            notification.error({
                message: "Failed to load wishlist",
                placement: "topRight",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (wishlistItemId: string, productName: string) => {
        try {
            setRemovingId(wishlistItemId);
            await api.delete(`/user/wishlist/${wishlistItemId}`);
            setWishlist((prev) => prev.filter((item) => item.id !== wishlistItemId));
            notification.success({
                message: "Removed from Wishlist",
                description: `${productName} has been removed from your wishlist.`,
                placement: "topRight",
            });
        } catch (error: any) {
            notification.error({
                message: "Remove Failed",
                description:
                    error?.response?.data?.message || "Something went wrong.",
                placement: "topRight",
            });
        } finally {
            setRemovingId(null);
        }
    };

    const handleViewProduct = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    return (
        <div className="min-h-screen" style={{ background: "#f5f6fa" }}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-3 md:px-8 py-6">
                {/* Header */}
                <div
                    className="flex items-center gap-3 mb-6 p-4 rounded-2xl shadow-sm"
                    style={{ background: "#fff" }}
                >
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{
                            borderRadius: 10,
                            border: "1.5px solid #e0e0f0",
                            color: "#6366f1",
                            fontWeight: 600,
                        }}
                    >
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <HeartFilled style={{ color: "#ef4444", fontSize: 20 }} />

                        <h1
                            className="hidden sm:block text-xl font-bold m-0"
                            style={{ color: "#1a1a2e" }}
                        >
                            My Wishlist
                        </h1>

                        {!loading && (
                            <span
                                className="hidden sm:inline-block text-sm font-medium px-2 py-0.5 rounded-full"
                                style={{ background: "#f0f0ff", color: "#6366f1" }}
                            >
                                {wishlist.length} item{wishlist.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-24">
                        <Spin size="large" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && wishlist.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center py-24 rounded-2xl shadow-sm"
                        style={{ background: "#fff" }}
                    >
                        <HeartFilled style={{ fontSize: 48, color: "#e0e0f0", marginBottom: 16 }} />
                        <Empty
                            description={
                                <span style={{ color: "#888", fontSize: 15 }}>
                                    Your wishlist is empty
                                </span>
                            }
                        />
                        <Button
                            className="mt-4"
                            icon={<ShoppingOutlined />}
                            onClick={() => navigate("/home")}
                            style={{
                                borderRadius: 8,
                                background: "#6366f1",
                                color: "#fff",
                                border: "none",
                                fontWeight: 600,
                            }}
                        >
                            Browse Products
                        </Button>
                    </div>
                )}

                {/* Wishlist Grid */}
                {!loading && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {wishlist.map((item) => {
                            const product = item.product;
                            const isRemoving = removingId === item.id;

                            return (
                                <Card
                                    key={item.id}
                                    hoverable
                                    cover={
                                        product.thumbnail ? (
                                            <Image
                                                src={product.thumbnail}
                                                alt={product.name}
                                                style={{
                                                    height: 176,
                                                    objectFit: "cover",
                                                    width: "100%",
                                                    cursor: "pointer",
                                                }}
                                                preview={{
                                                    mask: (
                                                        <div className="flex items-center gap-1 text-white text-xs font-medium">
                                                            <EyeOutlined /> Preview
                                                        </div>
                                                    ),
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="h-44 flex items-center justify-center"
                                                style={{ background: "#f0f0ff" }}
                                            >
                                                <ShoppingOutlined
                                                    style={{ fontSize: 40, color: "#c7c7f7" }}
                                                />
                                            </div>
                                        )
                                    }
                                    style={{
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        border: "1px solid #ebebf5",
                                        boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
                                        opacity: isRemoving ? 0.6 : 1,
                                        transition: "opacity 0.2s",
                                    }}
                                    styles={{ body: { padding: "12px 14px" } }}
                                >
                                    {/* Category Tag */}
                                    {product.category && (
                                        <Tag
                                            color={CATEGORY_COLORS[product.category] || "default"}
                                            style={{
                                                borderRadius: 6,
                                                fontSize: 10,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {product.category}
                                        </Tag>
                                    )}

                                    <Meta
                                        title={
                                            <span
                                                className="text-sm font-semibold line-clamp-2"
                                                style={{ color: "#1a1a2e" }}
                                            >
                                                {product.name || "Unnamed Product"}
                                            </span>
                                        }
                                        description={
                                            <div className="flex items-center justify-between mt-1 mb-3">
                                                <span
                                                    className="font-bold text-base"
                                                    style={{ color: "#6366f1" }}
                                                >
                                                    {product.price !== undefined
                                                        ? `₹${Number(product.price).toLocaleString("en-IN")}`
                                                        : "—"}
                                                </span>
                                                {product.isActive !== undefined && (
                                                    <Badge
                                                        count={product.isActive ? "Active" : "Inactive"}
                                                        style={{
                                                            backgroundColor: product.isActive
                                                                ? "#22c55e"
                                                                : "#ef4444",
                                                            fontSize: 10,
                                                            borderRadius: 6,
                                                            padding: "0 6px",
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        }
                                    />

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 mt-2">
                                        <Button
                                            block
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewProduct(product.id)}
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

                                        <Tooltip title="Remove from Wishlist">
                                            <Button
                                                block
                                                danger
                                                icon={<DeleteOutlined />}
                                                loading={isRemoving}
                                                onClick={() => handleRemove(item.id, product.name)}
                                                style={{
                                                    borderRadius: 8,
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </Tooltip>
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

export default Wishlist;