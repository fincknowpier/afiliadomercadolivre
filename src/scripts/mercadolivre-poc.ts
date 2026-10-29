import 'reflect-metadata';
import axios, { AxiosError } from 'axios';

async function main() {
  const token = process.env.ML_ACCESS_TOKEN;
  if (!token) {
    console.error('BLOQUEADO: defina ML_ACCESS_TOKEN obtido via OAuth 2.0 oficial.');
    process.exitCode = 2;
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  try {
    const me = await axios.get('https://api.mercadolibre.com/users/me', { headers });
    const search = await axios.get('https://api.mercadolibre.com/sites/MLB/search', {
      headers,
      params: { q: 'notebook', limit: 3 },
    });
    console.log(JSON.stringify({
      status: 'VALIDADO',
      user: { id: me.data.id, nickname: me.data.nickname },
      sample: search.data.results.map((item: Record<string, unknown>) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.original_price,
      })),
    }, null, 2));
  } catch (error) {
    const err = error as AxiosError;
    console.error(JSON.stringify({
      status: 'FALHOU',
      httpStatus: err.response?.status,
      response: err.response?.data,
      message: err.message,
    }, null, 2));
    process.exitCode = 1;
  }
}
void main();
