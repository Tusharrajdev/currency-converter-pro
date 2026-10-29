import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowLeftRight,
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  Globe2,
  History,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Sun,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";

const currencies = [
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "NPR", name: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "LKR", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Currency Converter", icon: ArrowLeftRight },
  { label: "Live Exchange Rates", icon: TrendingUp },
  { label: "Currency Charts", icon: Globe2 },
  { label: "Conversion History", icon: History },
  { label: "Download Reports", icon: Download },
];

const money = (value, code) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatRate = (value) =>
  Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 5,
  });

function CurrencySelect({ value, onChange, search, onSearch }) {
  const [open, setOpen] = useState(false);
  const selected = currencies.find((c) => c.code === value) || currencies[0];

  const filtered = currencies.filter((c) =>
    `${c.code} ${c.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="currency-select-wrap">
      <button
        className="currency-select"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="currency-flag">{selected.flag}</span>
        <span className="currency-select-text">
          <strong>{selected.code}</strong>
          <small>{selected.name}</small>
        </span>
        <span className="select-chevron">⌄</span>
      </button>

      {open && (
        <div className="currency-dropdown">
          <div className="dropdown-search">
            <Search size={15} />
            <input
              autoFocus
              placeholder="Search currency..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <div className="currency-options">
            {filtered.map((currency) => (
              <button
                type="button"
                key={currency.code}
                className="currency-option"
                onClick={() => {
                  onChange(currency.code);
                  onSearch("");
                  setOpen(false);
                }}
              >
                <span>{currency.flag}</span>
                <span>
                  <strong>{currency.code}</strong>
                  <small>{currency.name}</small>
                </span>
                {currency.code === value && <CheckCircle2 size={16} />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="empty-state">No matching currencies</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [rates, setRates] = useState({});
  const [base, setBase] = useState("INR");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [history, setHistory] = useState([]);
  const [feePercent, setFeePercent] = useState(2);
  const [theme, setTheme] = useState("dark");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [period, setPeriod] = useState("1M");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRates() {
      setLoading(true);
      setApiError("");

      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${base}`
        );
        if (!response.ok) throw new Error("Exchange-rate service unavailable");

        const data = await response.json();
        if (!data.rates) throw new Error("No exchange rates were returned");

        if (active) {
          setRates(data.rates);
          setUpdatedAt(data.date ? `${data.date}` : new Date().toLocaleString());
          setLoading(false);
        }
      } catch {
        if (active) {
          setApiError("Unable to fetch rates. Check your internet connection and retry.");
          setLoading(false);
        }
      }
    }

    loadRates();
    return () => {
      active = false;
    };
  }, [base]);

  const rate = useMemo(() => {
    if (from === to) return 1;
    if (from === base && rates[to]) return rates[to];
    if (to === base && rates[from]) return 1 / rates[from];
    if (rates[from] && rates[to]) return rates[to] / rates[from];
    return null;
  }, [from, to, base, rates]);

  const numericAmount = Number(amount);
  const validAmount = amount.trim() !== "" && Number.isFinite(numericAmount) && numericAmount >= 0;
  const converted = validAmount && rate !== null ? numericAmount * rate : null;
  const fee = converted === null ? null : converted * (feePercent / 100);
  const finalAmount = converted === null ? null : converted - fee;

  const rateCards = [
    { code: "USD", color: "blue" },
    { code: "EUR", color: "purple" },
    { code: "GBP", color: "green" },
    { code: "JPY", color: "orange" },
  ];

  const liveRates = currencies
    .filter((currency) => currency.code !== base && rates[currency.code])
    .filter((currency) =>
      `${currency.code} ${currency.name}`.toLowerCase().includes(search.toLowerCase())
    );

  const chartData = useMemo(() => {
    const count = period === "7D" ? 7 : period === "1M" ? 30 : period === "3M" ? 12 : period === "6M" ? 18 : 12;
    const labels = period === "7D"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : period === "1Y"
        ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        : Array.from({ length: count }, (_, i) => period === "1M" ? `${i + 1}` : `W${i + 1}`);

    const end = rate ?? 1;
    return labels.map((label, index) => ({
      date: label,
      value: end * (0.965 + (index / Math.max(labels.length - 1, 1)) * 0.035 + Math.sin(index * 1.7) * 0.008),
    }));
  }, [period, rate]);

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
    setBase(to);
  }

  function convertCurrency() {
    if (!validAmount || rate === null) {
      setNotice("Enter a valid amount and wait for exchange rates to load.");
      return;
    }

    const entry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      from,
      to,
      amount: numericAmount,
      rate,
      result: converted,
      fee,
      final: finalAmount,
    };

    setHistory((previous) => [entry, ...previous].slice(0, 100));
    setNotice("Conversion added to your history.");
    setActiveNav("Dashboard");
  }

  function exportCSV() {
    const rows = [
      ["Date", "From", "To", "Amount", "Exchange Rate", `Fee (${feePercent}%)`, "Final Amount"],
      ...history.map((item) => [
        item.date,
        item.from,
        item.to,
        item.amount,
        item.rate,
        item.fee,
        item.final,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "currency-conversion-history.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("CSV report downloaded.");
  }

  function refreshRates() {
    setBase((current) => current);
    setNotice("Rates refreshed.");
    // Re-trigger the request without changing the base currency.
    setLoading(true);
    fetch(`https://api.exchangerate-api.com/v4/latest/${base}`)
      .then((response) => {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then((data) => {
        if (data.rates) {
          setRates(data.rates);
          setUpdatedAt(data.date || new Date().toLocaleString());
          setApiError("");
        }
      })
      .catch(() => setApiError("Unable to refresh rates. Please try again."))
      .finally(() => setLoading(false));
  }

  function chooseNav(label) {
    setActiveNav(label);
    setMobileNav(false);
    if (label === "Download Reports") exportCSV();
    if (label === "Currency Converter") {
      document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" });
    }
    if (label === "Live Exchange Rates") {
      document.getElementById("live-rates")?.scrollIntoView({ behavior: "smooth" });
    }
    if (label === "Currency Charts") {
      document.getElementById("charts")?.scrollIntoView({ behavior: "smooth" });
    }
    if (label === "Conversion History") {
      document.getElementById("history")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className={`app-shell ${theme}`}>
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Globe2 size={27} /></div>
          <div>
            <div className="brand-name">Currency<span>Pro</span></div>
            <p>Exchange intelligence</p>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-link ${activeNav === label ? "active" : ""}`}
              onClick={() => chooseNav(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Conversion History" && history.length > 0 && (
                <span className="nav-count">{history.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-globe"><Globe2 size={92} strokeWidth={0.7} /></div>
          <div className="connection-card">
            <span className={`status-dot ${apiError ? "offline" : ""}`} />
            <div>
              <strong>{apiError ? "Connection issue" : "Exchange services"}</strong>
              <p>{apiError ? "Rates may be unavailable" : "Check rates before making decisions"}</p>
            </div>
          </div>
          <button className="nav-link settings-link" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Settings size={18} /><span>Appearance settings</span>
          </button>
        </div>
      </aside>

      {mobileNav && <button className="mobile-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-heading">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu">
              <Menu size={21} />
            </button>
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h1>{activeNav === "Dashboard" ? "Dashboard" : activeNav}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input
                placeholder="Search currencies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>/</kbd>
            </label>
            <button className="icon-button" onClick={() => setNotice("You are all caught up.")} aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="updated-indicator">
              <span className={`status-dot ${apiError ? "offline" : ""}`} />
              <div><small>{loading ? "Fetching rates..." : apiError ? "Offline" : "Rates date"}</small><strong>{updatedAt || "Not available"}</strong></div>
            </div>
          </div>
        </header>

        {notice && (
          <div className="notice-banner">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button>
          </div>
        )}
        {apiError && (
          <div className="error-banner">
            {apiError}
            <button className="text-button" onClick={refreshRates}>Retry</button>
          </div>
        )}

        <section className="metric-grid">
          <article className="metric-card metric-blue">
            <div className="metric-icon"><Globe2 size={21} /></div>
            <div className="metric-copy">
              <span>Currency coverage</span>
              <strong>{Object.keys(rates).length || currencies.length}+</strong>
              <small>Available currency codes</small>
            </div>
            <div className="metric-decoration">01</div>
          </article>
          <article className="metric-card metric-green">
            <div className="metric-icon"><RefreshCw size={21} /></div>
            <div className="metric-copy">
              <span>Exchange rate service</span>
              <strong>{loading ? "Loading" : apiError ? "Offline" : "Connected"}</strong>
              <small>{loading ? "Fetching current data" : apiError ? "Check connection" : "Latest available rates"}</small>
            </div>
            <div className="metric-decoration">02</div>
          </article>
          <article className="metric-card metric-purple">
            <div className="metric-icon"><ArrowDownUp size={21} /></div>
            <div className="metric-copy">
              <span>Your conversions</span>
              <strong>{history.length.toLocaleString()}</strong>
              <small>In this session</small>
            </div>
            <div className="metric-decoration">03</div>
          </article>
          <article className="metric-card metric-orange">
            <div className="metric-icon"><Wallet size={21} /></div>
            <div className="metric-copy">
              <span>Fee calculator</span>
              <strong>{feePercent}%</strong>
              <small>Adjustable estimate</small>
            </div>
            <div className="metric-decoration">04</div>
          </article>
        </section>

        <section className="dashboard-grid">
          <div className="left-column">
            <section className="panel converter-panel" id="converter">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">QUICK TOOL</span>
                  <h2>Currency converter</h2>
                </div>
                <span className="live-badge"><span className="status-dot" /> Exchange rates</span>
              </div>

              <div className="converter-fields">
                <div className="currency-field">
                  <label>From currency</label>
                  <CurrencySelect
                    value={from}
                    onChange={setFrom}
                    search={search}
                    onSearch={setSearch}
                  />
                  <div className="amount-input-wrap">
                    <input
                      aria-label="Amount to convert"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && convertCurrency()}
                    />
                    <span>{from}</span>
                  </div>
                </div>

                <button className="swap-button" onClick={swapCurrencies} title="Swap currencies" aria-label="Swap currencies">
                  <ArrowLeftRight size={21} />
                </button>

                <div className="currency-field">
                  <label>To currency</label>
                  <CurrencySelect
                    value={to}
                    onChange={setTo}
                    search={search}
                    onSearch={setSearch}
                  />
                  <div className="amount-input-wrap output-amount">
                    <strong>{converted === null ? "—" : converted.toLocaleString("en-US", { maximumFractionDigits: 4 })}</strong>
                    <span>{to}</span>
                  </div>
                </div>
              </div>

              <div className="rate-caption">
                <span>{rate === null ? "Rate unavailable" : `1 ${from} = ${formatRate(rate)} ${to}`}</span>
                <button className="inline-refresh" onClick={refreshRates} aria-label="Refresh rates"><RefreshCw size={14} /></button>
                <span className="rate-source"><span className="status-dot" /> Latest available rate</span>
              </div>

              <div className="fee-row">
                <div className="fee-control">
                  <label htmlFor="fee">Estimated fee</label>
                  <div className="fee-select-wrap">
                    <select id="fee" value={feePercent} onChange={(e) => setFeePercent(Number(e.target.value))}>
                      <option value="0">0%</option>
                      <option value="1">1%</option>
                      <option value="2">2%</option>
                      <option value="3">3%</option>
                      <option value="5">5%</option>
                    </select>
                  </div>
                </div>
                <div className="fee-result">
                  <span>Estimated fee</span>
                  <strong>{fee === null ? "—" : money(fee, to)}</strong>
                </div>
                <div className="fee-result final-result">
                  <span>After estimated fee</span>
                  <strong>{finalAmount === null ? "—" : money(finalAmount, to)}</strong>
                </div>
              </div>

              <button className="primary-button convert-button" onClick={convertCurrency} disabled={loading || rate === null || !validAmount}>
                <ArrowLeftRight size={18} /> Convert currency
              </button>
              <p className="disclaimer">Indicative conversion only. Rates and fees may differ from those offered by banks or payment providers.</p>
            </section>

            <section className="panel chart-panel" id="charts">
              <div className="panel-heading chart-heading">
                <div>
                  <span className="section-kicker">MARKET OVERVIEW</span>
                  <h2>Exchange rate trend</h2>
                  <p className="panel-subtitle">{from} to {to}</p>
                </div>
                <div className="period-switcher">
                  {["7D", "1M", "3M", "6M", "1Y"].map((item) => (
                    <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>
                  ))}
                </div>
              </div>

              <div className="chart-summary">
                <div><span>Current rate</span><strong>{rate === null ? "—" : formatRate(rate)}</strong></div>
                <div className="chart-note"><TrendingUp size={16} /> Illustrative trend</div>
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4989ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4989ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="4 5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => Number(v).toFixed(3)} />
                    <Tooltip
                      contentStyle={{ background: "var(--tooltip)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }}
                      formatter={(value) => [formatRate(Number(value)), "Illustrative rate"]}
                    />
                    <Area type="monotone" dataKey="value" stroke="#4d91ff" strokeWidth={2.5} fill="url(#rateGradient)" activeDot={{ r: 5, fill: "#4d91ff", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-disclaimer">Sample trend for layout demonstration; historical rates are not yet connected.</p>
            </section>

            <section className="panel history-panel" id="history">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">YOUR ACTIVITY</span>
                  <h2>Recent conversion history</h2>
                </div>
                <button className="outline-button" onClick={exportCSV}><Download size={15} /> Export CSV</button>
              </div>
              {history.length === 0 ? (
                <div className="empty-history">
                  <div className="empty-icon"><History size={23} /></div>
                  <strong>No conversions yet</strong>
                  <p>Your conversions will appear here after you click Convert.</p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Date & time</th><th>From</th><th>To</th><th>Rate</th><th>Final amount</th></tr></thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{money(item.amount, item.from)}</td>
                          <td>{item.to}</td>
                          <td>{formatRate(item.rate)}</td>
                          <td className="table-final">{money(item.final, item.to)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {history.length > 0 && <button className="clear-history" onClick={() => setHistory([])}>Clear session history</button>}
            </section>
          </div>

          <div className="right-column">
            <section className="panel rates-panel" id="live-rates">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">CURRENCY MARKETS</span>
                  <h2>Live exchange rates</h2>
                </div>
                <button className="icon-button refresh-icon" onClick={refreshRates} title="Refresh rates"><RefreshCw size={16} /></button>
              </div>
              <p className="rates-base">Rates quoted per <strong>1 {base}</strong></p>
              <div className="rates-table">
                {liveRates.slice(0, 9).map((currency) => (
                  <button
                    className="rate-row"
                    key={currency.code}
                    onClick={() => { setFrom(base); setTo(currency.code); setActiveNav("Currency Converter"); }}
                  >
                    <span className="rate-currency">
                      <span className="currency-flag">{currency.flag}</span>
                      <span><strong>{currency.code}</strong><small>{currency.name}</small></span>
                    </span>
                    <strong className="rate-value">{formatRate(rates[currency.code])}</strong>
                  </button>
                ))}
                {liveRates.length === 0 && <div className="empty-state">{loading ? "Loading rates…" : "No matching rates found."}</div>}
              </div>
              <button className="panel-footer-button" onClick={() => setSearch("")}>Show available currencies <span>→</span></button>
            </section>

            <section className="panel popular-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">QUICK ACCESS</span>
                  <h2>Popular currency pairs</h2>
                </div>
              </div>
              {[
                ["USD", "INR"],
                ["EUR", "USD"],
                ["GBP", "USD"],
                ["USD", "JPY"],
                ["AUD", "INR"],
              ].map(([a, b]) => {
                const first = currencies.find((c) => c.code === a);
                const second = currencies.find((c) => c.code === b);
                const pairRate = rates[a] && rates[b] ? rates[b] / rates[a] : null;
                return (
                  <button className="popular-row" key={`${a}-${b}`} onClick={() => { setFrom(a); setTo(b); setActiveNav("Currency Converter"); }}>
                    <span className="pair-flags">{first?.flag} <ArrowLeftRight size={12} /> {second?.flag}</span>
                    <span className="pair-code">{a} <span>/</span> {b}</span>
                    <strong>{pairRate === null ? "—" : formatRate(pairRate)}</strong>
                  </button>
                );
              })}
            </section>

            <section className="panel reports-panel" id="reports">
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">YOUR DATA</span>
                  <h2>Download reports</h2>
                </div>
                <Download size={18} className="reports-title-icon" />
              </div>
              <button className="report-option" onClick={exportCSV}>
                <span className="report-icon csv-icon"><Download size={19} /></span>
                <span><strong>Export as CSV</strong><small>Conversion history · .csv</small></span>
                <Download size={15} className="report-arrow" />
              </button>
              <div className="report-info">
                <Clock3 size={15} />
                <span>Includes conversions saved in this browser session.</span>
              </div>
            </section>

            <section className="info-card">
              <div className="info-icon"><Globe2 size={20} /></div>
              <div>
                <strong>Stay informed globally</strong>
                <p>Use exchange rates as a guide and verify important transactions with your provider.</p>
              </div>
            </section>
          </div>
        </section>

        <footer className="app-footer">
          <span>Currency Converter Pro <span className="footer-dot">•</span> Portfolio project</span>
          <span>Rates provided by ExchangeRate-API <span className="footer-dot">•</span> Not financial advice</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
