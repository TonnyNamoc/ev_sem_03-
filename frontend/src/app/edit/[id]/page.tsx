"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  stock: number | string;
  image_url: string | null;
};

export default function EditProduct() {
  // 👇 obtener id desde la URL en un componente cliente
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Product>({
    id: Number(id),
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // safety en el primer render
    (async () => {
      const res = await fetch(`${API_URL}/api/products/${id}`, { cache: "no-store" });
      if (!res.ok) { setErr(`No se pudo cargar (${res.status})`); setLoading(false); return; }
      const p: Product = await res.json();
      setForm({
        id: Number(id),
        name: p.name,
        description: p.description ?? "",
        price: String(p.price),
        stock: String(p.stock),
        image_url: p.image_url ?? "",
      });
      setLoading(false);
    })();
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name ?? "");
      fd.append("description", form.description ?? "");
      if (form.price !== "" && form.price != null) fd.append("price", String(form.price));
      if (form.stock !== "" && form.stock != null) fd.append("stock", String(form.stock));
      if (file) fd.append("image", file);

      const res = await fetch(`${API_URL}/api/products/${id}`, { method: "PUT", body: fd });
      if (!res.ok) throw new Error(await res.text());
      router.push("/");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  const preview = file ? URL.createObjectURL(file) : (form.image_url || "");

  if (loading) return <main className="p-6">Cargando…</main>;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar producto</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded-xl p-2"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <textarea
          className="w-full border rounded-xl p-2"
          placeholder="Descripción"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Precio"
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          required
        />

        {/* 👇 Subida de archivo (reemplaza la imagen actual si se elige una nueva) */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {/* Vista previa: si eliges archivo, muestra el nuevo; si no, la actual */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-2 h-40 w-full object-cover rounded-xl"
          />
        )}

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <div className="flex gap-2">
          <button
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-white/10 border disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <a href="/" className="px-4 py-2 rounded-xl border">
            Cancelar
          </a>
        </div>
      </form>
    </main>
  );
}
