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
const COLS = 200;
const ROWS = 200;
const squareWidth = SCREEN_WIDTH / ROWS;

type square = {
  row: number;
  col: number;
};

export default function HomeScreen() {
  const [squares, setSquares] = useState<square[]>([]);
  const [unboundedSquares, setUnboundedSquares] = useState<square[]>([]);
  const [loading, setLoading] = useState(true);

  const isBounded = (x: number, y: number) => {
    const maxIterations = 40;
    let realNum = 0;
    let imaginaryNum = 0;

    for (let i = 0; i < maxIterations; i++) {
      const realNumSquared = realNum * realNum;
      const imaginaryNumSquared = imaginaryNum * imaginaryNum;
      const complexNumber = realNum * realNum + imaginaryNum * imaginaryNum;

      if (complexNumber > 4) return false;

      const nextImaginaryNum = 2 * realNum * imaginaryNum + y;
      realNum = realNumSquared - imaginaryNumSquared + x;
      imaginaryNum = nextImaginaryNum;
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
    let squares: square[] = [];
    let unboundedSquares: square[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const [xComponent, yComponent] = getCoordinates(row, col);
        const hue = 255 / (row + col || 1); // Avoid division by zero
        const square = { row, col, hue };
        if (isBounded(xComponent, yComponent)) {
          squares.push(square);
        } else {
          unboundedSquares.push(square);
        }
      }
    }
    setSquares(squares);
    setUnboundedSquares(unboundedSquares);
    setLoading(false);
  }, []);

  console.log(squares.length, unboundedSquares.length);
  const partitions = 4;

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
              {Array.from({ length: partitions }).map((_, partIndex) => {
                const total = unboundedSquares.length;
                const start = (total / partitions) * partIndex;
                const end = (total / partitions) * (partIndex + 1);
                return unboundedSquares
                  .slice(start, end)
                  .map((square, index) => {
                    return (
                      <Rect
                        key={`${square.row}-${square.col}-${partIndex}-${index}`}
                        x={square.row * squareWidth}
                        y={square.col * squareWidth}
                        width={squareWidth}
                        height={squareWidth}
                      >
                        <SweepGradient
                          c={vec(
                            SCREEN_WIDTH / 2,
                            SCREEN_WIDTH / 2,
                          )}
                          colors={["darkblue", "cyan", "magenta", "darkblue"]}
                        />
                      </Rect>
                    );
                  });
              })}
              {squares.map((square, index) => (
                <Rect
                  key={index}
                  x={square.row * squareWidth}
                  y={square.col * squareWidth}
                  width={squareWidth}
                  height={squareWidth}
                />
              ))}
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
        <Text>{squares.length + unboundedSquares.length} grid calcuations</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    height: SCREEN_WIDTH,
    alignSelf: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
});
