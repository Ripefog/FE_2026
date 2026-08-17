"use client"

import Filter from "@/components/simple/Filter"
import Search from "@/components/simple/Search"
import ImageResult from "@/components/simple/ImageResult"
import Sidebar from "@/components/utils/Siderbar"
import SplitPane from "@/components/simple/SplitPane"

import { Box } from "@mui/material"
import { useState } from "react"

import { IgnoreProvider, SearchProvider, SearchResultProvider } from "@/contexts/searchContext";
import { IgnoreImageProvider } from "@/contexts/ignoreContext"

// tỷ lệ mặc định: cột trái 1/3 màn hình; hàng trái Filter:gallery = 1:2; hàng phải Search:gallery = 1:4
const DEFAULT_LEFT_PCT = 33.33
const DEFAULT_FILTER_ROW_PCT = 33.33
const DEFAULT_SEARCH_ROW_PCT = 20

export default function Simple() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <SearchProvider>
            <IgnoreImageProvider>
                <Sidebar open={drawerOpen} setOpen={setDrawerOpen}/>

                {/* vạch dọc: kéo trái-phải giữa cột Filter và cột Search */}
                <SplitPane
                    direction="columns"
                    storageKey="simpleLeftPct"
                    defaultFirstPct={DEFAULT_LEFT_PCT}
                    containerClassName="w-screen h-screen grid min-h-0"
                    first={
                        <IgnoreProvider>
                            {/* vạch ngang trái: kéo lên-xuống giữa Filter và gallery kết quả */}
                            <SplitPane
                                direction="rows"
                                storageKey="simpleFilterRowPct"
                                defaultFirstPct={DEFAULT_FILTER_ROW_PCT}
                                first={
                                    <SearchResultProvider>
                                        <Filter/>
                                    </SearchResultProvider>
                                }
                                second={
                                    <SearchResultProvider>
                                        <ImageResult/>
                                    </SearchResultProvider>
                                }
                            />
                        </IgnoreProvider>
                    }
                    second={
                        <IgnoreProvider>
                            {/* vạch ngang phải: kéo lên-xuống giữa Search và gallery kết quả */}
                            <SplitPane
                                direction="rows"
                                storageKey="simpleSearchRowPct"
                                defaultFirstPct={DEFAULT_SEARCH_ROW_PCT}
                                first={
                                    <SearchResultProvider>
                                        <Search/>
                                    </SearchResultProvider>
                                }
                                second={
                                    <SearchResultProvider>
                                        <ImageResult/>
                                    </SearchResultProvider>
                                }
                            />
                        </IgnoreProvider>
                    }
                />
            </IgnoreImageProvider>
        </SearchProvider>
    )
}
