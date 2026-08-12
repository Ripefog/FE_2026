import React from "react";
import { CustomObject } from "./Object";

export type ColorPalletePickerProps = {
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>
    selectedShape: CustomObject;
    setSelectedShape: React.Dispatch<React.SetStateAction<CustomObject>>;
    circleMode: boolean;
    setCircleMode: React.Dispatch<React.SetStateAction<boolean>>;
}