import { ScrollView, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmergencyFAB } from "@/components/EmergencyFAB";

interface ScreenContainerProps extends ScrollViewProps {
  scroll?: boolean;
  showEmergency?: boolean;
}

/**
 * Container padrão de telas autenticadas (fundo escuro + FAB de emergência).
 */
export function ScreenContainer({
  children,
  scroll = true,
  showEmergency = true,
  contentContainerStyle,
  ...rest
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-dark">
      {scroll ? (
        <ScrollView
          {...rest}
          className="flex-1"
          contentContainerStyle={[
            { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 120 },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 py-5">{children}</View>
      )}
      {showEmergency ? <EmergencyFAB /> : null}
    </SafeAreaView>
  );
}
