import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme';

export default function YoScreen({ user, onLogout }) {
  const { t, mode, setMode } = useTheme();
  const Item = ({ label, onPress, danger }) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: t.card }}>
      <Text style={{ color: danger ? t.acc : t.txt, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: t.mut }}>›</Text>
    </TouchableOpacity>
  );
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: 54, padding: 20, paddingBottom: 40 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: t.card, borderWidth: 3, borderColor: t.acc, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: t.txt, fontSize: 32, fontWeight: '800' }}>{user?.nombre?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={{ color: t.txt, fontSize: 20, fontWeight: '700', marginTop: 8 }}>{user?.nombre}</Text>
        <Text style={{ color: t.mut, fontSize: 13 }}>{user?.usuario}</Text>
        <View style={{ flexDirection: 'row', gap: 26, marginTop: 12 }}>
          <View style={{ alignItems: 'center' }}><Text style={{ color: t.txt, fontWeight: '700' }}>4</Text><Text style={{ color: t.mut, fontSize: 11 }}>patas</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={{ color: t.txt, fontWeight: '700' }}>2</Text><Text style={{ color: t.mut, fontSize: 11 }}>momentos</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={{ color: t.txt, fontWeight: '700' }}>81</Text><Text style={{ color: t.mut, fontSize: 11 }}>me gusta</Text></View>
        </View>
      </View>
      <Item label={'🎨 Apariencia: ' + (mode === 'dark' ? 'oscuro' : 'claro')} onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
      <Item label="💼 Tipo de cuenta (business / stream)" onPress={() => Alert.alert('Tipo de cuenta', 'Sondeo de 4 pasos + términos y condiciones — como en el prototipo. Se conecta a Supabase en la siguiente etapa.')} />
      <Item label="🔒 Privacidad de cuenta" onPress={() => Alert.alert('Privacidad', 'Pública o privada')} />
      <Item label="👤 Información personal" onPress={() => Alert.alert('Info', 'Nombre, correo de recuperación, cambio de número guiado')} />
      <Item label="🚪 Cerrar sesión" danger onPress={onLogout} />
    </ScrollView>
  );
}
