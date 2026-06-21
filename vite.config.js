import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";

// https://vitejs.dev/config/
export default defineConfig({
  // Relative asset URLs so dist/ can be served from any subpath.
  base: "/Projektarbeit-IRD-Cesium",
  // vite-plugin-cesium copies Cesium's static assets (Assets, Widgets, Workers,
  // ThirdParty), sets CESIUM_BASE_URL, and injects widgets.css automatically.
  plugins: [cesium()],
});
