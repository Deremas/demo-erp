"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  name,
}: MultiSelectProps) {
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <>
      <input type="hidden" name={name} value={selected.join(",")} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between h-11 px-3 py-2 font-normal hover:bg-transparent rounded-[1rem]",
              className
            )}
          >
            <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-[13px] font-bold text-foreground">
              {selected.length === 0 && (
                <span className="text-muted-foreground font-normal">{placeholder}</span>
              )}
              {selected.length === 1 && (
                <span className="truncate block max-w-[180px]">
                  {options.find((o) => o.value === selected[0])?.label}
                </span>
              )}
              {selected.length > 1 && (
                <Badge variant="secondary" className="font-bold text-[10px] uppercase bg-primary/10 text-primary hover:bg-primary/20 border-none">
                  {selected.length} Selected
                </Badge>
              )}
            </div>
            <div className="flex items-center shrink-0 opacity-50">
              {selected.length > 0 && (
                <X
                  className="mr-2 h-4 w-4 cursor-pointer hover:opacity-100"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px] max-h-[300px] overflow-y-auto" align="start" side="bottom">
          {selected.length > 0 && (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleClear(e as any);
                }}
                className="justify-center text-xs font-medium text-muted-foreground focus:bg-muted focus:text-foreground cursor-pointer py-2"
              >
                Clear all
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleSelect(option.value)}
              onSelect={(e) => e.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}