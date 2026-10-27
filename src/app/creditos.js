// Pantalla "Créditos": integrantes, grupo, fecha y tech stack con logos oficiales.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import Logo from '../components/Logo';
import { EQUIPO } from '../data/equipo';
import { TECH_STACK } from '../data/techLogos';
import { colors, radius } from '../theme';

// Grupos del tech stack sin repetir ("App", "Sistema de acceso", "Herramientas")
const GROUPS = [...new Set(TECH_STACK.map((t) => t.group))];

// Un renglon del tech stack: logo (SVG oficial con su color de marca) + nombre + para que se uso
function TechItem({ tech }) {
  return (
    <View style={styles.tech}>
      <View style={styles.techLogo}>
        <Svg width={30} height={30} viewBox="0 0 24 24">
          <Path d={tech.path} fill={tech.color} />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.techName}>{tech.name}</Text>
        <Text style={styles.techDesc}>{tech.desc}</Text>
      </View>
    </View>
  );
}

export default function CreditosScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 20 + insets.bottom }]}>
      {/* Encabezado: logo, nombre de la app, equipo, materia, profesor y fecha */}
      <View style={styles.header}>
        <Logo size={80} />
        <Text style={styles.app}>Mochila Pass</Text>
        <Text style={styles.team}>Equipo {EQUIPO.nombre}</Text>
        <Text style={styles.meta}>{EQUIPO.materia}</Text>
        <Text style={styles.meta}>
          {EQUIPO.profesor} · {EQUIPO.fecha}
        </Text>
      </View>

      {/* Lista de integrantes con su numero de usuario */}
      <Text style={styles.section}>Integrantes</Text>
      <View style={styles.box}>
        {EQUIPO.integrantes.map((m) => (
          <View key={m.id} style={styles.member}>
            <Text style={styles.memberName}>{m.nombre}</Text>
            <Text style={styles.memberId}>#{m.id}</Text>
          </View>
        ))}
      </View>

      {/* Tech stack: una tarjeta por grupo */}
      <Text style={styles.section}>Tech stack</Text>
      {GROUPS.map((g) => (
        <View key={g} style={styles.box}>
          <Text style={styles.group}>{g}</Text>
          {TECH_STACK.filter((t) => t.group === g).map((t) => (
            <TechItem key={t.name} tech={t} />
          ))}
        </View>
      ))}
      <Text style={styles.footnote}>Logos oficiales de cada proyecto vía Simple Icons.</Text>
    </ScrollView>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 12 },
  header: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.lg, padding: 20, gap: 2 },
  app: { fontSize: 26, fontWeight: '800', color: colors.cream, marginTop: 8 },
  team: { fontSize: 18, fontWeight: '700', color: colors.accent },
  meta: { fontSize: 13, color: colors.cream },
  section: { fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 8 },
  box: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, gap: 10 },
  member: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberName: { fontSize: 17, fontWeight: '700', color: colors.text },
  memberId: { fontSize: 15, fontWeight: '700', color: colors.accentDark },
  group: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  tech: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  techLogo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techName: { fontSize: 16, fontWeight: '700', color: colors.text },
  techDesc: { fontSize: 13, color: colors.muted },
  footnote: { textAlign: 'center', color: colors.muted, fontSize: 12, marginBottom: 12 },
});
