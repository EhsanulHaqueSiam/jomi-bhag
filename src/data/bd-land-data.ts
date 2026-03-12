import type { Division, PropertyType, ConstructionType, Condition } from '@/core/land/types'

export const BD_DIVISIONS = [
  { value: 'dhaka' as Division, label: 'Dhaka', bangla: '\u09A2\u09BE\u0995\u09BE' },
  { value: 'chittagong' as Division, label: 'Chittagong', bangla: '\u099A\u099F\u09CD\u099F\u0997\u09CD\u09B0\u09BE\u09AE' },
  { value: 'rajshahi' as Division, label: 'Rajshahi', bangla: '\u09B0\u09BE\u099C\u09B6\u09BE\u09B9\u09C0' },
  { value: 'khulna' as Division, label: 'Khulna', bangla: '\u0996\u09C1\u09B2\u09A8\u09BE' },
  { value: 'barisal' as Division, label: 'Barisal', bangla: '\u09AC\u09B0\u09BF\u09B6\u09BE\u09B2' },
  { value: 'sylhet' as Division, label: 'Sylhet', bangla: '\u09B8\u09BF\u09B2\u09C7\u099F' },
  { value: 'rangpur' as Division, label: 'Rangpur', bangla: '\u09B0\u0982\u09AA\u09C1\u09B0' },
  { value: 'mymensingh' as Division, label: 'Mymensingh', bangla: '\u09AE\u09DF\u09AE\u09A8\u09B8\u09BF\u0982\u09B9' },
] as const

export const PROPERTY_TYPES = [
  { value: 'agricultural' as PropertyType, label: 'Agricultural', icon: '\uD83C\uDF3E' },
  { value: 'residential' as PropertyType, label: 'Residential', icon: '\uD83C\uDFE0' },
  { value: 'commercial' as PropertyType, label: 'Commercial', icon: '\uD83C\uDFE2' },
  { value: 'mixed' as PropertyType, label: 'Mixed', icon: '\uD83C\uDFD8\uFE0F' },
] as const

export const CONSTRUCTION_TYPES = [
  { value: 'brick' as ConstructionType, label: 'Brick (Pucca)' },
  { value: 'tin' as ConstructionType, label: 'Tin Shed' },
  { value: 'mud' as ConstructionType, label: 'Mud/Kacha' },
  { value: 'semi_pucca' as ConstructionType, label: 'Semi-Pucca' },
] as const

export const CONDITION_OPTIONS = [
  { value: 'good' as Condition, label: 'Good' },
  { value: 'fair' as Condition, label: 'Fair' },
  { value: 'poor' as Condition, label: 'Poor' },
] as const

export const TREE_SPECIES = [
  { value: 'mango', label: 'Mango (\u0986\u09AE)' },
  { value: 'jackfruit', label: 'Jackfruit (\u0995\u09BE\u0981\u09A0\u09BE\u09B2)' },
  { value: 'coconut', label: 'Coconut (\u09A8\u09BE\u09B0\u09BF\u0995\u09C7\u09B2)' },
  { value: 'bamboo', label: 'Bamboo (\u09AC\u09BE\u0981\u09B6)' },
  { value: 'betelnut', label: 'Betelnut (\u09B8\u09C1\u09AA\u09BE\u09B0\u09BF)' },
  { value: 'litchi', label: 'Litchi (\u09B2\u09BF\u099A\u09C1)' },
  { value: 'guava', label: 'Guava (\u09AA\u09C7\u09DF\u09BE\u09B0\u09BE)' },
  { value: 'banana', label: 'Banana (\u0995\u09B2\u09BE)' },
  { value: 'teak', label: 'Teak (\u09B8\u09C7\u0997\u09C1\u09A8)' },
  { value: 'mahogany', label: 'Mahogany (\u09AE\u09C7\u09B9\u0997\u09A8\u09BF)' },
  { value: 'other', label: 'Other' },
] as const
