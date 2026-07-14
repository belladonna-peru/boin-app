import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme } from '../theme';
import Boinci from '../Boinci';

const FEATS = [
  { t: 'Llamadas y videollamadas en el chat', v: 128 },
  { t: 'Wallet: boinear plata a tus patas', v: 96 },
  { t: 'Modo streamer en el mapa', v: 74 },
  { t: 'Más mascotas y logros', v: 61 },
];

export default function BoinScreen() {
  const { t } = useTheme();
  const [votos, setVotos] = useState({});
  const [idea, setIdea] = useState('');
  const [ideas, setIdeas] = useState([]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: 54, padding: 18, paddingBottom: 40 }}>
      <Text style={{ color: t.acc, fontSize: 22, fontWeight: '800' }}>Boin</Text>
      <View style={{ alignItems: 'center', marginVertical: 10 }}><Boinci px={7} /></View>
      <Text style={{ color: t.mut, marginBottom: 16 }}>Tu espacio con Boinci: vota lo que viene y déjanos tus ideas.</Text>

      <Text style={{ color: t.txt, fontWeight: '700', marginBottom: 8 }}>🚀 En camino — vota lo que quieres primero</Text>
      {FEATS.map((f, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 }}>
          <Text style={{ color: t.txt, flex: 1, fontSize: 13 }}>{f.t}</Text>
          <TouchableOpacity disabled={votos[i]} onPress={() => setVotos(v => ({ ...v, [i]: true }))}
            style={{ borderColor: votos[i] ? t.acc : t.border, borderWidth: 1.5, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12 }}>
            <Text style={{ color: votos[i] ? t.acc : t.mut, fontSize: 13 }}>👍 {f.v + (votos[i] ? 1 : 0)}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={{ color: t.txt, fontWeight: '700', marginTop: 14, marginBottom: 8 }}>💡 Buzón de sugerencias</Text>
      <TextInput multiline value={idea} onChangeText={setIdea} placeholder="¿Qué le pondrías a Boin?" placeholderTextColor={t.mut}
        style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1.5, borderRadius: 14, padding: 12, color: t.txt, minHeight: 70, textAlignVertical: 'top' }} />
      <TouchableOpacity onPress={() => { if (idea.trim()) { setIdeas(a => [idea.trim(), ...a]); setIdea(''); Alert.alert('¡Gracias!', 'Tu idea alimenta a Boinci 🧡'); } }}
        style={{ backgroundColor: t.acc, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Enviar idea a Boinci</Text>
      </TouchableOpacity>
      {ideas.map((x, i) => (
        <View key={i} style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 8 }}>
          <Text style={{ color: t.acc2, fontSize: 12, fontWeight: '700' }}>Tu idea · en revisión</Text>
          <Text style={{ color: t.mut, fontSize: 12 }}>«{x}»</Text>
        </View>
      ))}
    </ScrollView>
  );
}
