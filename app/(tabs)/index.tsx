import {
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  View,
  Text,
} from "react-native";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
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
  const [loading, setLoading] = useState(true);

  const isBounded = (x: number, y: number) => {
    const maxIterations = 40;
    let realNum = 0;
    let imaginaryNum = 0;

    for (let i = 0; i < maxIterations; i++) {
      const realNumSquared = realNum * realNum;
      const imaginaryNumSquared = imaginaryNum * imaginaryNum;
      const complexNumber = realNum * realNum + imaginaryNum * imaginaryNum;

      // console.log({ i, x, y, realNum, imaginaryNum, complexNumber });
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
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const [xComponent, yComponent] = getCoordinates(row, col);
        const square = { row, col };
        if (isBounded(xComponent, yComponent)) {
          squares.push(square);
        }
      }
    }
    setSquares(squares);
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
              {squares.map((square, index) => (
                <Rect
                  key={index}
                  x={square.row * squareWidth}
                  y={square.col * squareWidth}
                  width={squareWidth}
                  height={squareWidth}
                  color={`hsl(${(square.row / COLS) * 360}, 100%, 50%)`}
                />
              ))}
            </Group>
          </Canvas>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text>
          {ROWS * COLS} calcuations 
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
    backgroundColor: "darkblue",
    height: SCREEN_WIDTH,
    alignSelf: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
});
