"use client"

import { CanvasEditorProps, CustomObject } from "@/types/Object";
import { Rnd } from 'react-rnd';
import { 
    Box, 
    Typography,
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from "@mui/icons-material/Delete";
import ColorPalettePicker from "./ColorPalletePicker";
import { useState, useEffect } from "react";

function getContrastColor(bgColor: string) {
  // Bỏ dấu # nếu có
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Tính độ sáng theo công thức WCAG
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  // Ngưỡng khoảng 128-150 là phổ biến (ở đây dùng 128)
  return brightness > 128 ? "black" : "white";
}

export default function CanvasEditor({shapesOnCanvas, setShapesOnCanvas, handleDragStop, handleResizeStop, handleDeleteShape}: CanvasEditorProps) {
    const [openColorPicker, setOpenColorPicker] = useState(false)
    const [color, setColor] = useState("#FF9800")
    const [selectedShape, setSelectedShape] = useState<CustomObject>()

    
    const handleOpenColorPicker = (shape: CustomObject) => {
        setOpenColorPicker(true)
        setColor(shape.color)
        setSelectedShape(shape) // lưu shape đang chọn
    }

    useEffect(() => {
        if (selectedShape) {
            setShapesOnCanvas((prevShapes) =>
                prevShapes.map((shape) =>
                    shape.id === selectedShape.id
                        ? selectedShape 
                        : shape
                )
            );
        }
    }, [selectedShape, setShapesOnCanvas]);

    const [circleMode, setCircleMode] = useState(false)

    return (
        <Box className="w-full h-full">
            <Box className="w-full h-full flex justify-center items-center gap-10">
                <Box className="flex flex-col">
                    <Box
                        sx={{
                            width: "1280px",
                            height: "720px",
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            position: "relative",
                            backgroundImage: `linear-gradient(to right, #eee 1px, transparent 1px),
                                            linear-gradient(to bottom, #eee 1px, transparent 1px)`,
                            backgroundSize: "20px 20px",
                        }}
                    >
                        {shapesOnCanvas.map((shape) => {
                            const width = shape.x_max - shape.x_min;
                            const height = shape.y_max - shape.y_min;
                            const constrastColor = getContrastColor(shape.color)
                            return (
                                <Rnd
                                    key={shape.id}
                                    size={{ width: width, height: height }}
                                    position={{ x: shape.x_min, y: shape.y_min }}
                                    bounds="parent"
                                    onClick={() => handleOpenColorPicker(shape)}
                                    onDragStop={(e, d) => handleDragStop(d, shape, setShapesOnCanvas)}
                                    onResizeStop={(
                                        e: MouseEvent | TouchEvent,
                                        direction,
                                        ref: HTMLElement,
                                        delta,
                                        position: { x: number; y: number }
                                        ) => {handleResizeStop(ref, position, shape)}}
                                    style={{
                                        border: (openColorPicker && selectedShape && shape.id === selectedShape.id)
                                            ? `2px dashed ${constrastColor}`
                                            : `1px solid ${constrastColor}`,
                                        boxShadow: (openColorPicker && selectedShape && shape.id === selectedShape.id)
                                            ? '0 0 10px 3px rgba(0, 0, 0, 0.4)'
                                            : 'none',
                                        // backgroundColor: shape.only_bbox
                                        //                 ? "transparent"
                                        //                 : shape.only_name
                                        //                     ? "transparent"
                                        //                     : shape.color,
                                        backgroundColor: shape.color,
                                        borderRadius: circleMode ? "50%" : 4,
                                        position: "absolute",

                                    }}
                                    // style={{
  // 👉 bỏ border & nền nếu only_color
//   border: shape.only_color
//     ? "none"
//     : (openColorPicker && selectedShape && shape.id === selectedShape.id)
//         ? `2px dashed ${constrastColor}`
//         : `1px solid ${constrastColor}`,

//   boxShadow: (openColorPicker && selectedShape && shape.id === selectedShape.id && !shape.only_color)
//     ? '0 0 10px 3px rgba(0, 0, 0, 0.4)'
//     : 'none',

//   backgroundColor: shape.only_bbox || shape.only_name || shape.only_color
//     ? "transparent"
//     : shape.color,

//   borderRadius: circleMode ? "50%" : 4,
//   position: "absolute",
// }}

                                >
                                    {/* Container full-size to position icons and text */}
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Top Icons */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteShape(shape)}
                                            >
                                                <DeleteIcon fontSize="small" sx={{color: constrastColor}}/>
                                            </IconButton>
                                        </Box>

                                        {/* Centered Text */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%',
                                                padding: '0 4px',
                                            }}
                                        >
                                            <Typography variant="body2" 
                                                sx={{
                                                    // color: shape.only_color
                                                    //     ? shape.color // tên đổi màu theo color
                                                    //     : shape.only_name
                                                    //         ? "black" // hoặc "inherit" nếu muốn theo mặc định
                                                    //         : "black",
                                                    color: constrastColor
                                                }}
                                            >
                                                {shape.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Rnd>
                            );
                        })}
                    </Box>

                   

                </Box>


                {openColorPicker && (
                    <Rnd
                        default={{
                        x: 100,
                        y: 100,
                        width: 260,
                        height: 320,
                        }}
                        bounds="parent"
                        dragHandleClassName="palette-drag-handle"
                        style={{
                        zIndex: 2000,
                        position: "absolute",
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden", // chặn tràn ra ngoài Rnd
                        }}
                    >
                        {/* Header */}
                        <Box
                            className="palette-drag-handle"
                            sx={{
                                cursor: "move",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                px: 1,
                                py: 0.5,
                                borderBottom: "1px solid #eee",
                                backgroundColor: "#f9f9f9",
                                flexShrink: 0,
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Color Picker
                            </Typography>
                            <IconButton size="small" onClick={() => setOpenColorPicker(false)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Nội dung scroll được */}
                        <Box
                            sx={{
                                flex: 1,
                                overflow: "auto", // ✅ cho scroll dọc/ngang khi content tràn
                                p: 1,
                            }}
                        >
                        <ColorPalettePicker
                            color={color}
                            setColor={setColor}
                            selectedShape={selectedShape}
                            setSelectedShape={setSelectedShape}
                            circleMode={circleMode}
                            setCircleMode={setCircleMode}
                        />
                        </Box>
                    </Rnd>
                )}
            </Box>
        </Box>
    )
}

