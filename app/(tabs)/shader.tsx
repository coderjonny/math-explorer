import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Canvas, Skia, Shader, Fill } from "@shopify/react-native-skia";
import type { SkShader } from "@shopify/react-native-skia";
import {
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ShaderDemo = () => {
  const [shader, setShader] = useState<SkShader | null>(null);
  const [renderTime, setRenderTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const width = 500;
  const height = 500;

  const shaderCode = `
  uniform float iTime;
  uniform float width;
  uniform float height;
  const float maxIterations = 100.0;

  vec3 getColor(float iteration, float maxIter) {
    // Create time-based color cycling
    float t = iteration / maxIter;
    float r = 0.5 + 0.5 * sin(t * 20.0 + iTime);
    float g = 0.5 + 0.5 * sin(t * 15.0 + iTime * 0.8);
    float b = 0.5 + 0.5 * sin(t * 10.0 + iTime * 1.2);
    
    return vec3(r, g, b);
  }

  vec4 main(vec2 fragCoord) {
    // Map pixel coordinates to complex plane (-2 to 2)
    float x = (fragCoord.x / width) * 4.0 - 2.0;
    float y = (fragCoord.y / height) * 4.0 - 2.0;
    
    float cReal = x;
    float cImag = y;
    float zReal = 0.0;
    float zImag = 0.0;
    
    for (float i = 0.0; i < maxIterations; i++) {
      float zReal2 = zReal * zReal;
      float zImag2 = zImag * zImag;
      
      // Check if point escapes
      if (zReal2 + zImag2 > 4.0) {
        // Return color for unbounded points
        vec3 color = getColor(i, maxIterations);
        return vec4(color, 1.0);
      }
      
      float temp = zReal2 - zImag2 + cReal;
      zImag = 2.0 * zReal * zImag + cImag;
      zReal = temp;
    }
    
    // Return black for bounded points
    return vec4(1.0, 1.0, 1.0, 1.0);
  }
  `;

  const time = useSharedValue(0);
  const uniforms = useDerivedValue(() => {
    return { iTime: time.value, width, height };
  }, [time.value]);
  const [isPlaying, setIsPlaying] = useState(true);

  // Animate the time value
  useEffect(() => {
    if (isPlaying) {
      time.value = withRepeat(withTiming(10, { duration: 10000 }), -1, true);
    } else {
      cancelAnimation(time);
    }
    return () => cancelAnimation(time);
  }, [isPlaying]);

  useEffect(() => {
    const startTime = performance.now();
    setLoading(true);
    // Create a shared value for time

    try {
      const runtimeEffect = Skia.RuntimeEffect.Make(shaderCode)!;
      if (runtimeEffect) {
        setShader(runtimeEffect);
      }
    } catch (error) {
      console.error("Failed to create RuntimeEffect.", error);
    }

    const endTime = performance.now();
    setLoading(false);
    setRenderTime(endTime - startTime);
  }, [width, height, shaderCode]);

  const isPlayingPlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Calculating points</Text>
        </View>
      ) : (
        <View>
          <Canvas style={styles.canvas}>
            <Fill>
              {shader && <Shader uniforms={uniforms} source={shader} />}
            </Fill>
          </Canvas>
          <Text style={styles.renderTimeText}>
            Calculation Time: {renderTime.toFixed(2)}ms
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => isPlayingPlay()}>
            <Text>{isPlaying ? "pause" : "play"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  canvas: {
    width: 500,
    height: 500,
  },
  renderTimeText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "lightgray",
    borderRadius: 5,
    alignItems: "center",
  }
});

export default ShaderDemo;
