import React, { useState } from "react";
import { View } from "react-native";

import { SectionHeader } from "./SectionHeader";

interface CollapsibleListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  collapsedCount?: number;
  seeAllLabel?: (total: number) => string;
  seeLessLabel?: string;
  emptyState?: React.ReactNode;
}

export function CollapsibleList<T>({
  items,
  renderItem,
  keyExtractor,
  collapsedCount = 3,
  seeAllLabel = (total) => `Ver todas (${total})`,
  seeLessLabel = "Ver menos",
  emptyState,
}: CollapsibleListProps<T>) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return <>{emptyState ?? null}</>;

  const visible = expanded ? items : items.slice(0, collapsedCount);
  const canToggle = items.length > collapsedCount;

  return (
    <View>
      {visible.map((item) => (
        <View key={keyExtractor(item)}>{renderItem(item)}</View>
      ))}
      {canToggle ? (
        <SectionHeader
          title=""
          compact
          actionLabel={expanded ? seeLessLabel : seeAllLabel(items.length)}
          onAction={() => setExpanded((v) => !v)}
        />
      ) : null}
    </View>
  );
}
