import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme';
import { FRIENDS } from '../data';

const POSTS = [
  { id: 'p1', n: 'Karla', lugar: 'Café Ayllu', txt: '☕ Momento: tardeada de café', likes: 24, colores: ['#3C3489', '#FF4E3A'] },
  { id: 'p2', n: 'Beto', lugar: 'Neon Club', txt: '🎧 La zona está que arde', likes: 57, colores: ['#0F6E56', '#7F77DD'] },
];

export default function HomeScreen() {
  const { t, mode, setMode } = useTheme();
  const [likes, setLikes] = useState({});

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: 50, paddingBottom: 30 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, marginBottom: 12 }}>
        <Text style={{ color: t.acc, fontSize: 24, fontWeight: '800', letterSpacing: 1.5 }}>BOIN</Text>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <TouchableOpacity onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}><Text style={{ fontSize: 18 }}>{mode === 'dark' ? '🌙' : '☀️'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Actividades', '• Chio te envió una solicitud\n• A Valeria le gustó tu momento\n• Café Ayllu: 2x1 hasta las 11am\n• Boinci: ¡el mapa está que arde! 🔥')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 12, marginBottom: 8 }}>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={() => Alert.alert('Boin', 'Publica tu historia con MOMENT (botón de cámara del mapa)')}
            style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: t.acc, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: t.acc, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
          <Text style={{ color: t.mut, fontSize: 10, marginTop: 3 }}>Tu historia</Text>
        </View>
        {FRIENDS.map(f => (
          <View key={f.id} style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={() => Alert.alert('Historia de ' + f.n, '⏳ Visible 24 h')}
              style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2.5, borderColor: f.on ? t.acc : t.border, backgroundColor: t.card, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: t.txt, fontWeight: '700', fontSize: 16 }}>{f.n[0]}</Text>
            </TouchableOpacity>
            <Text style={{ color: t.mut, fontSize: 10, marginTop: 3 }}>{f.n}</Text>
          </View>
        ))}
      </ScrollView>

      {POSTS.map(p => (
        <View key={p.id} style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 18, margin: 12, marginHorizontal: 14, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: t.txt, fontWeight: '700', fontSize: 12 }}>{p.n[0]}</Text>
            </View>
            <Text style={{ color: t.txt, fontWeight: '700' }}>{p.n}</Text>
            <Text style={{ color: t.mut, fontSize: 11 }}>· {p.lugar}</Text>
          </View>
          <View style={{ height: 190, backgroundColor: p.colores[0], justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 15 }}>{p.txt}</Text>
          </View>
          <View style={{ flexDirection: 'row', padding: 12, gap: 18 }}>
            <TouchableOpacity onPress={() => setLikes(l => ({ ...l, [p.id]: !l[p.id] }))}>
              <Text style={{ color: likes[p.id] ? t.acc : t.mut }}>♥ {p.likes + (likes[p.id] ? 1 : 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Comentarios', 'Comentarios anidados: conectar a Supabase en la siguiente etapa')}>
              <Text style={{ color: t.mut }}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Compartir', '💬 A un pata · ➕ A tu historia · 🔗 Enlace')}>
              <Text style={{ color: t.mut }}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
