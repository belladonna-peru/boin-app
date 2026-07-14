import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';
import { PAISES } from '../data';

export default function RegistroScreen({ onLogin }) {
  const { t } = useTheme();
  const [paso, setPaso] = useState(0);
  const [pais, setPais] = useState(PAISES[0]);
  const [num, setNum] = useState('');
  const [otp, setOtp] = useState('');
  const [otpReal, setOtpReal] = useState('');
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');

  const s = {
    wrap: { flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' },
    h: { color: t.acc, fontSize: 40, fontWeight: '800', textAlign: 'center', letterSpacing: 2 },
    h2: { color: t.txt, fontSize: 20, fontWeight: '700', marginBottom: 6 },
    sub: { color: t.mut, fontSize: 14, marginBottom: 18, lineHeight: 20 },
    input: { backgroundColor: t.card, borderColor: t.border, borderWidth: 1.5, borderRadius: 14, padding: 14, color: t.txt, fontSize: 16, marginBottom: 12 },
    btn: { backgroundColor: t.acc, borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 6 },
    btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
    chip: (on) => ({ borderColor: on ? t.acc : t.border, backgroundColor: on ? t.acc + '22' : t.card, borderWidth: 1.5, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, margin: 4 }),
  };

  const enviarOtp = () => {
    if (num.length < 8) return Alert.alert('Boin', 'Escribe tu número completo');
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpReal(code);
    setPaso(2);
    // TODO fase real: Firebase Auth Phone / Twilio Verify envía el SMS de verdad
    setTimeout(() => Alert.alert('📩 SMS (simulado)', 'Tu código Boin es: ' + code), 600);
  };

  const verificar = () => {
    if (otp !== otpReal) return Alert.alert('Boin', 'Código incorrecto, revisa el SMS');
    setPaso(3);
  };

  const terminar = () => {
    if (!nombre.trim() || !usuario.trim()) return Alert.alert('Boin', 'Completa tu nombre y usuario');
    onLogin({ nombre: nombre.trim(), usuario: usuario.trim().replace(/^@?/, '@'), pais: pais.c, num });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h}>BOIN</Text>
        <Text style={[s.sub, { textAlign: 'center' }]}>«¡boin!» = ya voy</Text>

        {paso === 0 && (<View>
          <Text style={s.h2}>Tu número es tu cuenta</Text>
          <Text style={s.sub}>Único e intransferible, como tu Yape. Elige tu país:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
            {PAISES.map(p => (
              <TouchableOpacity key={p.c} style={s.chip(pais.c === p.c)} onPress={() => setPais(p)}>
                <Text style={{ color: t.txt, fontSize: 13 }}>{p.f} {p.n} {p.c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.btn} onPress={() => setPaso(1)}><Text style={s.btnT}>Continuar con {pais.f} {pais.c}</Text></TouchableOpacity>
        </View>)}

        {paso === 1 && (<View>
          <Text style={s.h2}>Tu celular {pais.f} {pais.c}</Text>
          <Text style={s.sub}>Te enviaremos un código por SMS para verificar que es tuyo.</Text>
          <TextInput style={s.input} keyboardType="phone-pad" placeholder="987 654 321" placeholderTextColor={t.mut} value={num} onChangeText={v => setNum(v.replace(/\D/g, ''))} maxLength={12} />
          <TouchableOpacity style={s.btn} onPress={enviarOtp}><Text style={s.btnT}>Enviar código</Text></TouchableOpacity>
        </View>)}

        {paso === 2 && (<View>
          <Text style={s.h2}>Revisa tus SMS</Text>
          <Text style={s.sub}>Código de 6 dígitos enviado al {pais.c} {num} (en esta demo llega como alerta).</Text>
          <TextInput style={[s.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]} keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} placeholder="······" placeholderTextColor={t.mut} />
          <TouchableOpacity style={s.btn} onPress={verificar}><Text style={s.btnT}>Verificar</Text></TouchableOpacity>
        </View>)}

        {paso === 3 && (<View>
          <Text style={s.h2}>Crea tu perfil</Text>
          <Text style={s.sub}>Así te verán tus patas en el mapa.</Text>
          <TextInput style={s.input} placeholder="Tu nombre" placeholderTextColor={t.mut} value={nombre} onChangeText={setNombre} />
          <TextInput style={s.input} placeholder="@usuario" placeholderTextColor={t.mut} autoCapitalize="none" value={usuario} onChangeText={setUsuario} />
          <TouchableOpacity style={s.btn} onPress={terminar}><Text style={s.btnT}>¡Boin, vamos al mapa!</Text></TouchableOpacity>
        </View>)}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
