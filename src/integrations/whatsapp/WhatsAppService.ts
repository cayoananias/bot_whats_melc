export interface IncomingWhatsAppMessage { messageId:string; from:string; text:string; timestamp:Date; }
export interface WhatsAppService { sendText(to:string,text:string):Promise<void>; }
/** Adapter boundary. This console adapter is safe for local testing; configure an official provider separately. */ export class ConsoleWhatsAppService implements WhatsAppService { async sendText(to:string,text:string){ console.log(`[WhatsApp mock -> ${to}]\n${text}`); } } export const whatsApp=new ConsoleWhatsAppService();
