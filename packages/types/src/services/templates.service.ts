import { CommunicationChannel } from "../communication";
import { Query, WithTotal } from "../database";
import type { EventSource } from "../events/envelope";
import { Template, TemplateListModel, TemplateUpdateModel } from "../templates";

export interface ITemplatesService {
  createTemplate(
    template: TemplateUpdateModel,
    source: EventSource,
  ): Promise<Template>;
  updateTemplate(
    id: string,
    template: TemplateUpdateModel,
    source: EventSource,
  ): Promise<void>;
  getTemplate(id: string): Promise<Template | null>;
  getTemplates(
    query: Query & {
      type?: CommunicationChannel[];
    },
  ): Promise<WithTotal<TemplateListModel>>;
  deleteTemplate(id: string, source: EventSource): Promise<Template | null>;
  deleteTemplates(ids: string[], source: EventSource): Promise<void>;
  checkUniqueName(name: string, id?: string): Promise<boolean>;
}
