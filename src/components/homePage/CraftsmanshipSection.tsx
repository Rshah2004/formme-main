
import * as React from "react";
import { useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCraftsmanshipVideo } from "@/hooks/useCraftsmanshipVideo";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  Leaf,
  Recycle,
  Droplets,
  Sun,
  Wind,
  TreePine,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const CraftsmanshipSection = () => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Annotations that will appear at specific times
  const annotations = [
    { time: 3, text: "Precision Stitching", duration: 4 },
    { time: 8, text: "Quality Control", duration: 4 },
    { time: 15, text: "Final Inspection", duration: 4 }
  ];

  const {
    videoRef,
    showAnnotation,
    annotationText,
    isMuted,
    isPlaying,
    progress,
    togglePlayPause,
    toggleMute,
    skipForward,
    skipBackward,
    setProgress
  } = useCraftsmanshipVideo(annotations);

  // Handle clicking on the progress bar
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    
    if (!video || !progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    
    video.currentTime = position * video.duration;
  };

  const sustainableMaterials = [
    {
      icon: Leaf,
      title: "Organic Cotton",
      description: "Grown without harmful pesticides or chemicals, supporting biodiversity and soil health.",
      benefit: "100% Natural",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Recycle,
      title: "Recycled Fibers",
      description: "Transforming waste materials into high-quality fabrics for a circular economy.",
      benefit: "Zero Waste",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Droplets,
      title: "Water-Conscious",
      description: "Advanced dyeing processes that use 90% less water than traditional methods.",
      benefit: "90% Less Water",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: Sun,
      title: "Solar Powered",
      description: "Manufacturing facilities powered entirely by renewable solar energy sources.",
      benefit: "Carbon Neutral",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Wind,
      title: "Wind Energy",
      description: "Utilizing clean wind power for sustainable production processes.",
      benefit: "Clean Energy",
      color: "from-sky-400 to-blue-500"
    },
    {
      icon: TreePine,
      title: "Forest Positive",
      description: "For every garment made, we plant trees to offset our environmental impact.",
      benefit: "Reforestation",
      color: "from-green-600 to-green-700"
    }
  ];

  return (
    <section className="relative py-24 px-6 bg-[#1a1a1a] font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Behind the Scenes
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-white mb-6 tracking-tight">
            Crafted to perfection
          </h2>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience the meticulous attention to detail that goes into every garment. 
            From initial design to final stitch, quality is our commitment.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-12"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Video Frame */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 shadow-2xl border border-white/10">
            <video
              ref={videoRef}
              id="craftsmanshipVideo"
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
            >
              <source src="/CraftsmanshipVideo.mp4" type="video/mp4" />
            </video>
            
            {/* Annotation Labels */}
            {showAnnotation && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-6 left-6 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-white/20"
              >
                <span className="text-sm font-medium text-white">{annotationText}</span>
              </motion.div>
            )}
            
            {/* Video Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${isHovering || isMobile ? 'opacity-100' : 'opacity-0'}`}>
              <div className="p-6">
                {/* Progress Bar */}
                <div 
                  ref={progressBarRef}
                  onClick={handleProgressBarClick}
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 group"
                >
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-100 group-hover:bg-blue-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={skipBackward}
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="Skip backward"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={togglePlayPause}
                      className="bg-white text-gray-900 hover:bg-blue-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    
                    <button
                      onClick={skipForward}
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="Skip forward"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Video Caption */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Watch our artisans bring your designs to life with precision and care
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CraftsmanshipSection;
