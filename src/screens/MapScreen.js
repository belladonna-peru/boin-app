import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme';
import { NEGOCIOS, CENTER } from '../data';
import { socket } from '../socket';

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#171426' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8A84A8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#14121F' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#232038' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6E6890' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1B1830' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#171426' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1B2B26' }] },
];

const COLORES = { cafe: '#FFD23F', musica: '#7F77DD', comida: '#FF6B3D', night: '#ED93B1' };

function DotUsuario({ nombre, esYo, acc }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20, backgroundColor: esYo ? acc : '#2A2740',
        borderWidth: 3, borderColor: esYo ? '#fff' : acc,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: acc, shadowOpacity: 0.8, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 6,
      }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{(nombre || '?')[0].toUpperCase()}</Text>
      </View>
      <View style={{ backgroundColor: 'rgba(20,18,31,0.85)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, marginTop: 2 }}>
        <Text style={{ color: '#F5F2EC', fontSize: 9 }}>{esYo ? 'Tú' : nombre}</Text>
      </View>
    </View>
  );
}

function PinNegocio({ emoji, cl }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 38, height: 38, borderRadius: 13, backgroundColor: '#1E1B2E',
        borderWidth: 2, borderColor: cl, alignItems: 'center', justifyContent: 'center',
        shadowColor: cl, shadowOpacity: 0.7, shadowRadius: 7, shadowOffset: { width: 0, height: 0 }, elevation: 6,
      }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ width: 2, height: 7, backgroundColor: cl }} />
    </View>
  );
}

export default function MapScreen() {
  const { t } = useTheme();
  const [me, setMe] = useState({ latitude: CENTER.latitude, longitude: CENTER.longitude });
  const [precision, setPrecision] = useState(null);
  const [tengoGps, setTengoGps] = useState(false);
  const [ghost, setGhost] = useState(false);
  const [vivos, setVivos] = useState({});
  const [cat, setCat] = useState('all');
  const [conectado, setConectado] = useState(false);
  const mapRef = useRef(null);
  const yoRef = useRef({ id: null, nombre: 'Pata' });
  const ghostRef = useRef(false);
  const meRef = useRef(me);
  const primeraVez = useRef(true);

  useEffect(() => { ghostRef.current = ghost; }, [ghost]);
  useEffect(() => { meRef.current = me; }, [me]);

  // Envía MI lat/lng al servidor (él la reparte SOLO a mis patas permitidos)
  const transmitir = (lat, lng) => {
    if (ghostRef.current || !socket.connected || !yoRef.current.id) return;
    socket.emit('ubi', { lat, lng });
  };

  useEffect(() => {
    let subGps = null;
    let respaldo = null;
    let limpia = null;

    const onUbi = (p) => {
      if (!p || p.id === yoRef.current.id) return;
      setVivos(v => ({ ...v, [p.id]: { ...p, ts: Date.now() } }));
    };
    const onUbiOff = (p) => {
      if (!p) return;
      setVivos(v => { const n = { ...v }; delete n[p.id]; return n; });
    };
    const onConnect = () => {
      setConectado(true);
      const m = yoRef.current;
      if (m.id) socket.emit('hola', { id: m.id, n: m.nombre, usuario: m.usuario || '', num: m.num || '' });
    };
    const onDisconnect = () => setConectado(false);

    (async () => {
      const raw = await AsyncStorage.getItem('boinUser');
      const u = raw ? JSON.parse(raw) : {};
      let id = await AsyncStorage.getItem('boinDevId');
      if (!id) { id = 'u' + Math.random().toString(36).slice(2, 9); await AsyncStorage.setItem('boinDevId', id); }
      yoRef.current = { id, nombre: u.nombre || 'Pata', usuario: u.usuario || '', num: u.num || '' };
      socket.emit('hola', { id, n: yoRef.current.nombre, usuario: yoRef.current.usuario, num: yoRef.current.num });

      // GPS de PRECISIÓN ALTA: avisa cada 2 segundos O cada 2 metros de movimiento
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        subGps = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2 },
          (loc) => {
            const lat = loc.coords.latitude, lng = loc.coords.longitude;
            setMe({ latitude: lat, longitude: lng });
            setPrecision(Math.round(loc.coords.accuracy || 0));
            setTengoGps(true);
            transmitir(lat, lng); // tiempo real: se envía EN CUANTO te mueves
            if (primeraVez.current && mapRef.current) {
              primeraVez.current = false;
              mapRef.current.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 800);
            }
          }
        );
      }

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('ubi', onUbi);
      socket.on('ubi-off', onUbiOff);
      if (socket.connected) onConnect();

      // Respaldo: aunque estés quieto, reafirma tu posición cada 5 s
      respaldo = setInterval(() => transmitir(meRef.current.latitude, meRef.current.longitude), 5000);

      // Borra patas que dejaron de transmitir hace más de 15 s
      limpia = setInterval(() => {
        setVivos(v => {
          const ahora = Date.now(), nuevo = {};
          Object.values(v).forEach(p => { if (ahora - p.ts < 15000) nuevo[p.id] = p; });
          return nuevo;
        });
      }, 5000);
    })();

    return () => {
      if (subGps) subGps.remove();
      if (respaldo) clearInterval(respaldo);
      if (limpia) clearInterval(limpia);
      socket.off('ubi', onUbi);
      socket.off('ubi-off', onUbiOff);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const centrarEn = (lat, lng) => {
    if (mapRef.current) mapRef.current.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 600);
  };

  const cats = [['all', 'Todo'], ['cafe', 'Café'], ['comida', 'Comida'], ['musica', 'Música'], ['night', 'Night']];
  const patas = Object.values(vivos);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ ...me, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
        customMapStyle={MAP_STYLE}
        userInterfaceStyle="dark"
        showsPointsOfInterest={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {!ghost && (
          <Marker coordinate={me} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <DotUsuario nombre={yoRef.current.nombre} esYo acc={t.acc} />
          </Marker>
        )}

        {patas.map(p => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => { centrarEn(p.lat, p.lng); Alert.alert(p.n, 'En vivo 📍 · te comparte su ubicación\nActualizada hace ' + Math.round((Date.now() - p.ts) / 1000) + ' s'); }}>
            <DotUsuario nombre={p.n} acc={t.acc} />
          </Marker>
        ))}

        {NEGOCIOS.filter(b => cat === 'all' || b.cat === cat).map(b => (
          <Marker key={b.id} coordinate={{ latitude: b.lat, longitude: b.lng }} anchor={{ x: 0.5, y: 1 }}
            onPress={() => Alert.alert(b.emoji + ' ' + b.n, b.d + '\n\n🎉 ' + b.promo)}>
            <PinNegocio emoji={b.emoji} cl={COLORES[b.cat]} />
          </Marker>
        ))}
      </MapView>

      {Platform.OS === 'ios' && (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,20,55,0.28)' }} />
      )}

      <View style={{ position: 'absolute', top: 50, left: 10, right: 10 }}>
        <View style={{ backgroundColor: 'rgba(30,27,46,0.95)', borderColor: t.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }}>
          <Text style={{ color: t.mut, fontSize: 13 }}>
            {conectado
              ? '🟢 En vivo · ' + patas.length + (patas.length === 1 ? ' pata' : ' patas') + (tengoGps && precision ? ' · GPS ±' + precision + ' m' : ' · buscando GPS…')
              : '🔴 Conectando con el servidor Boin…'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {cats.map(([k, label]) => (
            <TouchableOpacity key={k} onPress={() => setCat(k)}
              style={{ backgroundColor: cat === k ? t.acc : 'rgba(30,27,46,0.95)', borderColor: cat === k ? t.acc : t.border, borderWidth: 1, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 13, margin: 3 }}>
              <Text style={{ color: cat === k ? '#fff' : t.mut, fontSize: 13 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => { const g = !ghost; setGhost(g); Alert.alert('Boin', g ? 'Modo fantasma: dejaste de transmitir tu ubi 👻' : '¡De vuelta! Tus patas ya te ven 📍'); }}
        style={{ position: 'absolute', right: 14, top: 150, backgroundColor: ghost ? 'rgba(30,27,46,0.95)' : t.acc, borderRadius: 26, width: 52, height: 52, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: t.border, elevation: 8 }}>
        <Text style={{ fontSize: 22 }}>{ghost ? '👻' : '📍'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => centrarEn(me.latitude, me.longitude)}
        style={{ position: 'absolute', right: 14, top: 212, backgroundColor: 'rgba(30,27,46,0.95)', borderRadius: 26, width: 52, height: 52, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: t.border }}>
        <Text style={{ fontSize: 20 }}>🎯</Text>
      </TouchableOpacity>

      <View style={{ position: 'absolute', bottom: 12, left: 10, right: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {NEGOCIOS.map(b => (
            <TouchableOpacity key={b.id} onPress={() => Alert.alert(b.n, b.d + '\n🎉 ' + b.promo)}
              style={{ backgroundColor: 'rgba(30,27,46,0.96)', borderColor: t.border, borderWidth: 1, borderRadius: 16, padding: 12, marginRight: 10, width: 200 }}>
              <Text style={{ color: '#F5F2EC', fontWeight: '700' }}>{b.emoji} {b.n}</Text>
              <Text style={{ color: '#9B96B0', fontSize: 12, marginTop: 2 }}>{b.d}</Text>
              <Text style={{ color: t.acc2, fontSize: 11, marginTop: 4 }}>{b.promo}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}