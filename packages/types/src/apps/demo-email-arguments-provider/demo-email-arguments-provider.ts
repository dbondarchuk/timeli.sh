/** Key-value pairs for template demo arguments (e.g. { waitlistEntry: {...} }) */
export type DemoEmailArguments = Record<string, unknown>;

/**
 * App service interface for providing demo arguments used in template previews
 * (e.g. email templates with placeholders like waitlistEntry).
 * Apps declare scope "demo-email-arguments-provider"; the service implements this interface.
 */
export interface IDemoEmailArgumentsProvider {
  getDemoEmailArguments(): DemoEmailArguments;
}
