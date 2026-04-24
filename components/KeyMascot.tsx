import { Image, type ImageStyle, type StyleProp } from "react-native";

interface KeyMascotProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Mascote oficial do Chaveiro Concórdia.
 * Imagem em assets/logo-chaveiro.png — usada na splash, intro, login e demais telas.
 */
export function KeyMascot({ size = 180, style }: KeyMascotProps) {
  return (
    <Image
      source={require("../assets/logo-chaveiro.png")}
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
      accessibilityLabel="Mascote Chaveiro Concórdia"
    />
  );
}
