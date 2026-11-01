import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  Rotate3d, 
  Layers, 
  Smartphone, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  CheckCircle,
  Eye
} from 'lucide-react';

interface Card3DViewerProps {
  initialBusinessName?: string;
  onOrderCard?: () => void;
}

export const Card3DViewer: React.FC<Card3DViewerProps> = ({
  initialBusinessName = 'Sua Empresa Aqui',
  onOrderCard,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [finish, setFinish] = useState<'black_luxury' | 'google_white' | 'gold_titanium'>('black_luxury');
  const [isExploded, setIsExploded] = useState(false);
  const [explodedVal, setExplodedVal] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tapStatus, setTapStatus] = useState<string | null>(null);

  // References to 3D parts to mutate dynamically
  const cardGroupRef = useRef<THREE.Group | null>(null);
  const frontMeshRef = useRef<THREE.Mesh | null>(null);
  const backMeshRef = useRef<THREE.Mesh | null>(null);
  const chipMeshRef = useRef<THREE.Mesh | null>(null);
  const coilMeshRef = useRef<THREE.Mesh | null>(null);
  const standMeshRef = useRef<THREE.Group | null>(null);
  const pulseRingMeshRef = useRef<THREE.Mesh | null>(null);
  const canvasTextureFrontRef = useRef<THREE.CanvasTexture | null>(null);
  const canvasTextureBackRef = useRef<THREE.CanvasTexture | null>(null);

  const requestRenderRef = useRef<() => void>(() => {});
  const targetExplodedRef = useRef<number>(0);
  const currentExplodedRef = useRef<number>(0);

  // Procedural Sound Generator (Zero 404s)
  const playNfcChirp = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Helper to draw procedural card front texture
  const drawFrontTexture = (ctx: CanvasRenderingContext2D, name: string, theme: string) => {
    ctx.clearRect(0, 0, 1024, 646);

    // Background base
    if (theme === 'black_luxury') {
      const grad = ctx.createLinearGradient(0, 0, 1024, 646);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 646);

      // Subtle geometric accents
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)'; // Amber/Gold
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 964, 586);
    } else if (theme === 'google_white') {
      const grad = ctx.createLinearGradient(0, 0, 1024, 646);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 646);

      ctx.strokeStyle = 'rgba(66, 133, 244, 0.3)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 964, 586);
    } else {
      // gold_titanium
      const grad = ctx.createLinearGradient(0, 0, 1024, 646);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 646);

      ctx.strokeStyle = 'rgba(113, 63, 18, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 964, 586);
    }

    // Google G Emblem Top Left
    ctx.save();
    ctx.translate(90, 100);
    ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#4285F4';
    ctx.fillText('G', 0, 0);
    ctx.fillStyle = '#EA4335';
    ctx.fillText('o', 42, 0);
    ctx.fillStyle = '#FBBC05';
    ctx.fillText('o', 74, 0);
    ctx.fillStyle = '#4285F4';
    ctx.fillText('g', 106, 0);
    ctx.fillStyle = '#34A853';
    ctx.fillText('l', 138, 0);
    ctx.fillStyle = '#EA4335';
    ctx.fillText('e', 152, 0);

    ctx.font = '600 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#475569' : '#94a3b8';
    ctx.fillText('AVALIE-NOS NO GOOGLE', 0, 36);
    ctx.restore();

    // 5 Stars
    ctx.save();
    ctx.translate(90, 185);
    const starCount = 5;
    for (let i = 0; i < starCount; i++) {
      ctx.font = '40px sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('★', i * 42, 0);
    }
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#0f172a' : '#f8fafc';
    ctx.fillText('5.0 EXCELENTE', 230, -5);
    ctx.restore();

    // Contactless NFC Wave Icon Top Right
    ctx.save();
    ctx.translate(900, 110);
    ctx.strokeStyle = theme === 'google_white' ? '#2563eb' : '#38bdf8';
    ctx.lineWidth = 5;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 16, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();
    }
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#2563eb' : '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('NFC', 0, 30);
    ctx.restore();

    // Central Instruction
    ctx.save();
    ctx.translate(512, 330);
    ctx.textAlign = 'center';

    // Rounded badge
    ctx.fillStyle = theme === 'google_white' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(-280, -36, 560, 72, 16);
    ctx.fill();

    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#1e293b' : '#ffffff';
    ctx.fillText('📲 APROXIME O SEU CELULAR AQUI', 0, 10);
    ctx.restore();

    // Dynamic Business Name
    ctx.save();
    ctx.translate(90, 490);
    ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#0f172a' : '#f8fafc';
    const cleanName = (name || 'Sua Empresa Aqui').toUpperCase();
    ctx.fillText(cleanName.substring(0, 28), 0, 0);

    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#64748b' : '#94a3b8';
    ctx.fillText('TECNOLOGIA RETOMA DIGITAL • CHIP NFC HOMOLOGADO', 0, 34);
    ctx.restore();
  };

  // Helper to draw procedural card back texture (QR code and details)
  const drawBackTexture = (ctx: CanvasRenderingContext2D, theme: string) => {
    ctx.clearRect(0, 0, 1024, 646);

    if (theme === 'black_luxury') {
      ctx.fillStyle = '#0f172a';
    } else if (theme === 'google_white') {
      ctx.fillStyle = '#f8fafc';
    } else {
      ctx.fillStyle = '#ca8a04';
    }
    ctx.fillRect(0, 0, 1024, 646);

    // Magnetic / chip simulation band
    ctx.fillStyle = theme === 'black_luxury' ? '#1e293b' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 70, 1024, 110);

    // Procedural QR Code Grid on right
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(720, 240, 220, 220);

    ctx.fillStyle = '#0f172a';
    // Draw QR pattern simulation
    const qrSize = 10;
    const boxSize = 18;
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        // corners finder patterns
        const isCorner =
          (r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3);
        if (isCorner || (r * c + r + c) % 3 === 0) {
          ctx.fillRect(740 + c * boxSize, 260 + r * boxSize, boxSize - 2, boxSize - 2);
        }
      }
    }

    // Left info
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#0f172a' : '#ffffff';
    ctx.fillText('OU APONTE A CÂMERA PARA O QR CODE', 80, 290);

    ctx.font = '18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#475569' : '#cbd5e1';
    ctx.fillText('Compatível com todos os modelos de iPhone e Android', 80, 330);
    ctx.fillText('Não precisa baixar nenhum aplicativo', 80, 365);
    ctx.fillText('Avaliação em 5 segundos direto na sua página', 80, 400);

    // Official stamp
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'google_white' ? '#2563eb' : '#38bdf8';
    ctx.fillText('RETOMA DIGITAL • SUPORTE: (68) 99282-7744', 80, 520);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per skill directive
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.08);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 1.8, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting Rig
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
    keyLight.position.set(3.5, 4.5, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 3;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    // Cool fill light
    const fillLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 1.1);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.4);
    rimLight.position.set(-3.5, 2.0, -3.0);
    scene.add(rimLight);

    // Soft Radial Contact Shadow Grounding Plane (y = 0)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const radGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    radGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.8,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.005;
    scene.add(shadowPlane);

    // Floor subtle grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x1e3a8a, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // === PROCEDURAL 3D COMPOSITE MODEL: CARD + CHIP + COIL + STAND ===
    // Dimensions aligned with standard ISO credit card (ratio 85.6mm x 53.98mm)
    const cardWidth = 3.4;
    const cardHeight = 2.14;
    const cardThickness = 0.045;
    const cornerRadius = 0.16;

    // Rounded card shape
    const shape = new THREE.Shape();
    const x = -cardWidth / 2;
    const y0 = -cardHeight / 2;
    const w = cardWidth;
    const h = cardHeight;
    const r = cornerRadius;

    shape.moveTo(x + r, y0);
    shape.lineTo(x + w - r, y0);
    shape.quadraticCurveTo(x + w, y0, x + w, y0 + r);
    shape.lineTo(x + w, y0 + h - r);
    shape.quadraticCurveTo(x + w, y0 + h, x + w - r, y0 + h);
    shape.lineTo(x + r, y0 + h);
    shape.quadraticCurveTo(x, y0 + h, x, y0 + h - r);
    shape.lineTo(x, y0 + r);
    shape.quadraticCurveTo(x, y0, x + r, y0);

    const extrudeSettings = {
      depth: cardThickness,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    };

    const cardGroup = new THREE.Group();
    cardGroupRef.current = cardGroup;
    cardGroup.position.set(0, 1.15, 0);
    scene.add(cardGroup);

    // Setup procedural textures for front & back
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = 1024;
    frontCanvas.height = 646;
    const frontCtx = frontCanvas.getContext('2d')!;
    drawFrontTexture(frontCtx, businessName, finish);

    const frontTex = new THREE.CanvasTexture(frontCanvas);
    frontTex.colorSpace = THREE.SRGBColorSpace;
    frontTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    canvasTextureFrontRef.current = frontTex;

    const backCanvas = document.createElement('canvas');
    backCanvas.width = 1024;
    backCanvas.height = 646;
    const backCtx = backCanvas.getContext('2d')!;
    drawBackTexture(backCtx, finish);

    const backTex = new THREE.CanvasTexture(backCanvas);
    backTex.colorSpace = THREE.SRGBColorSpace;
    backTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    canvasTextureBackRef.current = backTex;

    // 1. Core Card Body (Primary Silhouette)
    const cardCoreGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    cardCoreGeo.center();
    const cardCoreMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.6,
      roughness: 0.25,
    });
    const cardCoreMesh = new THREE.Mesh(cardCoreGeo, cardCoreMat);
    cardCoreMesh.castShadow = !isSoftwareGl;
    cardCoreMesh.receiveShadow = !isSoftwareGl;
    cardGroup.add(cardCoreMesh);

    // 2. Front Face Layer (Secondary read)
    const facePlaneGeo = new THREE.PlaneGeometry(cardWidth * 0.98, cardHeight * 0.98);
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      roughness: 0.18,
      metalness: 0.45,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    });
    const frontMesh = new THREE.Mesh(facePlaneGeo, frontMat);
    frontMesh.position.z = cardThickness / 2 + 0.014;
    frontMeshRef.current = frontMesh;
    cardGroup.add(frontMesh);

    // 3. Back Face Layer
    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      roughness: 0.25,
      metalness: 0.35,
    });
    const backMesh = new THREE.Mesh(facePlaneGeo, backMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -(cardThickness / 2 + 0.014);
    backMeshRef.current = backMesh;
    cardGroup.add(backMesh);

    // 4. Gold Microchip IC Pad (Accent Detail)
    const chipGeo = new THREE.BoxGeometry(0.42, 0.32, 0.02);
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
    });
    const chipMesh = new THREE.Mesh(chipGeo, chipMat);
    chipMesh.position.set(-0.95, 0.1, cardThickness / 2 + 0.018);
    chipMeshRef.current = chipMesh;
    cardGroup.add(chipMesh);

    // 5. Internal Copper NFC Antenna Coil (Visible in Exploded view)
    const coilGroup = new THREE.Group();
    coilMeshRef.current = coilGroup as unknown as THREE.Mesh;
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.9,
      roughness: 0.2,
    });

    for (let c = 0; c < 3; c++) {
      const loopW = cardWidth * 0.88 - c * 0.16;
      const loopH = cardHeight * 0.84 - c * 0.16;
      const loopShape = new THREE.Shape();
      loopShape.moveTo(-loopW / 2, -loopH / 2);
      loopShape.lineTo(loopW / 2, -loopH / 2);
      loopShape.lineTo(loopW / 2, loopH / 2);
      loopShape.lineTo(-loopW / 2, loopH / 2);
      loopShape.closePath();

      const edgeGeo = new THREE.BoxGeometry(loopW, 0.018, 0.008);
      const topEdge = new THREE.Mesh(edgeGeo, copperMat);
      topEdge.position.y = loopH / 2;
      coilGroup.add(topEdge);

      const bottomEdge = new THREE.Mesh(edgeGeo, copperMat);
      bottomEdge.position.y = -loopH / 2;
      coilGroup.add(bottomEdge);

      const sideGeo = new THREE.BoxGeometry(0.018, loopH, 0.008);
      const leftEdge = new THREE.Mesh(sideGeo, copperMat);
      leftEdge.position.x = -loopW / 2;
      coilGroup.add(leftEdge);

      const rightEdge = new THREE.Mesh(sideGeo, copperMat);
      rightEdge.position.x = loopW / 2;
      coilGroup.add(rightEdge);
    }
    coilGroup.position.z = 0;
    cardGroup.add(coilGroup);

    // 6. Acrylic Desktop Display Stand (Support for counter demonstrations)
    const standGroup = new THREE.Group();
    standMeshRef.current = standGroup;
    standGroup.position.set(0, 0.12, 0);

    const standBaseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.22, 32);
    const standMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.3,
      roughness: 0.15,
      clearcoat: 0.8,
    });
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.castShadow = !isSoftwareGl;
    standBase.receiveShadow = !isSoftwareGl;
    standGroup.add(standBase);

    // Glowing accent trim on base
    const trimGeo = new THREE.TorusGeometry(1.65, 0.02, 16, 64);
    trimGeo.rotateX(Math.PI / 2);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.11;
    standGroup.add(trimMesh);

    scene.add(standGroup);

    // 7. Interactive NFC Tap Pulse Wave Rings
    const pulseRingGeo = new THREE.RingGeometry(0.1, 0.18, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRingMesh.position.set(0, 0, cardThickness / 2 + 0.06);
    pulseRingMeshRef.current = pulseRingMesh;
    cardGroup.add(pulseRingMesh);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.target.set(0, 1.0, 0);

    let frameId = 0;
    let pulseScale = 1.0;
    let pulseOpacity = 0.0;

    // Animation Loop with Exponential Damping
    const tick = () => {
      // Smooth auto-rotation when idle and not exploded
      if (targetExplodedRef.current === 0) {
        cardGroup.rotation.y += 0.005;
      }

      // Smooth interpolation for exploded view separation
      currentExplodedRef.current = THREE.MathUtils.damp(
        currentExplodedRef.current,
        targetExplodedRef.current,
        8,
        0.016
      );

      const dist = currentExplodedRef.current;
      if (frontMeshRef.current) {
        frontMeshRef.current.position.z = cardThickness / 2 + 0.014 + dist * 0.6;
      }
      if (backMeshRef.current) {
        backMeshRef.current.position.z = -(cardThickness / 2 + 0.014 + dist * 0.6);
      }
      if (chipMeshRef.current) {
        chipMeshRef.current.position.z = cardThickness / 2 + 0.018 + dist * 0.9;
      }

      // Pulse ring animation
      if (pulseOpacity > 0.01) {
        pulseScale += 0.06;
        pulseOpacity *= 0.94;
        if (pulseRingMeshRef.current) {
          pulseRingMeshRef.current.scale.set(pulseScale, pulseScale, 1);
          (pulseRingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = pulseOpacity;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update business name & finish dynamically on texture
  useEffect(() => {
    if (canvasTextureFrontRef.current) {
      const canvas = canvasTextureFrontRef.current.image as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawFrontTexture(ctx, businessName, finish);
          canvasTextureFrontRef.current.needsUpdate = true;
        }
      }
    }

    if (canvasTextureBackRef.current) {
      const canvas = canvasTextureBackRef.current.image as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawBackTexture(ctx, finish);
          canvasTextureBackRef.current.needsUpdate = true;
        }
      }
    }
  }, [businessName, finish]);

  // Exploded View Trigger
  const toggleExploded = () => {
    const next = !isExploded;
    setIsExploded(next);
    targetExplodedRef.current = next ? 1.0 : 0.0;
  };

  // Test NFC Tap Simulation
  const handleTestTap = () => {
    playNfcChirp();
    setTapStatus('📲 Celular detectado! Abrindo página de avaliação 5 estrelas do Google...');

    if (pulseRingMeshRef.current) {
      pulseRingMeshRef.current.scale.set(1, 1, 1);
      (pulseRingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
    }

    setTimeout(() => {
      setTapStatus('⭐ Avaliação 5 estrelas registrada com sucesso no Google Meu Negócio!');
    }, 1800);

    setTimeout(() => {
      setTapStatus(null);
    }, 5500);
  };

  return (
    <div className="relative w-full h-[640px] md:h-[720px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl border border-slate-700/80 pointer-events-auto flex items-center gap-3 shadow-lg">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-none" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Demonstrador Interativo 3D
            </div>
            <div className="text-sm font-bold text-slate-100">
              Cartão NFC Retoma Google Avaliação
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 text-xs hidden sm:flex items-center gap-2 pointer-events-auto">
          <Rotate3d className="w-4 h-4 text-blue-400" />
          <span>Arraste para girar 360° • Scroll para zoom</span>
        </div>
      </div>

      {/* Floating NFC Notification Banner */}
      {tapStatus && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-400 flex items-center gap-3 z-30 transition-all">
          <CheckCircle className="w-6 h-6 text-amber-300 shrink-0" />
          <span className="text-sm font-medium">{tapStatus}</span>
        </div>
      )}

      {/* Collapsible Unified Bottom Control Dock (Directives compliant) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 transition-all duration-300">
        {/* Toggle Collapse Bar */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-slate-900 text-slate-300 hover:text-white px-4 py-1 rounded-t-xl border-t border-x border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Mostrar Controles do Cartão 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Modo Cinema / Ocultar Painel</span>
              </>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Dynamic Business Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Personalizar Nome no Cartão 3D:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    maxLength={30}
                    placeholder="Ex: Sua Empresa Aqui"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <Sparkles className="w-4 h-4 text-amber-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Finish Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Acabamento do Cartão:
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFinish('black_luxury')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      finish === 'black_luxury'
                        ? 'bg-slate-800 text-white border border-amber-500/80'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Preto Ônix
                  </button>
                  <button
                    onClick={() => setFinish('google_white')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      finish === 'google_white'
                        ? 'bg-white text-slate-900 border border-blue-500'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Google White
                  </button>
                  <button
                    onClick={() => setFinish('gold_titanium')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      finish === 'gold_titanium'
                        ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Gold VIP
                  </button>
                </div>
              </div>

              {/* Interactive Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestTap}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span>Simular Tap NFC</span>
                </button>

                <button
                  onClick={toggleExploded}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border cursor-pointer ${
                    isExploded
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                  }`}
                  title="Raio-X: Ver chip de silício e bobina de cobre interna"
                >
                  <Layers className="w-4 h-4" />
                  <span>{isExploded ? 'Fechar Raio-X' : 'Ver Chip/Antena'}</span>
                </button>
              </div>
            </div>

            {/* Quick Pitch & CTA to Order */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✔ 100% Homologado</span>
                <span>• Funciona com iPhone e Android sem aplicativo</span>
                <span>• Acompanha base de balcão e QR Code dinâmico</span>
              </div>

              {onOrderCard && (
                <button
                  onClick={onOrderCard}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Incluir Cartão no Contrato</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
