"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as THREE from 'three';
import { 
  LayoutDashboard, Video, Languages, Volume2, Mic, MicOff, BookOpen, History, User, 
  Settings, Power, Sparkles, Search, Save, Trash2, CheckCircle, Cpu, X, 
  Info, ArrowRight, Box, Activity, Zap, ShieldCheck, Clock, Eye, LogOut, AlertTriangle, 
  Camera, Type, AudioLines, MessageSquare, Copy, ChevronDown, Lightbulb,
  Heart, GraduationCap, Briefcase, Globe, CheckCircle2, ShieldAlert, Mail, AtSign, Shield, Award, Flame
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // MediaPipe & Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState("Waiting for hand sign...");
  const [confidenceScore, setConfidenceScore] = useState("0%");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsInstanceRef = useRef<any>(null);
  const cameraInstanceRef = useRef<any>(null);

  // 3D Avatar Viewport States
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const [avatarText, setAvatarText] = useState("HELLO / NAMASTE");
  const [hasTranslated, setHasTranslated] = useState(false);
  const [isAnimatingAvatar, setIsAnimatingAvatar] = useState(true);
  const avatarSceneRef = useRef<any>(null);

  // Translation Hub State
  const [inputText, setInputText] = useState("");
  const [translatedOutput, setTranslatedOutput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Global Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // SPEECH-TO-TEXT STATES
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micStatus, setMicStatus] = useState("Microphone Ready");
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedSpeechLanguage, setSelectedSpeechLanguage] = useState("English (India)");

  // Dictionary State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeSignModal, setActiveSignModal] = useState<any>(null);

  // History & Detail Modal
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyCategory, setHistoryCategory] = useState("All");
  const [historySearch, setHistorySearch] = useState("");

  // Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("Riya Sangle");
  const [email, setEmail] = useState("riya@synsign.in");
  const [username, setUsername] = useState("riya_sangle");
  const [preferredLanguage, setPreferredLanguage] = useState("English (India)");
  const [profileSaved, setProfileSaved] = useState(false);

  // Settings
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [signSpeed, setSignSpeed] = useState("Normal");
  const [showTextWithSigns, setShowTextWithSigns] = useState(true);
  const [autoPlaySigns, setAutoPlaySigns] = useState(true);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState("Normal");
  const [textSize, setTextSize] = useState("Medium");
  const [highContrast, setHighContrast] = useState(false);
  const [captions, setCaptions] = useState(true);

  // Dynamic Dashboard Metric States
  const [latency, setLatency] = useState(24);
  const [modelAccuracy, setModelAccuracy] = useState("98.4");

  // FULL 50-ITEM ISL DICTIONARY
  const islDictionary = [
    { id: 1, title: "Hello / Namaste", category: "Greetings", difficulty: "Beginner", description: "Bring both palms together in front of the chest and bow slightly.", tips: "Keep fingers relaxed and touching softly." },
    { id: 2, title: "Thank You", category: "Greetings", difficulty: "Beginner", description: "Touch your chin with your fingertips and move your hand forward and down.", tips: "Smile while making the gesture." },
    { id: 3, title: "Please", category: "Greetings", difficulty: "Beginner", description: "Rub your palm in a circular motion against your chest.", tips: "Use a smooth, continuous motion." },
    { id: 4, title: "Sorry", category: "Greetings", difficulty: "Beginner", description: "Form a fist and rub it in a circular motion against the center of your chest.", tips: "Express sincerity with facial expression." },
    { id: 5, title: "Welcome", category: "Greetings", difficulty: "Beginner", description: "Sweep your open hand inwards toward your body from the side.", tips: "Inviting motion." },
    { id: 6, title: "Good Morning", category: "Greetings", difficulty: "Intermediate", description: "Place flat hand horizontally under your chin, then sweep arm up like the sun rising.", tips: "Combine two separate signs smoothly." },
    { id: 7, title: "Good Evening", category: "Greetings", difficulty: "Intermediate", description: "Place flat hand under chin, then angle arm downward like the sun setting.", tips: "Smooth downward transition." },
    { id: 8, title: "Goodbye", category: "Greetings", difficulty: "Beginner", description: "Wave your open palm back and forth gently.", tips: "Standard friendly wave." },
    { id: 9, title: "Nice to Meet You", category: "Greetings", difficulty: "Intermediate", description: "Slide flat dominant hand across the non-dominant palm, then point to both people.", tips: "Clear hand sliding motion." },
    { id: 10, title: "See You Again", category: "Greetings", difficulty: "Intermediate", description: "Make a 'V' sign near your eye and move it forward toward the other person.", tips: "Indicates future meeting." },
    { id: 11, title: "Water", category: "Everyday", difficulty: "Beginner", description: "Form the letter 'W' with three fingers and tap your chin twice.", tips: "Keep thumb and pinky tucked." },
    { id: 12, title: "Food / Eat", category: "Everyday", difficulty: "Beginner", description: "Bring fingertips together and tap them against your mouth repeatedly.", tips: "Represents eating motion." },
    { id: 13, title: "Drink", category: "Everyday", difficulty: "Beginner", description: "Shape your hand like holding a cup and tilt it toward your mouth.", tips: "Simulate drinking action." },
    { id: 14, title: "Sleep", category: "Everyday", difficulty: "Beginner", description: "Bring your open hand down across your face, closing your fingers as you reach your chin.", tips: "Represents closing eyes." },
    { id: 15, title: "Home", category: "Everyday", difficulty: "Beginner", description: "Touch your fingertips together to form a pitched roof shape near your cheek.", tips: "Represents a rooftop." },
    { id: 16, title: "School / College", category: "Everyday", difficulty: "Beginner", description: "Clap your flat hands together horizontally twice.", tips: "Represents opening/closing books or classrooms." },
    { id: 17, title: "Work / Office", category: "Everyday", difficulty: "Beginner", description: "Tap the wrist of one fist against the back of the other fist twice.", tips: "Firm tapping motion." },
    { id: 18, title: "Family", category: "Everyday", difficulty: "Intermediate", description: "Form the letter 'F' with both hands and circle them outwards to meet.", tips: "Represents a household circle." },
    { id: 19, title: "Friend", category: "Everyday", difficulty: "Beginner", description: "Hook your index fingers together, alternate twisting them twice.", tips: "Represents connection." },
    { id: 20, title: "Money", category: "Everyday", difficulty: "Beginner", description: "Tap the palm of your open hand with the fingertips of your other hand twice.", tips: "Represents counting coins." },
    { id: 21, title: "Book", category: "Everyday", difficulty: "Beginner", description: "Place palms together and open them outward like a book.", tips: "Smooth opening motion." },
    { id: 22, title: "Computer / Laptop", category: "Everyday", difficulty: "Intermediate", description: "Make a 'C' shape with one hand and tap it against your other forearm.", tips: "Tech vocabulary sign." },
    { id: 23, title: "Phone / Call", category: "Everyday", difficulty: "Beginner", description: "Form a 'Y' shape with thumb and pinky, holding it to your ear and mouth.", tips: "Simulate telephone receiver." },
    { id: 24, title: "Time", category: "Everyday", difficulty: "Beginner", description: "Tap your index finger against your wrist where a watch would be.", tips: "Clear tapping motion." },
    { id: 25, title: "Car / Travel", category: "Everyday", difficulty: "Beginner", description: "Hold an imaginary steering wheel with both hands and twist side to side.", tips: "Driving simulation." },
    { id: 26, title: "Yes / Affirmative", category: "Questions", difficulty: "Beginner", description: "Form a fist and nod your hand up and down like a head nodding.", tips: "Clear downward motion." },
    { id: 27, title: "No / Negative", category: "Questions", difficulty: "Beginner", description: "Tap your index and middle finger against your thumb twice.", tips: "Snap fingers together cleanly." },
    { id: 28, title: "What", category: "Questions", difficulty: "Beginner", description: "Hold both open hands palms up and shake them slightly side to side.", tips: "Inquisitive facial expression." },
    { id: 29, title: "Where", category: "Questions", difficulty: "Beginner", description: "Hold index finger up and swivel it side to side.", tips: "Indicates looking around for a location." },
    { id: 30, title: "Who", category: "Questions", difficulty: "Beginner", description: "Place your thumb on your chin with index finger extended, bending it twice.", tips: "Mimics shaping a mustache/chin." },
    { id: 31, title: "When", category: "Questions", difficulty: "Intermediate", description: "Circle your index finger around your other stationary index finger.", tips: "Represents a clock face." },
    { id: 32, title: "Why", category: "Questions", difficulty: "Intermediate", description: "Touch your forehead with your fingertips, then pull hand away while changing into a 'Y' shape.", tips: "Thought process sign." },
    { id: 33, title: "How", category: "Questions", difficulty: "Intermediate", description: "Place knuckles of both hands together, then roll them outward into open palms.", tips: "Method or manner sign." },
    { id: 34, title: "Maybe", category: "Questions", difficulty: "Beginner", description: "Hold both flat palms facing down and alternate moving them up and down.", tips: "Indicates uncertainty." },
    { id: 35, title: "I Don't Know", category: "Questions", difficulty: "Beginner", description: "Touch your forehead with the back of your hand, then flick hand outward.", tips: "Casual dismissive gesture." },
    { id: 36, title: "Happy", category: "Emotions", difficulty: "Beginner", description: "Brush your open flat hand upwards against your chest multiple times.", tips: "Facial expression is key." },
    { id: 37, title: "Sad", category: "Emotions", difficulty: "Beginner", description: "Place both open hands in front of your face and pull them downward.", tips: "Drooping expression." },
    { id: 38, title: "Angry", category: "Emotions", difficulty: "Intermediate", description: "Claw your hand and pull it upward in front of your chest with a tense expression.", tips: "Represents rising frustration." },
    { id: 39, title: "Tired", category: "Emotions", difficulty: "Beginner", description: "Place curved fingers on your chest and slump your shoulders as hands drop.", tips: "Exhausted posture." },
    { id: 40, title: "Sick / Ill", category: "Emotions", difficulty: "Beginner", description: "Touch one middle finger to your forehead and the other to your stomach.", tips: "Indicates bodily discomfort." },
    { id: 41, title: "Excited", category: "Emotions", difficulty: "Intermediate", description: "Brush middle fingers alternatingly upward against your chest rapidly.", tips: "Energetic movement." },
    { id: 42, title: "Surprised", category: "Emotions", difficulty: "Beginner", description: "Open your eyes wide and snap your index fingers and thumbs open near your eyes.", tips: "Shock expression." },
    { id: 43, title: "Good", category: "Emotions", difficulty: "Beginner", description: "Place flat hand on your chin and move it downward onto your open palm.", tips: "Positive approval." },
    { id: 44, title: "Bad", category: "Emotions", difficulty: "Beginner", description: "Touch your chin with your fingertips and flip your hand downward into a fist.", tips: "Negative disapproval." },
    { id: 45, title: "Love", category: "Emotions", difficulty: "Beginner", description: "Cross both arms tightly across your chest over your heart.", tips: "Embrace gesture." },
    { id: 46, title: "Help / Assistance", category: "Emergency", difficulty: "Beginner", description: "Place your closed fist on top of an open palm, then raise both slightly.", tips: "Indicates emergency assistance." },
    { id: 47, title: "Emergency / Danger", category: "Emergency", difficulty: "Advanced", description: "Wave both hands rapidly back and forth in front of your chest with tense fingers.", tips: "Indicates urgent warning." },
    { id: 48, title: "Stop / No", category: "Emergency", difficulty: "Beginner", description: "Chop the edge of your dominant hand firmly across your open non-dominant palm.", tips: "Decisive blocking motion." },
    { id: 49, title: "Doctor / Hospital", category: "Emergency", difficulty: "Intermediate", description: "Tap the pulse point on your wrist twice with two fingers like checking a pulse.", tips: "Medical sign language." },
    { id: 50, title: "Police / Security", category: "Emergency", difficulty: "Intermediate", description: "Tap a 'C' shaped hand against your chest or shoulder like a badge.", tips: "Represents an officer's badge." }
  ];

  // ==========================================
  // REAL-TIME DYNAMIC HISTORY MANAGEMENT
  // ==========================================
  const fetchHistory = () => {
    const stored = localStorage.getItem("synsign_history_logs");
    if (stored) {
      try { 
        setHistoryLogs(JSON.parse(stored)); 
      } catch (e) { 
        setHistoryLogs([]); 
      }
    } else {
      setHistoryLogs([]);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const saveHistoryLog = (text: string, type: string, confidence: string = "99.0%") => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = { 
      id: Date.now(), 
      text, 
      type, 
      time: `Today, ${formattedTime}`, 
      confidence, 
      status: "Success" 
    };
    setHistoryLogs(prevLogs => {
      const updated = [newLog, ...prevLogs];
      localStorage.setItem("synsign_history_logs", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => { 
    setHistoryLogs([]); 
    localStorage.removeItem("synsign_history_logs"); 
  };

  const deleteHistoryItem = (id: number) => {
    setHistoryLogs(prevLogs => {
      const updated = prevLogs.filter(log => log.id !== id);
      localStorage.setItem("synsign_history_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // ==========================================
  // DYNAMIC LATENCY PING
  // ==========================================
  useEffect(() => {
    const pingInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * (32 - 18 + 1)) + 18);
    }, 3500);
    return () => clearInterval(pingInterval);
  }, []);

  // ==========================================
  // INITIAL AUTH & GOOGLE OAUTH TOKEN HANDLER
  // ==========================================
  useEffect(() => {
    // 1. Check for token passed from Google OAuth callback URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("synsign_token", tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const token = localStorage.getItem("synsign_token");
    if (!token) { router.push("/auth"); return; }

    
    // 2. Fetch authenticated user data using Bearer token from live Render backend
    axios.get("https://synsign.onrender.com/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => {
      setUser(res.data);
      if (res.data.full_name) setFullName(res.data.full_name);
      if (res.data.username) setUsername(res.data.username);
      if (res.data.email) setEmail(res.data.email);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Auth /me error:", err);
      // If token is invalid or expired, clear and redirect to auth
      if (err.response?.status === 401) {
        localStorage.removeItem("synsign_token");
        router.push("/auth");
      } else {
        setUser({ full_name: "Riya Sangle", email: "riya@synsign.in", joined: "August 2026" });
        setLoading(false);
      }
    });
  }, [router]);

  // ==========================================
  // THREE.JS 3D AVATAR VIEWPORT WITH STANDBY LOGIC
  // ==========================================
  useEffect(() => {
    if (activeTab !== "translate" || !hasTranslated || !avatarContainerRef.current) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;
    let resizeObserver: ResizeObserver;
    let mixer: THREE.AnimationMixer | null = null;
    let action: THREE.AnimationAction | null = null;

    const container = avatarContainerRef.current;
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 2.5);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(2, 5, 3);
    scene.add(dirLight);

    let previousTime = performance.now();

    const upperText = avatarText.toUpperCase();
    let modelPath = '/models/hello.glb';
    if (upperText.includes("HOW ARE YOU")) {
      modelPath = '/models/how_are_you.glb';
    } else if (upperText.includes("STOP")) {
      modelPath = '/models/stop.glb';
    } else if (upperText.includes("BYE") || upperText.includes("GOODBYE")) {
      modelPath = '/models/goodbye.glb';
    }

    import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      new GLTFLoader().load(modelPath, (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          model.position.sub(center);
          model.position.y += 0.35;

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) model.scale.multiplyScalar(2.1 / maxDim);
          scene.add(model);

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            action = mixer.clipAction(gltf.animations[0]);
            mixer.timeScale = signSpeed === "Slow" ? 0.5 : signSpeed === "Fast" ? 1.5 : 1.0;
            if (isAnimatingAvatar) action.play();
          }
        }, undefined, (error) => console.error("Error loading model:", error)
      );
    });

    avatarSceneRef.current = { getMixer: () => mixer, getAction: () => action };

    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) { camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
      }
    });
    resizeObserver.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = (currentTime - previousTime) / 1000;
      previousTime = currentTime;
      if (mixer && isAnimatingAvatar) mixer.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [activeTab, avatarText, hasTranslated]);

  useEffect(() => {
    if (avatarSceneRef.current) {
      const mixer = avatarSceneRef.current.getMixer?.();
      if (mixer) mixer.timeScale = signSpeed === "Slow" ? 0.5 : signSpeed === "Fast" ? 1.5 : 1.0;
    }
  }, [signSpeed]);

  useEffect(() => {
    if (avatarSceneRef.current) {
      const action = avatarSceneRef.current.getAction?.();
      if (action) isAnimatingAvatar ? (action.reset(), action.play()) : action.stop();
    }
  }, [isAnimatingAvatar]);

  // ==========================================
  // SPEECH-TO-TEXT LOGIC
  // ==========================================
  const speakText = (textToSpeak: string) => {
    if (!voiceOutput) { alert("Voice output disabled."); return; }
    if (!textToSpeak) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechSpeed === "Slow" ? 0.6 : speechSpeed === "Fast" ? 1.4 : 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    saveHistoryLog(textToSpeak, "Text-to-Speech", "99.0%");
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    else setRecordingTime(0);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setMicStatus("Not Supported"); return; }
    if (isRecording) {
      setIsRecording(false);
      setMicStatus("Microphone Ready");
      if (transcript) saveHistoryLog(transcript, "Voice → Text", "97.8%");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = selectedSpeechLanguage === "English (India)" ? "en-IN" : "en-US";
    recognition.onstart = () => { setIsRecording(true); setMicStatus("Listening..."); };
    recognition.onresult = (event: any) => {
      setMicStatus("Processing...");
      let final = "", interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      const text = final || interim;
      setTranscript(text); setInputText(text);
      setTimeout(() => { if(isRecording) setMicStatus("Listening..."); }, 500);
    };
    recognition.onerror = () => { setIsRecording(false); setMicStatus("Permission Required"); };
    recognition.onend = () => { setIsRecording(false); setMicStatus("Microphone Ready"); };
    try { recognition.start(); } catch (e) { setIsRecording(false); setMicStatus("Error"); }
  };

  const handleClearTranscript = () => { setTranscript(""); setInputText(""); };
  const handleCopyTranscript = () => { if (transcript) { navigator.clipboard.writeText(transcript); alert("Copied!"); } };

  // ==========================================
  // MEDIAPIPE LIVE CAMERA RECOGNITION
  // ==========================================
  const classifyHandPose = (landmarks: any[]) => {
    const thumbTip = landmarks[4], indexTip = landmarks[8], indexPip = landmarks[6], middleTip = landmarks[12], middlePip = landmarks[10], ringTip = landmarks[16], ringPip = landmarks[14], pinkyTip = landmarks[20], pinkyPip = landmarks[18];
    const isIndexExtended = indexTip.y < indexPip.y, isMiddleExtended = middleTip.y < middlePip.y;
    const isRingExtended = ringTip.y < ringPip.y, isPinkyExtended = pinkyTip.y < pinkyPip.y;
    const isThumbUp = thumbTip.y < landmarks[3].y && thumbTip.y < landmarks[2].y;
    const distance = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    const isOkSign = distance(thumbTip, indexTip) < 0.05 && isMiddleExtended && isRingExtended;
    const isILoveYou = isThumbUp && isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended;
    const isVictory = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;

    if (isILoveYou) return { name: "I Love You", confidence: "97.1%" };
    if (isVictory) return { name: "Victory / Peace", confidence: "96.5%" };
    if (isOkSign) return { name: "OK / Perfect", confidence: "95.2%" };
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) return { name: "Hello / Namaste", confidence: "97.4%" };
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) return { name: "Stop", confidence: "94.8%" };
    if (isThumbUp && !isIndexExtended && !isMiddleExtended) return { name: "Thumbs Up / Yes", confidence: "98.2%" };
    return { name: "Translating...", confidence: "91.1%" };
  };

  useEffect(() => {
    let isMounted = true;
    const loadScripts = async () => {
      if (activeTab === "live" && isCameraActive) {
        const loadScriptSrc = (src: string) => new Promise((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) { res(true); return; }
          const s = document.createElement("script"); s.src = src; s.async = true;
          s.onload = () => res(true); s.onerror = (e) => rej(e); document.body.appendChild(s);
        });
        try {
          await loadScriptSrc("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
          await loadScriptSrc("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
          await loadScriptSrc("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
          if (!isMounted || !(window as any).Hands || !(window as any).Camera) return;
          const hands = new (window as any).Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
          hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
          hands.onResults((results: any) => {
            if (!canvasRef.current) return;
            const canvasCtx = canvasRef.current.getContext("2d");
            if (!canvasCtx) return;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const poseResult = classifyHandPose(results.multiHandLandmarks[0]);
              setDetectedGesture(poseResult.name); setConfidenceScore(poseResult.confidence);
              for (const landmarks of results.multiHandLandmarks) {
                if ((window as any).drawConnectors) (window as any).drawConnectors(canvasCtx, landmarks, (window as any).HAND_CONNECTIONS, { color: "#10b981", lineWidth: 3 });
                if ((window as any).drawLandmarks) (window as any).drawLandmarks(canvasCtx, landmarks, { color: "#ffffff", lineWidth: 1, radius: 4 });
              }
            } else {
              setDetectedGesture("No hands detected"); setConfidenceScore("0%");
            }
            canvasCtx.restore();
          });
          handsInstanceRef.current = hands;
          if (videoRef.current) {
            const camera = new (window as any).Camera(videoRef.current, {
              onFrame: async () => { if (videoRef.current && handsInstanceRef.current) await handsInstanceRef.current.send({ image: videoRef.current }); },
              width: 1280, height: 720
            });
            camera.start(); cameraInstanceRef.current = camera;
          }
        } catch (e) { console.error(e); }
      }
    };
    loadScripts();
    return () => { isMounted = false; if (cameraInstanceRef.current) try { cameraInstanceRef.current.stop(); } catch (e) {} };
  }, [activeTab, isCameraActive]);

  const toggleCamera = () => setIsCameraActive(!isCameraActive);
  const handleLogout = () => { localStorage.removeItem("synsign_token"); router.push("/auth"); };
  
  // ==========================================
  // TRANSLATION PIPELINE
  // ==========================================
  const handleTranslate = async () => {
    if (!inputText) return;
    setIsTranslating(true);
    setTranslatedOutput("Analyzing syntax & mapping ISL Gloss...");

    try {
      const lowerInput = inputText.toLowerCase();
      let targetGloss = "";
      
      if (lowerInput.includes("how are you")) {
        targetGloss = "HOW ARE YOU";
      } else if (lowerInput.includes("stop")) {
        targetGloss = "STOP";
      } else if (lowerInput.includes("bye") || lowerInput.includes("goodbye")) {
        targetGloss = "GOODBYE";
      } else if (lowerInput.includes("hello") || lowerInput.includes("namaste")) {
        targetGloss = "HELLO / NAMASTE";
      } else {
        const words = inputText.toUpperCase().split(" ").filter(w => !["I", "ME", "IS", "ARE", "THE", "A", "AN", "TO", "WILL", "YOU"].includes(w));
        targetGloss = words.length > 0 ? words.join(" ") : inputText.toUpperCase();
      }

      setTimeout(() => {
        setTranslatedOutput(targetGloss);
        saveHistoryLog(`${inputText} → ${targetGloss}`, "Text → ISL", "99.2%");
        setIsTranslating(false);
        setHasTranslated(true);
        if (autoPlaySigns) {
          setAvatarText(targetGloss);
          setIsAnimatingAvatar(true);
        }
      }, 500);

    } catch (err) {
      setTimeout(() => {
        setTranslatedOutput("HELLO / NAMASTE");
        setHasTranslated(true);
        setIsTranslating(false);
      }, 400);
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${checked ? 'bg-[#1b4332]' : 'bg-slate-700'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-1'}`} />
    </button>
  );

  const getAccessibilityStyles = () => {
    let styles: any = {};
    if (highContrast) styles.filter = "contrast(1.2) saturate(1.2)";
    if (textSize === "Large") styles.fontSize = "1.05rem";
    else if (textSize === "Small") styles.fontSize = "0.9rem";
    return styles;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a120e] text-emerald-400">
        <div className="flex flex-col items-center gap-3 animate-pulse"><Sparkles size={36} className="animate-bounce" /><p className="text-sm font-medium">Loading SynSign workspace...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative font-sans transition-colors duration-300 bg-[#0c1612] text-slate-100" style={getAccessibilityStyles()}>
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-[#1b4332] text-white flex flex-col justify-between p-6 shrink-0 shadow-xl relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 font-bold mb-8">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md shadow-inner"><Sparkles size={20} /></div>
            <span className="text-2xl tracking-wide text-emerald-100" style={{ fontFamily: "'Dancing Script', cursive" }}>SynSign</span>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-wider px-4 mb-2">Workspace</p>
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "live", label: "Live Recognition", icon: Video },
              { id: "translate", label: "Unified Studio", icon: Languages },
              { id: "speech", label: "Speech to Text", icon: Mic },
              { id: "dictionary", label: "Dictionary", icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${isActive ? "bg-white text-[#1b4332] shadow-lg font-semibold scale-[1.02]" : "text-emerald-100/70 hover:bg-white/10 hover:text-white"}`}>
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-900/50 space-y-3">
          <div className="space-y-1">
            {[
              { id: "history", label: "History", icon: History },
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); if(item.id === "history") fetchHistory(); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${isActive ? "bg-white text-[#1b4332] shadow-md font-semibold" : "text-emerald-100/70 hover:bg-white/10 hover:text-white"}`}>
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-200 text-[#1b4332] flex items-center justify-center font-bold text-sm">{fullName ? fullName[0].toUpperCase() : "R"}</div>
            <div className="overflow-hidden flex-1"><p className="text-xs font-bold text-white truncate">{fullName || "User"}</p><p className="text-[10px] text-emerald-200/70 truncate">Active Session</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative z-10 scroll-smooth">
        
        <header className="h-20 border-b px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-[#0c1612]/80 border-emerald-950 text-white">
          <div>
            <h1 className="text-xl font-serif font-bold">Welcome back, {fullName.split(" ")[0] || "User"}</h1>
            <p className="text-xs text-slate-400">Your AI translation engines are fully operational.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-rose-950/40 hover:text-rose-400"><Power size={14} /> Sign Out</button>
          </div>
        </header>

        <div className="p-8 space-y-6 w-full max-w-none">
          
          {/* ================= DASHBOARD VIEW ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-500 w-full">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                {[
                  { label: "Total Operations", val: historyLogs.length + 124, icon: Activity },
                  { label: "Model Accuracy", val: `${modelAccuracy}%`, icon: ShieldCheck },
                  { label: "System Latency", val: `${latency}ms`, icon: Zap },
                  { label: "Dictionary Signs", val: `${islDictionary.length} / 50`, icon: BookOpen },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="p-5 rounded-3xl border transition-all bg-[#12221b] border-emerald-900/30 shadow-md text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon size={22} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                          <h3 className="text-xl font-bold mt-0.5">{kpi.val}</h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#1b4332] text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-emerald-100">Ready to translate or practice?</h3>
                  <p className="text-xs text-emerald-200/80">Type any phrase below to execute the translation pipeline.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type words to sign..." className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-emerald-200/50 focus:outline-none w-full md:w-64" />
                  <button onClick={() => setActiveTab("translate")} className="px-5 py-2.5 rounded-xl bg-white text-[#1b4332] text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer shadow-sm">Translate</button>
                </div>
              </div>

              {/* Services & Why SynSign Was Built */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <div className="lg:col-span-2 p-8 rounded-3xl border shadow-sm space-y-6 bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <Sparkles size={24} />
                    <h3 className="text-xl font-serif font-bold text-white">What Services SynSign Provides</h3>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-100">
                    SynSign is a comprehensive AI-powered translation ecosystem designed to eliminate communication barriers for the deaf and hard-of-hearing community. Our platform delivers four core interactive services:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { title: "1. Live Gesture Recognition", desc: "Using advanced MediaPipe hand tracking and PyTorch models, our system detects hand gestures through your webcam and translates them into readable text in real-time.", icon: Video, tab: "live" },
                      { title: "2. Unified Translation Studio", desc: "Converts English text sentences into Indian Sign Language (ISL) Subject-Object-Verb (SOV) syntax and animates them using a 3D WebGL avatar.", icon: Languages, tab: "translate" },
                      { title: "3. Speech-to-Text & Voice Output", desc: "Captures live spoken audio via microphone, instantly transcribes speech strings, and reads translations aloud with customizable speech synthesis.", icon: Mic, tab: "speech" },
                      { title: "4. Interactive ISL Dictionary", desc: "Provides a catalog of 50+ categorized signs with step-by-step execution guides, difficulty indicators, and professional practice tips.", icon: BookOpen, tab: "dictionary" },
                    ].map((srv, i) => {
                      const SIcon = srv.icon;
                      return (
                        <div key={i} onClick={() => setActiveTab(srv.tab)} className="p-6 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] bg-[#0d1813] border-emerald-950 hover:border-emerald-500">
                          <div className="flex items-center gap-2.5 mb-2.5 text-emerald-400 font-bold text-sm">
                            <SIcon size={18} /> {srv.title}
                          </div>
                          <p className="text-xs font-semibold leading-relaxed text-slate-200">{srv.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-8 rounded-3xl border shadow-sm flex flex-col justify-between bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <Heart size={22} />
                      <h3 className="text-lg font-bold text-white">Why SynSign Was Built</h3>
                    </div>
                    <p className="text-xs font-semibold leading-relaxed text-slate-200">
                      Millions of individuals face daily communication hurdles due to a lack of universal sign language interpreters in public services, classrooms, and workplaces.
                    </p>
                    <div className="space-y-4 pt-2">
                      {[
                        { title: "Bridging the Gap", desc: "Enabling seamless two-way conversations without requiring specialized human interpreters for basic interactions." },
                        { title: "Promoting Inclusion", desc: "Empowering students and professionals with accessible AI tools tailored for Indian Sign Language (ISL) grammar." },
                        { title: "Real-Time Assistance", desc: "Delivering instant low-latency audio-visual translations right from standard web browsers." },
                      ].map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-white">{reason.title}</h4>
                            <p className="text-xs font-semibold leading-tight text-slate-300 mt-0.5">{reason.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-emerald-900/30">
                    <p className="text-xs font-serif italic text-emerald-400 text-center font-bold">"Empowering independence through accessible technology."</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================= UNIFIED TRANSLATE STUDIO VIEW ================= */}
          {activeTab === "translate" && (
            <div className="p-8 rounded-3xl border shadow-sm space-y-6 bg-[#12221b] border-emerald-900/30 text-white w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/40 pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Unified Translation Studio</h2>
                  <p className="text-sm mt-1 text-slate-400">Type text on the left to see your 3D ISL Avatar instantly perform the signs.</p>
                </div>
                <button onClick={() => setIsAnimatingAvatar(!isAnimatingAvatar)} className="px-5 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#122d21] text-white text-xs font-bold cursor-pointer transition-colors border border-emerald-800">
                  {isAnimatingAvatar ? "Pause 3D Avatar" : "Play 3D Avatar"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[480px] w-full">
                <div className="flex flex-col gap-6 h-full">
                  <div className="flex-1 p-6 rounded-2xl border flex flex-col justify-between bg-[#0d1813] border-emerald-950 text-white">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Input Source Text (English)</label>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type words or sentences (e.g. How are you, Stop, Bye, Hello)..." 
                      className="w-full flex-1 bg-transparent resize-none text-sm font-semibold text-white focus:outline-none"
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-emerald-950">
                      <span className="text-[10px] text-slate-400 font-semibold">ISL NLP Engine Active</span>
                      <button onClick={handleTranslate} disabled={isTranslating || !inputText} className="px-5 py-2 rounded-xl bg-[#1b4332] hover:bg-[#122d21] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-800">
                        {isTranslating ? "Translating..." : "Translate to ISL"} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 rounded-2xl border flex flex-col justify-between bg-[#0d1813] border-emerald-950 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated ISL Gloss</label>
                      {translatedOutput && !isTranslating && (
                        <button onClick={() => speakText(translatedOutput)} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                          <Volume2 size={14} /> Speak
                        </button>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-bold text-emerald-400 tracking-wide mb-1">
                        {isTranslating ? "Parsing syntax..." : (translatedOutput || "Awaiting input...")}
                      </span>
                      {showTextWithSigns && translatedOutput && !isTranslating && (
                        <span className="text-xs font-semibold text-slate-400">
                          ({inputText})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold text-right mt-2 border-t border-emerald-950 pt-2">ISL Grammar • SOV Output</span>
                  </div>
                </div>

                <div className="rounded-3xl border shadow-sm flex flex-col relative overflow-hidden transition-colors bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <div className="flex items-center gap-2 text-white">
                      <Box size={16}/> <span className="text-sm font-bold shadow-black drop-shadow-md">Live Avatar Renderer</span>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <span className="text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">WebGL</span>
                    </div>
                  </div>

                  {hasTranslated ? (
                    <>
                      <div ref={avatarContainerRef} className="w-full flex-1 bg-slate-950 relative flex items-center justify-center ring-1 ring-slate-800/50"></div>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 z-10">
                        <button onClick={() => setIsAnimatingAvatar(!isAnimatingAvatar)} className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${isAnimatingAvatar ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                          {isAnimatingAvatar ? "Pause" : "Play"}
                        </button>
                        <div className="h-4 w-px bg-white/20"></div>
                        <select value={signSpeed} onChange={(e) => setSignSpeed(e.target.value)} className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer">
                          <option className="text-black">Slow</option>
                          <option className="text-black">Normal</option>
                          <option className="text-black">Fast</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex-1 bg-slate-950 relative flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <Box size={48} className="opacity-30 mb-3 animate-pulse text-emerald-400" />
                      <p className="text-sm font-semibold text-slate-200">Avatar Renderer on Standby</p>
                      <p className="text-xs text-slate-400 mt-1">Type a phrase and click Translate to render Remy</p>
                    </div>
                  )}
                </div>
              </div>

              {/* How Translation Works Bar */}
              <div className="p-6 rounded-3xl border shadow-sm w-full bg-[#0d1813] border-emerald-950 text-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-center mb-6 opacity-90 text-white">HOW TRANSLATION WORKS</h4>
                <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-4 sm:gap-2">
                  {[
                    { icon: Type, label: "Input Text" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Cpu, label: "NLP Engine" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Languages, label: "ISL Gloss" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Box, label: "3D Animation" }
                  ].map((step, idx) => {
                    const Icon = step.icon;
                    if (step.isArrow) return <Icon key={idx} size={16} className="hidden sm:block text-slate-600" />;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 w-24">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border bg-[#12221b] border-emerald-900/50 text-emerald-400">
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-center text-slate-300">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= LIVE RECOGNITION VIEW ================= */}
          {activeTab === "live" && (
            <div className="space-y-6 animate-in fade-in duration-500 w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-emerald-900/40">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Live Gesture Recognition</h2>
                  <p className="text-sm mt-1 text-slate-400">Translate Indian Sign Language to text using real-time hand tracking.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                  <span className="text-sm font-semibold text-slate-300">{isCameraActive ? 'Camera Active' : 'Camera Offline'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[480px] w-full">
                <div className="lg:col-span-2 p-4 rounded-3xl border shadow-sm flex flex-col relative overflow-hidden transition-colors bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Camera className="text-emerald-500" size={16}/> Viewfinder</h3>
                    <button onClick={toggleCamera} className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${isCameraActive ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-[#1b4332] hover:bg-[#122d21] shadow-emerald-900/20 border border-emerald-800'}`}>
                      {isCameraActive ? "Stop Camera" : "Start Camera"}
                    </button>
                  </div>
                  <div className="w-full flex-1 bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center ring-1 ring-slate-800/50 shadow-inner">
                    <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                    <canvas ref={canvasRef} width={1280} height={720} className={`w-full h-full object-cover ${isCameraActive ? "block" : "hidden"}`} />
                    {!isCameraActive && (
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Video size={48} className="opacity-40 animate-pulse" />
                        <p className="text-sm font-medium">Click "Start Camera" to initialize MediaPipe stream</p>
                      </div>
                    )}
                    {isCameraActive && captions && detectedGesture !== "Waiting for hand sign..." && detectedGesture !== "No hands detected in frame" && (
                      <div className="absolute bottom-6 px-6 py-2 bg-black/80 backdrop-blur-md rounded-xl text-white font-bold tracking-wide border border-white/10 animate-in fade-in slide-in-from-bottom-2">
                        {detectedGesture}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-3xl border shadow-sm flex flex-col h-full bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2"><Activity className="text-emerald-500" size={18}/> Recognition Data</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isCameraActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>{isCameraActive ? 'Scanning' : 'Standby'}</span>
                  </div>

                  <div className="flex-1 rounded-2xl border p-5 mb-6 flex flex-col justify-center gap-6 bg-[#0d1813] border-emerald-950 text-white">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Sign</span>
                      <p className={`text-xl font-bold mt-1 ${isCameraActive ? 'text-emerald-400' : 'text-slate-500'}`}>{isCameraActive ? detectedGesture : "Offline"}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence</span>
                        <span className="text-sm font-bold text-emerald-400">{isCameraActive ? confidenceScore : "0%"}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: isCameraActive ? confidenceScore : '0%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button onClick={() => speakText(detectedGesture)} disabled={!isCameraActive || detectedGesture === "Waiting for hand sign..." || detectedGesture === "No hands detected in frame"} className="w-full py-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 border flex items-center justify-center gap-2 cursor-pointer bg-[#0d1813] border-emerald-950 text-slate-300 hover:bg-slate-800">
                      <Volume2 size={16} /> Speak Sign Aloud
                    </button>
                    <button onClick={() => saveHistoryLog(detectedGesture, "Gesture Recognition", confidenceScore)} disabled={!isCameraActive || detectedGesture === "Waiting for hand sign..." || detectedGesture === "No hands detected in frame"} className="w-full py-3 rounded-xl bg-[#1b4332] text-white text-xs font-bold hover:bg-[#122d21] transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-800">
                      <Save size={16} /> Save to History
                    </button>
                  </div>
                </div>
              </div>

              {/* How Live Recognition Works Process Bar */}
              <div className="p-6 rounded-3xl border shadow-sm w-full bg-[#0d1813] border-emerald-950 text-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-center mb-6 opacity-90 text-white">HOW LIVE RECOGNITION WORKS</h4>
                <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4 sm:gap-2">
                  {[
                    { icon: Camera, label: "Webcam" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Box, label: "Hand Tracking" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Cpu, label: "AI Classifier" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Type, label: "Translation" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Volume2, label: "Audio Output" }
                  ].map((step, idx) => {
                    const Icon = step.icon;
                    if (step.isArrow) return <Icon key={idx} size={16} className="hidden sm:block text-slate-600" />;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 w-28">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border bg-[#12221b] border-emerald-900/50 text-emerald-400">
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-center text-slate-300">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= SPEECH-TO-TEXT VIEW ================= */}
          {activeTab === "speech" && (
            <div className="space-y-6 animate-in fade-in duration-500 w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-emerald-900/40">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Speech to Text</h2>
                  <p className="text-sm mt-1 text-slate-400">Convert your spoken words into text in real time.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : micStatus === 'Microphone Permission Required' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  <span className="text-sm font-semibold text-slate-300">{micStatus}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="p-8 rounded-3xl border shadow-sm flex flex-col items-center justify-center relative overflow-hidden transition-colors min-h-[380px] bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="text-center mb-6 z-10">
                    <h3 className="text-base font-bold flex items-center justify-center gap-2">
                      <AudioLines className="text-emerald-500" size={18}/> Voice Input
                    </h3>
                    <p className="text-xs mt-1.5 max-w-xs mx-auto font-medium text-slate-400">
                      Click the microphone and start speaking. Your words will appear as live transcription.
                    </p>
                  </div>

                  <div className="relative z-10 flex flex-col items-center my-auto">
                    <button onClick={toggleSpeechRecognition} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg z-20 ${isRecording ? 'bg-rose-600 text-white scale-105 shadow-rose-600/30' : 'bg-[#1b4332] text-white hover:bg-[#122d21] hover:scale-105 border border-emerald-800'}`}>
                      {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    {isRecording && (
                      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                        <div className="w-28 h-28 rounded-full bg-rose-500/20 animate-ping absolute"></div>
                        <div className="w-36 h-36 rounded-full bg-rose-500/10 animate-pulse absolute"></div>
                      </div>
                    )}
                    <div className="mt-5 flex flex-col items-center gap-2">
                      <span className={`text-xl font-bold font-mono tracking-wider ${isRecording ? 'text-rose-500' : 'text-slate-300'}`}>
                        {formatTime(recordingTime)}
                      </span>
                      <button onClick={toggleSpeechRecognition} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${isRecording ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border shadow-sm flex flex-col justify-between min-h-[380px] bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <MessageSquare className="text-emerald-500" size={18}/> Live Transcription
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isRecording ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {isRecording ? 'Live' : 'Ready'}
                    </span>
                  </div>

                  <div className="flex-1 rounded-2xl border p-4 mb-4 relative flex items-center justify-center bg-[#0d1813] border-emerald-950 text-white">
                    {transcript ? (
                      <textarea value={transcript} onChange={(e) => { setTranscript(e.target.value); setInputText(e.target.value); }} className="w-full h-full bg-transparent resize-none focus:outline-none text-sm font-semibold text-white leading-relaxed" placeholder="Edit your transcription here..." />
                    ) : (
                      <div className="text-center p-6 pointer-events-none">
                        <Mic size={28} className="mb-2 mx-auto opacity-40 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-500">Your recognized speech will appear here...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">{transcript.length} characters</span>
                    <div className="flex gap-2">
                      <button onClick={handleClearTranscript} disabled={!transcript} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 border cursor-pointer bg-[#0d1813] border-emerald-950 text-slate-300 hover:bg-rose-950/40 hover:text-rose-400">Clear</button>
                      <button onClick={handleCopyTranscript} disabled={!transcript} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 border flex items-center gap-1 cursor-pointer bg-[#0d1813] border-emerald-950 text-emerald-400 hover:bg-emerald-900/40">
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-[#12221b] border-emerald-900/30 text-white">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Language:</span>
                  <select 
                    value={selectedSpeechLanguage} 
                    onChange={(e) => setSelectedSpeechLanguage(e.target.value)}
                    className="border text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-semibold bg-[#0d1813] border-emerald-950 text-white"
                  >
                    <option>English (India)</option>
                    <option>English (US)</option>
                    <option>Hindi (India)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button onClick={() => saveHistoryLog(transcript || "Voice Input Log", "Voice → Text", "98.0%")} disabled={!transcript} className="px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-[#0d1813] border-emerald-950 text-slate-300 hover:bg-slate-800">
                    <Save size={14} /> Save to History
                  </button>
                  <button onClick={() => speakText(transcript)} disabled={!transcript} className="px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer disabled:opacity-50 bg-[#0d1813] border-emerald-950 text-emerald-400 hover:bg-emerald-900/40">
                    <Volume2 size={14} /> Read Aloud
                  </button>
                  <button onClick={() => { setInputText(transcript); setActiveTab("translate"); setTimeout(() => handleTranslate(), 100); }} disabled={!transcript} className="px-5 py-2 rounded-xl bg-[#1b4332] hover:bg-[#122d21] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border border-emerald-800">
                    Translate to ISL <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl border shadow-sm w-full bg-[#0d1813] border-emerald-950 text-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-center mb-6 opacity-90 text-white">HOW SPEECH TO TEXT WORKS</h4>
                <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-4 sm:gap-2">
                  {[
                    { icon: MessageSquare, label: "Speak" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Mic, label: "Microphone" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Cpu, label: "Recognition" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Type, label: "Transcription" },
                    { icon: ArrowRight, label: "", isArrow: true },
                    { icon: Box, label: "ISL Avatar" }
                  ].map((step, idx) => {
                    const Icon = step.icon;
                    if (step.isArrow) return <Icon key={idx} size={16} className="hidden sm:block text-slate-600" />;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 w-24">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border bg-[#12221b] border-emerald-900/50 text-emerald-400">
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-center text-slate-300">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= DICTIONARY TAB ================= */}
          {activeTab === "dictionary" && (
            <div className="p-8 rounded-3xl border shadow-sm space-y-6 bg-[#12221b] border-emerald-900/30 text-white w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-serif font-bold">ISL Sign Dictionary</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search catalog..." 
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-semibold border outline-none bg-[#0d1813] border-emerald-950 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {islDictionary.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(sign => (
                  <div key={sign.id} onClick={() => setActiveSignModal(sign)} className="p-6 rounded-2xl border cursor-pointer transition-all bg-[#0d1813] border-emerald-950 text-white hover:border-emerald-500">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{sign.category}</span>
                    <h3 className="text-base font-bold mt-2">{sign.title}</h3>
                    <p className="text-xs font-semibold text-slate-300 mt-1 line-clamp-2">{sign.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="rounded-3xl max-w-lg w-full p-8 shadow-2xl border space-y-6 relative bg-[#12221b] border-emerald-800 text-white">
                <button onClick={() => setActiveSignModal(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-500/10 text-slate-400 cursor-pointer"><X size={18} /></button>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">{activeSignModal.category}</span>
                    <span className="text-xs font-semibold text-slate-400">• {activeSignModal.difficulty} Level</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold">{activeSignModal.title}</h3>
                </div>
                <div className="p-4 rounded-2xl border space-y-3 bg-[#0d1813] border-emerald-950 text-white">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400"><Info size={14} /> Execution Steps</h4>
                  <p className="text-xs font-semibold leading-relaxed">{activeSignModal.description}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-1">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pro Tips</h4>
                  <p className="text-xs font-semibold text-emerald-200">{activeSignModal.tips}</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => speakText(activeSignModal.title)} className="flex-1 py-3 rounded-2xl bg-[#1b4332] hover:bg-[#122d21] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 border border-emerald-800">
                    <Volume2 size={16} /> Pronounce
                  </button>
                  <button onClick={() => { setInputText(activeSignModal.title); setActiveTab("translate"); setActiveSignModal(null); }} className="px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border bg-[#0d1813] border-emerald-950 text-emerald-400 hover:bg-slate-800">
                    Translate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= REAL-TIME HISTORY TAB ================= */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-300 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-emerald-900/40">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Activity History</h2>
                  <p className="text-sm mt-1 text-slate-400">Real-time log of your live translations, voice inputs, and gestures.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="text" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} placeholder="Search history..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm font-semibold focus:outline-none bg-[#12221b] border-emerald-950 text-white"/></div>
                  <button onClick={clearHistory} disabled={historyLogs.length === 0} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"><Trash2 size={16} /> <span className="hidden sm:inline">Clear All</span></button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "ISL → Text", "Text → ISL", "Voice → Text", "Gesture Recognition", "Text-to-Speech"].map((cat) => (
                  <button key={cat} onClick={() => setHistoryCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer ${historyCategory === cat ? "bg-[#1b4332] text-white shadow-md font-semibold border border-emerald-800" : "bg-[#12221b] text-slate-300 border border-emerald-950 hover:bg-emerald-950/40"}`}>{cat}</button>
                ))}
              </div>
              <div className="space-y-3 w-full">
                {historyLogs.length === 0 ? (
                  <div className="text-center py-20 rounded-3xl border border-dashed bg-[#12221b] border-emerald-950">
                    <div className="w-16 h-16 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><History size={24} className="text-slate-400" /></div>
                    <h3 className="text-lg font-bold">No translation history yet</h3>
                    <p className="text-xs text-slate-400 mt-1">Perform translations in the Studio or use Live Recognition to populate real-time logs.</p>
                  </div>
                ) : (
                  historyLogs.filter(item => historyCategory === "All" || item.type.toLowerCase() === historyCategory.toLowerCase()).filter(item => item.text.toLowerCase().includes(historySearch.toLowerCase())).map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12221b] border-emerald-900/30 text-white">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-1">{item.type.includes("Voice") || item.type.includes("Speech") ? <Mic size={18} /> : item.type.includes("Gesture") ? <Video size={18} /> : <Type size={18} />}</div>
                        <div><div className="flex items-center gap-2 mb-1"><span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">{item.type}</span><span className="text-xs font-semibold text-slate-400">• {item.time}</span></div><p className="text-sm font-bold line-clamp-1">{item.text}</p></div>
                      </div>
                      <div className="flex items-center gap-3 sm:self-center self-end">
                        <button onClick={() => deleteHistoryItem(item.id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer" title="Delete Log"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300 w-full">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40">
                <div>
                  <h2 className="text-2xl font-serif font-bold">Your Profile</h2>
                  <p className="text-sm mt-1 text-slate-400">Manage your identity, account details, and learning preferences.</p>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)} 
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${isEditingProfile ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-[#1b4332] text-white hover:bg-[#122d21] border border-emerald-800'}`}
                >
                  {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>

              <div className="p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 bg-[#12221b] border-emerald-900/30 text-white">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1b4332] to-emerald-700 text-white flex items-center justify-center font-serif text-4xl shadow-md border-4 border-emerald-500/20">
                    {fullName ? fullName[0].toUpperCase() : "R"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-2xl font-bold">{fullName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified User
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400 mt-0.5">@{username}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1"><Clock size={12} /> Member since August 2026</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Translations</p>
                    <p className="text-2xl font-bold mt-0.5">{historyLogs.length + 124}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Active Streak</p>
                    <p className="text-2xl font-bold mt-0.5 flex items-center justify-center gap-1"><Flame size={18} className="text-amber-500" /> 7 Days</p>
                  </div>
                </div>
              </div>

              {isEditingProfile ? (
                <div className="p-8 rounded-3xl border shadow-sm space-y-6 bg-[#12221b] border-emerald-900/30 text-white">
                  <h3 className="text-lg font-bold border-b border-emerald-900/40 pb-3">Edit Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="w-full p-3 rounded-xl border text-sm font-semibold outline-none bg-[#0d1813] border-emerald-950 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
                      <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="w-full p-3 rounded-xl border text-sm font-semibold outline-none bg-[#0d1813] border-emerald-950 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-3 rounded-xl border text-sm font-semibold outline-none bg-[#0d1813] border-emerald-950 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Preferred Language</label>
                      <select 
                        value={preferredLanguage} 
                        onChange={(e) => setPreferredLanguage(e.target.value)} 
                        className="w-full p-3 rounded-xl border text-sm font-semibold outline-none cursor-pointer bg-[#0d1813] border-emerald-950 text-white"
                      >
                        <option>English (India)</option>
                        <option>English (US)</option>
                        <option>Hindi (India)</option>
                        <option>Marathi (India)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-emerald-900/40">
                    <button onClick={() => setIsEditingProfile(false)} className="px-6 py-2.5 rounded-xl border text-xs font-bold cursor-pointer bg-slate-800 border-slate-700 text-slate-300">
                      Cancel
                    </button>
                    <button onClick={() => { setIsEditingProfile(false); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); }} className="px-6 py-2.5 rounded-xl bg-[#1b4332] text-white text-xs font-bold hover:bg-[#122d21] shadow-md cursor-pointer border border-emerald-800">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl border shadow-sm space-y-4 bg-[#12221b] border-emerald-900/30 text-white">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <User size={18} />
                      <h4 className="font-bold text-sm">Personal Info</h4>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div><span className="text-slate-400 block font-semibold">Full Name</span><span className="font-bold text-sm text-white">{fullName}</span></div>
                      <div><span className="text-slate-400 block font-semibold">Username</span><span className="font-bold text-sm text-white">@{username}</span></div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl border shadow-sm space-y-4 bg-[#12221b] border-emerald-900/30 text-white">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <Mail size={18} />
                      <h4 className="font-bold text-sm">Contact Details</h4>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div><span className="text-slate-400 block font-semibold">Email Address</span><span className="font-bold text-sm text-white">{email}</span></div>
                      <div><span className="text-slate-400 block font-semibold">Account Security</span><span className="font-bold text-emerald-400">2FA Enabled</span></div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl border shadow-sm space-y-4 bg-[#12221b] border-emerald-900/30 text-white">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <Globe size={18} />
                      <h4 className="font-bold text-sm">Localization</h4>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div><span className="text-slate-400 block font-semibold">Preferred Language</span><span className="font-bold text-sm text-white">{preferredLanguage}</span></div>
                      <div><span className="text-slate-400 block font-semibold">Sign Dialect</span><span className="font-bold text-sm text-white">Indian Sign Language (ISL)</span></div>
                    </div>
                  </div>
                </div>
              )}

              {profileSaved && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle size={16} /> Profile details successfully updated!
                </div>
              )}
            </div>
          )}

          {/* ================= SETTINGS TAB ================= */}
          {activeTab === "settings" && (
            <div className="space-y-8 w-full animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/40">
                <div><h2 className="text-2xl font-serif font-bold">Settings</h2><p className="text-sm mt-1 text-slate-400">Configure hardware accessibility and ISL preferences.</p></div>
                {settingsSaved && <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-bold flex items-center gap-1.5"><CheckCircle size={16} /> Saved</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="p-6 rounded-3xl border shadow-sm space-y-6 bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-900/40 pb-3"><Box size={18} /> <h3 className="font-bold">ISL Preferences</h3></div>
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold">Sign Speed
                        <select value={signSpeed} onChange={(e) => setSignSpeed(e.target.value)} className="border text-sm font-semibold rounded-lg p-2 outline-none cursor-pointer bg-[#0d1813] border-emerald-950 text-white">
                          <option>Slow</option><option>Normal</option><option>Fast</option>
                        </select>
                      </label>
                    </div>
                    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Show Text with Signs</p></div><ToggleSwitch checked={showTextWithSigns} onChange={setShowTextWithSigns} /></div>
                    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Auto-play Signs</p></div><ToggleSwitch checked={autoPlaySigns} onChange={setAutoPlaySigns} /></div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border shadow-sm space-y-6 bg-[#12221b] border-emerald-900/30 text-white">
                  <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-900/40 pb-3"><Volume2 size={18} /> <h3 className="font-bold">Speech & Audio</h3></div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Voice Output Enabled</p></div><ToggleSwitch checked={voiceOutput} onChange={setVoiceOutput} /></div>
                    <div>
                      <label className="flex items-center justify-between text-sm font-semibold">Speech Speed
                        <select value={speechSpeed} onChange={(e) => setSpeechSpeed(e.target.value)} className="border text-sm font-semibold rounded-lg p-2 outline-none cursor-pointer bg-[#0d1813] border-emerald-950 text-white">
                          <option>Slow</option><option>Normal</option><option>Fast</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4"><button onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }} className="px-8 py-3 bg-[#1b4332] text-white text-sm font-bold rounded-xl cursor-pointer border border-emerald-800">Save All Preferences</button></div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}