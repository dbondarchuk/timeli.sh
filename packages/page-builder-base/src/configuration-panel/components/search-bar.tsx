import { useI18n } from "@vivid/i18n";
import { Button, Input } from "@vivid/ui";
import { Plus, Search, X } from "lucide-react";
import {
  BaseStyleDictionary,
  StyleDefinition,
  StyleDictionary,
} from "../../style/types";
import { AddStyleButton } from "./add-style-button";

interface SearchBarProps<T extends BaseStyleDictionary> {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  availableStyles: StyleDictionary<T>;
  onAddStyle: (style: StyleDefinition<T[keyof T]>) => void;
}

export const SearchBar = <T extends BaseStyleDictionary>({
  searchTerm,
  onSearchChange,
  availableStyles,
  onAddStyle,
}: SearchBarProps<T>) => {
  const t = useI18n("builder");

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-[1]"
          size={16}
        />
        <Input
          type="text"
          placeholder={t("pageBuilder.styles.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onSearchChange("")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
        >
          <X className="size-4" />
        </Button>
      </div>
      <AddStyleButton availableStyles={availableStyles} onAddStyle={onAddStyle}>
        <Button variant="ghost" size="xs">
          <Plus size={16} />
        </Button>
      </AddStyleButton>
    </div>
  );
};
