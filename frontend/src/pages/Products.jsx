import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", price: "" });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.name, price: Number(form.price) };
      if (form.id) {
        await api.put(`/products/${form.id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product added");
      }
      setForm({ id: null, name: "", price: "" });
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save product");
    }
  };

  const edit = (p) =>
    setForm({ id: p.id, name: p.name, price: String(p.price) });

  const remove = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Products</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add, edit, or remove café products (name and price).
        </p>
      </div>

      <form
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-4"
        onSubmit={submit}
      >
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Product name</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="e.g. Energy drink"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-slate-600">Price (Rs)</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
        </div>
        <button
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
          type="submit"
        >
          {form.id ? "Update" : "Add"} Product
        </button>
        {form.id && (
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
            onClick={() => setForm({ id: null, name: "", price: "" })}
          >
            Cancel edit
          </button>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Price (Rs)</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-slate-500">
                  No products yet. Add one above.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                  <td className="px-3 py-2">{Number(p.price).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <button
                      className="mr-2 rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
                      type="button"
                      onClick={() => edit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-600"
                      type="button"
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
