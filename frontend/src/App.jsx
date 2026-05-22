import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const CURRENCY_FORMAT = new Intl.NumberFormat("es-AR");

function formatPrice(price) {
  const value = Number(price || 0);
  return `$${CURRENCY_FORMAT.format(value)}`;
}

function PublicMenu({ menu, loading, message }) {
  if (loading) return <main className="p-8 text-center text-zinc-100">Cargando...</main>;

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-8">
      <section className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h1 className="text-3xl font-bold text-amber-400">{menu.eventName}</h1>
        {message ? <p className="mt-3 text-sm text-amber-300">{message}</p> : null}
        <ul className="mt-6 space-y-2">
          {menu.products.map((product, index) => (
            <li
              key={`${product.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <span>{product.name}</span>
              <strong className="text-amber-300">{formatPrice(product.price)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function AdminPanel({ menu, setMenu, token, setToken }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const canSave = useMemo(() => {
    return Boolean(token) && menu.eventName.trim() && menu.products.length > 0;
  }, [menu.eventName, menu.products.length, token]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      setLoginError(data.message || "No se pudo iniciar sesion");
      return;
    }
    setToken(data.token);
    localStorage.setItem("adminToken", data.token);
    setCredentials({ username: "", password: "" });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/menu", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menu),
    });
    const data = await response.json();
    setSaving(false);
    setMessage(response.ok ? "Cambios guardados." : data.message || "No se pudo guardar.");
  }

  function updateProduct(index, field, value) {
    const next = [...menu.products];
    next[index] = { ...next[index], [field]: value };
    setMenu({ ...menu, products: next });
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-4 text-zinc-100 md:p-8">
      <section className="mx-auto max-w-5xl rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h1 className="text-2xl font-bold">Admin</h1>
        {!token ? (
          <form onSubmit={handleLogin} className="mt-5 max-w-md space-y-3">
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              placeholder="Usuario"
              value={credentials.username}
              onChange={(event) =>
                setCredentials({ ...credentials, username: event.target.value })
              }
            />
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              type="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={(event) =>
                setCredentials({ ...credentials, password: event.target.value })
              }
            />
            {loginError ? <p className="text-sm text-red-400">{loginError}</p> : null}
            <button className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black">
              Ingresar
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              value={menu.eventName}
              onChange={(event) => setMenu({ ...menu, eventName: event.target.value })}
            />
            <div className="max-h-[500px] space-y-3 overflow-auto pr-1">
              {menu.products.map((product, index) => (
                <div key={`${product.name}-${index}`} className="grid grid-cols-5 gap-2">
                  <input
                    className="col-span-3 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={product.name}
                    onChange={(event) => updateProduct(index, "name", event.target.value)}
                  />
                  <input
                    className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                    value={product.price}
                    onChange={(event) =>
                      updateProduct(index, "price", event.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  setToken("");
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2"
              >
                Cerrar sesion
              </button>
            </div>
            {message ? <p className="text-sm text-amber-300">{message}</p> : null}
          </div>
        )}
      </section>
    </main>
  );
}

function App() {
  const [menu, setMenu] = useState({ eventName: "", products: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

  useEffect(() => {
    async function loadMenu() {
      const response = await fetch("/api/menu");
      const data = await response.json();
      setMenu(data);
      setLoading(false);
    }
    loadMenu().catch(() => {
      setLoading(false);
      setMessage("No se pudo cargar el menu.");
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicMenu menu={menu} loading={loading} message={message} />} />
        <Route
          path="/admin"
          element={<AdminPanel menu={menu} setMenu={setMenu} token={token} setToken={setToken} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
