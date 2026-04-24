import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  password?: boolean;
}

export function TextField({
  label,
  error,
  icon,
  password = false,
  className = "",
  ...rest
}: TextFieldProps) {
  const [visible, setVisible] = useState(!password);

  return (
    <View className={`w-full ${className}`}>
      <Text className="mb-2 text-sm font-semibold text-white">{label}</Text>
      <View
        className={`flex-row items-center rounded-xl border bg-white/5 px-4 ${
          error ? "border-danger" : "border-primary/30"
        }`}
      >
        {icon ? (
          <Ionicons name={icon} size={20} color="#FFD700" style={{ marginRight: 8 }} />
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor="#A1A1A1"
          secureTextEntry={password ? !visible : false}
          className="flex-1 py-4 text-base text-white"
          style={{ outlineStyle: "none" } as never}
        />
        {password ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10}>
            <Ionicons
              name={visible ? "eye-off" : "eye"}
              size={20}
              color="#A1A1A1"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
