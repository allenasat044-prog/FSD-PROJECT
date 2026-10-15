import { Faq } from "../models/Faq.js";

const faqs = [
  ["Is my camera feed or file uploaded anywhere?", "No. Every frame is converted on your device with the Canvas API. Only art you choose to save is sent to the server."],
  ["Why won't my camera start?", "Camera access needs a secure context (https or localhost) and your permission. If it is blocked, use the Video or Image tabs instead."],
  ["Which files can I convert?", "Any video your browser can play, and images such as JPG, PNG, GIF, WEBP, BMP, SVG and AVIF, depending on browser support."],
  ["How do I get sharper results?", "Raise the resolution (up to 500 columns). Live sources tune their resolution automatically to stay smooth; still images render at the full detail you ask for."],
  ["What do the display modes do?", "Phosphor green and amber give a classic terminal look. True color tints each character with the original pixel color."],
  ["What formats can I export?", "PNG, JPG, WEBP and SVG images, or plain TXT. You can also copy the text, or save the art to your gallery."],
  ["Who can see my saved art?", "Only you, unless you tick Public when saving. Public art appears in the shared gallery."],
];

export async function seedFaqs() {
  if (await Faq.countDocuments()) return;
  await Faq.insertMany(faqs.map(([question, answer], order) => ({ question, answer, order })));
  console.log("Seeded FAQs");
}
