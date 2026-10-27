// Layout raiz de Expo Router: envuelve todas las pantallas.
// - SessionProvider comparte la sesion (usuario logueado) con toda la app.
// - Stack define la navegacion tipo "pila" y el encabezado de cada pantalla.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from '../context/SessionContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.cream,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* index = login (sin encabezado); en la credencial no hay boton "atras" */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="credencial" options={{ title: 'Mi credencial', headerBackVisible: false }} />
        <Stack.Screen name="creditos" options={{ title: 'Créditos' }} />
      </Stack>
    </SessionProvider>
  );
}
