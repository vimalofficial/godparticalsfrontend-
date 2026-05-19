import { useEffect, useState } from "react";
import "./root.css";
import {
  Card,
  Col,
  Row,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Tag,
  Popconfirm,
  Spin,
  Empty,
  message,
  Typography,
  Space,
  Badge,
  Divider,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
// import api from "../../utils/api"; // adjust path as needed

import api from "../../../../api/axios";
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  thumbnail: string;
  category: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["CORE", "HOME_APPLIANCE", "ELECTRONICS", "FASHION"] as const;
// type ProductCategory = (typeof CATEGORIES)[number];

// Helper — always sends the literal string "true" or "false", never relies on
// String(boolean) coercion that some backends misread as truthy for any string.
const boolToStr = (val: boolean) => (val ? "true" : "false");

export default function AdminItem() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [form] = Form.useForm();

  // ── Fetch all products ────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/products");
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Open create modal ─────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingProduct(null);
    setThumbnailFile(null);
    setPreviewUrl("");
    form.resetFields();
    setModalOpen(true);
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setThumbnailFile(null);
    setPreviewUrl(product.thumbnail);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
    });
    setModalOpen(true);
  };

  // ── Open view modal ───────────────────────────────────────────────────────
  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  // ── Handle file selection ─────────────────────────────────────────────────
  const handleFileChange = (info: any) => {
    const file: File = info.file.originFileObj || info.file;
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    return false;
  };

  // ── Create product ────────────────────────────────────────────────────────
  const createProduct = async (values: any) => {
    if (!thumbnailFile) {
      message.warning("Please upload a thumbnail image");
      return;
    }
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("price", String(values.price));
    formData.append("stock", String(values.stock));
    formData.append("category", values.category);
    // Explicit "true"/"false" strings — avoids backends treating any non-empty string as truthy
    formData.append("isActive", boolToStr(values.isActive ?? true));
    formData.append("thumbnail", thumbnailFile);

    const res = await api.post("/admin/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  };

  // ── Update product ────────────────────────────────────────────────────────
  const updateProduct = async (id: string, values: any) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("price", String(values.price));
    formData.append("stock", String(values.stock));
    formData.append("category", values.category);
    // Must NOT use `?? true` — that turns false into true when isActive is explicitly false
    formData.append("isActive", boolToStr(values.isActive === true));
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    const res = await api.put(`/admin/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, values);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        );
        message.success("Product updated successfully");
      } else {
        const created = await createProduct(values);
        setProducts((prev) => [created, ...prev]);
        message.success("Product created successfully");
      }

      setModalOpen(false);
      form.resetFields();
      setThumbnailFile(null);
      setPreviewUrl("");
    } catch (err: any) {
      if (err?.errorFields) return; // form validation error
      message.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle active status ──────────────────────────────────────────────────
  const toggleActive = async (product: Product) => {
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("price", String(product.price));
      formData.append("stock", String(product.stock));
      formData.append("category", product.category);
      formData.append("isActive", boolToStr(!product.isActive));

      const res = await api.put(`/admin/products/${product.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data?.data;
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      message.success(
        `Product ${updated.isActive ? "activated" : "deactivated"}`
      );
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  // ── Delete product ────────────────────────────────────────────────────────
  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      message.success("Product deleted successfully");
    } catch (err) {
      message.error("Failed to delete product");
    }
  };

  // ── Category colour map ───────────────────────────────────────────────────
  const categoryColor: Record<string, string> = {
    CORE: "blue",
    HOME_APPLIANCE: "cyan",
    ELECTRONICS: "purple",
    FASHION: "magenta",
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f6fa" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Product Management
          </Title>
          <Text type="secondary">{products.length} products found</Text>
        </div>
        <Space>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            size="middle"
          >
            Add Product
          </Button>
        </Space>
      </div>

      {/* Product Grid */}
      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Empty description="No products found" style={{ marginTop: 80 }} />
        ) : (
          <Row gutter={[20, 20]}>
            {products.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={12} lg={6}>
                <Badge.Ribbon
                  text={product.isActive ? "Active" : "Inactive"}
                  color={product.isActive ? "green" : "red"}
                >
                  <Card
                    hoverable
                    cover={
                      <div style={{ position: "relative", overflow: "hidden", height: 200 }}>
                        <img
                          alt={product.name}
                          src={product.thumbnail}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                          }}
                          onMouseEnter={(e) =>
                            ((e.target as HTMLImageElement).style.transform =
                              "scale(1.05)")
                          }
                          onMouseLeave={(e) =>
                            ((e.target as HTMLImageElement).style.transform =
                              "scale(1)")
                          }
                        />
                      </div>
                    }
                    actions={[
                      <Tooltip title="View Details" key="view">
                        <EyeOutlined
                          style={{ color: "#1677ff" }}
                          onClick={() => openViewModal(product)}
                        />
                      </Tooltip>,
                      <Tooltip title="Edit" key="edit">
                        <EditOutlined
                          style={{ color: "#faad14" }}
                          onClick={() => openEditModal(product)}
                        />
                      </Tooltip>,
                      <Tooltip
                        title={product.isActive ? "Deactivate" : "Activate"}
                        key="toggle"
                      >
                        <Switch
                          size="small"
                          checked={product.isActive}
                          onChange={() => toggleActive(product)}
                        />
                      </Tooltip>,
                      <Tooltip title="Delete" key="delete">
                        <Popconfirm
                          title="Delete Product"
                          description="Are you sure you want to delete this product?"
                          onConfirm={() => deleteProduct(product.id)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <DeleteOutlined style={{ color: "#ff4d4f" }} />
                        </Popconfirm>
                      </Tooltip>,
                    ]}
                    style={{ borderRadius: 12, overflow: "hidden" }}
                    bodyStyle={{ padding: "14px 16px" }}
                  >
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Text strong style={{ fontSize: 15, flex: 1 }} ellipsis>
                          {product.name}
                        </Text>
                        <Tag
                          color={categoryColor[product.category] || "default"}
                          style={{ marginLeft: 6, fontSize: 11 }}
                        >
                          {product.category}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {product.description}
                      </Text>
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text strong style={{ color: "#1677ff", fontSize: 16 }}>
                          ₹{product.price.toLocaleString()}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Stock: <b>{product.stock}</b>
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* ── Create / Edit Modal ── */}
      <Modal
        title={
          <Space>
            {editingProduct ? <EditOutlined /> : <PlusOutlined />}
            {editingProduct ? "Edit Product" : "Add New Product"}
          </Space>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setThumbnailFile(null);
          setPreviewUrl("");
        }}
        onOk={handleSubmit}
        okText={editingProduct ? "Update Product" : "Create Product"}
        confirmLoading={submitting}
        width={900}
        style={{ top: 40 }}
        styles={{ body: { padding: "20px 24px", overflowY: "visible" } }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {/* Two-column layout: left = fields, right = image uploader */}
          <Row gutter={28}>
            {/* ── LEFT: all form fields ── */}
            <Col xs={24} md={13}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: "Please enter product name" }]}
              >
                <Input placeholder="e.g. Premium Whey Protein" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Product description..."
                  style={{ resize: "none" }}
                />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label="Price (₹)"
                    name="price"
                    rules={[{ required: true, message: "Enter price" }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="599"
                      prefix="₹"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Stock"
                    name="stock"
                    rules={[{ required: true, message: "Enter stock" }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} placeholder="200" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: "Select category" }]}
                  >
                    <Select placeholder="Select category">
                      {CATEGORIES.map((cat) => (
                        <Option key={cat} value={cat}>
                          {cat.replace("_", " ")}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    label="Active Status"
                    name="isActive"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* ── RIGHT: thumbnail uploader ── */}
            <Col xs={24} md={11}>
              <Form.Item label="Thumbnail Image" style={{ marginBottom: 0 }}>
                <Dragger
                  name="thumbnail"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleFileChange}
                  style={{ borderRadius: 8, height: 280 }}
                >
                  {previewUrl ? (
                    <div style={{ padding: "8px 0" }}>
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{
                          height: 220,
                          width: "100%",
                          borderRadius: 8,
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Click or drag to replace
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <div style={{ paddingTop: 48 }}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ fontSize: 44, color: "#1677ff" }} />
                      </p>
                      <p className="ant-upload-text">Click or drag image to upload</p>
                      <p className="ant-upload-hint">JPEG, PNG, WebP, GIF — max 5 MB</p>
                    </div>
                  )}
                </Dragger>
                {!editingProduct && !thumbnailFile && (
                  <Text type="danger" style={{ fontSize: 12 }}>
                    * Thumbnail is required
                  </Text>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── View Details Modal ── */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Product Details
          </Space>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setViewModalOpen(false);
              if (selectedProduct) openEditModal(selectedProduct);
            }}
          >
            Edit
          </Button>,
        ]}
        width={520}
        destroyOnClose
      >
        {selectedProduct && (
          <div>
            <img
              src={selectedProduct.thumbnail}
              alt={selectedProduct.name}
              style={{
                width: "100%",
                height: 240,
                objectFit: "cover",
                borderRadius: 10,
                marginBottom: 20,
              }}
            />
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedProduct.name}
                </Title>
                <Tag color={categoryColor[selectedProduct.category] || "default"}>
                  {selectedProduct.category}
                </Tag>
              </div>
              <Tag color={selectedProduct.isActive ? "success" : "error"}>
                {selectedProduct.isActive ? "Active" : "Inactive"}
              </Tag>
              <Paragraph type="secondary">{selectedProduct.description}</Paragraph>
              <Divider style={{ margin: "8px 0" }} />
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Price</Text>
                  <div>
                    <Text strong style={{ fontSize: 20, color: "#1677ff" }}>
                      ₹{selectedProduct.price.toLocaleString()}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Stock</Text>
                  <div>
                    <Text strong style={{ fontSize: 20 }}>
                      {selectedProduct.stock} units
                    </Text>
                  </div>
                </Col>
              </Row>
              <Divider style={{ margin: "8px 0" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Slug: <code>{selectedProduct.slug}</code>
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Created: {new Date(selectedProduct.createdAt).toLocaleString()}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Updated: {new Date(selectedProduct.updatedAt).toLocaleString()}
              </Text>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}