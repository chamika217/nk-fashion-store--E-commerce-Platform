"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getCategories } from "@/lib/categoryService";
import { uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import type { Product, ProductVariant, Category } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: number;
  material: string;
  weight: number;
  category: string;
  subcategory: string;
  status: Product["status"];
  lowStockThreshold: number;
  images: string[];
  variants: ProductVariant[];
  totalStock: number;
}

interface ProductFormProps {
  initialProduct?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
}

const BLANK_VARIANT: ProductVariant = { size: "", color: "", stock: 0 };

function blankForm(): ProductFormData {
  return {
    name: "",
    sku: "",
    description: "",
    price: 0,
    material: "",
    weight: 0,
    category: "",
    subcategory: "",
    status: "active",
    lowStockThreshold: 3,
    images: [],
    variants: [{ ...BLANK_VARIANT }],
    totalStock: 0,
  };
}

function fromProduct(p: Product): ProductFormData {
  return {
    name: p.name,
    sku: p.sku,
    description: p.description,
    price: p.price,
    material: p.material,
    weight: p.weight,
    category: p.category,
    subcategory: p.subcategory,
    status: p.status,
    lowStockThreshold: p.lowStockThreshold ?? 3,
    images: p.images ?? [],
    variants: p.variants?.length ? p.variants : [{ ...BLANK_VARIANT }],
    totalStock: p.totalStock ?? 0,
  };
}

// ── Validation ───────────────────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  sku?: string;
  category?: string;
  price?: string;
  variants?: string;
}

function validate(form: ProductFormData): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim())     e.name     = "Name is required.";
  if (!form.sku.trim())      e.sku      = "SKU is required.";
  if (!form.category.trim()) e.category = "Category is required.";
  if (!form.price || form.price <= 0) e.price = "A valid price is required.";
  const hasVariant = form.variants.some(
    (v) => v.size.trim() || v.color.trim()
  );
  if (!hasVariant) e.variants = "Add at least one variant.";
  return e;
}

// ── Shared input style ────────────────────────────────────────────────────────
const inp =
  "w-full rounded-lg border border-gray-light px-3 py-2 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

// ── Component ────────────────────────────────────────────────────────────────

export default function ProductForm({
  initialProduct,
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(
    initialProduct ? fromProduct(initialProduct) : blankForm()
  );
  const [errors, setErrors]           = useState<FormErrors>({});
  const [categories, setCategories]   = useState<Category[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState<number[]>([]);
  const [uploadError, setUploadError]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Derived: subcategories for selected category
  const selectedCat = categories.find((c) => c.name === form.category);
  const subcategories = selectedCat?.subcategories ?? [];

  // Derived: totalStock = sum of variant stocks
  const totalStock = form.variants.reduce(
    (sum, v) => sum + (Number(v.stock) || 0),
    0
  );

  // ── Field helpers ─────────────────────────────────────────────────────────

  function setField<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleCategoryChange(cat: string) {
    setForm((prev) => ({ ...prev, category: cat, subcategory: "" }));
    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
  }

  // ── Variants ──────────────────────────────────────────────────────────────

  function updateVariant(idx: number, field: keyof ProductVariant, value: string | number) {
    setForm((prev) => {
      const variants = prev.variants.map((v, i) =>
        i === idx ? { ...v, [field]: field === "stock" ? Number(value) : value } : v
      );
      return { ...prev, variants };
    });
    if (errors.variants) setErrors((prev) => ({ ...prev, variants: undefined }));
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...BLANK_VARIANT }],
    }));
  }

  function removeVariant(idx: number) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError("");

    const startIdx = form.images.length;
    const indices  = files.map((_, i) => startIdx + i);
    setUploadingIdx((prev) => [...prev, ...indices]);

    const results = await Promise.allSettled(
      files.map((file) => uploadImageToCloudinary(file))
    );

    const urls: string[] = [];
    const failed: string[] = [];

    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        urls.push(r.value);
      } else {
        failed.push(files[i].name);
      }
    });

    if (failed.length) {
      setUploadError(
        `Failed to upload: ${failed.join(", ")}. Please try again.`
      );
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploadingIdx((prev) => prev.filter((i) => !indices.includes(i)));

    // reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(idx: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, totalStock });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const label = submitLabel ?? (initialProduct ? "Update Product" : "Add Product");
  const isUploading = uploadingIdx.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 max-w-3xl">

      {/* ── Basic Info ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
          Basic Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Name <span className="text-rose">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Product name"
              className={`${inp} ${errors.name ? "border-rose" : ""}`}
            />
            {errors.name && <p className="text-xs text-rose">{errors.name}</p>}
          </div>

          {/* SKU */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              SKU <span className="text-rose">*</span>
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setField("sku", e.target.value)}
              placeholder="NK-001"
              className={`${inp} ${errors.sku ? "border-rose" : ""}`}
            />
            {errors.sku && <p className="text-xs text-rose">{errors.sku}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-ink uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            placeholder="Product description…"
            className={`${inp} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Price (Rs.) <span className="text-rose">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => setField("price", Number(e.target.value))}
              placeholder="1500"
              className={`${inp} ${errors.price ? "border-rose" : ""}`}
            />
            {errors.price && <p className="text-xs text-rose">{errors.price}</p>}
          </div>

          {/* Material */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Material
            </label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => setField("material", e.target.value)}
              placeholder="Cotton"
              className={inp}
            />
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Weight (g)
            </label>
            <input
              type="number"
              min={0}
              value={form.weight || ""}
              onChange={(e) => setField("weight", Number(e.target.value))}
              placeholder="250"
              className={inp}
            />
          </div>
        </div>
      </section>

      {/* ── Category & Status ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
          Category & Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Category <span className="text-rose">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`${inp} ${errors.category ? "border-rose" : ""}`}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose">{errors.category}</p>
            )}
          </div>

          {/* Subcategory */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Subcategory
            </label>
            <select
              value={form.subcategory}
              onChange={(e) => setField("subcategory", e.target.value)}
              disabled={!subcategories.length}
              className={inp}
            >
              <option value="">Select subcategory…</option>
              {subcategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setField("status", e.target.value as Product["status"])
              }
              className={inp}
            >
              <option value="active">Active</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Low stock threshold */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min={0}
              value={form.lowStockThreshold}
              onChange={(e) =>
                setField("lowStockThreshold", Number(e.target.value))
              }
              className={inp}
            />
          </div>
        </div>
      </section>

      {/* ── Images ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
          Images
        </h2>

        {/* Thumbnail row */}
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative w-20 h-24 rounded-lg overflow-hidden border border-gray-light">
                <Image
                  src={url}
                  alt={`Product image ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-ink/70 text-ivory rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-rose transition-colors"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {/* Uploading spinner placeholders */}
            {uploadingIdx.map((i) => (
              <div
                key={`uploading-${i}`}
                className="w-20 h-24 rounded-lg border border-gray-light bg-gray-light flex items-center justify-center"
              >
                <span className="text-xs text-gray animate-pulse">…</span>
              </div>
            ))}
          </div>
        )}

        {/* Upload input */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="text-sm text-gray file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-ink file:text-ivory hover:file:bg-rose file:transition-colors cursor-pointer"
          />
          {isUploading && (
            <p className="text-xs text-gray mt-1 animate-pulse">
              Uploading images…
            </p>
          )}
          {uploadError && (
            <p className="text-xs text-rose mt-1">{uploadError}</p>
          )}
        </div>
      </section>

      {/* ── Variants ── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider border-b border-gray-light pb-2">
          Variants
        </h2>

        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_100px_36px] gap-2 text-xs font-semibold text-gray uppercase tracking-wider px-1">
            <span>Size</span>
            <span>Color</span>
            <span>Stock</span>
            <span />
          </div>

          {form.variants.map((variant, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_100px_36px] gap-2 items-start"
            >
              <input
                type="text"
                value={variant.size}
                onChange={(e) => updateVariant(idx, "size", e.target.value)}
                placeholder="S / M / L…"
                className={inp}
              />
              <input
                type="text"
                value={variant.color}
                onChange={(e) => updateVariant(idx, "color", e.target.value)}
                placeholder="Black, Red…"
                className={inp}
              />
              <input
                type="number"
                min={0}
                value={variant.stock === 0 ? "" : variant.stock}
                onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                placeholder="0"
                className={inp}
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                disabled={form.variants.length === 1}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-light text-gray hover:border-rose hover:text-rose transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Remove variant"
              >
                ×
              </button>
            </div>
          ))}

          {errors.variants && (
            <p className="text-xs text-rose">{errors.variants}</p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={addVariant}
              className="text-xs text-ink border border-gray-light rounded-full px-4 py-1.5 hover:border-rose hover:text-rose transition-colors"
            >
              + Add Variant
            </button>
            <p className="text-xs text-gray">
              Total Stock:{" "}
              <span className="font-semibold text-ink">{totalStock}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || isUploading}
          className="w-full sm:w-auto sm:px-12 bg-ink text-ivory text-sm font-medium py-3 rounded-full hover:bg-rose transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving…" : label}
        </button>
        {submitError && (
          <p className="text-xs text-rose">{submitError}</p>
        )}
      </div>
    </form>
  );
}
