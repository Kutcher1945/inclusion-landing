"use client";
import { useState, useEffect } from "react";
import { TrendsChart } from "./trends-chart";
import { api, type Trends } from "@/lib/api";

export function TrendsWrapper({ initial }: { initial: Trends }) {
  const [data, setData]     = useState<Trends>(initial);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(false);

  const changePeriod = async (p: string) => {
    setPeriod(p);
    setLoading(true);
    try {
      const fresh = await api.trends(p);
      setData(fresh);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <TrendsChart
      data={data}
      period={period}
      onPeriodChange={changePeriod}
      loading={loading}
    />
  );
}
