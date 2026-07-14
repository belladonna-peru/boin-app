import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, TAB_COLORS } from './theme';

const ICONS = { Boin: 'sparkles', Home: 'home', Chat: 'chatbubble-ellipses', Map: 'location', Mercado: 'storefront', Wallet: 'wallet', Yo: 'person' };
const ITEM_W = 78;
const W = Dimensions.get('window').width;

export default function BoinTabBar({ state, navigation }) {
  const { t } = useTheme();
  const ref = useRef(null);
  const [sx, setSx] = useState(0);
  const pad = W / 2 - ITEM_W / 2;

  const center = (i, animated = true) => ref.current && ref.current.scrollTo({ x: i * ITEM_W, animated });
  useEffect(() => { setTimeout(() => center(state.index, false), 50); }, []);
  useEffect(() => { center(state.index); }, [state.index]);

  // Al soltar el dedo, la sección que quedó al centro se activa sola
  const onEnd = (e) => {
    const i = Math.max(0, Math.min(state.routes.length - 1, Math.round(e.nativeEvent.contentOffset.x / ITEM_W)));
    if (i !== state.index) navigation.navigate(state.routes[i].name);
  };

  return (
    <View style={{ backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.border, height: 96, paddingTop: 6 }}>
      <ScrollView
        ref={ref} horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: pad, alignItems: 'flex-end' }}
        onScroll={e => setSx(e.nativeEvent.contentOffset.x)} scrollEventThrottle={16}
        snapToInterval={ITEM_W} decelerationRate="fast"
        onMomentumScrollEnd={onEnd}
      >
        {state.routes.map((route, i) => {
          const on = state.index === i;
          const c = TAB_COLORS[route.name] || t.acc;
          const itemCenter = i * ITEM_W + ITEM_W / 2 + pad;
          const d = Math.abs(itemCenter - (sx + W / 2));
          const k = Math.max(0, 1 - d / (W * 0.62));
          return (
            <TouchableOpacity key={route.key} activeOpacity={0.8}
              onPress={() => navigation.navigate(route.name)}
              style={{ width: ITEM_W, alignItems: 'center', paddingBottom: 12, opacity: 0.35 + 0.65 * k }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
                backgroundColor: on ? c : t.card,
                transform: [{ translateY: on ? -13 : 0 }, { scale: on ? 1 + 0.08 * k : 0.72 + 0.28 * k }],
                shadowColor: c, shadowOpacity: on ? 0.95 : 0, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
                elevation: on ? 12 : 0,
                borderWidth: 1.5, borderColor: on ? 'rgba(255,255,255,0.35)' : t.border,
              }}>
                <Ionicons name={on ? ICONS[route.name] : ICONS[route.name] + '-outline'} size={22} color={on ? '#fff' : c + 'AA'} />
              </View>
              <Text style={{ fontSize: 10, marginTop: 3, color: on ? c : t.mut, fontWeight: on ? '700' : '400' }}>{route.name}</Text>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: on ? c : 'transparent', marginTop: 2 }} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}