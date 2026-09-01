"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface DataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface CategorySalesData {
  category: string;
  revenue: number;
  units: number;
  percentage: number;
  color: string;
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function formatRs(n: number): string {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}

// ── 1. Interactive Area / Spline Revenue Chart ────────────────────────────────
export function RevenueAreaChart({
  data,
  viewMode = "revenue",
}: {
  data: DataPoint[];
  viewMode?: "revenue" | "orders";
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray">
        No sales data available for this timeframe.
      </div>
    );
  }

  const values = data.map((d) => (viewMode === "revenue" ? d.revenue : d.orders));
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartW;
    const val = viewMode === "revenue" ? d.revenue : d.orders;
    const y = paddingTop + chartH - (val / maxVal) * chartH;
    return { x, y, data: d };
  });

  // Generate SVG path command
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Simple smooth curve control points
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, "");

  // Area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    paddingTop + chartH
  } L ${points[0].x} ${paddingTop + chartH} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b7767a" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#c8a04d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#c8a04d" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b7767a" />
            <stop offset="50%" stopColor="#c8a04d" />
            <stop offset="100%" stopColor="#b7767a" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartH * (1 - ratio);
          const gridVal = ratio * maxVal;
          return (
            <g key={ratio}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e5e1da"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                fill="#8a8580"
                fontSize={9}
                textAnchor="end"
                fontFamily="sans-serif"
              >
                {viewMode === "revenue"
                  ? ratio === 0
                    ? "0"
                    : ratio === 1
                    ? formatRs(maxVal)
                    : `${Math.round(gridVal / 1000)}k`
                  : Math.round(gridVal)}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Stroke Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & Interactive Hover Verticals */}
        {points.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Invisible wider target for touch/hover */}
              <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />

              {/* Vertical Guide on hover */}
              {isHovered && (
                <line
                  x1={pt.x}
                  y1={paddingTop}
                  x2={pt.x}
                  y2={paddingTop + chartH}
                  stroke="#1c1b1a"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              )}

              {/* Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? "#c8a04d" : "#b7767a"}
                stroke="#faf7f2"
                strokeWidth={2}
                className="transition-all duration-150"
              />

              {/* X Axis Label */}
              {(idx === 0 ||
                idx === points.length - 1 ||
                idx % Math.ceil(points.length / 7) === 0) && (
                <text
                  x={pt.x}
                  y={height - 10}
                  fill="#8a8580"
                  fontSize={10}
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {pt.data.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip Card */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full bg-ink text-ivory p-3 rounded-xl shadow-2xl border border-gold/30 text-xs transition-all duration-100"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100 - 6}%`,
          }}
        >
          <p className="text-[10px] uppercase tracking-wider text-gold font-bold">
            {points[hoveredIdx].data.label}
          </p>
          <p className="font-serif text-sm font-bold text-ivory mt-0.5">
            {formatRs(points[hoveredIdx].data.revenue)}
          </p>
          <p className="text-[10px] text-white/70">
            {points[hoveredIdx].data.orders} order
            {points[hoveredIdx].data.orders !== 1 ? "s" : ""} placed
          </p>
        </div>
      )}
    </div>
  );
}

// ── 2. Interactive Category Donut Chart ────────────────────────────────────────
export function CategoryDonutChart({ data }: { data: CategorySalesData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-gray">
        No category sales recorded yet.
      </div>
    );
  }

  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e5e1da"
            strokeWidth={strokeWidth}
          />
          {data.map((cat, idx) => {
            const strokeDasharray = `${
              (cat.percentage / 100) * circumference
            } ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (cat.percentage / 100) * circumference;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={cat.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Donut Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
          {hoveredIdx !== null ? (
            <>
              <p className="text-[10px] uppercase font-bold text-gray tracking-wider">
                {data[hoveredIdx].category}
              </p>
              <p className="font-serif text-lg font-bold text-ink">
                {data[hoveredIdx].percentage}%
              </p>
              <p className="text-[10px] text-rose font-semibold">
                {formatRs(data[hoveredIdx].revenue)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[9px] uppercase tracking-widest text-gray font-bold">
                Categories
              </p>
              <p className="font-serif text-xl font-bold text-ink">
                {data.length}
              </p>
              <p className="text-[10px] text-gray">Top Sales</p>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full space-y-3">
        {data.map((cat, idx) => (
          <div
            key={cat.category}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
              hoveredIdx === idx
                ? "bg-rose-light/20 border-rose/30 shadow-xs"
                : "bg-white border-gray-light/60 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs font-semibold text-ink truncate">
                {cat.category}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-rose">
                {formatRs(cat.revenue)}
              </span>
              <span className="text-[10px] text-gray block">
                {cat.units} units ({cat.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 3. Mini KPI Sparkline ──────────────────────────────────────────────────────
export function MiniSparkline({
  values,
  color = "#c8a04d",
}: {
  values: number[];
  color?: string;
}) {
  if (!values || values.length < 2) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const width = 80;
  const height = 28;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
