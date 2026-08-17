"use client"

import Filter from "@/components/simple/Filter"
import Search from "@/components/simple/Search"
import ImageResult from "@/components/simple/ImageResult"
import Sidebar from "@/components/utils/Siderbar"

import { Box } from "@mui/material"
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import { useState, useEffect, useRef } from "react"

import { IgnoreProvider, SearchProvider, SearchResultProvider } from "@/contexts/searchContext";
import { IgnoreImageProvider } from "@/contexts/ignoreContext"

// tỷ lệ cột trái (phần Filter) theo % màn hình — có kéo co bằng divider
const DEFAULT_LEFT_PCT = 33.33
const MIN_LEFT_PCT = 15
const MAX_LEFT_PCT = 70

export default function Simple() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [leftPct, setLeftPct] = useState<number>(DEFAULT_LEFT_PCT);
    const leftPctRef = useRef(leftPct);
    leftPctRef.current = leftPct;

    // khôi phục tỷ lệ đã lưu từ lần trước
    useEffect(() => {
        const saved = localStorage.getItem("simpleLeftPct");
        if (saved) {
            const val = parseFloat(saved);
            if (!isNaN(val)) setLeftPct(Math.min(MAX_LEFT_PCT, Math.max(MIN_LEFT_PCT, val)));
        }
    }, []);

    // kéo divider: pointer capture để kéo mượt không bị mất sự kiện khi ra ngoài element
    const onDividerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onDividerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            const pct = (e.clientX / window.innerWidth) * 100;
            setLeftPct(Math.min(MAX_LEFT_PCT, Math.max(MIN_LEFT_PCT, pct)));
        }
    };
    const onDividerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        localStorage.setItem("simpleLeftPct", String(leftPctRef.current));
    };
    // double-click: reset về mặc định 1fr 2fr
    const onDividerDoubleClick = () => {
        setLeftPct(DEFAULT_LEFT_PCT);
        localStorage.removeItem("simpleLeftPct");
    };

    return (
        <SearchProvider>
            <IgnoreImageProvider>
                <Sidebar open={drawerOpen} setOpen={setDrawerOpen}/>

                <Box
                    className="w-screen h-screen"
                    sx={{ display: "grid", gridTemplateColumns: `${leftPct}% 8px 1fr` }}
                >
                    <IgnoreProvider>
                        <Box className="w-full h-full p-2 grid grid-rows-[1fr_2fr] gap-1 min-h-0">
                            <SearchResultProvider>
                                <Filter/>
                                <ImageResult/>
                            </SearchResultProvider>
                        </Box>
                    </IgnoreProvider>

                    {/* thanh kéo giữa 2 cột */}
                    <Box
                        onPointerDown={onDividerPointerDown}
                        onPointerMove={onDividerPointerMove}
                        onPointerUp={onDividerPointerUp}
                        onDoubleClick={onDividerDoubleClick}
                        title="Kéo để co giãn 2 cột — double-click để reset"
                        sx={{
                            cursor: "col-resize",
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
                            sx={{ transform: "rotate(90deg)", fontSize: 18, color: "#9e9e9e" }}
                        />
                    </Box>

                    <IgnoreProvider>
                        <Box className="w-full h-full p-2 grid grid-rows-[1fr_4fr] gap-1 min-h-0">
                            <SearchResultProvider>
                                <Search/>
                                <ImageResult/>
                            </SearchResultProvider>
                        </Box>
                    </IgnoreProvider>
                </Box>
            </IgnoreImageProvider>
        </SearchProvider>
    )
}
