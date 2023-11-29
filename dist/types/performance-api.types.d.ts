export interface ModernPerformanceEventTiming extends PerformanceEventTiming {
    /**
     * This is a new field that correlates events from a single user interaction.
     * An example of user interaction is click on a button which triggers multiple events, like:
     *  * mousedown
     *  * pointerdown
     *  * focus
     *  * click
     *  * pointerup
     *  * mouseup
     * Each event will be reported as a separate PerformanceEventTiming object, but they will all have the same interactionId.
     */
    readonly interactionId: number;
}
