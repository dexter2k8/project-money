type TClassifiedError = {
  status: number;
  message: string;
};

type TFirebaseLikeError = Error & {
  code?: string | number;
  httpResponse?: { status?: number };
};

function hasCode(error: unknown): error is TFirebaseLikeError {
  return error instanceof Error && "code" in error;
}

export function classifyError(error: unknown): TClassifiedError {
  if (hasCode(error)) {
    const code = error.code;

    if (typeof code === "string") {
      if (code === "auth/quota-exceeded" || code === "auth/too-many-requests") {
        return { status: 429, message: "Cota do Firebase excedida. Tente novamente mais tarde." };
      }
      if (code === "auth/id-token-expired" || code === "auth/id-token-revoked") {
        return { status: 401, message: "Sessão expirada. Faça login novamente." };
      }
      if (code === "auth/invalid-id-token" || code === "auth/invalid-credential") {
        return { status: 401, message: "Credenciais inválidas." };
      }
      if (code === "auth/insufficient-permission") {
        return { status: 403, message: "Sem permissão para esta operação." };
      }
      if (code === "auth/user-not-found") {
        return { status: 404, message: "Usuário não encontrado." };
      }
      return { status: 500, message: "Erro no serviço de autenticação." };
    }

    if (typeof code === "number") {
      switch (code) {
        case 7:
          return { status: 403, message: "Sem permissão para acessar os dados." };
        case 5:
          return { status: 404, message: "Recurso não encontrado." };
        case 6:
          return { status: 409, message: "Recurso já existe." };
        case 8:
          return { status: 429, message: "Cota do Firebase excedida. Tente novamente mais tarde." };
        case 14:
          return { status: 503, message: "Serviço temporariamente indisponível." };
        case 16:
          return { status: 401, message: "Não autenticado." };
        default:
          return { status: 500, message: "Erro interno no servidor." };
      }
    }
  }

  return { status: 500, message: "Erro interno no servidor." };
}
