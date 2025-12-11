const DEFAULT_ENV: Env = {
  host: 'http://localhost',
  username: null,
  password: null,
};

let currentEnv: Env = DEFAULT_ENV;

export interface Env {
  /**
   * Host address of the Timeplus server. Make sure you include the scheme (http or https)
   * e.g. https://us.timeplus.cloud or http://localhost
   */
  host: string | undefined;

  /**
   * Port number
   */
  port?: number;

  /**
   * Username (for onprem only)
   */
  username: string | null | undefined;

  /**
   * Password (for onprem only)
   */
  password: string | null | undefined;
}

export const SetEnv = (env: Env) => {
  currentEnv = env;
};

export const Env = () => {
  return {
    BuildUrl(apiVersion: string, resourceName: string): string {
      let url = currentEnv.host;
      if (currentEnv.port) {
        url += `:${currentEnv.port}`;
      }
      const paths = [url, 'default'];
      paths.push('api', apiVersion, resourceName);
      return paths.join('/');
    },
    AuthHeader(): object {
      if (currentEnv.username) {
        const token = `${currentEnv.username}:${currentEnv.password}`;
        return {
          Authorization: `Basic ${btoa(token)}`,
        };
      }
      return {};
    },
  };
};
