import { MvcSheet } from "@/components/dashboard/mvc/mvc-sheet";
import { MVC_FRAMEWORKS } from "@/constants/mvc";

export default function NestjsMvcPage() {
  return <MvcSheet framework={MVC_FRAMEWORKS.nestjs} />;
}
