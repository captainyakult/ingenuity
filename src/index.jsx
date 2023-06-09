import { createRoot } from "react-dom/client";
import { useGLTF, useTexture } from "@react-three/drei";
import App from "./App";
import "./styles.css";

useTexture.preload("/textures/colormap_4196x2048_q75.jpg");
useTexture.preload("/textures/heightmap_4196x2048_q85.jpg");
useTexture.preload("/textures/normalmap_4196x2048_q95_-1to1.jpg");
useGLTF.preload("/models/ingenuity/ingenuity.gltf");

const root = createRoot(document.getElementById("root"));
root.render(<App />);
