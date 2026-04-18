// O APP_TOKEN é exposto apenas via NEXT_PUBLIC para o client poder se autenticar.
// Como é single-user e o token é pessoal, isso é aceitável.
export function getApiHeaders(): Record<string, string> {
  const token = process.env.NEXT_PUBLIC_APP_TOKEN ?? "";
  return { "x-api-token": token };
}
