import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
    Skia,
    ColorType,
    AlphaType,
    SkImage,
} from "@shopify/react-native-skia";
import { COLS, ROWS } from "@/constants/MathConstants";

interface MathContextType {
    bitmap: Uint8Array,
    image?: SkImage,
    loading: boolean,
    boundedCount: number
}

const MathContext = createContext<MathContextType>({
    bitmap: new Uint8Array,
    image: undefined,
    loading: false,
    boundedCount: 0
})

export const useMathContext = () => useContext(MathContext)

export const MathProvider = ({ children }: { children: ReactNode }) => {
    const [bitmap, setBitmap] = useState<Uint8Array>(new Uint8Array);
    const [image, setImage] = useState<SkImage | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [boundedCount, setBoundedCount] = useState(0)

    useEffect(() => {
        setLoading(true)
        const [bitmap, count] = createBitmap();
        setBitmap(bitmap)
        setBoundedCount(count)
        setLoading(false)
        const image = createImage(bitmap)
        setImage(image);
    }, [])

    const isBounded = (cReal: number, cImagine: number) => {
        const maxIterations = 20;
        let zReal = 0;
        let zImagine = 0;

        for (let i = 0; i < maxIterations; i++) {
            const zRealTemp = zReal * zReal - zImagine * zImagine + cReal;
            const zImagineTemp = 2 * zReal * zImagine + cImagine;

            zReal = zRealTemp;
            zImagine = zImagineTemp;

            if (zReal * zReal + zImagine * zImagine > 4) return false;
        }

        return true;
    };

    const createBitmap = (): [Uint8Array, number] => {
        const bitmap = new Uint8Array(ROWS * COLS);
        let count = 0;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const [x, y] = getCoordinates(row, col);
                const index = row * COLS + col;

                if (isBounded(x, y)) {
                    bitmap[index] = 1;
                    count++;
                } else {
                    bitmap[index] = 0; // 0 = outside the set
                }
            }
        }

        return [bitmap, count];
    }

    const createImage = (bitmap: Uint8Array) => {
        const imageData = new Uint8Array(bitmap.length * 4);

        for ( let row = 0; row < ROWS; row++ ) {
            for ( let col = 0; col < COLS; col++ ) {
                const srcIndex = row * COLS + col
                const destIndex = (col * ROWS + row) * 4

                if (bitmap[srcIndex] === 1) {
                    imageData[destIndex] = Math.floor((col / ROWS) * 255); // R
                    imageData[destIndex + 1] = Math.floor((row % COLS) * 255); // G
                    imageData[destIndex + 2] = Math.floor((row / COLS) * 255); // B
                    imageData[destIndex + 3] = 255; // A
                } else {
                    // color pixel dark
                    imageData[destIndex] = 0;
                    imageData[destIndex + 1] = 0;
                    imageData[destIndex + 2] = 0;
                    imageData[destIndex + 3] = 255;
                }
            }
        }

        const data = Skia.Data.fromBytes(imageData);
        const imageInfo = {
            alphaType: AlphaType.Opaque,
            colorType: ColorType.RGBA_8888,
            height: ROWS,
            width: COLS,
        }
        const image = Skia.Image.MakeImage(imageInfo, data, COLS * 4);
        return image ? image : undefined;
    }

    const getCoordinates = (row: number, col: number) => {
        const minX = -2;
        const maxX = 2;
        const minY = -2;
        const maxY = 2;
        const gridWidth = maxX - minX;
        const gridHeight = maxY - minY;
        const x = gridWidth * (row / ROWS) - maxX;
        const y = gridHeight * (col / COLS) - maxY;
        return [x, y];
    };

    return (
        <MathContext.Provider value={{ bitmap, image, loading, boundedCount }} >
            {children}
        </MathContext.Provider>
    )
}