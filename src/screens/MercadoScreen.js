import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme';
import { NEGOCIOS } from '../data';

export default function MercadoScreen() {
  const { t } = useTheme();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const cats = [['all','Todo'],['comida','Comida'],['cafe','Café'],['musica','Música'],['night','Night']];
  const list = NEGOCIOS.filter(b => (cat === 'all' || b.cat === cat) &&
    (!q || b.n.toLowerCase().includes(q.toLowerCase()) || b.d.toLowerCase().includes(q.toLowerCase())));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: 54, padding: 16, paddingBottom: 40 }}>
      <Text style={{ color: t.txt, fontSize: 22, fontWeight: '700', marginBottom: 10 }}>Mercado</Text>
      <TextInput value={q} onChangeText={setQ} placeholder="Busca tiendas o productos…" placeholderTextColor={t.mut}
        style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1.5, borderRadius: 14, padding: 12, color: t.txt, marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {cats.map(([k, label]) => (
          <TouchableOpacity key={k} onPress={() => setCat(k)}
            style={{ backgroundColor: cat === k ? t.acc : t.card, borderColor: t.border, borderWidth: 1, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 13, margin: 3 }}>
            <Text style={{ color: cat === k ? '#fff' : t.mut, fontSize: 13 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={() => Alert.alert('Café Ayllu', '🎉 2x1 en capuchino hasta las 11am')}
        style={{ backgroundColor: '#3C3489', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>☕ Café Ayllu — 2x1 en capuchino</Text>
        <Text style={{ color: '#ddd', fontSize: 12, marginTop: 3 }}>Destacado de hoy 🎉</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {list.map(b => (
          <TouchableOpacity key={b.id} onPress={() => Alert.alert(b.emoji + ' ' + b.n, b.d + '\n\n🎉 ' + b.promo + '\n\nCatálogo, carrito y pedido por chat: se conectan a Supabase en la siguiente etapa.')}
            style={{ width: '48%', backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 10 }}>
            <View style={{ height: 64, borderRadius: 12, backgroundColor: t.bg, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
            </View>
            <Text style={{ color: t.txt, fontWeight: '700', fontSize: 13, marginTop: 8 }}>{b.n}</Text>
            <Text style={{ color: t.mut, fontSize: 11 }}>★ 4.7 · 15-25 min</Text>
            <Text style={{ color: t.acc2, fontSize: 11, marginTop: 3 }} numberOfLines={1}>{b.promo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
