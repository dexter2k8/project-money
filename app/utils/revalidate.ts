import { mutate } from "swr";
import { API } from "@/app/utils/paths";

/**
 * Invalida os caches SWR que dependem de transações/saldos:
 * - saldos do dashboard (mês selecionado), do analytics (2 anos) e do settings (flatten);
 * - anos/meses disponíveis no seletor;
 * - transações carregadas.
 *
 * `?fields=metadata` (lista de contas) é ignorado de propósito: o `mutate` com
 * filtro varre todas as chaves em cache do SWR, então um `startsWith` genérico
 * disparava `get-balances?fields=metadata` a cada importação/edição — uma
 * leitura desnecessária no Firestore, já que contas não mudam quando
 * transações ou saldos mudam.
 *
 * Nota: apenas as queries montadas disparam uma nova chamada de rede; as demais
 * apenas perdem o marcador de dedupe.
 */
export function revalidateAfterTransactionChange(accountId: string): Promise<unknown> {
  return Promise.all([
    mutate(
      (key: string) =>
        typeof key === "string" &&
        key.startsWith(API.BALANCES.GET_BALANCES) &&
        !key.includes("fields=metadata"),
    ),
    mutate(`${API.BALANCES.GET_YEARS}?accountId=${accountId}`),
    mutate(
      (key: string) =>
        typeof key === "string" && key.startsWith(API.TRANSACTIONS.GET_TRANSACTIONS),
    ),
  ]);
}
