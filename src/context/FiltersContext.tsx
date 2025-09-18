import { createContext } from "react";
export type FiltersContextType = {
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  platform: string;
  setPlatform: React.Dispatch<React.SetStateAction<string>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};
export const FiltersContext = createContext<FiltersContextType | null>(null);
