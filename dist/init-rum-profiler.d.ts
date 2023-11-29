export interface RumProfilerInitOptions {
    /**
     * The RUM application ID.
     */
    applicationId: string;
    /**
     * A Datadog [client token](https://docs.datadoghq.com/account_management/api-app-keys/#client-tokens).
     */
    clientToken: string;
    /**
     * The service name for your application. Follows the [tag syntax requirements](https://docs.datadoghq.com/getting_started/tagging/#define-tags).
     * Required for [source code unminification](https://docs.datadoghq.com/real_user_monitoring/guide/upload-javascript-source-maps).
     */
    service: string;
    /**
     * The application’s version, for example: 1.2.3, 6c44da20, and 2020.02.13. Follows the [tag syntax requirements](https://docs.datadoghq.com/getting_started/tagging/#define-tags).
     * Required for [source code unminification](https://docs.datadoghq.com/real_user_monitoring/guide/upload-javascript-source-maps).
     */
    version: string;
    /**
     * The application’s environment, for example: prod, pre-prod, and staging. Follows the [tag syntax requirements](https://docs.datadoghq.com/getting_started/tagging/#define-tags).
     */
    env?: string;
    /**
     * The Datadog site parameter of your organization.
     * Default: datadoghq.com
     */
    site?: string;
    /**
     * The percentage of profiling sessions to track: 100 for all, 0 for none.
     * Only tracked sessions send RUM profiles.
     */
    profilingSampleRate?: number;
}
type StopRumProfiler = () => Promise<void>;
export declare function initRumProfiler({ applicationId, clientToken, service, version, env, site, profilingSampleRate, }: RumProfilerInitOptions): StopRumProfiler;
export {};
