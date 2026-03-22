import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// 1. 引入单文件打包插件
import { viteSingleFile } from "vite-plugin-singlefile"; 

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // 确保使用相对路径
  base: "./", 
  
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  
  plugins: [
    react(), 
    // 仅在开发模式下启用 Lovable 的标签器
    mode === "development" && componentTagger(),
    // 2. 核心配置：启用单文件打包插件，它会将 JS 和 CSS 全部注入到 HTML 中
    viteSingleFile(), 
  ].filter(Boolean),
  
  resolve: {
    alias: {
      // 保持路径别名配置，确保项目能正常编译
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
