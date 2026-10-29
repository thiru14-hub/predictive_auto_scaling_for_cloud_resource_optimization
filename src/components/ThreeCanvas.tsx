import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { YearProjection, SceneVisualizationMode, CameraPreset } from '../types/finance';

interface ThreeCanvasProps {
  projections: YearProjection[];
  selectedAge: number;
  onSelectAge: (age: number) => void;
  visualizationMode: SceneVisualizationMode;
  cameraPreset: CameraPreset;
  hoveredAge: number | null;
  onHoverAge: (age: number | null) => void;
}

// Reusable math helpers outside loop for zero-GC
const _tempVec = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camPos = new THREE.Vector3();

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  projections,
  selectedAge,
  onSelectAge,
  visualizationMode,
  cameraPreset,
  hoveredAge,
  onHoverAge,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep callbacks current without recreating WebGL context
  const propsRef = useRef({
    projections,
    selectedAge,
    onSelectAge,
    visualizationMode,
    cameraPreset,
    hoveredAge,
    onHoverAge,
  });

  useEffect(() => {
    propsRef.current = {
      projections,
      selectedAge,
      onSelectAge,
      visualizationMode,
      cameraPreset,
      hoveredAge,
      onHoverAge,
    };
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as instructed by Three.js skill
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Scene with clean white background and soft light fog
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0xf8fafc); // Clean off-white slate-50
    scene.background = bgColor;
    scene.fog = new THREE.Fog(0xf8fafc, 45, 160);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    camera.position.set(0, 18, 48);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't go below ground
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.target.set(0, 6, 0);

    // Studio Environment map reflection via RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback gracefully
    }

    // Studio Lighting Rig (Balanced 3-Point)
    // 1. Warm Directional Key Light with soft shadow
    const keyLight = new THREE.DirectionalLight(0xfff8eb, 1.6);
    keyLight.position.set(25, 45, 30);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 40;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    // 2. Cool Sky / Ground Fill Light
    const hemiLight = new THREE.HemisphereLight(0xf0fdf4, 0xe2e8f0, 0.9);
    scene.add(hemiLight);

    // 3. Studio Rim Light for soft edge separation
    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.8);
    rimLight.position.set(-25, 20, -25);
    scene.add(rimLight);

    // Contact Ground Grid & Floor
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    // Soft infinite floor receiver
    const floorGeo = new THREE.PlaneGeometry(300, 300);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.02;
    floorMesh.receiveShadow = !isSoftwareGl;
    groundGroup.add(floorMesh);

    // Grid Lines (faint slate lines for analytical aesthetic)
    const gridHelper = new THREE.GridHelper(120, 60, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = 0;
    groundGroup.add(gridHelper);

    // Main Dynamic Content Group
    const contentGroup = new THREE.Group();
    scene.add(contentGroup);

    // Raycasting Setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    const interactiveMeshes: THREE.Object3D[] = [];

    // Track targets for camera transitions
    let targetCamPos = new THREE.Vector3().copy(camera.position);
    let targetCamLook = new THREE.Vector3().copy(controls.target);
    let isTransitioningCamera = false;

    // Helper: Build Procedural 3D Wealth Horizon Scene
    function buildHorizonScene(data: YearProjection[]) {
      interactiveMeshes.length = 0;
      while (contentGroup.children.length > 0) {
        const obj = contentGroup.children[0];
        contentGroup.remove(obj);
      }

      // Sample every 2-3 years for clear architectural cadence
      const step = Math.max(1, Math.round(data.length / 15));
      const sampledData = data.filter((_, idx) => idx % step === 0 || idx === data.length - 1);

      const maxNetWorth = Math.max(...data.map(d => Math.max(d.baselineNetWorth, d.scenarioNetWorth, 100000)));
      const maxHeight = 22; // max pillar height in 3D units

      const spacingX = 4.2;
      const totalWidth = (sampledData.length - 1) * spacingX;
      const startX = -totalWidth / 2;

      const baselinePoints: THREE.Vector3[] = [];
      const scenarioPoints: THREE.Vector3[] = [];

      sampledData.forEach((item, index) => {
        const posX = startX + index * spacingX;
        const isSelected = item.age === propsRef.current.selectedAge;
        const isHovered = item.age === propsRef.current.hoveredAge;

        // Heights
        const baseH = Math.max(0.5, (item.baselineNetWorth / maxNetWorth) * maxHeight);
        const scenH = Math.max(0.5, (item.scenarioNetWorth / maxNetWorth) * maxHeight);

        // BASELINE PILLAR (Left column, z = -1.6)
        const baseGroup = new THREE.Group();
        baseGroup.position.set(posX, 0, -1.6);

        // Podium base (beveled slab)
        const basePodiumGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.25, 24);
        const basePodiumMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.6,
          metalness: 0.1,
        });
        const basePodium = new THREE.Mesh(basePodiumGeo, basePodiumMat);
        basePodium.position.y = 0.125;
        basePodium.receiveShadow = !isSoftwareGl;
        baseGroup.add(basePodium);

        // Main Pillar Body (composite rounded column)
        const baseColGeo = new THREE.CylinderGeometry(0.85, 0.95, baseH, 24);
        const baseColMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8, // Slate / silver baseline
          roughness: 0.25,
          metalness: 0.2,
        });
        const baseCol = new THREE.Mesh(baseColGeo, baseColMat);
        baseCol.position.y = baseH / 2 + 0.25;
        baseCol.castShadow = !isSoftwareGl;
        baseCol.receiveShadow = !isSoftwareGl;
        baseGroup.add(baseCol);

        // Cap Ring
        const capRingGeo = new THREE.TorusGeometry(0.9, 0.08, 12, 24);
        const capRingMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.15,
          metalness: 0.8,
        });
        const capRing = new THREE.Mesh(capRingGeo, capRingMat);
        capRing.rotation.x = Math.PI / 2;
        capRing.position.y = baseH + 0.25;
        baseGroup.add(capRing);

        contentGroup.add(baseGroup);
        baselinePoints.push(new THREE.Vector3(posX, baseH + 0.25, -1.6));

        // SCENARIO PILLAR (Right column, z = 1.6)
        const scenGroup = new THREE.Group();
        scenGroup.position.set(posX, 0, 1.6);
        scenGroup.userData = { age: item.age, data: item };

        // Scenario Podium
        const scenPodiumGeo = new THREE.CylinderGeometry(1.3, 1.45, 0.28, 28);
        const isFavorable = item.netWorthDelta >= 0;
        const scenPodiumMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : isHovered ? 0x38bdf8 : 0xf1f5f9,
          roughness: 0.4,
          metalness: 0.3,
        });
        const scenPodium = new THREE.Mesh(scenPodiumGeo, scenPodiumMat);
        scenPodium.position.y = 0.14;
        scenPodium.receiveShadow = !isSoftwareGl;
        scenGroup.add(scenPodium);

        // Scenario Stacked Column (Liquid + Invested + Real Estate breakdown)
        const totalScenarioAssets = Math.max(1, item.scenarioLiquid + item.scenarioInvested + item.scenarioRealEstate);
        const liquidH = (item.scenarioLiquid / totalScenarioAssets) * scenH;
        const investedH = (item.scenarioInvested / totalScenarioAssets) * scenH;
        const realEstateH = (item.scenarioRealEstate / totalScenarioAssets) * scenH;

        let curY = 0.28;

        // 1. Liquid Base Slice (Soft Light Teal / Mint)
        if (liquidH > 0.1) {
          const liqGeo = new THREE.CylinderGeometry(1.0, 1.05, liquidH, 28);
          const liqMat = new THREE.MeshStandardMaterial({
            color: 0x6ee7b7, // light emerald/mint
            roughness: 0.2,
            metalness: 0.15,
          });
          const liqMesh = new THREE.Mesh(liqGeo, liqMat);
          liqMesh.position.y = curY + liquidH / 2;
          liqMesh.castShadow = !isSoftwareGl;
          scenGroup.add(liqMesh);
          curY += liquidH;
        }

        // 2. Invested Assets Slice (Sky Blue / Cerulean)
        if (investedH > 0.1) {
          const invGeo = new THREE.CylinderGeometry(0.96, 1.0, investedH, 28);
          const invMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // light sky blue
            roughness: 0.18,
            metalness: 0.25,
          });
          const invMesh = new THREE.Mesh(invGeo, invMat);
          invMesh.position.y = curY + investedH / 2;
          invMesh.castShadow = !isSoftwareGl;
          scenGroup.add(invMesh);
          curY += investedH;
        }

        // 3. Real Estate / Property Slice (Soft Lavender)
        if (realEstateH > 0.1) {
          const reGeo = new THREE.CylinderGeometry(0.92, 0.96, realEstateH, 28);
          const reMat = new THREE.MeshStandardMaterial({
            color: 0xa78bfa, // soft lavender/violet
            roughness: 0.22,
            metalness: 0.2,
          });
          const reMesh = new THREE.Mesh(reGeo, reMat);
          reMesh.position.y = curY + realEstateH / 2;
          reMesh.castShadow = !isSoftwareGl;
          scenGroup.add(reMesh);
          curY += realEstateH;
        }

        // Debt Ring Indicator if debt exists
        if (item.scenarioDebt > 0) {
          const debtTorusGeo = new THREE.TorusGeometry(1.15, 0.08, 16, 32);
          const debtTorusMat = new THREE.MeshStandardMaterial({
            color: 0xf43f5e, // soft rose red
            roughness: 0.3,
            metalness: 0.6,
          });
          const debtTorus = new THREE.Mesh(debtTorusGeo, debtTorusMat);
          debtTorus.rotation.x = Math.PI / 2;
          debtTorus.position.y = 0.5;
          scenGroup.add(debtTorus);
        }

        // Apex Geometric Jewel (Octahedron / Diamond at summit)
        const jewelGeo = new THREE.OctahedronGeometry(isSelected ? 0.65 : 0.42, 0);
        const jewelMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0ea5e9 : isFavorable ? 0x10b981 : 0xf59e0b,
          roughness: 0.1,
          metalness: 0.85,
        });
        const jewel = new THREE.Mesh(jewelGeo, jewelMat);
        jewel.position.y = curY + 0.45;
        jewel.castShadow = !isSoftwareGl;
        scenGroup.add(jewel);

        // Floating Selection Halo
        if (isSelected) {
          const haloGeo = new THREE.RingGeometry(1.4, 1.7, 32);
          const haloMat = new THREE.MeshBasicMaterial({
            color: 0x0284c7,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
          });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.rotation.x = -Math.PI / 2;
          halo.position.y = 0.04;
          scenGroup.add(halo);
        }

        // Milestones Floating Badge Beacon
        if (item.milestones && item.milestones.length > 0) {
          const beaconGeo = new THREE.SphereGeometry(0.35, 16, 16);
          const beaconMat = new THREE.MeshStandardMaterial({
            color: item.milestones[0].type === 'fire' 
              ? 0x10b981 
              : item.milestones[0].type === 'decision_start' 
              ? 0x6366f1 
              : 0xf59e0b,
            roughness: 0.2,
            metalness: 0.7,
          });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.y = curY + 1.4;
          scenGroup.add(beacon);

          // Thin guide pole to ground
          const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, curY + 1.2, 8);
          const poleMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
          const pole = new THREE.Mesh(poleGeo, poleMat);
          pole.position.y = (curY + 1.2) / 2;
          scenGroup.add(pole);
        }

        contentGroup.add(scenGroup);
        interactiveMeshes.push(scenPodium);
        scenarioPoints.push(new THREE.Vector3(posX, curY + 0.45, 1.6));
      });

      // Flowing 3D Spline Ribbons connecting pillars across time
      if (baselinePoints.length > 2) {
        const baseCurve = new THREE.CatmullRomCurve3(baselinePoints);
        const baseTubeGeo = new THREE.TubeGeometry(baseCurve, 64, 0.12, 12, false);
        const baseTubeMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.3,
          metalness: 0.5,
          transparent: true,
          opacity: 0.75,
        });
        const baseTube = new THREE.Mesh(baseTubeGeo, baseTubeMat);
        contentGroup.add(baseTube);
      }

      if (scenarioPoints.length > 2) {
        const scenCurve = new THREE.CatmullRomCurve3(scenarioPoints);
        const scenTubeGeo = new THREE.TubeGeometry(scenCurve, 64, 0.16, 12, false);
        const scenTubeMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.15,
          metalness: 0.6,
        });
        const scenTube = new THREE.Mesh(scenTubeGeo, scenTubeMat);
        contentGroup.add(scenTube);
      }
    }

    // Helper: Build Procedural 3D Asset Anatomy Scene (Concentric Gyroscopic Core)
    function buildAnatomyScene(data: YearProjection[], age: number) {
      interactiveMeshes.length = 0;
      while (contentGroup.children.length > 0) {
        const obj = contentGroup.children[0];
        contentGroup.remove(obj);
      }

      const currentYearData = data.find(d => d.age === age) || data[0];
      const totalWealth = Math.max(10000, currentYearData.scenarioNetWorth);
      const liquid = Math.max(0, currentYearData.scenarioLiquid);
      const invested = Math.max(0, currentYearData.scenarioInvested);
      const property = Math.max(0, currentYearData.scenarioRealEstate);
      const debt = Math.max(0, currentYearData.scenarioDebt);

      const anatomyGroup = new THREE.Group();
      anatomyGroup.position.set(0, 7, 0);

      // Central Luminous Core: Liquid Cash Reserve
      const coreR = Math.min(2.5, Math.max(0.8, (liquid / totalWealth) * 3.5));
      const coreGeo = new THREE.IcosahedronGeometry(coreR, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x10b981, // mint
        roughness: 0.15,
        metalness: 0.7,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      anatomyGroup.add(coreMesh);

      // Outer Ring 1: Invested Portfolio (Index funds & equities)
      const ring1Radius = coreR + 2.2;
      const ring1Geo = new THREE.TorusGeometry(ring1Radius, 0.45, 24, 64);
      const ring1Mat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // cerulean
        roughness: 0.2,
        metalness: 0.5,
      });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 4;
      anatomyGroup.add(ring1);

      // Outer Ring 2: Real Assets / Property (if any)
      if (property > 0) {
        const ring2Radius = ring1Radius + 2.4;
        const ring2Geo = new THREE.TorusGeometry(ring2Radius, 0.4, 24, 64);
        const ring2Mat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6, // purple
          roughness: 0.25,
          metalness: 0.4,
        });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.y = Math.PI / 3;
        anatomyGroup.add(ring2);
      }

      // Outer Ring 3: Debt Shield / Liability Ring
      if (debt > 0) {
        const debtRadius = ring1Radius + (property > 0 ? 4.5 : 2.2);
        const debtGeo = new THREE.TorusGeometry(debtRadius, 0.25, 24, 64);
        const debtMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e, // rose
          roughness: 0.3,
          metalness: 0.8,
        });
        const debtRing = new THREE.Mesh(debtGeo, debtMat);
        debtRing.rotation.z = Math.PI / 3;
        anatomyGroup.add(debtRing);
      }

      // Gyroscopic Floating Ring Trim
      const gyroGeo = new THREE.RingGeometry(8.5, 8.7, 64);
      const gyroMat = new THREE.MeshBasicMaterial({
        color: 0xcbd5e1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const gyro = new THREE.Mesh(gyroGeo, gyroMat);
      gyro.rotation.x = Math.PI / 2;
      anatomyGroup.add(gyro);

      // Ground shadow pad
      const shadowPadGeo = new THREE.CircleGeometry(6, 32);
      const shadowPadMat = new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        transparent: true,
        opacity: 0.4,
      });
      const shadowPad = new THREE.Mesh(shadowPadGeo, shadowPadMat);
      shadowPad.rotation.x = -Math.PI / 2;
      shadowPad.position.y = -6.95;
      anatomyGroup.add(shadowPad);

      contentGroup.add(anatomyGroup);
    }

    // Helper: Build Procedural 3D Decision Divergence Fork Scene
    function buildDivergenceScene(data: YearProjection[]) {
      interactiveMeshes.length = 0;
      while (contentGroup.children.length > 0) {
        const obj = contentGroup.children[0];
        contentGroup.remove(obj);
      }

      const divGroup = new THREE.Group();
      divGroup.position.set(0, 0, 0);

      // Branching Trunk & Twin Archways
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-15, 0.5, 0),
        new THREE.Vector3(-8, 2, 0),
        new THREE.Vector3(0, 4, 0),
      ]);
      const trunkGeo = new THREE.TubeGeometry(trunkCurve, 32, 0.5, 16, false);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.3,
        metalness: 0.3,
      });
      const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
      divGroup.add(trunkMesh);

      // Branch A (Baseline Status Quo Path - Slate Gray)
      const branchBaseCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(8, 6, -6),
        new THREE.Vector3(18, 9, -12),
      ]);
      const branchBaseGeo = new THREE.TubeGeometry(branchBaseCurve, 32, 0.4, 16, false);
      const branchBaseMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.25,
        metalness: 0.4,
      });
      const branchBase = new THREE.Mesh(branchBaseGeo, branchBaseMat);
      divGroup.add(branchBase);

      // Branch B (Decision Scenario Path - Sky Blue / Mint)
      const branchScenCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(8, 7, 6),
        new THREE.Vector3(18, 13, 12),
      ]);
      const branchScenGeo = new THREE.TubeGeometry(branchScenCurve, 32, 0.5, 16, false);
      const branchScenMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.15,
        metalness: 0.6,
      });
      const branchScen = new THREE.Mesh(branchScenGeo, branchScenMat);
      divGroup.add(branchScen);

      // Wealth Gap Metric Bridge (Vertical glowing light line between branches at year 20)
      const bridgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 10, 16);
      const bridgeMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.1,
        metalness: 0.9,
      });
      const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      bridge.position.set(18, 11, 0);
      divGroup.add(bridge);

      // Divergence Summit Monoliths
      const baseFinalGeo = new THREE.CylinderGeometry(1.2, 1.3, 3, 24);
      const baseFinalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3 });
      const baseFinal = new THREE.Mesh(baseFinalGeo, baseFinalMat);
      baseFinal.position.set(18, 9, -12);
      divGroup.add(baseFinal);

      const scenFinalGeo = new THREE.CylinderGeometry(1.4, 1.5, 5, 24);
      const scenFinalMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.5 });
      const scenFinal = new THREE.Mesh(scenFinalGeo, scenFinalMat);
      scenFinal.position.set(18, 13, 12);
      divGroup.add(scenFinal);

      contentGroup.add(divGroup);
    }

    // Refresh content when mode or projections change
    function rebuildScene() {
      const mode = propsRef.current.visualizationMode;
      const data = propsRef.current.projections;
      const age = propsRef.current.selectedAge;

      if (mode === 'horizon') {
        buildHorizonScene(data);
      } else if (mode === 'anatomy') {
        buildAnatomyScene(data, age);
      } else if (mode === 'divergence') {
        buildDivergenceScene(data);
      }
    }

    rebuildScene();

    // Camera preset transition coordinator
    function applyCameraPreset(preset: CameraPreset) {
      isTransitioningCamera = true;
      if (preset === 'diagonal') {
        targetCamPos.set(0, 18, 48);
        targetCamLook.set(0, 6, 0);
      } else if (preset === 'front') {
        targetCamPos.set(0, 14, 52);
        targetCamLook.set(0, 7, 0);
      } else if (preset === 'top') {
        targetCamPos.set(0, 55, 12);
        targetCamLook.set(0, 0, 0);
      } else if (preset === 'close') {
        targetCamPos.set(8, 9, 20);
        targetCamLook.set(4, 5, 0);
      }
    }

    // Mouse & Raycasting Pointer Listeners
    function onPointerMove(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        while (parent && !parent.userData?.age && parent !== scene) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.age) {
          propsRef.current.onHoverAge(parent.userData.age);
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      propsRef.current.onHoverAge(null);
      renderer.domElement.style.cursor = 'default';
    }

    function onPointerClick(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        while (parent && !parent.userData?.age && parent !== scene) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.age) {
          propsRef.current.onSelectAge(parent.userData.age);
        }
      }
    }

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onPointerClick);

    // Cancel scripted camera transitions when user manually rotates
    controls.addEventListener('start', () => {
      isTransitioningCamera = false;
    });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop with Software WebGL pacing as per Skill guidelines
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();

      // Smooth Camera Transitions via exponential damping
      if (isTransitioningCamera) {
        camera.position.lerp(targetCamPos, 0.08);
        controls.target.lerp(targetCamLook, 0.08);
        if (camera.position.distanceTo(targetCamPos) < 0.1) {
          isTransitioningCamera = false;
        }
      }

      controls.update();

      // Gentle procedural rotation for Anatomy mode
      if (propsRef.current.visualizationMode === 'anatomy' && contentGroup.children.length > 0) {
        contentGroup.children[0].rotation.y += 0.003;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Store references to handle updates
    const canvasApi = {
      rebuildScene,
      applyCameraPreset,
    };
    (container as any).__threeApi = canvasApi;

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onPointerClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync scene when projections, mode, or selectedAge change
  useEffect(() => {
    const api = (mountRef.current as any)?.__threeApi;
    if (api) {
      api.rebuildScene();
    }
  }, [projections, visualizationMode, selectedAge, hoveredAge]);

  // Sync camera when preset changes
  useEffect(() => {
    const api = (mountRef.current as any)?.__threeApi;
    if (api) {
      api.applyCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
