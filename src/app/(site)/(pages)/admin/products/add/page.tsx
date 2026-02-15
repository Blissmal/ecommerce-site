// app/admin/products/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/Common/ImageUpload";
import { addProduct } from "@/lib/product.action";
import { generateVariantSKU } from "@/lib/utils/variant-utils";
import { getAllCategories } from "@/lib/category.actions";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Variant {
  id: string; // Temp ID
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
  
  // Product Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [productSku, setProductSku] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountExpiry, setDiscountExpiry] = useState("");
  
  // Physical & Meta
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  
  // Media
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  // const [imageInput, setImageInput] = useState("");
  
  // Attributes (Restored)
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Options (Colors/Sizes/Storage)
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [availableStorage, setAvailableStorage] = useState<string[]>([]);
  const [storageInput, setStorageInput] = useState("");
  
  // Specs
  const [specifications, setSpecifications] = useState<any>({});
  const [specSection, setSpecSection] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // Variants & Categories
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  // Current Variant (Temp)
  const [currentVariant, setCurrentVariant] = useState<Variant>({
    id: "", sku: "", price: 0, stock: 0, color: "", size: "", storage: "", images: [], weight: 0, isDefault: false,
  });

  useEffect(() => {
    async function loadCats() {
      try { const data = await getAllCategories(); setCategories(data); } 
      catch (e) { toast.error("Failed to load categories"); }
    }
    loadCats();
  }, []);

  // ==================== HANDLERS ====================

  // const addImage = () => { if (imageInput.trim()) { setImages([...images, imageInput.trim()]); setImageInput(""); } };
  // const removeImage = (index: number) => { setImages(images.filter((_, i) => i !== index)); };
  
  // Attributes Handlers (Restored)
  const addFeature = () => { if (featureInput.trim()) { setFeatures([...features, featureInput.trim()]); setFeatureInput(""); } };
  const removeFeature = (index: number) => { setFeatures(features.filter((_, i) => i !== index)); };
  
  const addTag = () => { if (tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };
  const removeTag = (index: number) => { setTags(tags.filter((_, i) => i !== index)); };

  // Options Handlers
  const addColor = () => { if (colorInput.trim() && !availableColors.includes(colorInput.trim())) { setAvailableColors([...availableColors, colorInput.trim()]); setColorInput(""); } };
  const removeColor = (color: string) => { setAvailableColors(availableColors.filter((c) => c !== color)); };
  
  const addSize = () => { if (sizeInput.trim() && !availableSizes.includes(sizeInput.trim())) { setAvailableSizes([...availableSizes, sizeInput.trim()]); setSizeInput(""); } };
  const removeSize = (size: string) => { setAvailableSizes(availableSizes.filter((s) => s !== size)); };
  
  const addStorage = () => { if (storageInput.trim() && !availableStorage.includes(storageInput.trim())) { setAvailableStorage([...availableStorage, storageInput.trim()]); setStorageInput(""); } };
  const removeStorage = (storage: string) => { setAvailableStorage(availableStorage.filter((s) => s !== storage)); };

  const addSpecification = () => { if (specSection.trim() && specKey.trim() && specValue.trim()) { setSpecifications({ ...specifications, [specSection]: { ...(specifications[specSection] || {}), [specKey]: specValue, }, }); setSpecKey(""); setSpecValue(""); } };
  const removeSpecSection = (section: string) => { const newSpecs = { ...specifications }; delete newSpecs[section]; setSpecifications(newSpecs); };

  // ==================== VARIANT LOGIC ====================

  const autoGenerateVariants = () => {
    if (variants.length > 0 && !confirm("This will replace existing variants. Continue?")) return;
    
    const newVariants: Variant[] = [];
    const colors = availableColors.length ? availableColors : [""];
    const sizes = availableSizes.length ? availableSizes : [""];
    const storages = availableStorage.length ? availableStorage : [""];
    
    let idx = 0;
    colors.forEach(c => {
      sizes.forEach(s => {
        storages.forEach(st => {
          newVariants.push({
            id: `temp-${Date.now()}-${idx}`,
            sku: generateVariantSKU(productSku, { color: c || undefined, size: s || undefined, storage: st || undefined }),
            price: 0, stock: 0,
            color: c || undefined, size: s || undefined, storage: st || undefined,
            images: [], weight: weight ? parseFloat(weight) : 0, isDefault: idx === 0
          });
          idx++;
        });
      });
    });
    setVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants template`);
  };

  const openVariantForm = (v?: Variant) => {
    if (v) {
      setCurrentVariant(v);
    } else {
      setCurrentVariant({
        id: `temp-${Date.now()}`,
        sku: generateVariantSKU(productSku, {}),
        price: 0, stock: 0, color: "", size: "", storage: "", images: [], weight: weight ? parseFloat(weight) : 0, isDefault: variants.length === 0
      });
    }
    setShowVariantForm(true);
  };

  const saveVariant = () => {
    if (!currentVariant.price || currentVariant.price <= 0) { toast.error("Invalid price"); return; }
    if (currentVariant.stock < 0) { toast.error("Invalid stock"); return; }
    
    const exists = variants.findIndex(v => v.id === currentVariant.id);
    if (exists >= 0) {
      const updated = [...variants];
      updated[exists] = currentVariant;
      setVariants(updated);
    } else {
      setVariants([...variants, currentVariant]);
    }
    setShowVariantForm(false);
    toast.success("Variant saved locally");
  };

  const deleteVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
    toast.success("Variant removed");
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imageUrl || !categoryId) { toast.error("Missing required fields"); return; }
    if (variants.length === 0) { toast.error("Add at least one variant"); return; }
    
    setLoading(true);
    try {
      await addProduct({
        title, description, shortDescription: shortDescription || undefined, categoryId,
        brand: brand || undefined, model: model || undefined, sku: productSku || undefined,
        imageUrl, images, 
        features, tags, weight: weight ? parseFloat(weight) : undefined, dimensions: dimensions || undefined,
        specifications: Object.keys(specifications).length ? specifications : undefined,
        availableColors, availableSizes, availableStorage,
        discount: discount ? parseFloat(discount) : undefined,
        discountExpiry: discountExpiry ? new Date(discountExpiry) : undefined,
        variants: variants.map(v => ({ ...v, color: v.color || undefined, size: v.size || undefined, storage: v.storage || undefined }))
      });
      toast.success("Product created!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const inputStyle = "w-full p-3 bg-gray-1 border border-gray-3 rounded-lg text-custom-sm font-medium text-dark focus:ring-1 focus:ring-blue outline-none transition-all";
  const labelStyle = "block text-2xs font-bold uppercase tracking-wider text-dark-5 mb-2";
  const cardStyle = "bg-white p-6 rounded-xl border border-gray-3 shadow-1";

  return (
    <div className="min-h-screen bg-meta p-6 font-euclid-circular-a">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <div className="text-custom-sm font-bold text-dark-5 mb-1 uppercase tracking-widest">Creator</div>
            <h1 className="text-heading-4 font-bold text-dark">Add New Product</h1>
          </div>
          <Link href="/admin/products" className="px-5 py-2.5 bg-gray-2 hover:bg-gray-3 text-dark font-bold rounded-lg transition-colors text-custom-sm">
            &larr; Cancel
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* General Info */}
            <section className={cardStyle}>
              <h2 className="text-heading-6 font-bold text-dark mb-6">General Information</h2>
              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Title <span className="text-red">*</span></label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyle} required placeholder="e.g. iPhone 15 Pro" />
                </div>
                <div>
                  <label className={labelStyle}>Description <span className="text-red">*</span></label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyle} rows={6} required placeholder="Detailed product description..." />
                </div>
                <div>
                  <label className={labelStyle}>Short Description</label>
                  <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputStyle} placeholder="Brief summary for cards..." />
                </div>
              </div>
            </section>

             {/* Attributes & Features (Restored) */}
             <section className={cardStyle}>
              <h2 className="text-heading-6 font-bold text-dark mb-6">Attributes & Tags</h2>
              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Key Features</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className={inputStyle} placeholder="e.g. Waterproof" />
                    <button type="button" onClick={addFeature} className="px-4 bg-gray-2 rounded-lg font-bold hover:bg-gray-3 transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-light-6 text-blue-dark border border-blue-light-4 rounded-lg text-custom-xs font-bold flex items-center gap-2">
                        {f} <button type="button" onClick={() => removeFeature(i)} className="hover:text-red">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Search Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} className={inputStyle} placeholder="e.g. Summer2024" />
                    <button type="button" onClick={addTag} className="px-4 bg-gray-2 rounded-lg font-bold hover:bg-gray-3 transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-1 border border-gray-3 rounded-lg text-custom-xs font-medium flex items-center gap-2">
                        #{t} <button type="button" onClick={() => removeTag(i)} className="hover:text-red">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Variants Module */}
            <section className={cardStyle}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-heading-6 font-bold text-dark">Variants</h2>
                  <p className="text-custom-xs text-body mt-1">Define SKU, price, and stock for each combination.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={autoGenerateVariants} className="px-4 py-2 bg-purple-light-6 text-purple-dark border border-purple-light-4 rounded-lg font-bold text-2xs uppercase tracking-wider hover:bg-purple-light-5 transition-all">
                    Auto-Generate
                  </button>
                  <button type="button" onClick={() => openVariantForm()} className="px-4 py-2 bg-green-light-6 text-green-dark border border-green-light-4 rounded-lg font-bold text-2xs uppercase tracking-wider hover:bg-green-light-5 transition-all">
                    + Manual Add
                  </button>
                </div>
              </div>
              
              {variants.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-2">
                  <table className="w-full">
                    <thead className="bg-gray-1 border-b border-gray-2">
                      <tr>
                        <th className="px-4 py-3 text-left text-2xs font-bold text-dark-5 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-2xs font-bold text-dark-5 uppercase">Config</th>
                        <th className="px-4 py-3 text-left text-2xs font-bold text-dark-5 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-2xs font-bold text-dark-5 uppercase">Stock</th>
                        <th className="px-4 py-3 text-right text-2xs font-bold text-dark-5 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-2">
                      {variants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-gray-1/50 transition-colors">
                          <td className="px-4 py-3 text-custom-sm font-medium text-dark">{variant.sku}</td>
                          <td className="px-4 py-3 text-custom-xs text-body">
                            {[variant.color, variant.size, variant.storage].filter(Boolean).join(" / ") || "Standard"}
                          </td>
                          <td className="px-4 py-3 text-custom-sm font-bold text-dark">
                            {variant.price > 0 ? `KES ${variant.price}` : <span className="text-red text-2xs uppercase">Set Price</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`${variant.stock <= 5 ? 'text-red font-bold' : 'text-body'}`}>{variant.stock}</span>
                            {variant.isDefault && <span className="ml-2 text-2xs bg-blue-light-6 text-blue-dark px-1.5 py-0.5 rounded">Default</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => openVariantForm(variant)} className="text-blue hover:text-blue-dark font-bold text-2xs uppercase mr-3">Edit</button>
                            <button type="button" onClick={() => deleteVariant(variant.id)} className="text-red hover:text-red-dark font-bold text-2xs uppercase">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-1 rounded-lg p-8 text-center border border-dashed border-gray-3">
                  <p className="text-custom-sm font-bold text-dark-5">No variants added.</p>
                  <p className="text-custom-xs text-body mt-1">Use "Auto-Generate" after adding options on the right, or add manually.</p>
                </div>
              )}
            </section>

            {/* Specifications */}
            <section className={cardStyle}>
              <h2 className="text-heading-6 font-bold text-dark mb-6">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-1 p-4 rounded-xl">
                <input type="text" value={specSection} onChange={(e) => setSpecSection(e.target.value)} className={inputStyle} placeholder="Section" />
                <input type="text" value={specKey} onChange={(e) => setSpecKey(e.target.value)} className={inputStyle} placeholder="Label" />
                <div className="flex gap-2">
                  <input type="text" value={specValue} onChange={(e) => setSpecValue(e.target.value)} className={inputStyle} placeholder="Value" />
                  <button type="button" onClick={addSpecification} className="px-4 bg-blue text-white rounded-lg font-bold">Add</button>
                </div>
              </div>
              
              {Object.entries(specifications).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(specifications).map(([section, specs]) => (
                    <div key={section} className="border border-gray-2 rounded-xl overflow-hidden">
                      <div className="bg-gray-1 px-4 py-2 border-b border-gray-2 flex justify-between items-center">
                        <span className="font-bold text-custom-sm text-dark">{section}</span>
                        <button type="button" onClick={() => removeSpecSection(section)} className="text-red text-2xs font-bold uppercase">Remove</button>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                         {typeof specs === 'object' && Object.entries(specs as Record<string, string>).map(([k, v]) => (
                           <div key={k} className="flex justify-between text-custom-sm border-b border-gray-1 pb-1 last:border-0">
                             <span className="text-dark-5">{k}:</span>
                             <span className="font-medium text-dark">{v}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="space-y-8">
            
            {/* Publish Actions */}
            <div className={cardStyle}>
  <button 
    type="submit" 
    disabled={loading} 
    className="w-full py-4 bg-blue text-white rounded-xl font-bold shadow-2 hover:bg-blue-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-3 flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Creating...
      </>
    ) : "Create Product"}
  </button>

  <button type="button" onClick={() => router.push("/admin/products")} className="w-full py-3 bg-gray-1 text-dark rounded-xl font-bold hover:bg-gray-2 transition-all">
    Discard Draft
  </button>
</div>

            {/* Organization */}
            <section className={cardStyle}>
              <h2 className="text-custom-lg font-bold text-dark mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Category <span className="text-red">*</span></label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputStyle} required>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Brand</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Model</label>
                  <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>Master SKU</label>
                  <input type="text" value={productSku} onChange={(e) => setProductSku(e.target.value)} className={inputStyle} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Weight (kg)</label>
                    <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Dimensions</label>
                    <input type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)} className={inputStyle} placeholder="LxWxH" />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Discount (%)</label>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputStyle} />
                </div>
                <div>
  <label className={labelStyle}>Discount Expiry Date</label>
  <input 
    type="datetime-local" 
    value={discountExpiry} 
    onChange={(e) => setDiscountExpiry(e.target.value)} 
    className={inputStyle} 
  />
  <p className="text-[10px] text-dark-5 mt-1">Leave blank for no expiry.</p>
</div>
              </div>
            </section>

            {/* Media */}
            <section className={cardStyle}>
              <h2 className="text-custom-lg font-bold text-dark mb-4">Media</h2>
              <div className="space-y-6">
                
                {/* Main Product Image (Single) */}
                <div>
                  <label className={labelStyle}>Main Image <span className="text-red">*</span></label>
                  <ImageUpload
                    id="main-product-image"
                    value={imageUrl ? [imageUrl] : []}
                    onChange={(urls) => setImageUrl(urls[0] || "")}
                    maxImages={1}
                  />
                  <p className="text-[10px] text-dark-5 mt-2 italic">
                    This is the primary image shown in search results and thumbnails.
                  </p>
                </div>
            
                <hr className="border-gray-2" />
            
                {/* Additional Product Images (Gallery) */}
                <div>
                  <label className={labelStyle}>Gallery Images</label>
                  <ImageUpload
                    id="product-gallery"
                    value={images}
                    onChange={(urls) => setImages(urls)}
                    maxImages={10}
                  />
                </div>
              </div>
            </section>

            {/* Options Management */}
            <section className={cardStyle}>
              <h2 className="text-custom-lg font-bold text-dark mb-4">Define Options</h2>
              <p className="text-xs text-body mb-4">Add options here first. These save to the product and populate the variant generator.</p>
              
              <div className="mb-4">
                <label className={labelStyle}>Colors</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className={inputStyle} placeholder="e.g. Red" />
                  <button type="button" onClick={addColor} className="px-3 bg-gray-2 rounded-lg font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(c => <span key={c} onClick={() => removeColor(c)} className="px-2 py-1 bg-blue-light-6 text-blue-dark border border-blue-light-4 rounded text-xs cursor-pointer hover:bg-red-light-6 hover:text-red">{c}</span>)}
                </div>
              </div>
              
              <div className="mb-4">
                <label className={labelStyle}>Sizes</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} className={inputStyle} placeholder="e.g. XL" />
                  <button type="button" onClick={addSize} className="px-3 bg-gray-2 rounded-lg font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(s => <span key={s} onClick={() => removeSize(s)} className="px-2 py-1 bg-green-light-6 text-green-dark border border-green-light-4 rounded text-xs cursor-pointer hover:bg-red-light-6 hover:text-red">{s}</span>)}
                </div>
              </div>

               <div className="mb-4">
                <label className={labelStyle}>Storage</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={storageInput} onChange={(e) => setStorageInput(e.target.value)} className={inputStyle} placeholder="e.g. 256GB" />
                  <button type="button" onClick={addStorage} className="px-3 bg-gray-2 rounded-lg font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableStorage.map(s => <span key={s} onClick={() => removeStorage(s)} className="px-2 py-1 bg-purple-light-6 text-purple-dark border border-purple-light-4 rounded text-xs cursor-pointer hover:bg-red-light-6 hover:text-red">{s}</span>)}
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* VARIANT MODAL */}
        {showVariantForm && currentVariant && (
          <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2 border border-gray-3 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-8 py-6 border-b border-gray-2 bg-gray-1 flex justify-between items-center">
                <h3 className="text-heading-6 font-bold text-dark">{currentVariant.id.startsWith('temp-') ? "Add Variant" : "Edit Variant"}</h3>
                <button onClick={() => setShowVariantForm(false)} className="text-2xl text-dark-5 hover:text-dark">×</button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>SKU</label>
                    <input type="text" value={currentVariant.sku} onChange={(e) => setCurrentVariant({ ...currentVariant, sku: e.target.value })} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Price (KES) <span className="text-red">*</span></label>
                    <input type="number" step="0.01" value={currentVariant.price} onChange={(e) => setCurrentVariant({ ...currentVariant, price: parseFloat(e.target.value) || 0 })} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Stock <span className="text-red">*</span></label>
                    <input type="number" value={currentVariant.stock} onChange={(e) => setCurrentVariant({ ...currentVariant, stock: parseInt(e.target.value) || 0 })} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Color</label>
                    <select value={currentVariant.color || ""} onChange={(e) => setCurrentVariant({ ...currentVariant, color: e.target.value || null })} className={inputStyle}>
                      <option value="">None</option>
                      {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Size</label>
                    <select value={currentVariant.size || ""} onChange={(e) => setCurrentVariant({ ...currentVariant, size: e.target.value || null })} className={inputStyle}>
                      <option value="">None</option>
                      {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Storage</label>
                    <select value={currentVariant.storage || ""} onChange={(e) => setCurrentVariant({ ...currentVariant, storage: e.target.value || null })} className={inputStyle}>
                      <option value="">None</option>
                      {availableStorage.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="border-t border-gray-2 pt-6">
                    <label className={labelStyle}>Variant Specific Images</label>
                    <ImageUpload
                      id={`variant-upload-${currentVariant.id || 'new'}`}
                      value={currentVariant.images || []}
                      onChange={(urls) => setCurrentVariant({ ...currentVariant, images: urls })}
                      maxImages={4}
                    />
                    <p className="text-[10px] text-dark-5 mt-2">
                      Upload images specific to this color/size (e.g., the red version of the phone).
                    </p>
                  </div>
                <div className="flex items-center gap-3 p-4 bg-gray-1 rounded-xl">
                  <input type="checkbox" checked={currentVariant.isDefault} onChange={(e) => setCurrentVariant({ ...currentVariant, isDefault: e.target.checked })} className="w-5 h-5 rounded text-blue" />
                  <span className="font-bold text-dark text-custom-sm">Set as Default Variant</span>
                </div>
              </div>

              <div className="p-6 border-t border-gray-2 bg-white flex justify-end gap-3">
                <button type="button" onClick={() => setShowVariantForm(false)} className="px-6 py-3 bg-gray-2 text-dark font-bold rounded-xl hover:bg-gray-3 transition-all">Cancel</button>
                <button type="button" onClick={saveVariant} className="px-6 py-3 bg-blue text-white font-bold rounded-xl shadow-2 hover:bg-blue-dark transition-all">
                  Save Variant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}