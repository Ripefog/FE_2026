"use client"

import { HexColorPicker } from "react-colorful";
import React, { useState } from "react";
import { 
  Box, 
  TextField, 
  Typography,
  Autocomplete,
  IconButton,
} from "@mui/material";
import { ColorPalletePickerProps } from "@/types/Color";
import { cssColorNames } from "@/constants/color";
import InvertColorsIcon from "@mui/icons-material/InvertColors"
import { presetColors } from "@/constants/color";
import { Switch, FormControlLabel } from "@mui/material"


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


export default function ColorPalettePicker({selectedShape, setSelectedShape}: ColorPalletePickerProps) {
  const [colorNameInput, setColorNameInput] = useState("");
  const [hexInput, setHexInput] = useState("");

  const rgbToHex = (rgb: string): string => {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#000000"; // fallback

  const [r, g, b] = result.map(Number);
    return (
      "#" +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
    );
  };
  const handleColorNameSubmit = () => {
    try {
      const temp = document.createElement("div");
      temp.style.color = colorNameInput;

      // Nếu tên màu hợp lệ, browser sẽ chấp nhận và đổi thành giá trị thực
      if (temp.style.color !== "") {
        document.body.appendChild(temp);
        const rgb = getComputedStyle(temp).color;
        document.body.removeChild(temp);

        const hex = rgbToHex(rgb);
         if (selectedShape) {
          setSelectedShape({ ...selectedShape, color: hex });
        }
      } else {
        alert("Tên màu không hợp lệ!");
      }
    } catch {
      alert("Tên màu không hợp lệ!");
    }
  };


  const handleHexSubmit = () => {
    const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
    const match = hexInput.match(hexRegex);
    if (match) {
      if (selectedShape) {
        setSelectedShape({ ...selectedShape, color: `#${match[1]}` });
      }
    } else {
      alert("Mã hex không hợp lệ!");
    }
  };

  const fields = ["name", "x_min", "y_min", "x_max", "y_max", "color"] as const;
  
  return (
    <Box className="h-[85vh] w-full flex flex-col justify-center items-center gap-5">
      {/* Toggle cho only_bbox / only_color / only_name */}
      <Box className="flex flex-col gap-2 w-full">
        <FormControlLabel
          control={
            <Switch
              checked={!!selectedShape?.only_bbox}
              onChange={(e) => {
                if (!selectedShape) return;
                const checked = e.target.checked;
                // Cập nhật selectedShape
                setSelectedShape({
                  ...selectedShape,
                  only_bbox: checked,
                  only_color: false,
                  only_name: false,
                });
              }}
            />
          }
          label="Only BBox"
        />

        <FormControlLabel
          control={
            <Switch
              checked={!!selectedShape?.only_color}
              onChange={(e) => {
                if (!selectedShape) return;
                const checked = e.target.checked;
                setSelectedShape({
                  ...selectedShape,
                  only_color: checked,
                  only_bbox: false,
                  only_name: false,
                });
              }}
            />
          }
          label="Only Color"
        />

        <FormControlLabel
          control={
            <Switch
              checked={!!selectedShape?.only_name}
              onChange={(e) => {
                if (!selectedShape) return;
                const checked = e.target.checked;
                setSelectedShape({
                  ...selectedShape,
                  only_name: checked,
                  only_bbox: false,
                  only_color: false,
                });
              }}
            />
          }
          label="Only Name"
        />
      </Box>


      <Box className="w-full grid grid-cols-5 gap-2">
        {presetColors.map((preset) => (
          <Box
            key={preset}
            onClick={() => {
              if (selectedShape) {
                setSelectedShape({ ...selectedShape, color: preset });
              }
            }}
            style={{
              backgroundColor: preset,
              width: 32,
              height: 32,
              borderRadius: 4,
              cursor: "pointer",
              border: preset === selectedShape.color ? "3px solid black" : "1px solid #ccc"
            }}
          />
        ))}
      </Box>
      
      <HexColorPicker
        color={selectedShape?.color || "#000000"}
        onChange={(hex) => {
          if (selectedShape) {
            setSelectedShape({ ...selectedShape, color: hex });
          }
        }}
      />
      
      {/* Input tên màu */}
      <Box className="flex justify-around items-center w-full gap-2">
        <Autocomplete
          options={cssColorNames}
          value={colorNameInput}
          onChange={(e, newValue) => {
            if (newValue) setColorNameInput(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tên màu (CSS)"
              variant="outlined"
              size="small"
            />
          )}
          fullWidth
          freeSolo // cho phép nhập tự do ngoài danh sách
        />

        <IconButton 
          onClick={handleColorNameSubmit} 
          color="primary" 
          size="small"
        >
          <InvertColorsIcon />
        </IconButton>
      </Box>


      {/* Input hex */}
      <Box className="flex justify-around items-center w-full gap-2">
        <TextField
          label="Mã Hex (VD: #ff0000)"
          variant="outlined"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          size="small"
          fullWidth
        />
        <IconButton 
          onClick={handleHexSubmit} 
          color="primary" 
          size="small"
        >
          <InvertColorsIcon />
        </IconButton>
      </Box>

      <Typography 
        sx={{
          backgroundColor: selectedShape.color, 
          color: getContrastColor(selectedShape.color),
          userSelect: 'text', // Cho phép bôi đen
          padding: '2px',
        }}
      >
          Selected {selectedShape.color}
      </Typography>
    </Box>
  );
}
