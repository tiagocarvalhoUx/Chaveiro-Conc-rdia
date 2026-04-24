import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PrimaryButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "ghost" | "success";
  fullWidth?: boolean;
  small?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function PrimaryButton({
  label,
  loading = false,
  variant = "primary",
  fullWidth = true,
  small = false,
  icon,
  disabled,
  className = "",
  ...rest
}: PrimaryButtonProps) {
  const base = small
    ? "items-center justify-center rounded-xl px-4 py-3"
    : "items-center justify-center rounded-2xl px-5 py-4";
  const width = fullWidth ? "w-full" : "";
  const tone =
    variant === "danger"
      ? "bg-danger active:bg-danger-dark"
      : variant === "ghost"
        ? "bg-transparent border border-white/20"
        : variant === "success"
          ? ""
          : "bg-primary active:bg-primary-dark";
  const textTone =
    variant === "ghost"
      ? "text-white"
      : variant === "danger" || variant === "success"
        ? "text-white"
        : "text-dark";

  const isDisabled = disabled || loading;
  const opacity = isDisabled ? "opacity-60" : "";

  const successStyle =
    variant === "success" ? { backgroundColor: "#25D366" } : undefined;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      className={`${base} ${width} ${tone} ${opacity} ${className}`}
      style={successStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? "#FFD700" : "#1A1A1A"} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon ? (
            <Ionicons
              name={icon}
              size={small ? 16 : 18}
              color={
                variant === "ghost"
                  ? "#FFFFFF"
                  : variant === "danger" || variant === "success"
                    ? "#FFFFFF"
                    : "#1A1A1A"
              }
            />
          ) : null}
          <Text
            className={`${textTone} ${small ? "text-sm" : "text-base"} font-extrabold`}
            style={{ letterSpacing: 0.3 }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
