import { 
    Box,
    Typography,
    ImageList,
    ImageListItem
} from "@mui/material"
import * as React from 'react';
import { useSearchResultContext } from "@/contexts/searchContext";
import ImageGallery from "../imageGalllery/ImageGallery";

export default function ImageResult() {
    const {results, cols} = useSearchResultContext()
    const cols_value = cols === "" ? 2 : Number(cols);
    return (
        <Box className="w-full h-full p-2 overflow-y-scroll max-h-full border border-solid border-black">
            <Box className="h-[calc(100%-2rem)] w-full">
                <ImageGallery results={results} cols={cols_value} className="w-full h-auto" />
            </Box>

        </Box>
    )
}