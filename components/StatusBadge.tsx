import { Text, View } from "react-native";

import { statusColor, statusLabel } from "@/lib/format";
import type { StatusPedido } from "@/types/database";

interface StatusBadgeProps {
  status: StatusPedido;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = statusColor(status);
  return (
    <View
      className="self-start rounded-full px-3 py-1"
      style={{ backgroundColor: color + "22", borderWidth: 1, borderColor: color }}
    >
      <Text className="text-xs font-bold" style={{ color }}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}
