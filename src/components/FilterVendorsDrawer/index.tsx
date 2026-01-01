'use client';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '../ui/button';
import { PiSlidersHorizontalFill } from "react-icons/pi";
import { useFilterVendorsQueries } from "@/nuqs-hooks/useFilterVendorsQueries";

export default function FilterVendorsDrawer() {
  const [filterQueries, setFilterQueries] = useFilterVendorsQueries()

  const selectedRating = filterQueries.rating

  const handleRatingClick = (rating: string) => {
    setFilterQueries({ rating: rating === selectedRating ? "" : rating })
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <PiSlidersHorizontalFill />
          Filter
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pb-10 pt-5">
        <DrawerHeader className="border-b py-2">
          <DrawerTitle className="text-lg font-semibold text-start ">Filter Vendors</DrawerTitle>
          <DrawerDescription className="text-sm text-start">Filter vendors by rating and delivery fee</DrawerDescription>
        </DrawerHeader>
        <div className="my-3 w-full px-5">
          <div className="w-full space-y-2">
            <p className="font-medium text-start">Rating</p>
            <div className="w-full flex justify-between gap-3">
              <Button
                variant={selectedRating === "4.5+" ? "default" : 'muted'}
                className="w-full flex-1 py-6"
                onClick={() => handleRatingClick("4.5+")}>
                4.5+
              </Button>
              <Button
                variant={selectedRating === "4.0+" ? "default" : 'muted'}
                className="w-full flex-1 py-6"
                onClick={() => handleRatingClick("4.0+")}>
                4.0+
              </Button>
              <Button
                variant={selectedRating === "3.5+" ? "default" : 'muted'}
                className="w-full flex-1 py-6"
                onClick={() => handleRatingClick("3.5+")}>
                3.5+
              </Button>
              <Button
                variant={selectedRating === "2.0+" ? "default" : 'muted'}
                className="w-full flex-1 py-6"
                onClick={() => handleRatingClick("2.0+")}>
                2.0+
              </Button>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button variant={'default'} className="w-full">
            Apply
          </Button>
          <DrawerClose asChild>
            <Button variant={'outline'}>
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}