// Pantalla "Mi credencial": se muestra despues del login.
// Enseña foto, nombre completo y numero de usuario, el estado del NFC
// y un aviso cuando el escaner lee el telefono.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Hce from '../../modules/hce-credencial';
import Button from '../components/Button';
import { useSession } from '../context/SessionContext';
import { formatHex, idToHex } from '../nfc/apdu';
import { colors, radius } from '../theme';

// Traduce el estado del hardware NFC a un mensaje para el usuario
function nfcMessage(status) {
  if (!Hce.isAvailable) return { ok: false, text: 'NFC no disponible en esta versión (usa el APK).' };
  if (!status.hasNfc) return { ok: false, text: 'Este teléfono no tiene NFC.' };
  if (!status.hasHce) return { ok: false, text: 'Este teléfono no soporta emulación de tarjeta (HCE).' };
  if (!status.nfcEnabled) return { ok: false, text: 'El NFC está apagado.' };
  return { ok: true, text: 'Acerca tu teléfono al lector del hostal' };
}

export default function CredencialScreen() {
  const { user, logout } = useSession(); // usuario con sesion iniciada
  const [status, setStatus] = useState(Hce.getStatus()); // { hasNfc, hasHce, nfcEnabled }
  const [lastScan, setLastScan] = useState(null); // ultimo evento del escaner
  const pulse = useRef(new Animated.Value(0)).current; // 0 = aviso oculto, 1 = visible
  const insets = useSafeAreaInsets(); // espacio de la barra de navegacion de Android

  const refreshStatus = useCallback(() => setStatus(Hce.getStatus()), []);

  // Revisa el NFC cada vez que la app vuelve al frente (por si lo encendieron en ajustes)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refreshStatus());
    return () => sub.remove();
  }, [refreshStatus]);

  // Retroalimentacion: el servicio HCE avisa cuando el escaner nos leyo.
  // Se muestra el aviso con una animacion (aparece, espera 2.2 s y desaparece).
  useEffect(() => {
    const sub = Hce.addScanListener((event) => {
      setLastScan(event);
      pulse.setValue(0);
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(pulse, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    });
    return () => sub.remove();
  }, [pulse]);

  // Sin sesion no hay credencial: regresa al login
  if (!user) return <Redirect href="/" />;

  const nfc = nfcMessage(status);
  // Si la API no trae nombre, se usa el nombre de usuario
  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.username;

  // Cerrar sesion borra la credencial NFC y vuelve al login
  const onLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 20 + insets.bottom }]}>
      {/* Tarjeta de la credencial: encabezado, foto, nombre y numero */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.brand}>MOCHILA PASS</Text>
          <Text style={styles.brandSub}>Credencial de huésped</Text>
        </View>
        <Image source={{ uri: user.pfpUrl }} style={styles.photo} contentFit="cover" transition={200} />
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.number}>#{user.id}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>

      {/* Estado del NFC (verde si esta listo, naranja si hay un problema) */}
      <View style={[styles.nfcBox, !nfc.ok && styles.nfcBoxOff]}>
        <Text style={styles.nfcIcon}>{nfc.ok ? '📶' : '⚠️'}</Text>
        <Text style={styles.nfcText}>{nfc.text}</Text>
      </View>
      {Hce.isAvailable && status.hasNfc && !status.nfcEnabled && (
        <Button title="Activar NFC" variant="outline" onPress={Hce.openNfcSettings} />
      )}

      {/* Solo indica que el escaner se detecto; NO dice si se dio acceso */}
      <Animated.View
        style={[
          styles.scanBanner,
          { opacity: pulse, transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
        ]}
      >
        <Text style={styles.scanTitle}>
          {lastScan?.sent === false ? 'Escáner detectado, pero no hay credencial' : '¡Escáner detectado!'}
        </Text>
        <Text style={styles.scanText}>Credencial enviada. Revisa la luz del lector.</Text>
      </Animated.View>

      {/* Los 4 bytes que se mandan al escaner (util para depurar y para el reporte) */}
      <Text style={styles.debug}>
        ID enviado por NFC: {formatHex(idToHex(user.id))}
      </Text>

      <Button title="Créditos" variant="outline" onPress={() => router.push('/creditos')} />
      <Button title="Cerrar sesión" variant="ghost" onPress={onLogout} />
    </ScrollView>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingBottom: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTop: {
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingBottom: 70,
    alignItems: 'center',
  },
  brand: { color: colors.accent, fontWeight: '800', letterSpacing: 3, fontSize: 16 },
  brandSub: { color: colors.cream, fontSize: 13 },
  photo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 5,
    borderColor: colors.card,
    marginTop: -60,
    backgroundColor: colors.border,
  },
  name: { fontSize: 30, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 14, paddingHorizontal: 12 },
  number: { fontSize: 40, fontWeight: '900', color: colors.accentDark, letterSpacing: 2, marginTop: 2 },
  username: { fontSize: 15, color: colors.muted },
  nfcBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E5F3EC',
    borderRadius: radius.md,
    padding: 14,
  },
  nfcBoxOff: { backgroundColor: '#FBE9DD' },
  nfcIcon: { fontSize: 22 },
  nfcText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  scanBanner: { backgroundColor: colors.primary, borderRadius: radius.md, padding: 16, alignItems: 'center' },
  scanTitle: { color: colors.accent, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  scanText: { color: colors.cream, fontSize: 14, marginTop: 2 },
  debug: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
