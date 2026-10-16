import { runWhatsAppFlow } from "./runFlow";

export async function handleWhatsAppTextMessage(props) {
  return runWhatsAppFlow(props);
}
