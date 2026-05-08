"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Network,
  Smartphone,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

const cards = [
  {
    badge: "AI Powered",
    number: "01",
    title: "Your skills, perfectly matched.",
    description:
      "Our algorithm reads your profile and surfaces only the roles built for you — no noise, no irrelevant listings.",
    accent: "#5B4FE8",
    accentLight: "#EEEEFF",
    accentMid: "#C7C3F7",
    cardBg: "#FFFFFF",
    icon: Network,
    visual: "network",
  },
  {
    badge: "Swipe",
    number: "02",
    title: "Job hunting, finally fun.",
    description:
      "Swipe right on roles you love. Apply in one tap — your profile does the talking. No cover letters, ever.",
    accent: "#E8394F",
    accentLight: "#FFF0F2",
    accentMid: "#F7B3BC",
    cardBg: "#FFFFFF",
    icon: Smartphone,
    visual: "swipe",
  },
  {
    badge: "Instant",
    number: "03",
    title: "Recruiters notified the second you apply.",
    description:
      "Your resume and profile summary lands in the recruiter's WhatsApp instantly. Zero delay from apply to awareness.",
    accent: "#00A37A",
    accentLight: "#EDFAF5",
    accentMid: "#8FE0C8",
    cardBg: "#FFFFFF",
    icon: MessageCircle,
    visual: "notify",
  },
  {
    badge: "Direct",
    number: "04",
    title: "Skip the middleman entirely.",
    description:
      "Chat directly with hiring managers. No recruiters, no delays, no ghosting. Real conversations that lead to real offers.",
    accent: "#D4820A",
    accentLight: "#FFF8ED",
    accentMid: "#F5D08A",
    cardBg: "#FFFFFF",
    icon: MessageSquare,
    visual: "chat",
  },
];

function NetworkVisual({
  accent,
  accentLight,
  accentMid,
}: {
  accent: string;
  accentLight: string;
  accentMid: string;
}) {
  const nodes = [
    { x: 50, y: 50, r: 20, label: "You", main: true },
    { x: 80, y: 20, r: 13, label: "Dev", main: false },
    { x: 80, y: 80, r: 13, label: "PM", main: false },
    { x: 20, y: 25, r: 11, label: "DS", main: false },
    { x: 18, y: 75, r: 11, label: "UX", main: false },
  ];
  const lines = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={`${nodes[a].x}%`}
          y1={`${nodes[a].y}%`}
          x2={`${nodes[b].x}%`}
          y2={`${nodes[b].y}%`}
          stroke={accentMid}
          strokeWidth="0.7"
          strokeDasharray="2.5 2"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={`${n.x}%`}
            cy={`${n.y}%`}
            r={`${n.r * 0.85}%`}
            fill={n.main ? accent : accentLight}
            stroke={n.main ? "none" : accentMid}
            strokeWidth="0.6"
          />
          <text
            x={`${n.x}%`}
            y={`${n.y}%`}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={n.main ? "5.5%" : "4%"}
            fontWeight="700"
            fill={n.main ? "#fff" : accent}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SwipeVisual({
  accent,
  accentLight,
  accentMid,
}: {
  accent: string;
  accentLight: string;
  accentMid: string;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {[-1, 0, 1].map((offset) => (
        <div
          key={offset}
          className="absolute rounded-2xl"
          style={{
            width: "58%",
            height: "82%",
            transform: `rotate(${offset * 7}deg) translateX(${offset * 16}px)`,
            background: offset === 0 ? "#FFFFFF" : accentLight,
            border: `1px solid ${offset === 0 ? accentMid : "#E8E8E8"}`,
            boxShadow: offset === 0 ? `0 8px 28px ${accent}20` : "none",
            zIndex: offset === 0 ? 3 : 1,
          }}
        >
          {offset === 0 && (
            <div className="h-full flex flex-col p-4 gap-2">
              <div
                className="h-3 w-2/3 rounded-full"
                style={{ background: accentLight }}
              />
              <div
                className="h-2 w-1/2 rounded-full"
                style={{ background: accentMid, opacity: 0.7 }}
              />
              <div
                className="flex-1 rounded-xl mt-1"
                style={{ background: accentLight }}
              />
              <div className="flex justify-between mt-1 px-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: "#FFF0F0",
                    border: "1px solid #FFC0C0",
                    color: "#E8394F",
                  }}
                >
                  ✕
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: accentLight,
                    border: `1px solid ${accentMid}`,
                    color: accent,
                    fontSize: 16,
                  }}
                >
                  ♥
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function NotifyVisual({
  accent,
  accentLight,
  accentMid,
}: {
  accent: string;
  accentLight: string;
  accentMid: string;
}) {
  const msgs = [
    { text: "Profile sent ✓", active: false },
    { text: "Recruiter notified", active: false },
    { text: "Interview request! 🎉", active: true },
  ];
  return (
    <div className="flex flex-col gap-2.5 w-full px-1 justify-center h-full">
      {msgs.map((msg, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: msg.active ? accentLight : "#F4F4F4",
            border: `1px solid ${msg.active ? accentMid : "#EBEBEB"}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: msg.active ? accent : "#CCC" }}
          />
          <span
            className="text-xs font-semibold flex-1"
            style={{ color: msg.active ? accent : "#999" }}
          >
            {msg.text}
          </span>
          {msg.active && (
            <span className="text-xs font-medium" style={{ color: accent }}>
              Now
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ChatVisual({
  accent,
  accentLight,
}: {
  accent: string;
  accentLight: string;
}) {
  const messages = [
    { text: "Love your portfolio — free this week?", side: "left" },
    { text: "Yes! Wednesday works great.", side: "right" },
    { text: "Perfect. 2pm it is. Sending invite 🚀", side: "left" },
  ];
  return (
    <div className="flex flex-col gap-2 w-full px-1 justify-center h-full">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.side === "right" ? "justify-end" : "justify-start"}`}
        >
          <div
            className="max-w-[80%] px-3 py-2 text-xs leading-relaxed font-medium"
            style={{
              background: m.side === "right" ? accent : "#F2F2F2",
              color: m.side === "right" ? "#fff" : "#333",
              borderRadius:
                m.side === "right"
                  ? "16px 16px 4px 16px"
                  : "16px 16px 16px 4px",
            }}
          >
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardVisual({ card }: { card: (typeof cards)[0] }) {
  const p = {
    accent: card.accent,
    accentLight: card.accentLight,
    accentMid: card.accentMid,
  };
  switch (card.visual) {
    case "network":
      return <NetworkVisual {...p} />;
    case "swipe":
      return <SwipeVisual {...p} />;
    case "notify":
      return <NotifyVisual {...p} />;
    case "chat":
      return <ChatVisual accent={card.accent} accentLight={card.accentLight} />;
    default:
      return null;
  }
}

function StackCard({
  card,
  index,
  total,
  scrollYProgress,
}: {
  card: (typeof cards)[0];
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const seg = 1 / total;
  const start = index * seg;
  const end = start + seg;

  const scale = useTransform(scrollYProgress, [start, end], [1, 0.92]);
  const opacity = useTransform(
    scrollYProgress,
    [start, end - 0.04, end],
    [1, 1, index === total - 1 ? 1 : 0],
  );
  const Icon = card.icon;

  return (
    <motion.div
      style={{
        scale,
        opacity,
        position: "sticky",
        top: `${48 + index * 16}px`,
        zIndex: index + 1,
        transformOrigin: "top center",
      }}
      className="w-full mb-4"
    >
      <div
        className="relative rounded-3xl overflow-hidden mx-auto"
        style={{
          background: card.cardBg,
          border: `1px solid ${card.accentMid}70`,
          maxWidth: 1200,
          minHeight: "78vh",
          boxShadow: `0 2px 4px rgba(0,0,0,0.04), 0 20px 60px ${card.accent}12`,
        }}
      >
        {/* Soft tinted wash on right side */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 50% 65% at 80% 50%, ${card.accentLight} 0%, transparent 65%)`,
          }}
        />

        <div
          className="relative z-10 grid grid-cols-1 md:grid-cols-2"
          style={{ minHeight: "78vh" }}
        >
          {/* Left */}
          <div className="flex flex-col justify-center p-10 md:p-14">
            <div className="flex items-center gap-3 mb-7">
              <span
                className="text-xs font-bold tracking-[0.13em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: card.accentLight, color: card.accent }}
              >
                {card.badge}
              </span>
              <span className="text-sm" style={{ color: "#C8C8C8" }}>
                {card.number} / 0{total}
              </span>
            </div>

            <h3
              className="font-bold leading-tight mb-5"
              style={{
                fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)",
                color: "#111111",
                fontFamily: "'Playfair Display', 'Georgia', serif",
                letterSpacing: "-0.02em",
              }}
            >
              {card.title}
            </h3>

            <p
              className="text-base leading-relaxed"
              style={{ color: "#6E6E6E", maxWidth: 360 }}
            >
              {card.description}
            </p>

            <div
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: card.accent }}
            >
              <Icon size={15} strokeWidth={2.5} />
              <span>Learn more</span>
              <span>→</span>
            </div>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center justify-center p-10 relative">
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 260,
                height: 260,
                background: card.accentLight,
                opacity: 0.7,
              }}
            />
            <div
              className="relative z-10 w-full"
              style={{ maxWidth: 250, aspectRatio: "1" }}
            >
              <CardVisual card={card} />
            </div>
          </div>
        </div>

        {/* Top accent line */}
        <div
          className="absolute top-0 left-10 right-10 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${card.accent}60, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function ScrollStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      className="w-full"
      style={{
        background: "#F5F5F2",
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* Header */}
      <div className="text-center pt-24 pb-14 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p
            className="text-xs font-bold tracking-[0.28em] uppercase mb-4"
            style={{ color: "black" }}
          >
            Everything you need
          </p>
          <h2
            className="font-bold leading-tight"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              color: "#111",
              fontFamily: "'Times New Roman', Times, serif",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#5B4FE8" }}>One platform - Multiple solutions</span>
            
          </h2>
          <p className="mt-4 text-sm" style={{ color: "#ABABAB" }}>
            Scroll to explore ↓
          </p>
        </motion.div>
      </div>

      {/* Stack container */}
      <div
        ref={containerRef}
        className="px-4 md:px-8 pb-32"
        style={{ height: `${cards.length * 100}vh` }}
      >
        {cards.map((card, i) => (
          <StackCard
            key={i}
            card={card}
            index={i}
            total={cards.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
