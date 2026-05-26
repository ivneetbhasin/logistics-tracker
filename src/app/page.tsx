"use client";

import { useEffect, useState } from "react";

export default function Home() {

  const [stats, setStats] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/delivery-statistics?metric=delivery_rate")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setStats(data);
      });
    return () => { ignore = true; };
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Delivery Dashboard</h1>

      <pre>
        {JSON.stringify(stats, null, 2)}
      </pre>
    </main>
  );
}