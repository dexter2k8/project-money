import useSWRCore from "swr";
import type { KeyedMutator, SWRConfiguration } from "swr";

interface IResponse<T> {
  response: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: KeyedMutator<T>;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
  return response.json();
};

export function useSWR<T extends object, P extends Record<string, string> = Record<string, string>>(
  key?: string,
  params?: P,
  config?: SWRConfiguration,
): IResponse<T> {
  const fullURL = params && Object.keys(params).length > 0 ? `${key}?${new URLSearchParams(params)}` : key;

  const { data: response, error, isLoading, mutate } = useSWRCore<T>(fullURL ?? null, fetcher, {
    revalidateOnFocus: false,
    ...config,
  });

  return { response, error, isLoading, mutate };
}
