// Paper & Pulse Emotion Design System Tokens & Mappings

export const EMOTIONS = {
  joy: {
    label: "Joy",
    bg: "#DDF6EC",
    text: "#16856B",
    border: "#B4EBD5",
    barColor: "#16856B",
    description: "Positive sentiment, happiness, satisfaction, delight"
  },
  sadness: {
    label: "Sadness",
    bg: "#EAF1FF",
    text: "#2457D6",
    border: "#C8DCFF",
    barColor: "#2457D6",
    description: "Disappointment, gloom, sorrow, regret"
  },
  anger: {
    label: "Anger",
    bg: "#FCE8ED",
    text: "#C9475B",
    border: "#F7C4CE",
    barColor: "#C9475B",
    description: "Frustration, outrage, irritation, annoyance"
  },
  fear: {
    label: "Fear",
    bg: "#F0ECFF",
    text: "#7C5CBF",
    border: "#DCD0FF",
    barColor: "#7C5CBF",
    description: "Anxiety, worry, apprehension, uncertainty"
  },
  surprise: {
    label: "Surprise",
    bg: "#FFF0E3",
    text: "#B96B26",
    border: "#FEDCC0",
    barColor: "#B96B26",
    description: "Unexpected novelty, amazement, sudden realization"
  },
  love: {
    label: "Love",
    bg: "#FDE8F1",
    text: "#D84080",
    border: "#FAC2D9",
    barColor: "#D84080",
    description: "Affection, deep appreciation, warmth"
  },
  neutral: {
    label: "Neutral",
    bg: "#F1F4F8",
    text: "#5A687D",
    border: "#DCE2EB",
    barColor: "#5A687D",
    description: "Objective statement, balanced, factual tone"
  },
  disgust: {
    label: "Disgust",
    bg: "#F3F5E3",
    text: "#6C7728",
    border: "#DFE4B8",
    barColor: "#6C7728",
    description: "Revulsion, strong distaste, unpleasant reaction"
  }
};

const DEFAULT_EMOTION = {
  label: "Neutral",
  bg: "#F1F4F8",
  text: "#5A687D",
  border: "#DCE2EB",
  barColor: "#5A687D",
  description: "Unclassified emotional state"
};

export function getEmotionConfig(emotion) {
  if (!emotion) return DEFAULT_EMOTION;
  const key = String(emotion).toLowerCase().trim();
  return EMOTIONS[key] || {
    ...DEFAULT_EMOTION,
    label: key.charAt(0).toUpperCase() + key.slice(1)
  };
}

export function formatPercentage(val) {
  if (val === null || val === undefined) return "0%";
  return `${Math.round(val * 100)}%`;
}
