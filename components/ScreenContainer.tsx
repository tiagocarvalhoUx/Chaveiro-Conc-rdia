import { ScrollView, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/BottomNav";
import { EmergencyFAB } from "@/components/EmergencyFAB";

interface ScreenContainerProps extends ScrollViewProps {
  scroll?: boolean;
  showEmergency?: boolean;
  showTabBar?: boolean;
  padded?: boolean;
}

/**
 * Container padrão de telas autenticadas.
 * - Fundo escuro
 * - FAB de emergência (WhatsApp)
 * - Tab bar inferior opcional
 */
export function ScreenContainer({
  children,
  scroll = true,
  showEmergency = true,
  showTabBar = false,
  padded = true,
  contentContainerStyle,
  ...rest
}: ScreenContainerProps) {
  const bottomPadding = showTabBar ? 100 : 30;
  const fabOffset = showTabBar ? 90 : 24;

  const padX = padded ? { paddingHorizontal: 20 } : null;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-dark">
      {scroll ? (
        <ScrollView
          {...rest}
          className="flex-1"
          contentContainerStyle={[
            padX,
            { paddingTop: 16, paddingBottom: bottomPadding },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          className="flex-1"
          style={{
            ...(padX ?? {}),
            paddingTop: 16,
            paddingBottom: bottomPadding,
          }}
        >
          {children}
        </View>
      )}
      {showEmergency ? <EmergencyFAB bottom={fabOffset} /> : null}
      {showTabBar ? <BottomNav /> : null}
    </SafeAreaView>
  );
}
