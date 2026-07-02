"use client";

import { useEffect, useState } from "react";

interface GeoIpResult {
  countryCode: string | null;
  isLoading: boolean;
}

export function useGeoIp(): GeoIpResult {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("https://ipapi.co/json/")
      .then((r) => {
        if (!r.ok) throw new Error("ipapi failed");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCountryCode(data.country_code ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCountryCode(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { countryCode, isLoading };
}
