/** Not koleksiyonlarının klasör renkleri (sırayla dağıtılır). */
export const FOLDER_COLORS = ['blue', 'yellow', 'green', 'purple', 'pink', 'orange'] as const;
export type FolderColor = (typeof FOLDER_COLORS)[number];

export function folderColor(index: number): FolderColor {
  return FOLDER_COLORS[index % FOLDER_COLORS.length] ?? 'blue';
}
