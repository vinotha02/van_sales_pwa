'use client';

export default function RunningHorse() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      background: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden', 
      borderRadius: 'inherit', 
      position: 'relative' 
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes horseRun {
          0% { background-position: 0% 0%; }
          12.5% { background-position: 100% 0%; }
          25% { background-position: 0% 33.333%; }
          37.5% { background-position: 100% 33.333%; }
          50% { background-position: 0% 66.666%; }
          62.5% { background-position: 100% 66.666%; }
          75% { background-position: 0% 100%; }
          87.5% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .sprite-horse {
          width: 100%;
          height: 100%;
          background-image: url('/horse-sprite.png');
          background-size: 200% 400%;
          animation: horseRun 0.6s step-end infinite;
        }
      `}} />
      <div className="sprite-horse" />
    </div>
  );
}
