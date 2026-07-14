import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme';

export default function WalletScreen({ user }) {
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 54, padding: 20 }}>
      <Text style={{ color: t.txt, fontSize: 22, fontWeight: '700', marginBottom: 14 }}>Wallet</Text>
      <View style={{ backgroundColor: '#2A1E24', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: t.border }}>
        <Text style={{ color: '#9B96B0', fontSize: 12 }}>Saldo Boin</Text>
        <Text style={{ color: '#F5F2EC', fontSize: 36, fontWeight: '800', marginVertical: 4 }}>S/ 0.00</Text>
        <Text style={{ color: '#9B96B0', fontSize: 12 }}>ligada a tu número {user?.pais} {user?.num ? user.num.slice(0, 3) + ' *** ' + user.num.slice(-3) : ''}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <TouchableOpacity onPress={() => Alert.alert('Wallet', 'Recargas desde Yape/Plin — llega con el aliado de pagos (Fase 6)')}
          style={{ flex: 1, borderColor: t.border, borderWidth: 1.5, borderRadius: 14, padding: 13, alignItems: 'center' }}>
          <Text style={{ color: t.mut }}>Recargar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Wallet', 'Boinear plata a un pata por su número — Fase 6')}
          style={{ flex: 1, borderColor: t.border, borderWidth: 1.5, borderRadius: 14, padding: 13, alignItems: 'center' }}>
          <Text style={{ color: t.mut }}>Boinear plata</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: t.mut, fontSize: 13, marginTop: 16, lineHeight: 19 }}>
        Por ahora tus pagos van por Yape/QR directo en el chat del pedido. La Wallet llegará con un aliado de pagos autorizado.
      </Text>
    </View>
  );
}
