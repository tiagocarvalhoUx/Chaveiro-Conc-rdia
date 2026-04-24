import { Text, View } from "react-native";

import { statusColor, statusLabel } from "@/lib/format";
import type { StatusPedido } from "@/types/database";

interface StatusBadgeProps {
  status: StatusPedido;
  small?: boolean;
}

export function StatusBadge({ status, small = false }: StatusBadgeProps) {
  const color = statusColor(status);
  return (
    <View
      className={`self-start rounded-full ${small ? "px-2 py-0.5" : "px-3 py-1"}`}
      style={{
        backgroundColor: color + "22",
        borderWidth: 1,
        borderColor: color + "44",
      }}
    >
      <Text
        className={`${small ? "text-[10px]" : "text-xs"} font-extrabold`}
        style={{ color }}
      >
        {statusLabel(status)}
      </Text>
    </View>
  );
}
