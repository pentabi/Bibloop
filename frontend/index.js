import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { Authenticator } from "@aws-amplify/ui-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

// Configure Amplify before any components mount
Amplify.configure(outputs);

// https://docs.expo.dev/router/reference/troubleshooting/#expo_router_app_root-not-defined

export function App() {
  const ctx = require.context("./app");
  return (
    <GestureHandlerRootView>
      <Authenticator.Provider>
        <Provider store={store}>
          <ExpoRoot context={ctx} />
        </Provider>
      </Authenticator.Provider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
