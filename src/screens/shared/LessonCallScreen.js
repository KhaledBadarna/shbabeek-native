import React from "react";
import { View, StyleSheet, Platform } from "react-native";
// import { WebView } from "react-native-webview";

const LessonCallScreen = ({ route }) => {
  const { roomName, userName } = route.params;

  const jitsiURL = `https://8x8.vc/my-app/${roomName}#userInfo.displayName="${userName}"`;

  return (
    <View style={styles.container}>
      {/* <WebView
        source={{ uri: jitsiURL }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        // 🚫 Prevents redirecting to external app
        onNavigationStateChange={(event) => {
          if (
            event.url.includes("https://play.google.com") ||
            event.url.includes("https://apps.apple.com")
          ) {
            return false; // block redirection
          }
        }}
        // ✅ Force mobile WebView to behave like desktop
        userAgent={
          Platform.OS === "android"
            ? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99 Safari/537.36"
            : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        }
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LessonCallScreen;
