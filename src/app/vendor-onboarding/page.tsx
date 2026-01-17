import { PAGES_DATA } from "@/data/pagesData";
import { redirect } from "next/navigation";

export default function VendorOnboardingPage(){
    redirect(PAGES_DATA.vendor_onboarding_step_one_page)
}