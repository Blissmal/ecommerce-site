// app/admin/products/[id]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "../../../../../../../../lib/product.action";
import { 
  addVariant, 
  updateVariant, 
  deleteVariant as deleteVariantAction,
  getProductVariants 
} from "../../../../../../../../lib/variant.action";
import { generateVariantSKU } from "../../../../../../../..//lib/utils/variant-utils";
import { getProductById } from "../../../../../../../../lib/product.action";
import { toast } from "react-hot-toast";
import { getAllCategories } from "../../../../../../../../lib/category.actions";

interface Variant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  color?: string | null;
  size?: string | null;
  storage?: string | null;
  images: string[];
  weight?: number | null;
  isDefault: boolean;
}

interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  categoryId: string;
  brand?: string | null;
  model?: string | null;
  sku?: string | null;
  imageUrl: string;
  images: string[];
  features: string[];
  specifications: any;
  tags: string[];
  weight?: number | null;
  dimensions?: string | null;
  availableColors: string[];
  availableSizes: string[];
  availableStorage: string[];
  discount?: number | null;
  variants: Variant[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  // Product basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // Product details
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [productSku, setProductSku] = useState("");
  
  // Images
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  
  // Product attributes
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [discount, setDiscount] = useState("");
  
  // Available options
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [availableStorage, setAvailableStorage] = useState<string[]>([]);
  const [storageInput, setStorageInput] = useState("");
  
  // Specifications
  const [specifications, setSpecifications] = useState<any>({});
  const [specSection, setSpecSection] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  
  // Variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
  const [isNewVariant, setIsNewVariant] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  // ==================== LOAD PRODUCT ====================

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      
      if (!data) {
        toast.error("Product not found");
        router.push("/admin/products");
        return;
      }

      // Set product data
      setProduct(data as any);
      setTitle(data.title);
      setDescription(data.description);
      setShortDescription(data.shortDescription || "");
      setCategoryId(data.category.id);
      setBrand(data.brand || "");
      setModel(data.model || "");
      setProductSku(data.sku || "");
      setImageUrl(data.imageUrl);
      setImages(data.images || []);
      setFeatures(data.features || []);
      setTags(data.tags || []);
      setWeight(data.weight?.toString() || "");
      setDimensions(data.dimensions || "");
      setDiscount(data.discount?.toString() || "");
      setAvailableColors(data.availableColors || []);
      setAvailableSizes(data.availableSizes || []);
      setAvailableStorage(data.availableStorage || []);
      setSpecifications(data.specifications || {});
      setVariants(data.variants || []);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addColor = () => {
    if (colorInput.trim() && !availableColors.includes(colorInput.trim())) {
      setAvailableColors([...availableColors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const removeColor = (color: string) => {
    setAvailableColors(availableColors.filter((c) => c !== color));
  };

  const addSize = () => {
    if (sizeInput.trim() && !availableSizes.includes(sizeInput.trim())) {
      setAvailableSizes([...availableSizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setAvailableSizes(availableSizes.filter((s) => s !== size));
  };

  const addStorage = () => {
    if (storageInput.trim() && !availableStorage.includes(storageInput.trim())) {
      setAvailableStorage([...availableStorage, storageInput.trim()]);
      setStorageInput("");
    }
  };

  const removeStorage = (storage: string) => {
    setAvailableStorage(availableStorage.filter((s) => s !== storage));
  };

  const addSpecification = () => {
    if (specSection.trim() && specKey.trim() && specValue.trim()) {
      setSpecifications({
        ...specifications,
        [specSection]: {
          ...(specifications[specSection] || {}),
          [specKey]: specValue,
        },
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpecSection = (section: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[section];
    setSpecifications(newSpecs);
  };

  const loadCategories = async () => {
  try {
    const data = await getAllCategories();
    setCategories(data);
  } catch (error) {
    console.error("Error loading categories:", error);
    toast.error("Failed to load categories");
  }
};

useEffect(() => {
  loadProduct();
  loadCategories(); // Call the new function here
}, [productId]);

  // ==================== VARIANT MANAGEMENT ====================

  const openNewVariantForm = () => {
    setCurrentVariant({
      id: "",
      sku: generateVariantSKU(productSku, {}),
      price: 0,
      stock: 0,
      color: availableColors[0] || null,
      size: availableSizes[0] || null,
      storage: availableStorage[0] || null,
      images: [],
      weight: weight ? parseFloat(weight) : null,
      isDefault: variants.length === 0,
    });
    setIsNewVariant(true);
    setShowVariantForm(true);
  };

  const openEditVariantForm = (variant: Variant) => {
    setCurrentVariant(variant);
    setIsNewVariant(false);
    setShowVariantForm(true);
  };

  const saveVariant = async () => {
    if (!currentVariant) return;

    // Validate
    if (!currentVariant.price || currentVariant.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (currentVariant.stock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    try {
      setSaving(true);

      if (isNewVariant) {
        // Add new variant
        const result = await addVariant({
          productId: productId,
          sku: currentVariant.sku,
          price: currentVariant.price,
          stock: currentVariant.stock,
          color: currentVariant.color || undefined,
          size: currentVariant.size || undefined,
          storage: currentVariant.storage || undefined,
          images: currentVariant.images,
          weight: currentVariant.weight || undefined,
          isDefault: currentVariant.isDefault,
        });

        toast.success("Variant added successfully");
      } else {
        // Update existing variant
        await updateVariant(currentVariant.id, {
          sku: currentVariant.sku,
          price: currentVariant.price,
          stock: currentVariant.stock,
          color: currentVariant.color || undefined,
          size: currentVariant.size || undefined,
          storage: currentVariant.storage || undefined,
          images: currentVariant.images,
          weight: currentVariant.weight || undefined,
          isDefault: currentVariant.isDefault,
        });

        toast.success("Variant updated successfully");
      }

      // Reload variants
      await loadProduct();
      setShowVariantForm(false);
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Failed to save variant");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    if (variants.length === 1) {
      toast.error("Cannot delete the last variant. Delete the product instead.");
      return;
    }

    try {
      setSaving(true);
      await deleteVariantAction(variantId);
      toast.success("Variant deleted");
      await loadProduct();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    } finally {
      setSaving(false);
    }
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !imageUrl || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      await updateProduct(productId, {
        title,
        description,
        shortDescription: shortDescription || undefined,
        categoryId,
        brand: brand || undefined,
        model: model || undefined,
        sku: productSku || undefined,
        imageUrl,
        images,
        features,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        tags,
        weight: weight ? parseFloat(weight) : undefined,
        dimensions: dimensions || undefined,
        availableColors,
        availableSizes,
        availableStorage,
        discount: discount ? parseFloat(discount) : undefined,
      });

      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <button
          onClick={() => router.push("/admin/products")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
  <label className="block text-sm font-medium mb-2">
    Category <span className="text-red-500">*</span>
  </label>
  <select
    value={categoryId}
    onChange={(e) => setCategoryId(e.target.value)}
    className="w-full border rounded px-3 py-2"
    required
  >
    <option value="">Select category</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Product SKU</label>
              <input
                type="text"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount (%)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border rounded px-3 py-2"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Images</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Main Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Main"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Additional Images</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Image URL"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features & Tags */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Features & Tags</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="e.g., 5G capable"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 rounded-full text-sm flex items-center gap-2"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="e.g., smartphone"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Specifications */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Specifications</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section</label>
                <input
                  type="text"
                  value={specSection}
                  onChange={(e) => setSpecSection(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Display, Performance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key</label>
                <input
                  type="text"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Screen Size, Processor"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Value</label>
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 6.7 inches, A15 Bionic"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Display Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div className="mt-4 space-y-4">
                {Object.entries(specifications).map(([section, specs]) => (
                  <div key={section} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg">{section}</h3>
                      <button
                        type="button"
                        onClick={() => removeSpecSection(section)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove Section
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {typeof specs === 'object' && Object.entries(specs as Record<string, string>).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 px-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">{key}:</span>
                          <span className="text-sm text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(specifications).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                No specifications added yet. Fill in the fields above to add specifications.
              </p>
            )}
          </div>
        </section>

        {/* Available Options */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Options</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium mb-2">Colors</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-2 bg-blue-500 text-white rounded"
                >
                  +
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <span
                    key={color}
                    className="px-2 py-1 bg-blue-100 rounded text-sm flex items-center gap-1"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium mb-2">Sizes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-3 py-2 bg-blue-500 text-white rounded"
                >
                  +
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <span
                    key={size}
                    className="px-2 py-1 bg-green-100 rounded text-sm flex items-center gap-1"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <label className="block text-sm font-medium mb-2">Storage</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storageInput}
                  onChange={(e) => setStorageInput(e.target.value)}
                  className="flex-1 border rounded px-3 py-2"
                />
                <button
                  type="button"
                  onClick={addStorage}
                  className="px-3 py-2 bg-blue-500 text-white rounded"
                >
                  +
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableStorage.map((storage) => (
                  <span
                    key={storage}
                    className="px-2 py-1 bg-purple-100 rounded text-sm flex items-center gap-1"
                  >
                    {storage}
                    <button
                      type="button"
                      onClick={() => removeStorage(storage)}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Variants ({variants.length})
            </h2>
            <button
              type="button"
              onClick={openNewVariantForm}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              + Add New Variant
            </button>
          </div>

          {/* Variants Table */}
          {variants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">SKU</th>
                    <th className="border px-4 py-2">Color</th>
                    <th className="border px-4 py-2">Size</th>
                    <th className="border px-4 py-2">Storage</th>
                    <th className="border px-4 py-2">Price</th>
                    <th className="border px-4 py-2">Stock</th>
                    <th className="border px-4 py-2">Default</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="border px-4 py-2">{variant.sku}</td>
                      <td className="border px-4 py-2">{variant.color || "-"}</td>
                      <td className="border px-4 py-2">{variant.size || "-"}</td>
                      <td className="border px-4 py-2">{variant.storage || "-"}</td>
                      <td className="border px-4 py-2">${variant.price.toFixed(2)}</td>
                      <td className="border px-4 py-2">
                        <span className={variant.stock <= 5 ? "text-red-500 font-semibold" : ""}>
                          {variant.stock}
                        </span>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {variant.isDefault ? "✓" : ""}
                      </td>
                      <td className="border px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditVariantForm(variant)}
                            className="text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-red-500 hover:underline"
                            disabled={variants.length === 1}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No variants yet. Click "Add New Variant" to create one.
            </p>
          )}

          {/* Variant Form Modal */}
          {showVariantForm && currentVariant && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {isNewVariant ? "Add New Variant" : "Edit Variant"}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">SKU</label>
                      <input
                        type="text"
                        value={currentVariant.sku}
                        onChange={(e) =>
                          setCurrentVariant({ ...currentVariant, sku: e.target.value })
                        }
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentVariant.price}
                        onChange={(e) =>
                          setCurrentVariant({
                            ...currentVariant,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={currentVariant.stock}
                        onChange={(e) =>
                          setCurrentVariant({
                            ...currentVariant,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <select
                        value={currentVariant.color || ""}
                        onChange={(e) =>
                          setCurrentVariant({
                            ...currentVariant,
                            color: e.target.value || null,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">None</option>
                        {availableColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Size</label>
                      <select
                        value={currentVariant.size || ""}
                        onChange={(e) =>
                          setCurrentVariant({
                            ...currentVariant,
                            size: e.target.value || null,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">None</option>
                        {availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Storage</label>
                      <select
                        value={currentVariant.storage || ""}
                        onChange={(e) =>
                          setCurrentVariant({
                            ...currentVariant,
                            storage: e.target.value || null,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">None</option>
                        {availableStorage.map((storage) => (
                          <option key={storage} value={storage}>
                            {storage}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentVariant.isDefault}
                        onChange={(e) =>
                          setCurrentVariant({
                            ...currentVariant,
                            isDefault: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm font-medium">Set as default variant</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowVariantForm(false)}
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveVariant}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {saving ? "Saving..." : "Save Variant"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}