import {
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  View,
  Text,
} from "react-native";
import {
  Canvas,
  Group,
  Rect,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLS = 500;
const ROWS = 500;
const squareWidth = SCREEN_WIDTH / ROWS;

export default function HomeScreen() {
  const [bitmap, setBitmap] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(true);
  const [boundedCount, setBoundedCount] = useState(0);

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

  useEffect(() => {
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

    setBitmap(bitmap);
    setBoundedCount(count);
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "flex-start" }}>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <Canvas style={styles.canvas}>
            <Group>
              {bitmap &&
                Array.from({ length: ROWS }).map((_, row) =>
                  Array.from({ length: COLS }).map((_, col) => {
                    const index = row * COLS + col;
                    if (bitmap[index] === 1) {
                      return (
                        <Rect
                          key={`${row}-${col}`}
                          x={row * squareWidth}
                          y={col * squareWidth}
                          width={squareWidth}
                          height={squareWidth}
                        />
                      );
                    }
                    return null;
                  })
                )}
              <Rect
                x={0}
                y={SCREEN_WIDTH / 2}
                width={SCREEN_WIDTH}
                height={1}
                color="rgba(255, 255, 255, 0.5)"
              />
              <Rect
                x={SCREEN_WIDTH / 2}
                y={0}
                width={1}
                height={SCREEN_WIDTH}
                color="rgba(255, 255, 255, 0.5)"
              />
            </Group>
            <SweepGradient
              c={vec(SCREEN_WIDTH / 2, SCREEN_WIDTH / 2)}
              colors={["cyan", "magenta", "yellow", "cyan"]}
            />
          </Canvas>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text>
          {boundedCount} points in bounded set, {ROWS * COLS - boundedCount}{" "}
          points outside
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    marginTop: SCREEN_WIDTH / 2,
  },
  canvas: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 1)",
    height: SCREEN_WIDTH,
    alignSelf: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
});
