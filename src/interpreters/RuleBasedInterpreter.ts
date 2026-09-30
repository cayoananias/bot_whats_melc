import { Draft } from '../types/finance'; import { MessageInterpreter } from './MessageInterpreter';
const normalize=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export class RuleBasedInterpreter implements MessageInterpreter {
 interpret(input:string, now=new Date()):Draft { const text=normalize(input.trim()); const draft:Draft={ description:input.trim() };
  if (/^\/entrada\b|\b(entrada|recebi|frete)\b/.test(text)) draft.type='INCOME'; if (/^\/saida\b|\b(saida|paguei|pagamento|despesa)\b/.test(text)) draft.type='EXPENSE';
  if (/(?:r\$\s*)?-\s*\d/.test(text)) throw new Error('Valores negativos não são permitidos.'); const amount=text.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/); if(amount) draft.amount=Number(amount[1].replace(/\./g,'').replace(',','.'));
  const vehicle=text.match(/(?:caminhao|veiculo)\s*(?:n[ºo.]?\s*)?(\d+[\w-]*)/); if(vehicle) draft.vehicleCode=vehicle[1];
  const map:Record<string,string>={diesel:'Combustível',combustivel:'Combustível',manutencao:'Manutenção',pedagio:'Pedágio',salario:'Salários',imposto:'Impostos',seguro:'Seguros',frete:'Frete',reembolso:'Reembolso',servico:'Serviço'}; for(const [key,value] of Object.entries(map)) if(text.includes(key)) { draft.category=value; break; }
  if(/\bhoje\b/.test(text)) draft.date=now.toISOString().slice(0,10); const client=text.match(/(?:cliente)\s+([\w .-]+)/); if(client) draft.customer=client[1].trim(); const supplier=text.match(/(?:fornecedor)\s+([\w .-]+)/); if(supplier) draft.supplier=supplier[1].trim(); return draft;
 }
}
