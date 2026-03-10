import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { darkTheme } from "./src/theme/tokens";

export default function App() {
  return (
    <NavigationContainer theme={darkTheme.navigation}>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}
