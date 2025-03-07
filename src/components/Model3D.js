import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// 這個組件處理模型和動畫
function ModelViewer({ modelUrl, animationUrl }) {
  const { scene } = useGLTF(modelUrl);
  const { animations } = useGLTF(animationUrl);
  const mixer = useRef();
  const clock = useRef(new THREE.Clock());
  const currentAction = useRef();

  // 當動畫文件變更時，加載並播放新動畫
  useEffect(() => {
    if (animations && animations.length && scene) {
      // 如果混合器不存在，創建一個新的
      if (!mixer.current) {
        mixer.current = new THREE.AnimationMixer(scene);
      }
      
      // 如果有正在播放的動畫，停止它
      if (currentAction.current) {
        currentAction.current.fadeOut(0.5);
      }
      
      // 創建並播放新動畫
      const action = mixer.current.clipAction(animations[0]);
      action.timeScale = 0.75; // 調整動畫速度
      action.reset().fadeIn(0.5).play();
      currentAction.current = action;
      
      console.log("播放動畫:", animationUrl);
      console.log("動畫長度:", action.getClip().duration);
    }
  }, [scene, animations, animationUrl]);

  // 動畫循環
  useEffect(() => {
    const animate = () => {
      if (mixer.current) {
        const delta = clock.current.getDelta();
        mixer.current.update(delta);
      }
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // 清理函數
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <primitive object={scene} scale={1.5} position={[0, -1, 0]} />
  );
}

// 主要的 3D 模型組件
export default function Model3D({ character, emotion = 'idle' }) {
  // 根據所選角色獲取模型 URL
  const getModelPath = () => {
    // 你可以使用在線URL或本地文件
    // const onlineUrl = `https://models.readyplayer.me/67cb3ed2dcad60ec6d9523ab.glb`;
    const localPath = `/models/${character}.glb`;
    return localPath;
  };
  
  // 根據情緒獲取動畫 URL
  const getAnimationPath = () => {
    // 基於情緒選擇不同的動畫
    switch(emotion.toLowerCase()) {
      case 'happy':
        return '/models/animations/M_Standing_Expressions_013.glb'; // 開心表情
      case 'angry':
        return '/models/animations/M_Standing_Expressions_013.glb'; // 生氣表情
      case 'surprised':
        return '/models/animations/M_Standing_Expressions_013.glb'; // 驚訝表情
      case 'dance':
        return '/models/animations/M_Dances_004.glb'; // 舞蹈動畫
      default:
        return '/models/animations/M_Standing_Idle_Neutral_01.glb'; // 閒置動畫
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        
        <ModelViewer 
          modelUrl={getModelPath()} 
          animationUrl={getAnimationPath()} 
        />
        
        <OrbitControls />
      </Canvas>
    </div>
  );
}