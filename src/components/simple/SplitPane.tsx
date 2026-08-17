"use client"

import { Box } from "@mui/material"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import { useState, useEffect, useRef, ReactNode } from "react"

type SplitPaneProps = {
    // "columns": chia đôi theo chiều ngang (kéo trái-phải) — "rows": chia đôi theo chiều dọc (kéo lên-xuống)
    direction: "columns" | "rows";
    // key localStorage để nhớ tỷ lệ; bỏ trống nếu không cần lưu
    storageKey?: string;
    defaultFirstPct: number;
    minFirstPct?: number;
    maxFirstPct?: number;
    first: ReactNode;
    second: ReactNode;
    containerClassName?: string;
}

export default function SplitPane({
    direction,
    storageKey,
    defaultFirstPct,
    minFirstPct = 15,
    maxFirstPct = 85,
    first,
    second,
    containerClassName = "w-full h-full p-2 grid min-h-0",
}: SplitPaneProps) {
    const isCols = direction === "columns";

    const [firstPct, setFirstPct] = useState<number>(defaultFirstPct);
    const firstPctRef = useRef(firstPct);
    firstPctRef.current = firstPct;
    const containerRef = useRef<HTMLDivElement>(null);

    // khôi phục tỷ lệ đã lưu từ lần trước
    useEffect(() => {
        if (!storageKey) return;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const val = parseFloat(saved);
            if (!isNaN(val)) setFirstPct(Math.min(maxFirstPct, Math.max(minFirstPct, val)));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clamp = (v: number) => Math.min(maxFirstPct, Math.max(minFirstPct, v));

    // kéo divider: pointer capture để kéo mượt không bị mất sự kiện khi ra ngoài element
    const onDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onDividerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pct = isCols
            ? ((e.clientX - rect.left) / rect.width) * 100
            : ((e.clientY - rect.top) / rect.height) * 100;
        setFirstPct(clamp(pct));
    };
    const onDividerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        if (storageKey) localStorage.setItem(storageKey, String(firstPctRef.current));
    };
    // double-click: reset về mặc định
    const onDividerDoubleClick = () => {
        setFirstPct(defaultFirstPct);
        if (storageKey) localStorage.removeItem(storageKey);
    };

    const template = `${firstPct}% 8px 1fr`;

    return (
        <Box
            ref={containerRef}
            className={containerClassName}
            sx={isCols ? { gridTemplateColumns: template } : { gridTemplateRows: template }}
        >
            {/* overflow-hidden: panel bị kéo nhỏ không được tràn đè lên vạch chia */}
            <Box className="w-full h-full min-h-0 min-w-0 overflow-hidden">{first}</Box>

            {/* thanh kéo giữa 2 phần */}
            <Box
                onPointerDown={onDividerPointerDown}
                onPointerMove={onDividerPointerMove}
                onPointerUp={onDividerPointerUp}
                onDoubleClick={onDividerDoubleClick}
                title="Kéo để co giãn — double-click để reset"
                sx={{
                    cursor: isCols ? "col-resize" : "row-resize",
                    userSelect: "none",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e0e0e0",
                    "&:hover, &:active": {
                        backgroundColor: "#1976d2",
                        "& .drag-icon": { color: "white" },
                    },
                }}
            >
                <DragIndicatorIcon
                    className="drag-icon"
                    sx={{ transform: isCols ? "rotate(90deg)" : "none", fontSize: 18, color: "#9e9e9e" }}
                />
            </Box>

            <Box className="w-full h-full min-h-0 min-w-0 overflow-hidden">{second}</Box>
        </Box>
    )
}
