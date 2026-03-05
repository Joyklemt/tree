import { useState } from 'react'
import { motion } from 'framer-motion'

export default function IntroScreen({ onEnter }) {
  const [zooming, setZooming] = useState(false)

  function handleClick() {
    if (zooming) return
    setZooming(true)
    setTimeout(onEnter, 650)
  }

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
    >
      <motion.div
        className="w-full h-full cursor-pointer select-none"
        style={{ transformOrigin: '50% 62%' }}
        animate={zooming ? { scale: 2.4, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        onClick={handleClick}
      >
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Warm sunset sky */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#C84B18" />
              <stop offset="28%"  stopColor="#E8702A" />
              <stop offset="55%"  stopColor="#F5A848" />
              <stop offset="78%"  stopColor="#F5CC70" />
              <stop offset="100%" stopColor="#EDD898" />
            </linearGradient>
            {/* Sun radial glow */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFFBB8" stopOpacity="1" />
              <stop offset="35%"  stopColor="#FFE060" stopOpacity="0.75" />
              <stop offset="70%"  stopColor="#FFA838" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF7020" stopOpacity="0" />
            </radialGradient>
            {/* Ground */}
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#8A7040" />
              <stop offset="100%" stopColor="#5A4820" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="800" height="600" fill="url(#skyGrad)" />

          {/* Sun glow */}
          <ellipse cx="400" cy="510" rx="220" ry="160" fill="url(#sunGlow)" opacity="0.55" />

          {/* Distant haze horizon */}
          <ellipse cx="400" cy="498" rx="380" ry="28" fill="#F0C060" opacity="0.18" />

          {/* Clouds */}
          <ellipse cx="140" cy="88"  rx="78" ry="24" fill="white" opacity="0.22" />
          <ellipse cx="205" cy="78"  rx="52" ry="18" fill="white" opacity="0.17" />
          <ellipse cx="615" cy="105" rx="85" ry="26" fill="white" opacity="0.20" />
          <ellipse cx="685" cy="94"  rx="58" ry="20" fill="white" opacity="0.15" />
          <ellipse cx="320" cy="55"  rx="48" ry="16" fill="white" opacity="0.12" />

          {/* Ground plane */}
          <rect x="0" y="538" width="800" height="62" fill="url(#groundGrad)" />
          <ellipse cx="400" cy="538" rx="295" ry="20" fill="#A08848" opacity="0.7" />

          {/* ─── TREE ─── */}

          {/* Trunk */}
          <path
            d="M 400 600 C 397 562 393 524 391 488 C 389 452 389 416 390 382
               C 391 352 393 322 394 295 C 395 275 395 262 395 255"
            stroke="#3E2208" strokeWidth="20" fill="none" strokeLinecap="round"
          />
          {/* Trunk taper highlight */}
          <path
            d="M 398 600 C 396 562 392 524 391 490 C 390 455 390 420 391 385
               C 392 355 393 325 394 298"
            stroke="#6B3D18" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.35"
          />

          {/* === GROUP 1 – Far Left Branch === */}
          {/* attaches at trunk ~(390, 438) */}
          <g style={{ transformOrigin: '390px 438px' }} className="branch-sway-1">
            <path
              d="M 390 438 C 368 408 328 378 280 348 C 235 320 182 295 142 278"
              stroke="#4E2C0E" strokeWidth="11" fill="none" strokeLinecap="round"
            />
            {/* sub-branch */}
            <path
              d="M 248 358 C 235 340 215 320 192 305"
              stroke="#5C3418" strokeWidth="7" fill="none" strokeLinecap="round"
            />
            {/* leaf cluster at tip */}
            <g style={{ transformOrigin: '142px 265px' }} className="leaf-sway-b">
              <ellipse cx="142" cy="266" rx="52" ry="42" fill="#244812" opacity="0.96" />
              <ellipse cx="155" cy="252" rx="44" ry="35" fill="#346820" opacity="0.92" />
              <ellipse cx="130" cy="258" rx="40" ry="33" fill="#4E8830" opacity="0.88" />
              <ellipse cx="148" cy="242" rx="30" ry="24" fill="#70A042" opacity="0.82" />
            </g>
            {/* leaf cluster at sub-branch tip */}
            <g style={{ transformOrigin: '192px 297px' }} className="leaf-sway-a">
              <ellipse cx="192" cy="298" rx="35" ry="28" fill="#2C5A18" opacity="0.92" />
              <ellipse cx="202" cy="287" rx="28" ry="22" fill="#428030" opacity="0.87" />
            </g>
          </g>

          {/* === GROUP 2 – Left Branch === */}
          {/* attaches at trunk ~(392, 382) */}
          <g style={{ transformOrigin: '392px 382px' }} className="branch-sway-2">
            <path
              d="M 392 382 C 372 354 342 320 302 288 C 266 260 222 228 195 205"
              stroke="#4E2C0E" strokeWidth="10" fill="none" strokeLinecap="round"
            />
            <path
              d="M 280 295 C 263 272 242 254 218 240"
              stroke="#5E3418" strokeWidth="6" fill="none" strokeLinecap="round"
            />
            <g style={{ transformOrigin: '195px 193px' }} className="leaf-sway-c">
              <ellipse cx="195" cy="193" rx="55" ry="45" fill="#204010" opacity="0.96" />
              <ellipse cx="208" cy="178" rx="46" ry="37" fill="#305E20" opacity="0.92" />
              <ellipse cx="182" cy="186" rx="42" ry="34" fill="#4A7E32" opacity="0.88" />
              <ellipse cx="200" cy="168" rx="32" ry="26" fill="#6A9A48" opacity="0.82" />
            </g>
            <g style={{ transformOrigin: '218px 232px' }} className="leaf-sway-b">
              <ellipse cx="218" cy="233" rx="34" ry="27" fill="#2A5415" opacity="0.91" />
              <ellipse cx="228" cy="222" rx="27" ry="22" fill="#447830" opacity="0.86" />
            </g>
          </g>

          {/* === GROUP 3 – Center-Left Branch === */}
          {/* attaches at trunk ~(393, 325) */}
          <g style={{ transformOrigin: '393px 325px' }} className="branch-sway-3">
            <path
              d="M 393 325 C 378 300 355 272 325 248 C 298 226 265 202 242 182"
              stroke="#4E2C0E" strokeWidth="9" fill="none" strokeLinecap="round"
            />
            <g style={{ transformOrigin: '242px 170px' }} className="leaf-sway-a">
              <ellipse cx="242" cy="170" rx="53" ry="44" fill="#224212" opacity="0.96" />
              <ellipse cx="255" cy="156" rx="45" ry="36" fill="#326020" opacity="0.92" />
              <ellipse cx="230" cy="164" rx="41" ry="34" fill="#4C8034" opacity="0.88" />
              <ellipse cx="248" cy="148" rx="31" ry="25" fill="#6E9E4A" opacity="0.82" />
            </g>
          </g>

          {/* === CENTER CROWN (top of trunk) === */}
          <g style={{ transformOrigin: '395px 255px' }} className="leaf-sway-b">
            <ellipse cx="395" cy="243" rx="64" ry="52" fill="#1C3A0C" opacity="0.97" />
            <ellipse cx="408" cy="228" rx="54" ry="43" fill="#2C5818" opacity="0.93" />
            <ellipse cx="380" cy="236" rx="50" ry="41" fill="#407030" opacity="0.89" />
            <ellipse cx="397" cy="216" rx="38" ry="30" fill="#5A8E40" opacity="0.85" />
            <ellipse cx="415" cy="208" rx="27" ry="22" fill="#78AA52" opacity="0.78" />
          </g>

          {/* === GROUP 4 – Center-Right Branch === */}
          {/* attaches at trunk ~(395, 310) */}
          <g style={{ transformOrigin: '395px 310px' }} className="branch-sway-4">
            <path
              d="M 395 310 C 410 287 432 260 458 238 C 484 218 520 196 548 178"
              stroke="#4E2C0E" strokeWidth="9" fill="none" strokeLinecap="round"
            />
            <g style={{ transformOrigin: '548px 166px' }} className="leaf-sway-c">
              <ellipse cx="548" cy="166" rx="54" ry="44" fill="#224212" opacity="0.96" />
              <ellipse cx="560" cy="152" rx="46" ry="37" fill="#326020" opacity="0.92" />
              <ellipse cx="535" cy="160" rx="42" ry="34" fill="#4C8034" opacity="0.88" />
              <ellipse cx="550" cy="145" rx="32" ry="25" fill="#6E9E4A" opacity="0.82" />
            </g>
          </g>

          {/* === GROUP 5 – Right Branch === */}
          {/* attaches at trunk ~(394, 365) */}
          <g style={{ transformOrigin: '394px 365px' }} className="branch-sway-5">
            <path
              d="M 394 365 C 418 338 450 308 488 278 C 528 248 572 220 608 204"
              stroke="#4E2C0E" strokeWidth="10" fill="none" strokeLinecap="round"
            />
            <path
              d="M 505 282 C 520 262 540 246 562 233"
              stroke="#5E3418" strokeWidth="6" fill="none" strokeLinecap="round"
            />
            <g style={{ transformOrigin: '608px 192px' }} className="leaf-sway-a">
              <ellipse cx="608" cy="192" rx="55" ry="45" fill="#204010" opacity="0.96" />
              <ellipse cx="622" cy="177" rx="46" ry="37" fill="#306020" opacity="0.92" />
              <ellipse cx="594" cy="185" rx="42" ry="34" fill="#4A7E32" opacity="0.88" />
              <ellipse cx="610" cy="167" rx="33" ry="26" fill="#6A9A48" opacity="0.82" />
            </g>
            <g style={{ transformOrigin: '562px 225px' }} className="leaf-sway-c">
              <ellipse cx="562" cy="226" rx="35" ry="28" fill="#2A5415" opacity="0.91" />
              <ellipse cx="572" cy="215" rx="27" ry="22" fill="#447830" opacity="0.86" />
            </g>
          </g>

          {/* === GROUP 6 – Far Right Branch === */}
          {/* attaches at trunk ~(393, 425) */}
          <g style={{ transformOrigin: '393px 425px' }} className="branch-sway-6">
            <path
              d="M 393 425 C 422 395 462 362 508 332 C 552 305 605 278 648 262"
              stroke="#4E2C0E" strokeWidth="11" fill="none" strokeLinecap="round"
            />
            <path
              d="M 525 336 C 540 316 558 300 580 288"
              stroke="#5E3418" strokeWidth="7" fill="none" strokeLinecap="round"
            />
            <g style={{ transformOrigin: '648px 250px' }} className="leaf-sway-b">
              <ellipse cx="648" cy="250" rx="52" ry="42" fill="#244812" opacity="0.96" />
              <ellipse cx="660" cy="236" rx="44" ry="35" fill="#346820" opacity="0.92" />
              <ellipse cx="636" cy="244" rx="40" ry="33" fill="#4E8830" opacity="0.88" />
              <ellipse cx="651" cy="228" rx="30" ry="24" fill="#70A042" opacity="0.82" />
            </g>
            <g style={{ transformOrigin: '580px 280px' }} className="leaf-sway-a">
              <ellipse cx="580" cy="282" rx="36" ry="29" fill="#2C5818" opacity="0.91" />
              <ellipse cx="591" cy="270" rx="28" ry="23" fill="#4A7E30" opacity="0.86" />
            </g>
          </g>

          {/* ─── Hint text ─── */}
          <g className="hint-anim">
            <text
              x="400" y="555"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize="15"
              fontWeight="500"
              fill="#F5ECD7"
              opacity="0.88"
            >
              Click the tree to explore
            </text>
            <text
              x="400" y="573"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontSize="12"
              fill="#E8C878"
              opacity="0.65"
            >
              Next.js file structure visualizer
            </text>
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}
