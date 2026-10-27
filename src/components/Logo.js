import Svg, { G, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

// Logotipo de la app dibujado en SVG (mismo dibujo que el icono): mochila + ondas NFC.
// size = tamaño en pixeles; background = mostrar el cuadro verde de fondo
export default function Logo({ size = 120, background = true }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      {background && <Rect width="1024" height="1024" rx="230" fill={colors.primary} />}
      <G transform="translate(512 512) translate(-530 -500)">
        {/* Asa, cuerpo, linea de la tapa, bolsillo y broche de la mochila */}
        <Path d="M392 300 v-40 a58 58 0 0 1 116 0 v40 h-32 v-40 a26 26 0 0 0 -52 0 v40 z" fill={colors.accentDark} />
        <Rect x="300" y="290" width="300" height="430" rx="110" fill={colors.accent} />
        <Path d="M300 430 h300" stroke={colors.accentDark} strokeWidth="18" />
        <Rect x="350" y="500" width="200" height="160" rx="44" fill="#E08A2E" stroke={colors.accentDark} strokeWidth="14" />
        <Rect x="430" y="470" width="40" height="60" rx="14" fill={colors.primary} />
        {/* Tres ondas de NFC */}
        <G fill="none" stroke={colors.cream} strokeWidth="36" strokeLinecap="round">
          <Path d="M669 442 A90 90 0 0 1 669 558" />
          <Path d="M715 404 A150 150 0 0 1 715 596" />
          <Path d="M761 365 A210 210 0 0 1 761 635" />
        </G>
      </G>
    </Svg>
  );
}
