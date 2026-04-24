import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 36,
  readOnly = false,
}: StarRatingProps) {
  return (
    <View className="flex-row items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          disabled={readOnly}
          onPress={() => onChange?.(n)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          <Ionicons
            name={n <= value ? "star" : "star-outline"}
            size={size}
            color="#FFD700"
          />
        </Pressable>
      ))}
    </View>
  );
}
