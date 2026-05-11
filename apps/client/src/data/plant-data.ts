export interface PlantAnalysisResult {
  name: string;
  scientificName: string;
  confidence: number;
  family: string;
  description: string;
  careLevel: 'Easy' | 'Moderate' | 'Expert';
  sunlight: string;
  watering: string;
  temperature: string;
  humidity: string;
  toxicity: string;
  commonIssues: string[];
  funFacts: string[];
}

export const sampleResults: Record<string, PlantAnalysisResult> = {
  monstera: {
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    confidence: 96.4,
    family: 'Araceae',
    description:
      'The Swiss Cheese Plant is a popular tropical houseplant known for its large, glossy leaves with natural holes called fenestrations. Native to Central American rainforests, it has become one of the most recognizable indoor plants worldwide.',
    careLevel: 'Easy',
    sunlight: 'Bright indirect light. Tolerates medium light but grows slower.',
    watering: 'Water when top 2-3 inches of soil are dry. Roughly every 1-2 weeks.',
    temperature: '65-85F (18-30C). Avoid temperatures below 50F.',
    humidity: 'Prefers 60%+ humidity. Mist regularly or use a humidifier.',
    toxicity: 'Toxic to cats and dogs. Contains calcium oxalate crystals.',
    commonIssues: [
      'Yellow leaves -- overwatering or poor drainage',
      'Brown leaf edges -- low humidity or underwatering',
      'No fenestrations -- insufficient light for mature growth',
      'Leggy growth -- needs more bright indirect light',
    ],
    funFacts: [
      'The holes in its leaves are thought to help the plant withstand heavy tropical rainfall.',
      'In the wild, Monstera can grow over 60 feet tall.',
      'The fruit is edible when fully ripe and tastes like a mix of pineapple and banana.',
    ],
  },
  succulent: {
    name: 'Echeveria Elegans',
    scientificName: 'Echeveria elegans',
    confidence: 91.2,
    family: 'Crassulaceae',
    description:
      'Known as the Mexican Snowball, this rosette-forming succulent features pale blue-green leaves with pink-tinged edges. It is one of the most widely cultivated Echeveria species, prized for its symmetrical form and drought tolerance.',
    careLevel: 'Easy',
    sunlight: 'Full sun to bright indirect light. At least 4-6 hours of direct sun.',
    watering: 'Soak and dry method. Water thoroughly, then let soil dry completely.',
    temperature: '50-80F (10-27C). Protect from frost.',
    humidity: 'Low humidity preferred. Good air circulation is important.',
    toxicity: 'Non-toxic to cats and dogs.',
    commonIssues: [
      'Stretching (etiolation) -- not enough sunlight',
      'Mushy leaves -- overwatering or root rot',
      'Leaf drop -- sudden temperature changes or overwatering',
      'Mealybugs -- check leaf bases regularly',
    ],
    funFacts: [
      'Echeveria are named after 18th-century Mexican botanical artist Atanasio Echeverria.',
      'They produce offsets called "chicks" that can be propagated easily.',
      'The powdery coating on the leaves (farina) protects them from sunburn.',
    ],
  },
  fern: {
    name: 'Boston Fern',
    scientificName: 'Nephrolepis exaltata',
    confidence: 88.7,
    family: 'Nephrolepidaceae',
    description:
      'The Boston Fern is a lush, graceful houseplant with arching fronds that can reach 2-3 feet long. It has been a popular indoor plant since the Victorian era and is excellent for hanging baskets and humid environments.',
    careLevel: 'Moderate',
    sunlight: 'Bright indirect light. No direct sun which can scorch fronds.',
    watering: 'Keep soil consistently moist but not waterlogged. Water when surface feels dry.',
    temperature: '60-75F (16-24C). Sensitive to cold drafts.',
    humidity: 'High humidity essential (80%+). Mist daily or use a pebble tray.',
    toxicity: 'Non-toxic to cats and dogs. Safe for households with pets.',
    commonIssues: [
      'Brown, crispy fronds -- low humidity or underwatering',
      'Yellowing fronds -- overwatering or too much direct sun',
      'Leaf drop -- dry air, drafts, or inconsistent watering',
      'Small fronds -- insufficient light or nutrients',
    ],
    funFacts: [
      'Boston Ferns are one of the best air-purifying plants according to NASA studies.',
      'They can live for decades with proper care.',
      'Ferns are some of the oldest plants on Earth, dating back over 360 million years.',
    ],
  },
};
