
export async function request<P, R>(method: string, params: P): Promise<R> {
  const response = await fetch(`/api/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const responseJson: R = await response.json();
  return responseJson;
}

