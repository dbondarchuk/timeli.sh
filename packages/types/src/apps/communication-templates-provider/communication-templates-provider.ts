import { TemplateTemplatesList } from "../../templates";
import { ConnectedAppData } from "../connected-app.data";

/**
 * App service interface for providing communication templates
 * Apps declare scope "communication-templates-provider"; the service implements this interface.
 */
export interface ICommunicationTemplatesProvider {
  /**
   * Get communication templates
   * @returns Communication templates grouped by id and then language
   */
  getCommunicationTemplates(
    appData: ConnectedAppData,
  ): Promise<TemplateTemplatesList>;
}
