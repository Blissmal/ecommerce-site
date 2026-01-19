// app/admin/products/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "../../../../../../../lib/product.action";
import { generateVariantSKU } from "../../../../../../../lib/utils/variant-utils";
import { toast } from "react-hot-toast";
import { getAllCategories } from "../../../../../../../lib/category.actions";

interface Variant {
  id: string; // Temporary ID for form management
  sku: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
  storage?: string;
  images: string[];
  weight?: number;
  isDefault: boolean;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Product basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dbCategories, setDbCategories] = useState<{id: string, name: string}[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      // Replace with your actual fetch logic or server action
      const data = await getAllCategories(); 
      setDbCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };
  fetchCategories();
}, []);
  
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
  
  // Current variant being edited
  const [currentVariant, setCurrentVariant] = useState<Variant>({
    id: "",
    sku: "",
    price: 0,
    stock: 0,
    color: "",
    size: "",
    storage: "",
    images: [],
    weight: 0,
    isDefault: false,
  });

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

  // ==================== VARIANT MANAGEMENT ====================

  const openVariantForm = () => {
    setCurrentVariant({
      id: `temp-${Date.now()}`,
      sku: generateVariantSKU(productSku, {
        color: "",
        size: "",
        storage: "",
      }),
      price: 0,
      stock: 0,
      color: availableColors[0] || "",
      size: availableSizes[0] || "",
      storage: availableStorage[0] || "",
      images: [],
      weight: weight ? parseFloat(weight) : undefined,
      isDefault: variants.length === 0, // First variant is default
    });
    setShowVariantForm(true);
  };

  const saveVariant = () => {
    // Validate
    if (!currentVariant.price || currentVariant.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!currentVariant.stock || currentVariant.stock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    // Generate SKU if not manually set
    if (!currentVariant.sku) {
      currentVariant.sku = generateVariantSKU(productSku, {
        color: currentVariant.color,
        size: currentVariant.size,
        storage: currentVariant.storage,
      });
    }

    // Check for duplicate
    const duplicate = variants.find(
      (v) =>
        v.id !== currentVariant.id &&
        v.color === currentVariant.color &&
        v.size === currentVariant.size &&
        v.storage === currentVariant.storage
    );

    if (duplicate) {
      toast.error("A variant with this combination already exists");
      return;
    }

    // If this is set as default, unset others
    if (currentVariant.isDefault) {
      setVariants(
        variants.map((v) =>
          v.id === currentVariant.id ? currentVariant : { ...v, isDefault: false }
        )
      );
    }

    // Add or update
    const existingIndex = variants.findIndex((v) => v.id === currentVariant.id);
    if (existingIndex >= 0) {
      const newVariants = [...variants];
      newVariants[existingIndex] = currentVariant;
      setVariants(newVariants);
    } else {
      setVariants([...variants, currentVariant]);
    }

    setShowVariantForm(false);
    toast.success("Variant saved");
  };

  const editVariant = (variant: Variant) => {
    setCurrentVariant(variant);
    setShowVariantForm(true);
  };

  const deleteVariant = (id: string) => {
    if (variants.length === 1) {
      toast.error("Product must have at least one variant");
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
    toast.success("Variant removed");
  };

  const autoGenerateVariants = () => {
    if (variants.length > 0) {
      const confirm = window.confirm(
        "This will replace existing variants. Continue?"
      );
      if (!confirm) return;
    }

    const newVariants: Variant[] = [];
    let variantIndex = 0;

    // Generate all combinations
    const colors = availableColors.length > 0 ? availableColors : [""];
    const sizes = availableSizes.length > 0 ? availableSizes : [""];
    const storages = availableStorage.length > 0 ? availableStorage : [""];

    colors.forEach((color) => {
      sizes.forEach((size) => {
        storages.forEach((storage) => {
          const sku = generateVariantSKU(productSku, {
            color: color || undefined,
            size: size || undefined,
            storage: storage || undefined,
          });

          newVariants.push({
            id: `temp-${Date.now()}-${variantIndex++}`,
            sku,
            price: 0, // User must set
            stock: 0, // User must set
            color: color || undefined,
            size: size || undefined,
            storage: storage || undefined,
            images: [],
            weight: weight ? parseFloat(weight) : undefined,
            isDefault: variantIndex === 1, // First is default
          });
        });
      });
    });

    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants`);
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || !description || !imageUrl || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    // Check if all variants have price and stock
    const incompleteVariants = variants.filter((v) => !v.price || v.stock === undefined);
    if (incompleteVariants.length > 0) {
      toast.error("All variants must have price and stock");
      return;
    }

    setLoading(true);

    try {
      // Prepare variants data (remove temporary IDs)
      const variantsData = variants.map((v) => ({
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        color: v.color || undefined,
        size: v.size || undefined,
        storage: v.storage || undefined,
        images: v.images,
        weight: v.weight,
        isDefault: v.isDefault,
      }));

      const result = await addProduct({
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
        variants: variantsData,
        discount: discount ? parseFloat(discount) : undefined,
      });

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

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
  {dbCategories.map((cat) => (
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
                placeholder="e.g., IP14"
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
              placeholder="Brief one-liner"
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

        {/* Available Options */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Options (for Variants)</h2>

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
                  placeholder="Blue"
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
                  placeholder="10"
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
                  placeholder="128GB"
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
              Variants <span className="text-red-500">*</span>
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={autoGenerateVariants}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Auto-Generate All Combinations
              </button>
              <button
                type="button"
                onClick={openVariantForm}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add Variant Manually
              </button>
            </div>
          </div>

          {/* Variants List */}
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
                      <td className="border px-4 py-2">
                        ${variant.price.toFixed(2)}
                      </td>
                      <td className="border px-4 py-2">{variant.stock}</td>
                      <td className="border px-4 py-2">
                        {variant.isDefault ? "✓" : ""}
                      </td>
                      <td className="border px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editVariant(variant)}
                            className="text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVariant(variant.id)}
                            className="text-red-500 hover:underline"
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
              No variants added yet. Click "Add Variant" or "Auto-Generate" to create variants.
            </p>
          )}

          {/* Variant Form Modal */}
          {showVariantForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {currentVariant.id.startsWith("temp-") ? "Add Variant" : "Edit Variant"}
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
                            color: e.target.value || undefined,
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
                            size: e.target.value || undefined,
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
                            storage: e.target.value || undefined,
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
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save Variant
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
            onClick={() => router.back()}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}