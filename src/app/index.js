// Pantalla de inicio de sesion (ruta "/"). Es la primera que se abre.
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Logo from '../components/Logo';
import { useSession } from '../context/SessionContext';
import { colors, radius } from '../theme';

export default function LoginScreen() {
  const { user, loading, login } = useSession();
  const [username, setUsername] = useState(''); // lo que escribe el usuario
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false); // true mientras espera a la API
  const [error, setError] = useState(''); // mensaje de error en rojo

  // Mientras se lee la sesion guardada se muestra un indicador de carga
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }
  // Si ya habia sesion iniciada, salta directo a la credencial
  if (user) return <Redirect href="/credencial" />;

  // Boton "Entrar": valida campos, llama a la API y, si sale bien, abre la credencial
  const onSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Escribe tu usuario y contraseña.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await login(username, password);
      router.replace('/credencial');
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo y nombre de la app */}
          <View style={styles.header}>
            <Logo size={120} />
            <Text style={styles.title}>Mochila Pass</Text>
            <Text style={styles.subtitle}>Hostal para backpackers · Acceso NFC</Text>
          </View>

          {/* Formulario de usuario y contraseña */}
          <View style={styles.card}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Tu nombre de usuario"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={onSubmit}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Button title="Entrar" onPress={onSubmit} loading={sending} style={{ marginTop: 8 }} />
          </View>

          {/* Acceso a los creditos sin iniciar sesion */}
          <Button title="Créditos" variant="ghost" onPress={() => router.push('/creditos')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24 },
  header: { alignItems: 'center', gap: 6 },
  title: { fontSize: 34, fontWeight: '800', color: colors.cream, marginTop: 10 },
  subtitle: { fontSize: 15, color: colors.accent, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 20, gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 6,
  },
  error: { color: colors.danger, fontWeight: '600' },
});
