import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Activity, Brain, CheckSquare, House, Settings } from "lucide-react-native";

import { CaptureModal } from "../components/ui";
import { ActionsScreen } from "../screens/ActionsScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { MemoryScreen } from "../screens/MemoryScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TodayScreen } from "../screens/TodayScreen";
import { useAppStore } from "../store/useAppStore";
import { palette } from "../theme/tokens";

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  const onboarded = useAppStore((state) => state.onboarded);
  const captureOpen = useAppStore((state) => state.captureOpen);
  const closeCapture = useAppStore((state) => state.closeCapture);

  if (!onboarded) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            height: 76,
            paddingTop: 10,
            paddingBottom: 12,
          },
          tabBarActiveTintColor: palette.text,
          tabBarInactiveTintColor: palette.textMuted,
        }}
      >
        <Tab.Screen
          component={TodayScreen}
          name="Today"
          options={{
            tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
          }}
        />
        <Tab.Screen
          component={FeedScreen}
          name="Feed"
          options={{
            tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
          }}
        />
        <Tab.Screen
          component={MemoryScreen}
          name="Memory"
          options={{
            tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
          }}
        />
        <Tab.Screen
          component={ActionsScreen}
          name="Actions"
          options={{
            tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
          }}
        />
        <Tab.Screen
          component={SettingsScreen}
          name="Settings"
          options={{
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
      <CaptureModal onClose={closeCapture} open={captureOpen} />
    </>
  );
}
