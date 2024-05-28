/**
 * This is the temporary integration point with RUM.
 * Hopefully, in the future it will integrated into the RUM SDK.
 *
 * @param event The RUM event
 * @param context The context around that event
 * @returns Always true as this handler does not block any event
 */
export declare function beforeSend(event: any, context: any): boolean;
