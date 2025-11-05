import { CommunicationChannel } from "../communication";
import { Query, WithTotal } from "../database";
import { Template, TemplateListModel, TemplateUpdateModel } from "../templates";

export interface ITemplatesService {
  createTemplate(template: TemplateUpdateModel): Promise<Template>;
  updateTemplate(id: string, template: TemplateUpdateModel): Promise<void>;
  getTemplate(id: string): Promise<Template | null>;
  getTemplates(
    query: Query & {
      type?: CommunicationChannel[];
    },
  ): Promise<WithTotal<TemplateListModel>>;
  deleteTemplate(id: string): Promise<Template | null>;
  deleteTemplates(ids: string[]): Promise<void>;
  checkUniqueName(name: string, id?: string): Promise<boolean>;
}
