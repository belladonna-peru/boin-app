import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useTheme } from '../theme';
import { socket } from '../socket';

export default function YoScreen({ user, onLogout }) {
  const { t, mode, setMode } = useTheme();
  const [perfil, setPerfil] = useState({ n: user?.nombre || 'Tú', usuario: user?.usuario || '', bio: '', patas: 0, momentos: 0, likes: 0 });
  const [editBio, setEditBio] = useState(false);
  const [bioTxt, setBioTxt] = useState('');

  useEffect(() => {
    const onPerfil = (p) => { setPerfil(p); setBioTxt(p.bio || ''); };
    socket.on('perfil', onPerfil);
    socket.emit('perfil');
    const onConnect = () => socket.emit('perfil');
    socket.on('connect', onConnect);
    return () => { socket.off('perfil', onPerfil); socket.off('connect', onConnect); };
  }, []);

  const guardarBio = () => {
    socket.emit('bio', { texto: bioTxt.trim() });
    setPerfil(p => ({ ...p, bio: bioTxt.trim() }));
    setEditBio(false);
  };

  const Item = ({ label, onPress, danger }) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: t.card, paddingHorizontal: 20 }}>
      <Text style={{ color: danger ? t.acc : t.txt, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: t.mut }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: 54, paddingBottom: 40 }}>
      <View style={{ alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 }}>
        <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: t.card, borderWidth: 3, borderColor: t.acc, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: t.txt, fontSize: 32, fontWeight: '800' }}>{(perfil.n || '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={{ color: t.txt, fontSize: 20, fontWeight: '700', marginTop: 8 }}>{perfil.n}</Text>
        <Text style={{ color: t.mut, fontSize: 13 }}>{perfil.usuario}</Text>

        {editBio ? (
          <View style={{ width: '100%', marginTop: 10 }}>
            <TextInput
              style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1.5, borderRadius: 14, padding: 10, color: t.txt, fontSize: 13, textAlign: 'center' }}
              value={bioTxt} onChangeText={setBioTxt} maxLength={120} multiline autoFocus
              placeholder="Ej: viviendo el momento 🧡" placeholderTextColor={t.mut}
            />
            <TouchableOpacity onPress={guardarBio} style={{ backgroundColor: t.acc, borderRadius: 12, padding: 10, alignItems: 'center', marginTop: 6 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditBio(true)}>
            <Text style={{ color: perfil.bio ? t.txt : t.mut, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              {perfil.bio || 'Toca para agregar tu descripción ✏️'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', gap: 30, marginTop: 14 }}>
          <View style={{ alignItems: 'center' }}><Text style={{ color: t.txt, fontWeight: '800', fontSize: 16 }}>{perfil.patas}</Text><Text style={{ color: t.mut, fontSize: 11 }}>patas</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={{ color: t.txt, fontWeight: '800', fontSize: 16 }}>{perfil.momentos}</Text><Text style={{ color: t.mut, fontSize: 11 }}>momentos</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={{ color: t.acc, fontWeight: '800', fontSize: 16 }}>{perfil.likes}</Text><Text style={{ color: t.mut, fontSize: 11 }}>me gusta</Text></View>
        </View>
      </View>

      <Item label={'🎨 Apariencia: ' + (mode === 'dark' ? 'oscuro' : 'claro')} onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
      <Item label="💼 Tipo de cuenta (business / stream)" onPress={() => Alert.alert('Boin', 'El sondeo de 4 pasos + panel exclusivo llega en la fase de negocios 🛍️')} />
      <Item label="🔒 Privacidad" onPress={() => Alert.alert('Boin', 'Tu ubicación SIEMPRE es privada: solo la ven los patas con quienes compartes 📍')} />
      <Item label="👤 Información personal" onPress={() => Alert.alert('Boin', 'Registrado con tu número ' + (user?.pais || '') + ' ' + (user?.num || ''))} />
      <Item label="🚪 Cerrar sesión" danger onPress={onLogout} />
    </ScrollView>
  );
}