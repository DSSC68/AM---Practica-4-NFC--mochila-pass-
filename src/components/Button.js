import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme';

// Boton reutilizable de la app.
// variant: 'primary' (naranja), 'outline' (con borde) o 'ghost' (solo texto)
// loading: muestra un indicador de carga en lugar del texto
export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const v = styles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.base, v, (pressed || disabled) && styles.dim, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.primaryDark : colors.primary} />
      ) : (
        <Text style={[styles.text, variant !== 'primary' && styles.textAlt]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.accent },
  outline: { borderWidth: 2, borderColor: colors.primary },
  ghost: {},
  dim: { opacity: 0.6 },
  text: { fontSize: 17, fontWeight: '700', color: colors.primaryDark },
  textAlt: { color: colors.primary },
});
