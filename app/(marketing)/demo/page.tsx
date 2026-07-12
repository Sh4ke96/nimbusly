import { DemoPage } from "@/components/demo/demo-page";
import { getServerT } from "@/lib/i18n/server";

export const dynamic = "force-static";

export async function generateMetadata() {
  const t = await getServerT();
  return {
    title: t.demo.metaTitle,
    description: t.demo.metaDescription,
  };
}

export default function MarketingDemoPage() {
  return <DemoPage />;
}
