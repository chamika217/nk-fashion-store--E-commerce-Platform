"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminShell from "@/components/admin/AdminShell";
import { getProducts } from "@/lib/productService";
import { getOrders } from "@/lib/orderService";
import { getCategories } from "@/lib/categoryService";
import type { Order, Product, Category } from "@/lib/types";
import {
  RevenueAreaChart,
  CategoryDonutChart,
  MiniSparkline,
  type DataPoint,
  type CategorySalesData,
} from "@/components/admin/dashboard/AdminAnalyticsCharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  PackageX,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

type DateRange = "today" | "7d" | "30d" | "90d" | "1y" | "all";

const CATEGORY_COLORS = [
  "#b7767a", // Rose
  "#c8a04d", // Gold
  "#2a7f62", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f97316", // Orange
];

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  Pending: {
    label: "Pending",
    bg: "bg-gold/15",
    text: "text-amber-700",
    dot: "bg-gold",
  },
  Confirmed: {
    label: "Confirmed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  Processing: {
    label: "Processing",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  Dispatched: {
    label: "Dispatched",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  Delivered: {
    label: "Delivered",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-600",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

function formatRs(n: number): string {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function DashboardContent() {
  const { adminProfile, role } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>("30d");
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");

  const loadData = () => {
    setLoading(true);
    Promise.all([getOrders(), getProducts(), getCategories()])
      .then(([o, p, c]) => {
        setOrders(o);
        setProducts(p);
        setCategories(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Date Range Filter Logic ──────────────────────────────────────────────────
  const { currentOrders, previousOrders, timeLabel } = useMemo(() => {
    const now = Date.now();
    let currentCutoff = 0;
    let prevCutoff = 0;
    let label = "Last 30 Days";

    if (range === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      currentCutoff = startOfDay.getTime();
      prevCutoff = currentCutoff - 86400_000;
      label = "Today";
    } else if (range === "7d") {
      currentCutoff = now - 7 * 86400_000;
      prevCutoff = now - 14 * 86400_000;
      label = "Last 7 Days";
    } else if (range === "30d") {
      currentCutoff = now - 30 * 86400_000;
      prevCutoff = now - 60 * 86400_000;
      label = "Last 30 Days";
    } else if (range === "90d") {
      currentCutoff = now - 90 * 86400_000;
      prevCutoff = now - 180 * 86400_000;
      label = "Last 90 Days";
    } else if (range === "1y") {
      currentCutoff = now - 365 * 86400_000;
      prevCutoff = now - 730 * 86400_000;
      label = "This Year";
    } else {
      // all
      currentCutoff = 0;
      prevCutoff = 0;
      label = "All Time";
    }

    const curr =
      range === "all"
        ? orders
        : orders.filter((o) => o.createdAt >= currentCutoff);
    const prev =
      range === "all"
        ? []
        : orders.filter(
            (o) => o.createdAt >= prevCutoff && o.createdAt < currentCutoff
          );

    return { currentOrders: curr, previousOrders: prev, timeLabel: label };
  }, [orders, range]);

  // ── Metrics Calculation ──────────────────────────────────────────────────────
  const activeCurrent = currentOrders.filter((o) => o.status !== "Cancelled");
  const activePrevious = previousOrders.filter((o) => o.status !== "Cancelled");

  const currentRevenue = activeCurrent.reduce((s, o) => s + o.total, 0);
  const previousRevenue = activePrevious.reduce((s, o) => s + o.total, 0);

  const revenueGrowth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : currentRevenue > 0
      ? 100
      : 0;

  const currentOrdersCount = currentOrders.length;
  const previousOrdersCount = previousOrders.length;
  const ordersGrowth =
    previousOrdersCount > 0
      ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
      : currentOrdersCount > 0
      ? 100
      : 0;

  const aov =
    activeCurrent.length > 0 ? currentRevenue / activeCurrent.length : 0;
  const prevAov =
    activePrevious.length > 0 ? previousRevenue / activePrevious.length : 0;
  const aovGrowth =
    prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : aov > 0 ? 100 : 0;

  // Customers
  const customerPhonesInPeriod = new Set(
    currentOrders.map((o) => o.customer.phone)
  );
  const totalUniqueCustomers = new Set(orders.map((o) => o.customer.phone)).size;

  // ── Revenue Timeline Chart Data ──────────────────────────────────────────────
  const timelineData: DataPoint[] = useMemo(() => {
    if (range === "today") {
      // 6-hour buckets
      const buckets: Record<string, { revenue: number; orders: number }> = {
        "00:00 - 06:00": { revenue: 0, orders: 0 },
        "06:00 - 12:00": { revenue: 0, orders: 0 },
        "12:00 - 18:00": { revenue: 0, orders: 0 },
        "18:00 - 24:00": { revenue: 0, orders: 0 },
      };
      activeCurrent.forEach((o) => {
        const hour = new Date(o.createdAt).getHours();
        if (hour < 6) {
          buckets["00:00 - 06:00"].revenue += o.total;
          buckets["00:00 - 06:00"].orders += 1;
        } else if (hour < 12) {
          buckets["06:00 - 12:00"].revenue += o.total;
          buckets["06:00 - 12:00"].orders += 1;
        } else if (hour < 18) {
          buckets["12:00 - 18:00"].revenue += o.total;
          buckets["12:00 - 18:00"].orders += 1;
        } else {
          buckets["18:00 - 24:00"].revenue += o.total;
          buckets["18:00 - 24:00"].orders += 1;
        }
      });
      return Object.entries(buckets).map(([label, val]) => ({
        label,
        revenue: val.revenue,
        orders: val.orders,
      }));
    }

    // Daily buckets for 7d, 30d, 90d, 1y, all
    const numDays =
      range === "7d" ? 7 : range === "30d" ? 14 : range === "90d" ? 12 : 12;
    const now = new Date();
    const buckets: { label: string; timestamp: number; revenue: number; orders: number }[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      if (range === "1y" || range === "all") {
        d.setMonth(now.getMonth() - i);
        const label = d.toLocaleDateString("en-GB", {
          month: "short",
          year: "2-digit",
        });
        buckets.push({ label, timestamp: d.getTime(), revenue: 0, orders: 0 });
      } else {
        d.setDate(now.getDate() - i);
        const label = formatShortDate(d.getTime());
        buckets.push({ label, timestamp: d.getTime(), revenue: 0, orders: 0 });
      }
    }

    activeCurrent.forEach((o) => {
      const oDate = new Date(o.createdAt);
      if (range === "1y" || range === "all") {
        const oMonthLabel = oDate.toLocaleDateString("en-GB", {
          month: "short",
          year: "2-digit",
        });
        const match = buckets.find((b) => b.label === oMonthLabel);
        if (match) {
          match.revenue += o.total;
          match.orders += 1;
        }
      } else {
        const oDayLabel = formatShortDate(o.createdAt);
        const match = buckets.find((b) => b.label === oDayLabel);
        if (match) {
          match.revenue += o.total;
          match.orders += 1;
        }
      }
    });

    return buckets.map((b) => ({
      label: b.label,
      revenue: b.revenue,
      orders: b.orders,
    }));
  }, [activeCurrent, range]);

  // ── Category Sales Breakdown ─────────────────────────────────────────────────
  const categorySalesData: CategorySalesData[] = useMemo(() => {
    const map = new Map<string, { revenue: number; units: number }>();

    activeCurrent.forEach((order) => {
      order.items.forEach((item) => {
        // Find product category if available
        const matchedProduct = products.find((p) => p.id === item.productId);
        const catName = matchedProduct?.category || "Footwear & Apparel";

        const existing = map.get(catName) || { revenue: 0, units: 0 };
        existing.revenue += item.price * item.qty;
        existing.units += item.qty;
        map.set(catName, existing);
      });
    });

    const totalCatRevenue = Array.from(map.values()).reduce(
      (s, v) => s + v.revenue,
      0
    );

    return Array.from(map.entries())
      .map(([cat, val], idx) => ({
        category: cat,
        revenue: val.revenue,
        units: val.units,
        percentage:
          totalCatRevenue > 0
            ? Math.round((val.revenue / totalCatRevenue) * 100)
            : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [activeCurrent, products]);

  // ── Top Selling Products Leaderboard ─────────────────────────────────────────
  const topSellingProducts = useMemo(() => {
    const productStats = new Map<
      string,
      {
        id: string;
        name: string;
        unitsSold: number;
        totalRevenue: number;
        product?: Product;
      }
    >();

    activeCurrent.forEach((o) => {
      o.items.forEach((item) => {
        const existing = productStats.get(item.productId);
        const prod = products.find((p) => p.id === item.productId);
        if (existing) {
          existing.unitsSold += item.qty;
          existing.totalRevenue += item.price * item.qty;
        } else {
          productStats.set(item.productId, {
            id: item.productId,
            name: item.name,
            unitsSold: item.qty,
            totalRevenue: item.price * item.qty,
            product: prod,
          });
        }
      });
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
  }, [activeCurrent, products]);

  // ── Status Breakdown ─────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Record<Order["status"], number> = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Dispatched: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    currentOrders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    });
    return counts;
  }, [currentOrders]);

  // ── Low Stock & Out of Stock Alerts ──────────────────────────────────────────
  const lowStockItems = useMemo(() => {
    return products
      .filter(
        (p) => p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold ?? 3)
      )
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 5);
  }, [products]);

  const outOfStockItems = useMemo(() => {
    return products
      .filter((p) => p.totalStock === 0 || p.status === "out-of-stock")
      .slice(0, 5);
  }, [products]);

  // ── Recent Orders Feed ───────────────────────────────────────────────────────
  const recentOrders = useMemo(() => {
    return orders.slice(0, 6);
  }, [orders]);

  // ── Geographic Distribution ──────────────────────────────────────────────────
  const topCities = useMemo(() => {
    const cityMap = new Map<string, number>();
    currentOrders.forEach((o) => {
      const c = (o.customer.city || "Sri Lanka").trim();
      cityMap.set(c, (cityMap.get(c) || 0) + 1);
    });
    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [currentOrders]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ── Top Executive Header & Filter Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-light/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-gold bg-ink px-2.5 py-0.5 rounded-full">
              {role?.name || "Administrator"}
            </span>
            <span className="text-xs text-gray">Live System Analytics</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Dashboard & Operations Command
          </h1>
          <p className="text-xs sm:text-sm text-gray mt-1">
            Welcome back, <strong className="text-ink">{adminProfile?.name || "Admin"}</strong>. Here is the operational performance for <span className="text-rose font-semibold">{timeLabel}</span>.
          </p>
        </div>

        {/* Date Range Selector Pill */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-gray-light/80 shadow-2xs">
          {(
            [
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "1y", label: "Year" },
              { id: "all", label: "All Time" },
            ] as { id: DateRange; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                range === item.id
                  ? "bg-ink text-ivory shadow-xs"
                  : "text-gray hover:text-ink hover:bg-gray-light/40"
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={loadData}
            title="Refresh Real Data"
            className="p-1.5 text-gray hover:text-ink rounded-lg hover:bg-gray-light/40 transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 1. KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-gray-light/60 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose/10 text-rose flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {formatRs(currentRevenue)}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              {revenueGrowth >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +{revenueGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" /> {revenueGrowth.toFixed(1)}%
                </span>
              )}
              <span className="text-gray text-[11px]">vs previous period</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-gray-light/60 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {currentOrdersCount}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              {ordersGrowth >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +{ordersGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" /> {ordersGrowth.toFixed(1)}%
                </span>
              )}
              <span className="text-gray text-[11px]">{statusCounts.Pending} pending action</span>
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-6 rounded-3xl bg-white border border-gray-light/60 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray">
              Avg Order Value
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {formatRs(aov)}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              {aovGrowth >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +{aovGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" /> {aovGrowth.toFixed(1)}%
                </span>
              )}
              <span className="text-gray text-[11px]">per active order</span>
            </div>
          </div>
        </div>

        {/* Customer Base & In Period */}
        <div className="p-6 rounded-3xl bg-white border border-gray-light/60 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray">
              Unique Customers
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {customerPhonesInPeriod.size}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-gray">
              <span className="font-bold text-ink">{totalUniqueCustomers}</span>
              <span className="text-[11px]">total lifetime customers</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 2. Revenue Overview Interactive Chart & Category Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue / Orders Area Spline Chart (8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sales Velocity</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                Revenue & Sales Trends
              </h2>
            </div>

            {/* Toggle View Mode */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-ivory border border-gray-light">
              <button
                onClick={() => setChartMode("revenue")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "revenue"
                    ? "bg-ink text-ivory shadow-xs"
                    : "text-gray hover:text-ink"
                }`}
              >
                Revenue (Rs.)
              </button>
              <button
                onClick={() => setChartMode("orders")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMode === "orders"
                    ? "bg-ink text-ivory shadow-xs"
                    : "text-gray hover:text-ink"
                }`}
              >
                Order Volume
              </button>
            </div>
          </div>

          {/* Area Chart Component */}
          <RevenueAreaChart data={timelineData} viewMode={chartMode} />
        </div>

        {/* Sales by Category Donut (4 Cols) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Category Share</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Sales by Category
            </h2>
          </div>

          <CategoryDonutChart data={categorySalesData} />
        </div>

      </div>

      {/* ── 3. Orders Pipeline Status Bar ── */}
      <div className="p-6 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-rose" />
            <h3 className="font-serif text-base font-bold text-ink">
              Orders Lifecycle & Pipeline ({currentOrders.length})
            </h3>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-rose hover:text-ink transition-colors flex items-center gap-1"
          >
            Manage All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(STATUS_CONFIG) as Order["status"][]).map((st) => {
            const count = statusCounts[st] || 0;
            const config = STATUS_CONFIG[st];
            return (
              <Link
                key={st}
                href={`/admin/orders?status=${st}`}
                className={`p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between gap-2 ${config.bg} border-gray-light/60`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${config.text}`}>
                    {config.label}
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold text-ink">
                  {count}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 4. Top Selling Products & Recent Orders Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Selling Products (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose">
                Leaderboard
              </span>
              <h3 className="font-serif text-lg font-bold text-ink">
                Top-Selling Footwear & Items
              </h3>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-gray hover:text-rose transition-colors"
            >
              View Inventory
            </Link>
          </div>

          {topSellingProducts.length === 0 ? (
            <p className="text-sm text-gray py-8 text-center">
              No product sales recorded in this period.
            </p>
          ) : (
            <div className="divide-y divide-gray-light/50">
              {topSellingProducts.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-gold w-5">
                      0{idx + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-gray-light">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-gray">
                          Img
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray">
                        SKU: {item.product?.sku || "N/A"} · Stock:{" "}
                        <strong
                          className={
                            item.product?.totalStock && item.product.totalStock > 0
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {item.product?.totalStock ?? "—"} left
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-rose">
                      {formatRs(item.totalRevenue)}
                    </p>
                    <p className="text-[10px] text-gray">
                      {item.unitsSold} unit{item.unitsSold !== 1 ? "s" : ""} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Feed (5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold">
                  Live Dispatch Stream
                </span>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Recent Orders
                </h3>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-gray hover:text-rose transition-colors"
              >
                All Orders →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray py-8 text-center">
                No orders placed yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const st = STATUS_CONFIG[order.status];
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders?search=${encodeURIComponent(
                        order.orderNumber
                      )}`}
                      className="p-3 rounded-2xl border border-gray-light/60 hover:border-rose/40 hover:bg-rose-light/10 transition-all duration-200 flex items-center justify-between gap-3 block"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-rose">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-ink mt-0.5 truncate">
                          {order.customer.name} · {order.customer.city || "Sri Lanka"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-ink">
                          {formatRs(order.total)}
                        </p>
                        <p className="text-[10px] text-gray">
                          {formatShortDate(order.createdAt)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── 5. Inventory Alerts & Geographic Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Stock / Out of Stock Alert Center (8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  Stock Alerts & Restock Required
                </h3>
                <p className="text-xs text-gray">
                  Items below minimum threshold or completely sold out
                </p>
              </div>
            </div>
            <Link
              href="/admin/products/new"
              className="text-xs font-bold uppercase tracking-wider text-rose hover:underline"
            >
              + Add Product
            </Link>
          </div>

          {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
            <div className="py-6 flex items-center justify-center gap-2 text-green-700 text-xs font-semibold bg-green-50 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>All warehouse items are currently well-stocked.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Out of stock */}
              {outOfStockItems.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-red-50/60 border border-red-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                    <p className="text-xs font-bold text-ink mt-1 truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-gray">SKU: {p.sku}</p>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="px-3 py-1.5 rounded-xl bg-ink text-ivory text-xs font-bold hover:bg-rose transition-colors shrink-0"
                  >
                    Restock
                  </Link>
                </div>
              ))}

              {/* Low stock */}
              {lowStockItems.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Only {p.totalStock} left
                    </span>
                    <p className="text-xs font-bold text-ink mt-1 truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-gray">Threshold: {p.lowStockThreshold ?? 3}</p>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-gray-light text-ink text-xs font-bold hover:border-rose hover:text-rose transition-colors shrink-0"
                  >
                    Update
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Sri Lankan Customer Regions (4 Cols) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-gray-light/60 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose" />
            <h3 className="font-serif text-lg font-bold text-ink">
              Top Customer Regions
            </h3>
          </div>

          {topCities.length === 0 ? (
            <p className="text-xs text-gray py-4">No regional data yet.</p>
          ) : (
            <div className="space-y-3">
              {topCities.map((item, idx) => (
                <div
                  key={item.city}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-ivory border border-gray-light/50 text-xs"
                >
                  <span className="font-semibold text-ink flex items-center gap-2">
                    <span className="w-4 text-gray text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                    {item.city}
                  </span>
                  <span className="text-rose font-bold">
                    {item.count} order{item.count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
