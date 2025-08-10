// metro.config.js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const projectRoot = __dirname;
const backendPath = path.resolve(projectRoot, "../backend");

let config = getDefaultConfig(projectRoot);

// ✅ Add backend to Metro's watchFolders
config.watchFolders = [backendPath];

// ✅ Allow JSON and DB imports
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes("json")) {
  config.resolver.assetExts.push("json");
}
// ✅ Compose with NativeWind
config = withNativeWind(config, { input: "./global.css" });

// ✅ Finally wrap with Reanimated (must be last)
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
