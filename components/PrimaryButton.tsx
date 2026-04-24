import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

interface PrimaryButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "ghost";
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  loading = false,
  variant = "primary",
  fullWidth = true,
  disabled,
  className = "",
  ...rest
}: PrimaryButtonProps) {
  const base = "items-center justify-center rounded-xl px-5 py-4";
  const width = fullWidth ? "w-full" : "";
  const tone =
    variant === "danger"
      ? "bg-danger active:bg-danger-dark"
      : variant === "ghost"
        ? "bg-transparent border border-primary"
        : "bg-primary active:bg-primary-dark";
  const textTone =
    variant === "ghost" ? "text-primary" : variant === "danger" ? "text-white" : "text-dark";

  const isDisabled = disabled || loading;
  const opacity = isDisabled ? "opacity-60" : "";

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      className={`${base} ${width} ${tone} ${opacity} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? "#FFD700" : "#1A1A1A"} />
      ) : (
        <Text className={`${textTone} text-base font-bold`}>{label}</Text>
      )}
    </Pressable>
  );
}
