"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchJSON } from "@/lib/api"; // si usas alias "@/"; si no: "../lib/api"
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
  image_url: string | null;
};

type Summary = {
  total_products: number;
  total_stock: number;
  added_today: number;
};

type AddedToday = { name: string; count: number };

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [addedToday, setAddedToday] = useState<AddedToday[]>([]);

  // Cargar productos + métricas
  useEffect(() => {
    (async () => {
      const [prods, sum, at] = await Promise.all([
        fetchJSON<Product[]>("/api/products"),
        fetchJSON<Summary>("/api/metrics/summary"),
        fetchJSON<AddedToday[]>("/api/metrics/added-today"),
      ]);
      setProducts(prods);
      setSummary(sum);
      setAddedToday(at);
    })().catch((e) => console.error(e));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      alert(`Error eliminando el producto (${res.status}) ${body}`);
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    // refrescamos métricas
    const sum = await fetchJSON<Summary>("/api/metrics/summary").catch(() => null);
    const at  = await fetchJSON<AddedToday[]>("/api/metrics/added-today").catch(() => []);
    if (sum) setSummary(sum);
    setAddedToday(at);
    router.refresh();
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>

      <a
        href="/new"
        className="inline-block mb-4 px-4 py-2 rounded-lg border hover:bg-gray-50"
      >
        + Nuevo producto
      </a>

      {/* GRID de productos */}
      <div className="grid md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl border p-4">
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full h-40 object-cover rounded-xl mb-2"
              />
            )}

            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">{p.description}</div>
            <div className="mt-2">
              S/ {Number(p.price).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm">Stock: {Number(p.stock)}</div>

            <div className="mt-3 flex gap-2">
              <a
                href={`/edit/${p.id}`}
                className="px-3 py-1 rounded-lg border text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <i className="bi bi-box-arrow-in-down"></i>
                Editar
              </a>

              <button
                onClick={() => handleDelete(p.id)}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm flex items-center gap-2 hover:bg-red-700 transition-colors"
              >
                <i className="bi bi-archive"></i>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DASHBOARD: cards + chart */}
      <section className="mt-10">
        {/* CARDS */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 grid place-items-center">
              <i className="bi bi-box"></i>
            </div>
            <div>
              <div className="text-sm text-gray-500">Productos</div>
              <div className="text-xl font-semibold">{summary?.total_products ?? 0}</div>
            </div>
          </div>

          <div className="rounded-2xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-600 grid place-items-center">
              <i className="bi bi-stack"></i>
            </div>
            <div>
              <div className="text-sm text-gray-500">Stock total</div>
              <div className="text-xl font-semibold">{summary?.total_stock ?? 0}</div>
            </div>
          </div>

          <div className="rounded-2xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600/10 text-orange-600 grid place-items-center">
              <i className="bi bi-plus-square"></i>
            </div>
            <div>
              <div className="text-sm text-gray-500">Agregados hoy</div>
              <div className="text-xl font-semibold">{summary?.added_today ?? 0}</div>
            </div>
          </div>
        </div>

        {/* CHART: añadidos hoy por nombre */}
        <div className="rounded-2xl border p-4">
          <div className="font-semibold mb-2">Productos añadidos HOY por nombre</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={addedToday} barSize={38}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
}
