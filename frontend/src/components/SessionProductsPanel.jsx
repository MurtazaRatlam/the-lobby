import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const SessionProductsPanel = ({ sessionId, lines = [], products = [], onChanged }) => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const addProduct = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Select a product");
      return;
    }
    try {
      await api.post(`/sessions/${sessionId}/products`, {
        productId: Number(productId),
        quantity: Math.max(1, Number(quantity) || 1)
      });
      toast.success("Product added to session");
      setQuantity(1);
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add product");
    }
  };

  const removeLine = async (lineId) => {
    try {
      await api.delete(`/sessions/${sessionId}/products/${lineId}`);
      toast.success("Removed from session");
      onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove");
    }
  };

  const productsTotal = lines.reduce((s, l) => s + Number(l.lineTotal || 0), 0);

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">Session products</p>
      <p className="mb-3 text-xs text-slate-600">
        Add items for this customer. Totals are included when the session ends.
      </p>

      {lines.length > 0 ? (
        <ul className="mb-3 space-y-2 text-sm">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="text-slate-800">
                {line.product?.name ?? "Product"} × {line.quantity}{" "}
                <span className="text-slate-500">
                  @ Rs {Number(line.unitPrice).toFixed(2)} = Rs {Number(line.lineTotal).toFixed(2)}
                </span>
              </span>
              <button
                type="button"
                className="shrink-0 rounded border border-rose-200 px-2 py-0.5 text-xs text-rose-600 hover:bg-rose-50"
                onClick={() => removeLine(line.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-xs text-slate-500">No products added yet.</p>
      )}

      <div className="mb-2 flex justify-between text-sm font-medium text-slate-700">
        <span>Products subtotal</span>
        <span>Rs {productsTotal.toFixed(2)}</span>
      </div>

      <form className="flex flex-wrap items-end gap-2 border-t border-slate-200 pt-3" onSubmit={addProduct}>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-slate-600">Product</label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Choose…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Rs {Number(p.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div className="w-20">
          <label className="mb-1 block text-xs text-slate-600">Qty</label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default SessionProductsPanel;
