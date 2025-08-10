// In src/pages/Landing.tsx

// Find this div...
<div
  ref={bgRef}
  className="scroll-bg"
  style={{ backgroundImage: "url('/assets/t2.png')" }}
></div>

// ...and REPLACE it with this video tag:
<video
  ref={bgRef}
  className="scroll-bg"
  autoPlay
  loop
  muted
  playsInline
  style={{
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover', // This makes the video cover the screen
    zIndex: -1,
  }}
>
  <source src="/assets/flowing-water.mp4" type="video/mp4" />
  {/* You could add other formats like .webm here for better browser support */}
</video>
