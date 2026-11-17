"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getComplaintStatsAction } from "@/actions/complaints";
import { subscribeToLiveRoom } from "@/lib/realtimeBroadcast";

interface MonthlyData {
  month: string;
  masuk: number;
  selesai: number;
}

export function ComplaintStatsChart() {
  const [chartData, setChartData] = useState<MonthlyData[]>([
    { month: "Mgg 1 (1-7)", masuk: 0, selesai: 0 },
    { month: "Mgg 2 (8-14)", masuk: 0, selesai: 0 },
    { month: "Mgg 3 (15-21)", masuk: 0, selesai: 0 },
    { month: "Mgg 4 (22+)", masuk: 0, selesai: 0 },
  ]);

  const [totalMasuk, setTotalMasuk] = useState<number>(0);
  const [totalSelesai, setTotalSelesai] = useState<number>(0);
  const [monthName, setMonthName] = useState<string>("Bulan Ini");

  const fetchRealData = async () => {
    try {
      const stats = await getComplaintStatsAction();
      if (stats && stats.success) {
        setTotalMasuk(stats.totalMasuk);
        setTotalSelesai(stats.totalSelesai);
        if (stats.monthName) {
          setMonthName(stats.monthName);
        }
        if (stats.chartData && stats.chartData.length > 0) {
          setChartData(stats.chartData);
        }
      }
    } catch (err) {
      console.warn("Chart data fetch warning:", err);
    }
  };

  useEffect(() => {
    fetchRealData();

    // 1. Berlangganan Real-Time via Shared Live Manager
    const unsubscribeLive = subscribeToLiveRoom(() => {
      fetchRealData();
    });

    // 2. Auto-refresh polling interval (5 detik) menjamin data selalu sinkron
    const interval = setInterval(() => {
      fetchRealData();
    }, 5000);

    return () => {
      unsubscribeLive();
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="rounded-xl border-slate-200/70 dark:border-slate-800 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Tren Penanganan Jalan ({monthName})
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold px-2 py-0.5">
              ● Live Real-time
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-400 mt-1">
            Data 100% riil mingguan khusus bulan berjalan tanpa estimasi data dummy.
          </CardDescription>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3b37]" />
            <span className="text-slate-600 dark:text-slate-400">
              Laporan Masuk ({totalMasuk})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span className="text-slate-600 dark:text-slate-400">
              Selesai Diperbaiki ({totalSelesai})
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-6">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c3b37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0c3b37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              />
              <Area
                type="monotone"
                dataKey="masuk"
                name="Laporan Masuk"
                stroke="#0c3b37"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMasuk)"
              />
              <Area
                type="monotone"
                dataKey="selesai"
                name="Selesai Diperbaiki"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSelesai)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
