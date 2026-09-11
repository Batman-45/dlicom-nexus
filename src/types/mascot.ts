/**
 * Dlicom Mascot Generator — Core Type Definitions
 *
 * Strictly enforces:
 * - Immutable Dlicom mascot character integrity
 * - 12 authentic Web3/protocol mascot families
 * - 3 distinct visual variants per family (36 unique characters)
 * - Deterministic repeatability from public X signals
 * - Zero fabricated data and zero generic "Official" wording
 */

export type MascotArchetype =
  | 'PROTOCOL_DEVELOPER'
  | 'AEGIS_SENTINEL'
  | 'SYSTEM_ARCHITECT'
  | 'NEXUS_AMBASSADOR'
  | 'DATA_WEAVER'
  | 'LUMINARY_CREATOR'
  | 'FRONTIER_PIONEER';

export type MascotFamilyId =
  | 'PROTOCOL_CORE'
  | 'AEGIS_DEFENSE'
  | 'SYSTEM_FOUNDRY'
  | 'NEXUS_SYNDICATE'
  | 'CHRONO_RESEARCH'
  | 'CREATIVE_STUDIO'
  | 'FRONTIER_EXPEDITION'
  | 'DEFI_QUANT'
  | 'ZERO_KNOWLEDGE'
  | 'GAMEFI_ARCADE'
  | 'AI_SYNTHESIS'
  | 'DAO_GOVERNANCE';

export type DlicomHeroPillar =
  | 'DLICOM_HERO_CORE'
  | 'DLICOM_HERO_POWER'
  | 'DLICOM_HERO_MOTION'
  | 'DLICOM_HERO_SPECIAL';

export interface MascotColorTheme {
  primary: string;
  secondary: string;
  glow: string;
  badgeBg: string;
  border: string;
  text: string;
  accent: string;
}

export interface MascotVisualVariantInfo {
  variantId: string;
  variantName: string;
  variantBadge: string;
  characterImage: string;
  heroTitle?: string;
  heroPillar?: DlicomHeroPillar;
  heroConcept?: string;
  outfit: string;
  equipment: string;
  accessory: string;
  expression: string;
  environment: string;
  pose: string;
  auraEffect: string;
  silhouetteDescription: string;
}

export interface MascotFamilyDefinition {
  familyId: MascotFamilyId;
  familyName: string;
  archetype: MascotArchetype;
  familyMotto: string;
  temperament: string;
  coreDiscipline: string;
  colorTheme: MascotColorTheme;
  variants: MascotVisualVariantInfo[];
}

export interface MascotVisualAttributes {
  outfit: string;
  equipment: string;
  accessory: string;
  expression: string;
  environment: string;
  pose: string;
  auraEffect: string;
  colorTheme: MascotColorTheme;
  characterImage: string;
}

export interface MascotPersonality {
  temperament: string;
  motto: string;
  coreDiscipline: string;
  specialtySkill: string;
}

export interface PublicXSignals {
  username: string;
  displayName: string;
  bio: string;
  accountAgeDays?: number;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
  profileImageUrl?: string;
  sourceType: 'LIVE_X_PUBLIC' | 'CACHED_X_PUBLIC' | 'USER_CONFIRMED_FALLBACK';
  detectedKeywords: string[];
  inferredFocus: string;
}

export interface MascotVariant {
  mascotId: string;
  username: string;
  displayName: string;
  archetype: MascotArchetype;
  archetypeLabel: string;
  familyId: MascotFamilyId;
  familyName: string;
  variantId: string;
  variantName: string;
  heroTitle: string;
  heroPillar: DlicomHeroPillar;
  heroConcept: string;
  title: string;
  badgeName: string;
  visual: MascotVisualAttributes;
  personality: MascotPersonality;
  signals: PublicXSignals;
  cryptographicSeed: {
    hash: number;
    hexSeed: string;
    algorithm: 'FNV-1a';
    derivationSummary: string;
  };
  generatedAt: string;
}

export interface MascotGenerationRequest {
  username: string;
  userConfirmedFocus?: string;
}

export type GenerationStep =
  | 'IDLE'
  | 'VALIDATING_USERNAME'
  | 'FETCHING_PUBLIC_PROFILE'
  | 'DERIVING_SIGNALS'
  | 'SYNTHESIZING_MASCOT'
  | 'COMPLETE'
  | 'FALLBACK_REQUIRED'
  | 'ERROR';
