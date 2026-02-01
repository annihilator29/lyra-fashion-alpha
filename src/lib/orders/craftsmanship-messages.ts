/**
 * Craftsmanship Messages Configuration
 * Story 6.3 - Production Status Communication (AC-5)
 * 
 * Stage-specific messaging that emphasizes care and craftsmanship
 * to reinforce the factory-direct value proposition.
 */

export type ProductionStageName = 'cutting' | 'sewing' | 'finishing' | 'qc';

export interface CraftsmanshipMessage {
  text: string;
  stage: ProductionStageName;
}

export const craftsmanshipMessages: Record<ProductionStageName, string[]> = {
  cutting: [
    "Your fabric is being carefully measured and cut by skilled hands.",
    "Precision cutting ensures your garment will have perfect proportions.",
    "Every piece is cut with attention to grain and pattern matching.",
    "Our cutters select the best sections of fabric for your garment.",
    "Traditional cutting techniques meet modern precision in our workshop."
  ],
  sewing: [
    "Your dress is being carefully sewn by our artisans with years of experience.",
    "Expert hands guide every stitch for durability and beauty.",
    "Traditional techniques meet modern precision in our workshop.",
    "Each seam is carefully constructed to last for years.",
    "Our seamstresses bring decades of expertise to your garment."
  ],
  finishing: [
    "Final touches are being added to ensure your garment is flawless.",
    "Hemming, pressing, and detailing - the finishing stage matters.",
    "Quality finishing transforms fabric into a garment you'll treasure.",
    "Every thread is trimmed, every detail perfected.",
    "The finishing touches make all the difference in craftsmanship."
  ],
  qc: [
    "Quality checks ensure every stitch meets our exacting standards.",
    "Your garment is being inspected for perfection before shipping.",
    "Only pieces that pass our rigorous QC reach our customers.",
    "We check every detail so you receive perfection.",
    "Our quality team ensures your garment meets our high standards."
  ]
};

/**
 * Get a random craftsmanship message for a given stage
 * Supports message rotation/variation for freshness (Subtask 5.5)
 */
export function getCraftsmanshipMessage(stage: ProductionStageName): string {
  const messages = craftsmanshipMessages[stage];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Get all messages for a stage (useful for testing or displaying options)
 */
export function getCraftsmanshipMessages(stage: ProductionStageName): string[] {
  return craftsmanshipMessages[stage];
}

/**
 * Get the current active stage from production stages
 */
export function getCurrentStage(stages: Record<ProductionStageName, { status: string }>): ProductionStageName | null {
  const stageOrder: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];
  
  for (const stage of stageOrder) {
    if (stages[stage]?.status === 'in_progress') {
      return stage;
    }
  }
  
  // If no stage is in_progress, return the last completed stage or null
  for (let i = stageOrder.length - 1; i >= 0; i--) {
    if (stages[stageOrder[i]]?.status === 'completed') {
      return stageOrder[i];
    }
  }
  
  return null;
}

/**
 * Get the next pending stage
 */
export function getNextStage(stages: Record<ProductionStageName, { status: string }>): ProductionStageName | null {
  const stageOrder: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];
  
  for (const stage of stageOrder) {
    if (stages[stage]?.status === 'not_started') {
      return stage;
    }
  }
  
  return null;
}
