import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme';
import { socket } from '../socket';

const COLORES_MOM = ['#3C3489', '#0F6E56', '#993C1D', '#72243E'];

function hace(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return 'hace ' + Math.floor(s / 60) + ' min';
  if (s < 86400) return 'hace ' + Math.floor(s / 3600) + ' h';
  return 'hace ' + Math.floor(s / 86400) + ' d';
}

export default function HomeScreen() {
  const { t, mode, setMode } = useTheme();
  const [feed, setFeed] = useState([]);
  const [txt, setTxt] = useState('');
  const [color, setColor] = useState(0);
  const yoRef = useRef({ id: null });

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('boinUser');
      const u = raw ? JSON.parse(raw) : {};
      let id = await AsyncStorage.getItem('boinDevId');
      if (!id) { id = 'u' + Math.random().toString(36).slice(2, 9); await AsyncStorage.setItem('boinDevId', id); }
      yoRef.current = { id, nombre: u.nombre || 'Pata', usuario: u.usuario || '', num: u.num || '' };
      socket.emit('hola', { id, n: yoRef.current.nombre, usuario: yoRef.current.usuario, num: yoRef.current.num });
      socket.emit('feed');
    })();

    const onFeed = (lista) => setFeed(lista || []);
    const onNuevo = (m) => setFeed(prev => [m, ...prev.filter(x => x.id !== m.id)]);
    const onLike = (d) => setFeed(prev => prev.map(m => m.id === d.id ? { ...m, likes: d.likes, meGusta: d.meGusta !== undefined ? d.meGusta : m.meGusta } : m));
    const onAviso = (texto) => Alert.alert('Boin', texto);
    const onConnect = () => { const m = yoRef.current; if (m.id) { socket.emit('hola', { id: m.id, n: m.nombre, usuario: m.usuario, num: m.num }); socket.emit('feed'); } };

    socket.on('feed', onFeed);
    socket.on('momento-nuevo', onNuevo);
    socket.on('momento-like', onLike);
    socket.on('aviso', onAviso);
    socket.on('connect', onConnect);

    return () => {
      socket.off('feed', onFeed);
      socket.off('momento-nuevo', onNuevo);
      socket.off('momento-like', onLike);
      socket.off('aviso', onAviso);
      socket.off('connect', onConnect);
    };
  }, []);

  const publicar = () => {
    if (!txt.trim()) return;
    socket.emit('momento-publicar', { texto: txt.trim(), color });
    setTxt('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 54, marginBottom: 10 }}>
        <Text style={{ color: t.acc, fontSize: 24, fontWeight: '800', letterSpacing: 1.5 }}>BOIN</Text>
        <TouchableOpacity onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
          <Text style={{ fontSize: 18 }}>{mode === 'dark' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 18, marginHorizontal: 14, marginBottom: 10, padding: 12 }}>
        <TextInput
          style={{ color: t.txt, fontSize: 14, minHeight: 40 }}
          placeholder="¿Qué está pasando? Publica tu momento…" placeholderTextColor={t.mut}
          value={txt} onChangeText={setTxt} multiline maxLength={200}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          {COLORES_MOM.map((c, i) => (
            <TouchableOpacity key={i} onPress={() => setColor(i)}
              style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, marginRight: 8, borderWidth: color === i ? 2.5 : 0, borderColor: '#fff' }} />
          ))}
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={publicar} style={{ backgroundColor: t.acc, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 18 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>¡Boin! 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={feed}
        keyExtractor={m => String(m.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 18, marginHorizontal: 14, marginBottom: 10, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item.de === yoRef.current.id ? t.acc : t.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{item.n[0].toUpperCase()}</Text>
              </View>
              <Text style={{ color: t.txt, fontWeight: '700' }}>{item.de === yoRef.current.id ? 'Tú' : item.n}</Text>
              <Text style={{ color: t.mut, fontSize: 11 }}>· {hace(item.ts)}</Text>
            </View>
            <View style={{ minHeight: 130, backgroundColor: COLORES_MOM[item.color % COLORES_MOM.length], justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800', textAlign: 'center' }}>{item.texto}</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: 12, gap: 18 }}>
              <TouchableOpacity onPress={() => socket.emit('momento-like', { id: item.id })}>
                <Text style={{ color: item.meGusta ? t.acc : t.mut, fontWeight: item.meGusta ? '700' : '400' }}>♥ {item.likes}</Text>
              </TouchableOpacity>
              <Text style={{ color: t.mut }}>💬 pronto</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: t.mut, textAlign: 'center', padding: 30, lineHeight: 20 }}>
            Tu feed está vacío.{'\n'}Publica tu primer momento o agrega patas en Chat 🧡
          </Text>
        }
      />
    </KeyboardAvoidingView>
  );
}