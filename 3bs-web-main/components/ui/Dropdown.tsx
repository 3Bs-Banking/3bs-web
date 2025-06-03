import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export function Dropdown({ label, options, selected, onSelect }: DropdownProps) {
  return (
    <DropdownMenu>
      {/* Dropdown button with label and icon */}
      <DropdownMenuTrigger className="px-4 py-2 bg-white border rounded-md shadow-sm text-left w-full flex justify-between items-center">
        <div>
          <span className="text-gray-700 font-medium">{label} </span>
          <span className="ml-1 text-gray-900">{selected}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </DropdownMenuTrigger>

      {/* Dropdown menu items */}
      <DropdownMenuContent className="w-48 bg-white border rounded-md shadow-lg">
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => onSelect(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
