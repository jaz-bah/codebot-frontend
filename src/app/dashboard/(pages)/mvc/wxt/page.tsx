import { MvcSheet } from "@/components/dashboard/mvc/mvc-sheet";
import { MVC_FRAMEWORKS } from "@/constants/mvc";

export default function WxtMvcPage() {
  return <MvcSheet framework={MVC_FRAMEWORKS.wxt} />;
}
