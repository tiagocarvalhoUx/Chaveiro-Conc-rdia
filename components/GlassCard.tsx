import { View, type ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
  accent?: "primary" | "danger" | "none";
  selected?: boolean;
}

/**
 * Cartão translúcido com borda sutil (glassmorphism).
 */
export function GlassCard({
  className = "",
  accent = "none",
  selected = false,
  children,
  style,
  ...rest
}: GlassCardProps) {
  const border = selected
    ? accent === "danger"
      ? "border-danger"
      : "border-primary"
    : accent === "danger"
      ? "border-danger/40"
      : accent === "primary"
        ? "border-primary/40"
        : "border-white/10";

  return (
    <View
      {...rest}
      style={[{ backgroundColor: "rgba(255,255,255,0.06)" }, style]}
      className={`rounded-2xl border ${border} p-4 ${className}`}
    >
      {children}
    </View>
  );
}
