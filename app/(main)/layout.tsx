import { ChatLayoutWrapper } from "@/components/chat-layout-wrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatLayoutWrapper>{children}</ChatLayoutWrapper>;
}
