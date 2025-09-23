import React from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import PaymentScreen from "./screens/PaymentScreen";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0c1222" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1222" translucent={false} />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0c1222" }}>
        <PaymentScreen />
      </SafeAreaView>
    </View>
  );
}
