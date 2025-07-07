import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function Dropdown({ label, options, selected, onSelect }: DropdownProps) {
  return (
    <DropdownMenu>
      {/* Button */}
      <DropdownMenuTrigger className="w-full">
        <div className="px-4 py-2 w-full bg-white/10 backdrop-blur-lg text-white border border-white/20 rounded-lg shadow-md flex justify-between items-center hover:bg-white/15 transition-all">
          <div>
            <span className="text-sm text-white/70 font-medium">{label}</span>
            <span className="ml-1 text-white font-semibold">{selected}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-white/80" />
        </div>
      </DropdownMenuTrigger>

      {/* Menu */}
      <DropdownMenuContent className="w-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-lg mt-2 z-50">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onSelect(option)}
            className="px-4 py-2 text-white hover:bg-white/20 rounded-md cursor-pointer text-sm transition-colors"
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
