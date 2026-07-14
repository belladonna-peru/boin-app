import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme';
import { socket } from '../socket';

export default function ChatScreen() {
  const { t } = useTheme();
  const [yo, setYo] = useState({ id: null, nombre: 'Pata' });
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [txt, setTxt] = useState('');
  const [escribe, setEscribe] = useState(null);
  const listRef = useRef(null);
  const yoRef = useRef(yo);
  useEffect(() => { yoRef.current = yo; }, [yo]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('boinUser');
      const u = raw ? JSON.parse(raw) : {};
      let id = await AsyncStorage.getItem('boinDevId');
      if (!id) { id = 'u' + Math.random().toString(36).slice(2, 9); await AsyncStorage.setItem('boinDevId', id); }
      const me = { id, nombre: u.nombre || 'Pata', usuario: u.usuario || '', num: u.num || '' };
      setYo(me);
      socket.emit('hola', { id: me.id, n: me.nombre, usuario: me.usuario, num: me.num });
    })();

    const onEstado = (e) => { setAmigos(e.amigos || []); setSolicitudes(e.solicitudes || []); };
    const onResultados = (r) => setResultados(r || []);
    const onChat = (m) => {
      setMsgs(prev => [...prev, m]);
      setTimeout(() => listRef.current && listRef.current.scrollToEnd({ animated: true }), 100);
    };
    const onEscribe = (d) => { setEscribe(d.de); setTimeout(() => setEscribe(null), 2500); };
    const onAviso = (texto) => Alert.alert('Boin', texto);
    const onConnect = () => {
      const m = yoRef.current;
      if (m.id) socket.emit('hola', { id: m.id, n: m.nombre, usuario: m.usuario, num: m.num });
    };

    socket.on('estado', onEstado);
    socket.on('resultados', onResultados);
    socket.on('chat', onChat);
    socket.on('escribiendo', onEscribe);
    socket.on('aviso', onAviso);
    socket.on('connect', onConnect);
    const onHistorial = ({ con, lista }) => {
      setMsgs(prev => {
        const otros = prev.filter(m => !((m.de === con && m.para === yoRef.current.id) || (m.de === yoRef.current.id && m.para === con)));
        return [...otros, ...lista];
      });
    };

    return () => {
      socket.off('estado', onEstado);
      socket.off('resultados', onResultados);
      socket.off('chat', onChat);
      socket.off('escribiendo', onEscribe);
      socket.off('aviso', onAviso);
      socket.off('connect', onConnect);
      socket.on('historial', onHistorial);
    };
  }, []);

  const buscar = (v) => { setQ(v); if (v.trim().length >= 2) socket.emit('buscar', v.trim()); else setResultados([]); };
  const enviar = () => {
    if (!txt.trim() || !abierto) return;
    socket.emit('chat', { para: abierto.id, texto: txt.trim() });
    setTxt('');
  };

  const S = {
    input: { backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, color: t.txt, fontSize: 14 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderColor: t.card },
    ava: (col) => ({ width: 48, height: 48, borderRadius: 24, backgroundColor: t.card, borderWidth: 2.5, borderColor: col, justifyContent: 'center', alignItems: 'center', marginRight: 12 }),
    btn: { backgroundColor: t.acc, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 },
  };

  // ===== CONVERSACIÓN =====
  if (abierto) {
    const conv = msgs.filter(m => (m.de === abierto.id && m.para === yo.id) || (m.de === yo.id && m.para === abierto.id));
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingTop: 54, borderBottomWidth: 1, borderColor: t.border }}>
          <TouchableOpacity onPress={() => setAbierto(null)}><Text style={{ color: t.acc, fontSize: 24, marginRight: 12 }}>←</Text></TouchableOpacity>
          <View style={S.ava(abierto.online ? t.acc : t.border)}><Text style={{ color: t.txt, fontWeight: '800' }}>{abierto.n[0].toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.txt, fontWeight: '700', fontSize: 16 }}>{abierto.n}</Text>
            <Text style={{ color: escribe === abierto.id ? t.teal : t.mut, fontSize: 11 }}>
              {escribe === abierto.id ? 'escribiendo…' : (abierto.online ? 'en línea' : 'desconectado')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => {
            const on = !abierto.leComparto;
            socket.emit('compartir', { con: abierto.id, on });
            setAbierto(a => ({ ...a, leComparto: on }));
            Alert.alert('Boin', on ? '📍 Ahora ' + abierto.n + ' ve tu ubi en tiempo real (hasta que TÚ lo apagues)' : '🚫 Dejaste de compartir tu ubi con ' + abierto.n);
          }}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: abierto.leComparto ? t.acc : t.card, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 17 }}>📍</Text>
          </TouchableOpacity>
        </View>
        <FlatList ref={listRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }} data={conv} keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => {
            const mio = item.de === yo.id;
            return (
              <View style={{ alignSelf: mio ? 'flex-end' : 'flex-start', backgroundColor: mio ? t.acc : t.card, borderRadius: 16, borderBottomRightRadius: mio ? 5 : 16, borderBottomLeftRadius: mio ? 16 : 5, padding: 10, paddingHorizontal: 14, marginVertical: 3, maxWidth: '78%', borderWidth: mio ? 0 : 1, borderColor: t.border }}>
                <Text style={{ color: mio ? '#fff' : t.txt, fontSize: 14 }}>{item.texto}</Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={{ color: t.mut, textAlign: 'center', marginTop: 30 }}>Salúdalo con un ¡boin! 🧡</Text>} />
        <View style={{ flexDirection: 'row', padding: 10, paddingBottom: 14, gap: 8, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => socket.emit('chat', { para: abierto.id, texto: '¡Boin! Ya voy 📍' })}
            style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>📍</Text>
          </TouchableOpacity>
          <TextInput style={[S.input, { flex: 1 }]} placeholder="Escribe algo…" placeholderTextColor={t.mut}
            value={txt} onChangeText={(v) => { setTxt(v); if (v) socket.emit('escribiendo', { para: abierto.id }); }} onSubmitEditing={enviar} />
          <TouchableOpacity onPress={enviar} style={{ backgroundColor: t.acc, borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ===== LISTA + BÚSQUEDA + SOLICITUDES =====
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 54 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 10 }}>
        <Text style={{ color: t.txt, fontSize: 22, fontWeight: '700', flex: 1 }}>Chat</Text>
        <TouchableOpacity onPress={() => { setBuscando(b => !b); setResultados([]); setQ(''); }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: buscando ? t.acc : t.card, borderWidth: 1, borderColor: t.border, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16 }}>{buscando ? '✕' : '🔍'}</Text>
        </TouchableOpacity>
      </View>

      {buscando && (
        <View style={{ paddingHorizontal: 18, marginBottom: 8 }}>
          <TextInput style={S.input} autoFocus placeholder="Nombre, @usuario o número de celular…" placeholderTextColor={t.mut}
            value={q} onChangeText={buscar} />
          {resultados.map(r => (
            <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: t.card }}>
              <View style={S.ava(t.border)}><Text style={{ color: t.txt, fontWeight: '800' }}>{r.n[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.txt, fontWeight: '700' }}>{r.n}</Text>
                <Text style={{ color: t.mut, fontSize: 12 }}>{r.usuario} {r.num ? '· ' + r.num : ''}</Text>
              </View>
              {r.esAmigo
                ? <Text style={{ color: t.teal, fontSize: 13 }}>✓ Patas</Text>
                : r.pendiente
                  ? <Text style={{ color: t.mut, fontSize: 13 }}>Enviada ✓</Text>
                  : <TouchableOpacity style={S.btn} onPress={() => { socket.emit('solicitud', { para: r.id }); setResultados(rs => rs.map(x => x.id === r.id ? { ...x, pendiente: true } : x)); }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Agregar</Text>
                    </TouchableOpacity>}
            </View>
          ))}
          {q.length >= 2 && resultados.length === 0 && <Text style={{ color: t.mut, fontSize: 13, textAlign: 'center', padding: 12 }}>Sin resultados (esa persona debe haber abierto Boin al menos una vez)</Text>}
        </View>
      )}

      {solicitudes.length > 0 && (
        <View style={{ paddingHorizontal: 18, marginBottom: 6 }}>
          <Text style={{ color: t.acc2, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>Solicitudes</Text>
          {solicitudes.map(s => (
            <View key={s.de} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.card, borderRadius: 14, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: t.border }}>
              <View style={S.ava(t.acc)}><Text style={{ color: t.txt, fontWeight: '800' }}>{s.deN[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.txt, fontWeight: '700' }}>{s.deN}</Text>
                <Text style={{ color: t.mut, fontSize: 12 }}>{s.usuario}</Text>
              </View>
              <TouchableOpacity style={[S.btn, { marginRight: 6 }]} onPress={() => socket.emit('responder', { de: s.de, acepta: true })}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 8 }} onPress={() => socket.emit('responder', { de: s.de, acepta: false })}>
                <Text style={{ color: t.mut }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <FlatList data={amigos} keyExtractor={a => a.id}
        renderItem={({ item }) => {
          const ultimo = [...msgs].reverse().find(m => m.de === item.id || m.para === item.id);
          return (
            <TouchableOpacity onPress={() => { setAbierto(item); socket.emit('historial', { con: item.id }); }} style={S.row}>
              <View style={S.ava(item.online ? t.acc : t.border)}><Text style={{ color: t.txt, fontWeight: '800' }}>{item.n[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.txt, fontWeight: '700' }}>{item.n}</Text>
                <Text style={{ color: t.mut, fontSize: 12 }} numberOfLines={1}>
                  {ultimo ? (ultimo.de === yo.id ? 'Tú: ' : '') + ultimo.texto : (item.online ? 'en línea' : 'desconectado')}
                </Text>
              </View>
              {item.leComparto && <Text style={{ fontSize: 12, marginRight: 6 }}>📍</Text>}
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.online ? t.teal : t.border }} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ padding: 30 }}>
            <Text style={{ color: t.mut, textAlign: 'center', lineHeight: 20 }}>
              Aún no tienes patas en Boin.{'\n'}Toca 🔍 y búscalos por nombre, @usuario o número 🧡
            </Text>
          </View>
        } />
    </View>
  );
}