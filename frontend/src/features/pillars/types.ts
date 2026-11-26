export interface HaradaActionItem {
  id: string;
  slotIndex?: number;
  title: string;
  xpReward: number;
  completedToday: boolean;
}

export interface HaradaPillarItem {
  id?: string;
  slotIndex: number;
  title: string;
  statCode: string;
  statLevel: number;
  statXp?: number;
  litToday?: boolean;
  actions: HaradaActionItem[];
}
