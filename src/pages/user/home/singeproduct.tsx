import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import api from "../../../api/axios";
import {
    Button, Tag, Badge, Spin, Breadcrumb,
    Modal, Form, Input, notification,
} from "antd";
import {
    ShoppingCartOutlined, HeartOutlined, HeartFilled,
    ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
    HomeOutlined, AppstoreOutlined, ThunderboltOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";

declare global {
    interface Window { Razorpay: any; }
}

const CATEGORY_COLORS: Record<string, string> = {
    CORE: "blue",
    ELECTRONICS: "purple",
    FASHION: "magenta",
    HOME_APPLIANCE: "orange",
};

export default function SingleProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Individual loading states — no shared flag
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [buyLoading, setBuyLoading] = useState(false);

    // Derived from API response, toggled locally on success
    const [inCart, setInCart] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    const [addressModal, setAddressModal] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/user/products/individualitem/${id}`);
                const data = res.data.data;
                setProduct(data);
                setInCart(data.is_cart);
                setWishlisted(data.is_wishlist);
            } catch (err) {
                console.log(err);
                notification.error({ message: "Failed to load product", placement: "topRight" });
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();

        // Load Razorpay script once
        if (!document.getElementById("razorpay-script")) {
            const script = document.createElement("script");
            script.id = "razorpay-script";
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            document.body.appendChild(script);
        }
    }, [id]);

    // ── Add to Cart ─────────────────────────────────────────────────────────
    const handleAddToCart = async () => {
        if (!product || inCart || cartLoading) return;
        try {
            setCartLoading(true);
            await api.post("/user/cart", { productId: product.id, quantity: 1 });
            setInCart(true);
            notification.success({
                message: "Added to Cart",
                description: `${product.name} has been added to your cart.`,
                placement: "topRight",
            });
        } catch (error: any) {
            notification.error({
                message: "Failed to Add",
                description: error?.response?.data?.message || "Could not add to cart.",
                placement: "topRight",
            });
        } finally {
            setCartLoading(false);
        }
    };

    // ── Wishlist ─────────────────────────────────────────────────────────────
    const handleWishlist = async () => {
        if (!product || wishlisted || wishlistLoading) return;
        try {
            setWishlistLoading(true);
            await api.post("/user/wishlist", { productId: product.id });
            setWishlisted(true);
            notification.success({
                message: "Wishlist Updated",
                description: `${product.name} added to wishlist.`,
                placement: "topRight",
            });
        } catch (error: any) {
            notification.error({
                message: "Wishlist Failed",
                description: error?.response?.data?.message || "Something went wrong.",
                placement: "topRight",
            });
        } finally {
            setWishlistLoading(false);
        }
    };

    // ── Buy Now ──────────────────────────────────────────────────────────────
    const handleBuyNow = () => setAddressModal(true);

    const handleConfirmOrder = async (values: any) => {
        try {
            setBuyLoading(true);

            const orderRes = await api.post("/user/payment/create-order", {
                items: [{ productId: product.id, quantity: 1 }],
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
                description: product.name,
                image: product.thumbnail,
                order_id: razorpayOrderId,
                handler: async (response: any) => {
                    try {
                        await api.post("/user/payment/verify", {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        notification.success({
                            message: "Payment Successful 🎉",
                            description: "Your order has been placed successfully!",
                            placement: "topRight",
                        });
                        navigate("/home");
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
            setBuyLoading(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: "#f5f6fa" }}>
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">

                {/* Breadcrumb */}
                <Breadcrumb
                    className="mb-5"
                    items={[
                        { title: <span onClick={() => navigate("/")} className="cursor-pointer flex items-center gap-1"><HomeOutlined /> Home</span> },
                        { title: <span className="flex items-center gap-1"><AppstoreOutlined /> Products</span> },
                        { title: <span style={{ color: "#6366f1" }}>{product?.name || "..."}</span> },
                    ]}
                />

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center py-36">
                        <Spin size="large" />
                    </div>
                )}

                {/* Product Detail */}
                {!loading && product && (
                    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: "1px solid #ebebf5" }}>
                        <div className="flex flex-col md:flex-row">

                            {/* Left — Image */}
                            <div className="md:w-2/5 flex items-center justify-center p-6" style={{ background: "#f8f8ff", minHeight: 360 }}>
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.name}
                                        className="w-full max-h-80 object-contain rounded-xl"
                                        style={{ maxWidth: 340 }}
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center rounded-xl" style={{ background: "#f0f0ff" }}>
                                        <ShoppingCartOutlined style={{ fontSize: 64, color: "#c7c7f7" }} />
                                    </div>
                                )}
                            </div>

                            {/* Right — Info */}
                            <div className="md:w-3/5 p-6 md:p-8 flex flex-col gap-4">

                                {/* Category + Status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {product.category && (
                                        <Tag color={CATEGORY_COLORS[product.category] || "default"} style={{ borderRadius: 6, fontWeight: 600 }}>
                                            {product.category}
                                        </Tag>
                                    )}
                                    <Badge
                                        count={product.isActive ? "Active" : "Inactive"}
                                        style={{ backgroundColor: product.isActive ? "#22c55e" : "#ef4444", borderRadius: 6, padding: "0 8px", fontWeight: 500 }}
                                    />
                                </div>

                                {/* Name */}
                                <h1 className="text-2xl md:text-3xl font-bold m-0" style={{ color: "#1a1a2e" }}>
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <span className="text-3xl font-black" style={{ color: "#6366f1" }}>
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </span>

                                {/* Description */}
                                <p className="text-sm leading-relaxed m-0" style={{ color: "#666" }}>
                                    {product.description}
                                </p>

                                <div style={{ borderTop: "1px solid #f0f0f0" }} />

                                {/* Stock */}
                                <div className="flex items-center gap-2">
                                    {product.stock > 0 ? (
                                        <>
                                            <CheckCircleOutlined style={{ color: "#22c55e", fontSize: 16 }} />
                                            <span className="text-sm font-medium" style={{ color: "#22c55e" }}>In Stock</span>
                                            <span className="text-sm" style={{ color: "#aaa" }}>({product.stock} units available)</span>
                                        </>
                                    ) : (
                                        <>
                                            <CloseCircleOutlined style={{ color: "#ef4444", fontSize: 16 }} />
                                            <span className="text-sm font-medium" style={{ color: "#ef4444" }}>Out of Stock</span>
                                        </>
                                    )}
                                </div>

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl text-xs" style={{ background: "#f8f8ff" }}>
                                    <div>
                                        <p className="m-0" style={{ color: "#aaa" }}>Slug</p>
                                        <p className="m-0 font-medium" style={{ color: "#555" }}>{product.slug}</p>
                                    </div>
                                    <div>
                                        <p className="m-0" style={{ color: "#aaa" }}>Added On</p>
                                        <p className="m-0 font-medium" style={{ color: "#555" }}>
                                            {new Date(product.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">

                                    {/* Add to Cart */}
                                    <Button
                                        size="large"
                                        block
                                        icon={<ShoppingCartOutlined />}
                                        onClick={handleAddToCart}
                                        loading={cartLoading}
                                        disabled={product.stock === 0 || inCart}
                                        style={{
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            height: 46,
                                            background: inCart || product.stock === 0 ? "#e5e7eb" : "#fff",
                                            color: inCart || product.stock === 0 ? "#9ca3af" : "#6366f1",
                                            border: inCart || product.stock === 0 ? "none" : "1.5px solid #6366f1",
                                        }}
                                    >
                                        {inCart
                                            ? "Added to Cart"
                                            : product.stock === 0
                                                ? "Out of Stock"
                                                : "Add to Cart"}
                                    </Button>

                                    {/* Buy Now */}
                                    <Button
                                        size="large"
                                        block
                                        icon={<ThunderboltOutlined />}
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                        loading={buyLoading}
                                        style={{
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            height: 46,
                                            border: "none",
                                            background: product.stock === 0 ? "#e5e7eb" : "linear-gradient(135deg, #6366f1, #818cf8)",
                                            color: product.stock === 0 ? "#9ca3af" : "#fff",
                                            boxShadow: product.stock > 0 ? "0 4px 14px rgba(99,102,241,0.4)" : "none",
                                        }}
                                    >
                                        Buy Now
                                    </Button>

                                    {/* Wishlist */}
                                    <Button
                                        size="large"
                                        block
                                        icon={wishlisted
                                            ? <HeartFilled style={{ color: "#ef4444" }} />
                                            : <HeartOutlined />}
                                        onClick={handleWishlist}
                                        loading={wishlistLoading}
                                        disabled={wishlisted}
                                        style={{
                                            borderRadius: 10,
                                            fontWeight: 700,
                                            height: 46,
                                            border: wishlisted ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
                                            color: wishlisted ? "#ef4444" : "#888",
                                            background: "#fff",
                                        }}
                                    >
                                        {wishlisted ? "Wishlisted" : "Wishlist"}
                                    </Button>
                                </div>

                                {/* Back */}
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-1 text-xs mt-1 w-fit"
                                    style={{ color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                >
                                    <ArrowLeftOutlined /> Back to products
                                </button>
                            </div>
                        </div>
                    </div>
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
                        <Form.Item
                            name="fullName"
                            label={<span className="text-xs font-semibold text-gray-500">Full Name</span>}
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input size="large" placeholder="Arjun Kumar" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Form.Item
                            name="phoneNumber"
                            label={<span className="text-xs font-semibold text-gray-500">Phone Number</span>}
                            rules={[{ required: true, message: "Required" }, { pattern: /^[6-9]\d{9}$/, message: "Invalid number" }]}
                        >
                            <Input size="large" placeholder="9876543210" maxLength={10} style={{ borderRadius: 8 }} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label={<span className="text-xs font-semibold text-gray-500">Address</span>}
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <Input.TextArea rows={2} placeholder="House no, Street, Area" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-x-3">
                        <Form.Item
                            name="city"
                            label={<span className="text-xs font-semibold text-gray-500">City</span>}
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input size="large" placeholder="Hosur" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Form.Item
                            name="state"
                            label={<span className="text-xs font-semibold text-gray-500">State</span>}
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input size="large" placeholder="Tamil Nadu" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Form.Item
                            name="pincode"
                            label={<span className="text-xs font-semibold text-gray-500">Pincode</span>}
                            rules={[{ required: true, message: "Required" }, { pattern: /^\d{6}$/, message: "6 digits" }]}
                        >
                            <Input size="large" placeholder="635109" maxLength={6} style={{ borderRadius: 8 }} />
                        </Form.Item>
                    </div>

                    {/* Order Summary */}
                    <div
                        className="flex items-center justify-between p-3 rounded-xl mb-4"
                        style={{ background: "#f8f8ff", border: "1px solid #ebebf5" }}
                    >
                        <div className="flex items-center gap-3">
                            {product?.thumbnail && (
                                <img src={product.thumbnail} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                                <p className="m-0 text-sm font-semibold" style={{ color: "#1a1a2e" }}>{product?.name}</p>
                                <p className="m-0 text-xs" style={{ color: "#aaa" }}>Qty: 1</p>
                            </div>
                        </div>
                        <span className="font-black text-base" style={{ color: "#6366f1" }}>
                            ₹{product ? Number(product.price).toLocaleString("en-IN") : "—"}
                        </span>
                    </div>

                    <Button
                        htmlType="submit"
                        block
                        size="large"
                        loading={buyLoading}
                        icon={<ThunderboltOutlined />}
                        style={{
                            borderRadius: 10,
                            fontWeight: 700,
                            height: 46,
                            border: "none",
                            background: "linear-gradient(135deg, #6366f1, #818cf8)",
                            color: "#fff",
                            boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                        }}
                    >
                        Proceed to Pay ₹{product ? Number(product.price).toLocaleString("en-IN") : ""}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}