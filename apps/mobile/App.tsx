import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { useSessionStore } from "./src/store/useSessionStore";
import { darkTheme } from "./src/theme/tokens";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    void useSessionStore.getState().hydrateSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={darkTheme.navigation}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
