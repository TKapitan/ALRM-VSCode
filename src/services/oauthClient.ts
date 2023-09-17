/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import { env, SecretStorage, Uri, window } from "vscode";

const CLIENT_ID = "d64dcf39-568d-4049-a24e-0f3ac9113dbd"; // XXX configurable?
const SCOPE = [
  "https://api.businesscentral.dynamics.com/Financials.ReadWrite.All",
  "https://api.businesscentral.dynamics.com/user_impersonation",
  "offline_access",
].join(" ");

export async function getAccessToken(
  secretStorage: SecretStorage,
): Promise<string> {
  const { accessToken, expiresAt, refreshToken } =
    await getStoredTokens(secretStorage);

  if (accessToken && expiresAt && Date.now() - expiresAt > 1000 * 60) {
    return accessToken;
  }

  const accessTokenResponse = await fetchAccessToken(refreshToken);

  await storeTokens(secretStorage, {
    accessToken: accessTokenResponse.access_token,
    expiresAt: Date.now() + accessTokenResponse.expires_in * 1000,
    refreshToken: accessTokenResponse.refresh_token,
  });

  return accessTokenResponse.access_token;
}

type Tokens = {
  accessToken: string | undefined;
  expiresAt: number | undefined;
  refreshToken: string | undefined;
};

async function getStoredTokens(secretStorage: SecretStorage): Promise<Tokens> {
  const [accessToken, expiresAt, refreshToken] = await Promise.all([
    secretStorage.get("deviceFlow.accessToken"),
    secretStorage.get("deviceFlow.expiresAt"),
    secretStorage.get("deviceFlow.refreshToken"),
  ]);

  return {
    accessToken,
    expiresAt: expiresAt ? Number(expiresAt) : undefined,
    refreshToken,
  };
}

async function storeTokens(
  secretStorage: SecretStorage,
  { accessToken, expiresAt, refreshToken }: Tokens,
): Promise<void> {
  await Promise.all([
    accessToken
      ? secretStorage.store("deviceFlow.accessToken", accessToken)
      : secretStorage.delete("deviceFlow.accessToken"),
    expiresAt
      ? secretStorage.store("deviceFlow.expiresAt", expiresAt.toString())
      : secretStorage.delete("deviceFlow.expiresAt"),
    refreshToken
      ? secretStorage.store("deviceFlow.refreshToken", refreshToken)
      : secretStorage.delete("deviceFlow.refreshToken"),
  ]);
}

async function fetchAccessToken(
  refreshToken: string | undefined,
): Promise<AccessTokenResponse> {
  if (refreshToken) {
    const response = await tryFetchTokenWithRefreshToken(refreshToken);
    if (response) {
      return response;
    }
  }

  return await authenticateInteractive();
}

type DeviceCodeResponse = {
  user_code: string;
  device_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
  message: string;
};

async function authenticateInteractive(): Promise<AccessTokenResponse> {
  const deviceCode = await fetchDeviceCode();

  const linkOpened = await promptUser(deviceCode);
  if (!linkOpened) {
    throw new Error("Link was not opened.");
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await fetchTokenWithDeviceCode(deviceCode);

    switch (result.status) {
      case "done":
        return result.data;
      case "continue polling":
        break;
      case "stop polling":
        throw new Error(result.reason);
    }

    // wait between polling
    await new Promise((r) => setTimeout(r, deviceCode.interval * 1000));
  }
}

async function fetchDeviceCode(): Promise<DeviceCodeResponse> {
  const response = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/devicecode",
    new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPE,
    }).toString(),
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      validateStatus: (status: number) => status >= 200 && status < 500,
    },
  );

  if (response.status !== 200) {
    throw new Error(
      `Unexpected error response: ${response.status} ${response.statusText}`,
    );
  }

  return response.data as DeviceCodeResponse;
}

async function promptUser(
  deviceCodeResponse: DeviceCodeResponse,
): Promise<boolean> {
  const result = await window.showInformationMessage(
    deviceCodeResponse.message,
    "Open",
  );

  if (result === undefined) {
    return false;
  }

  await env.clipboard.writeText(deviceCodeResponse.user_code);
  env.openExternal(Uri.parse(deviceCodeResponse.verification_uri));

  return true;
}

type AccessTokenResponse = {
  token_type: string;
  scope: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

type FetchTokenResponse =
  | {
      status: "done";
      data: AccessTokenResponse;
    }
  | {
      status: "continue polling";
    }
  | {
      status: "stop polling";
      reason: string;
    };

async function fetchTokenWithDeviceCode({
  device_code,
}: DeviceCodeResponse): Promise<FetchTokenResponse> {
  const response = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code,
    }).toString(),
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      validateStatus: (status: number) => status >= 200 && status < 500,
    },
  );

  if (response.status === 200) {
    return {
      status: "done",
      data: response.data as AccessTokenResponse,
    };
  }

  switch (getErrorCode(response.data)) {
    case "authorization_pending":
      return {
        status: "continue polling",
      };
    case "expired_token":
      return {
        status: "stop polling",
        reason: "Token expired, try again.",
      };
    case "authorization_declined":
      return {
        status: "stop polling",
        reason: "Authentication was declined.",
      };
    default:
      return {
        status: "stop polling",
        reason: `Unexpected error response: ${response.status} ${response.statusText}`,
      };
  }
}

function getErrorCode(responseData: any): string | undefined {
  if (typeof responseData !== "object") {
    return undefined;
  }

  if (!("error" in responseData) || typeof responseData["error"] !== "string") {
    return undefined;
  }

  return responseData["error"];
}

async function tryFetchTokenWithRefreshToken(
  refreshToken: string,
): Promise<AccessTokenResponse | undefined> {
  try {
    return await fetchTokenWithRefreshToken(refreshToken);
  } catch (e) {
    return undefined;
  }
}

async function fetchTokenWithRefreshToken(
  refreshToken: string,
): Promise<AccessTokenResponse> {
  const response = await axios.post(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPE,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      validateStatus: (status: number) => status >= 200 && status < 500,
    },
  );

  if (response.status === 200) {
    return response.data as AccessTokenResponse;
  }

  throw new Error("Unexpected error response");
}
