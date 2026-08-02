export default function Logo({ height = 45 }: { height?: number }) {
  return (
    <svg
      width={height}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="url(#logoGradient)" stroke="currentColor" strokeWidth="2" />
      
      {/* Shopping bag shape */}
      <g transform="translate(100, 100)">
        {/* Bag body */}
        <path
          d="M -30 -20 L -30 20 Q -30 35 -15 35 L 15 35 Q 30 35 30 20 L 30 -20 Z"
          fill="white"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Bag handle */}
        <path
          d="M -20 -20 Q -20 -45 0 -45 Q 20 -45 20 -20"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Fast arrow inside bag */}
        <g transform="translate(0, 5)">
          <path
            d="M -8 0 L 8 0"
            stroke="url(#arrowGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 4 -4 L 8 0 L 4 4"
            stroke="url(#arrowGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  )
}
