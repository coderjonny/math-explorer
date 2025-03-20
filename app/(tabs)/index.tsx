import { StyleSheet, SafeAreaView, Dimensions } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLS = 100;
const ROWs = 100;
const squareWidth = SCREEN_WIDTH / COLS;

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        {Array.from({ length: COLS }).map((_, col) =>
          Array.from({ length: ROWs }).map((_, row) => (
            <Rect
              key={`${col}-${row}`}
              x={col * squareWidth}
              y={row * squareWidth}
              width={squareWidth}
              height={squareWidth}
              color={`hsl(${(col / COLS) * 360}, 100%, 50%)`}
            />
          ))
        )}
      </Canvas>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
