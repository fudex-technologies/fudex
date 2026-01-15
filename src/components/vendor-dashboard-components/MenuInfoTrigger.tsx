"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function MenuInfoTrigger() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-sm">
            <h3 className="font-bold">Menus and Menu Variants Explained</h3>
            <p className="text-sm">
              This is where you manage your menu. A{" "}
              <span className="font-semibold">Menu Item</span> is a general
              category for a dish, like &quot;Jollof Rice&quot;.
            </p>
            <p className="text-sm mt-2">
              A <span className="font-semibold">Menu Variant</span> is a
              specific version of that dish that customers can order. For
              example, variants for &quot;Jollof Rice&quot; could be &quot;Jollof
              Rice with Chicken&quot; or &quot;Jollof Rice with Beef&quot;.
            </p>
            <p className="text-sm mt-2 font-bold">
              Only Menu Variants are orderable by customers.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}