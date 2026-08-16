"use client";

// Emotion cache dùng chung cho SSR + client — sửa lỗi hydration MUI
// (server render <style data-emotion> khớp với client, không regenerate tree)
import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";

export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cache] = React.useState(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const injected = Object.values(cache.inserted).join("\n");
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(" ")}`}
        dangerouslySetInnerHTML={{ __html: injected }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
