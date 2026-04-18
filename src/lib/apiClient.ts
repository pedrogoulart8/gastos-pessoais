// Em produção privada, o token vive num cookie httpOnly (definido pelo login)
// e é enviado automaticamente pelo navegador. Esta função só retorna o header
// se NEXT_PUBLIC_APP_TOKEN estiver definido (modo dev ou single-user legacy).
export function getApiHeaders(): Record<string, string> {
  const token = process.env.NEXT_PUBLIC_APP_TOKEN;
  if (!token) return {};
  return { "x-api-token": token };
}
