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
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  password?: boolean;
  hint?: string;
}

export function TextField({
  label,
  error,
  icon,
  password = false,
  hint,
  className = "",
  ...rest
}: TextFieldProps) {
  const [visible, setVisible] = useState(!password);
  const [focused, setFocused] = useState(false);

  return (
    <View className={`w-full ${className}`}>
      {label ? (
        <Text
          className="mb-1.5 text-xs font-bold uppercase text-white/60"
          style={{ letterSpacing: 0.5 }}
        >
          {label}
        </Text>
      ) : null}
      <View
        className={`flex-row items-center rounded-xl border px-4 ${
          error
            ? "border-danger"
            : focused
              ? "border-primary"
              : "border-white/10"
        }`}
        style={{
          backgroundColor: focused
            ? "rgba(255,215,0,0.08)"
            : "rgba(255,255,255,0.05)",
        }}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? "#FFD700" : "#A1A1A1"}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor="rgba(255,255,255,0.3)"
          secureTextEntry={password ? !visible : false}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          className="flex-1 py-3.5 text-base text-white"
          style={[{ outlineStyle: "none" } as never, rest.style]}
        />
        {password ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10}>
            <Ionicons
              name={visible ? "eye-off" : "eye"}
              size={18}
              color="#A1A1A1"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-white/40">{hint}</Text>
      ) : null}
    </View>
  );
}
