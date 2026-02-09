import axios from "axios";

const BASE_URL = process.env.PATHAO_BASE_URL;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getPathaoToken() {
  // reuse token if still valid
  if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
    return accessToken;
  }

  const res = await axios.post(
    `${BASE_URL}/aladdin/api/v1/issue-token`,
    {
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_USERNAME,
      password: process.env.PATHAO_PASSWORD,
      grant_type: "password",
    },
  );

  accessToken = res.data.access_token;
  tokenExpiry = Date.now() + res.data.expires_in * 1000;

  return accessToken;
}

export async function pathaoRequest() {
  const token = await getPathaoToken();

  return axios.create({
    baseURL: BASE_URL!,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
