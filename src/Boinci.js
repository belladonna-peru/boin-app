import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const PAL = { C: '#3C3489', O: '#FF6B3D', H: '#FFA07A', W: '#FFFFFF', B: '#1E1B2E', D: '#C43C1E' };
const MAPA = [
  '...CCCCCC...',
  '..CCCCCCCCC.',
  '..OHOOOOOO..',
  '.OHWWOOWWOO.',
  '.OOWBOOWBOO.',
  '.OOOOOOOOOO.',
  '.OOODDDDOOO.',
  '..OOOOOOOO..',
  '...OOOOOO...',
];

export default function Boinci({ px = 6, rebota = true }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!rebota) return;
    Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -14, duration: 380, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 320, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      {MAPA.map((fila, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          {[...fila].map((ch, j) => (
            <View key={j} style={{ width: px, height: px, backgroundColor: ch === '.' ? 'transparent' : PAL[ch] }} />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}