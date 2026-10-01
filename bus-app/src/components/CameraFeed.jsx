import React, { useState, useRef, useEffect } from 'react';
import { FaceLandmarker, ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// MediaPipe FaceMesh Eye Contour Landmark Indices
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Configurable EAR Thresholds & Debouncing Parameters
const EAR_CLOSED_THRESHOLD = 0.21; // EAR below 0.21 indicates CLOSED eyes
const SMOOTHING_FRAME_WINDOW = 4;   // Rolling average frame window to smooth frame noise

// Euclidean distance helper with optional pixel dimension scaling
const distance = (pt1, pt2, width = 1, height = 1) => {
  const dx = (pt1.x - pt2.x) * width;
  const dy = (pt1.y - pt2.y) * height;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate Eye Aspect Ratio (EAR) from 6 key landmarks
const calculateEAR = (landmarks, p1, p2, p3, p4, p5, p6, width = 1, height = 1) => {
  const pt1 = landmarks[p1];
  const pt2 = landmarks[p2];
  const pt3 = landmarks[p3];
  const pt4 = landmarks[p4];
  const pt5 = landmarks[p5];
  const pt6 = landmarks[p6];

  if (!pt1 || !pt2 || !pt3 || !pt4 || !pt5 || !pt6) return 0;

  const vertical1 = distance(pt2, pt6, width, height);
  const vertical2 = distance(pt3, pt5, width, height);
  const horizontal = distance(pt1, pt4, width, height);

  if (horizontal === 0) return 0;

  return (vertical1 + vertical2) / (2.0 * horizontal);
};

export const CameraFeed = ({ activeDriver, activeVehicle }) => {
  // Active session driver & vehicle references to ensure async/animation loops access current session
  const activeDriverRef = useRef(activeDriver);
  const activeVehicleRef = useRef(activeVehicle);

  useEffect(() => {
    activeDriverRef.current = activeDriver;
  }, [activeDriver]);

  useEffect(() => {
    activeVehicleRef.current = activeVehicle;
  }, [activeVehicle]);

  // Camera states: 'OFF' | 'REQUESTING' | 'ACTIVE' | 'ERROR'
  const [cameraState, setCameraState] = useState('OFF');
  const [errorMessage, setErrorMessage] = useState('');
  const [streamInfo, setStreamInfo] = useState(null);

  // Detection status: 'NO_FACE' | 'FACE_NO_EYES' | 'EYES_DETECTED'
  const [detectionStatus, setDetectionStatus] = useState('NO_FACE');

  // Eye open/closed state: 'OPEN' | 'CLOSED'
  const [eyeState, setEyeState] = useState('OPEN');
  const [earData, setEarData] = useState({ leftEar: '0.00', rightEar: '0.00', avgEar: '0.00' });

  // Phase 5: Continuous Eye Closure timing & prolonged closure threshold
  const [closureDuration, setClosureDuration] = useState(0); // continuous closure duration in seconds
  const [prolongedThreshold, setProlongedThreshold] = useState(1.5); // configurable threshold in seconds (default 1.5s)

  // Phase 6: Local Drowsiness Score (0-100) & decay timestamp ref
  const [drowsinessScore, setDrowsinessScore] = useState(0);

  // Phase 7: Local Safety Alerts & Active Session Event Counters
  const [audioMuted, setAudioMuted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    prolongedCount: 0,
    highRiskCount: 0,
    maxClosureDuration: 0
  });

  // Debug HUD state
  const [modelStatus, setModelStatus] = useState('LOADING'); // 'LOADING' | 'READY' | 'ERROR'
  const [initErrorMsg, setInitErrorMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState({
    faceCount: 0,
    hasLandmarks: false,
    leftEar: '0.00',
    rightEar: '0.00',
    avgEar: '0.00',
    timestamp: 0
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const objectDetectorRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const isLoopingRef = useRef(false);
  const frameCountRef = useRef(0);
  const wasFaceDetectedRef = useRef(null);
  const videoReadyLoggedRef = useRef(false);
  const earHistoryRef = useRef([]);
  const closedStartTimeRef = useRef(null);
  const audioCtxRef = useRef(null);
  const lastAlertStateRef = useRef({ isProlonged: false, isHighRisk: false, isCriticalSent: false });
  const lastPhoneAlertRef = useRef({ isSent: false, lastSentTimestamp: 0 });
  const lastLandmarkTimestampRef = useRef(-1);
  const lastFrameTimestampRef = useRef(null);
  const [isPhoneDetected, setIsPhoneDetected] = useState(false);

  // Non-blocking helper to post critical drowsiness alert to backend manager system
  const sendManagerCriticalAlert = async (score, durationSec) => {
    try {
      const drv = activeDriverRef.current || activeDriver || {};
      const veh = activeVehicleRef.current || activeVehicle || {};

      const payload = {
        driverId: drv.id || "DRV-001",
        driverName: drv.name || "Arun Kumar",
        vehicleId: veh.id || "VEH-001",
        type: "Severe Drowsiness",
        severity: "CRITICAL",
        drowsinessScore: Math.round(score),
        closureDuration: Number(durationSec.toFixed(1)),
        details: `Critical prolonged eye closure detected (${durationSec.toFixed(1)}s continuous closure, score: ${Math.round(score)}/100)`,
        status: "Unresolved",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (Live)"
      };

      console.log("[Vigi360 Manager Alert] Dispatching CRITICAL alert to backend...", payload);

      const res = await fetch("http://localhost:5000/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        console.log("[Vigi360 Manager Alert] Alert successfully recorded in backend MongoDB:", json.data);
      }
    } catch (err) {
      console.warn("[Vigi360 Manager Alert] Network notice (non-blocking):", err.message);
    }
  };

  // Non-blocking helper to post mobile phone usage alert to backend manager system
  const sendManagerPhoneAlert = async (score) => {
    try {
      const drv = activeDriverRef.current || activeDriver || {};
      const veh = activeVehicleRef.current || activeVehicle || {};

      const confidencePct = Math.round((score || 0.85) * 100);
      const payload = {
        driverId: drv.id || "DRV-001",
        driverName: drv.name || "Arun Kumar",
        vehicleId: veh.id || "VEH-001",
        type: "Mobile Phone Usage",
        severity: "HIGH",
        drowsinessScore: 0,
        closureDuration: 0,
        details: `Distraction alert: Mobile phone usage detected in driver video feed (${confidencePct}% confidence)`,
        status: "Unresolved",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (Live)"
      };

      console.log("[Vigi360 Manager Alert] Dispatching HIGH Mobile Phone Usage alert to backend...", payload);

      const res = await fetch("http://localhost:5000/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        console.log("[Vigi360 Manager Alert] Mobile Phone alert recorded in backend MongoDB:", json.data);
      }
    } catch (err) {
      console.warn("[Vigi360 Manager Alert] Network notice when posting phone alert:", err.message);
    }
  };


  // Phase 7: Web Audio Alert Chime Synthesizer
  const playWarningBeep = (freq = 880, type = 'sine', durationMs = 200) => {
    if (audioMuted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + durationMs / 1000);
    } catch (err) {
      // ignore web audio autoplay restriction warnings
    }
  };

  // Phase 7: Reset Session Stats Handler
  const handleResetStats = () => {
    setSessionStats({ prolongedCount: 0, highRiskCount: 0, maxClosureDuration: 0 });
    lastAlertStateRef.current = { isProlonged: false, isHighRisk: false, isCriticalSent: false };
  };

  // Status mapping helper based on Phase 6 ranges:
  // 0–29 = SAFE | 30–59 = WARNING | 60–79 = DROWSY | 80–100 = CRITICAL
  const getDrowsinessStatus = (score) => {
    const s = Math.round(score);
    if (s >= 80) {
      return {
        label: 'CRITICAL',
        text: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/40',
        badge: 'bg-red-600 text-white font-extrabold',
        bar: 'bg-red-500',
        glow: 'shadow-red-500/30'
      };
    }
    if (s >= 60) {
      return {
        label: 'DROWSY',
        text: 'text-orange-400',
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/40',
        badge: 'bg-orange-500 text-white font-extrabold',
        bar: 'bg-orange-500',
        glow: 'shadow-orange-500/30'
      };
    }
    if (s >= 30) {
      return {
        label: 'WARNING',
        text: 'text-amber-400',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/40',
        badge: 'bg-amber-500 text-slate-950 font-black',
        bar: 'bg-amber-400',
        glow: 'shadow-amber-500/30'
      };
    }
    return {
      label: 'SAFE',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500 text-slate-950 font-black',
      bar: 'bg-emerald-400',
      glow: 'shadow-emerald-500/20'
    };
  };

  // Stop animation loop cleanly
  const stopAnimationLoop = () => {
    isLoopingRef.current = false;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  // Start single animation loop cleanly
  const startAnimationLoop = () => {
    stopAnimationLoop();
    isLoopingRef.current = true;
    frameCountRef.current = 0;
    wasFaceDetectedRef.current = null;
    videoReadyLoggedRef.current = false;
    animFrameIdRef.current = requestAnimationFrame(predictWebcam);
  };

  // Initialize MediaPipe FaceLandmarker asynchronously on mount
  useEffect(() => {
    let isMounted = true;

    const initFaceLandmarker = async () => {
      setModelStatus('LOADING');
      setInitErrorMsg('');
      const wasmUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
      const modelUrl = '/models/face_landmarker.task';

      console.log(`[MediaPipe Diagnostic 1/4] Loading WASM fileset from: ${wasmUrl}`);
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(wasmUrl);
        console.log('[MediaPipe Diagnostic 2/4] FilesetResolver loaded successfully.');

        let landmarker;
        try {
          console.log(`[MediaPipe Diagnostic 3/4] Creating FaceLandmarker (CPU Delegate, model=${modelUrl})...`);
          landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: modelUrl,
              delegate: 'CPU'
            },
            outputFaceBlendshapes: false,
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.3,
            minFacePresenceConfidence: 0.3,
            minTrackingConfidence: 0.3
          });
          console.log('[MediaPipe Diagnostic 4/4] FaceLandmarker created successfully (CPU WASM Delegate v1.0.1).');
        } catch (cpuErr) {
          console.warn('[MediaPipe Diagnostic Warning] CPU delegate failed, attempting GPU delegate fallback:', cpuErr);
          landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: modelUrl,
              delegate: 'GPU'
            },
            outputFaceBlendshapes: false,
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.3,
            minFacePresenceConfidence: 0.3,
            minTrackingConfidence: 0.3
          });
          console.log('[MediaPipe Diagnostic 4/4] FaceLandmarker created successfully (GPU Delegate).');
        }

        if (isMounted) {
          faceLandmarkerRef.current = landmarker;
          setModelStatus('READY');
          console.log('[MediaPipe Diagnostic COMPLETE] FaceLandmarker is initialized and READY for VIDEO frames.');
        }

        // Initialize MediaPipe ObjectDetector for Mobile Phone Detection
        try {
          console.log('[MediaPipe Diagnostic] Initializing ObjectDetector (/models/efficientdet_lite0.tflite)...');
          const objDetector = await ObjectDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: '/models/efficientdet_lite0.tflite',
              delegate: 'CPU'
            },
            scoreThreshold: 0.35,
            runningMode: 'VIDEO'
          });
          if (isMounted) {
            objectDetectorRef.current = objDetector;
            console.log('[MediaPipe Diagnostic] ObjectDetector initialized and READY for object tracking.');
          }
        } catch (objErr) {
          console.warn('[MediaPipe Diagnostic Notice] ObjectDetector initialization skipped/fallback:', objErr?.message || String(objErr));
        }

      } catch (err) {
        console.error('[MediaPipe Diagnostic FATAL ERROR] Failed to initialize FaceLandmarker:', err);
        if (isMounted) {
          setInitErrorMsg(err?.message || String(err));
          setModelStatus('ERROR');
        }
      }
    };

    initFaceLandmarker();

    return () => {
      isMounted = false;
      stopAnimationLoop();
      closedStartTimeRef.current = null;
      lastFrameTimestampRef.current = null;
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) { }
        audioCtxRef.current = null;
      }
      if (faceLandmarkerRef.current) {
        try {
          faceLandmarkerRef.current.close();
        } catch (e) {
          console.error('[MediaPipe Debug Error] Error closing FaceLandmarker:', e);
        }
        faceLandmarkerRef.current = null;
      }
      if (objectDetectorRef.current) {
        try {
          objectDetectorRef.current.close();
        } catch (e) {
          console.error('[MediaPipe Debug Error] Error closing ObjectDetector:', e);
        }
        objectDetectorRef.current = null;
      }
    };
  }, []);

  // Stop camera tracks and animation cleanly
  const stopCameraTracks = () => {
    stopAnimationLoop();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) { }
      audioCtxRef.current = null;
    }

    setStreamInfo(null);
    setDetectionStatus('NO_FACE');
    setEyeState('OPEN');
    setEarData({ leftEar: '0.00', rightEar: '0.00', avgEar: '0.00' });
    setClosureDuration(0);
    setDrowsinessScore(0);
    setDebugInfo({ faceCount: 0, hasLandmarks: false, leftEar: '0.00', rightEar: '0.00', avgEar: '0.00', timestamp: 0 });
    closedStartTimeRef.current = null;
    lastFrameTimestampRef.current = null;
    lastLandmarkTimestampRef.current = -1;
    setIsPhoneDetected(false);
    lastPhoneAlertRef.current = { isSent: false, lastSentTimestamp: 0 };
    lastAlertStateRef.current = { isProlonged: false, isHighRisk: false, isCriticalSent: false };
    earHistoryRef.current = [];
  };

  // Helper to draw eye contour polylines & landmark points
  const drawEyeContour = (ctx, landmarks, indices, canvasWidth, canvasHeight, color, label) => {
    if (!indices || indices.length === 0) return false;

    ctx.beginPath();
    let minX = canvasWidth, minY = canvasHeight, maxX = 0, maxY = 0;
    let validCount = 0;

    indices.forEach((idx, i) => {
      const pt = landmarks[idx];
      if (!pt) return;
      validCount++;

      const px = pt.x * canvasWidth;
      const py = pt.y * canvasHeight;

      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });

    if (validCount < 6) return false;

    ctx.closePath();

    // Fill translucent glow
    ctx.fillStyle = color === '#EF4444' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.25)';
    ctx.fill();

    // Contour stroke
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw landmark node dots
    ctx.fillStyle = color === '#EF4444' ? '#FCA5A5' : '#38BDF8';
    indices.forEach((idx) => {
      const pt = landmarks[idx];
      if (pt) {
        ctx.beginPath();
        ctx.arc(pt.x * canvasWidth, pt.y * canvasHeight, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Small dashed bounding box around eye region
    const padding = 6;
    const boxX = Math.max(0, minX - padding);
    const boxY = Math.max(0, minY - padding);
    const boxW = (maxX - minX) + (padding * 2);
    const boxH = (maxY - minY) + (padding * 2);

    ctx.strokeStyle = color === '#EF4444' ? 'rgba(248, 113, 113, 0.7)' : 'rgba(34, 211, 238, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);

    // Label tag above eye box
    ctx.fillStyle = color === '#EF4444' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(6, 182, 212, 0.9)';
    ctx.fillRect(boxX, Math.max(0, boxY - 15), Math.max(48, label.length * 6.5), 15);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(label, boxX + 4, Math.max(11, boxY - 3));

    return true;
  };

  // Real-time face & eye landmark detection loop
  const predictWebcam = () => {
    if (!isLoopingRef.current) return;

    const video = videoRef.current;
    const landmarker = faceLandmarkerRef.current;
    const canvas = canvasRef.current;

    if (
      video &&
      landmarker &&
      video.readyState >= 2 &&
      !video.paused &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      if (!videoReadyLoggedRef.current) {
        console.log(`[MediaPipe Debug] Video stream READY: ${video.videoWidth}x${video.videoHeight}`);
        videoReadyLoggedRef.current = true;
      }

      const nowMs = performance.now();
      const dt = lastFrameTimestampRef.current ? Math.max(0.001, (nowMs - lastFrameTimestampRef.current) / 1000) : 0.033;
      lastFrameTimestampRef.current = nowMs;

      // Guarantee strictly monotonically increasing timestamp for MediaPipe detectForVideo
      let frameTimestamp = Math.round(nowMs);
      if (frameTimestamp <= lastLandmarkTimestampRef.current) {
        frameTimestamp = lastLandmarkTimestampRef.current + 1;
      }
      lastLandmarkTimestampRef.current = frameTimestamp;

      try {
        if (frameCountRef.current % 30 === 0) {
          console.log('[MediaPipe Runtime Debug] Pre-detection video state:', {
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            paused: video.paused,
            currentTime: video.currentTime,
            timestamp: frameTimestamp
          });
        }

        // Parallel Mobile Phone Detection using MediaPipe ObjectDetector
        if (objectDetectorRef.current && video && canvas) {
          try {
            const objectResults = objectDetectorRef.current.detectForVideo(video, frameTimestamp);
            if (objectResults && objectResults.detections && objectResults.detections.length > 0) {
              let phoneDetectedThisFrame = false;
              let highestPhoneScore = 0;

              objectResults.detections.forEach((detection) => {
                const categories = detection.categories || [];
                const phoneCat = categories.find((c) => {
                  const name = (c.categoryName || '').toLowerCase();
                  return (name === 'cell phone' || name === 'phone' || name === 'mobile phone' || name === 'remote') && c.score >= 0.35;
                });

                if (phoneCat) {
                  phoneDetectedThisFrame = true;
                  if (phoneCat.score > highestPhoneScore) {
                    highestPhoneScore = phoneCat.score;
                  }

                  const bbox = detection.boundingBox;
                  if (bbox) {
                    const ctx = canvas.getContext('2d');
                    const px = bbox.originX;
                    const py = bbox.originY;
                    const pw = bbox.width;
                    const ph = bbox.height;

                    // Amber bounding box for detected mobile phone
                    ctx.strokeStyle = '#F59E0B';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#F59E0B';
                    ctx.shadowBlur = 10;
                    ctx.strokeRect(px, py, pw, ph);
                    ctx.shadowBlur = 0;

                    // Label Tag
                    ctx.fillStyle = '#F59E0B';
                    ctx.fillRect(px, Math.max(0, py - 20), 160, 20);
                    ctx.fillStyle = '#020617';
                    ctx.font = 'bold 11px monospace';
                    ctx.fillText(`MOBILE PHONE ${(phoneCat.score * 100).toFixed(0)}%`, px + 6, Math.max(14, py - 6));
                  }
                }
              });

              if (phoneDetectedThisFrame) {
                setIsPhoneDetected(true);
                const now = Date.now();
                if (!lastPhoneAlertRef.current.isSent && (now - lastPhoneAlertRef.current.lastSentTimestamp > 20000)) {
                  lastPhoneAlertRef.current.isSent = true;
                  lastPhoneAlertRef.current.lastSentTimestamp = now;
                  sendManagerPhoneAlert(highestPhoneScore);
                }
              } else {
                setIsPhoneDetected(false);
                if (Date.now() - lastPhoneAlertRef.current.lastSentTimestamp > 5000) {
                  lastPhoneAlertRef.current.isSent = false;
                }
              }
            } else {
              setIsPhoneDetected(false);
            }
          } catch (objDetectErr) {
            // Fail silently to keep animation loop active
          }
        }

        const results = landmarker.detectForVideo(video, frameTimestamp);
        frameCountRef.current++;

        const faceLandmarks = results?.faceLandmarks;
        const faceCount = faceLandmarks ? faceLandmarks.length : 0;
        const hasLandmarks = faceCount > 0;

        if (frameCountRef.current % 30 === 0 || wasFaceDetectedRef.current !== hasLandmarks) {
          console.log(`[MediaPipe Runtime Debug Frame #${frameCountRef.current}] detectForVideo returned ${faceCount} face(s), hasLandmarks=${hasLandmarks ? 'YES' : 'NO'}`);
          if (faceCount === 0) {
            console.warn(`[MediaPipe Runtime Debug] faceLandmarks.length is 0 on frame #${frameCountRef.current}`);
          }
        }
        wasFaceDetectedRef.current = hasLandmarks;

        const displayWidth = video.videoWidth || 1280;
        const displayHeight = video.videoHeight || 720;

        if (canvas) {
          const ctx = canvas.getContext('2d');

          if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const faceLandmarks = results?.faceLandmarks;
          const faceCount = faceLandmarks ? faceLandmarks.length : 0;
          const hasLandmarks = faceCount > 0;

          if (hasLandmarks) {
            const landmarks = faceLandmarks[0];

            // 1. Calculate Face Bounding Box directly from landmarks
            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            landmarks.forEach((pt) => {
              if (pt.x < minX) minX = pt.x;
              if (pt.x > maxX) maxX = pt.x;
              if (pt.y < minY) minY = pt.y;
              if (pt.y > maxY) maxY = pt.y;
            });

            const padding = 0.03;
            minX = Math.max(0, minX - padding);
            minY = Math.max(0, minY - padding);
            maxX = Math.min(1, maxX + padding);
            maxY = Math.min(1, maxY + padding);

            const x = minX * canvas.width;
            const y = minY * canvas.height;
            const w = (maxX - minX) * canvas.width;
            const h = (maxY - minY) * canvas.height;

            // Draw cyan bounding box directly from actual MediaPipe face landmarks
            ctx.strokeStyle = '#06B6D4';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#06B6D4';
            ctx.shadowBlur = 10;
            ctx.strokeRect(x, y, w, h);
            ctx.shadowBlur = 0;

            // Corner HUD accents
            const cLen = Math.min(w, h) * 0.18;
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(x, y + cLen); ctx.lineTo(x, y); ctx.lineTo(x + cLen, y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w - cLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cLen); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x, y + h - cLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cLen, y + h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w - cLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cLen); ctx.stroke();

            // Driver Face Label
            const badgeY = Math.max(20, y - 6);
            ctx.fillStyle = '#06B6D4';
            ctx.fillRect(x, badgeY - 18, 120, 20);
            ctx.fillStyle = '#020617';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('DRIVER DETECTED', x + 6, badgeY - 4);

            // 2. Calculate EAR for Left and Right Eyes with physical pixel dimensions
            const lEar = calculateEAR(landmarks, 33, 160, 158, 133, 153, 144, displayWidth, displayHeight);
            const rEar = calculateEAR(landmarks, 362, 385, 387, 263, 373, 380, displayWidth, displayHeight);

            let rawAvgEar = 0;
            if (lEar > 0 && rEar > 0) {
              rawAvgEar = (lEar + rEar) / 2.0;
            } else if (lEar > 0) {
              rawAvgEar = lEar;
            } else if (rEar > 0) {
              rawAvgEar = rEar;
            }

            if (rawAvgEar > 0) {
              earHistoryRef.current.push(rawAvgEar);
              if (earHistoryRef.current.length > SMOOTHING_FRAME_WINDOW) {
                earHistoryRef.current.shift();
              }

              const smoothedEar = earHistoryRef.current.reduce((a, b) => a + b, 0) / earHistoryRef.current.length;
              const isClosed = smoothedEar < EAR_CLOSED_THRESHOLD;
              const currentEyeState = isClosed ? 'CLOSED' : 'OPEN';

              if (isClosed) {
                if (closedStartTimeRef.current === null) {
                  closedStartTimeRef.current = nowMs;
                }
                const elapsedSec = (nowMs - closedStartTimeRef.current) / 1000;
                setClosureDuration(elapsedSec);

                setSessionStats((prev) => ({
                  ...prev,
                  maxClosureDuration: Math.max(prev.maxClosureDuration, elapsedSec)
                }));

                if (elapsedSec >= prolongedThreshold) {
                  if (!lastAlertStateRef.current.isProlonged) {
                    lastAlertStateRef.current.isProlonged = true;
                    setSessionStats((prev) => ({ ...prev, prolongedCount: prev.prolongedCount + 1 }));
                    playWarningBeep(880, 'square', 300);
                  }
                }

                const targetScore = Math.min(100, Math.round((elapsedSec / prolongedThreshold) * 50));
                setDrowsinessScore((prev) => {
                  const newScore = Math.min(100, Math.max(prev, targetScore));
                  if (newScore >= 60 && !lastAlertStateRef.current.isHighRisk) {
                    lastAlertStateRef.current.isHighRisk = true;
                    setSessionStats((p) => ({ ...p, highRiskCount: p.highRiskCount + 1 }));
                    playWarningBeep(1046, 'sawtooth', 400);
                  }
                  // Dispatch critical alert to manager backend once per critical event
                  if ((newScore >= 80 || elapsedSec >= 2.5) && !lastAlertStateRef.current.isCriticalSent) {
                    lastAlertStateRef.current.isCriticalSent = true;
                    sendManagerCriticalAlert(newScore, elapsedSec);
                  }
                  return newScore;
                });
              } else {
                closedStartTimeRef.current = null;
                setClosureDuration(0);
                lastAlertStateRef.current.isProlonged = false;
                lastAlertStateRef.current.isCriticalSent = false;

                setDrowsinessScore((prev) => {
                  const next = Math.max(0, Math.round((prev - 40 * dt) * 10) / 10);
                  if (next < 50) {
                    lastAlertStateRef.current.isHighRisk = false;
                  }
                  return next;
                });
              }

              setEarData({
                leftEar: lEar.toFixed(2),
                rightEar: rEar.toFixed(2),
                avgEar: smoothedEar.toFixed(2)
              });
              setEyeState(currentEyeState);
              setDetectionStatus('EYES_DETECTED');

              const contourColor = isClosed ? '#EF4444' : '#00F0FF';
              const lLabel = `L: ${lEar.toFixed(2)}`;
              const rLabel = `R: ${rEar.toFixed(2)}`;

              drawEyeContour(ctx, landmarks, LEFT_EYE_INDICES, canvas.width, canvas.height, contourColor, lLabel);
              drawEyeContour(ctx, landmarks, RIGHT_EYE_INDICES, canvas.width, canvas.height, contourColor, rLabel);

              setDebugInfo({
                faceCount: faceCount,
                hasLandmarks: true,
                leftEar: lEar.toFixed(2),
                rightEar: rEar.toFixed(2),
                avgEar: smoothedEar.toFixed(2),
                timestamp: frameTimestamp
              });

              if (frameCountRef.current % 30 === 0 || wasFaceDetectedRef.current !== true) {
                console.log(`[MediaPipe Debug Frame #${frameCountRef.current}] Faces: ${faceCount}, Landmarks: YES, L_EAR: ${lEar.toFixed(2)}, R_EAR: ${rEar.toFixed(2)}, AVG_EAR: ${smoothedEar.toFixed(2)}`);
              }
              wasFaceDetectedRef.current = true;

            } else {
              setDetectionStatus('FACE_NO_EYES');
              earHistoryRef.current = [];
              closedStartTimeRef.current = null;
              setClosureDuration(0);
              lastAlertStateRef.current.isProlonged = false;
              lastAlertStateRef.current.isCriticalSent = false;
              setDrowsinessScore((prev) => {
                const next = Math.max(0, Math.round((prev - 40 * dt) * 10) / 10);
                if (next < 50) lastAlertStateRef.current.isHighRisk = false;
                return next;
              });
              setDebugInfo({
                faceCount: faceCount,
                hasLandmarks: true,
                leftEar: '0.00',
                rightEar: '0.00',
                avgEar: '0.00',
                timestamp: frameTimestamp
              });

              if (frameCountRef.current % 30 === 0 || wasFaceDetectedRef.current !== 'NO_EYES') {
                console.log(`[MediaPipe Debug Frame #${frameCountRef.current}] Faces: ${faceCount}, Landmarks: YES (EAR=0), L_EAR: 0.00, R_EAR: 0.00, AVG_EAR: 0.00`);
              }
              wasFaceDetectedRef.current = 'NO_EYES';
            }

          } else {
            // NO FACE DETECTED
            setDetectionStatus('NO_FACE');
            earHistoryRef.current = [];
            closedStartTimeRef.current = null;
            setClosureDuration(0);
            lastAlertStateRef.current.isProlonged = false;
            lastAlertStateRef.current.isCriticalSent = false;
            setDrowsinessScore((prev) => {
              const next = Math.max(0, Math.round((prev - 40 * dt) * 10) / 10);
              if (next < 50) lastAlertStateRef.current.isHighRisk = false;
              return next;
            });
            setDebugInfo({
              faceCount: 0,
              hasLandmarks: false,
              leftEar: '0.00',
              rightEar: '0.00',
              avgEar: '0.00',
              timestamp: frameTimestamp
            });

            if (frameCountRef.current % 30 === 0 || wasFaceDetectedRef.current !== false) {
              console.log(`[MediaPipe Debug Frame #${frameCountRef.current}] Faces: 0, Landmarks: NO, L_EAR: 0.00, R_EAR: 0.00, AVG_EAR: 0.00`);
            }
            wasFaceDetectedRef.current = false;
          }
        }
      } catch (err) {
        console.error('[MediaPipe Debug Error] detectForVideo failed:', err);
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setDebugInfo({
          faceCount: 0,
          hasLandmarks: false,
          leftEar: '0.00',
          rightEar: '0.00',
          avgEar: '0.00',
          timestamp: frameTimestamp
        });
      }
    }

    if (isLoopingRef.current) {
      animFrameIdRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  // Start Camera handler using navigator.mediaDevices.getUserMedia()
  const startCamera = async () => {
    setCameraState('REQUESTING');
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        const handleVideoPlay = () => {
          video.play().then(() => {
            setCameraState('ACTIVE');
            startAnimationLoop();
          }).catch((err) => {
            console.warn('[MediaPipe Debug Warning] Video playback notice:', err);
            setCameraState('ACTIVE');
            startAnimationLoop();
          });
        };

        if (video.readyState >= 1) {
          handleVideoPlay();
        } else {
          video.onloadedmetadata = handleVideoPlay;
        }
      }

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack ? videoTrack.getSettings() : {};

      setStreamInfo({
        label: videoTrack?.label || 'Laptop Integrated Webcam',
        width: settings.width || 1280,
        height: settings.height || 720
      });

    } catch (err) {
      console.error('Webcam access error:', err);
      stopCameraTracks();

      let msg = 'Camera access was denied or is unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Webcam permission was denied. Please allow camera access in your browser settings and click Try Again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No physical webcam device was detected on this computer.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Webcam is currently in use by another application. Please close other camera apps and try again.';
      } else if (err.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
      setCameraState('ERROR');
    }
  };

  // Stop Camera handler
  const handleStopCamera = () => {
    stopCameraTracks();
    setCameraState('OFF');
  };

  const statusInfo = getDrowsinessStatus(drowsinessScore);

  return (
    <div className="bg-busSurface border border-busBorder rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col h-full relative overflow-hidden">

      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-cyan-400 text-2xl">videocam</span>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide">Vigi360 Bus Camera</h3>
            <p className="text-xs text-slate-400">Live Driver Eye Open / Closed & Drowsiness Detection Feed</p>
          </div>
          <span className="bg-slate-800 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 font-semibold ml-2">
            LAPTOP WEBCAM
          </span>
        </div>

        {/* Live Feed Status & Detection Pills */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Eye Open/Closed & Drowsiness Status Pills */}
          {cameraState === 'ACTIVE' && (
            <div className="flex flex-wrap items-center gap-2">

              {/* Driver Face Detection Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all ${detectionStatus === 'EYES_DETECTED'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                  : detectionStatus === 'FACE_NO_EYES'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${detectionStatus === 'EYES_DETECTED'
                    ? 'bg-cyan-400 animate-pulse'
                    : detectionStatus === 'FACE_NO_EYES'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}></span>
                <span>
                  {detectionStatus === 'EYES_DETECTED'
                    ? 'DRIVER DETECTED'
                    : detectionStatus === 'FACE_NO_EYES'
                      ? 'Driver Face Obscured'
                      : 'NO FACE DETECTED'}
                </span>
              </div>

              {/* Mobile Phone Detection Badge */}
              {isPhoneDetected && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold animate-pulse shadow-lg shadow-amber-500/20">
                  <span className="material-symbols-outlined text-sm text-amber-400">smartphone</span>
                  <span>PHONE DETECTED</span>
                </div>
              )}

              {/* Phase 6: Drowsiness Score & Status Pill */}
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all shadow-lg ${statusInfo.bg} ${statusInfo.border} ${statusInfo.glow}`}>
                <span className="text-slate-400">DROWSINESS SCORE:</span>
                <strong className={`text-sm font-black ${statusInfo.text}`}>{Math.round(drowsinessScore)}</strong>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider ${statusInfo.badge}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Phase 7: Audio Mute / Unmute Toggle Button */}
              <button
                onClick={() => setAudioMuted(!audioMuted)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${audioMuted
                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                  }`}
                title={audioMuted ? 'Unmute Audio Warning Beeps' : 'Mute Audio Warning Beeps'}
              >
                <span className="material-symbols-outlined text-base">
                  {audioMuted ? 'volume_off' : 'volume_up'}
                </span>
                <span className="hidden sm:inline">{audioMuted ? 'MUTED' : 'AUDIO ON'}</span>
              </button>

              {/* Eye Open/Closed & EAR Readouts */}
              {detectionStatus === 'EYES_DETECTED' && (
                <>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs font-extrabold tracking-wide transition-all ${eyeState === 'OPEN'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                      : 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/20'
                    }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${eyeState === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-ping'}`}></span>
                    <span>{eyeState === 'OPEN' ? 'EYES OPEN' : 'EYES CLOSED'}</span>
                  </div>

                  {/* Real Continuous Closure Duration Pill */}
                  {eyeState === 'CLOSED' && (
                    <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/40 font-mono text-xs font-bold shadow-lg">
                      <span className="material-symbols-outlined text-sm animate-spin">timer</span>
                      <span>Closed for: <strong className="text-white text-xs">{closureDuration.toFixed(2)} s</strong></span>
                    </div>
                  )}

                  {/* PROLONGED CLOSURE Header Indicator */}
                  {eyeState === 'CLOSED' && closureDuration >= prolongedThreshold && (
                    <div className="flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-xl border border-red-400 font-mono text-xs font-extrabold shadow-lg shadow-red-600/50 animate-bounce">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>PROLONGED CLOSURE</span>
                    </div>
                  )}

                  {/* EAR Measurements Pill */}
                  <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/80 font-mono text-[11px]">
                    <span>L: <strong className="text-cyan-400">{earData.leftEar}</strong></span>
                    <span className="text-slate-600">|</span>
                    <span>R: <strong className="text-cyan-400">{earData.rightEar}</strong></span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">AVG: <strong className="text-white">{earData.avgEar}</strong></span>
                  </div>
                </>
              )}

            </div>
          )}

          {/* Camera Access Status Pill */}
          <div className="flex items-center gap-2 bg-busDark px-3 py-1.5 rounded-xl border border-busBorder">
            <span
              className={`w-2.5 h-2.5 rounded-full ${cameraState === 'ACTIVE'
                  ? 'bg-emerald-400 animate-pulse'
                  : cameraState === 'REQUESTING'
                    ? 'bg-amber-400 animate-ping'
                    : cameraState === 'ERROR'
                      ? 'bg-red-500'
                      : 'bg-slate-500'
                }`}
            ></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              {cameraState === 'ACTIVE' && <span className="text-emerald-400">Camera Active</span>}
              {cameraState === 'REQUESTING' && <span className="text-amber-400">Requesting Access...</span>}
              {cameraState === 'ERROR' && <span className="text-red-400">Permission Denied</span>}
              {cameraState === 'OFF' && <span className="text-slate-400">Camera Inactive</span>}
            </span>
          </div>

        </div>
      </div>

      {/* Large Webcam Viewport Container */}
      <div className="relative flex-1 min-h-[460px] bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden group shadow-inner">

        {/* Subtle Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-20 pointer-events-none z-10"></div>

        {/* Framing Guides */}
        <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none z-10"></div>
        <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none z-10"></div>
        <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-cyan-500/50 pointer-events-none z-10"></div>
        <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-cyan-500/50 pointer-events-none z-10"></div>

        {/* Live HTML Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${cameraState === 'ACTIVE' ? 'opacity-100' : 'opacity-0 absolute'
            }`}
        />

        {/* Canvas Overlay for Face & Eye Landmarks */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-15 ${cameraState === 'ACTIVE' ? 'block' : 'hidden'
            }`}
        />

        {/* MediaPipe DEBUG HUD Overlay (Top-Left) */}
        {cameraState === 'ACTIVE' && (
          <div className="absolute top-4 left-4 z-30 pointer-events-none bg-slate-950/90 border border-cyan-500/50 px-3.5 py-2.5 rounded-xl font-mono text-[11px] text-cyan-400 flex flex-col gap-1 shadow-2xl backdrop-blur-md max-w-xs">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
              <span>MEDIAPIPE DEBUG HUD</span>
              <span className={`w-2 h-2 rounded-full ${modelStatus === 'READY' ? 'bg-emerald-400 animate-pulse' : modelStatus === 'LOADING' ? 'bg-amber-400 animate-ping' : 'bg-red-500'
                }`}></span>
            </div>
            {modelStatus === 'LOADING' && (
              <div className="text-amber-400 font-bold py-1 animate-pulse">
                [MODEL: INITIALIZING WASM & TASK...]
              </div>
            )}
            {modelStatus === 'ERROR' && (
              <div className="text-red-400 font-bold py-1 text-[10px] break-words">
                [MODEL ERROR]: {initErrorMsg || 'Failed to initialize FaceLandmarker'}
              </div>
            )}
            {modelStatus === 'READY' && (
              <>
                <div>Faces: <strong className={debugInfo.faceCount > 0 ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>{debugInfo.faceCount}</strong></div>
                <div>Landmarks: <strong className={debugInfo.hasLandmarks ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>{debugInfo.hasLandmarks ? 'YES' : 'NO'}</strong></div>
                <div>L EAR: <strong className="text-white">{debugInfo.leftEar}</strong> | R EAR: <strong className="text-white">{debugInfo.rightEar}</strong></div>
                <div>AVG EAR: <strong className="text-cyan-300 font-bold">{debugInfo.avgEar}</strong></div>
                <div className="text-[10px] text-slate-500">TS: <span className="text-slate-400">{debugInfo.timestamp}</span></div>
              </>
            )}
          </div>
        )}

        {/* Phase 7: Visual Hazard Alert Overlay Banner */}
        {cameraState === 'ACTIVE' && (drowsinessScore >= 60 || (eyeState === 'CLOSED' && closureDuration >= prolongedThreshold)) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-25 pointer-events-none">
            <div className={`px-6 py-2.5 rounded-2xl border-2 font-mono font-black text-sm tracking-wider uppercase flex items-center gap-3 shadow-2xl backdrop-blur-md animate-bounce ${drowsinessScore >= 80 || closureDuration >= prolongedThreshold
                ? 'bg-red-950/95 border-red-500 text-red-200 shadow-red-600/50'
                : 'bg-orange-950/95 border-orange-500 text-orange-200 shadow-orange-600/50'
              }`}>
              <span className="material-symbols-outlined text-xl animate-spin">warning</span>
              <span>
                {drowsinessScore >= 80 || closureDuration >= prolongedThreshold
                  ? '🚨 CRITICAL SAFETY ALERT'
                  : '⚠️ HIGH DROWSINESS DETECTED'}
              </span>
            </div>
          </div>
        )}

        {/* Overlay 1: Camera Inactive State & Start Camera Button */}
        {cameraState === 'OFF' && (
          <div className="z-20 text-center p-8 max-w-md flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-5 shadow-2xl">
              <span className="material-symbols-outlined text-4xl">videocam_off</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Camera Inactive</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Click <span className="text-cyan-400 font-semibold">Start Camera</span> to connect your laptop's webcam and start real-time driver eye open/closed & local drowsiness detection.
            </p>
            <button
              onClick={startCamera}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-3 cursor-pointer hover:scale-105"
            >
              <span className="material-symbols-outlined text-xl">videocam</span>
              <span>Start Camera</span>
            </button>
          </div>
        )}

        {/* Overlay 2: Requesting Camera Access State */}
        {cameraState === 'REQUESTING' && (
          <div className="z-20 text-center p-8 max-w-md flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 animate-pulse">
              <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
            </div>
            <h4 className="text-lg font-bold text-cyan-400 mb-2">Requesting Camera Access...</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/40">
              Please click <strong className="text-white font-bold">"Allow"</strong> when prompted by your browser to grant webcam permission.
            </p>
          </div>
        )}

        {/* Overlay 3: Camera Permission Denied / Error State & Try Again Button */}
        {cameraState === 'ERROR' && (
          <div className="z-20 text-center p-8 max-w-md flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow-2xl">
              <span className="material-symbols-outlined text-4xl">no_photography</span>
            </div>
            <h4 className="text-lg font-bold text-red-400 mb-2">Camera Access Denied</h4>
            <p className="text-xs text-slate-200 mb-6 leading-relaxed bg-red-950/50 p-4 rounded-xl border border-red-900/60 shadow-lg">
              {errorMessage}
            </p>
            <button
              onClick={startCamera}
              className="px-8 py-3.5 bg-red-500 hover:bg-red-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-red-500/25 transition-all flex items-center gap-3 cursor-pointer hover:scale-105"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Live Controls & Real-Time Viewport HUD Overlays */}
        {cameraState === 'ACTIVE' && (
          <>
            {/* Top Right Drowsiness Score & Continuous Duration Overlay Panel */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2.5 pointer-events-none">

              {/* Phase 6 Drowsiness Score HUD Panel */}
              <div className={`bg-slate-950/90 border backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl text-right font-mono min-w-[210px] transition-all ${statusInfo.border}`}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">DROWSINESS SCORE</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${statusInfo.badge}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-end gap-1 mb-1.5">
                  <span className={`text-2xl font-black ${statusInfo.text}`}>{Math.round(drowsinessScore)}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${statusInfo.bar}`}
                    style={{ width: `${Math.min(100, Math.max(0, drowsinessScore))}%` }}
                  ></div>
                </div>
              </div>

              {/* Eye Closure Duration (when eyes CLOSED) */}
              {eyeState === 'CLOSED' && detectionStatus === 'EYES_DETECTED' && (
                <div className="bg-slate-950/90 border border-red-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-2xl text-right font-mono">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">EYES CLOSED</div>
                  <div className="text-base font-extrabold text-red-400">
                    Closed for: <span className="text-white">{closureDuration.toFixed(2)} s</span>
                  </div>
                </div>
              )}

              {/* PROLONGED CLOSURE Warning Badge */}
              {eyeState === 'CLOSED' && closureDuration >= prolongedThreshold && detectionStatus === 'EYES_DETECTED' && (
                <div className="bg-red-950/90 border-2 border-red-500 text-white px-3.5 py-1.5 rounded-xl font-mono text-xs font-extrabold tracking-wider flex items-center gap-2 shadow-2xl animate-pulse">
                  <span className="material-symbols-outlined text-base text-red-400">warning</span>
                  <span className="text-red-300">PROLONGED CLOSURE</span>
                </div>
              )}
            </div>

            {/* Bottom Right Stop Camera Button */}
            <div className="absolute bottom-4 right-4 z-20">
              <button
                onClick={handleStopCamera}
                className="px-5 py-2.5 bg-red-500/90 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-red-900/50 transition-all flex items-center gap-2 backdrop-blur-md border border-red-400/40 cursor-pointer hover:scale-105"
              >
                <span className="material-symbols-outlined text-lg">videocam_off</span>
                <span>Stop Camera</span>
              </button>
            </div>
          </>
        )}

      </div>

      {/* Configurable Prolonged Closure Threshold Control Card */}
      <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-lg">timer</span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 tracking-wide">Prolonged Closure Threshold</h4>
            <p className="text-[11px] text-slate-400">Adjust continuous eye-closure trigger limit for score calculation</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.1"
            value={prolongedThreshold}
            onChange={(e) => setProlongedThreshold(parseFloat(e.target.value))}
            className="w-full sm:w-44 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs font-bold text-cyan-400 whitespace-nowrap min-w-[75px] text-center">
            {prolongedThreshold.toFixed(2)} s
          </div>
        </div>
      </div>

      {/* Phase 7: Active Session Event Summary Card */}
      <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-lg">assessment</span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 tracking-wide">Active Session Safety Summary</h4>
            <p className="text-[11px] text-slate-400">Real-time local event counters for current camera session</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">Prolonged Closures:</span>
            <strong className="text-amber-400 text-sm font-black">{sessionStats.prolongedCount}</strong>
          </div>

          <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">High-Risk Events:</span>
            <strong className="text-red-400 text-sm font-black">{sessionStats.highRiskCount}</strong>
          </div>

          <div className="bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">Peak Closure:</span>
            <strong className="text-cyan-400 text-sm font-black">{sessionStats.maxClosureDuration.toFixed(2)} s</strong>
          </div>

          <button
            onClick={handleResetStats}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
            title="Reset current session event counters"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset Stats</span>
          </button>
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-1 gap-1">
        <span>Hardware Target: Integrated Laptop Webcam</span>
        <span className="font-mono text-[11px] text-slate-500">
          Metric: EAR & Continuous Eye Closure | Safety Alerts & Active Session Counters
        </span>
      </div>

    </div>
  );
};
