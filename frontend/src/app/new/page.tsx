"use client";
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const [form, setForm] = useState({ name:"", description:"", price:"", stock:"", image_url:"" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      let res: Response;

      if (file) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("stock", form.stock);
        fd.append("image", file); // 👈 campo del upload.single("image")
        res = await fetch(`${API_URL}/api/products`, { method: "POST", body: fd });
      } else {
        const payload: any = {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
        };
        if (form.image_url.trim() !== "") payload.image_url = form.image_url.trim();
        res = await fetch(`${API_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(await res.text());
      router.push("/");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const preview = file ? URL.createObjectURL(file) : form.image_url || "";

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo producto</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded-xl p-2" placeholder="Nombre"
          value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <textarea className="w-full border rounded-xl p-2" placeholder="Descripción"
          value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <input className="w-full border rounded-xl p-2" placeholder="Precio" type="number" step="0.01"
          value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required />
        <input className="w-full border rounded-xl p-2" placeholder="Stock" type="number"
          value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} required />

        {/* Opción A: URL directa */}
        <input className="w-full border rounded-xl p-2" placeholder="Imagen (URL opcional)"
          value={form.image_url} onChange={e=>{ setForm({...form, image_url:e.target.value}); setFile(null); }} />

        {/* Opción B: Subida de archivo */}
        <input type="file" accept="image/*"
          onChange={e => { setFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setForm({...form, image_url:""}); }} />

        {preview && <img src={preview} alt="preview" className="mt-2 h-40 w-full object-cover rounded-xl" />}

        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex gap-2">
          <button disabled={loading} className="px-4 py-2 rounded-xl bg-white/10 border">
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <a href="/" className="px-4 py-2 rounded-xl border">Cancelar</a>
        </div>
      </form>
    </main>
  );
}
