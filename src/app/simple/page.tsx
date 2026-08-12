"use client" 

import Filter from "@/components/simple/Filter"
import Search from "@/components/simple/Search"
import ImageResult from "@/components/simple/ImageResult"
import Sidebar from "@/components/utils/Siderbar"

import { Box } from "@mui/material" 
import { useState } from "react"

import { IgnoreProvider, SearchProvider, SearchResultProvider } from "@/contexts/searchContext";
import { IgnoreImageProvider } from "@/contexts/ignoreContext"


export default function Simple() {    
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <SearchProvider>
            <IgnoreImageProvider>
                <Sidebar open={drawerOpen} setOpen={setDrawerOpen}/>
                
                <Box className="w-screen h-screen grid grid-cols-[1fr_2fr] gap-2">
                    <IgnoreProvider>
                        <Box className="w-full h-full p-2 grid grid-rows-[1fr_2fr] gap-1 min-h-0">
                            <SearchResultProvider>
                                <Filter/>
                                <ImageResult/>
                            </SearchResultProvider>
                        </Box>
                    </IgnoreProvider>
      

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


