export function readNodeEnv(): string | undefined {
  return process.env.NODE_ENV;
}

export function isProductionNodeEnv(env: string | undefined = readNodeEnv()): boolean {
  return env === "production";
}

export function allowsPushEndpointProtocol(protocol: string, isProduction: boolean): boolean {
  if (protocol === "https:") {
    return true;
  }

  if (!isProduction && protocol === "http:") {
    return true;
  }

  return false;
}
