import {
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  View,
  Text,
  ScrollView,
} from "react-native";
import {
  Canvas,
  Group,
  Rect,
  SweepGradient,
  vec,
  Image,
} from "@shopify/react-native-skia";
import { useMathContext } from "@/contexts/MathContext";
import { ROWS, COLS } from '@/constants/MathConstants'

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const squareWidth = SCREEN_WIDTH / ROWS;

export default function HomeScreen() {
  const { bitmap, image, loading, boundedCount } = useMathContext();

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={{ width: SCREEN_WIDTH, marginBottom: 50 }}>
        <View style={styles.canvasArea}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <Canvas style={[styles.canvas, { height: SCREEN_WIDTH }]}>
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
        <Canvas style={[styles.canvas, { height: SCREEN_WIDTH }]}>
          {image && (
            <Image
              image={image}
              x={0}
              y={0}
              width={SCREEN_WIDTH}
              height={SCREEN_WIDTH}
              fit="cover" // Changed from "contain" to "cover" for better display
            />
          )}
        </Canvas>
        <View style={styles.titleContainer}>
          <Text>
            {boundedCount} bounded points, {ROWS * COLS - boundedCount} unbounded
            points
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    alignItems: "center", // Center everything horizontally
  },
  canvasArea: {
    flexDirection: "column", // Change from "row" to "column"
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    marginTop: SCREEN_WIDTH / 2,
  },
  canvas: {
    backgroundColor: "rgba(0, 0, 0, 1)",
    height: SCREEN_WIDTH,
    width: SCREEN_WIDTH,
    marginBottom: 10, // Add some spacing between canvases
  },
  titleContainer: {
    alignItems: "center",
    padding: 10,
    width: SCREEN_WIDTH,
  },
});
