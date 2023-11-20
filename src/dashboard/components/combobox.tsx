"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface IComboboxProps {
    value?: string;
    data?: {
        value: string;
        label: string;
    }[];
    placeholder?: string;
    onSelected?: (data: string) => void;
}

export function Combobox({
    value,
    data,
    placeholder,
    onSelected,
}: IComboboxProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? data?.find((one_data) => one_data.value === value)
                              ?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    {/* <CommandEmpty>No framework found.</CommandEmpty> */}
                    <CommandGroup>
                        {data?.map((one_data) => (
                            <CommandItem
                                autoCapitalize="no"
                                key={one_data.value}
                                value={one_data.label}
                                onSelect={(currentValue) => {
                                    if (onSelected) {
                                        onSelected(
                                            one_data.value === value
                                                ? ""
                                                : one_data.value
                                        );
                                    }
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === one_data.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                                {one_data.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
