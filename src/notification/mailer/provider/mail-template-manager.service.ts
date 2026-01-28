import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { MailTemplateEnum } from 'libs/enums';
import { MailTemplateVariables } from 'libs/interfaces';
@Injectable()
export class MailTemplateManagerService {
  _loadTemplate(mailTemplate: MailTemplateEnum) {
    const templatesDir = './html';
    const templatePath = path.join(templatesDir, mailTemplate);
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to read template file: ${templatePath}. ${error.message}`,
      );
    }
  }

  mailHtmlTemplateGenerator<T extends MailTemplateEnum>(
    template: T,
    vars: MailTemplateVariables[T],
  ) {
    let htmlTemplate = this._loadTemplate(template);
    Object.keys(vars).forEach((key) => {
      const placeholder = `{{${key}}}`;
      htmlTemplate = htmlTemplate.replace(
        new RegExp(placeholder, 'g'),
        vars[key],
      );
    });
    return htmlTemplate;
  }
}
