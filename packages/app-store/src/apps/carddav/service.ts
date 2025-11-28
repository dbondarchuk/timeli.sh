import { getLoggerFactory, LoggerFactory } from "@timelish/logger";
import {
  ConnectedAppData,
  ConnectedAppStatusWithText,
  Customer,
  IConnectedApp,
  IConnectedAppProps,
} from "@timelish/types";
import { decrypt, encrypt } from "@timelish/utils";
import { CarddavConfiguration } from "./models";
import { CarddavAdminKeys, CarddavAdminNamespace } from "./translations/types";

const MASKED_PASSWORD = "********";

/**
 * Escapes special characters in vCard text fields
 */
function escapeVCardText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Converts a customer to vCard format (vCard 3.0)
 */
function customerToVCard(customer: Customer, baseUrl: string): string {
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  // UID
  lines.push(`UID:${customer._id}`);

  // Name
  const nameParts = customer.name.split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  lines.push(`FN:${escapeVCardText(customer.name)}`);
  if (firstName || lastName) {
    lines.push(
      `N:${escapeVCardText(lastName)};${escapeVCardText(firstName)};;;`,
    );
  }

  // Email
  if (customer.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${customer.email}`);
  }
  if (customer.knownEmails && customer.knownEmails.length > 0) {
    customer.knownEmails.forEach((email) => {
      lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    });
  }

  // Phone
  if (customer.phone) {
    lines.push(`TEL;TYPE=CELL:${customer.phone}`);
  }
  if (customer.knownPhones && customer.knownPhones.length > 0) {
    customer.knownPhones.forEach((phone) => {
      lines.push(`TEL;TYPE=CELL:${phone}`);
    });
  }

  // Date of birth
  if (customer.dateOfBirth) {
    const dob = new Date(customer.dateOfBirth);
    const year = dob.getFullYear();
    const month = String(dob.getMonth() + 1).padStart(2, "0");
    const day = String(dob.getDate()).padStart(2, "0");
    lines.push(`BDAY:${year}${month}${day}`);
  }

  // Note
  if (customer.note) {
    lines.push(`NOTE:${escapeVCardText(customer.note)}`);
  }

  // URL to customer (if we have a base URL)
  if (baseUrl) {
    lines.push(`URL:${baseUrl}/customers/${customer._id}`);
  }

  // Revision timestamp
  lines.push(
    `REV:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
  );

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/**
 * Parses Basic Auth header
 */
function parseBasicAuth(authHeader: string | null): {
  username: string;
  password: string;
} | null {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return null;
  }

  try {
    const base64 = authHeader.substring(6);
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const [username, password] = decoded.split(":", 2);
    return { username, password };
  } catch {
    return null;
  }
}

/**
 * Validates authentication
 */
function validateAuth(
  request: Request,
  config: CarddavConfiguration | undefined,
): boolean {
  if (!config || (!config.username && !config.password)) {
    // No auth required
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const credentials = parseBasicAuth(authHeader);

  if (!credentials) {
    return false;
  }

  const expectedUsername = config.username || "";
  const expectedPassword = config.password ? decrypt(config.password) : "";

  return (
    credentials.username === expectedUsername &&
    credentials.password === expectedPassword
  );
}

export default class CarddavConnectedApp
  implements IConnectedApp<CarddavConfiguration>
{
  protected readonly loggerFactory: LoggerFactory;

  public constructor(protected readonly props: IConnectedAppProps) {
    this.loggerFactory = getLoggerFactory(
      "CarddavConnectedApp",
      props.companyId,
    );
  }

  public async processAppData(
    appData: CarddavConfiguration,
  ): Promise<CarddavConfiguration> {
    return {
      ...appData,
      password: appData.password ? MASKED_PASSWORD : undefined,
    };
  }

  public async processRequest(
    appData: ConnectedAppData,
    data: CarddavConfiguration,
  ): Promise<
    ConnectedAppStatusWithText<CarddavAdminNamespace, CarddavAdminKeys>
  > {
    const logger = this.loggerFactory("processRequest");
    logger.debug(
      {
        appId: appData._id,
        hasUsername: !!data.username,
        hasPassword: !!data.password,
      },
      "Processing CardDAV configuration request",
    );

    if (data.password === MASKED_PASSWORD && appData?.data?.password) {
      data.password = appData.data.password;
    } else if (data.password) {
      data.password = encrypt(data.password);
    }

    const status: ConnectedAppStatusWithText<
      CarddavAdminNamespace,
      CarddavAdminKeys
    > = {
      status: "connected",
      statusText: {
        key: "app_carddav_admin.statusText.successfullySetUp",
      },
    };

    this.props.update({
      account: {
        username: data.username || "CardDAV",
        serverUrl: "CardDAV Server",
      },
      data,
      ...status,
    });

    logger.info(
      {
        appId: appData._id,
        status: status.status,
      },
      "Successfully configured CardDAV server",
    );

    return status;
  }

  public async processAppCall(
    appData: ConnectedAppData,
    slug: string[],
    request: Request,
  ): Promise<Response | undefined> {
    const logger = this.loggerFactory("processAppCall");
    const method = request.method;
    const url = new URL(request.url);
    const path = slug.join("/");

    logger.debug(
      {
        appId: appData._id,
        method,
        path,
        url: url.pathname,
      },
      "Processing CardDAV request",
    );

    // Validate authentication
    const config = appData.data as CarddavConfiguration | undefined;
    if (!validateAuth(request, config)) {
      logger.warn(
        {
          appId: appData._id,
          method,
          path,
        },
        "Authentication failed",
      );
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="CardDAV"',
        },
      });
    }

    // Handle OPTIONS (CORS preflight)
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          DAV: "1, 2, 3, addressbook",
          Allow: "OPTIONS, PROPFIND, GET, REPORT",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS, PROPFIND, GET, REPORT",
          "Access-Control-Allow-Headers": "Authorization, Content-Type, Depth",
        },
      });
    }

    // Handle PROPFIND (discovery and listing)
    if (method === "PROPFIND") {
      return await this.handlePropfind(appData, path, request);
    }

    // Handle GET (retrieve vCard)
    if (method === "GET") {
      return await this.handleGet(appData, path, request);
    }

    // Handle REPORT (used by some clients for querying)
    if (method === "REPORT") {
      return await this.handleReport(appData, path, request);
    }

    logger.warn(
      {
        appId: appData._id,
        method,
        path,
      },
      "Unsupported method",
    );

    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "OPTIONS, PROPFIND, GET, REPORT",
      },
    });
  }

  private async handlePropfind(
    appData: ConnectedAppData,
    path: string,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("handlePropfind");
    logger.debug({ appId: appData._id, path }, "Handling PROPFIND request");

    // Get base URL for generating contact URLs
    const baseUrl = request.url.split("/api/apps/")[0] || "";

    // If requesting root or addressbook path, return addressbook info
    if (path === "") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<multistatus xmlns="DAV:">
  <response>
    <href>/api/apps/${appData._id}/addressbook/</href>
    <propstat>
      <prop>
        <resourcetype>
          <collection/>
          <addressbook xmlns="urn:ietf:params:xml:ns:carddav"/>
        </resourcetype>
        <displayname>Customers</displayname>
        <getcontenttype>text/vcard; charset=utf-8</getcontenttype>
      </prop>
      <status>HTTP/1.1 200 OK</status>
    </propstat>
  </response>
</multistatus>`;

      return new Response(xml, {
        status: 207,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          DAV: "1, 2, 3, addressbook",
        },
      });
    }

    // List all contacts
    if (path === "addressbook") {
      const customers = await this.props.services.customersService.getCustomers(
        {
          limit: 1000,
          offset: 0,
        },
      );

      const responses = customers.items.map(
        (customer) => `
  <response>
    <href>/api/apps/${appData._id}/addressbook/${customer._id}.vcf</href>
    <propstat>
      <prop>
        <getcontenttype>text/vcard; charset=utf-8</getcontenttype>
        <getetag>"${customer._id}"</getetag>
        <resourcetype/>
      </prop>
      <status>HTTP/1.1 200 OK</status>
    </propstat>
  </response>`,
      );

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<multistatus xmlns="DAV:">
${responses.join("\n")}
</multistatus>`;

      return new Response(xml, {
        status: 207,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          DAV: "1, 2, 3, addressbook",
        },
      });
    }

    // If requesting a specific contact, return its properties
    if (path.startsWith("addressbook/")) {
      const contactId = path.replace("addressbook/", "").replace(".vcf", "");
      const customer =
        await this.props.services.customersService.getCustomer(contactId);
      if (!customer) {
        return new Response("Not Found", { status: 404 });
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<multistatus xmlns="DAV:">
  <response>
    <href>/api/apps/${appData._id}/addressbook/${contactId}.vcf</href>
    <propstat>
      <prop>
        <getcontenttype>text/vcard; charset=utf-8</getcontenttype>
        <getetag>"${customer._id}"</getetag>
        <resourcetype/>
      </prop>
      <status>HTTP/1.1 200 OK</status>
    </propstat>
  </response>
</multistatus>`;

      return new Response(xml, {
        status: 207,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          DAV: "1, 2, 3, addressbook",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  }

  private async handleGet(
    appData: ConnectedAppData,
    path: string,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("handleGet");
    logger.debug({ appId: appData._id, path }, "Handling GET request");

    if (!path.startsWith("addressbook/")) {
      return new Response("Not Found", { status: 404 });
    }

    const contactId = path.replace("addressbook/", "").replace(".vcf", "");
    const customer =
      await this.props.services.customersService.getCustomer(contactId);
    if (!customer) {
      return new Response("Not Found", { status: 404 });
    }

    // Get base URL for generating contact URLs
    const baseUrl = request.url.split("/api/apps/")[0] || "";
    const vcard = customerToVCard(customer, baseUrl);

    logger.debug(
      {
        appId: appData._id,
        contactId,
        customerName: customer.name,
      },
      "Returning vCard",
    );

    return new Response(vcard, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        ETag: `"${customer._id}"`,
        DAV: "1, 2, 3, addressbook",
      },
    });
  }

  private async handleReport(
    appData: ConnectedAppData,
    path: string,
    request: Request,
  ): Promise<Response> {
    const logger = this.loggerFactory("handleReport");
    logger.debug({ appId: appData._id, path }, "Handling REPORT request");

    // Get all customers (list model is sufficient for listing)
    const customers = await this.props.services.customersService.getCustomers({
      limit: 1000,
      offset: 0,
    });

    const responses = customers.items.map(
      (customer) => `
  <response>
    <href>/api/apps/${appData._id}/addressbook/${customer._id}.vcf</href>
    <propstat>
      <prop>
        <getcontenttype>text/vcard; charset=utf-8</getcontenttype>
        <getetag>"${customer._id}"</getetag>
        <resourcetype/>
      </prop>
      <status>HTTP/1.1 200 OK</status>
    </propstat>
  </response>`,
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<multistatus xmlns="DAV:">
${responses.join("")}
</multistatus>`;

    return new Response(xml, {
      status: 207,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        DAV: "1, 2, 3, addressbook",
      },
    });
  }
}
