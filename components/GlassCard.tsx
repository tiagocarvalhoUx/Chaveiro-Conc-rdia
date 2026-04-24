import { View, type ViewProps } from "react-native";

interface GlassCardProps extends ViewProps {
  accent?: "primary" | "danger" | "none";
}

/**
 * Cartão com efeito glassmorphism (fundo translúcido + borda amarela/vermelha).
 */
export function GlassCard({
  className = "",
  accent = "primary",
  children,
  ...rest
}: GlassCardProps) {
  const border =
    accent === "danger"
      ? "border-danger/40"
      : accent === "primary"
        ? "border-primary/40"
        : "border-white/10";

  return (
    <View
      {...rest}
      className={`rounded-2xl border ${border} bg-white/5 p-4 ${className}`}
    >
      {children}
    </View>
  );
}
