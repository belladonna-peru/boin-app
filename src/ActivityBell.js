import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { socket } from './socket';

const ICO = { solicitud: '🤝', pata: '🎉', like: '♥', momento: '📸' };

function hace(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return 'hace ' + Math.floor(s / 60) + ' min';
  if (s < 86400) return 'hace ' + Math.floor(s / 3600) + ' h';
  return 'hace ' + Math.floor(s / 86400) + ' d';
}

export default function ActivityBell({ t }) {
  const [abierto, setAbierto] = useState(false);
  const [lista, setLista] = useState([]);
  const [sinLeer, setSinLeer] = useState(0);

  useEffect(() => {
    const onNotifs = (l) => { setLista(l || []); setSinLeer((l || []).filter(x => !x.leida).length); };
    const onNotif = () => { setSinLeer(n => n + 1); };
    socket.on('notifs', onNotifs);
    socket.on('notif', onNotif);
    socket.emit('notifs');
    return () => { socket.off('notifs', onNotifs); socket.off('notif', onNotif); };
  }, []);

  const abrir = () => {
    setAbierto(true);
    socket.emit('notifs');
    socket.emit('notifs-leer');
    setSinLeer(0);
  };

  return (
    <View>
      <TouchableOpacity onPress={abrir} style={{ padding: 4 }}>
        <Text style={{ fontSize: 18 }}>🔔</Text>
        {sinLeer > 0 && (
          <View style={{ position: 'absolute', top: -2, right: -6, backgroundColor: t.acc, borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{sinLeer > 9 ? '9+' : sinLeer}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={abierto} animationType="slide" transparent onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setAbierto(false)} />
        <View style={{ backgroundColor: t.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 24, borderWidth: 1, borderColor: t.border }}>
          <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: t.border, alignSelf: 'center', marginVertical: 12 }} />
          <Text style={{ color: t.txt, fontSize: 19, fontWeight: '700', paddingHorizontal: 18, marginBottom: 8 }}>Actividades</Text>
          <FlatList
            data={lista}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderColor: t.border, opacity: item.leida ? 0.6 : 1 }}>
                <Text style={{ fontSize: 18, marginRight: 12 }}>{ICO[item.tipo] || '🧡'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.txt, fontSize: 13 }}>{item.texto}</Text>
                  <Text style={{ color: t.mut, fontSize: 11, marginTop: 2 }}>{hace(item.ts)}</Text>
                </View>
                {!item.leida && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.acc }} />}
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: t.mut, textAlign: 'center', padding: 24 }}>Nada por aquí todavía 🧡</Text>}
          />
        </View>
      </Modal>
    </View>
  );
}