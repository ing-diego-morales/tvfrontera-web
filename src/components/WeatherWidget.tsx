// src/components/WeatherWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain } from "lucide-react";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=7.8939&longitude=-72.5078&current=temperature_2m,weather_code")
      .then((res) => res.json())
      .then((data) => {
        const code = data.current.weather_code;
        const condition = code < 3 ? "Soleado" : code < 60 ? "Nublado" : "Lluvia";
        setWeather({ temp: Math.round(data.current.temperature_2m), condition });
      })
      .catch(() => setWeather(null));
  }, []);

  if (!weather) return null;

  const Icon = weather.condition === "Lluvia" ? CloudRain : weather.condition === "Nublado" ? Cloud : Sun;

  return (
    <div className="flex items-center gap-2 text-white text-sm bg-white/10 px-3 py-1 rounded-full">
      <Icon size={16} className="text-amarillo" />
      <span>{weather.temp}°C · Cúcuta</span>
    </div>
  );
}