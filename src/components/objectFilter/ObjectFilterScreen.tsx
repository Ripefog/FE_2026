"use client"

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DraggableData } from 'react-rnd';

import { CustomObject } from '@/types/Object';
import CanvasEditor from './CanvasEditor';
import { cocoObjects } from '@/constants/object';
import { CountMeta } from '@/types/Search';
import ObjectList from './ObjectList';

const getRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};
const getRandomSize = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


type ObjectFilterScreenProps = {
  shapesOnCanvas: CustomObject[];
  setShapesOnCanvas: React.Dispatch<React.SetStateAction<CustomObject[]>>;
  setOpenObjectFilter: React.Dispatch<React.SetStateAction<boolean>>;
  countMeta: CountMeta;
  setCountMeta: React.Dispatch<React.SetStateAction<CountMeta>>;
};


export default function ObjectFilterScreen( {shapesOnCanvas, setShapesOnCanvas, setOpenObjectFilter, countMeta, setCountMeta}:ObjectFilterScreenProps ) {
  const handleAddShape = (shapeTemplate: any) => {
    const x = 50;
    const y = 50;
    const newShape: CustomObject = {
      id: Date.now(),
      name: `${shapeTemplate.name}`,
      x_min: x,
      x_max: x + shapeTemplate.width,
      y_min: y,
      y_max: y + shapeTemplate.height,
      width: shapeTemplate.width,
      height: shapeTemplate.height,
      color: shapeTemplate.color,
    };
    setShapesOnCanvas([...shapesOnCanvas, newShape]);
  };

  const handleDragStop = (
    data: DraggableData,
    shape: CustomObject,
    setShapesOnCanvas: React.Dispatch<React.SetStateAction<CustomObject[]>>
  ) => {
    const dx = data.x;
    const dy = data.y;
    const updatedWidth = shape.x_max - shape.x_min;
    const updatedHeight = shape.y_max - shape.y_min;

    setShapesOnCanvas((prev) =>
        prev.map((s) =>
        s.id === shape.id
            ? {
                ...s,
                x_min: dx,
                x_max: dx + updatedWidth,
                y_min: dy,
                y_max: dy + updatedHeight,
            }
            : s
        )
    );
  };

  const handleResizeStop = (ref: HTMLElement, position: { x: number; y: number }, shape:CustomObject) => {
    {
        const newWidth = parseInt(ref.style.width, 10);
        const newHeight = parseInt(ref.style.height, 10);
        const { x, y } = position;

        setShapesOnCanvas((prev) =>
            prev.map((s) =>
            s.id === shape.id
                ? {
                    ...s,
                    x_min: x,
                    x_max: x + newWidth,
                    y_min: y,
                    y_max: y + newHeight,
                }
                : s
            )
        );
    }
  }

  const handleDeleteShape = (shapeToDelete: CustomObject) => {
      setShapesOnCanvas(prevShapes =>
          prevShapes.filter(shape => shape.id !== shapeToDelete.id)
      );
  };

  const names = cocoObjects
  
  const [defaultShapes, setDefaultShapes] = useState<CustomObject[]>([]);
  useEffect(() => {
    const shapes = names.map((name) => {
      const width = getRandomSize(50, 100);
      const height = getRandomSize(50, 100);
      return {
        id: Date.now() + Math.random(),
        name,
        x_min: 0,
        x_max: 0,
        y_min: 0,
        y_max: 0,
        color: getRandomColor(),
        width,
        height,
      };
    });
    setDefaultShapes(shapes);
  }, []);


  return (
    <Box className="w-screen h-screen flex justify-center items-center bg-white">
      {/* Sidebar: List shape */}
      <ObjectList 
        objects={defaultShapes} 
        handleAddShape={(shapeTemplate) => handleAddShape(shapeTemplate)}
        shapesOnCanvas={shapesOnCanvas}
        setOpenObjectFilter={setOpenObjectFilter}
        countMeta={countMeta}               
        setCountMeta={setCountMeta}         
      />

      {/* Canvas with grid */}
      <CanvasEditor
        shapesOnCanvas={shapesOnCanvas}
        setShapesOnCanvas={setShapesOnCanvas}
        handleDragStop={handleDragStop}
        handleResizeStop={handleResizeStop}
        handleDeleteShape={handleDeleteShape}
      />
    </Box>
  );
}
