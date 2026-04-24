import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/**
 * Cabeçalho interno: botão voltar + título.
 */
export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View
      className="flex-row items-center gap-3 border-b border-white/10 px-5 pb-3 pt-5"
      style={{ backgroundColor: "#1A1A1A" }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
        </Pressable>
      ) : null}
      <Text className="flex-1 text-lg font-extrabold text-white">{title}</Text>
      {right ?? null}
    </View>
  );
}
